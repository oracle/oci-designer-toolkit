/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS Internet Gateway model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsInternetGateway extends AwsResource {
    vpcId: string
}

export namespace AwsInternetGateway {
    export function newResource(type: string = 'internet_gateway'): AwsInternetGateway {
        return {
            ...AwsResource.newResource(type),
            vpcId: ''
        }
    }
    export function cloneResource(resource: AwsInternetGateway, type: string = 'internet_gateway'): AwsInternetGateway {
        return AwsResource.cloneResource(resource, type) as AwsInternetGateway
    }
    export function allowedParentTypes(): string[] {
        return ['Vpc']
    }
    export function getParentId(resource: AwsInternetGateway): string {
        return resource.vpcId
    }
    export function setParentId(resource: AwsInternetGateway, parentId: string): AwsInternetGateway {
        resource.vpcId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsInternetGateway, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsInternetGatewayClient {
    static new(): AwsInternetGateway {
        return AwsInternetGateway.newResource()
    }
    static clone(resource: AwsInternetGateway): AwsInternetGateway {
        return AwsInternetGateway.cloneResource(resource)
    }
}

export default AwsInternetGatewayClient
