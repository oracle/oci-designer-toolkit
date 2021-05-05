
/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitResourceProperties } from '../okit_resource_properties.js'

class InstancePool extends OkitResourceProperties {
    static model = {
        actual_size: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Actual Size'
            },
        instance_configuration_id: {
                required: true,
                editable: true,
                type: 'datalist',
                label: 'Instance Configuration Id'
            },
        size: {
                required: true,
                editable: true,
                type: 'datalist',
                label: 'Size'
            },
    }
}

export default InstancePool
export { InstancePool }
