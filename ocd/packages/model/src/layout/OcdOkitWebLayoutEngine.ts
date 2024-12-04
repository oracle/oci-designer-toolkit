/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OcdViewCoords } from "../OcdDesign.js"
import { OcdCommonLayoutEngine } from "./OcdCommonLayoutEngine.js"
import { OciResource } from "../index.js"

export class OcdOkitWebLayoutEngine extends OcdCommonLayoutEngine {
    moveToChild: Record<string, string[]> = {'oci-subnet': ['oci-dhcp-option', 'oci-route-table', 'oci-security-list']}

    constructor(coords: OcdViewCoords[], design: OcdDesign) {
        super(coords, design)
        // Column Layouts
        this.columnLayout = [
            ['oci-policy', 'oci-vault', 'oci-dynamic-group', 'oci-group', 'oci-user'],
            ['oci-internet-gateway', 'oci-nat-gateway'], 
            ['oci-dhcp-options', 'oci-policy', 'oci-route-table', 'oci-security-list'],
            ['oci-vcn', 'oci-subnet', 'oci-load-balancer', 'oci-network-load-balancer', 'oci-network-security-group'],
            ['oci-instance'], 
            ['oci-boot-volume', 'oci-mount-target', 'oci-volume', 'oci-drg'], 
            ['oci-ipsec', 'oci-file-system'], 
            ['oci-cpe']
        ]
        // Edge Layouts
        this.edgeLayout = {
            'oci-vcn': {
                'left': [],
                'top': ['oci-internet-gateway', 'oci-nat-gateway'],
                'right': ['oci-local-peering-gateway', 'oci-service-gateway', 'oci-dynamic-group.attachment'],
                'bottom': []
            },
            'oci-subnet': {
                'left': [],
                'top': ['oci-route-table', 'oci-security-list'],
                'right': ['oci-dhcp-options'],
                'bottom': []
            }
        }
        // Hidden Parent Connections
        this.hideParentConnections = ['oci-dhcp-option', 'oci-route-table', 'oci-security-list']
        // All Specified Resources
        this.allSpecifiedResources = this.columnLayout.flat()
    }

    createCoordsHierarchy(coords: OcdViewCoords[]): OcdViewCoords[] {
        console.debug('OcdOkitWebLayoutEngine: createCoordsHierarchy', coords)
        let rootCoords = super.createCoordsHierarchy(coords)
        let movedChildren: string[] = []
        // Adjust & Duplicate Resources
        Object.entries(this.moveToChild).forEach(([k, v]) => {
            console.debug("OcdOkitWebLayoutEngine: Move Children for", k)
            coords.filter((parent) => parent.class === k).forEach((parent) => {
                const associationIds = this.getResourceAssociationIds(parent.ocid)
                console.debug("OcdOkitWebLayoutEngine: Processing", parent, associationIds)
                coords.filter((child) => associationIds.includes(child.ocid)).forEach((child) => {
                    // Change Parent
                    if (movedChildren.includes(child.ocid)) {
                        // Duplicate
                        const duplicateChild = OcdDesign.duplicateCoords(child)
                        duplicateChild.pgid = parent.id
                        duplicateChild.showParentConnection = false
                        parent.coords ? parent.coords.push(duplicateChild) : parent.coords = [duplicateChild]
                        parent.showConnections = false
                    } else {
                        // Remove from existing parent Child Coords
                        const origParentCoords = coords.find((c) => c.id === child.pgid)
                        if (origParentCoords) origParentCoords.coords = origParentCoords.coords?.filter((c) => c.id !== child.id)
                        child.pgid = parent.id
                        child.showParentConnection = false
                        parent.coords ? parent.coords.push(child) : parent.coords = [child]
                        movedChildren.push(child.ocid)
                    }
                })
            })
        })
        return rootCoords
    }

