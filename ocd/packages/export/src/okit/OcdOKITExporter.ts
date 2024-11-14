/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OciResource } from "@ocd/model";
import OcdExporter from "../OcdExporter.js";

interface OkitDesign extends Record<string, any> {}
interface OkitResource extends Record<string, string | number | boolean> {}
interface OkitElement extends Record<string, string | number | boolean | Object> {}

class OcdOKITExporter extends OcdExporter {
    okitDesign: OkitDesign = {}
    export = (design: OcdDesign): string => {
        this.design = design
        this.exportMetaData()
        this.exportTags()
        this.exportUserDefined()
        this.exportResources()
        console.info('Exported Design', this.okitDesign)
        return JSON.stringify(this.okitDesign, null, 2)
    }

    exportMetaData = () => {
        this.okitDesign.metadata = {
            created: this.design.metadata.created,
            updated: this.design.metadata.updated,
            platform: this.design.metadata.platform
        }
        this.okitDesign.documentation = this.design.metadata.documentation
        this.okitDesign.title = this.design.metadata.title
    }

    exportTags = () => {
        if (this.design.model.oci.tags.freeformTags) this.okitDesign.freeform_tags = this.design.model.oci.tags.freeformTags
        if (this.design.model.oci.tags.definedTags) this.okitDesign.defined_tags = this.design.model.oci.tags.definedTags

    }

    exportUserDefined = () => {
        if (this.design.userDefined.terraform) this.okitDesign.user_defined.terraform = this.design.userDefined.terraform
        if (this.design.userDefined.ansible) this.okitDesign.user_defined.ansible = this.design.userDefined.ansible

    }
    exportResources = () => {
        const resourceMap: Record<string, any> = {
            dhcp_options: 'dhcp_options',
            vcn: 'virtual_cloud_networks'
        }
        Object.entries(this.design.model.oci.resources).filter(([k, v]) => Array.isArray(v)).forEach(([k, v]) => {
            const okitResourcesName = Object.hasOwn(resourceMap, k) ? resourceMap[k] : `${k}s`
            this.okitDesign[okitResourcesName] = v.map((r: OciResource) => this.convertResource(okitResourcesName, r))
        })
    }

    convertResource = (okitResourcesName: string, resource: OciResource ): OkitResource => {
        const okitResource: OkitResource = {}
        return this.convertObjectElement(resource, okitResource) as OciResource
    }

    convertObjectElement = (element: OkitElement, initialObject: OkitElement): OkitElement => {
        const keyMap: Record<string, any> = {
            terraformResourceName: 'resource_name',
            locked: 'read_only'
        }
        const directCopy: string[] = ['definedTags', 'freeformTags']
        const excludeElements = ['resourceType', 'resourceTypeName']
        return Object.entries(element).reduce((a: OkitElement, [k, v]) => {
            if (excludeElements.includes(k)) return a
            else if (typeof v === 'string') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = v
            else if (typeof v === 'number') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = v
            else if (typeof v === 'boolean') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = v
            else if (Array.isArray(v) && typeof v[0] === 'string') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = v
            else if (Array.isArray(v) && typeof v[0] === 'number') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = v
            else if (Array.isArray(v) && typeof v[0] === 'boolean') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = v
            else if (directCopy.includes(k)) a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = v
            // else if (typeof v === 'object') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = v
            else if (Array.isArray(v) && v[0] instanceof Object) a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = v.map((e) => this.convertObjectElement(e as OkitElement, {}))
            else if (Array.isArray(v)) a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = v
            else if (v instanceof Object) a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toUnderscoreCase(k)] = this.convertObjectElement(v as OkitElement, {})
            return a
        }, initialObject)
    }
}

export default OcdOKITExporter
export { OcdOKITExporter }
