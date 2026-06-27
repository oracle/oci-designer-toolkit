/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

// import * as common from 'oci-common'
// import * as core from "oci-core"
// import * as identity from "oci-identity"
import { OcdLogger, OcdMetrics } from '@ocd/core'
import { OcdDesign, OciModelResources, OciResource, OciResources } from '@ocd/model'
import { analytics, bastion, core, database, filestorage, identity, keymanagement, loadbalancer, mysql, networkloadbalancer, nosql, objectstorage, vault } from 'oci-sdk'
// import { OciCommonQuery } from './OciQueryCommon.js'
import { OciReferenceDataQuery } from './OciReferenceDataQuery.js'
import { QUERY_CONCURRENCY_LIMIT, runWithConcurrency, withRetry } from './OciQueryConcurrency.js'

const logger = OcdLogger.scope('OciQuery')

export class OciQuery extends OciReferenceDataQuery {
    // Clients
    // vcnClient: core.VirtualNetworkClient
    // computeClient: core.ComputeClient
    // blockstorageClient: core.BlockstorageClient
    analyticsClient: analytics.AnalyticsClient
    bastionClient: bastion.BastionClient
    fileStorageClient: filestorage.FileStorageClient
    kmsManagementClient: keymanagement.KmsManagementClient
    kmsVaultClient: keymanagement.KmsVaultClient
    mysqlClient: mysql.DbSystemClient
    networkLoadbalancerClient: networkloadbalancer.NetworkLoadBalancerClient
    nosqlClient: nosql.NosqlClient
    objectStorageClient: objectstorage.ObjectStorageClient
    vaultClient: vault.VaultsClient
    // databaseClient: database.DatabaseClient
    // loadbalancerClient: loadbalancer.LoadBalancerClient

    constructor(profile: string='DEFAULT', region?: string) {
        super(profile, region)
        logger.debug('Region', region)
        // Initialise All Clients
        // this.vcnClient = new core.VirtualNetworkClient(this.authenticationConfiguration, this.clientConfiguration)
        // this.computeClient = new core.ComputeClient(this.authenticationConfiguration, this.clientConfiguration)
        // this.blockstorageClient = new core.BlockstorageClient(this.authenticationConfiguration, this.clientConfiguration)
        this.analyticsClient = new analytics.AnalyticsClient(this.authenticationConfiguration, this.clientConfiguration)
        this.bastionClient = new bastion.BastionClient(this.authenticationConfiguration, this.clientConfiguration)
        this.fileStorageClient = new filestorage.FileStorageClient(this.authenticationConfiguration, this.clientConfiguration)
        this.kmsManagementClient = new keymanagement.KmsManagementClient(this.authenticationConfiguration, this.clientConfiguration)
        this.kmsVaultClient = new keymanagement.KmsVaultClient(this.authenticationConfiguration, this.clientConfiguration)
        this.mysqlClient = new mysql.DbSystemClient(this.authenticationConfiguration, this.clientConfiguration)
        this.networkLoadbalancerClient = new networkloadbalancer.NetworkLoadBalancerClient(this.authenticationConfiguration, this.clientConfiguration)
        this.nosqlClient = new nosql.NosqlClient(this.authenticationConfiguration, this.clientConfiguration)
        this.objectStorageClient = new objectstorage.ObjectStorageClient(this.authenticationConfiguration, this.clientConfiguration)
        this.vaultClient = new vault.VaultsClient(this.authenticationConfiguration, this.clientConfiguration)
        // this.databaseClient = new database.DatabaseClient(this.authenticationConfiguration, this.clientConfiguration)
        // this.loadbalancerClient = new loadbalancer.LoadBalancerClient(this.authenticationConfiguration, this.clientConfiguration)
    }

    newDesign = () => OcdDesign.newDesign()

    // Top Level functions to drive the query

