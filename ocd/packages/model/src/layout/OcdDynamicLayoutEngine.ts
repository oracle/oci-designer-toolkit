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
            ['oci-policy', 'oci-dynamic-group', 'oci-vault', 'oci-key'],
            ['oci-internet-gateway', 'oci-nat-gateway'], 
            ['oci-dhcp-options', 'oci-route-table', 'oci-security-list', 'oci-network-security-group'],
            ['oci-vcn', 'oci-subnet', 'oci-load-balancer', 'oci-network-load-balancer', 'oci-web-app-firewall', 'oci-api-gateway'],
            ['oci-instance', 'oci-functions-application', 'oci-functions-function', 'oci-oke-cluster', 'oci-oke-node-pool', 'oci-bastion'], 
            ['oci-db-system', 'oci-data-safe-target-database', 'oci-data-safe-security-assessment'],
            ['oci-log-group', 'oci-log-analytics-log-group', 'oci-service-connector', 'oci-streaming-stream-pool', 'oci-streaming-stream', 'oci-monitoring-alarm', 'oci-budget', 'oci-cloud-guard-target'],
            ['oci-boot-volume', 'oci-mount-target', 'oci-volume', 'oci-drg'], 
            ['oci-ipsec', 'oci-file-system'], 
            ['oci-cpe']
        ]
        // All Specified Resources
        this.allSpecifiedResources = this.columnLayout.flat()
    }

}
