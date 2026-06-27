/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained AWS Lambda Function model resource (no codegen layer — see AwsVpc.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { AwsResource } from "../AwsResource.js"

export interface AwsLambdaFunction extends AwsResource {
    runtime: string
    handler: string
}

export namespace AwsLambdaFunction {
    export function newResource(type: string = 'lambda_function'): AwsLambdaFunction {
        return {
            ...AwsResource.newResource(type),
            runtime: 'python3.12',
            handler: 'index.handler'
        }
    }
    export function cloneResource(resource: AwsLambdaFunction, type: string = 'lambda_function'): AwsLambdaFunction {
        return AwsResource.cloneResource(resource, type) as AwsLambdaFunction
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: AwsLambdaFunction): string {
        return resource.parentId
    }
    export function setParentId(resource: AwsLambdaFunction, parentId: string): AwsLambdaFunction {
        resource.parentId = parentId
        return resource
    }
    export function getConnectionIds(resource: AwsLambdaFunction, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class AwsLambdaFunctionClient {
    static new(): AwsLambdaFunction {
        return AwsLambdaFunction.newResource()
    }
    static clone(resource: AwsLambdaFunction): AwsLambdaFunction {
        return AwsLambdaFunction.cloneResource(resource)
    }
}

export default AwsLambdaFunctionClient
