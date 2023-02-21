/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdResource } from "../../OcdResource"

export interface OciResource extends OcdResource {
    region: string
    compartmentId: string
    displayName?: string
}


export namespace OciResource {
    export function uuid(prefix: string) {
        // @ts-ignore 
        return `${prefix}-${([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c =>(c^(((window.crypto||window.Crypto).getRandomValues(new Uint8Array(1))[0]&15)>>c/4)).toString(16))}`
    }
    export function newResource(type: string): OciResource {
        return {
            ...OcdResource.newResource(type),
            region: '',
            compartmentId: '',
            id: OciResource.uuid(type),
            displayName: `OCD ${type}`,
            documentation: ''
        }
    }
}