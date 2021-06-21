/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { SubnetResource } from 'subnet_resource.js'

class Subnet extends SubnetResource {
    constructor(resource) {
        super(resource)
    }
}

export default Subnet
export { Subnet }
