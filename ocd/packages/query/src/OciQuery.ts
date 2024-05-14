/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

// import * as common from 'oci-common'
// import * as core from "oci-core"
// import * as identity from "oci-identity"
import { OcdDesign, OciModelResources, OciResources } from '@ocd/model'
import { analytics, bastion, common, core, database, filestorage, identity, keymanagement, loadbalancer, mysql, networkloadbalancer, nosql, objectstorage, vault } from 'oci-sdk'
import { OciCommonQuery } from './OciQueryCommon'
import { OcdUtils } from '@ocd/core'
import { OciLoadBalancerBackend } from '@ocd/model/src/provider/oci/resources/generated/OciLoadBalancerBackend'
import { OciLoadBalancerBackendSet, OciLoadBalancerListener } from '@ocd/model/src/provider/oci/resources'

export class OciQuery extends OciCommonQuery {
    // Clients
    vcnClient: core.VirtualNetworkClient
    computeClient: core.ComputeClient
    blockstorageClient: core.BlockstorageClient
    bastionClient: bastion.BastionClient
    kmsManagementClient: keymanagement.KmsManagementClient
    kmsVaultClient: keymanagement.KmsVaultClient
    vaultClient: vault.VaultsClient
    analyticsClient: analytics.AnalyticsClient
    databaseClient: database.DatabaseClient
    objectStorageClient: objectstorage.ObjectStorageClient
    mysqlClient: mysql.DbSystemClient
    fileStorageClient: filestorage.FileStorageClient
    loadbalancerClient: loadbalancer.LoadBalancerClient
    networkLoadbalancerClient: networkloadbalancer.NetworkLoadBalancerClient
    nosqlClient: nosql.NosqlClient

    constructor(profile: string='DEFAULT', region?: string) {
        super(profile, region)
        console.debug('OciQuery: Region', region)
        // Initialise All Clients
        this.vcnClient = new core.VirtualNetworkClient(this.authenticationConfiguration, this.clientConfiguration)
        this.computeClient = new core.ComputeClient(this.authenticationConfiguration, this.clientConfiguration)
        this.blockstorageClient = new core.BlockstorageClient(this.authenticationConfiguration, this.clientConfiguration)
        this.bastionClient = new bastion.BastionClient(this.authenticationConfiguration, this.clientConfiguration)
        this.kmsVaultClient = new keymanagement.KmsVaultClient(this.authenticationConfiguration, this.clientConfiguration)
        this.kmsManagementClient = new keymanagement.KmsManagementClient(this.authenticationConfiguration, this.clientConfiguration)
        this.vaultClient = new vault.VaultsClient(this.authenticationConfiguration, this.clientConfiguration)
        this.analyticsClient = new analytics.AnalyticsClient(this.authenticationConfiguration, this.clientConfiguration)
        this.databaseClient = new database.DatabaseClient(this.authenticationConfiguration, this.clientConfiguration)
        this.objectStorageClient = new objectstorage.ObjectStorageClient(this.authenticationConfiguration, this.clientConfiguration)
        this.mysqlClient = new mysql.DbSystemClient(this.authenticationConfiguration, this.clientConfiguration)
        this.fileStorageClient = new filestorage.FileStorageClient(this.authenticationConfiguration, this.clientConfiguration)
        this.loadbalancerClient = new loadbalancer.LoadBalancerClient(this.authenticationConfiguration, this.clientConfiguration)
        this.networkLoadbalancerClient = new networkloadbalancer.NetworkLoadBalancerClient(this.authenticationConfiguration, this.clientConfiguration)
        this.nosqlClient = new nosql.NosqlClient(this.authenticationConfiguration, this.clientConfiguration)
    }

    newDesign = () => OcdDesign.newDesign()

    // Top Level functions to drive the query

