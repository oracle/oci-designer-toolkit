/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export type OcdSchemaAttribute = {
    provider: 'oci' | 'azure' | 'google'
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
    attributes?: OcdSchemaAttributes
}

export type OcdSchemaAttributes = Record<string, OcdSchemaAttribute>

export type OcdSchemaResource = {
    tf_resource: string
    type: string
    subtype: string
    attributes: OcdSchemaAttributes
}

export interface OcdSchemaEntry extends Record<string, string | boolean | number | OcdSchemaEntry> {}

export interface OcdSchema extends Record<string, OcdSchemaResource> {}
