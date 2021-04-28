
/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitResourceModel } from '../okit_resource_model.js'

class Instance extends OkitResourceModel {
    static model = {}
    constructor() {
        super()
        availability_domain = undefined
        boot_volume_id = undefined
        dedicated_vm_host_id = undefined
        extended_metadata = undefined
        fault_domain = undefined
        hostname_label = undefined
        image = undefined
        ipxe_script = undefined
        is_pv_encryption_in_transit_enabled = undefined
        launch_mode = undefined
        metadata = undefined
        preserve_boot_volume = undefined
        private_ip = undefined
        public_ip = undefined
        region = undefined
        shape = undefined
        subnet_id = undefined
        system_tags = undefined
        time_maintenance_reboot_due = undefined
    }
}

export default Instance
export { Instance }
