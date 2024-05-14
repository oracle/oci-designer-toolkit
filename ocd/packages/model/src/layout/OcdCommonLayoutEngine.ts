/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OcdViewCoords } from "../OcdDesign"

export class OcdCommonLayoutEngine {
    coords: OcdViewCoords[]
    maxColumns = 5
    spacing = 32
    detailedWidth = 150
    simpleWidth = 32
    simpleHeight = 32
    containerWidth = 200
    containerHeight = 200
    columnLayout: string[][] = []
    allSpecifiedResources: string[] = []

    constructor(coords: OcdViewCoords[]) {
        this.coords = coords
    }

    createCoordsHierarchy(coords: OcdViewCoords[]): OcdViewCoords[] {
        // Add Children to Parent Coords
        coords.filter((c) => c.container).forEach((parent) => {
            const children = this.getChildren(parent.ocid)
            children.forEach((child) => {
                child.pgid = parent.id
                parent.coords ? parent.coords.push(child) : parent.coords = [child]
            })
        })
        return coords.filter(c => c.pgid === '') // Only Coords Without Parent
    }

    layout(detailed: boolean = true, coords: OcdViewCoords[]): OcdViewCoords[] {
        const rootCoords = coords ? this.createCoordsHierarchy(coords) : this.createCoordsHierarchy(this.coords)
        rootCoords.filter((c) => c.container).forEach((p) => this.layoutChildren(detailed, p))
        this.layoutRoot(detailed, rootCoords)
        return rootCoords
    }

    layoutChildren(detailed: boolean = true, parent: OcdViewCoords): OcdViewCoords {
        if (parent.coords) {
            // Reset Width & Height
            parent.w = this.spacing
            parent.h = (this.spacing + this.simpleHeight)
            const children = parent.coords
            children.filter((c) => c.container).forEach((coords) => this.layoutChildren(detailed, coords))
            let childX = this.spacing
            let childY = this.spacing + this.simpleHeight
            let childCount = 0
            // Layout Simple
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
                parent.w = Math.max(parent.w, (childX + this.spacing))
                parent.h = childY + this.spacing + this.simpleHeight
            })
            // Containers
            childX = this.spacing
            childY += children.findIndex((c) => !c.container) >= 0 ? (this.spacing + this.simpleHeight) : 0
            children.filter((c) => c.container).forEach((child) => {
                child.x = childX
                child.y = childY
                // Add Spacing
                childY += (this.spacing + child.h)
                // Size Container
                parent.w = Math.max(parent.w, (child.w + (2 * this.spacing)))
                parent.h += (child.h + this.spacing)
            })
        }
        return parent
    }

    layoutRoot(detailed: boolean = true, children: OcdViewCoords[]): OcdViewCoords[] {
        let childX = this.spacing
        let childY = this.spacing
        const coords: OcdViewCoords = OcdDesign.newCoords()
        const missingTypes = children.filter((c) => !this.allSpecifiedResources.includes(c.class)).map((c) => c.class)
        // Append Resource Types missing from spcification to display at end
        this.columnLayout.push(missingTypes)
        this.columnLayout.forEach((types) => {
            childX += this.layoutAsColumn(detailed, coords, childX, types, children)
        })
        // missingTypes.forEach((types) => {
        //     childX = this.layoutAsColumn(detailed, coords, childX, types, children)
        // })
        return children
    }

    layoutAsColumn = (detailed: boolean = true, coords: OcdViewCoords, childX: number = this.spacing, types: string[], children: OcdViewCoords[]): number => {
        let childY = this.spacing
        let columnWidth = 0
        // console.debug('OcdCommonLayoutEngine: childX:', childX, 'Types:', types, 'Children:', children)
        children.filter((c) => types.includes(c.class)).forEach((child) => {
            // console.debug('OcdCommonLayoutEngine: Processing:', child)
            child.x = childX
            child.y = childY
            // Add Spacing
            childY += (this.spacing + (child.container ? child.h : this.simpleHeight) as number)
            // Set Column Width
            columnWidth = Math.max(columnWidth, (child.container ? child.w : (detailed ? this.detailedWidth : this.simpleWidth) as number))
            // Size Container
            coords.w = Math.max(coords.w, (childX + this.spacing))
            coords.h = childY + this.spacing + this.simpleHeight
        })
        // console.debug('OcdCommonLayoutEngine: Column Width:', columnWidth)
        columnWidth += columnWidth !== 0 ? (this.spacing * 2) : 0
        // console.debug('OcdCommonLayoutEngine: Column Width:', columnWidth)
        return columnWidth
    }

    getChildren = (pocid: string) => this.coords.filter((c) => c.pocid === pocid)
}
