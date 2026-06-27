/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { common, containerengine, core, database, datascience, limits, loadbalancer, mysql } from "oci-sdk"
import { OcdLogger, OcdUtils } from "@ocd/core"
import { OciCommonQuery } from './OciQueryCommon.js'
import { QUERY_CONCURRENCY_LIMIT, runWithConcurrency, withRetry } from './OciQueryConcurrency.js'

const logger = OcdLogger.scope('OciReferenceDataQuery')

type LookupResource = Record<string, unknown> & {
    id: string
    displayName?: string
    imageId?: string
    ocid?: string
    shapes?: string[]
}

const sortById = <T extends { id: string }>(a: T, b: T): number => a.id.localeCompare(b.id)
const sortByIdDesc = <T extends { id: string }>(a: T, b: T): number => b.id.localeCompare(a.id)
const sortByImageId = <T extends { imageId?: string }>(a: T, b: T): number => (a.imageId ?? '').localeCompare(b.imageId ?? '')
const sortByDisplayName = <T extends { displayName?: string }>(a: T, b: T): number => (a.displayName ?? '').localeCompare(b.displayName ?? '')

function uniqueByJson<T>(resources: T[]): T[] {
    return Array.from(new Map(resources.map((resource) => [JSON.stringify(resource), resource])).values())
}

function uniqueById<T extends { id: string }>(resources: T[]): T[] {
    return resources.filter((resource, idx, self) => idx === self.findIndex((candidate) => candidate.id === resource.id))
}

export class OciReferenceDataQuery extends OciCommonQuery {
    // Clients
    blockstorageClient: core.BlockstorageClient
    computeClient: core.ComputeClient
    containerengineClient: containerengine.ContainerEngineClient
    databaseClient: database.DatabaseClient
    datascienceClient: datascience.DataScienceClient
    limitsClient: limits.LimitsClient
    loadbalancerClient: loadbalancer.LoadBalancerClient
    mysqlaasClient: mysql.MysqlaasClient
    vcnClient: core.VirtualNetworkClient
    constructor(profile: string='DEFAULT', region?: string) {
        super(profile, region)
        logger.debug('Region', region)
        this.blockstorageClient = new core.BlockstorageClient(this.authenticationConfiguration, this.clientConfiguration)
        this.computeClient = new core.ComputeClient(this.authenticationConfiguration, this.clientConfiguration)
        this.containerengineClient = new containerengine.ContainerEngineClient(this.authenticationConfiguration, this.clientConfiguration)
        this.databaseClient = new database.DatabaseClient(this.authenticationConfiguration, this.clientConfiguration)
        this.datascienceClient = new datascience.DataScienceClient(this.authenticationConfiguration, this.clientConfiguration)
        this.limitsClient = new limits.LimitsClient(this.authenticationConfiguration, this.clientConfiguration)
        this.loadbalancerClient = new loadbalancer.LoadBalancerClient(this.authenticationConfiguration, this.clientConfiguration)
        this.mysqlaasClient = new mysql.MysqlaasClient(this.authenticationConfiguration, this.clientConfiguration)
        this.vcnClient = new core.VirtualNetworkClient(this.authenticationConfiguration, this.clientConfiguration)
    }

