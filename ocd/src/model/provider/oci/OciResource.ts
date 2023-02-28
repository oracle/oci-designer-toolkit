/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdResource } from "../../OcdResource"

export interface OciResource extends OcdResource {
    region: string
    compartmentId: string
    displayName?: string
}


export namespace OciResource {
    export function uuid(prefix: string) {return `okit.${prefix}.${uuidv4()}`}
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