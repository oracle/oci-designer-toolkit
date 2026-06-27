/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS Route Table model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsRouteTable extends AwsResource {
    vpcId: string
}

export namespace AwsRouteTable {
    export function newResource(type: string = 'route_table'): AwsRouteTable {
        return {
            ...AwsResource.newResource(type),
            vpcId: ''
        }
    }
    export function cloneResource(resource: AwsRouteTable, type: string = 'route_table'): AwsRouteTable {
        return AwsResource.cloneResource(resource, type) as AwsRouteTable
    }
    export function allowedParentTypes(): string[] {
        return ['Vpc']
    }
    export function getParentId(resource: AwsRouteTable): string {
        return resource.vpcId
    }
    export function setParentId(resource: AwsRouteTable, parentId: string): AwsRouteTable {
        resource.vpcId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsRouteTable, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsRouteTableClient {
    static new(): AwsRouteTable {
        return AwsRouteTable.newResource()
    }
    static clone(resource: AwsRouteTable): AwsRouteTable {
        return AwsRouteTable.cloneResource(resource)
    }
}

export default AwsRouteTableClient
