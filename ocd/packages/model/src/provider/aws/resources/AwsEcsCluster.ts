/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS ECS Cluster model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsEcsCluster extends AwsResource {
    vpcId: string
    launchType: string
}

export namespace AwsEcsCluster {
    export function newResource(type: string = 'ecs_cluster'): AwsEcsCluster {
        return {
            ...AwsResource.newResource(type),
            vpcId: '',
            launchType: 'FARGATE'
        }
    }
    export function cloneResource(resource: AwsEcsCluster, type: string = 'ecs_cluster'): AwsEcsCluster {
        return AwsResource.cloneResource(resource, type) as AwsEcsCluster
    }
    export function allowedParentTypes(): string[] {
        return ['Vpc']
    }
    export function getParentId(resource: AwsEcsCluster): string {
        return resource.vpcId
    }
    export function setParentId(resource: AwsEcsCluster, parentId: string): AwsEcsCluster {
        resource.vpcId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsEcsCluster, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsEcsClusterClient {
    static new(): AwsEcsCluster {
        return AwsEcsCluster.newResource()
    }
    static clone(resource: AwsEcsCluster): AwsEcsCluster {
        return AwsEcsCluster.cloneResource(resource)
    }
}

export default AwsEcsClusterClient
