/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS NAT Gateway model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsNatGateway extends AwsResource {
    subnetId: string
}

export namespace AwsNatGateway {
    export function newResource(type: string = 'nat_gateway'): AwsNatGateway {
        return {
            ...AwsResource.newResource(type),
            subnetId: ''
        }
    }
    export function cloneResource(resource: AwsNatGateway, type: string = 'nat_gateway'): AwsNatGateway {
        return AwsResource.cloneResource(resource, type) as AwsNatGateway
    }
    export function allowedParentTypes(): string[] {
        return ['Subnet']
    }
    export function getParentId(resource: AwsNatGateway): string {
        return resource.subnetId
    }
    export function setParentId(resource: AwsNatGateway, parentId: string): AwsNatGateway {
        resource.subnetId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsNatGateway, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsNatGatewayClient {
    static new(): AwsNatGateway {
        return AwsNatGateway.newResource()
    }
    static clone(resource: AwsNatGateway): AwsNatGateway {
        return AwsNatGateway.cloneResource(resource)
    }
}

export default AwsNatGatewayClient
