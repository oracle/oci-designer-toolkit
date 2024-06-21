/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import fs from 'fs'
import path from 'path'
import os from 'os'
import { OcdUtils } from "@ocd/core"
import { common, identity } from "oci-sdk"

export class OciCommonQuery {
    profile: string
    provider: common.ConfigFileAuthenticationDetailsProvider
    clientConfiguration: common.ClientConfiguration
    authenticationConfiguration: common.AuthParams
    // Clients
    identityClient: identity.IdentityClient
    // Lifecycle States
    lifecycleStates: string[] = ['ACTIVE', 'ALLOCATED', 'ATTACHED', 'AVAILABLE', 'CREATING', 'ENABLED', 'INACTIVE', 'PROVISIONING', 'RUNNING', 'STARTING', 'STOPPED', 'STOPPING', 'UPDATING']

    constructor(profile: string='DEFAULT', region?: string) {
        this.profile = profile
        this.provider = new common.ConfigFileAuthenticationDetailsProvider(undefined, profile)
        if (region) this.provider.setRegion(region)
            console.debug('OciCommonQuery Profile:', profile)
        console.debug('OciCommonQuery Provider:', this.provider)
        const certBundle = this.getCertBundle(profile)
        console.debug('OciCommonQuery Cert Bundle:', certBundle)
        // console.debug('OciCommonQuery Config File:', configFile)
        // Define Retry Configuration
        const retryConfiguration: common.RetryConfiguration = {
            // terminationStrategy : new common.MaxAttemptsTerminationStrategy(10)
        }
        const httpOptions = certBundle ? {ca: certBundle} : undefined
        this.clientConfiguration = { retryConfiguration: retryConfiguration, httpOptions: httpOptions }
        this.authenticationConfiguration = { authenticationDetailsProvider: this.provider }
        console.debug('OciCommonQuery Client Configuration:', this.clientConfiguration)
        this.identityClient = new identity.IdentityClient(this.authenticationConfiguration, this.clientConfiguration)
    }

    getCertBundle = (profile: string): string | undefined => {
        const certBundleFile = this.provider.getProfileCredentials()?.configurationsByProfile.get(profile)?.get('cert-bundle')
        const absolutePath = path.resolve(certBundleFile ? certBundleFile : '~')
        const homeDirPath = this.getHomeDirPath(certBundleFile ? certBundleFile : '~')
        console.debug('OciCommonQuery Config Credentials:', this.provider.getProfileCredentials())
        console.debug('OciCommonQuery Config By Profile:', this.provider.getProfileCredentials()?.configurationsByProfile)
        console.debug('OciCommonQuery Config Profile:', profile, this.provider.getProfileCredentials()?.configurationsByProfile.get(profile))
        console.debug('OciCommonQuery Cert Bundle File:', certBundleFile)
        console.debug('OciCommonQuery Absolute Cert Bundle File:', absolutePath)
        console.debug('OciCommonQuery Home Dir Cert Bundle File:', homeDirPath)
        if (certBundleFile === undefined) return undefined
        else {
            const certBundle: string = fs.readFileSync(homeDirPath, 'utf-8')
            // console.debug('OciCommonQuery Cert Bundle:', certBundle)
            return certBundle
        }
    }

    getHomeDirPath = (filePath: string): string => filePath.startsWith('~') ? path.join(os.homedir(), filePath.slice(1).replace(/\\/g, "/")) : filePath
 
    regionNameToDisplayName = (name: string) => {
        const nameParts = name.split('-')
        const region = nameParts[0].toUpperCase()
        const city = `${nameParts[1].charAt(0).toUpperCase()}${nameParts[1].substring(1).toLowerCase()}`
        // const displayName = `${region} ${city}`
        const displayName = nameParts.slice(0, -1).map((p, i) => i === 0 ? p.toUpperCase() : OcdUtils.capitaliseFirstCharacter(p)).join(' ')
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
                console.debug('OciCommonQuery: getAllResponseData: All Settled')
                resolve(results)
            }).catch((reason) => {
                console.error('OciCommonQuery: getAllResponseData: Error', reason)
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

    getCompartments(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: identity.requests.GetCompartmentRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.identityClient.getCompartment(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: getCompartments: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').map((r) => {return {...r.value.compartment, displayName: r.value.compartment.name}})
                // console.debug('OciQuery: getCompartments: Resources', resources)
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listTenancyCompartments(): Promise<any> {
        return new Promise((resolve, reject) => {
            const listCompartmentsReq: identity.requests.ListCompartmentsRequest = {compartmentId: this.provider.getTenantId(), compartmentIdInSubtree: true, limit: 10000, lifecycleState: "ACTIVE"}
            const compartmentResponseIterator = this.identityClient.listCompartmentsResponseIterator(listCompartmentsReq)
            const compartmentQuery = this.getAllResponseData(compartmentResponseIterator)
            const getTenancy = this.getCompartments([this.provider.getTenantId()])
            Promise.allSettled([getTenancy, compartmentQuery]).then((results) => {
                console.debug('OciQuery: listTenancyCompartments: All Settled')
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
module.exports = { OciCommonQuery }
