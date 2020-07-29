/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded FastConnect Javascript');

/*
** Define FastConnect Class
 */
class FastConnect extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.fast_connects.length + 1);
        this.compartment_id = data.parent_id;
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new FastConnect(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {}


    getNamePrefix() {
        return super.getNamePrefix() + 'fc';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Fast Connect';
    }

}
