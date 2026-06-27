/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import fs from 'fs'
import path from 'path'
import os from 'os'
// import { rootCertificates } from "tls"
// import { Agent as httpsAgent } from "https"
// import https from "https"
import { OcdLogger, OcdUtils } from "@ocd/core"
import { common, identity } from "oci-sdk"
import { QUERY_CONCURRENCY_LIMIT, runWithConcurrency, withRetry } from './OciQueryConcurrency.js'

const logger = OcdLogger.scope('OciCommonQuery')

export class OciCommonQuery {
    profile: string
    provider: common.ConfigFileAuthenticationDetailsProvider | common.SessionAuthDetailProvider
    clientConfiguration: common.ClientConfiguration
    authenticationConfiguration: common.AuthParams
    // Clients
    identityClient: identity.IdentityClient
    // Lifecycle States
    lifecycleStates: string[] = ['ACTIVE', 'ALLOCATED', 'ATTACHED', 'AVAILABLE', 'CREATING', 'ENABLED', 'INACTIVE', 'PROVISIONING', 'RUNNING', 'STARTING', 'STOPPED', 'STOPPING', 'UPDATING']
    // Accumulates per-query discovery failures (e.g. a 403 on a single compartment, or
    // request throttling) so that a partial discovery failure surfaces to the renderer
    // instead of silently rendering a complete-looking topology (issue OBS-01). Reset at
    // the start of each top level query run (see OciQuery.queryTenancy).
    queryFailures: { label: string, reason: string }[] = []

    constructor(profile: string='DEFAULT', region?: string) {
        this.profile = profile
        this.provider = new common.ConfigFileAuthenticationDetailsProvider(undefined, profile)
        if (this.isSessionTokenSpecified(profile)) this.provider = new common.SessionAuthDetailProvider(undefined, profile)
        if (region) this.provider.setRegion(region)
        else logger.debug('Using Region', this.provider.getRegion().regionId)
        // Defensive region/realm resolution diagnostic (issue #782). For dedicated regions and
        // alternate realms the OCI SDK resolves endpoints from a region it can recognise; it reads
        // unknown regions from ~/.oci/regions-config.json or the OCI_REGION_METADATA env var. If the
        // configured region cannot be resolved the SDK silently falls back to the public realm
        // (oraclecloud.com), so requests target the wrong endpoint. We do not hardcode realm domains
        // here (cannot be verified without a dedicated tenancy); instead we warn so the operator knows
        // to provide region metadata. We never throw, to avoid breaking standard public regions.
        try {
            const configuredRegionId = this.provider.getRegion()?.regionId
            if (configuredRegionId && common.Region.fromRegionId(configuredRegionId) === undefined) {
                logger.warn(
                    `Region '${configuredRegionId}' is not recognised by the OCI SDK and will fall back to the public realm (oraclecloud.com). ` +
                    `For dedicated regions / alternate realms, register the region via ~/.oci/regions-config.json or the OCI_REGION_METADATA environment variable.`
                )
            }
        } catch (reason: unknown) {
            logger.warn('Unable to verify region resolution', reason)
        }
        const certBundle: string | undefined = this.getCertBundle(profile)
        // Define Retry Configuration
        const retryConfiguration: common.RetryConfiguration = {
            terminationStrategy : new common.MaxAttemptsTerminationStrategy(3)
        }
        let httpOptions: { [key: string]: any } | undefined = undefined
        // if (certBundle) {
        //     const ca = [...rootCertificates, certBundle]
        //     // const ca = [...rootCertificates, ...this.certBundleToArray(certBundle)]
        //     httpOptions = {agent: new httpsAgent({ca: ca, rejectUnauthorized: false}), rejectUnauthorized: false}
        //     httpOptions = {agent: new httpsAgent({ca: ca})}
        //     // https.globalAgent.options.ca = ca
        // }
        this.clientConfiguration = { retryConfiguration: retryConfiguration, httpOptions: httpOptions }
        this.authenticationConfiguration = { authenticationDetailsProvider: this.provider }
        // Do not log the configuration object itself: httpOptions may carry cert-bundle material.
        logger.debug('Client configuration initialised', `retryConfigured=${this.clientConfiguration.retryConfiguration !== undefined}`, `httpOptions=${httpOptions !== undefined}`)
        this.identityClient = new identity.IdentityClient(this.authenticationConfiguration, this.clientConfiguration)
    }