    queryTenancy(compartmentIds: string[]): Promise<any> {
        console.debug('QciQuery: queryTenancy')
        return new Promise((resolve, reject) => {
            const design = this.newDesign()
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
                console.debug('OciQuery: queryTenancy: All Settled')
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
                if (results[queries.indexOf(listInstances)].status === 'fulfilled' && results[queries.indexOf(listInstances)].value.length > 0) design.model.oci.resources.instance = results[queries.indexOf(listInstances)].value
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
                        const primaryVnicAttachment: OciModelResources.OciVnicAttachment = design.model.oci.resources.vnic_attachment.find((v: OciModelResources.OciVnicAttachment) => v.instanceId === i.id && v.lifecycleState === 'ATTACHED' && v.vnic.isPrimary)
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
                if (design.model.oci.resources.load_balancer && design.model.oci.resources.load_balancer.length > 0) {
                    // Create Backend Sets
                    design.model.oci.resources.load_balancer_backend_set = design.model.oci.resources.load_balancer.map((l) => Object.values(l.backendSets as OciLoadBalancerBackendSet[]).map((b) => {
                        return {...b, 
                            id: l.id.replace('loadbalancer', 'load_balancer_backend_set'), 
                            compartmentId: l.compartmentId, 
                            displayName: b.name, 
                            loadBalancerId: l.id, 
                            lifecycleState: l.lifecycleState
                        }
                    })).flat()
                    // Create Backends
                    design.model.oci.resources.load_balancer_backend = design.model.oci.resources.load_balancer_backend_set.map((bs) => Object.values(bs.backends as OciLoadBalancerBackend[]).map((b) => {
                        const instanceId = design.model.oci.resources.vnic_attachment ? design.model.oci.resources.vnic_attachment.find((v) => v.privateIp && v.privateIp.ipAddress === b.ipAddress).instanceId : ''
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
                    design.model.oci.resources.load_balancer_listener = design.model.oci.resources.load_balancer.map((l) => (Object.values(l.listeners) as OciLoadBalancerListener[]).map((listener) => {
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
                        delete l.Listeners
                    })
                    // console.debug('OciQuery: Load Balancer Backend Sets:', design.model.oci.resources.load_balancer_backend_set)
                    // console.debug('OciQuery: Load Balancer Backends:', design.model.oci.resources.load_balancer_backend)
                }
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

                // console.debug('OciQuery: queryTenancy:', JSON.stringify(design, null, 4))
                const filteredResources: OciResources = {}
                Object.keys(design.model.oci.resources).forEach((k) => filteredResources[k] = design.model.oci.resources[k].filter((r) => this.lifecycleStates.includes(r.lifecycleState) || r.lifecycleState === undefined))
                design.model.oci.resources = filteredResources
                resolve(design)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listRegions(): Promise<any> {
        return new Promise((resolve, reject) => {
            // if (!this.identityClient) this.identityClient = new identity.IdentityClient({ authenticationDetailsProvider: this.provider })
            const listRegionsRequest: identity.requests.ListRegionSubscriptionsRequest = {tenancyId: this.provider.getTenantId()}
            const regionsQuery = this.identityClient.listRegionSubscriptions(listRegionsRequest)
            Promise.allSettled([regionsQuery]).then((results) => {
                // @ts-ignore 
                const sorter = (a, b) => a.displayName.localeCompare(b.displayName)
                if (results[0].status === 'fulfilled') {
                    const resources = results[0].value.items.map((r) => {return {id: r.regionName, displayName: this.regionNameToDisplayName(r.regionName as string), ...r}}).sort(sorter).reverse()
                    resolve(resources)
                } else {
                    reject('Regions Query Failed')
                }
            })
        })
    }

    // List Function to retrieve most information

    listAnalyticsInstances(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: analytics.requests.ListAnalyticsInstancesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.analyticsClient.listAnalyticsInstances(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listAnalyticsInstances: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listAnalyticsInstances:', reason)
                reject(reason)
            })
        })
    }

    listAutonomousDatabases(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: database.requests.ListAutonomousDatabasesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.databaseClient.listAutonomousDatabases(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listAutonomousDatabases: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listAutonomousDatabases:', reason)
                reject(reason)
            })
        })
    }

    listAvailabilityDomains(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: identity.requests.ListAvailabilityDomainsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.identityClient.listAvailabilityDomains(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listAvailabilityDomains: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listAvailabilityDomains:', reason)
                reject(reason)
            })
        })
    }

    listBastions(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: bastion.requests.ListBastionsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.bastionClient.listBastions(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listBastions: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listBuckets(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getObjectStorageNamespace().then((namespace) => {
                const requests: objectstorage.requests.ListBucketsRequest[] = compartmentIds.map((id) => {return {compartmentId: id, namespaceName: namespace.value}})
                const queries = requests.map((r) => this.objectStorageClient.listBuckets(r))
                Promise.allSettled(queries).then((results) => {
                    console.debug('OciQuery: listBuckets: All Settled')
                    //@ts-ignore
                    const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                    resolve(resources)
                }).catch((reason) => {
                    console.error(reason)
                    reject(reason)
                })
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listCpes(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListCpesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listCpes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listCpes: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listDatabaseSystems(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: database.requests.ListDbSystemsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.databaseClient.listDbSystems(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listDatabaseSystems: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listDhcpOptions(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListDhcpOptionsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listDhcpOptions(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listDhcpOptions: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listDrgs(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListDrgsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listDrgs(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listDrgs: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listDrgAttachments(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListDrgAttachmentsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listDrgAttachments(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listDrgAttachments: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listDrgAttachments:', reason)
                reject(reason)
            })
        })
    }

    listDynamicGroups(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: identity.requests.ListDynamicGroupsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.identityClient.listDynamicGroups(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listDynamicGroups: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    iterateDynamicGroups(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: identity.requests.ListDynamicGroupsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const iterators = requests.map((r) => this.identityClient.listDynamicGroupsResponseIterator(r))
            const queries = iterators.map((i) => this.getAllResponseData(i))
            // const queries = requests.map((r) => this.identityClient.listDynamicGroups(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: iterateDynamicGroups: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listFileSystems(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            this.listAvailabilityDomains(compartmentIds.slice(0,1)).then((ads) => {
                const queries = ads.map((r: identity.models.AvailabilityDomain) => this.listFileSystemsByAvailabilityDomain(compartmentIds, r.name as string))
                Promise.allSettled(queries).then((results) => {
                    console.debug('OciQuery: listFileSystems: All Settled')
                    //@ts-ignore
                    const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value], [])
                    resolve(resources)
                }).catch((reason) => {
                    console.error('OciQuery: listFileSystems:', reason)
                    reject(reason)
                })
            }).catch((reason) => {
                console.error('OciQuery: listFileSystems:', reason)
                reject(reason)
            })
        })
    }

    listFileSystemsByAvailabilityDomain(compartmentIds: string[], availabilityDomain: string, retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: filestorage.requests.ListFileSystemsRequest[] = compartmentIds.map((id) => {return {compartmentId: id, availabilityDomain: availabilityDomain}})
            const queries = requests.map((r) => this.fileStorageClient.listFileSystems(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listFileSystemsByAvailabilityDomain: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listFileSystemsByAvailabilityDomain:', reason)
                reject(reason)
            })
        })
    }

    listInstances(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListInstancesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.computeClient.listInstances(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listInstances: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listInternetGateways(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListInternetGatewaysRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listInternetGateways(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listInternetGateways: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listIPSecConnections(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListIPSecConnectionsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listIPSecConnections(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listIPSecConnections: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    // Local Peering Gateways
    iterateLocalPeeringGateways(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListLocalPeeringGatewaysRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const iterators = requests.map((r) => this.vcnClient.listLocalPeeringGatewaysResponseIterator(r))
            const queries = iterators.map((i) => this.getAllResponseData(i))
            // const queries = requests.map((r) => this.identityClient.listDynamicGroups(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: iterateLocalPeeringGateways: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listLocalPeeringGateways(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListLocalPeeringGatewaysRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listLocalPeeringGateways(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listLocalPeeringGateways: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    // Keys
    listKeys(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: keymanagement.requests.ListKeysRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.kmsManagementClient.listKeys(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listKeys: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listLoadBalancers(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: loadbalancer.requests.ListLoadBalancersRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.loadbalancerClient.listLoadBalancers(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listLoadBalancers: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listLoadBalancers:', reason)
                reject(reason)
            })
        })
    }

    listMountTargets(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            this.listAvailabilityDomains(compartmentIds.slice(0,1)).then((ads) => {
                const queries = ads.map((r: identity.models.AvailabilityDomain) => this.listMountTargetsByAvailabilityDomain(compartmentIds, r.name as string))
                Promise.allSettled(queries).then((results) => {
                    console.debug('OciQuery: listMountTargets: All Settled')
                    //@ts-ignore
                    const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value], [])
                    resolve(resources)
                }).catch((reason) => {
                    console.error('OciQuery: listMountTargets:', reason)
                    reject(reason)
                })
            }).catch((reason) => {
                console.error('OciQuery: listMountTargets:', reason)
                reject(reason)
            })
        })
    }

    listMountTargetsByAvailabilityDomain(compartmentIds: string[], availabilityDomain: string, retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: filestorage.requests.ListMountTargetsRequest[] = compartmentIds.map((id) => {return {compartmentId: id, availabilityDomain: availabilityDomain}})
            const queries = requests.map((r) => this.fileStorageClient.listMountTargets(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listMountTargetsByAvailabilityDomain: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listMountTargetsByAvailabilityDomain:', reason)
                reject(reason)
            })
        })
    }

    listMySqlDatabaseSystems(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: mysql.requests.ListDbSystemsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.mysqlClient.listDbSystems(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listMySqlDatabaseSystems: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listNatGateways(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListNatGatewaysRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listNatGateways(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listNatGateways: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listNetworkLoadBalancers(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: networkloadbalancer.requests.ListNetworkLoadBalancersRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.networkLoadbalancerClient.listNetworkLoadBalancers(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listNetworkLoadBalancers: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.networkLoadBalancerCollection.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listNetworkLoadBalancers:', reason)
                reject(reason)
            })
        })
    }

    listNetworkSecurityGroups(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListNetworkSecurityGroupsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listNetworkSecurityGroups(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listNetworkSecurityGroups: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []) as Record<string, any>[]
                const nsgIds = resources.map(r => r.id)
                this.listNetworkSecurityGroupSecurityRules(nsgIds).then((response) => {
                    //@ts-ignore
                    // resources.forEach((r) => r.rules = response.filter((n) => r.id === n.nsgId))
                    response.forEach((r) => r.networkSecurityGroupId = r.nsgId)
                    resolve({groups: resources, rules: response})
                    // resolve(resources)
                })
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listNetworkSecurityGroupSecurityRules(nsgIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListNetworkSecurityGroupSecurityRulesRequest[] = nsgIds.map((id) => {return {networkSecurityGroupId: id}})
            const queries = requests.map((r) => this.vcnClient.listNetworkSecurityGroupSecurityRules(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listNetworkSecurityGroupSecurityRules: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c, i) => [...a, ...c.value.items.map((s) => {return {...s, nsgId: nsgIds[i]}})], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listNoSqlIndexes(tableIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: nosql.requests.ListIndexesRequest[] = tableIds.map((id) => {return {tableNameOrId: id}})
            const queries = requests.map((r) => this.nosqlClient.listIndexes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listNoSqlIndexes: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c, i) => [...a, ...c.value.indexCollection.items.map((s) => {return {...s, tableId: tableIds[i]}})], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listNoSqlIndexes:', reason)
                reject(reason)
            })
        })
    }

    listNoSqlTables(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: nosql.requests.ListTablesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.nosqlClient.listTables(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listNoSqlTables: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.tableCollection.items], []) as Record<string, any>[]
                const tableIds = resources.map(r => r.id)
                this.listNoSqlIndexes(tableIds).then((response) => {
                    resolve(resources)
                    //@ts-ignore
                    resources.forEach((r) => r.indexes = response.filter((n) => r.id === n.tableId))
                }).catch((reason) => {
                    console.error('OciQuery: listNoSqlTables:', reason)
                    reject(reason)
                })
            }).catch((reason) => {
                console.error('OciQuery: listNoSqlTables:', reason)
                reject(reason)
            })
        })
    }

    // Policies
    listPolicies(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: identity.requests.ListPoliciesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.identityClient.listPolicies(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listPolicies: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    iteratePolicies(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: identity.requests.ListPoliciesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const iterators = requests.map((r) => this.identityClient.listPoliciesResponseIterator(r))
            const queries = iterators.map((i) => this.getAllResponseData(i))
            // const queries = requests.map((r) => this.identityClient.listDynamicGroups(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: iteratePolicies: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    // Private IPs
    listPrivateIps(vnicIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListPrivateIpsRequest[] = vnicIds.map((id) => {return {vnicId: id}})
            const queries = requests.map((r) => this.vcnClient.listPrivateIps(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listPrivateIps: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listRemotePeeringConnections(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListRemotePeeringConnectionsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listRemotePeeringConnections(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listRemotePeeringConnections: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listRemotePeeringConnections:', reason)
                reject(reason)
            })
        })
    }

    listRouteTables(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListRouteTablesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listRouteTables(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listRouteTables: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listSecrets(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: vault.requests.ListSecretsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vaultClient.listSecrets(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listSecrets: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listSecurityLists(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListSecurityListsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listSecurityLists(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listSecurityLists: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listSecurityLists:', reason)
                reject(reason)
            })
        })
    }

    listServiceGateways(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListServiceGatewaysRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listServiceGateways(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listServiceGateways: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listServiceGateways:', reason)
                reject(reason)
            })
        })
    }

    listSubnets(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListSubnetsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listSubnets(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listSubnets: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listVaults(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: keymanagement.requests.ListVaultsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.kmsVaultClient.listVaults(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listVaults: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listVcns(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListVcnsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.vcnClient.listVcns(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listVCNs: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listVnicAttachments(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListVnicAttachmentsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.computeClient.listVnicAttachments(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listVnicAttachments: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []) as Record<string, any>[]
                const vnicIds = resources.map(r => r.vnicId)
                const getVnics = this.getVnics(vnicIds)
                const listPrivateIps = this.listPrivateIps(vnicIds)
                const queries = [getVnics, listPrivateIps]
                // this.getVnics(vnicIds).then((response) => {
                //     //@ts-ignore
                //     resources.forEach((r) => r.vnic = response.find((v) => v.id === r.vnicId))
                //     resolve(resources)
                // })
                Promise.allSettled(queries).then((response) => {
                    //@ts-ignore
                    if (response[queries.indexOf(getVnics)].status === 'fulfilled' && response[queries.indexOf(getVnics)].value.length > 0) resources.forEach((r) => r.vnic = response[queries.indexOf(getVnics)].value.find((v) => v.id === r.vnicId))
                    //@ts-ignore
                    if (response[queries.indexOf(listPrivateIps)].status === 'fulfilled' && response[queries.indexOf(listPrivateIps)].value.length > 0) resources.forEach((r) => r.privateIp = response[queries.indexOf(listPrivateIps)].value.find((v) => v.vnicId === r.vnicId))
                    console.debug('OciQuery: listVnicAttachments: All Settled', resources)
                    resolve(resources)
                })
                // resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listVolumeAttachments(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListVolumeAttachmentsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.computeClient.listVolumeAttachments(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listVolumeAttachments: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    // listBootVolumeAttachments(compartmentIds: string[], retryCount: number = 0): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         const requests: core.requests.ListBootVolumeAttachmentsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
    //         const queries = requests.map((r) => this.computeClient.listBootVolumeAttachments(r))
    //         Promise.allSettled(queries).then((results) => {
    //             console.debug('OciQuery: listBootVolumeAttachments: All Settled')
    //             //@ts-ignore
    //             const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
    //             resolve(resources)
    //         }).catch((reason) => {
    //             console.error(reason)
    //             reject(reason)
    //         })
    //     })
    // }

    listBootVolumeAttachments(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            this.listAvailabilityDomains(compartmentIds.slice(0,1)).then((ads) => {
                const queries = ads.map((r: identity.models.AvailabilityDomain) => this.listBootVolumeAttachmentsByAvailabilityDomain(compartmentIds, r.name as string))
                Promise.allSettled(queries).then((results) => {
                    console.debug('OciQuery: listBootVolumeAttachments: All Settled')
                    //@ts-ignore
                    const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value], [])
                    resolve(resources)
                }).catch((reason) => {
                    console.error('OciQuery: listBootVolumeAttachments:', reason)
                    reject(reason)
                })
            }).catch((reason) => {
                console.error('OciQuery: listBootVolumeAttachments:', reason)
                reject(reason)
            })
        })
    }

    listBootVolumeAttachmentsByAvailabilityDomain(compartmentIds: string[], availabilityDomain: string, retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListBootVolumeAttachmentsRequest[] = compartmentIds.map((id) => {return {compartmentId: id, availabilityDomain: availabilityDomain}})
            const queries = requests.map((r) => this.computeClient.listBootVolumeAttachments(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listBootVolumeAttachmentsByAvailabilityDomain: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error('OciQuery: listBootVolumeAttachmentsByAvailabilityDomain:', reason)
                reject(reason)
            })
        })
    }

    listVolumes(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListVolumesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.blockstorageClient.listVolumes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listVolumes: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    listBootVolumes(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListBootVolumesRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.blockstorageClient.listBootVolumes(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listBootVolumes: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], [])
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    // Get Function to retrieve specific information missed in the list or where list does not exist.

    getObjectStorageNamespace() : Promise<any> {
        const request: objectstorage.requests.GetNamespaceRequest = {}
        return this.objectStorageClient.getNamespace(request)
    }

    getVnics(vnicIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.GetVnicRequest[] = vnicIds.map((id) => {return {vnicId: id}})
            const queries = requests.map((r) => this.vcnClient.getVnic(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: getVnics: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, c.value.vnic], []).sort(r => r.isPrimary)
                resolve(resources)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
            })
        })
    }

    template(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            reject('Not Implemented')
        })
    }

}

export default OciQuery
module.exports = { OciQuery }
function query() {
    throw new Error('Function not implemented.')
}

