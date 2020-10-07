/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded RemotePeeringConnection Javascript');

/*
** Define Block Storage Volume Class
 */
class RemotePeeringConnection extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.ipsec_connections.length + 1);
        this.compartment_id = data.parent_id;
        this.drg_id = '';
        this.peer_id = '';
        this.peer_region_name = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new RemotePeeringConnection(this, this.getOkitJson());
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'rpc';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Remote Peering Connection';
    }

}
