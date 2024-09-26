/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign"
import * as AutoGenerated from "./generated/GoogleOracledatabaseExadataInfrastructure"

export interface GoogleOracledatabaseExadataInfrastructure extends AutoGenerated.GoogleOracledatabaseExadataInfrastructure {}

export namespace GoogleOracledatabaseExadataInfrastructure {
    
    export function newResource(type?: string): GoogleOracledatabaseExadataInfrastructure {
        const resource = {
            ...AutoGenerated.GoogleOracledatabaseExadataInfrastructure.newResource('oracledatabase_exadata_infrastructure'),
        }
        return resource
    }
    export function cloneResource(resource: GoogleOracledatabaseExadataInfrastructure, type?: string): GoogleOracledatabaseExadataInfrastructure {
        return AutoGenerated.GoogleOracledatabaseExadataInfrastructure.cloneResource(resource, 'oracledatabase_exadata_infrastructure') as GoogleOracledatabaseExadataInfrastructure
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: GoogleOracledatabaseExadataInfrastructure): string {
        const parentId = resource.compartmentId
        return parentId
    }
    export function setParentId(resource: GoogleOracledatabaseExadataInfrastructure, parentId: string): GoogleOracledatabaseExadataInfrastructure {
        return resource
    }
    export function getConnectionIds(resource: GoogleOracledatabaseExadataInfrastructure, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        let associationIds: string[] = []
        return associationIds
    }
}

export class GoogleOracledatabaseExadataInfrastructureClient extends AutoGenerated.GoogleOracledatabaseExadataInfrastructureClient {
    static new(): GoogleOracledatabaseExadataInfrastructure {
        return GoogleOracledatabaseExadataInfrastructure.newResource()
    }
    static clone(resource: GoogleOracledatabaseExadataInfrastructure): GoogleOracledatabaseExadataInfrastructure {
        return GoogleOracledatabaseExadataInfrastructure.cloneResource(resource)
    }
}

export default GoogleOracledatabaseExadataInfrastructureClient