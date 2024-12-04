/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
import { GeneralResource } from "../GeneralResource.js"

export interface GeneralRectangle extends GeneralRectangle.GeneralRectangle {}

export namespace GeneralRectangle {
    export function newResource(type: string='rectangle'): GeneralRectangle {return newGeneralRectangle(type)}
    export function cloneResource(resource: GeneralRectangle, type: string): GeneralRectangle {return GeneralRectangle.cloneResource(resource, type)}
    export interface GeneralRectangle extends GeneralResource  {}
    export function newGeneralRectangle(type: string): GeneralRectangle {
        return {
            ...GeneralResource.newResource(type)
        }
    }

}

export class GeneralRectangleClient {
    static new(): GeneralRectangle {
        return GeneralRectangle.newResource('rectangle')
    }
}


export default GeneralRectangleClient
