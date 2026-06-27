/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS DynamoDB Table model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsDynamodbTable extends AwsResource {
    hashKey: string
    billingMode: string
}

export namespace AwsDynamodbTable {
    export function newResource(type: string = 'dynamodb_table'): AwsDynamodbTable {
        return {
            ...AwsResource.newResource(type),
            hashKey: '',
            billingMode: 'PAY_PER_REQUEST'
        }
    }
    export function cloneResource(resource: AwsDynamodbTable, type: string = 'dynamodb_table'): AwsDynamodbTable {
        return AwsResource.cloneResource(resource, type) as AwsDynamodbTable
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: AwsDynamodbTable): string {
        return resource.parentId
    }
    export function setParentId(resource: AwsDynamodbTable, parentId: string): AwsDynamodbTable {
        resource.parentId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsDynamodbTable, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsDynamodbTableClient {
    static new(): AwsDynamodbTable {
        return AwsDynamodbTable.newResource()
    }
    static clone(resource: AwsDynamodbTable): AwsDynamodbTable {
        return AwsDynamodbTable.cloneResource(resource)
    }
}

export default AwsDynamodbTableClient
