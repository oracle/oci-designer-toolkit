/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdViewCoords } from "../OcdDesign"
import OcdSingleColumnLayoutEngine from "./OcdSingleColumnLayoutEngine"

export class OcdTwoColumnLayoutEngine extends OcdSingleColumnLayoutEngine {
    layoutRoot(detailed: boolean = true, children: OcdViewCoords[]): OcdViewCoords[] {
        let childX = this.spacing
        let childY = this.spacing
        // Top Level Simple to the left Containers to the right
        children.filter((c) => !c.container).forEach((child) => {
            child.x = childX
            child.y = childY
            // Add Spacing
            childY += (this.spacing + child.h)
        })
        childX += ((this.spacing * 2) + (detailed ? this.detailedWidth : this.simpleWidth) as number)
        childY = this.spacing
        children.filter((c) => c.container).forEach((child) => {
            child.x = childX
            child.y = childY
            // Add Spacing
            childY += (this.spacing + child.h)
        })
        return children
    }
}