    query(): Promise<any> {
        logger.debug('query')
        return new Promise((resolve, reject) => {
            const referenceData: Record<string, any[]> = {}
            this.listTenancyCompartments().then((compartments) => {
                logger.debug('Query: Compartments')
                const compartmentIds = compartments.map((c: LookupResource) => c.id)
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
                    logger.debug('query: All Settled')
                    const fulfilledValue = <T>(query: Promise<T>): T | undefined => {
                        const result = results[queries.indexOf(query)] as PromiseSettledResult<T>
                        return result.status === 'fulfilled' ? result.value : undefined
                    }
                    /*
                    ** OCI Top Level
                    */
                    // All Regions
                    referenceData.regions = fulfilledValue(listRegions) ?? referenceData.regions
                    /*
                    ** Compute
                    */
                    // Shapes
                    referenceData.shapes = fulfilledValue(listShapes) ?? referenceData.shapes
                    // Images
                    referenceData.images = fulfilledValue(listImages) ?? referenceData.images
                    /*
                    ** Loadbalancer
                    */
                    // Loadbalancer Shapes
                    referenceData.loadbalancerShapes = fulfilledValue(listLoadbalancerShapes) ?? referenceData.loadbalancerShapes
                    // Loadbalancer Listener Policies
                    referenceData.loadbalancerPolicies = fulfilledValue(listLoadbalancerPolicies) ?? referenceData.loadbalancerPolicies
                    // Loadbalancer Listener Protocols
                    referenceData.loadbalancerProtocols = fulfilledValue(listLoadbalancerProtocols) ?? referenceData.loadbalancerProtocols
                    /*
                    ** MySQL
                    */
                    // MySQL Configurations
                    referenceData.mysqlConfigurations = fulfilledValue(listMySQLConfigurations) ?? referenceData.mysqlConfigurations
                    // MySQL Shape
                    referenceData.mysqlShapes = fulfilledValue(listMySQLShapes) ?? referenceData.mysqlShapes
                    // MySQL Versions
                    referenceData.mysqlVersions = fulfilledValue(listMySQLVersions) ?? referenceData.mysqlVersions
                    /*
                    ** Network
                    */
                    // Service gateway Services
                    referenceData.serviceGatewayServices = fulfilledValue(listServiceGatewayServices) ?? referenceData.serviceGatewayServices
                    /*
                    ** Database
                    */
                    // DB System Shape
                    referenceData.dbSystemShapes = fulfilledValue(listDbSystemShapes) ?? referenceData.dbSystemShapes
                    // DB System Version
                    referenceData.dbVersions = fulfilledValue(listDbSystemVersions) ?? referenceData.dbVersions
                    // Autonomous DB Version
                    referenceData.autonomousDbVersions = fulfilledValue(listAutonomousDbVersions) ?? referenceData.autonomousDbVersions
                    /*
                    ** CPE
                    */
                    // CPE Device Shape
                    referenceData.cpeDeviceShapes = fulfilledValue(listCpeDeviceShapes) ?? referenceData.cpeDeviceShapes
                    /*
                    ** DataScience
                    */
                    // DataScience Notebook Session Shape
                    referenceData.datascienceNotebookSessionShapes = fulfilledValue(listDataScienceNotebookSessionShapes) ?? referenceData.datascienceNotebookSessionShapes
                    /*
                    ** Limits
                    */
                    // Services
                    referenceData.services = fulfilledValue(listServices) ?? referenceData.services
                    /*
                    ** Container Engine
                    */
                    // Pod Shapes
                    referenceData.podShapes = fulfilledValue(listPodShapes) ?? referenceData.podShapes
                    // Cluster Options
                    const clusterOptions = fulfilledValue(getClusterOptions)
                    if (clusterOptions) {
                        referenceData.kubernetesVersions = clusterOptions.kubernetesVersions
                        referenceData.clusterPodNetworkOptions = clusterOptions.clusterPodNetworkOptions
                    }
                    // Node Pool Options
                    referenceData.nodePoolOptions = fulfilledValue(getNodePoolOptions) ?? referenceData.nodePoolOptions
                    /*
                    ** Storage
                    */
                    // Volume Backup Policies
                    referenceData.volumeBackupPolicies = fulfilledValue(listVolumeBackupPolicies) ?? referenceData.volumeBackupPolicies

                    // console.debug('OciReferenceDataQuery:', referenceData)
                    resolve(referenceData)
                })
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    getClusterOptions(): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: containerengine.requests.GetClusterOptionsRequest = {clusterOptionId: 'all'}
            const shapeQuery = this.containerengineClient.getClusterOptions(request)
            shapeQuery.then((results) => {
                logger.debug('getClusterOptions: All Settled')
                const resources = {
                    kubernetesVersions: results.clusterOptions.kubernetesVersions?.map((v) => {return {id: v, displayName: v, version: v}}),
                    clusterPodNetworkOptions: results.clusterOptions.clusterPodNetworkOptions?.map((o) => {return {...o, id: o.cniType, displayName: o.cniType}})
                }
                resolve(resources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    getImage(imageId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: core.requests.GetImageRequest = {imageId: imageId}
            const query = this.computeClient.getImage(request)
            query.then((results) => {
                // logger.debug('getImage: All Settled')
                const image = results.image
                const resource = {
                    id: `${image.operatingSystem}-${image.operatingSystemVersion}`,
                    // id: r.displayName,
                    ocid: image.id,
                    displayName: `${image.operatingSystem} ${image.operatingSystemVersion}`,
                    sourceDisplayName: image.displayName,
                    platform: image.compartmentId === null,
                    compartmentId: image.compartmentId,
                    operatingSystem: image.operatingSystem,
                    operatingSystemVersion: image.operatingSystemVersion,
                    billableSizeInGBs: image.billableSizeInGBs,
                    lifecycleState: image.lifecycleState
                }
                resolve(resource)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    getNodePoolOptions(): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: containerengine.requests.GetNodePoolOptionsRequest = {nodePoolOptionId: 'all'}
            const shapeQuery = this.containerengineClient.getNodePoolOptions(request)
            shapeQuery.then((results) => {
                logger.debug('getNodePoolOptions: All Settled')
                const resources = {
                    kubernetesVersions: results.nodePoolOptions.kubernetesVersions?.map((v) => {return {id: v, displayName: v, version: v}}),
                    shapes: results.nodePoolOptions.shapes?.map((s) => {return {id: s, displayName: s}}),
                    images: results.nodePoolOptions.sources?.map((s) => {return {id: s.sourceName, displayName: s.sourceName}})
                }
                resolve(resources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    listAutonomousDbVersions(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listAutonomousDbVersions', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.databaseClient.listAutonomousDbVersions(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    ...r,
                    id: r.version,
                    displayName: r.version
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listCpeDeviceShapes(): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: core.requests.ListCpeDeviceShapesRequest = {}
            const shapeQuery = this.vcnClient.listCpeDeviceShapes(request)
            shapeQuery.then((results) => {
                logger.debug('listCpeDeviceShapes: All Settled')
                const resources = (results.items as Array<{ cpeDeviceInfo?: { platformSoftwareVersion?: string; vendor?: string } } & Record<string, unknown>>).map((r): LookupResource => {return {
                        ...r,
                        id: r.cpeDeviceInfo?.platformSoftwareVersion ?? '',
                        displayName: `${r.cpeDeviceInfo?.vendor ?? ''} ${r.cpeDeviceInfo?.platformSoftwareVersion ?? ''}`.trim()
                    }
                })
                resolve(resources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    listDataScienceNotebookSessionShapes(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listDataScienceNotebookSessionShapes', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.datascienceClient.listNotebookSessionShapes(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    ...r,
                    id: r.name,
                    displayName: r.name,
                    isFlexible: r.name.endsWith('.Flex')
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listDbSystemShapes(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listDbSystemShapes', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.databaseClient.listDbSystemShapes(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    ...r,
                    id: r.name,
                    displayName: r.name
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listDbSystemVersions(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listDbSystemVersions', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.databaseClient.listDbVersions(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    ...r,
                    id: r.version,
                    displayName: r.version
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listImages(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListImagesRequest[] = compartmentIds.map((id) => {return {compartmentId: id, limit: 10000}})
            const responseIterators = requests.map((r) => this.computeClient.listImagesResponseIterator(r))
            const queries = runWithConcurrency(responseIterators.map((r) => withRetry(() => this.getAllResponseData(r))), QUERY_CONCURRENCY_LIMIT)
            // const queries = requests.map((r) => this.computeClient.listImages(r))
            Promise.allSettled(queries).then((results) => {
                logger.debug('listImages: All Settled')
                const resources = (this.collectSettled<any, any>(results, 'listImages', (value) => value) as any).map((r: any) => {return {
                        id: `${r.operatingSystem}-${r.operatingSystemVersion}`,
                        // id: r.displayName,
                        ocid: r.id,
                        displayName: `${r.operatingSystem} ${r.operatingSystemVersion}`,
                        sourceDisplayName: r.displayName,
                        platform: r.compartmentId === null,
                        compartmentId: r.compartmentId,
                        operatingSystem: r.operatingSystem,
                        operatingSystemVersion: r.operatingSystemVersion,
                        billableSizeInGBs: r.billableSizeInGBs,
                        lifecycleState: r.lifecycleState
                    }
                }).sort(sortByIdDesc)
                // resources.forEach((i: Record<string, any>) => logger.debug('Images:', i.id, ':', i.ocid))
                const uniqueResources = uniqueById(resources).sort(sortById)
                const imageIds = uniqueResources.map((r: Record<string, string>) => r.ocid)
                this.listImageShapeCompatabilities(imageIds).then((compatibilities) => {
                    uniqueResources.forEach((r: Record<string, string>) => r.shapes = compatibilities.filter((c: Record<string, string>) => c.imageId === r.ocid).map((c: Record<string, string>) => c.shape))
                    // const sortedResources = [...uniqueResources.filter((r: Record<string, string>) => r.id.startsWith('Oracle')), ...uniqueResources.filter((r: Record<string, string>) => !r.id.startsWith('Oracle'))]
                    resolve(uniqueResources)
                }).catch((reason) => {
                    logger.error('listImages: Error', reason)
                    reject(reason)
                })
                // resolve(resources)
            }).catch((reason) => {
                logger.error('listImages: Error', reason)
                reject(reason)
            })
        })
    }

    listImageShapeCompatabilities(imageIds: string[]): Promise<any> {
        return this.listByCompartment('listImageShapeCompatabilities', imageIds, (id) => ({ imageId: id, limit: 10000 }), (r) => this.computeClient.listImageShapeCompatibilityEntries(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    ...r
                }
            }).sort(sortByImageId)
            return uniqueByJson(mapped)
        })
    }

    listLoadbalancerPolicies(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listLoadbalancerPolicies', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.loadbalancerClient.listPolicies(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    id: r.name,
                    displayName: OcdUtils.toTitle(r.name)
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listLoadbalancerProtocols(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listLoadbalancerProtocols', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.loadbalancerClient.listProtocols(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    id: r.name,
                    displayName: r.name
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listLoadbalancerShapes(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listLoadbalancerShapes', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.loadbalancerClient.listShapes(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    id: r.name,
                    displayName: r.name
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listMySQLConfigurations(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listMySQLConfigurations', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.mysqlaasClient.listConfigurations(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    ...r
                    // id: r.name,
                    // displayName: r.name
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listMySQLShapes(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listMySQLShapes', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.mysqlaasClient.listShapes(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    ...r,
                    id: r.name,
                    displayName: r.name
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listMySQLVersions(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listMySQLVersions', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.mysqlaasClient.listVersions(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    ...r,
                    id: r.versionFamily,
                    displayName: r.versionFamily
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listPodShapes(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listPodShapes', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.containerengineClient.listPodShapes(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    ...r,
                    id: r.name,
                    displayName: r.name
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listServices(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listServices', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.limitsClient.listServices(r)).then((resources) => {
            const mapped = resources.map((r: any) => {return {
                    ...r,
                    id: r.name,
                    displayName: r.description
                }
            }).sort(sortById)
            return uniqueByJson(mapped)
        })
    }

    listServiceGatewayServices(): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: core.requests.ListServicesRequest = {}
            const shapeQuery = this.vcnClient.listServices(request)
            shapeQuery.then((results) => {
                logger.debug('listShapes: All Settled')
                const sortedResources = (results.items as Array<{ name: string } & Record<string, unknown>>).map((s): LookupResource => {return {
                        ...s, 
                        id: s.name.startsWith('All ') ? 'All' : 'Object Storage',
                        displayName: `${s.name.split(' ')[0]} ${s.name.split(' ').slice(2).join(' ')}`,
                    }
                }).sort(sortByDisplayName)
                const resources = uniqueById(sortedResources)
                resolve(resources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    listShapes(): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: core.requests.ListShapesRequest = {compartmentId: this.provider.getTenantId()}
            const shapeQuery = this.computeClient.listShapes(request)
            shapeQuery.then((results) => {
                logger.debug('listShapes: All Settled')
                const sortedResources = (results.items as Array<{ shape: string } & Record<string, unknown>>).map((s): LookupResource => {return {
                        id: s.shape, 
                        displayName: s.shape, 
                        shape: s.shape, 
                        ocpus: s.ocpus, 
                        memoryInGBs: s.memoryInGBs, 
                        ocpuOptions: s.ocpuOptions, 
                        memoryOptions: s.memoryOptions, 
                        isFlexible: s.isFlexible
                    }
                }).sort(sortByDisplayName)
                const resources = uniqueById(sortedResources)
                resolve(resources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    listVolumeBackupPolicies(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListVolumeBackupPoliciesRequest[] = [{}, ...compartmentIds.map((id) => {return {compartmentId: id}})]
            const queries = runWithConcurrency(requests.map((r) => withRetry(() => this.blockstorageClient.listVolumeBackupPolicies(r))), QUERY_CONCURRENCY_LIMIT)
            Promise.allSettled(queries).then((results) => {
                logger.debug('listVolumeBackupPolicies: All Settled')
                const resources = (this.collectSettled<any>(results, 'listVolumeBackupPolicies') as any).map((r: any) => {return {
                        id: r.displayName,
                        displayName: OcdUtils.toTitle(r.displayName)
                    }
                }).sort(sortById)
                const uniqueResources = uniqueByJson(resources)
                resolve(uniqueResources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }
}

export default OciReferenceDataQuery
// module.exports = { OciReferenceDataQuery }
