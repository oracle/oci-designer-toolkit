/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { common, containerengine, core, database, datascience, limits, loadbalancer, mysql } from "oci-sdk"
import { OciQuery } from "./OciQuery"
import { OciResource } from "@ocd/model"
import { OcdUtils } from "@ocd/core"
import { OciCommonQuery } from './OciQueryCommon'

export class OciReferenceDataQuery extends OciCommonQuery {
    // Clients
    blockstorageClient: core.BlockstorageClient
    computeClient: core.ComputeClient
    containerengineClient: containerengine.ContainerEngineClient
    databaseClient: database.DatabaseClient
    datascienceClient: datascience.DataScienceClient
    limitsClient: limits.LimitsClient
    loadbalancerClient: loadbalancer.LoadBalancerClient
    mysqlClient: mysql.MysqlaasClient
    vcnClient: core.VirtualNetworkClient
    constructor(profile: string='DEFAULT', region?: string) {
        super(profile, region)
        console.debug('OciReferenceDataQuery: Region', region)
        this.blockstorageClient = new core.BlockstorageClient(this.authenticationConfiguration, this.clientConfiguration)
        this.computeClient = new core.ComputeClient(this.authenticationConfiguration, this.clientConfiguration)
        this.containerengineClient = new containerengine.ContainerEngineClient(this.authenticationConfiguration, this.clientConfiguration)
        this.databaseClient = new database.DatabaseClient(this.authenticationConfiguration, this.clientConfiguration)
        this.datascienceClient = new datascience.DataScienceClient(this.authenticationConfiguration, this.clientConfiguration)
        this.limitsClient = new limits.LimitsClient(this.authenticationConfiguration, this.clientConfiguration)
        this.loadbalancerClient = new loadbalancer.LoadBalancerClient(this.authenticationConfiguration, this.clientConfiguration)
        this.mysqlClient = new mysql.MysqlaasClient(this.authenticationConfiguration, this.clientConfiguration)
        this.vcnClient = new core.VirtualNetworkClient(this.authenticationConfiguration, this.clientConfiguration)
    }

