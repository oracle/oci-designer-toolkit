
/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitResourceModel } from '../okit_resource_model.js'

class InstancePool extends OkitResourceModel {
    static model = {}
    constructor() {
        super()
        actual_size = undefined
        instance_configuration_id = undefined
        size = undefined
    }
}

export default InstancePool
export { InstancePool }
