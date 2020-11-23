/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded IPSecConnection Javascript');

/*
** Define Block Storage Volume Class
 */
class IPSecConnection extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.ipsec_connections.length + 1);
        this.compartment_id = data.parent_id;
        this.cpe_id = '';
        this.drg_id = '';
        this.static_routes = [];
        this.cpe_local_identifier = '';
        this.cpe_local_identifier_type = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new IPSecConnection(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */


    getNamePrefix() {
        return super.getNamePrefix() + 'ipsec';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'IPSec Connection';
    }

}
