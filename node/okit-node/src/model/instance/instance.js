/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { InstanceResource } from 'instance_resource.js'

class Instance extends InstanceResource {
    constructor(resource) {
        super(resource)
    }
}

export default Instance
export { Instance }
