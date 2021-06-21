/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

/*
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
** Generated : 07/05/2021 16:58:49
**
*/

import { OkitResourceProperties } from '../okit_resource_properties.js'

class InstanceResource extends OkitResourceProperties {
    static model = {
        availability_domain: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Availability Domain'
            },
        boot_volume_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Boot Volume Id'
            },
        compartment_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Compartment Id'
            },
        dedicated_vm_host_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Dedicated Vm Host Id'
            },
        defined_tags: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Defined Tags'
            },
        display_name: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Display Name'
            },
        extended_metadata: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Extended Metadata'
            },
        fault_domain: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Fault Domain'
            },
        freeform_tags: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Freeform Tags'
            },
        hostname_label: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Hostname Label'
            },
        id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Id'
            },
        image: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Image'
            },
        ipxe_script: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Ipxe Script'
            },
        is_pv_encryption_in_transit_enabled: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Is Pv Encryption In Transit Enabled'
            },
        launch_mode: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Launch Mode'
            },
        metadata: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Metadata'
            },
        preserve_boot_volume: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Preserve Boot Volume'
            },
        private_ip: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Private Ip'
            },
        public_ip: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Public Ip'
            },
        region: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Region'
            },
        shape: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Shape'
            },
        subnet_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Subnet Id'
            },
        time_maintenance_reboot_due: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Time Maintenance Reboot Due'
            },
        agent_config: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Agent Config'
            },
        availability_config: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Availability Config'
            },
        create_vnic_details: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Create Vnic Details'
            },
        instance_options: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Instance Options'
            },
        launch_options: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Launch Options'
            },
        platform_config: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Platform Config'
            },
        shape_config: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Shape Config'
            },
        source_details: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Source Details'
            },
    }

    constructor(resource) {
        super(resource)
        this.tf_resource_name = 'oci_core_instance'
    }
}

export default InstanceResource
export { InstanceResource }