    queryTenancy(compartmentIds: string[], options?: { requestId?: string }): Promise<any> {
        // When the originating request id is threaded from the web-server HTTP boundary
        // (see OciWebServerHttp / handlers), scope the logger to it so query-layer log
        // lines for this run correlate with the X-Request-Id observed at the HTTP edge.
        // requestId is an opaque correlation token (never an OCID/secret); no design JSON
        // is logged here, preserving the existing no-design-JSON / no-OCID logging contract.
        const runLogger = options?.requestId ? OcdLogger.scope(`OciQuery:${options.requestId}`) : logger
        runLogger.debug('queryTenancy')
        // Reset the per-run failure accumulator so queryErrors only reflects this run.
        this.queryFailures = []
        // Observability: time the whole discovery run and tally success/failure.
        // requestId is intentionally NOT a metric label (high cardinality); it is
        // only carried by the scoped logger above. The timer/counters wrap the
        // existing promise without altering its resolution value or control flow.
        const queryTimer = OcdMetrics.timer('oci.query.tenancy.ms')
        const queryRun = new Promise((resolve, reject) => {
            const design = this.newDesign()
            this.listTenancyCompartments().then((compartments) => {
                const allTenancyCompartmentIds = compartments.map((c: OciResource) => c.id)
                // Reference Data
                const listImages = this.listImages(allTenancyCompartmentIds)
                // Kick Off In Sequence Container Based Resources
                const getCompartments = this.getCompartments(compartmentIds)
                const listVcns = this.listVcns(compartmentIds)
                const listSubnets = this.listSubnets(compartmentIds)
                // Networking
                const listDhcpOptions = this.listDhcpOptions(compartmentIds)
                const listInternetGateways = this.listInternetGateways(compartmentIds)
                const listNatGateways = this.listNatGateways(compartmentIds)
                const listRouteTables = this.listRouteTables(compartmentIds)
                const listSecurityLists = this.listSecurityLists(compartmentIds)
                const listNetworkSecurityGroups = this.listNetworkSecurityGroups(compartmentIds)
                const listIPSecConnections = this.listIPSecConnections(compartmentIds)
                const listDrgs = this.listDrgs(compartmentIds)
                const listDrgAttachments = this.listDrgAttachments(compartmentIds)
                const listServiceGateways = this.listServiceGateways(compartmentIds)
                const listLocalPeeringGateways = this.listLocalPeeringGateways(compartmentIds)
                const listRemotePeeringConnections = this.listRemotePeeringConnections(compartmentIds)
                const listCpes = this.listCpes(compartmentIds)
                // Storage
                const listVolumes = this.listVolumes(compartmentIds)
                const listBootVolumes = this.listBootVolumes(compartmentIds)
                const listFileSystems = this.listFileSystems(compartmentIds)
                const listMountTargets = this.listMountTargets(compartmentIds)
                const listBuckets = this.listBuckets(compartmentIds)
                // Databases
                const listAutonomousDatabases = this.listAutonomousDatabases(compartmentIds)
                const listDatabaseSystems = this.listDatabaseSystems(compartmentIds)
                const listMySqlDatabaseSystems = this.listMySqlDatabaseSystems(compartmentIds)
                const listNoSqlTables = this.listNoSqlTables(compartmentIds)
                // const listNoSqlIndexes = this.listNoSqlIndexes(compartmentIds)
                // Infrastructure
                const listInstances = this.listInstances(compartmentIds)
                const listVnicAttachments = this.listVnicAttachments(compartmentIds)
                const listVolumeAttachments = this.listVolumeAttachments(compartmentIds)
                const listBootVolumeAttachments = this.listBootVolumeAttachments(compartmentIds)
                const listAnalyticsInstances = this.listAnalyticsInstances(compartmentIds)
                const listLoadBalancers = this.listLoadBalancers(compartmentIds)
                const listNetworkLoadBalancers = this.listNetworkLoadBalancers(compartmentIds)
                // Identity
                const listBastions = this.listBastions(compartmentIds)
                const listVaults = this.listVaults(compartmentIds)
                const listKeys = this.listKeys(compartmentIds)
                const listSecrets = this.listSecrets(compartmentIds)
                const listDynamicGroups = this.listDynamicGroups(compartmentIds)
                // const listDynamicGroups = this.listDynamicGroups([this.provider.getTenantId()])
                const listPolicies = this.listPolicies(compartmentIds)
                // const listPolicies = this.listPolicies([...compartmentIds, this.provider.getTenantId()])
                // Wait for all queries to be settled
                const queries = [
                    // Reference Data
                    listImages,
                    // Resources
                    getCompartments, 
                    listVcns, 
                    listSubnets, 
                    listRouteTables, 
                    listSecurityLists, 
                    listNetworkSecurityGroups, 
                    listDhcpOptions, 
                    listInternetGateways, 
                    listNatGateways, 
                    listInstances, 
                    listVnicAttachments, 
                    listVolumeAttachments, 
                    listBootVolumeAttachments, 
                    listVolumes, 
                    listBootVolumes, 
                    listFileSystems, 
                    listMountTargets, 
                    listBuckets, 
                    listAutonomousDatabases, 
                    listAnalyticsInstances,
                    listDatabaseSystems, 
                    listMySqlDatabaseSystems, 
                    listNoSqlTables, 
                    // listNoSqlIndexes, 
                    listLoadBalancers, 
                    listNetworkLoadBalancers, 
                    listIPSecConnections, 
                    listDrgs, 
                    listDrgAttachments, 
                    listServiceGateways, 
                    listLocalPeeringGateways,
                    listRemotePeeringConnections, 
                    listCpes, 
                    listBastions, 
                    listVaults, 
                    listKeys, 
                    listSecrets,
                    listDynamicGroups,
                    listPolicies
                ]
                Promise.allSettled(queries).then((results) => {
                    runLogger.debug('queryTenancy: All Settled')
                    // Reference Data
                    // @ts-ignore
                    const computeImages = results[queries.indexOf(listImages)].value
                    // Compartments
                    // @ts-ignore
                    design.model.oci.resources.compartment = results[queries.indexOf(getCompartments)].value
                    // @ts-ignore
                    design.view.pages[0].layers = design.model.oci.resources.compartment.map((c, i) => {return {id: c.id, class: 'oci-compartment', visible: true, selected: i === 0}})

                    /*
                    ** Networking
                    */
                    // VCNs
                    // @ts-ignore
                    if (results[queries.indexOf(listVcns)].status === 'fulfilled' && results[queries.indexOf(listVcns)].value.length > 0) design.model.oci.resources.vcn = results[queries.indexOf(listVcns)].value
                    // Subnets
                    // @ts-ignore
                    if (results[queries.indexOf(listSubnets)].status === 'fulfilled' && results[queries.indexOf(listSubnets)].value.length > 0) design.model.oci.resources.subnet = results[queries.indexOf(listSubnets)].value
                    // Route Tables
                    // @ts-ignore
                    if (results[queries.indexOf(listRouteTables)].status === 'fulfilled' && results[queries.indexOf(listRouteTables)].value.length > 0) design.model.oci.resources.route_table = results[queries.indexOf(listRouteTables)].value
                    // Security Lists
                    // @ts-ignore
                    if (results[queries.indexOf(listSecurityLists)].status === 'fulfilled' && results[queries.indexOf(listSecurityLists)].value.length > 0) design.model.oci.resources.security_list = results[queries.indexOf(listSecurityLists)].value
                    // Network Security Groups
                    // @ts-ignore
                    if (results[queries.indexOf(listNetworkSecurityGroups)].status === 'fulfilled' && results[queries.indexOf(listNetworkSecurityGroups)].value.length > 0) design.model.oci.resources.network_security_group = results[queries.indexOf(listNetworkSecurityGroups)].value.groups
                    // Network Security Groups Rules
                    // @ts-ignore
                    // if (results[queries.indexOf(listNetworkSecurityGroups)].status === 'fulfilled') design.model.oci.resources.network_security_group_security_rules = design.model.oci.resources.network_security_group.reduce((a, c) => [...a, ...c.rules], [])
                    if (results[queries.indexOf(listNetworkSecurityGroups)].status === 'fulfilled' && results[queries.indexOf(listNetworkSecurityGroups)].value.length > 0) design.model.oci.resources.network_security_group_security_rule = results[queries.indexOf(listNetworkSecurityGroups)].value.rules
                    // DHCP Options
                    // @ts-ignore
                    if (results[queries.indexOf(listDhcpOptions)].status === 'fulfilled' && results[queries.indexOf(listDhcpOptions)].value.length > 0) design.model.oci.resources.dhcp_options = results[queries.indexOf(listDhcpOptions)].value
                    // Internet Gateways
                    // @ts-ignore
                    if (results[queries.indexOf(listInternetGateways)].status === 'fulfilled' && results[queries.indexOf(listInternetGateways)].value.length > 0) design.model.oci.resources.internet_gateway = results[queries.indexOf(listInternetGateways)].value
                    // NAT Gateways
                    // @ts-ignore
                    if (results[queries.indexOf(listNatGateways)].status === 'fulfilled' && results[queries.indexOf(listNatGateways)].value.length > 0) design.model.oci.resources.nat_gateway = results[queries.indexOf(listNatGateways)].value
                    // IPSec Connection
                    // @ts-ignore
                    if (results[queries.indexOf(listIPSecConnections)].status === 'fulfilled' && results[queries.indexOf(listIPSecConnections)].value.length > 0) design.model.oci.resources.ipsec = results[queries.indexOf(listIPSecConnections)].value
                    // DRG
                    // @ts-ignore
                    if (results[queries.indexOf(listDrgs)].status === 'fulfilled' && results[queries.indexOf(listDrgs)].value.length > 0) design.model.oci.resources.drg = results[queries.indexOf(listDrgs)].value
                    // DRG Attachment
                    // @ts-ignore
                    if (results[queries.indexOf(listDrgAttachments)].status === 'fulfilled' && results[queries.indexOf(listDrgAttachments)].value.length > 0) design.model.oci.resources.drg_attachment = results[queries.indexOf(listDrgAttachments)].value
                    // Service Gateway
                    // @ts-ignore
                    if (results[queries.indexOf(listServiceGateways)].status === 'fulfilled' && results[queries.indexOf(listServiceGateways)].value.length > 0) design.model.oci.resources.service_gateway = results[queries.indexOf(listServiceGateways)].value
                    // Local Peering Gateway
                    // @ts-ignore
                    if (results[queries.indexOf(listLocalPeeringGateways)].status === 'fulfilled' && results[queries.indexOf(listLocalPeeringGateways)].value.length > 0) design.model.oci.resources.local_peering_gateway = results[queries.indexOf(listLocalPeeringGateways)].value
                    // Remote Peering Connection
                    // @ts-ignore
                    if (results[queries.indexOf(listRemotePeeringConnections)].status === 'fulfilled' && results[queries.indexOf(listRemotePeeringConnections)].value.length > 0) design.model.oci.resources.remote_peering_connection = results[queries.indexOf(listRemotePeeringConnections)].value
                    // CPE
                    // @ts-ignore
                    if (results[queries.indexOf(listCpes)].status === 'fulfilled' && results[queries.indexOf(listCpes)].value.length > 0) design.model.oci.resources.cpe = results[queries.indexOf(listCpes)].value

                    /*
                    ** Storage
                    */
                    // Volumes
                    // @ts-ignore
                    if (results[queries.indexOf(listVolumes)].status === 'fulfilled' && results[queries.indexOf(listVolumes)].value.length > 0) design.model.oci.resources.volume = results[queries.indexOf(listVolumes)].value
                    // Boot Volumes
                    // @ts-ignore
                    if (results[queries.indexOf(listBootVolumes)].status === 'fulfilled' && results[queries.indexOf(listBootVolumes)].value.length > 0) design.model.oci.resources.boot_volume = results[queries.indexOf(listBootVolumes)].value
                    // File Systems
                    // @ts-ignore
                    if (results[queries.indexOf(listFileSystems)].status === 'fulfilled' && results[queries.indexOf(listFileSystems)].value.length > 0) design.model.oci.resources.file_system = results[queries.indexOf(listFileSystems)].value
                    // Mount Targets
                    // @ts-ignore
                    if (results[queries.indexOf(listMountTargets)].status === 'fulfilled' && results[queries.indexOf(listMountTargets)].value.length > 0) design.model.oci.resources.mount_target = results[queries.indexOf(listMountTargets)].value
                    // Buckets
                    // @ts-ignore
                    if (results[queries.indexOf(listBuckets)].status === 'fulfilled' && results[queries.indexOf(listBuckets)].value.length > 0) design.model.oci.resources.bucket = results[queries.indexOf(listBuckets)].value

                    /*
                    ** Infrastructure
                    */
                    // Instances
                    // @ts-ignore
                    if (results[queries.indexOf(listInstances)].status === 'fulfilled' && results[queries.indexOf(listInstances)].value.length > 0) {
                        // @ts-ignore
                        design.model.oci.resources.instance = results[queries.indexOf(listInstances)].value
                        design.model.oci.resources.instance.forEach((i) => i.sourceDetails.sourceId = computeImages.find((ci: Record<string, any>) => ci.ocid === i.sourceDetails.imageId)?.id)
                    }
                    // @ts-ignore
                    // const vnicAttachments = results[queries.indexOf(listVnicAttachments)].status === 'fulfilled' ? results[queries.indexOf(listVnicAttachments)].value : []
                    if (results[queries.indexOf(listVnicAttachments)].status === 'fulfilled' && results[queries.indexOf(listVnicAttachments)].value.length > 0) design.model.oci.resources.vnic_attachment = results[queries.indexOf(listVnicAttachments)].value
                    // @ts-ignore
                    // const volumeAttachments = results[queries.indexOf(listVolumeAttachments)].status === 'fulfilled' ? results[queries.indexOf(listVolumeAttachments)].value : []
                    if (results[queries.indexOf(listVolumeAttachments)].status === 'fulfilled' && results[queries.indexOf(listVolumeAttachments)].value.length > 0) design.model.oci.resources.volume_attachment = results[queries.indexOf(listVolumeAttachments)].value
                    // @ts-ignore
                    if (results[queries.indexOf(listBootVolumeAttachments)].status === 'fulfilled' && results[queries.indexOf(listBootVolumeAttachments)].value.length > 0) design.model.oci.resources.boot_volume_attachment = results[queries.indexOf(listBootVolumeAttachments)].value
                    // Set Primaty Vnic
                    if (design.model.oci.resources.vnic_attachment) {
                        design.model.oci.resources.instance.forEach((i) => {
                            const primaryVnicAttachment: OciModelResources.OciVnicAttachment = design.model.oci.resources.vnic_attachment.find((v: OciModelResources.OciVnicAttachment) => v.instanceId === i.id && v.lifecycleState === 'ATTACHED' && v.vnic && v.vnic.isPrimary)
                            //.map((v: OciModelResources.OciVnicAttachment) => v.vnic)
                            if (primaryVnicAttachment ) {
                                const primaryVnic = primaryVnicAttachment.vnic
                                i.createVnicDetails = {
                                    assignPublicIp: (primaryVnic.publicIp && primaryVnic.publicIp !== ''),
                                    hostnameLabel: primaryVnic.hostnameLabel,
                                    nsgIds: primaryVnic.nsgIds,
                                    skipSourceDestCheck: primaryVnic.skipSourceDestCheck,
                                    subnetId: primaryVnic.subnetId
                                }
                            }
                        })
                    }
                    // Load Balancers
                    // @ts-ignore
                    if (results[queries.indexOf(listLoadBalancers)].status === 'fulfilled' && results[queries.indexOf(listLoadBalancers)].value.length > 0) design.model.oci.resources.load_balancer = results[queries.indexOf(listLoadBalancers)].value
                    if (design.model.oci.resources.load_balancer && design.model.oci.resources.load_balancer.length > 0) this.processLoadBalancers(design)
                    // if (design.model.oci.resources.load_balancer && design.model.oci.resources.load_balancer.length > 0) {
                    //     // Create Backend Sets
                    //     design.model.oci.resources.load_balancer_backend_set = design.model.oci.resources.load_balancer.map((l: OciModelResources.OciLoadBalancer) => Object.values(l.backendSets as OciModelResources.OciLoadBalancerBackendSet[]).map((b) => {
                    //         return {...b, 
                    //             id: l.id.replace('loadbalancer', 'load_balancer_backend_set'), 
                    //             compartmentId: l.compartmentId, 
                    //             displayName: b.name, 
                    //             loadBalancerId: l.id, 
                    //             lifecycleState: l.lifecycleState
                    //         }
                    //     })).flat()
                    //     // Create Backends
                    //     design.model.oci.resources.load_balancer_backend = design.model.oci.resources.load_balancer_backend_set.map((bs) => Object.values(bs.backends as OciModelResources.OciLoadBalancerBackend[]).map((b) => {
                    //         const vnicAttachments = design.model.oci.resources.vnic_attachment ? design.model.oci.resources.vnic_attachment : []
                    //         const vnicAttachment = vnicAttachments.find((v) => v.privateIp && v.privateIp.ipAddress === b.ipAddress)
                    //         const instanceId = vnicAttachment ? vnicAttachment.instanceId : ''
                    //         // const instanceId = design.model.oci.resources.vnic_attachment ? design.model.oci.resources.vnic_attachment.find((v) => v.privateIp && v.privateIp.ipAddress === b.ipAddress).instanceId : ''
                    //         return {...b,

                    //             id: bs.id.replace('load_balancer_backend_set', 'load_balancer_backend'), 
                    //             compartmentId: bs.compartmentId, 
                    //             displayName: b.name, 
                    //             backendSetId: bs.id,
                    //             backendsetName: bs.name,
                    //             loadBalancerId: bs.loadBalancerId, 
                    //             instanceId: instanceId,
                    //             lifecycleState: bs.lifecycleState
                    //         }
                    //     })).flat()
                    //     // Create Listeners
                    //     design.model.oci.resources.load_balancer_listener = design.model.oci.resources.load_balancer.map((l: OciModelResources.OciLoadBalancer) => (Object.values(l.listeners as OciModelResources.OciLoadBalancerListener[])).map((listener) => {
                    //         return {...listener, 
                    //             id: l.id.replace('loadbalancer', 'load_balancer_listener'), 
                    //             compartmentId: l.compartmentId, 
                    //             displayName: listener.name, 
                    //             defaultBackendSetName: design.model.oci.resources.load_balancer_backend_set.find((b) => b.loadBalancerId === l.id && b.displayName === listener.defaultBackendSetName)?.id,
                    //             loadBalancerId: l.id, 
                    //             lifecycleState: l.lifecycleState
                    //         }
                    //     })).flat()
                    //     design.model.oci.resources.load_balancer.forEach((l) => {
                    //         delete l.backendSets
                    //         delete l.listeners
                    //     })
                    //     // logger.debug('Load Balancer Backend Sets:', design.model.oci.resources.load_balancer_backend_set)
                    //     // logger.debug('Load Balancer Backends:', design.model.oci.resources.load_balancer_backend)
                    // }
                    // Network Load Balancers
                    // @ts-ignore
                    if (results[queries.indexOf(listNetworkLoadBalancers)].status === 'fulfilled' && results[queries.indexOf(listNetworkLoadBalancers)].value.length > 0) design.model.oci.resources.network_load_balancer = results[queries.indexOf(listNetworkLoadBalancers)].value
                    // Analytics Instance
                    // @ts-ignore
                    if (results[queries.indexOf(listAnalyticsInstances)].status === 'fulfilled' && results[queries.indexOf(listAnalyticsInstances)].value.length > 0) design.model.oci.resources.analytics_instance = results[queries.indexOf(listAnalyticsInstances)].value

                    /*
                    ** Databases
                    */
                    // Autonomous Database
                    // @ts-ignore
                    if (results[queries.indexOf(listAutonomousDatabases)].status === 'fulfilled' && results[queries.indexOf(listAutonomousDatabases)].value.length > 0) design.model.oci.resources.autonomous_database = results[queries.indexOf(listAutonomousDatabases)].value
                    // DB System
                    // @ts-ignore
                    if (results[queries.indexOf(listDatabaseSystems)].status === 'fulfilled' && results[queries.indexOf(listDatabaseSystems)].value.length > 0) design.model.oci.resources.db_system = results[queries.indexOf(listDatabaseSystems)].value
                    // MySQL DB System
                    // @ts-ignore
                    if (results[queries.indexOf(listMySqlDatabaseSystems)].status === 'fulfilled' && results[queries.indexOf(listMySqlDatabaseSystems)].value.length > 0) design.model.oci.resources.mysql_db_system = results[queries.indexOf(listMySqlDatabaseSystems)].value
                    // NoSQL DB System
                    // @ts-ignore
                    if (results[queries.indexOf(listNoSqlTables)].status === 'fulfilled' && results[queries.indexOf(listNoSqlTables)].value.length > 0) design.model.oci.resources.nosql_table = results[queries.indexOf(listNoSqlTables)].value
                    // @ts-ignore
                    // const nosql_indexes = results[queries.indexOf(listNoSqlTables)].status === 'fulfilled' ? results[queries.indexOf(listNoSqlIndexes)].value : []

                    /*
                    ** Identity
                    */
                    // Bastion
                    // @ts-ignore
                    if (results[queries.indexOf(listBastions)].status === 'fulfilled' && results[queries.indexOf(listBastions)].value.length > 0) design.model.oci.resources.bastion = results[queries.indexOf(listBastions)].value
                    // Vault
                    // @ts-ignore
                    if (results[queries.indexOf(listVaults)].status === 'fulfilled' && results[queries.indexOf(listVaults)].value.length > 0) design.model.oci.resources.vault = results[queries.indexOf(listVaults)].value
                    // Key
                    // @ts-ignore
                    if (results[queries.indexOf(listKeys)].status === 'fulfilled' && results[queries.indexOf(listKeys)].value.length > 0) design.model.oci.resources.key = results[queries.indexOf(listKeys)].value
                    // Secret
                    // @ts-ignore
                    if (results[queries.indexOf(listSecrets)].status === 'fulfilled' && results[queries.indexOf(listSecrets)].value.length > 0) design.model.oci.resources.secret = results[queries.indexOf(listSecrets)].value
                    // Dynamic Group
                    // @ts-ignore
                    if (results[queries.indexOf(listDynamicGroups)].status === 'fulfilled' && results[queries.indexOf(listDynamicGroups)].value.length > 0) design.model.oci.resources.dynamic_group = results[queries.indexOf(listDynamicGroups)].value.map((r) => {return {...r, displayName: r.name}})
                    // Policy
                    // @ts-ignore
                    if (results[queries.indexOf(listPolicies)].status === 'fulfilled' && results[queries.indexOf(listPolicies)].value.length > 0) design.model.oci.resources.policy = results[queries.indexOf(listPolicies)].value

                    // logger.debug('queryTenancy:', JSON.stringify(design, null, 4))
                    const filteredResources: OciResources = {}
                    Object.keys(design.model.oci.resources).forEach((k) => filteredResources[k] = design.model.oci.resources[k].filter((r) => this.lifecycleStates.includes(r.lifecycleState) || r.lifecycleState === undefined))
                    design.model.oci.resources = filteredResources
                    this.postQuery(design).then((results) => {
                        // Surface partial discovery failures alongside the design without mutating the
                        // existing OcdDesign shape: queryErrors is an additive field carrying any
                        // per-query rejections (403s, throttling) recorded during this run (issue OBS-01).
                        if (this.queryFailures.length > 0) runLogger.warn('queryTenancy: completed with', this.queryFailures.length, 'partial query failure(s)')
                        resolve({ ...design, queryErrors: [...this.queryFailures] })
                    }).catch((reason) => {
                        runLogger.error(reason)
                        reject(reason)
                    })
                    // resolve(design)
                }).catch((reason) => {
                    runLogger.error(reason)
                    reject(reason)
                })
            }).catch((reason) => {
                // Without this catch a rejection from listTenancyCompartments (e.g. auth /
                // permission / unreachable region failure) would leave the outer Promise
                // unsettled, causing the renderer spinner to hang forever (issue #741).
                runLogger.error('queryTenancy: listTenancyCompartments failed', reason)
                reject(reason)
            })
        })
        return queryRun.then(
            (result) => {
                OcdMetrics.counter('oci.query.tenancy.success')
                return result
            },
            (error) => {
                OcdMetrics.counter('oci.query.tenancy.failure')
                throw error
            },
        ).finally(() => { queryTimer.stop() })
    }

