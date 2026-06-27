/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS SNS Topic model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsSnsTopic extends AwsResource {
    fifo: boolean
}

export namespace AwsSnsTopic {
    export function newResource(type: string = 'sns_topic'): AwsSnsTopic {
        return {
            ...AwsResource.newResource(type),
            fifo: false
        }
    }
    export function cloneResource(resource: AwsSnsTopic, type: string = 'sns_topic'): AwsSnsTopic {
        return AwsResource.cloneResource(resource, type) as AwsSnsTopic
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: AwsSnsTopic): string {
        return resource.parentId
    }
    export function setParentId(resource: AwsSnsTopic, parentId: string): AwsSnsTopic {
        resource.parentId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsSnsTopic, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsSnsTopicClient {
    static new(): AwsSnsTopic {
        return AwsSnsTopic.newResource()
    }
    static clone(resource: AwsSnsTopic): AwsSnsTopic {
        return AwsSnsTopic.cloneResource(resource)
    }
}

export default AwsSnsTopicClient
