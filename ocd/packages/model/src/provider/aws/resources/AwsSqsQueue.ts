/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS SQS Queue model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsSqsQueue extends AwsResource {
    fifo: boolean
}

export namespace AwsSqsQueue {
    export function newResource(type: string = 'sqs_queue'): AwsSqsQueue {
        return {
            ...AwsResource.newResource(type),
            fifo: false
        }
    }
    export function cloneResource(resource: AwsSqsQueue, type: string = 'sqs_queue'): AwsSqsQueue {
        return AwsResource.cloneResource(resource, type) as AwsSqsQueue
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: AwsSqsQueue): string {
        return resource.parentId
    }
    export function setParentId(resource: AwsSqsQueue, parentId: string): AwsSqsQueue {
        resource.parentId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsSqsQueue, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsSqsQueueClient {
    static new(): AwsSqsQueue {
        return AwsSqsQueue.newResource()
    }
    static clone(resource: AwsSqsQueue): AwsSqsQueue {
        return AwsSqsQueue.cloneResource(resource)
    }
}

export default AwsSqsQueueClient
