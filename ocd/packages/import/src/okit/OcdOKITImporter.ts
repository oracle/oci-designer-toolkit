/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OciResource } from "@ocd/model";
import OcdImporter from "../OcdImporter.js";

interface OkitDesign extends Record<string, any> {}
interface OkitResource extends Record<string, string | number | boolean> {}
interface OkitElement extends Record<string, string | number | boolean | Object> {}

class OcdOKITImporter extends OcdImporter {
    okitDesign: OkitDesign = {}
    import = (source: string): OcdDesign => {
        this.okitDesign = JSON.parse(source)
        this.importMetaData()
        this.importTags()
        this.importUserDefined()
        this.importResources()
        this.addViewLayers()
        console.info('Imported Design', this.design)
        return this.design
    }

    importMetaData = () => {
        if (this.okitDesign.metadata.created) this.design.metadata.created = this.okitDesign.metadata.created
        if (this.okitDesign.metadata.updated) this.design.metadata.updated = this.okitDesign.metadata.updated
        if (this.okitDesign.metadata.platform) this.design.metadata.platform = this.okitDesign.metadata.platform
        if (this.okitDesign.documentation) this.design.metadata.documentation = this.okitDesign.documentation
        if (this.okitDesign.title) this.design.metadata.title = this.okitDesign.title
    }

    importTags = () => {
        if (this.okitDesign.freeform_tags) this.design.model.oci.tags.freeformTags = this.okitDesign.freeform_tags
        if (this.okitDesign.defined_tags) this.design.model.oci.tags.definedTags = this.okitDesign.defined_tags

    }

    importUserDefined = () => {
        if (this.okitDesign.user_defined.terraform) this.design.userDefined.terraform = this.okitDesign.user_defined.terraform
        if (this.okitDesign.user_defined.ansible) this.design.userDefined.ansible = this.okitDesign.user_defined.ansible

    }
    importResources = () => {
        const resourceMap: Record<string, any> = {
            dhcp_options: 'dhcp_options',
            virtual_cloud_networks: 'vcn'
        }
        Object.entries(this.okitDesign).filter(([k, v]) => Array.isArray(v)).forEach(([k, v]) => {
            const ocdModelName = Object.hasOwn(resourceMap, k) ? resourceMap[k] : k.slice(0, -1)
            this.design.model.oci.resources[ocdModelName] = v.map((r: OkitResource) => this.convertResource(ocdModelName, r))
        })
    }

    convertResource = (ocdModelName: string, resource: OkitResource ): OciResource => {
        const ociResource: OciResource = OciResource.newResource(ocdModelName)
        return this.convertObjectElement(resource, ociResource) as OciResource
    }

    convertObjectElement = (element: OkitElement, initialObject: OkitElement): OkitElement => {
        const keyMap: Record<string, any> = {
            resource_name: 'terraformResourceName',
            read_only: 'locked'
        }
        const directCopy: string[] = ['defined_tags', 'freeform_tags']
        return Object.entries(element).reduce((a: OkitElement, [k, v]) => {
            if (typeof v === 'string') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = v
            else if (typeof v === 'number') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = v
            else if (typeof v === 'boolean') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = v
            else if (Array.isArray(v) && typeof v[0] === 'string') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = v
            else if (Array.isArray(v) && typeof v[0] === 'number') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = v
            else if (Array.isArray(v) && typeof v[0] === 'boolean') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = v
            else if (directCopy.includes(k)) a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = v
            // else if (typeof v === 'object') a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = v
            else if (Array.isArray(v) && v[0] instanceof Object) a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = v.map((e) => this.convertObjectElement(e as OkitElement, {}))
            else if (Array.isArray(v)) a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = v
            else if (v instanceof Object) a[Object.hasOwn(keyMap, k) ? keyMap[k] : this.toCamelCase(k)] = this.convertObjectElement(v as OkitElement, {})
            return a
        }, initialObject)
    }

    addViewLayers = () => {
        this.design.view.pages[0].layers = this.design.model.oci.resources.compartment.map((r, i) => {return {class: 'oci-compartment', id: r.id, visible: true, selected: i === 0}})
    }
}

export default OcdOKITImporter
export { OcdOKITImporter }
