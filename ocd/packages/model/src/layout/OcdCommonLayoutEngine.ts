/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdViewCoords } from "../OcdDesign"

export class OcdCommonlayoutEngine {
    coords: OcdViewCoords[]
    maxColumns = 5
    spacing = 32
    detailedWidth = 150
    simpleWidth = 32
    simpleHeight = 32
    containerWidth = 200
    containerHeight = 200

    constructor(coords: OcdViewCoords[]) {
        this.coords = coords
    }
    getChildren = (pocid: string) => this.coords.filter((c) => c.pocid === pocid)
}
