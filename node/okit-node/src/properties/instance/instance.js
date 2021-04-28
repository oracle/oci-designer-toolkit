
/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitResourceProperties } from '../okit_resource_properties.js'

class Instance extends OkitResourceProperties {
    static model = {
        availability_domain: {
                required: true,
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
        dedicated_vm_host_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Dedicated Vm Host Id'
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
        hostname_label: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Hostname Label'
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
                required: true,
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
        system_tags: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'System Tags'
            },
        time_maintenance_reboot_due: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Time Maintenance Reboot Due'
            },
    }
}

export default Instance
export { Instance }