    // Default upper bound (milliseconds) for a single top level tenancy query before we
    // surface a timeout error to the renderer. Without this an unresponsive / unreachable
    // endpoint (e.g. an unresolved dedicated region falling back to a non routable host)
    // leaves the UI spinner running indefinitely (see issue #741).
    static readonly DEFAULT_QUERY_TIMEOUT_MS: number = 120000

    /*
    ** Wrap a Promise so that it rejects if it has not settled within timeoutMs. This guarantees
    ** the renderer always receives either a result or an error and never hangs forever. The
    ** wrapped promise's own resolution/rejection is still honoured if it settles first.
    */
    withTimeout<T>(promise: Promise<T>, label: string, timeoutMs: number = OciCommonQuery.DEFAULT_QUERY_TIMEOUT_MS): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`${label} timed out after ${timeoutMs}ms`))
            }, timeoutMs)
            promise.then((value) => {
                clearTimeout(timer)
                resolve(value)
            }).catch((reason) => {
                clearTimeout(timer)
                reject(reason)
            })
        })
    }

    /*
    ** Reduce a rejection reason to a safe, human readable string. Never serialise an
    ** arbitrary payload: OCI error objects / response bodies can embed OCIDs and other
    ** topology detail, so we surface the message text (or a generic fallback) only.
    */
    private settledFailureReason(reason: unknown): string {
        if (reason instanceof Error) return reason.message
        if (typeof reason === 'string') return reason
        return 'Unknown error'
    }

    /*
    ** Record every rejected settlement against queryFailures and emit a single warning
    ** carrying the label, the failed/total counts and the first reason. Logs counts and
    ** reason text only — never OCIDs or raw response payloads.
    */
    recordSettledFailures(results: PromiseSettledResult<unknown>[], label: string): void {
        const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        if (rejected.length === 0) return
        rejected.forEach((r) => this.queryFailures.push({ label, reason: this.settledFailureReason(r.reason) }))
        logger.warn(`${label}: ${rejected.length} of ${results.length} query(ies) failed (partial results)`, this.settledFailureReason(rejected[0].reason))
    }

    /*
    ** Concatenate the `items` arrays of every fulfilled settlement, recording any
    ** rejections via recordSettledFailures so partial failures are never silently lost.
    ** The optional extractor supports the handful of responses that nest their
    ** collection under a different key (or return a single object).
    */
    collectSettled<T>(results: PromiseSettledResult<{ items: T[] }>[], label: string): T[]
    collectSettled<V, T>(results: PromiseSettledResult<V>[], label: string, extract: (value: V) => T[]): T[]
    collectSettled<T>(results: PromiseSettledResult<any>[], label: string, extract: (value: any) => T[] = (value) => value.items): T[] {
        this.recordSettledFailures(results, label)
        return results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
            .reduce<T[]>((acc, r) => [...acc, ...extract(r.value)], [])
    }

    /*
    ** Shared compartment fan-out used by every list* resource query. Builds one
    ** request per compartment, wraps each in a transient-failure retry, runs them
    ** through the bounded concurrency pool, and folds the settled results with
    ** collectSettled so partial failures are recorded (never silently dropped).
    ** Collapses ~50 near-identical method bodies into a single tested path and is
    ** the home for retry/backoff (replacing the former unused per-method retry param).
    */
    protected listByCompartment<Req, Res>(
        label: string,
        compartmentIds: string[],
        buildRequest: (compartmentId: string) => Req,
        listFn: (request: Req) => Promise<Res>,
        extract: (value: Res) => any[] = (value) => (value as { items?: any[] }).items ?? [],
    ): Promise<any[]> {
        const requests = compartmentIds.map(buildRequest)
        const tasks = requests.map((request) => withRetry(() => listFn(request)))
        const queries = runWithConcurrency(tasks, QUERY_CONCURRENCY_LIMIT)
        return Promise.allSettled(queries).then((results) => this.collectSettled(results, label, extract))
    }

    isSessionTokenSpecified = (profile: string): boolean => this.provider.getProfileCredentials()?.configurationsByProfile.get(profile)?.get('security_token_file') !== undefined

    getCertBundle = (profile: string): string | undefined => {
        const certBundleFile = this.provider.getProfileCredentials()?.configurationsByProfile.get(profile)?.get('cert-bundle')
        if (certBundleFile === undefined) return undefined
        else {
            const homeDirPath = this.getHomeDirPath(certBundleFile ? certBundleFile : '~')
            const certBundle: string = fs.readFileSync(homeDirPath, 'ascii')
            return certBundle
        }
    }
    certBundleToArray = (certBundle: string): string[] => {
        if (certBundle) {
            const ca: string[] = []
            let cert: string[] = []
            certBundle.split('\n').forEach((l) => {
                cert.push(l)
                if (l.includes('-END CERTIFICATE-')) {
                    ca.push(cert.join('\n'))
                    cert = []
                }
            })
            return ca
        }
        else {return []}
    }

    getHomeDirPath = (filePath: string): string => filePath.startsWith('~') ? path.join(os.homedir(), filePath.slice(1).replace(/\\/g, "/")) : filePath
 
    regionNameToDisplayName = (name: string) => {
        const nameParts = name.split('-') // oci region names are in the format uk-london-1
        const displayName = nameParts.length > 2 ? nameParts.slice(0, -1).map((p, i) => i === 0 ? p.toUpperCase() : OcdUtils.capitaliseFirstCharacter(p)).join(' ') : name
        // if (nameParts.length > 2) {
        //     displayName = nameParts.slice(0, -1).map((p, i) => i === 0 ? p.toUpperCase() : OcdUtils.capitaliseFirstCharacter(p)).join(' ')
        // }
        return displayName
    }

    getAllResponseData(responseIterator: AsyncIterableIterator<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            const query = async (responseIterator: AsyncIterableIterator<any>) => {
                let done = false
                let resources: any[] = []
                while (!done) {
                    const response = await responseIterator.next()
                    done = response.done !== undefined ? response.done : true
                    if (response.value) resources = [...resources, ...response.value.items]
                }
                return resources
            }
            query(responseIterator).then((results) => {
                logger.debug('getAllResponseData: All Settled')
                resolve(results)
            }).catch((reason) => {
                logger.error('getAllResponseData: Error', reason)
                reject(reason)
            })
        })
    }

    listAllRegions(): Promise<any> {
        return new Promise((resolve, reject) => {
            // if (!this.identityClient) this.identityClient = new identity.IdentityClient({ authenticationDetailsProvider: this.provider })
            const listRegionsRequest: identity.requests.ListRegionsRequest = {}
            const regionsQuery = this.identityClient.listRegions(listRegionsRequest)
            Promise.allSettled([regionsQuery]).then((results) => {
                // @ts-ignore 
                const sorter = (a, b) => a.displayName.localeCompare(b.displayName)
                if (results[0].status === 'fulfilled') {
                    const resources = results[0].value.items.map((r) => {return {id: r.name, displayName: this.regionNameToDisplayName(r.name as string), ...r}}).sort(sorter).reverse()
                    resolve(resources)
                } else {
                    reject('Regions Query Failed')
                }
            })
        })
    }

    getCompartments(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment(
            'getCompartments',
            compartmentIds,
            (id) => ({ compartmentId: id }) as identity.requests.GetCompartmentRequest,
            (r) => this.identityClient.getCompartment(r),
            (value) => [{ ...value.compartment, displayName: value.compartment.name }],
        )
    }

    listTenancyCompartments(): Promise<any> {
        return new Promise((resolve, reject) => {
            const listCompartmentsReq: identity.requests.ListCompartmentsRequest = {compartmentId: this.provider.getTenantId(), compartmentIdInSubtree: true, limit: 10000, lifecycleState: "ACTIVE"}
            const compartmentResponseIterator = this.identityClient.listCompartmentsResponseIterator(listCompartmentsReq)
            const compartmentQuery = this.getAllResponseData(compartmentResponseIterator)
            const getTenancy = this.getCompartments([this.provider.getTenantId()])
            Promise.allSettled([getTenancy, compartmentQuery]).then((results) => {
                logger.debug('listTenancyCompartments: All Settled')
                if (results[0].status === 'fulfilled' && results[1].status === 'fulfilled') {
                    results[0].value[0].compartmentId = ''
                    const resources = [...results[0].value, ...results[1].value].map((c) => {return {...c, root: c.compartmentId === ''}})
                    resolve(resources)
                } else {
                    reject('All Compartments Query Failed')
                }
            })
        })
    }

}

export default OciCommonQuery
// module.exports = { OciCommonQuery }