    postQuery(design: OcdDesign): Promise<any> {
        const resources = design.model.oci.resources
        const missingImageIds = resources.instance !== undefined ? resources.instance.filter((i) => i.sourceDetails.sourceId === undefined).map((i) => i.sourceDetails.imageId) : []
        const hiddenImages = this.getHiddenImages(missingImageIds)
        const queries = [
            hiddenImages
        ]
        return new Promise((resolve, reject) => {
            Promise.allSettled(queries).then((results) => {
                /*
                ** Infrastructure
                */
                // Instances
                // @ts-ignore
                if (results[queries.indexOf(hiddenImages)].status === 'fulfilled' && results[queries.indexOf(hiddenImages)].value.length > 0) {
                    // @ts-ignore
                    const images: Record<string, any>[] = results[queries.indexOf(hiddenImages)].value
                    // @ts-ignore
                    design.model.oci.resources.instance.forEach((i) => {
                        if (i.sourceDetails.sourceId === undefined) i.sourceDetails.sourceId = images.find((ci: Record<string, any>) => ci.ocid === i.sourceDetails.imageId)?.id
                    })
                    // Do not log per-instance image/source ids (OCID-bearing); log the count only.
                    logger.debug('Instance Image source ids resolved for', design.model.oci.resources.instance.length, 'instance(s)')
                }

                resolve(design)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
                 
        })
       }

    getHiddenImages(imageIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const queries = runWithConcurrency(imageIds.map((id) => () => this.getImage(id)), QUERY_CONCURRENCY_LIMIT)
            Promise.allSettled(queries).then((results) => {
                const images = this.collectSettled(results, 'getHiddenImages', (value) => [value])
                // Do not log the settled results (image payloads carry OCIDs); log counts only.
                logger.debug('getHiddenImages: All Settled,', images.length, 'of', results.length, 'fulfilled')
                resolve(images)
            })
        })
    }