    layoutChildren(detailed: boolean, parent: OcdViewCoords): OcdViewCoords {
        if (parent.coords) {
            // Reset Width & Height
            parent.w = this.spacing
            parent.h = (this.spacing + this.simpleHeight)
            const children = parent.coords
            children.filter((c) => c.container).forEach((coords) => this.layoutChildren(detailed, coords))
            let childX = this.spacing
            let childY = this.spacing + this.simpleHeight
            let childCount = 0
            // Layout Left & Top Edges
            const edgeCoords = Object.keys(this.edgeLayout).includes(parent.class) ? this.edgeLayout[parent.class] : {left: [], top: [], right: [], bottom: []}
            const edgeCoordClasses = [...edgeCoords.left, ...edgeCoords.top, ...edgeCoords.right, ...edgeCoords.bottom]
            console.debug('OcdOkitWebLayoutEngine: layoutChildren:', parent.class, edgeCoords, edgeCoordClasses)
            this.layoutTopEdgeChildren(detailed, parent, edgeCoords.top)
            // Layout Simple
            children.filter((c) => !c.container && !edgeCoordClasses.includes(c.class)).forEach((child) => {
                childCount += 1
                if (childCount > this.maxColumns) {
                    childX = this.spacing
                    childY += (this.spacing + this.simpleHeight)
                    childCount = 0
                }
                child.x = childX
                child.y = childY
                // Add Spacing
                childX += (this.spacing + (detailed ? this.detailedWidth : this.simpleWidth))
                // Size Container
                parent.w = Math.max(parent.w, (childX + this.spacing))
                parent.h = childY + this.spacing + this.simpleHeight
            })
            // Containers
            childX = this.spacing
            childY += children.findIndex((c) => !c.container && !edgeCoordClasses.includes(c.class)) >= 0 ? (this.spacing + this.simpleHeight) : 0
            children.filter((c) => c.container).forEach((child) => {
                const topEdgeAdjustment = Object.keys(this.edgeLayout).includes(child.class) && this.edgeLayout[child.class].top.length > 0 ? (this.simpleHeight / 2) + this.edgeAdjustment : 0
                const rightEdgeAdjustment = Object.keys(this.edgeLayout).includes(child.class) && this.edgeLayout[child.class].right.length > 0 ? (this.detailedWidth - this.simpleHeight - this.edgeAdjustment) : 0

                childY += topEdgeAdjustment
                child.x = childX
                child.y = childY
                // Add Spacing
                childY += (this.spacing + child.h)
                // Size Container
                parent.w = Math.max(parent.w, (child.w + (2 * this.spacing) + rightEdgeAdjustment))
                parent.h += (child.h + this.spacing + topEdgeAdjustment)
            })
            // Layout Right & Bottom Edges
            this.layoutRightEdgeChildren(detailed, parent, edgeCoords.right)
        }
        return parent
    }

    layoutTopEdgeChildren(detailed: boolean, parent: OcdViewCoords, edge: string[]): OcdViewCoords {
        console.debug('OcdOkitWebLayoutEngine: layoutTopEdgeChildren:', parent.class, edge)
        let childX = this.spacing + this.detailedWidth
        let childY = ((this.simpleHeight/2) * -1) - this.edgeAdjustment
        const children = parent.coords ? parent.coords: []
        children.filter((c) => !c.container && edge.includes(c.class)).forEach((child) => {
            child.x = childX
            child.y = childY
            // Add Spacing
            childX += (this.spacing + (detailed ? this.detailedWidth : this.simpleWidth))
            // Size Container
            parent.w = Math.max(parent.w, (childX + this.spacing))
        })

        return parent
    }

    layoutRightEdgeChildren(detailed: boolean, parent: OcdViewCoords, edge: string[]): OcdViewCoords {
        console.debug('OcdOkitWebLayoutEngine: layoutRightEdgeChildren:', parent.class, edge)
        let childX = parent.w - this.simpleWidth - this.edgeAdjustment
        let childY = this.spacing + this.simpleHeight
        const children = parent.coords ? parent.coords: []
        children.filter((c) => !c.container && edge.includes(c.class)).forEach((child) => {
            child.x = childX
            child.y = childY
            // Add Spacing
            childY += (this.spacing + child.h)
            // Size Container
            parent.h = Math.max(parent.h, (childY + this.spacing))
        })

        return parent
    }

    getResourceLists() {return OcdDesign.getResourceLists(this.design)}
    getResource(id='') {return OcdDesign.getResource(this.design, id)}
    getResourceAssociationIds(id: string): string[] {
        const resource = this.getResource(id)
        const associationIds: string[] = (resource.provider === 'oci') ? OciResource.getAssociationIds(resource, this.getResourceLists()) : []
        return associationIds
    }



}
