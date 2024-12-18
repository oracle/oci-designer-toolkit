/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign.js"
import * as AutoGenerated from "./generated/OciFileSystemExport.js"

export interface OciFileSystemExport extends AutoGenerated.OciFileSystemExport {}

export namespace OciFileSystemExport {
    export namespace ExportOptions {
        export interface ExportOptions extends AutoGenerated.OciFileSystemExport.ExportOptions.ExportOptions {}
        export function newExportOptions(): ExportOptions {return AutoGenerated.OciFileSystemExport.ExportOptions.newExportOptions()}
        
    }
    export function newResource(type?: string): OciFileSystemExport {
        const resource = {
            ...AutoGenerated.OciFileSystemExport.newResource('file_system_export'),
        }
        return resource
    }
    export function cloneResource(resource: OciFileSystemExport, type?: string): OciFileSystemExport {
        return AutoGenerated.OciFileSystemExport.cloneResource(resource, 'file_system_export') as OciFileSystemExport
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: OciFileSystemExport): string {
        const parentId = resource.compartmentId
        return parentId
    }
    export function setParentId(resource: OciFileSystemExport, parentId: string): OciFileSystemExport {
        return resource
    }
    export function getConnectionIds(resource: OciFileSystemExport, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        let associationIds: string[] = []
        return associationIds
    }
}

export class OciFileSystemExportClient extends AutoGenerated.OciFileSystemExportClient {
    static new(): OciFileSystemExport {
        return OciFileSystemExport.newResource()
    }
    static clone(resource: OciFileSystemExport): OciFileSystemExport {
        return OciFileSystemExport.cloneResource(resource)
    }
}

export default OciFileSystemExportClient