    listRegions(): Promise<any> {
        return new Promise((resolve, reject) => {
            // if (!this.identityClient) this.identityClient = new identity.IdentityClient({ authenticationDetailsProvider: this.provider })
            const listRegionSubscriptionsRequest: identity.requests.ListRegionSubscriptionsRequest = {tenancyId: this.provider.getTenantId()}
            const listRegionsRequest: identity.requests.ListRegionsRequest = {}
            const regionSubscriptionsQuery = this.identityClient.listRegionSubscriptions(listRegionSubscriptionsRequest)
            const regionsQuery = this.identityClient.listRegions(listRegionsRequest)
            Promise.allSettled([regionSubscriptionsQuery, regionsQuery]).then((results) => {
                // @ts-ignore 
                const sorter = (a, b) => a.displayName.localeCompare(b.displayName)
                if (results[0].status === 'fulfilled') {
                    // logger.debug('listRegions: Tenancy has List Region Subscriptions', JSON.stringify(results[0].value, null, 2))
                    const resources = results[0].value.items.map((r) => {return {id: r.regionName, displayName: this.regionNameToDisplayName(r.regionName as string), ...r}}).sort(sorter).reverse()
                    // logger.debug('listRegions: Tenancy has List Region Subscriptions', JSON.stringify(resources, null, 2))
                    // When using against a C3 the call will return a subscription list but does not include the correct region specified in the config so we will add it.
                    resolve([...resources.find((r) => r.id === this.provider.getRegion().regionId) === undefined ? [{id: this.provider.getRegion().regionId, displayName: this.provider.getRegion().regionId}] : [], ...resources])
                    // resolve(resources)
                // } else if (results[1].status === 'fulfilled') {
                //     logger.debug('listRegions: Tenancy does not have List Region Subscriptions', JSON.stringify(results[1].value, null, 2))
                //     const resources = results[1].value.items.map((r) => {return {id: r.key, displayName: this.regionNameToDisplayName(r.key as string), ...r}}).sort(sorter).reverse()
                //     resolve(resources)
                } else {
                    logger.debug('listRegions: Tenancy has neither List Region Subscriptions or List Regions')
                    // Do not log the raw response payload; log the item count only.
                    if (results[1].status === 'fulfilled') logger.debug('listRegions: Tenancy does not have List Region Subscriptions,', results[1].value.items?.length ?? 0, 'region(s) listed')
                    const resources = [{id: this.provider.getRegion().regionId, displayName: this.provider.getRegion().regionId}]
                    resolve(resources)
                    // reject('Regions Query Failed')
                }
            })
        })
    }

