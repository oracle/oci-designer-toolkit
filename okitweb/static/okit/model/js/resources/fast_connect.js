/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded FastConnect Javascript');

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
        // this.display_name = this.generateDefaultName(okitjson.fast_connects.length + 1);
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
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newFastConnect = function(data) {
    console.info('New FastConnect');
    this.getFastConnects().push(new FastConnect(data, this));
    return this.getFastConnects()[this.getFastConnects().length - 1];
}
OkitJson.prototype.getFastConnects = function() {
    if (!this.fast_connects) this.fast_connects = [];
    return this.fast_connects;
}
OkitJson.prototype.getFastConnect = function(id='') {
    for (let artefact of this.getFastConnects()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteFastConnect = function(id) {
    this.fast_connects = this.fast_connects ? this.fast_connects.filter((r) => r.id !== id) : []
}
