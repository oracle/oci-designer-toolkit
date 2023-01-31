/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { PaletteResource } from "../model/OcdPalette"
import { OcdResource } from "../model/OcdResource"

export interface Point {
    x: number,
    y: number
}

export interface DragData {
    dragObject: PaletteResource,
    offset: Point,
    existingResource: boolean,
    resourceType?: string,
    resource?: OcdResource
}
