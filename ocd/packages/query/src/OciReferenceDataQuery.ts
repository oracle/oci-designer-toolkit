/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { common, core, database, loadbalancer, mysql } from "oci-sdk"
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
    databaseClient: database.DatabaseClient
    loadbalancerClient: loadbalancer.LoadBalancerClient
    mysqlClient: mysql.MysqlaasClient
    vcnClient: core.VirtualNetworkClient
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
        this.databaseClient = new database.DatabaseClient(this.authenticationConfiguration, this.clientConfiguration)
        this.loadbalancerClient = new loadbalancer.LoadBalancerClient(this.authenticationConfiguration, this.clientConfiguration)
        this.mysqlClient = new mysql.MysqlaasClient(this.authenticationConfiguration, this.clientConfiguration)
        this.vcnClient = new core.VirtualNetworkClient(this.authenticationConfiguration, this.clientConfiguration)
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
                const listLoadbalancerShapes = this.listLoadbalancerShapes(compartmentIds)
                const listMySQLShapes = this.listMySQLShapes(compartmentIds)
                const listMySQLVersions = this.listMySQLVersions(compartmentIds)
                const listMySQLConfigurations = this.listMySQLConfigurations(compartmentIds)
                const listDbSystemShapes = this.listDbSystemShapes(compartmentIds)
                const listDbSystemVersions = this.listDbSystemVersions(compartmentIds)
                const listCpeDeviceShapes = this.listCpeDeviceShapes()
                const queries = [
                    listShapes,
                    listImages,
                    listLoadbalancerShapes,
                    listMySQLShapes,
                    listMySQLVersions,
                    listMySQLConfigurations,
                    listDbSystemShapes,
                    listDbSystemVersions,
                    listCpeDeviceShapes
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
                    if (results[queries.indexOf(listImages)].status === 'fulfilled') referenceData.image = results[queries.indexOf(listImages)].value
                    /*
                    ** Loadbalancer
                    */
                    // Loadbalancer Shapes
                    // @ts-ignore
                    if (results[queries.indexOf(listLoadbalancerShapes)].status === 'fulfilled') referenceData.loadbalancer_shape = results[queries.indexOf(listLoadbalancerShapes)].value
                    /*
                    ** MySQL
                    */
                    // MySQL Configurations
                    // @ts-ignore
                    if (results[queries.indexOf(listMySQLConfigurations)].status === 'fulfilled') referenceData.mysql_configuration = results[queries.indexOf(listMySQLConfigurations)].value
                    // MySQL Shape
                    // @ts-ignore
                    if (results[queries.indexOf(listMySQLShapes)].status === 'fulfilled') referenceData.mysql_shape = results[queries.indexOf(listMySQLShapes)].value
                    // MySQL Versions
                    // @ts-ignore
                    if (results[queries.indexOf(listMySQLVersions)].status === 'fulfilled') referenceData.mysql_version = results[queries.indexOf(listMySQLVersions)].value
                    /*
                    ** Database
                    */
                    // DB System Shape
                    // @ts-ignore
                    if (results[queries.indexOf(listDbSystemShapes)].status === 'fulfilled') referenceData.db_system_shape = results[queries.indexOf(listDbSystemShapes)].value
                    // DB System Version
                    // @ts-ignore
                    if (results[queries.indexOf(listDbSystemVersions)].status === 'fulfilled') referenceData.db_version = results[queries.indexOf(listDbSystemVersions)].value
                    /*
                    ** CPE
                    */
                    // CPE Device Shape
                    // @ts-ignore
                    if (results[queries.indexOf(listCpeDeviceShapes)].status === 'fulfilled') referenceData.cpe_device_shape = results[queries.indexOf(listCpeDeviceShapes)].value

                    // console.debug('OciReferenceDataQuery:', referenceData)
                    resolve(referenceData)
                })
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listCpeDeviceShapes(retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: core.requests.ListCpeDeviceShapesRequest = {}
            const shapeQuery = this.vcnClient.listCpeDeviceShapes(request)
            shapeQuery.then((results) => {
                console.debug('listCpeDeviceShapes: listCpeDeviceShapes: All Settled')
                //@ts-ignore
                const resources = results.items.map((r) => {return {
                        ...r,
                        id: r.cpeDeviceInfo?.platformSoftwareVersion, 
                        displayName: `${r.cpeDeviceInfo?.vendor} ${r.cpeDeviceInfo?.platformSoftwareVersion}` 
                    }
                })
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listDbSystemShapes(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: database.requests.ListDbSystemShapesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.databaseClient.listDbSystemShapes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listDbSystemShapes: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        ...r,
                        id: r.name,
                        displayName: r.name
                    }
                }).sort((a: OciResource, b: OciResource) => a.id.localeCompare(b.id))
                // @ts-ignore
                const uniqueResources = Array.from(new Set(resources.map(e => JSON.stringify(e)))).map(e => JSON.parse(e))
                resolve(uniqueResources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listDbSystemVersions(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: database.requests.ListDbVersionsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.databaseClient.listDbVersions(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listDbSystemVersions: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        ...r,
                        id: r.version,
                        displayName: r.version
                    }
                }).sort((a: OciResource, b: OciResource) => a.id.localeCompare(b.id))
                // @ts-ignore
                const uniqueResources = Array.from(new Set(resources.map(e => JSON.stringify(e)))).map(e => JSON.parse(e))
                resolve(uniqueResources)
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
                console.debug('OciQuery: listImages: All Settled')
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
                // @ts-ignore
                const uniqueResources = Array.from(new Set(resources.map(e => JSON.stringify(e)))).map(e => JSON.parse(e))
                resolve(uniqueResources)
                // resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listLoadbalancerShapes(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: loadbalancer.requests.ListShapesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.loadbalancerClient.listShapes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listLoadbalancerShapes: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        id: r.name,
                        displayName: r.name
                    }
                }).sort((a: OciResource, b: OciResource) => a.id.localeCompare(b.id))
                // @ts-ignore
                const uniqueResources = Array.from(new Set(resources.map(e => JSON.stringify(e)))).map(e => JSON.parse(e))
                resolve(uniqueResources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listMySQLConfigurations(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: mysql.requests.ListConfigurationsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.mysqlClient.listConfigurations(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listMySQLConfigurations: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        ...r
                        // id: r.name,
                        // displayName: r.name
                    }
                }).sort((a: OciResource, b: OciResource) => a.id.localeCompare(b.id))
                // @ts-ignore
                const uniqueResources = Array.from(new Set(resources.map(e => JSON.stringify(e)))).map(e => JSON.parse(e))
                resolve(uniqueResources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listMySQLShapes(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: mysql.requests.ListShapesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.mysqlClient.listShapes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listMySQLShapes: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        ...r,
                        id: r.name,
                        displayName: r.name
                    }
                }).sort((a: OciResource, b: OciResource) => a.id.localeCompare(b.id))
                // @ts-ignore
                const uniqueResources = Array.from(new Set(resources.map(e => JSON.stringify(e)))).map(e => JSON.parse(e))
                resolve(uniqueResources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listMySQLVersions(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: mysql.requests.ListVersionsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.mysqlClient.listVersions(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listMySQLVersions: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        ...r,
                        id: r.versionFamily,
                        displayName: r.versionFamily
                    }
                }).sort((a: OciResource, b: OciResource) => a.id.localeCompare(b.id))
                // @ts-ignore
                const uniqueResources = Array.from(new Set(resources.map(e => JSON.stringify(e)))).map(e => JSON.parse(e))
                resolve(uniqueResources)
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