    // List Function to retrieve most information

    listAnalyticsInstances(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listAnalyticsInstances', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.analyticsClient.listAnalyticsInstances(r))
    }

    listAutonomousDatabases(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listAutonomousDatabases', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.databaseClient.listAutonomousDatabases(r))
    }

    listAvailabilityDomains(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listAvailabilityDomains', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.identityClient.listAvailabilityDomains(r))
    }

    listBastions(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listBastions', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.bastionClient.listBastions(r))
    }

    listBuckets(compartmentIds: string[]): Promise<any> {
        return this.getObjectStorageNamespace().then((namespace) =>
            this.listByCompartment('listBuckets', compartmentIds,
                (id) => ({ compartmentId: id, namespaceName: namespace.value }),
                (r) => this.objectStorageClient.listBuckets(r)))
    }

    listCpes(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listCpes', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listCpes(r))
    }

    listDatabaseSystems(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listDatabaseSystems', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.databaseClient.listDbSystems(r))
    }

    listDhcpOptions(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listDhcpOptions', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listDhcpOptions(r))
    }

    listDrgs(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listDrgs', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listDrgs(r))
    }

    listDrgAttachments(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listDrgAttachments', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listDrgAttachments(r))
    }

    listDynamicGroups(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listDynamicGroups', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.identityClient.listDynamicGroups(r))
    }

