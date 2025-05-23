/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
    
import * as AutoGenerated from "./generated/OciCompartment.js"
import { OciModelResources as Model } from '@ocd/model'
import { ExcelColumnProperties } from '../../../OcdExcelResource.js'
import { TableColumnProperties } from 'exceljs'

export class OciCompartment extends AutoGenerated.OciCompartment {
    resourceColumns = (): ExcelColumnProperties[] => {
        const columns: ExcelColumnProperties[] = [
            {header: 'Description', key: 'description', width: 50}
        ]
        return columns
    }
    resourceTableColumns = (): TableColumnProperties[] => {
        const columns: TableColumnProperties[] = [
            {name: 'Description', filterButton: true}
        ]   
        return columns
    }
    resourceRowGeneration = (resource: Model.OciCompartment): any[] => [resource.description]
}

export default OciCompartment
