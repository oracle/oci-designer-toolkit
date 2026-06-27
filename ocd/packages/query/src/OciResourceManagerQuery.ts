/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdLogger } from "@ocd/core"
import { resourcemanager } from "oci-sdk"
import { Readable } from 'stream'
import { OciCommonQuery } from './OciQueryCommon.js'
import { QUERY_CONCURRENCY_LIMIT, runWithConcurrency } from './OciQueryConcurrency.js'

const logger = OcdLogger.scope('OciResourceManagerQuery')

interface OutputDataStringArray extends Record<string, string[]> {}

export type OciResourceManagerJobOperation = 'PLAN' | 'APPLY'

export interface OciResourceManagerJobOptions {
    operation?: OciResourceManagerJobOperation
    planJobId?: string
    approval?: string
}

export type OciResourceManagerJobLifecycleState =
    | 'ACCEPTED'
    | 'IN_PROGRESS'
    | 'FAILED'
    | 'SUCCEEDED'
    | 'CANCELING'
    | 'CANCELED'
    | 'UNKNOWN_VALUE'
    | string

export interface OciResourceManagerJobStatus {
    id: string
    displayName?: string
    operation?: string
    lifecycleState?: OciResourceManagerJobLifecycleState
    failureDetails?: unknown
    timeCreated?: string
    timeFinished?: string
}

export interface OciResourceManagerPlanReview {
    job: OciResourceManagerJobStatus
    planText: string
    terminal: boolean
    readyToApply: boolean
}

const APPLY_APPROVAL_TEXT = 'APPLY'
const TERMINAL_JOB_STATES = new Set<OciResourceManagerJobLifecycleState>(['FAILED', 'SUCCEEDED', 'CANCELED', 'UNKNOWN_VALUE'])
const DEFAULT_PLAN_PREVIEW_LIMIT = 24000

const managedByTag = {
    ManagedBy: 'okit-open-cloud-designer',
}

