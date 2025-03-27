/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdProviderImporter } from "./OcdProviderImporter.js"
import { OciResourceBuilder } from './provider/oci/OciResourceBuilder.js'

export class OciImporter extends OcdProviderImporter {

    constructor() {
        super('oci', new OciResourceBuilder())
    }

    convertResources() {
        super.convertResources()
        // OCI Specific Additional Conversions
        const ociRescources = this.design.model.oci.resources
        // Add backendSetId for OKIT Reference
        if (ociRescources.hasOwnProperty('load_balancer_backend_set') && ociRescources.hasOwnProperty('load_balancer_backend')) {
            ociRescources.load_balancer_backend.forEach((lbe) => lbe.backendSetId = ociRescources.load_balancer_backend_set.find((l) => l.displayName === lbe.backendsetName)?.id)
        }
        // Add Compartment Id for display purposes
        if (ociRescources.hasOwnProperty('load_balancer_backend_set') && ociRescources.hasOwnProperty('load_balancer')) {
            ociRescources.load_balancer_backend_set.forEach((lbe) => lbe.compartmentId = ociRescources.load_balancer.find((l) => l.id === lbe.loadBalancerId)?.compartmentId)
        }
        if (ociRescources.hasOwnProperty('load_balancer_listener') && ociRescources.hasOwnProperty('load_balancer')) {
            ociRescources.load_balancer_listener.forEach((lbe) => lbe.compartmentId = ociRescources.load_balancer.find((l) => l.id === lbe.loadBalancerId)?.compartmentId)
        }
        if (ociRescources.hasOwnProperty('route_table') && ociRescources.hasOwnProperty('vcn')) {
            ociRescources.route_table.forEach((r) => {r.compartmentId = r.compartmentId ?? ociRescources.vcn.find((v) => v.id === r.vcnId)?.compartmentId})
        }
        if (ociRescources.hasOwnProperty('security_list') && ociRescources.hasOwnProperty('vcn')) {
            ociRescources.security_list.forEach((r) => {r.compartmentId = r.compartmentId ?? ociRescources.vcn.find((v) => v.id === r.vcnId)?.compartmentId})
        }
        if (ociRescources.hasOwnProperty('dhcp_options') && ociRescources.hasOwnProperty('vcn')) {
            ociRescources.dhcp_options.forEach((r) => {r.compartmentId = r.compartmentId ?? ociRescources.vcn.find((v) => v.id === r.vcnId)?.compartmentId})
        }
    }

}

export default OciImporter
