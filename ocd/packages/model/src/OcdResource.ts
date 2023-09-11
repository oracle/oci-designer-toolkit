/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdUtils } from '@ocd/core'

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
        const terraformResourceName = OcdUtils.toTerraformResourceName(type)
        return {
            provider: '',
            locked: false,
            terraformResourceName: `${terraformResourceName}`,
            okitReference: `okit-${uuidv4()}`,
            resourceType: `${resourceType}`,
            resourceTypeName: `${resourceTypeName}`,
            id: ''
        }
    }
    export function cloneResource(resource: OcdResource, type: string) {
        const terraformResourceName = OcdUtils.toTerraformResourceName(type)
        let clone = JSON.parse(JSON.stringify(resource))
        clone.terraformResourceName = terraformResourceName
        clone.okitReference = `okit-${uuidv4()}`
        return clone
    }
}

