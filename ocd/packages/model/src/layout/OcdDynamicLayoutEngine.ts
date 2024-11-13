/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OcdViewCoords } from "../OcdDesign.js"
import { OcdCommonLayoutEngine } from "./OcdCommonLayoutEngine.js"

export class OcdDynamicLayoutEngine extends OcdCommonLayoutEngine {

    constructor(coords: OcdViewCoords[], design: OcdDesign) {
        super(coords, design)
        // Column Layouts
        this.columnLayout = [
            ['oci-internet-gateway', 'oci-nat-gateway'], 
            ['oci-dhcp-options', 'oci-policy', 'oci-route-table', 'oci-security-list'],
            ['oci-vcn', 'oci-subnet', 'oci-load-balancer'],
            ['oci-instance'], 
            ['oci-boot-volume', 'oci-mount-target', 'oci-volume', 'oci-drg'], 
            ['oci-ipsec', 'oci-file-system'], 
            ['oci-cpe']
        ]
        // All Specified Resources
        this.allSpecifiedResources = this.columnLayout.flat()
    }

}