const crcTable = (() => {
    const table: number[] = []
    for (let i = 0; i < 256; i += 1) {
        let c = i
        for (let j = 0; j < 8; j += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
        table[i] = c >>> 0
    }
    return table
})()

export function buildResourceManagerJobDetails(stackId: string, options: boolean | OciResourceManagerJobOptions = false, now: Date = new Date()): any {
    const normalizedOptions: OciResourceManagerJobOptions = typeof options === 'boolean'
        ? { operation: options ? 'APPLY' : 'PLAN' }
        : { ...options }
    const operation = normalizedOptions.operation ?? 'PLAN'
    const trimmedStackId = stackId.trim()
    const planJobId = normalizedOptions.planJobId?.trim() ?? ''
    const approval = normalizedOptions.approval?.trim() ?? ''

    if (!trimmedStackId) throw new Error('Resource Manager stack id is required before submitting a job.')
    if (operation === 'APPLY' && !planJobId) throw new Error('Resource Manager apply requires a reviewed plan job id.')
    if (operation === 'APPLY' && approval !== APPLY_APPROVAL_TEXT) throw new Error(`Type ${APPLY_APPROVAL_TEXT} to confirm Resource Manager apply.`)

    const jobOperationDetails = operation === 'APPLY'
        ? { operation, executionPlanStrategy: 'FROM_PLAN_JOB_ID', executionPlanJobId: planJobId }
        : { operation }

    return {
        stackId: trimmedStackId,
        displayName: `OKIT ${operation.toLowerCase()} ${now.toISOString()}`,
        operation,
        jobOperationDetails,
        freeformTags: { ...managedByTag },
    }
}

export const isResourceManagerJobTerminal = (state: OciResourceManagerJobLifecycleState | undefined): boolean =>
    state === undefined ? false : TERMINAL_JOB_STATES.has(state)

export const isResourceManagerJobSucceeded = (state: OciResourceManagerJobLifecycleState | undefined): boolean =>
    state === 'SUCCEEDED'

export const summariseTerraformPlan = (planText: string, maxLength = DEFAULT_PLAN_PREVIEW_LIMIT): string => {
    const normalized = planText.trim()
    if (normalized.length <= maxLength) return normalized
    const omitted = normalized.length - maxLength
    return `${normalized.slice(0, maxLength)}\n\n... plan preview truncated (${omitted} more characters).`
}

export const buildResourceManagerPlanReview = (
    job: OciResourceManagerJobStatus,
    planText: string,
    maxLength = DEFAULT_PLAN_PREVIEW_LIMIT,
): OciResourceManagerPlanReview => {
    const terminal = isResourceManagerJobTerminal(job.lifecycleState)
    const readyToApply = isResourceManagerJobSucceeded(job.lifecycleState) && planText.trim().length > 0
    return {
        job: { ...job },
        planText: summariseTerraformPlan(planText, maxLength),
        terminal,
        readyToApply,
    }
}

const dateToIso = (value: unknown): string | undefined => {
    if (value instanceof Date) return value.toISOString()
    if (typeof value === 'string') return value
    return undefined
}

export const normaliseResourceManagerJob = (job: any): OciResourceManagerJobStatus => {
    const id = typeof job?.id === 'string' ? job.id : ''
    if (!id) throw new Error('Resource Manager job response did not include a job id.')
    return {
        id,
        displayName: typeof job.displayName === 'string' ? job.displayName : undefined,
        operation: typeof job.operation === 'string' ? job.operation : undefined,
        lifecycleState: typeof job.lifecycleState === 'string' ? job.lifecycleState : undefined,
        failureDetails: job.failureDetails,
        timeCreated: dateToIso(job.timeCreated),
        timeFinished: dateToIso(job.timeFinished),
    }
}

const isWebReadableStream = (value: unknown): value is ReadableStream<Uint8Array> =>
    typeof ReadableStream !== 'undefined' && value instanceof ReadableStream

export const streamToText = async (value: unknown): Promise<string> => {
    if (value === undefined || value === null) return ''
    if (typeof value === 'string') return value
    if (Buffer.isBuffer(value)) return value.toString('utf8')
    if (value instanceof Uint8Array) return Buffer.from(value).toString('utf8')
    if (isWebReadableStream(value)) {
        const reader = value.getReader()
        const chunks: Uint8Array[] = []
        try {
            let result = await reader.read()
            while (!result.done) {
                if (result.value) chunks.push(result.value)
                result = await reader.read()
            }
        } finally {
            reader.releaseLock()
        }
        return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf8')
    }
    if (value instanceof Readable || (typeof (value as any)?.[Symbol.asyncIterator] === 'function')) {
        const chunks: Buffer[] = []
        for await (const chunk of value as AsyncIterable<Buffer | string | Uint8Array>) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        }
        return Buffer.concat(chunks).toString('utf8')
    }
    return String(value)
}

export class OciResourceManagerQuery extends OciCommonQuery {
    // Clients
    resourcemanagerClient: resourcemanager.ResourceManagerClient
    constructor(profile: string='DEFAULT', region?: string) {
        super(profile, region)
        logger.debug('Region', region)
        this.resourcemanagerClient = new resourcemanager.ResourceManagerClient(this.authenticationConfiguration, this.clientConfiguration)
    }

    query(compartmentIds: string[]): Promise<any> {
        logger.debug('query')
        return new Promise((resolve, reject) => {
            const resourceManagerData: Record<string, any[]> = {}
            const listStacks = this.listStacks(compartmentIds)
            const queries = [
                listStacks
            ]
            Promise.allSettled(queries).then((results) => {
                // Stacks
                // @ts-ignore
                if (results[queries.indexOf(listStacks)].status === 'fulfilled' && results[queries.indexOf(listStacks)].value.length > 0) resourceManagerData.stacks = results[queries.indexOf(listStacks)].value

                resolve(resourceManagerData)
            }).catch((reason) => {
                logger.error('query: Error', reason)
                reject(new Error(reason))
            })
        })
    }

    listStacks(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment(
            'listStacks',
            compartmentIds,
            (id) => ({ compartmentId: id }) as resourcemanager.requests.ListStacksRequest,
            (r) => this.resourcemanagerClient.listStacks(r),
        )
    }

