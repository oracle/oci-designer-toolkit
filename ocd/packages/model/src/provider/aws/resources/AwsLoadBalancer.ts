/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS Load Balancer model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsLoadBalancer extends AwsResource {
    vpcId: string
    scheme: string
}

export namespace AwsLoadBalancer {
    export function newResource(type: string = 'load_balancer'): AwsLoadBalancer {
        return {
            ...AwsResource.newResource(type),
            vpcId: '',
            scheme: 'internet-facing'
        }
    }
    export function cloneResource(resource: AwsLoadBalancer, type: string = 'load_balancer'): AwsLoadBalancer {
        return AwsResource.cloneResource(resource, type) as AwsLoadBalancer
    }
    export function allowedParentTypes(): string[] {
        return ['Vpc']
    }
    export function getParentId(resource: AwsLoadBalancer): string {
        return resource.vpcId
    }
    export function setParentId(resource: AwsLoadBalancer, parentId: string): AwsLoadBalancer {
        resource.vpcId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsLoadBalancer, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsLoadBalancerClient {
    static new(): AwsLoadBalancer {
        return AwsLoadBalancer.newResource()
    }
    static clone(resource: AwsLoadBalancer): AwsLoadBalancer {
        return AwsLoadBalancer.cloneResource(resource)
    }
}

export default AwsLoadBalancerClient
