/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdResource, PaletteResource } from "@ocd/model"

export interface Point {
    x: number,
    y: number
}

export interface DragData {
    dragObject?: PaletteResource,
    offset: Point,
    existingResource: boolean,
    resourceType?: string,
    resource?: OcdResource
}

export function newDragData(): DragData {
    return {
        // dragObject: {container: false, title: '', class: ''},
        offset: {x: 0, y: 0},
        existingResource: false
    }
}

