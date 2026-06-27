/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS Instance model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsInstance extends AwsResource {
    subnetId: string
    ami: string
    instanceType: string
}

export namespace AwsInstance {
    export function newResource(type: string = 'instance'): AwsInstance {
        return {
            ...AwsResource.newResource(type),
            subnetId: '',
            ami: '',
            instanceType: 't3.micro'
        }
    }
    export function cloneResource(resource: AwsInstance, type: string = 'instance'): AwsInstance {
        return AwsResource.cloneResource(resource, type) as AwsInstance
    }
    export function allowedParentTypes(): string[] {
        return ['Subnet']
    }
    export function getParentId(resource: AwsInstance): string {
        return resource.subnetId
    }
    export function setParentId(resource: AwsInstance, parentId: string): AwsInstance {
        resource.subnetId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsInstance, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsInstanceClient {
    static new(): AwsInstance {
        return AwsInstance.newResource()
    }
    static clone(resource: AwsInstance): AwsInstance {
        return AwsInstance.cloneResource(resource)
    }
}

export default AwsInstanceClient
