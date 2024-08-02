/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OcdViewCoords } from "../OcdDesign"
import { OcdCommonLayoutEngine } from "./OcdCommonLayoutEngine"

export class OcdOkitWebLayoutEngine extends OcdCommonLayoutEngine {

    constructor(coords: OcdViewCoords[]) {
        super(coords)
        // Column Layouts
        this.columnLayout = [
            ['oci-policy', 'oci-vault', 'oci-dynamic-group', 'oci-group', 'oci-user'],
            ['oci-internet-gateway', 'oci-nat-gateway'], 
            ['oci-dhcp-options', 'oci-policy', 'oci-route-table', 'oci-security-list'],
            ['oci-vcn', 'oci-subnet', 'oci-load-balancer', 'oci-network-load-balancer'],
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
                'top': ['oci-dhcp-options', 'oci-route-table', 'oci-security-list'],
                'right': [],
                'bottom': []
            }
        }
        // All Specified Resources
        this.allSpecifiedResources = this.columnLayout.flat()
    }

}
