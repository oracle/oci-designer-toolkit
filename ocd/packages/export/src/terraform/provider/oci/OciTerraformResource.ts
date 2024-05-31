/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdTerraformResource from "../../OcdTerraformResource"
import { OciModelResources as Model, OciResource } from '@ocd/model'

export class OciTerraformResource extends OcdTerraformResource {
    typeDisplayNameMap: Record<string, string> = {
        Compartment: 'name',
        DynamicGroup: 'name',
        Group: 'name',
        LoadBalancerBackendSet: 'name',
        LoadBalancerListener: 'name',
        User: 'name'
    }
    isIgnoreCompartmentId: boolean
    isHomeRegion: boolean
    simpleCacheAttributes = [
        'autonomousDbVersions', 
        'dbSystemShapes',
        'dbVersions',
        'loadbalancerShapes', 
        'listLoadbalancerProtocols',
        'shapes'
    ]
    lookupCacheAttributes = [
        'cpeDeviceShapes', 
        'images',
        "serviceGatewayServices"
    ]
    constructor(idTFResourceMap={}, isHomeRegion: boolean = false, isIgnoreCompartmentId: boolean = false) {
        super(idTFResourceMap)
        this.isHomeRegion = isHomeRegion
        this.isIgnoreCompartmentId = isIgnoreCompartmentId
    }
    commonAssignments = (resource: OciResource) => {
        // console.debug('OciTerraformResource:', resource, resource.resourceType, this.typeDisplayNameMap, this.typeDisplayNameMap.hasOwnProperty(resource.resourceType))
        return `${this.homeRegion()}
    ${this.compartmentId(resource)}
    ${this.displayName(resource)}
`
    }
    generateAdditionalResourceLocals(resource: OciResource) {
        return ''
    }
    generateAdditionalResource(resource: OciResource) {
        return ''
    }
    homeRegion = (): string => this.isHomeRegion ? 'provider       = oci.home_region' : ''
    compartmentId = (resource: Record<string, any>, level=0): string => {return this.isIgnoreCompartmentId ? '' : resource.compartmentId && resource.compartmentId !== '' ? this.generateReferenceAttribute("compartment_id", resource.compartmentId, true) : 'compartment_id = var.compartment_ocid'}
    displayName = (resource: Record<string, any>, level=0): string => {return this.generateTextAttribute(this.typeDisplayNameMap.hasOwnProperty(resource.resourceType) ? this.typeDisplayNameMap[resource.resourceType] : 'display_name', resource.displayName, true)}

    // Cache Look Ups
    generateCacheAttribute = (name: string, value: string | undefined, required: boolean, level=0, lookupResource=''): string => {
        if (this.simpleCacheAttributes.includes(lookupResource)) return this.generateTextAttribute(name, value, required, level)
        else if (this.lookupCacheAttributes.includes(lookupResource)) return this.generateCacheLookupAttribute(name, lookupResource.slice(0, -1), required, level)
        return `# Cache Attribute ${lookupResource} Simple/Lookup not specified`
    }

    // generateCacheLookupAttribute = (name: string, value: string | undefined, required: boolean, level=0): string => {
    //     if (this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
    //     else if (required) return `${this.indentation[level]}${name} = local.${this.terraformResourceName}_${name as string}_id`
    //     else if (value && value !== '') return `${this.indentation[level]}${name} = local.${this.terraformResourceName}_${name as string}_id`
    //     else return `${this.indentation[level]}# ${name} = "${value}"`
    // }
    generateCacheLookupAttribute = (name: string, value: string | undefined, required: boolean, level=0): string => {
        if (this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        else if (required) return `${this.indentation[level]}${name} = local.${this.terraformResourceName}_${value as string}_id`
        else if (value && value !== '') return `${this.indentation[level]}${name} = local.${this.terraformResourceName}_${value as string}_id`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }
    // Metadata / Cache - Dropdown Data Generation
    // Simple Text Replace Reference
    retrieveAutonomousDbVersionId = (): string => '' // Simple Text Replace Reference
    retrieveDbSystemShapeId = (): string => '' // Simple Text Replace Reference
    retrieveDbVersionId = (): string => '' // Simple Text Replace Reference
    retrieveListLoadbalancerProtocolId = (): string => '' // Simple Text Replace Reference
    retrieveLoadbalancerShapeId = (): string => '' // Simple Text Replace Reference
    retrieveRegionId = (): string => '' // Simple Text Replace Reference
    retrieveShapeId = (): string => '' // Simple Text Replace Reference
    // Id Lookups
    retrieveCpeDeviceShapeId = (): string => {return 'Method must be define in Resource class'}
    retrieveImageId = (): string => {return 'Method must be define in Resource class'}
    retrieveServiceGatewayServiceId = (): string => {return 'Method must be define in Resource class'}
    retrieveSnapshotPolicieId = (): string => {return 'Method must be define in Resource class'}
}

export default OciTerraformResource
