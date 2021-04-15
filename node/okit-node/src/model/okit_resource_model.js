/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

class OkitResourceModel {
    static model = {}
    constructor() {
        this.compartment_id = undefined
        this.id = undefined
        this.documentation = undefined
        this.freeform_tags = undefined
        this.defined_tags = undefined
        this.resource_name = undefined
        this.read_only = false
    }
}

export { OkitResourceModel }
