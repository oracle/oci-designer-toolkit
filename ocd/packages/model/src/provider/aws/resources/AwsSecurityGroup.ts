/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS Security Group model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsSecurityGroup extends AwsResource {
    vpcId: string
    description: string
}

export namespace AwsSecurityGroup {
    export function newResource(type: string = 'security_group'): AwsSecurityGroup {
        return {
            ...AwsResource.newResource(type),
            vpcId: '',
            description: 'Managed by OCI Designer Toolkit'
        }
    }
    export function cloneResource(resource: AwsSecurityGroup, type: string = 'security_group'): AwsSecurityGroup {
        return AwsResource.cloneResource(resource, type) as AwsSecurityGroup
    }
    export function allowedParentTypes(): string[] {
        return ['Vpc']
    }
    export function getParentId(resource: AwsSecurityGroup): string {
        return resource.vpcId
    }
    export function setParentId(resource: AwsSecurityGroup, parentId: string): AwsSecurityGroup {
        resource.vpcId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsSecurityGroup, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsSecurityGroupClient {
    static new(): AwsSecurityGroup {
        return AwsSecurityGroup.newResource()
    }
    static clone(resource: AwsSecurityGroup): AwsSecurityGroup {
        return AwsSecurityGroup.cloneResource(resource)
    }
}

export default AwsSecurityGroupClient
