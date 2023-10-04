/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResource } from '@ocd/model'
import { OcdUtils } from '@ocd/core'
import { OcdDocument } from '../OcdDocument'

export interface ResourcePropertyAttributes {
    provider: string
    key: string
    name: string
    type: string
    subtype: string
    required: boolean
    label: string
    id: string
    attributes?: {[key: string]: ResourcePropertyAttributes}
    staticLookup?: boolean
    lookup?: boolean
    lookupResource?: string
}

export type SimpleFilterType = (r: any) => boolean

export type ResourceFilterType = (r: any, resource: any) => boolean

export interface ResourceElementProperties extends Record<string, any> {
    pattern?: string
    min?: number
    max?: number
    title?: string
    maxLength?: number
    placeholder?: string
}

export interface ResourceElementConfig extends Record<string, any> {
    id: string
    properties: ResourceElementProperties
    resourceFilter?: ResourceFilterType // Filter function for Resource Selects. Checks Resource attributes against array element attributes
    simpleFilter?: SimpleFilterType     // Filter function for Reference Selects. Simple test of array element attribute against constant
    displayCondition?(): boolean        // Function to identify if conditional elements should be displayed
    configs: ResourceElementConfig[]
    options?: ResourceElementConfigOption[]
}
export interface ResourceElementConfigOption {
    id: string
    displayName: string
}

export interface ResourceProperties {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdResource
}

export interface GeneratedResourceProperties extends ResourceProperties {
    configs: ResourceElementConfig[]
    onDelete?(child: any): void
}

export interface ResourceProperty extends ResourceProperties {
    config: ResourceElementConfig | undefined
    attribute: ResourcePropertyAttributes
}

export namespace OcdResourceProperties {
    export function reactAttributeElement(resource: OcdResource, name: string, attribute: ResourcePropertyAttributes) {
        // console.info('Name:', name)
        // console.info('>> Resource:', resource)
        // console.info('>> Attribute:', attribute)
        const configFind = `configs.find((c) => c.id === '${attribute.id}')`
        if (attribute.type === 'string')                                      return `<OcdTextProperty       ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'bool')                                   return `<OcdBooleanProperty    ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'number')                                 return `<OcdNumberProperty     ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'object')                                 return `<OcdObjectProperty     ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'list' && attribute.subtype === 'object') return `<OcdObjectListProperty ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'list')                                   return `<OcdListProperty       ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'set')                                    return `<OcdSetProperty        ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'map')                                    return `<OcdMapProperty        ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
    }
}

export const OcdTextProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resource[attribute.key] = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.reportValidity()
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><input type='text' value={resource[attribute.key]} {...properties} onChange={onChange} onBlur={onBlur}></input></div>
        </div>
    )
}

export const OcdNumberProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resource[attribute.key] = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.reportValidity()
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><input type='number' value={resource[attribute.key]} {...properties} onChange={onChange} onBlur={onBlur}></input></div>
        </div>
    )
}

export const OcdBooleanProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const id = `${resource[attribute.key]}_${resource.id}`
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resource[attribute.key] = e.target.checked
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div></div>
            <div><input type='checkbox' id={id} checked={resource[attribute.key]} {...properties} onChange={onChange}></input><label htmlFor={id}>{attribute.label}</label></div>
        </div>
    )
}

export const OcdLookupProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config && config.resourceFilter ? (r: any) => config.resourceFilter  && config.resourceFilter(r, resource) : config && config.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        resource[attribute.key] = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div>
                <select value={resource[attribute.key]} {...properties} onChange={onChange}>
                    {/* {!attribute.required && <option defaultValue='' key={`${attribute.lookupResource}-empty-option`}></option> } */}
                    <option value='' key={`${attribute.lookupResource}-empty-option`}></option>
                    {resources.map((r: OcdResource) => {
                        return <option value={r.id} key={r.id}>{r.displayName}</option>
                    })}
                </select>
            </div>
        </div>
    )
}

export const OcdLookupListProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config && config.resourceFilter ? (r: any) => config.resourceFilter  && config.resourceFilter(r, resource) : config && config.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const securityListId = e.target.id
        const checked = e.target.checked
        if (checked) resource[attribute.key].push(securityListId)
        else resource[attribute.key] = resource[attribute.key].filter((s: string) => s !== securityListId)
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div>
                <div className='ocd-set-lookup'>
                    {resources.map((r: OcdResource) => {
                            return <div key={r.id}><input type='checkbox' id={r.id} key={r.id} {...properties} onChange={onChange} checked={resource[attribute.key].includes(r.id)}></input><label htmlFor={r.id}>{r.displayName}</label></div>
                        })}
                </div>
            </div>
        </div>
    )
}

export const OcdStaticLookupProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const resources = config && config.options ? config.options : []
    // console.info('Resources', resources)
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        resource[attribute.key] = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div>
                <select value={resource[attribute.key]} {...properties} onChange={onChange}>
                    {resources.map((r: ResourceElementConfigOption) => {
                        return <option value={r.id} key={r.id}>{r.displayName}</option>
                    })}
                </select>
            </div>
        </div>
    )
}

export const OcdStringListProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resource[attribute.key] = e.target.value.split(',')
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.reportValidity()
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><input type='text' value={resource[attribute.key].join(',')} {...properties} onChange={onChange} onBlur={onBlur}></input></div>
        </div>
    )
}

export const OcdNumberListProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resource[attribute.key] = e.target.value.split(',')
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.reportValidity()
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><input type='text' value={resource[attribute.key].join(',')} {...properties} onChange={onChange} onBlur={onBlur}></input></div>
        </div>
    )
}

export const OcdListProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><label>List Property</label></div>
        </div>
    )
}

export const OcdSetProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><label>Set Property</label></div>
        </div>
    )
}

export const OcdSetLookupProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config && config.resourceFilter ? (r: any) => config.resourceFilter  && config.resourceFilter(r, resource) : config && config.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const securityListId = e.target.id
        const checked = e.target.checked
        if (checked) resource[attribute.key].push(securityListId)
        else resource[attribute.key] = resource[attribute.key].filter((s: string) => s !== securityListId)
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div>
                <div className='ocd-set-lookup'>
                    {resources.map((r: OcdResource) => {
                            return <div key={r.id}><input type='checkbox' id={r.id} key={r.id} {...properties} onChange={onChange} checked={resource[attribute.key].includes(r.id)}></input><label htmlFor={r.id}>{r.displayName}</label></div>
                        })}
                </div>
            </div>
        </div>
    )
}

export const OcdMapProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><label>Map Property</label></div>
        </div>
    )
}
