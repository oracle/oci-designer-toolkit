/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdViewCoords } from "../OcdDesign"
import OcdSingleColumnLayoutEngine from "./OcdSingleColumnLayoutEngine"

export class OcdTwoColumnLayoutEngine extends OcdSingleColumnLayoutEngine {
    constructor(coords: OcdViewCoords[]) {
        super(coords)
        // Column Layouts
        this.columnLayout = [
            ['oci-vcn', 'oci-subnet', 'oci-load-balancer']
        ]
        // All Specified Resources
        this.allSpecifiedResources = this.columnLayout.flat()
    }
}
