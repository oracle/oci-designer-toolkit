/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResource } from '../../model/OcdResource'
import { OcdUtils } from '../../utils/OcdUtils'
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
    lookup?: boolean
    lookupResource?: string
}

export type filterType = (r: any) => any[]

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
    filter?: filterType                  // Filter function for Reference Selects
    displayCondition?(): boolean         // Function to identify if conditional elements should be displayed
    configs: ResourceElementConfig[]
}

export interface ResourceProperties {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdResource
}

export interface GeneratedResourceProperties extends ResourceProperties {
    configs: ResourceElementConfig[]
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
            <div><input type='text' defaultValue={resource[attribute.key]} {...properties} onChange={onChange} onBlur={onBlur}></input></div>
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
            <div><input type='number' defaultValue={resource[attribute.key]} {...properties} onChange={onChange} onBlur={onBlur}></input></div>
        </div>
    )
}

export const OcdBooleanProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resource[attribute.key] = e.target.checked
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div></div>
            <div><input type='checkbox' defaultChecked={resource[attribute.key]} {...properties} onChange={onChange}></input><label>{attribute.label}</label></div>
        </div>
    )
}

export const OcdLookupProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    const properties = config && config.properties ? config.properties : {}
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '') : []
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    console.info('Resources', resources)
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        resource[attribute.key] = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div>
                <select value={resource[attribute.key]} {...properties} onChange={onChange}>
                    {!attribute.required && <option defaultValue='' key={`${attribute.lookupResource}-empty-option`}></option> }
                    {resources.filter((r) => r.resourceType !== resourceType || r.id !== resource.id).map((r: OcdResource) => {
                        return <option value={r.id} key={r.id}>{r.displayName}</option>
                    })}
                </select>
            </div>
        </div>
    )
}

export const OcdObjectProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div></div>
    )
}

export const OcdObjectListProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div className='ocd-property-row'>
            <details open={true}>
                <summary className='summary-background'>{attribute.label}</summary>
                <div className='ocd-resource-properties'>
                </div>
            </details>
        </div>
    )
}

export const OcdListProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div></div>
    )
}

export const OcdSetProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div></div>
    )
}

export const OcdMapProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div></div>
    )
}
