/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS S3 Bucket model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsS3Bucket extends AwsResource {
    bucketName: string
}

export namespace AwsS3Bucket {
    export function newResource(type: string = 's3_bucket'): AwsS3Bucket {
        return {
            ...AwsResource.newResource(type),
            bucketName: ''
        }
    }
    export function cloneResource(resource: AwsS3Bucket, type: string = 's3_bucket'): AwsS3Bucket {
        return AwsResource.cloneResource(resource, type) as AwsS3Bucket
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: AwsS3Bucket): string {
        return resource.parentId
    }
    export function setParentId(resource: AwsS3Bucket, parentId: string): AwsS3Bucket {
        resource.parentId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsS3Bucket, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsS3BucketClient {
    static new(): AwsS3Bucket {
        return AwsS3Bucket.newResource()
    }
    static clone(resource: AwsS3Bucket): AwsS3Bucket {
        return AwsS3Bucket.cloneResource(resource)
    }
}

export default AwsS3BucketClient
