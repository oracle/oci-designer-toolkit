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
        this.gateway_id = '';
        this.cross_connect_group = this.newCrossConnectGroup()
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    newCrossConnectGroup() {
        return {
            customer_reference_name: '',
            cross_connect: [this.newCrossConnect()]
        };
    }

    newCrossConnect() {
        return {
            location_name: '',
            port_speed_shape_name: ''
        };
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
