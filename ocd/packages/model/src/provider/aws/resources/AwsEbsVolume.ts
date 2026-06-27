/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS EBS Volume model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsEbsVolume extends AwsResource {
    availabilityZone: string
    sizeGb: number
}

export namespace AwsEbsVolume {
    export function newResource(type: string = 'ebs_volume'): AwsEbsVolume {
        return {
            ...AwsResource.newResource(type),
            availabilityZone: '',
            sizeGb: 8
        }
    }
    export function cloneResource(resource: AwsEbsVolume, type: string = 'ebs_volume'): AwsEbsVolume {
        return AwsResource.cloneResource(resource, type) as AwsEbsVolume
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: AwsEbsVolume): string {
        return resource.parentId
    }
    export function setParentId(resource: AwsEbsVolume, parentId: string): AwsEbsVolume {
        resource.parentId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsEbsVolume, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsEbsVolumeClient {
    static new(): AwsEbsVolume {
        return AwsEbsVolume.newResource()
    }
    static clone(resource: AwsEbsVolume): AwsEbsVolume {
        return AwsEbsVolume.cloneResource(resource)
    }
}

export default AwsEbsVolumeClient
