/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdViewCoords } from "../OcdDesign"
import { OcdCommonlayoutEngine } from "./OcdCommonLayoutEngine"

export class OcdSingleColumnLayoutEngine extends OcdCommonlayoutEngine {
    layout(detailed: boolean = true, coords: OcdViewCoords[]): OcdViewCoords[] {
        let layedOutCoords = coords ? coords : this.coords
        // Layout and filter top level
        layedOutCoords = this.layoutContainerChildren(detailed, layedOutCoords).filter(c => c.pgid === '')
        layedOutCoords = this.layoutRoot(detailed, layedOutCoords)
        return layedOutCoords
    }

    layoutContainerChildren(detailed: boolean = true, coords: OcdViewCoords[]): OcdViewCoords[] {
        // Position Children in Container
        coords.filter((c) => c.container).reverse().forEach((coords) => {
            const children = this.getChildren(coords.ocid)
            let childX = this.spacing
            let childY = this.spacing + this.simpleHeight
            let childCount = 0
            children.filter((c) => !c.container).forEach((child) => {
                childCount += 1
                if (childCount > this.maxColumns) {
                    childX = this.spacing
                    childY += (this.spacing + this.simpleHeight)
                    childCount = 0
                }
                child.x = childX
                child.y = childY
                // Add Spacing
                childX += (this.spacing + (detailed ? this.detailedWidth : this.simpleWidth) as number)
                // Size Container
                coords.w = Math.max(coords.w, (childX + this.spacing))
                coords.h = childY + this.spacing + this.simpleHeight
            })
            childX = this.spacing
            childY += (this.spacing + this.simpleHeight)
            children.filter((c) => c.container).forEach((child) => {
                child.x = childX
                child.y = childY
                // Add Spacing
                childY += (this.spacing + child.h)
                // Size Container
                coords.w = Math.max(coords.w, (child.w + (2 * this.spacing)))
                coords.h += (this.spacing + child.h)
            })
        })
        // Add Children to Parent Coords
        coords.filter((c) => c.container).forEach((parent) => {
            const children = this.getChildren(parent.ocid)
            children.forEach((child) => {
                child.pgid = parent.id
                parent.coords ? parent.coords.push(child) : parent.coords = [child]
            })
        })
        return coords
    }

    layoutRoot(detailed: boolean = true, coords: OcdViewCoords[]): OcdViewCoords[] {
        // Position Root Containers
        let childX = this.spacing
        let childY = this.spacing
        coords.reverse().forEach((child) => {
            child.x = childX
            child.y = childY
            // Add Spacing
            childY += (this.spacing + child.h)
        })
        return coords
    }
}

export default OcdSingleColumnLayoutEngine