/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export type OcdProvider = 'oci' | 'azure' | 'google'

export type OcdSchemaAttribute = {
    provider: string
    key: string
    name: string
    type: string
    subtype: string
    required: boolean
    label: string
    id: string
    staticLookup: boolean
    cacheLookup: boolean
    lookup: boolean
    lookupResource: string
    lookupResourceElement: string
    conditional: boolean
    condition: Record<string, any>
    default: string | number | boolean
    attributes?: OcdSchemaAttributes
}

export type OcdSchemaAttributes = Record<string, OcdSchemaAttribute>

export type OcdSchemaResource = {
    tf_resource: string
    type: string
    subtype: string
    attributes: OcdSchemaAttributes
}

export interface OcdSchemaEntry extends Record<string, OcdSchemaResource | OcdSchemaAttribute> {}

export interface OcdSchema extends Record<string, OcdSchemaResource> {}