    iterateDynamicGroups(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: identity.requests.ListDynamicGroupsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const iterators = requests.map((r) => this.identityClient.listDynamicGroupsResponseIterator(r))
            const queries = runWithConcurrency(iterators.map((i) => withRetry(() => this.getAllResponseData(i))), QUERY_CONCURRENCY_LIMIT)
            // const queries = requests.map((r) => this.identityClient.listDynamicGroups(r))
            Promise.allSettled(queries).then((results) => {
                logger.debug('iterateDynamicGroups: All Settled')
                const resources = this.collectSettled(results, 'iterateDynamicGroups')
                resolve(resources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    listFileSystems(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.listAvailabilityDomains(compartmentIds.slice(0,1)).then((ads) => {
                const queries = ads.map((r: identity.models.AvailabilityDomain) => this.listFileSystemsByAvailabilityDomain(compartmentIds, r.name as string))
                Promise.allSettled(queries).then((results) => {
                    logger.debug('listFileSystems: All Settled')
                    const resources = this.collectSettled(results, 'listFileSystems', (value) => value)
                    resolve(resources)
                }).catch((reason) => {
                    logger.error('listFileSystems:', reason)
                    reject(reason)
                })
            }).catch((reason) => {
                logger.error('listFileSystems:', reason)
                reject(reason)
            })
        })
    }

    listFileSystemsByAvailabilityDomain(compartmentIds: string[], availabilityDomain: string): Promise<any> {
        return this.listByCompartment('listFileSystemsByAvailabilityDomain', compartmentIds, (id) => ({ compartmentId: id, availabilityDomain: availabilityDomain }), (r) => this.fileStorageClient.listFileSystems(r))
    }

    listInstances(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listInstances', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.computeClient.listInstances(r))
    }

    listInternetGateways(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listInternetGateways', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listInternetGateways(r))
    }

    listIPSecConnections(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listIPSecConnections', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listIPSecConnections(r))
    }

    // Local Peering Gateways
    iterateLocalPeeringGateways(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListLocalPeeringGatewaysRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const iterators = requests.map((r) => this.vcnClient.listLocalPeeringGatewaysResponseIterator(r))
            const queries = runWithConcurrency(iterators.map((i) => withRetry(() => this.getAllResponseData(i))), QUERY_CONCURRENCY_LIMIT)
            // const queries = requests.map((r) => this.identityClient.listDynamicGroups(r))
            Promise.allSettled(queries).then((results) => {
                logger.debug('iterateLocalPeeringGateways: All Settled')
                const resources = this.collectSettled(results, 'iterateLocalPeeringGateways')
                resolve(resources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    listLocalPeeringGateways(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listLocalPeeringGateways', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listLocalPeeringGateways(r))
    }

    // Keys
    listKeys(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listKeys', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.kmsManagementClient.listKeys(r))
    }

    listLoadBalancers(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listLoadBalancers', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.loadbalancerClient.listLoadBalancers(r))
    }

    processLoadBalancers(design: OcdDesign) {
        if (design.model.oci.resources.load_balancer && design.model.oci.resources.load_balancer.length > 0) {
            // Create Backend Sets
            design.model.oci.resources.load_balancer_backend_set = design.model.oci.resources.load_balancer.map((l: OciModelResources.OciLoadBalancer) => Object.values(l.backendSets as OciModelResources.OciLoadBalancerBackendSet[]).map((b) => {
                return {...b, 
                    id: l.id.replace('loadbalancer', 'load_balancer_backend_set'), 
                    compartmentId: l.compartmentId, 
                    displayName: b.name, 
                    loadBalancerId: l.id, 
                    lifecycleState: l.lifecycleState
                }
            })).flat()
            // Create Backends
            design.model.oci.resources.load_balancer_backend = design.model.oci.resources.load_balancer_backend_set.map((bs) => Object.values(bs.backends as OciModelResources.OciLoadBalancerBackend[]).map((b) => {
                const vnicAttachments = design.model.oci.resources.vnic_attachment ? design.model.oci.resources.vnic_attachment : []
                const vnicAttachment = vnicAttachments.find((v) => v.privateIp && v.privateIp.ipAddress === b.ipAddress)
                const instanceId = vnicAttachment ? vnicAttachment.instanceId : ''
                // const instanceId = design.model.oci.resources.vnic_attachment ? design.model.oci.resources.vnic_attachment.find((v) => v.privateIp && v.privateIp.ipAddress === b.ipAddress).instanceId : ''
                return {...b,

                    id: bs.id.replace('load_balancer_backend_set', 'load_balancer_backend'), 
                    compartmentId: bs.compartmentId, 
                    displayName: b.name, 
                    backendSetId: bs.id,
                    backendsetName: bs.name,
                    loadBalancerId: bs.loadBalancerId, 
                    instanceId: instanceId,
                    lifecycleState: bs.lifecycleState
                }
            })).flat()
            // Create Listeners
            design.model.oci.resources.load_balancer_listener = design.model.oci.resources.load_balancer.map((l: OciModelResources.OciLoadBalancer) => (Object.values(l.listeners as OciModelResources.OciLoadBalancerListener[])).map((listener) => {
                return {...listener, 
                    id: l.id.replace('loadbalancer', 'load_balancer_listener'), 
                    compartmentId: l.compartmentId, 
                    displayName: listener.name, 
                    defaultBackendSetName: design.model.oci.resources.load_balancer_backend_set.find((b) => b.loadBalancerId === l.id && b.displayName === listener.defaultBackendSetName)?.id,
                    loadBalancerId: l.id, 
                    lifecycleState: l.lifecycleState
                }
            })).flat()
            design.model.oci.resources.load_balancer.forEach((l) => {
                delete l.backendSets
                delete l.listeners
            })
            // logger.debug('Load Balancer Backend Sets:', design.model.oci.resources.load_balancer_backend_set)
            // logger.debug('Load Balancer Backends:', design.model.oci.resources.load_balancer_backend)
        }
    }

    listMountTargets(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.listAvailabilityDomains(compartmentIds.slice(0,1)).then((ads) => {
                const queries = ads.map((r: identity.models.AvailabilityDomain) => this.listMountTargetsByAvailabilityDomain(compartmentIds, r.name as string))
                Promise.allSettled(queries).then((results) => {
                    logger.debug('listMountTargets: All Settled')
                    const resources = this.collectSettled(results, 'listMountTargets', (value) => value)
                    resolve(resources)
                }).catch((reason) => {
                    logger.error('listMountTargets:', reason)
                    reject(reason)
                })
            }).catch((reason) => {
                logger.error('listMountTargets:', reason)
                reject(reason)
            })
        })
    }

    listMountTargetsByAvailabilityDomain(compartmentIds: string[], availabilityDomain: string): Promise<any> {
        return this.listByCompartment('listMountTargetsByAvailabilityDomain', compartmentIds, (id) => ({ compartmentId: id, availabilityDomain: availabilityDomain }), (r) => this.fileStorageClient.listMountTargets(r))
    }

    listMySqlDatabaseSystems(compartmentIds: string[]): Promise<any> {
        // listByCompartment surfaces per-compartment failures (e.g. a missing `mysql-family`
        // read policy) via queryFailures instead of silently dropping them, which previously
        // made MySQL DB Systems look absent from the query results with no explanation (issue #543).
        return this.listByCompartment('listMySqlDatabaseSystems', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.mysqlClient.listDbSystems(r)).then((resources) => {
            logger.debug('listMySqlDatabaseSystems: retrieved', resources.length, 'MySQL DB System(s)')
            return resources
        })
    }

    listNatGateways(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listNatGateways', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listNatGateways(r))
    }

    listNetworkLoadBalancers(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listNetworkLoadBalancers', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.networkLoadbalancerClient.listNetworkLoadBalancers(r), (value) => value.networkLoadBalancerCollection.items ?? [])
    }

    listNetworkSecurityGroups(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListNetworkSecurityGroupsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = runWithConcurrency(requests.map((r) => withRetry(() => this.vcnClient.listNetworkSecurityGroups(r))), QUERY_CONCURRENCY_LIMIT)
            Promise.allSettled(queries).then((results) => {
                logger.debug('listNetworkSecurityGroups: All Settled')
                const resources = this.collectSettled<Record<string, any>>(results, 'listNetworkSecurityGroups')
                const nsgIds = resources.map(r => r.id)
                this.listNetworkSecurityGroupSecurityRules(nsgIds).then((response) => {
                    //@ts-ignore
                    // resources.forEach((r) => r.rules = response.filter((n) => r.id === n.nsgId))
                    response.forEach((r) => r.networkSecurityGroupId = r.nsgId)
                    resolve({groups: resources, rules: response})
                    // resolve(resources)
                })
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    listNetworkSecurityGroupSecurityRules(nsgIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListNetworkSecurityGroupSecurityRulesRequest[] = nsgIds.map((id) => {return {networkSecurityGroupId: id}})
            const queries = runWithConcurrency(requests.map((r) => withRetry(() => this.vcnClient.listNetworkSecurityGroupSecurityRules(r))), QUERY_CONCURRENCY_LIMIT)
            Promise.allSettled(queries).then((results) => {
                logger.debug('listNetworkSecurityGroupSecurityRules: All Settled')
                this.recordSettledFailures(results, 'listNetworkSecurityGroupSecurityRules')
                const resources = results
                    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
                    .reduce((a: any[], c, i) => [...a, ...c.value.items.map((s: Record<string, any>) => {return {...s, nsgId: nsgIds[i]}})], [])
                resolve(resources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    listNoSqlIndexes(tableIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: nosql.requests.ListIndexesRequest[] = tableIds.map((id) => {return {tableNameOrId: id}})
            const queries = runWithConcurrency(requests.map((r) => withRetry(() => this.nosqlClient.listIndexes(r))), QUERY_CONCURRENCY_LIMIT)
            Promise.allSettled(queries).then((results) => {
                logger.debug('listNoSqlIndexes: All Settled')
                this.recordSettledFailures(results, 'listNoSqlIndexes')
                const resources = results
                    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
                    .reduce((a: any[], c, i) => [...a, ...c.value.indexCollection.items.map((s: Record<string, any>) => {return {...s, tableId: tableIds[i]}})], [])
                resolve(resources)
            }).catch((reason) => {
                logger.error('listNoSqlIndexes:', reason)
                reject(reason)
            })
        })
    }

    listNoSqlTables(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: nosql.requests.ListTablesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = runWithConcurrency(requests.map((r) => withRetry(() => this.nosqlClient.listTables(r))), QUERY_CONCURRENCY_LIMIT)
            Promise.allSettled(queries).then((results) => {
                logger.debug('listNoSqlTables: All Settled')
                const resources = this.collectSettled<any, Record<string, any>>(results, 'listNoSqlTables', (value) => value.tableCollection.items)
                const tableIds = resources.map(r => r.id)
                this.listNoSqlIndexes(tableIds).then((response) => {
                    resolve(resources)
                    //@ts-ignore
                    resources.forEach((r) => r.indexes = response.filter((n) => r.id === n.tableId))
                }).catch((reason) => {
                    logger.error('listNoSqlTables:', reason)
                    reject(reason)
                })
            }).catch((reason) => {
                logger.error('listNoSqlTables:', reason)
                reject(reason)
            })
        })
    }

    // Policies
    listPolicies(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listPolicies', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.identityClient.listPolicies(r))
    }

    iteratePolicies(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: identity.requests.ListPoliciesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const iterators = requests.map((r) => this.identityClient.listPoliciesResponseIterator(r))
            const queries = runWithConcurrency(iterators.map((i) => withRetry(() => this.getAllResponseData(i))), QUERY_CONCURRENCY_LIMIT)
            // const queries = requests.map((r) => this.identityClient.listDynamicGroups(r))
            Promise.allSettled(queries).then((results) => {
                logger.debug('iteratePolicies: All Settled')
                const resources = this.collectSettled(results, 'iteratePolicies')
                resolve(resources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    // Private IPs
    listPrivateIps(vnicIds: string[]): Promise<any> {
        return this.listByCompartment('listPrivateIps', vnicIds, (id) => ({ vnicId: id }), (r) => this.vcnClient.listPrivateIps(r))
    }

    listRemotePeeringConnections(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listRemotePeeringConnections', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listRemotePeeringConnections(r))
    }

    listRouteTables(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listRouteTables', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listRouteTables(r))
    }

    listSecrets(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listSecrets', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vaultClient.listSecrets(r))
    }

    listSecurityLists(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listSecurityLists', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listSecurityLists(r))
    }

    listServiceGateways(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listServiceGateways', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listServiceGateways(r))
    }

    listSubnets(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listSubnets', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listSubnets(r))
    }

    listVaults(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listVaults', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.kmsVaultClient.listVaults(r))
    }

    listVcns(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listVCNs', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.vcnClient.listVcns(r))
    }

    listVnicAttachments(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListVnicAttachmentsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = runWithConcurrency(requests.map((r) => withRetry(() => this.computeClient.listVnicAttachments(r))), QUERY_CONCURRENCY_LIMIT)
            Promise.allSettled(queries).then((results) => {
                logger.debug('listVnicAttachments: All Settled')
                const resources = this.collectSettled<Record<string, any>>(results, 'listVnicAttachments')
                const vnicIds = resources.map(r => r.vnicId)
                const getVnics = this.getVnics(vnicIds)
                const listPrivateIps = this.listPrivateIps(vnicIds)
                const queries = [getVnics, listPrivateIps]
                Promise.allSettled(queries).then((response) => {
                    //@ts-ignore
                    if (response[queries.indexOf(getVnics)].status === 'fulfilled' && response[queries.indexOf(getVnics)].value.length > 0) resources.forEach((r) => r.vnic = response[queries.indexOf(getVnics)].value.find((v) => v.id === r.vnicId))
                    //@ts-ignore
                    if (response[queries.indexOf(listPrivateIps)].status === 'fulfilled' && response[queries.indexOf(listPrivateIps)].value.length > 0) resources.forEach((r) => r.privateIp = response[queries.indexOf(listPrivateIps)].value.find((v) => v.vnicId === r.vnicId))
                    logger.debug('listVnicAttachments: All Settled')
                    resolve(resources)
                })
                // resolve(resources)
            }).catch((reason) => {
                logger.error(reason)
                reject(reason)
            })
        })
    }

    listVolumeAttachments(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listVolumeAttachments', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.computeClient.listVolumeAttachments(r))
    }

    listBootVolumeAttachments(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.listAvailabilityDomains(compartmentIds.slice(0,1)).then((ads) => {
                const queries = ads.map((r: identity.models.AvailabilityDomain) => this.listBootVolumeAttachmentsByAvailabilityDomain(compartmentIds, r.name as string))
                Promise.allSettled(queries).then((results) => {
                    logger.debug('listBootVolumeAttachments: All Settled')
                    const resources = this.collectSettled(results, 'listBootVolumeAttachments', (value) => value)
                    resolve(resources)
                }).catch((reason) => {
                    logger.error('listBootVolumeAttachments:', reason)
                    reject(reason)
                })
            }).catch((reason) => {
                logger.error('listBootVolumeAttachments:', reason)
                reject(reason)
            })
        })
    }

    listBootVolumeAttachmentsByAvailabilityDomain(compartmentIds: string[], availabilityDomain: string): Promise<any> {
        return this.listByCompartment('listBootVolumeAttachmentsByAvailabilityDomain', compartmentIds, (id) => ({ compartmentId: id, availabilityDomain: availabilityDomain }), (r) => this.computeClient.listBootVolumeAttachments(r))
    }

    listVolumes(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listVolumes', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.blockstorageClient.listVolumes(r))
    }

    listBootVolumes(compartmentIds: string[]): Promise<any> {
        return this.listByCompartment('listBootVolumes', compartmentIds, (id) => ({ compartmentId: id }), (r) => this.blockstorageClient.listBootVolumes(r))
    }

    // Get Function to retrieve specific information missed in the list or where list does not exist.

    getObjectStorageNamespace() : Promise<any> {
        const request: objectstorage.requests.GetNamespaceRequest = {}
        return this.objectStorageClient.getNamespace(request)
    }

    getVnics(vnicIds: string[]): Promise<any> {
        return this.listByCompartment('getVnics', vnicIds, (id) => ({ vnicId: id }), (r) => this.vcnClient.getVnic(r), (value) => [value.vnic]).then((resources) => resources.sort((r: Record<string, any>) => r.isPrimary))
    }

    template(compartmentIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            reject('Not Implemented')
        })
    }

}

export default OciQuery
// module.exports = { OciQuery }
function query() {
    throw new Error('Function not implemented.')
}

