/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { SecurityListResource } from 'security_list_resource.js'

class SecurityList extends SecurityListResource {
    constructor(resource) {
        super(resource)
    }
}

export default SecurityList
export { SecurityList }
