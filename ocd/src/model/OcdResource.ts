/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdUtils } from '../utils/OcdUtils'

export interface OcdResource extends Record<string, any> {
    provider: string
    locked: boolean
    terraformResourceName: string
    okitReference: string
    resourceType: string
    id: string
    documentation?: string
}

export namespace OcdResource {
    export function newResource(type?: string): OcdResource {
        const resourceType = OcdResource.toResourceType(type)
        return {
            provider: '',
            locked: false,
            terraformResourceName: `Okit${resourceType}${Date.now()}`,
            okitReference: `okit-${uuidv4()}`,
            resourceType: `${resourceType}`,
            id: ''
        }
    }
    export function toResourceType(type?: string): string {return `${OcdUtils.toTitleCase(type ? type.split('_').join(' ') : 'Unknown').replace(/\W+/g, '')}`}
}

