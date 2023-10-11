/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { common, core } from "oci-sdk"
import { OciQuery } from "./OciQuery"
import { OciResource } from "@ocd/model"

export class OciReferenceDataQuery {
    profile: string
    provider: common.ConfigFileAuthenticationDetailsProvider
    clientConfiguration: common.ClientConfiguration
    authenticationConfiguration: common.AuthParams
    ociQuery: OciQuery
    // Clients
    computeClient: core.ComputeClient
    constructor(profile: string='DEFAULT', region?: string) {
        this.profile = profile
        this.provider = new common.ConfigFileAuthenticationDetailsProvider(undefined, profile)
        this.ociQuery = new OciQuery(profile, region)
        console.debug('OciReferenceDataQuery: Region', region)
        if (region) this.provider.setRegion(region)
        // Define Retry Configuration
        const retryConfiguration: common.RetryConfiguration = {
            // terminationStrategy : new common.MaxAttemptsTerminationStrategy(10)
        }
        this.clientConfiguration = { retryConfiguration: retryConfiguration }
        this.authenticationConfiguration = { authenticationDetailsProvider: this.provider }
        // Initialise All Clients
        // this.identityClient = new identity.IdentityClient(this.authenticationConfiguration, this.clientConfiguration)
        // this.vcnClient = new core.VirtualNetworkClient(this.authenticationConfiguration, this.clientConfiguration)
        this.computeClient = new core.ComputeClient(this.authenticationConfiguration, this.clientConfiguration)
    }

    query(): Promise<any> {
        console.debug('OciReferenceDataQuery: query')
        return new Promise((resolve, reject) => {
            const referenceData: Record<string, any[]> = {}
            this.ociQuery.listTenancyCompartments().then((compartments) => {
                console.debug('OciReferenceDataQuery: Query: Compartments')
                const compartmentIds = compartments.map((c: OciResource) => c.id)
                // Compute
                const listShapes = this.listShapes()
                const listImages = this.listImages(compartmentIds)
                const queries = [
                    listShapes,
                    listImages
                ]
                Promise.allSettled(queries).then((results) => {
                    console.debug('OciReferenceDataQuery: query: All Settled', results)
                    /*
                    ** Compute
                    */
                    // Shapes
                    // @ts-ignore
                    if (results[queries.indexOf(listShapes)].status === 'fulfilled') referenceData.shape = results[queries.indexOf(listShapes)].value
                    // Images
                    // @ts-ignore
                    if (results[queries.indexOf(listImages)].status === 'fulfilled') referenceData.shape = results[queries.indexOf(listImages)].value

                    console.debug('OciReferenceDataQuery:', referenceData)
                    resolve(referenceData)
                })
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listImages(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListImagesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.computeClient.listImages(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listImages: All Settled', results)
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        id: r.displayName,
                        ocid: r.id,
                        displayName: r.displayName,
                        platform: r.compartmentId === null,
                        operatingSystem: r.operatingSystem,
                        operatingSystemVersion: r.operatingSystemVersion,
                        billableSizeInGBs: r.billableSizeInGBs,
                        lifecycleState: r.lifecycleState
                    }
                }).sort((a: OciResource, b: OciResource) => a.id.localeCompare(b.id))
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listShapes(): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: core.requests.ListShapesRequest = {compartmentId: this.provider.getTenantId()}
            const shapeQuery = this.computeClient.listShapes(request)
            shapeQuery.then((results) => {
                console.debug('OciReferenceDataQuery: listShapes: All Settled')
                //@ts-ignore
                // const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                const resources = results.items.map((s) => {return {
                        id: s.shape, 
                        displayName: s.shape, 
                        shape: s.shape, 
                        ocpus: s.ocpus, 
                        memoryInGBs: s.memoryInGBs, 
                        ocpuOptions: s.ocpuOptions, 
                        memoryOptions: s.memoryOptions, 
                        isFlexible: s.isFlexible
                    }
                })
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }
}

export default OciReferenceDataQuery
module.exports = { OciReferenceDataQuery }
