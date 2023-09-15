/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import * as common from 'oci-common'
import * as core from "oci-core"
import * as identity from "oci-identity"
import { OcdDesign, OciModelResources } from '@ocd/model'

export class OciQuery {
    profile
    provider
    identityClient: identity.IdentityClient
    vcnClient: core.VirtualNetworkClient
    computeClient: core.ComputeClient
    blockstorageClient: core.BlockstorageClient
    constructor(profile: string='DEFAULT', region?: string) {
        this.profile = profile
        this.provider = new common.ConfigFileAuthenticationDetailsProvider(undefined, profile)
        console.debug('OciQuery: Region', region)
        if (region) this.provider.setRegion(region)
        this.identityClient = new identity.IdentityClient({ authenticationDetailsProvider: this.provider })
        this.vcnClient = new core.VirtualNetworkClient({ authenticationDetailsProvider: this.provider })
        this.computeClient = new core.ComputeClient({ authenticationDetailsProvider: this.provider })
        this.blockstorageClient = new core.BlockstorageClient({ authenticationDetailsProvider: this.provider })
    }

    newDesign = () => OcdDesign.newDesign()

    regionNameToDisplayName = (name: string) => {
        const nameParts = name.split('-')
        const region = nameParts[0].toUpperCase()
        const city = `${nameParts[1].charAt(0).toUpperCase()}${nameParts[1].substring(1).toLowerCase()}`
        const displayName = `${region} ${city}`
        return displayName
    }

    listRegions(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.identityClient) this.identityClient = new identity.IdentityClient({ authenticationDetailsProvider: this.provider })
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

    listTenancyCompartments(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.identityClient) this.identityClient = new identity.IdentityClient({ authenticationDetailsProvider: this.provider })
            const listCompartmentsReq: identity.requests.ListCompartmentsRequest = {compartmentId: this.provider.getTenantId(), compartmentIdInSubtree: true}
            const compartmentQuery = this.identityClient.listCompartments(listCompartmentsReq)
            const getTenancy = this.getCompartments([this.provider.getTenantId()])
            Promise.allSettled([compartmentQuery, getTenancy]).then((results) => {
                if (results[0].status === 'fulfilled' && results[1].status === 'fulfilled') {
                    results[1].value[0].compartmentId = ''
                    const resources = [...results[1].value, ...results[0].value.items].map((c) => {return {...c, root: c.compartmentId === ''}})
                    resolve(resources)
                } else {
                    reject('All Compartments Query Failed')
                }
            })
        })
    }

    queryTenancy(compartmentIds: string[]): Promise<any> {
        console.debug('QciQuery: queryTenancy')
        return new Promise((resolve, reject) => {
            const design = this.newDesign()
            const getCompartments = this.getCompartments(compartmentIds)
            const listVcns = this.listVcns(compartmentIds)
            const listSubnets = this.listSubnets(compartmentIds)
            const listDhcpOptions = this.listDhcpOptions(compartmentIds)
            const listInternetGateways = this.listInternetGateways(compartmentIds)
            const listNatGateways = this.listNatGateways(compartmentIds)
            const listRouteTables = this.listRouteTables(compartmentIds)
            const listSecurityLists = this.listSecurityLists(compartmentIds)
            const listNetworkSecurityGroups = this.listNetworkSecurityGroups(compartmentIds)
            const listInstances = this.listInstances(compartmentIds)
            const listVnicAttachments = this.listVnicAttachments(compartmentIds)
            const listVolumeAttachments = this.listVolumeAttachments(compartmentIds)
            const listVolumes = this.listVolumes(compartmentIds)
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
                listVolumes
            ]
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: queryTenancy: All Settled')
                // Compartments
                // @ts-ignore
                design.model.oci.resources.compartment = results[queries.indexOf(getCompartments)].value
                // @ts-ignore
                design.view.pages[0].layers = design.model.oci.resources.compartment.map((c, i) => {return {id: c.id, class: 'oci-compartment', visible: true, selected: i === 0}})
                // VCNs
                // @ts-ignore
                design.model.oci.resources.vcn = results[queries.indexOf(listVcns)].value
                // Subnets
                // @ts-ignore
                design.model.oci.resources.subnet = results[queries.indexOf(listSubnets)].value
                // Route Tables
                // @ts-ignore
                design.model.oci.resources.route_table = results[queries.indexOf(listRouteTables)].value
                // Security Lists
                // @ts-ignore
                design.model.oci.resources.security_list = results[queries.indexOf(listSecurityLists)].value
                // Network Security Groups
                // @ts-ignore
                design.model.oci.resources.network_security_group = results[queries.indexOf(listNetworkSecurityGroups)].value
                // DHCP Options
                // @ts-ignore
                design.model.oci.resources.dhcp_options = results[queries.indexOf(listDhcpOptions)].value
                // Internet Gateways
                // @ts-ignore
                design.model.oci.resources.internet_gateway = results[queries.indexOf(listInternetGateways)].value
                // NAT Gateways
                // @ts-ignore
                design.model.oci.resources.nat_gateway = results[queries.indexOf(listNatGateways)].value
                // Volumes
                // @ts-ignore
                design.model.oci.resources.volume = results[queries.indexOf(listVolumes)].value
                // Instances
                // @ts-ignore
                const vnicAttachments = results[queries.indexOf(listVnicAttachments)].value
                // @ts-ignore
                const volumeAttachments = results[queries.indexOf(listVolumeAttachments)].value
                // @ts-ignore
                design.model.oci.resources.instance = results[queries.indexOf(listInstances)].value
                design.model.oci.resources.instance.forEach((i) => {
                    i.vnicAttachments = vnicAttachments.filter((v: OciModelResources.OciVnicAttachment) => v.instanceId === i.id).map((v: OciModelResources.OciVnicAttachment) => v.vnic)
                    i.volumeAttachments = volumeAttachments.filter((v: OciModelResources.OciVolumeAttachment) => v.instanceId === i.id)
                })
                // console.debug('OciQuery: queryTenancy:', JSON.stringify(design, null, 4))
                resolve(design)
            }).catch((reason) => {
                console.error(reason)
                reject(reason)
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
                    resources.forEach((r) => r.rules = response.filter((n) => r.id === n.nsgId))
                    resolve(resources)
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
                console.error(reason)
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

    listVnicAttachments(compartmentIds: string[], retryCount: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            const requests: core.requests.ListVnicAttachmentsRequest[] = compartmentIds.map((id) => {return {compartmentId: id}})
            const queries = requests.map((r) => this.computeClient.listVnicAttachments(r))
            Promise.allSettled(queries).then((results) => {
                console.debug('OciQuery: listVnicAttachments: All Settled')
                //@ts-ignore
                const resources = results.filter((r) => r.status === 'fulfilled').reduce((a, c) => [...a, ...c.value.items], []) as Record<string, any>[]
                const vnicIds = resources.map(r => r.vnicId)
                this.getVnics(vnicIds).then((response) => {
                    //@ts-ignore
                    resources.forEach((r) => r.vnic = response.find((v) => v.id === r.vnicId))
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
        })
    }

}

export default OciQuery
module.exports = { OciQuery }
