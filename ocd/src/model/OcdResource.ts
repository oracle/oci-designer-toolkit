/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdUtils } from '../utils/OcdUtils'

export interface OcdResource {
    locked: boolean
    terraformResourceName: string
    okitReference: string
    resourceType: string
    id: string
    documentation?: string
}

export namespace OcdResource {
    export function newResource(type?: string): OcdResource {
        return {
            locked: false,
            terraformResourceName: `Okit${type ? type.toUpperCase() : ''}${Date.now()}`,
            okitReference: `okit-${uuidv4()}`,
            resourceType: `${OcdUtils.toTitleCase(type)}`,
            id: ''
        }
    }
}

