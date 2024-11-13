/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OcdViewCoords } from "../OcdDesign.js"
import OcdSingleColumnLayoutEngine from "./OcdSingleColumnLayoutEngine.js"

export class OcdTwoColumnLayoutEngine extends OcdSingleColumnLayoutEngine {
    constructor(coords: OcdViewCoords[], design: OcdDesign) {
        super(coords, design)
        // Column Layouts
        this.columnLayout = [
            ['oci-vcn', 'oci-subnet', 'oci-load-balancer']
        ]
        // All Specified Resources
        this.allSpecifiedResources = this.columnLayout.flat()
    }
}
