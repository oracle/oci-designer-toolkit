/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdUtils } from '../../../utils/OcdUtils'
import { OcdResource } from "../../OcdResource"

export interface OciResource extends OcdResource {
    region: string
    compartmentId: string
    displayName?: string
}


export namespace OciResource {
    export function uuid(prefix: string) {return `okit.${prefix}.${uuidv4()}`}
    export function newResource(type: string): OciResource {
        const displayName = `${OcdUtils.toTitleCase(type ? type.split('_').join(' ') : 'Unknown')} ${uuidv4().slice(-4)}`
        return {
            ...OcdResource.newResource(type),
            provider: 'oci',
            region: '',
            compartmentId: '',
            id: OciResource.uuid(type),
            displayName: `${displayName}`,
            documentation: ''
        }
    }
    export function cloneResource(resource: OciResource, type: string): OciResource {
        const displayName = `${resource.displayName} Clone`
        const id = OciResource.uuid(type)
        let clone = OcdResource.cloneResource(resource, type)
        clone.displayName = displayName
        clone.id = id
        return clone
    }
}