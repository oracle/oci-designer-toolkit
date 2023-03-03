/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResource } from '../../model/OcdResource'
import { OcdDocument } from '../OcdDocument'

export interface ResourcePropertyAttributes {
    name: string
    type: string
    subtype: string
    required: boolean
    label: string
    id: string
    attributes?: {[key: string]: ResourcePropertyAttributes}
}

export interface ResourceProperties {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdResource
}

export interface ResourceProperty extends ResourceProperties {
    attribute: ResourcePropertyAttributes
}

export const OcdStringProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div className='ocd-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><input type={'string'}></input></div>
        </div>
    )
}

export const OcdNumberProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div className='ocd-property-row'>
            <div><label>{attribute.label}</label></div>
            <div><input type={'number'}></input></div>
        </div>
    )
}

export const OcdBooleanProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div className='ocd-property-row'>
            <div><input type={'checkbox'}></input></div>
            <div><label>{attribute.label}</label></div>
        </div>
    )
}

export const OcdObjectProperty = ({ ocdDocument, setOcdDocument, resource, attribute }: ResourceProperty): JSX.Element => {
    return (
        <div></div>
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
