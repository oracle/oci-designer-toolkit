/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResource } from "@ocd/model"
import { TableColumnProperties } from 'exceljs'

export interface ExcelColumnProperties {
    header: string
    key: string
    width: number
}

export class OcdExcelResource {
    allResources: OcdResource[]

    constructor (allResources: OcdResource[] = []) {
        this.allResources = allResources
    }
    ocdCommonGeneration = (resource: OcdResource): any[] => {
        return []
    }
    toNumber = (value: any) => {
        if (typeof value === 'number') return value
        else if (typeof value === 'string') return parseInt(value)
        return null
    }
    generateReferenceAttribute = (value: string | undefined, allResources: OcdResource[] = []): string => {
        const resource = allResources.find((r) => r.id === value)
        const displayName = resource ? resource.displayName : ''
        return displayName
    }
    generateReferenceListAttribute = (value: string | string[] | undefined, allResource: OcdResource[] = []): string => {
        const ids = typeof value === 'string' ? value.split(',') : Array.isArray(value) ? value : []
        const refResources = ids.map((id) => allResource.find((r) => r.id === id)).filter((r) => r !== undefined)
        const displayNames = refResources.map((r) => r.displayName)
        return displayNames.join('\n')
    }
    generateStringListAttribute = (value: string | string[] | undefined): string => {
        const valuesArray = typeof value === 'string' ? value.split(',') : Array.isArray(value) ? value : []
        return valuesArray.join('')
    }
    columns = (): ExcelColumnProperties[] => []
    tableColumns = (): TableColumnProperties[] => []
}

export default OcdExcelResource
