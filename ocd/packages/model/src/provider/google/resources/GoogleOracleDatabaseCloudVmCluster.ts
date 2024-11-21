/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign.js"
import * as AutoGenerated from "./generated/GoogleOracleDatabaseCloudVmCluster.js"

export interface GoogleOracleDatabaseCloudVmCluster extends AutoGenerated.GoogleOracleDatabaseCloudVmCluster {}

export namespace GoogleOracleDatabaseCloudVmCluster {
    
    export function newResource(type?: string): GoogleOracleDatabaseCloudVmCluster {
        const resource = {
            ...AutoGenerated.GoogleOracleDatabaseCloudVmCluster.newResource('oracle_database_cloud_vm_cluster'),
        }
        return resource
    }
    export function cloneResource(resource: GoogleOracleDatabaseCloudVmCluster, type?: string): GoogleOracleDatabaseCloudVmCluster {
        return AutoGenerated.GoogleOracleDatabaseCloudVmCluster.cloneResource(resource, 'oracle_database_cloud_vm_cluster') as GoogleOracleDatabaseCloudVmCluster
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: GoogleOracleDatabaseCloudVmCluster): string {
        const parentId = resource.compartmentId
        return parentId
    }
    export function setParentId(resource: GoogleOracleDatabaseCloudVmCluster, parentId: string): GoogleOracleDatabaseCloudVmCluster {
        return resource
    }
    export function getConnectionIds(resource: GoogleOracleDatabaseCloudVmCluster, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        let associationIds: string[] = []
        return associationIds
    }
}

export class GoogleOracleDatabaseCloudVmClusterClient extends AutoGenerated.GoogleOracleDatabaseCloudVmClusterClient {
    static new(): GoogleOracleDatabaseCloudVmCluster {
        return GoogleOracleDatabaseCloudVmCluster.newResource()
    }
    static clone(resource: GoogleOracleDatabaseCloudVmCluster): GoogleOracleDatabaseCloudVmCluster {
        return GoogleOracleDatabaseCloudVmCluster.cloneResource(resource)
    }
}

export default GoogleOracleDatabaseCloudVmClusterClient