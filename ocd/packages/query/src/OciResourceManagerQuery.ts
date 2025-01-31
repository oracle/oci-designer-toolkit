/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { resourcemanager } from "oci-sdk"
import { OciCommonQuery } from './OciQueryCommon.js'

export class OciResourceManagerQuery extends OciCommonQuery {
    // Clients
    resourcemanagerClient: resourcemanager.ResourceManagerClient
    constructor(profile: string='DEFAULT', region?: string) {
        super(profile, region)
        console.debug('OciResourceManagerQuery: Region', region)
        this.resourcemanagerClient = new resourcemanager.ResourceManagerClient(this.authenticationConfiguration, this.clientConfiguration)
    }

    query(compartmentIds: string[]): Promise<any> {
        console.debug('OciResourceManagerQuery: query')
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
                console.error(reason)
                reject(new Error(reason))
            })
        })
    }

    listStacks(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: resourcemanager.requests.ListStacksRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.resourcemanagerClient.listStacks(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciResourceManagerQuery: listStacks: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciResourceManagerQuery: listStacks:', reason)
                reject(new Error(reason))
            })
        })
    }

    createStack(compartmentId: string): Promise<any> {
        return new Promise((resolve, reject) => {})
    }

    updateStack(stackId: string): Promise<any> {
        return new Promise((resolve, reject) => {})
    }

    createJob(stackId: string): Promise<any> {
        return new Promise((resolve, reject) => {})
    }
}

export default OciResourceManagerQuery
// module.exports = { OciResourceManager }