    query(): Promise<any> {
        console.debug('OciReferenceDataQuery: query')
        return new Promise((resolve, reject) => {
            const referenceData: Record<string, any[]> = {}
            this.listTenancyCompartments().then((compartments) => {
                console.debug('OciReferenceDataQuery: Query: Compartments')
                const compartmentIds = compartments.map((c: OciResource) => c.id)
                const tenancyId = [this.provider.getTenantId()]
                // Top Level
                const listRegions = this.listAllRegions()
                // Compute
                const listShapes = this.listShapes()
                const listImages = this.listImages(compartmentIds)
                const listDataScienceNotebookSessionShapes = this.listDataScienceNotebookSessionShapes(compartmentIds)
                // Networking
                const listLoadbalancerShapes = this.listLoadbalancerShapes(compartmentIds)
                const listLoadbalancerPolicies = this.listLoadbalancerPolicies(compartmentIds)
                const listLoadbalancerProtocols = this.listLoadbalancerProtocols(compartmentIds)
                const listServiceGatewayServices = this.listServiceGatewayServices()
                // Database
                const listMySQLShapes = this.listMySQLShapes(compartmentIds)
                const listMySQLVersions = this.listMySQLVersions(compartmentIds)
                const listMySQLConfigurations = this.listMySQLConfigurations(compartmentIds)
                const listDbSystemShapes = this.listDbSystemShapes(compartmentIds)
                const listDbSystemVersions = this.listDbSystemVersions(compartmentIds)
                const listAutonomousDbVersions = this.listAutonomousDbVersions(compartmentIds)
                // Customer
                const listCpeDeviceShapes = this.listCpeDeviceShapes()
                // Limits
                const listServices = this.listServices(tenancyId)
                // Container Engine
                const listPodShapes = this.listPodShapes(compartmentIds)
                const getClusterOptions = this.getClusterOptions()
                const getNodePoolOptions = this.getNodePoolOptions()
                // Storage
                const listVolumeBackupPolicies = this.listVolumeBackupPolicies(compartmentIds)

                // Query Promise Array
                const queries = [
                    listRegions,
                    listShapes,
                    listImages,
                    listLoadbalancerShapes,
                    listLoadbalancerPolicies,
                    listLoadbalancerProtocols,
                    listMySQLShapes,
                    listMySQLVersions,
                    listMySQLConfigurations,
                    listDbSystemShapes,
                    listDbSystemVersions,
                    listAutonomousDbVersions,
                    listCpeDeviceShapes,
                    listDataScienceNotebookSessionShapes,
                    listServices,
                    listServiceGatewayServices,
                    listPodShapes,
                    getClusterOptions,
                    getNodePoolOptions,
                    listVolumeBackupPolicies
                ]
                Promise.allSettled(queries).then((results) => {
                    console.debug('OciReferenceDataQuery: query: All Settled')
                    /*
                    ** OCI Top Level
                    */
                    // All Regions
                    // @ts-ignore
                    if (results[queries.indexOf(listRegions)].status === 'fulfilled') referenceData.regions = results[queries.indexOf(listRegions)].value
                    /*
                    ** Compute
                    */
                    // Shapes
                    // @ts-ignore
                    if (results[queries.indexOf(listShapes)].status === 'fulfilled') referenceData.shapes = results[queries.indexOf(listShapes)].value
                    // Images
                    // @ts-ignore
                    if (results[queries.indexOf(listImages)].status === 'fulfilled') referenceData.images = results[queries.indexOf(listImages)].value
                    /*
                    ** Loadbalancer
                    */
                    // Loadbalancer Shapes
                    // @ts-ignore
                    if (results[queries.indexOf(listLoadbalancerShapes)].status === 'fulfilled') referenceData.loadbalancerShapes = results[queries.indexOf(listLoadbalancerShapes)].value
                    // Loadbalancer Listener Policies
                    // @ts-ignore
                    if (results[queries.indexOf(listLoadbalancerPolicies)].status === 'fulfilled') referenceData.loadbalancerPolicies = results[queries.indexOf(listLoadbalancerPolicies)].value
                    // Loadbalancer Listener Protocols
                    // @ts-ignore
                    if (results[queries.indexOf(listLoadbalancerProtocols)].status === 'fulfilled') referenceData.loadbalancerProtocols = results[queries.indexOf(listLoadbalancerProtocols)].value
                    /*
                    ** MySQL
                    */
                    // MySQL Configurations
                    // @ts-ignore
                    if (results[queries.indexOf(listMySQLConfigurations)].status === 'fulfilled') referenceData.mysqlConfigurations = results[queries.indexOf(listMySQLConfigurations)].value
                    // MySQL Shape
                    // @ts-ignore
                    if (results[queries.indexOf(listMySQLShapes)].status === 'fulfilled') referenceData.mysqlShapes = results[queries.indexOf(listMySQLShapes)].value
                    // MySQL Versions
                    // @ts-ignore
                    if (results[queries.indexOf(listMySQLVersions)].status === 'fulfilled') referenceData.mysqlVersions = results[queries.indexOf(listMySQLVersions)].value
                    /*
                    ** Network
                    */
                    // Service gateway Services
                    // @ts-ignore
                    if (results[queries.indexOf(listServiceGatewayServices)].status === 'fulfilled') referenceData.serviceGatewayServices = results[queries.indexOf(listServiceGatewayServices)].value
                    /*
                    ** Database
                    */
                    // DB System Shape
                    // @ts-ignore
                    if (results[queries.indexOf(listDbSystemShapes)].status === 'fulfilled') referenceData.dbSystemShapes = results[queries.indexOf(listDbSystemShapes)].value
                    // DB System Version
                    // @ts-ignore
                    if (results[queries.indexOf(listDbSystemVersions)].status === 'fulfilled') referenceData.dbVersions = results[queries.indexOf(listDbSystemVersions)].value
                    // Autonomous DB Version
                    // @ts-ignore
                    if (results[queries.indexOf(listAutonomousDbVersions)].status === 'fulfilled') referenceData.autonomousDbVersions = results[queries.indexOf(listAutonomousDbVersions)].value
                    /*
                    ** CPE
                    */
                    // CPE Device Shape
                    // @ts-ignore
                    if (results[queries.indexOf(listCpeDeviceShapes)].status === 'fulfilled') referenceData.cpeDeviceShapes = results[queries.indexOf(listCpeDeviceShapes)].value
                    /*
                    ** DataScience
                    */
                    // DataScience Notebook Session Shape
                    // @ts-ignore
                    if (results[queries.indexOf(listDataScienceNotebookSessionShapes)].status === 'fulfilled') referenceData.datascienceNotebookSessionShapes = results[queries.indexOf(listDataScienceNotebookSessionShapes)].value
                    /*
                    ** Limits
                    */
                    // Services
                    // @ts-ignore
                    if (results[queries.indexOf(listServices)].status === 'fulfilled') referenceData.services = results[queries.indexOf(listServices)].value
                    /*
                    ** Container Engine
                    */
                    // Pod Shapes
                    // @ts-ignore
                    if (results[queries.indexOf(listPodShapes)].status === 'fulfilled') referenceData.podShapes = results[queries.indexOf(listPodShapes)].value
                    // Cluster Options
                    // @ts-ignore
                    if (results[queries.indexOf(getClusterOptions)].status === 'fulfilled') {
                        // @ts-ignore
                        const clusterOptions = results[queries.indexOf(getClusterOptions)].value
                        referenceData.kubernetesVersions = clusterOptions.kubernetesVersions
                        referenceData.clusterPodNetworkOptions = clusterOptions.clusterPodNetworkOptions
                    }
                    // Node Pool Options
                    // @ts-ignore
                    if (results[queries.indexOf(getNodePoolOptions)].status === 'fulfilled') {
                        // @ts-ignore
                        referenceData.nodePoolOptions = results[queries.indexOf(getNodePoolOptions)].value
                    }
                    /*
                    ** Storage
                    */
                    // Volume Backup Policies
                    // @ts-ignore
                    if (results[queries.indexOf(listVolumeBackupPolicies)].status === 'fulfilled') referenceData.volumeBackupPolicies = results[queries.indexOf(listVolumeBackupPolicies)].value

                    // console.debug('OciReferenceDataQuery:', referenceData)
                    resolve(referenceData)
                })
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    getClusterOptions(retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: containerengine.requests.GetClusterOptionsRequest = {clusterOptionId: 'all'}
            const shapeQuery = this.containerengineClient.getClusterOptions(request)
            shapeQuery.then((results) => {
                console.debug('OciReferenceDataQuery: getClusterOptions: All Settled')
                const resources = {
                    kubernetesVersions: results.clusterOptions.kubernetesVersions?.map((v) => {return {id: v, displayName: v, version: v}}),
                    clusterPodNetworkOptions: results.clusterOptions.clusterPodNetworkOptions?.map((o) => {return {...o, id: o.cniType, displayName: o.cniType}})
                }
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    getNodePoolOptions(retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: containerengine.requests.GetNodePoolOptionsRequest = {nodePoolOptionId: 'all'}
            const shapeQuery = this.containerengineClient.getNodePoolOptions(request)
            shapeQuery.then((results) => {
                console.debug('OciReferenceDataQuery: getNodePoolOptions: All Settled')
                const resources = {
                    kubernetesVersions: results.nodePoolOptions.kubernetesVersions?.map((v) => {return {id: v, displayName: v, version: v}}),
                    shapes: results.nodePoolOptions.shapes?.map((s) => {return {id: s, displayName: s}}),
                    images: results.nodePoolOptions.sources?.map((s) => {return {id: s.sourceName, displayName: s.sourceName}})
                }
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listAutonomousDbVersions(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: database.requests.ListAutonomousDbVersionsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.databaseClient.listAutonomousDbVersions(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listAutonomousDbVersions: All Settled')
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

    listCpeDeviceShapes(retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: core.requests.ListCpeDeviceShapesRequest = {}
            const shapeQuery = this.vcnClient.listCpeDeviceShapes(request)
            shapeQuery.then((results) => {
                console.debug('OciReferenceDataQuery: listCpeDeviceShapes: All Settled')
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

    listDataScienceNotebookSessionShapes(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: datascience.requests.ListNotebookSessionShapesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.datascienceClient.listNotebookSessionShapes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listDataScienceNotebookSessionShapes: All Settled')
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

    listDbSystemShapes(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: database.requests.ListDbSystemShapesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.databaseClient.listDbSystemShapes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listDbSystemShapes: All Settled')
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
                console.debug('OciReferenceDataQuery: listDbSystemVersions: All Settled')
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
            const requests: core.requests.ListImagesRequest[] = compartmentIds.map((id) => {return {compartmentId: id, limit: 10000}})
            const responseIterators = requests.map((r) => this.computeClient.listImagesResponseIterator(r))
            const queries = responseIterators.map((r) => this.getAllResponseData(r))
            // const queries = requests.map((r) => this.computeClient.listImages(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listImages: All Settled', results)
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value], []).map((r) => {return {
                        id: `${r.operatingSystem}-${r.operatingSystemVersion}`,
                        // id: r.displayName,
                        ocid: r.id,
                        displayName: `${r.operatingSystem} ${r.operatingSystemVersion}`,
                        sourceDisplayName: r.displayName,
                        platform: r.compartmentId === null,
                        operatingSystem: r.operatingSystem,
                        operatingSystemVersion: r.operatingSystemVersion,
                        billableSizeInGBs: r.billableSizeInGBs,
                        lifecycleState: r.lifecycleState
                    }
                }).sort((a: OciResource, b: OciResource) => (a.id.localeCompare(b.id) * -1))
                // @ts-ignore
                // const uniqueResources = Array.from(new Set(resources.map(e => JSON.stringify(e)))).map(e => JSON.parse(e))
                const uniqueResources = resources.filter((r, i) => resources.findIndex((v) => r.id === v.id) === i).sort((a: OciResource, b: OciResource) => a.id.localeCompare(b.id))
                const imageIds = uniqueResources.map((r: Record<string, string>) => r.ocid)
                this.listImageShapeCompatabilities(imageIds).then((compatibilities) => {
                    uniqueResources.forEach((r: Record<string, string>) => r.shapes = compatibilities.filter((c: Record<string, string>) => c.imageId === r.ocid).map((c: Record<string, string>) => c.shape))
                    // const sortedResources = [...uniqueResources.filter((r: Record<string, string>) => r.id.startsWith('Oracle')), ...uniqueResources.filter((r: Record<string, string>) => !r.id.startsWith('Oracle'))]
                    resolve(uniqueResources)
                }).catch((reason) => {
                    console.error('OciReferenceDataQuery: listImages: Error', reason)
                    reject(reason)
                })
                // resolve(resources)
            }).catch((reason) => {
                console.error('OciReferenceDataQuery: listImages: Error', reason)
                reject(reason)
            })
        })
    }

    listImagesOrig(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListImagesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.computeClient.listImages(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listImages: All Settled')
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
                const imageIds = uniqueResources.map((r) => r.ocid)
                this.listImageShapeCompatabilities(imageIds).then((compatibilities) => {
                    uniqueResources.forEach((r) => r.shapes = compatibilities.filter((c: Record<string, string>) => c.imageId === r.ocid).map((c: Record<string, string>) => c.shape))
                    resolve(uniqueResources)
                }).catch((reason) => {
                    console.error(reason)
                    reject(reason)
                })
                // resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listImageShapeCompatabilities(imageIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListImageShapeCompatibilityEntriesRequest[] = imageIds.map((id) => {return {imageId: id, limit: 10000}})
            const queries = requests.map((r) => this.computeClient.listImageShapeCompatibilityEntries(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listImageShapeCompatabilities: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        ...r
                    }
                }).sort((a: OciResource, b: OciResource) => a.imageId.localeCompare(b.imageId))
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

    listLoadbalancerPolicies(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: loadbalancer.requests.ListPoliciesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.loadbalancerClient.listPolicies(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listLoadbalancerPolicies: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        id: r.name,
                        displayName: OcdUtils.toTitle(r.name)
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

    listLoadbalancerProtocols(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: loadbalancer.requests.ListProtocolsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.loadbalancerClient.listProtocols(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listLoadbalancerProtocols: All Settled')
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

    listLoadbalancerShapes(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: loadbalancer.requests.ListShapesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.loadbalancerClient.listShapes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listLoadbalancerShapes: All Settled')
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
                console.debug('OciReferenceDataQuery: listMySQLConfigurations: All Settled')
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
                console.debug('OciReferenceDataQuery: listMySQLShapes: All Settled')
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
                console.debug('OciReferenceDataQuery: listMySQLVersions: All Settled')
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

    listPodShapes(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: containerengine.requests.ListPodShapesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.containerengineClient.listPodShapes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listPodShapes: All Settled')
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

    listServices(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: limits.requests.ListServicesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.limitsClient.listServices(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listServices: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        ...r,
                        id: r.name,
                        displayName: r.description
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

    listServiceGatewayServices(): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: core.requests.ListServicesRequest = {}
            const shapeQuery = this.vcnClient.listServices(request)
            shapeQuery.then((results) => {
                console.debug('OciReferenceDataQuery: listShapes: All Settled')
                //@ts-ignore
                const resources = results.items.map((s) => {return {
                        ...s, 
                        id: s.name.startsWith('All ') ? 'All' : 'Object Storage',
                        displayName: `${s.name.split(' ')[0]} ${s.name.split(' ').slice(2).join(' ')}`,
                    }
                }).sort((a, b) => a.displayName.localeCompare(b.displayName)).filter((resource, idx, self) => idx === self.findIndex((r) => r.id === resource.id)) // De-duplicated
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
                }).sort((a, b) => a.displayName.localeCompare(b.displayName)).filter((resource, idx, self) => idx === self.findIndex((r) => r.id === resource.id)) // De-duplicated
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listVolumeBackupPolicies(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListVolumeBackupPoliciesRequest[] = [{}, ...compartmentIds.map((id) => {return {compartmentId: id}})]
            const queries = requests.map((r) => this.blockstorageClient.listVolumeBackupPolicies(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciReferenceDataQuery: listVolumeBackupPolicies: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []).map((r) => {return {
                        id: r.displayName,
                        displayName: OcdUtils.toTitle(r.displayName)
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
}

export default OciReferenceDataQuery
module.exports = { OciReferenceDataQuery }
