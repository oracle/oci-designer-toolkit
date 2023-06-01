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
    resourceTypeName: string
    id: string
    documentation?: string
}

export namespace OcdResource {
    export function newResource(type?: string): OcdResource {
        const resourceType = OcdUtils.toResourceType(type)
        const resourceTypeName = OcdUtils.toResourceTypeName(type)
        return {
            provider: '',
            locked: false,
            terraformResourceName: `Okit${resourceType}${Date.now()}`,
            okitReference: `okit-${uuidv4()}`,
            resourceType: `${resourceType}`,
            resourceTypeName: `${resourceTypeName}`,
            id: ''
        }
    }
}

