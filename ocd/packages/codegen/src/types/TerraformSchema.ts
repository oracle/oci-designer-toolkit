/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export interface TerrafomSchemaEntry extends Record<string, any> {}

export interface TerraformSchema extends Record<string, any> {
    format_version: string
    provider_schemas: TerrafomSchemaEntry
}

export type TerraformSchemaResourceMap = {
    [key: string]: string;
}

export type TerraformSchemaDataMap = {
    [key: string]: string;
}
