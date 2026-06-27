/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS Subnet model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsSubnet extends AwsResource {
    vpcId: string
    cidrBlock: string
}

export namespace AwsSubnet {
    export function newResource(type: string = 'subnet'): AwsSubnet {
        return {
            ...AwsResource.newResource(type),
            vpcId: '',
            cidrBlock: ''
        }
    }
    export function cloneResource(resource: AwsSubnet, type: string = 'subnet'): AwsSubnet {
        return AwsResource.cloneResource(resource, type) as AwsSubnet
    }
    export function allowedParentTypes(): string[] {
        return ['Vpc']
    }
    export function getParentId(resource: AwsSubnet): string {
        return resource.vpcId
    }
    export function setParentId(resource: AwsSubnet, parentId: string): AwsSubnet {
        resource.vpcId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsSubnet, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsSubnetClient {
    static new(): AwsSubnet {
        return AwsSubnet.newResource()
    }
    static clone(resource: AwsSubnet): AwsSubnet {
        return AwsSubnet.cloneResource(resource)
    }
}

export default AwsSubnetClient
