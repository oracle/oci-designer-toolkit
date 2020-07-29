/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Instance Pool Javascript');

/*
** Define Compartment Artifact Class
 */
class InstancePool extends OkitArtifact {
    /*
    ** Create
     */
    constructor(data = {}, okitjson = {}) {
        super(okitjson);
        // Configure default values
        this.name = this.generateDefaultName(okitjson.compartments.length + 1);
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert();
    }

    /*
    ** Clone Functionality
     */
    clone() {
        return new InstancePool(this, this.getOkitJson());
    }
}