    createStack(compartmentId: string, displayName: string, data: OutputDataStringArray, options: boolean | OciResourceManagerJobOptions = false): Promise<any> {
        return new Promise((resolve, reject) => {
            const stackName = this.normaliseStackName(displayName)
            const createStackDetails: any = {
                compartmentId,
                displayName: stackName,
                description: 'Created by OKIT Open Cloud Designer Resource Manager export.',
                configSource: this.zipUploadConfigSource(data),
                freeformTags: managedByTag,
            }
            this.resourcemanagerClient.createStack({createStackDetails}).then((response) => {
                const stack = response.stack
                if (!stack || !stack.id) resolve({stack})
                else this.createJob(stack.id, options).then((job) => resolve({stack, job})).catch((reason) => reject(reason))
            }).catch((reason) => {
                logger.error('createStack:', reason)
                reject(new Error(`${reason}`))
            })
        })
    }

    updateStack(stackId: string, data: OutputDataStringArray, options: boolean | OciResourceManagerJobOptions = false): Promise<any> {
        return new Promise((resolve, reject) => {
            const updateStackDetails: any = {
                configSource: this.zipUploadConfigSource(data),
                freeformTags: managedByTag,
            }
            this.resourcemanagerClient.updateStack({stackId, updateStackDetails}).then((response) => {
                this.createJob(stackId, options).then((job) => resolve({stack: response.stack, job})).catch((reason) => reject(reason))
            }).catch((reason) => {
                logger.error('updateStack:', reason)
                reject(new Error(`${reason}`))
            })
        })
    }

    createJob(stackId: string, options: boolean | OciResourceManagerJobOptions = false): Promise<any> {
        return new Promise((resolve, reject) => {
            let createJobDetails: any
            try {
                createJobDetails = buildResourceManagerJobDetails(stackId, options)
            } catch (reason) {
                reject(reason)
                return
            }
            this.resourcemanagerClient.createJob({createJobDetails}).then((response) => {
                resolve(response.job)
            }).catch((reason) => {
                logger.error('createJob:', reason)
                reject(new Error(`${reason}`))
            })
        })
    }

    getJob(jobId: string): Promise<OciResourceManagerJobStatus> {
        const trimmedJobId = jobId.trim()
        if (!trimmedJobId) return Promise.reject(new Error('Resource Manager job id is required.'))
        return this.resourcemanagerClient.getJob({ jobId: trimmedJobId })
            .then((response) => normaliseResourceManagerJob(response.job))
            .catch((reason) => {
                logger.error('getJob:', reason)
                throw new Error(`${reason}`)
            })
    }

    getJobTerraformPlan(jobId: string): Promise<string> {
        const trimmedJobId = jobId.trim()
        if (!trimmedJobId) return Promise.reject(new Error('Resource Manager job id is required.'))
        return this.resourcemanagerClient.getJobTfPlan({
            jobId: trimmedJobId,
            tfPlanFormat: 'JSON' as any,
        }).then((response) => streamToText(response.value)).catch((reason) => {
            logger.error('getJobTerraformPlan:', reason)
            throw new Error(`${reason}`)
        })
    }

    async getPlanReview(jobId: string): Promise<OciResourceManagerPlanReview> {
        const job = await this.getJob(jobId)
        if (!isResourceManagerJobSucceeded(job.lifecycleState)) return buildResourceManagerPlanReview(job, '')
        const planText = await this.getJobTerraformPlan(job.id)
        return buildResourceManagerPlanReview(job, planText)
    }

    zipUploadConfigSource(data: OutputDataStringArray): any {
        return {
            configSourceType: 'ZIP_UPLOAD',
            zipFileBase64Encoded: this.buildZipBase64(this.withResourceManagerManifest(data)),
        }
    }

    withResourceManagerManifest(data: OutputDataStringArray): OutputDataStringArray {
        const fileNames = Object.keys(data).toSorted()
        const manifest = {
            schemaVersion: 'oci.okit.resource_manager_export.v1',
            generatedBy: 'OKIT Open Cloud Designer',
            fileCount: fileNames.length,
            files: fileNames,
        }
        return {
            ...data,
            'okit-resource-manager-manifest.json': [JSON.stringify(manifest, null, 2)],
            'README_RESOURCE_MANAGER.md': [
                '# OKIT Resource Manager Export',
                '',
                'This package was generated by OKIT Open Cloud Designer for OCI Resource Manager.',
                'Review variables and generated resources before running apply jobs.',
            ],
        }
    }

