/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

export interface OcdResource {
    locked: boolean
    resourceType: string
    id: string
    documentation?: string
}

export namespace OcdResource {
    export function newResource(type?: string): OcdResource {
        return {
            locked: false,
            resourceType: '',
            id: ''
        }
    }
}
