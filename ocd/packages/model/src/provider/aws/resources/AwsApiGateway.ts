/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS API Gateway model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsApiGateway extends AwsResource {
    protocolType: string
}

export namespace AwsApiGateway {
    export function newResource(type: string = 'api_gateway'): AwsApiGateway {
        return {
            ...AwsResource.newResource(type),
            protocolType: 'HTTP'
        }
    }
    export function cloneResource(resource: AwsApiGateway, type: string = 'api_gateway'): AwsApiGateway {
        return AwsResource.cloneResource(resource, type) as AwsApiGateway
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: AwsApiGateway): string {
        return resource.parentId
    }
    export function setParentId(resource: AwsApiGateway, parentId: string): AwsApiGateway {
        resource.parentId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsApiGateway, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsApiGatewayClient {
    static new(): AwsApiGateway {
        return AwsApiGateway.newResource()
    }
    static clone(resource: AwsApiGateway): AwsApiGateway {
        return AwsApiGateway.cloneResource(resource)
    }
}

export default AwsApiGatewayClient
