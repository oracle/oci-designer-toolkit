/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdExcelResource, ExcelColumnProperties } from '../../OcdExcelResource.js'
import { OciResource, OcdDesign } from '@ocd/model'
import { TableColumnProperties } from 'exceljs'

export class OciExcelResource extends OcdExcelResource {
    ociCommonTitles = (resource: OciResource): string[] => {return ['Name', 'Compartment']}
    ociCommonGeneration = (resource: OciResource): any[] => {return [resource.displayName, this.generateReferenceAttribute(resource.compartmentId, this.allResources)]}
    ociCommonColumns = (): ExcelColumnProperties[] => {
        const columns: ExcelColumnProperties[] = [
            {header: 'Name', key: 'displayName', width: 40},
            {header: 'Compartment', key: 'compartmentName', width: 35}
        ]
        return columns
    }
    ociCommonTableColumns = (): TableColumnProperties[] => {
        const columns: TableColumnProperties[] = [
            {name: 'Name', filterButton: true},
            {name: 'Compartment', filterButton: true}
        ]   
        return columns
    }
    resourceTagGeneration = (resource: OciResource): any[] => [resource.lifecycleState, OcdDesign.ociFreeformTagsToString(resource.freeformTags || {}), OcdDesign.ociDefinedTagsToString(resource.definedTags || {})]
    resourceTagColumns = (): ExcelColumnProperties[] => [
        {header: 'Lifecycle State', key: 'lifecycleState', width: 50},
        {header: 'Freeform Tags', key: 'freeformTags', width: 80},
        {header: 'Defined Tags', key: 'definedTags', width: 100}
    ]
    resourceTagTableColumns = (): TableColumnProperties[] => [
        {name: 'Lifecycle State', filterButton: true},
        {name: 'Freeform Tags', filterButton: true},
        {name: 'Defined Tags', filterButton: true}
    ]
}

export default OciExcelResource
