/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { CompartmentResource } from 'compartment_resource.js'

class Compartment extends CompartmentResource {
    constructor(resource) {
        super(resource)
    }
}

export default Compartment
export { Compartment }
