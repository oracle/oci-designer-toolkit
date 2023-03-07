/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResource } from '../../model/OcdResource'
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
    referenceResource?: string
}

export type filterType = (r: any) => any[]

export interface ResourceElementProperties extends Record<string, any> {
    pattern?: string
    min?: number
    max: number
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

export const OcdTextProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resource[attribute.key] = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><input type='text' defaultValue={resource[attribute.key]} onChange={onChange}></input></div>
        </div>
    )
}

export const OcdNumberProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resource[attribute.key] = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><input type='number' defaultValue={resource[attribute.key]} onChange={onChange}></input></div>
        </div>
    )
}

export const OcdBooleanProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resource[attribute.key] = e.target.checked
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div></div>
            <div><input type='checkbox' defaultChecked={resource[attribute.key]} onChange={onChange}></input><label>{attribute.label}</label></div>
        </div>
    )
}

export const OcdResourceReferenceProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.referenceResource ? attribute.referenceResource : '') : []
    const resourceType = OcdResource.toResourceType(attribute.referenceResource)
    console.info('Resources', resources)
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        resource[attribute.key] = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-property-row ocd-simple-property-row'>
            <div><label>{attribute.label}</label></div>
            <div>
                <select value={resource[attribute.key]} onChange={onChange}>
                    {!attribute.required && <option defaultValue='' key={`${attribute.referenceResource}-empty-option`}></option> }
                    {resources.filter((r) => r.resourceType !== resourceType || r.id !== resource.id).map((r: OcdResource) => {
                        return <option value={r.id} key={r.id}>{r.displayName}</option>
                    })}
                </select>
            </div>
        </div>
    )
}

export const OcdObjectProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div></div>
    )
}

export const OcdObjectListProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
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

export const OcdListProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div></div>
    )
}

export const OcdSetProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div></div>
    )
}

export const OcdMapProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div></div>
    )
}
