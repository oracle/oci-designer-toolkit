/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS RDS Instance model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsRdsInstance extends AwsResource {
    subnetId: string
    engine: string
    instanceClass: string
}

export namespace AwsRdsInstance {
    export function newResource(type: string = 'rds_instance'): AwsRdsInstance {
        return {
            ...AwsResource.newResource(type),
            subnetId: '',
            engine: 'postgres',
            instanceClass: 'db.t3.micro'
        }
    }
    export function cloneResource(resource: AwsRdsInstance, type: string = 'rds_instance'): AwsRdsInstance {
        return AwsResource.cloneResource(resource, type) as AwsRdsInstance
    }
    export function allowedParentTypes(): string[] {
        return ['Subnet']
    }
    export function getParentId(resource: AwsRdsInstance): string {
        return resource.subnetId
    }
    export function setParentId(resource: AwsRdsInstance, parentId: string): AwsRdsInstance {
        resource.subnetId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsRdsInstance, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsRdsInstanceClient {
    static new(): AwsRdsInstance {
        return AwsRdsInstance.newResource()
    }
    static clone(resource: AwsRdsInstance): AwsRdsInstance {
        return AwsRdsInstance.cloneResource(resource)
    }
}

export default AwsRdsInstanceClient