    buildZipBase64(data: OutputDataStringArray): string {
        const entries = Object.entries(data)
            .filter(([name]) => name.trim() !== '')
            .map(([name, lines]) => {
                const safeName = name.replace(/^\/+/, '').replace(/\\/g, '/')
                const body = `${lines.join('\n')}\n`
                return {name: safeName, data: Buffer.from(body, 'utf8')}
            })
        let offset = 0
        const localParts: Buffer[] = []
        const centralParts: Buffer[] = []
        entries.forEach((entry) => {
            const filename = Buffer.from(entry.name, 'utf8')
            const crc = this.crc32(entry.data)
            const localHeader = Buffer.alloc(30)
            localHeader.writeUInt32LE(0x04034b50, 0)
            localHeader.writeUInt16LE(20, 4)
            localHeader.writeUInt16LE(0x0800, 6)
            localHeader.writeUInt16LE(0, 8)
            localHeader.writeUInt16LE(0, 10)
            localHeader.writeUInt16LE(0, 12)
            localHeader.writeUInt32LE(crc, 14)
            localHeader.writeUInt32LE(entry.data.length, 18)
            localHeader.writeUInt32LE(entry.data.length, 22)
            localHeader.writeUInt16LE(filename.length, 26)
            localHeader.writeUInt16LE(0, 28)
            localParts.push(localHeader, filename, entry.data)

            const centralHeader = Buffer.alloc(46)
            centralHeader.writeUInt32LE(0x02014b50, 0)
            centralHeader.writeUInt16LE(20, 4)
            centralHeader.writeUInt16LE(20, 6)
            centralHeader.writeUInt16LE(0x0800, 8)
            centralHeader.writeUInt16LE(0, 10)
            centralHeader.writeUInt16LE(0, 12)
            centralHeader.writeUInt16LE(0, 14)
            centralHeader.writeUInt32LE(crc, 16)
            centralHeader.writeUInt32LE(entry.data.length, 20)
            centralHeader.writeUInt32LE(entry.data.length, 24)
            centralHeader.writeUInt16LE(filename.length, 28)
            centralHeader.writeUInt16LE(0, 30)
            centralHeader.writeUInt16LE(0, 32)
            centralHeader.writeUInt16LE(0, 34)
            centralHeader.writeUInt16LE(0, 36)
            centralHeader.writeUInt32LE(0, 38)
            centralHeader.writeUInt32LE(offset, 42)
            centralParts.push(centralHeader, filename)
            offset += localHeader.length + filename.length + entry.data.length
        })
        const centralDirectory = Buffer.concat(centralParts)
        const localDirectory = Buffer.concat(localParts)
        const endOfCentralDirectory = Buffer.alloc(22)
        endOfCentralDirectory.writeUInt32LE(0x06054b50, 0)
        endOfCentralDirectory.writeUInt16LE(0, 4)
        endOfCentralDirectory.writeUInt16LE(0, 6)
        endOfCentralDirectory.writeUInt16LE(entries.length, 8)
        endOfCentralDirectory.writeUInt16LE(entries.length, 10)
        endOfCentralDirectory.writeUInt32LE(centralDirectory.length, 12)
        endOfCentralDirectory.writeUInt32LE(localDirectory.length, 16)
        endOfCentralDirectory.writeUInt16LE(0, 20)
        return Buffer.concat([localDirectory, centralDirectory, endOfCentralDirectory]).toString('base64')
    }

    crc32(data: Buffer): number {
        let crc = 0xffffffff
        for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
        return (crc ^ 0xffffffff) >>> 0
    }

    normaliseStackName(displayName: string): string {
        const trimmed = displayName.trim()
        return trimmed.length > 0 ? trimmed : `okit-stack-${new Date().toISOString().replace(/[:.]/g, '-')}`
    }
}

export default OciResourceManagerQuery
// module.exports = { OciResourceManager }
