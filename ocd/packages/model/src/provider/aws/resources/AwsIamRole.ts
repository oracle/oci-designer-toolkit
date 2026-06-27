/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS IAM Role model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsIamRole extends AwsResource {
    assumeRolePolicy: string
}

export namespace AwsIamRole {
    export function newResource(type: string = 'iam_role'): AwsIamRole {
        return {
            ...AwsResource.newResource(type),
            assumeRolePolicy: ''
        }
    }
    export function cloneResource(resource: AwsIamRole, type: string = 'iam_role'): AwsIamRole {
        return AwsResource.cloneResource(resource, type) as AwsIamRole
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: AwsIamRole): string {
        return resource.parentId
    }
    export function setParentId(resource: AwsIamRole, parentId: string): AwsIamRole {
        resource.parentId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsIamRole, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsIamRoleClient {
    static new(): AwsIamRole {
        return AwsIamRole.newResource()
    }
    static clone(resource: AwsIamRole): AwsIamRole {
        return AwsIamRole.cloneResource(resource)
    }
}

export default AwsIamRoleClient
