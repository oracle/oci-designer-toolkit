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
** Generated : 07/05/2021 16:58:41
**
*/

import { OkitResourceModel } from '../okit_resource_model.js'

class InstanceResource extends OkitResourceModel {
    constructor() {
        super()
        availability_domain = ''
        boot_volume_id = ''
        dedicated_vm_host_id = ''
        extended_metadata = {}
        fault_domain = ''
        hostname_label = ''
        image = ''
        ipxe_script = ''
        is_pv_encryption_in_transit_enabled = false
        launch_mode = ''
        metadata = {}
        preserve_boot_volume = false
        private_ip = ''
        public_ip = ''
        region = ''
        shape = ''
        subnet_id = ''
        time_maintenance_reboot_due = ''
        agent_config = {
          are_all_plugins_disabled: false,
          is_management_disabled: false,
          is_monitoring_disabled: false,
          plugins_config: []
        }
        availability_config = {
          recovery_action: ''
        }
        create_vnic_details = {
          assign_public_ip: '',
          hostname_label: '',
          nsg_ids: [],
          private_ip: '',
          skip_source_dest_check: false,
          subnet_id: '',
          vlan_id: ''
        }
        instance_options = {
          are_legacy_imds_endpoints_disabled: false
        }
        launch_options = {
          boot_volume_type: '',
          firmware: '',
          is_consistent_volume_naming_enabled: false,
          is_pv_encryption_in_transit_enabled: false,
          network_type: '',
          remote_data_volume_type: ''
        }
        platform_config = {
          numa_nodes_per_socket: '',
          type: ''
        }
        shape_config = {
          gpu_description: '',
          gpus: 0,
          local_disk_description: '',
          local_disks: 0,
          local_disks_total_size_in_gbs: 0,
          max_vnic_attachments: 0,
          memory_in_gbs: 0,
          networking_bandwidth_in_gbps: 0,
          ocpus: 0,
          processor_description: ''
        }
        source_details = {
          boot_volume_size_in_gbs: '',
          kms_key_id: '',
          source_id: '',
          source_type: ''
        }
    }
}

export default InstanceResource
export { InstanceResource }
