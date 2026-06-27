/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS CloudFront Distribution model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsCloudfrontDistribution extends AwsResource {
    originDomain: string
}

export namespace AwsCloudfrontDistribution {
    export function newResource(type: string = 'cloudfront_distribution'): AwsCloudfrontDistribution {
        return {
            ...AwsResource.newResource(type),
            originDomain: ''
        }
    }
    export function cloneResource(resource: AwsCloudfrontDistribution, type: string = 'cloudfront_distribution'): AwsCloudfrontDistribution {
        return AwsResource.cloneResource(resource, type) as AwsCloudfrontDistribution
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: AwsCloudfrontDistribution): string {
        return resource.parentId
    }
    export function setParentId(resource: AwsCloudfrontDistribution, parentId: string): AwsCloudfrontDistribution {
        resource.parentId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsCloudfrontDistribution, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsCloudfrontDistributionClient {
    static new(): AwsCloudfrontDistribution {
        return AwsCloudfrontDistribution.newResource()
    }
    static clone(resource: AwsCloudfrontDistribution): AwsCloudfrontDistribution {
        return AwsCloudfrontDistribution.cloneResource(resource)
    }
}

export default AwsCloudfrontDistributionClient
