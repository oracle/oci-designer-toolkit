/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded IpsecConnection Javascript');

/*
** Define Block Storage Volume Class
 */
class IpsecConnection extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.ipsec_connections.length + 1);
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
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newIpsecConnection = function(data) {
    console.info('New IPSec Connection');
    this.getIpsecConnections().push(new IpsecConnection(data, this));
    return this.getIpsecConnections()[this.getIpsecConnections().length - 1];
}
OkitJson.prototype.getIpsecConnections = function() {
    if (!this.ipsec_connections) this.ipsec_connections = [];
    return this.ipsec_connections;
}
OkitJson.prototype.getIpsecConnection = function(id='') {
    for (let artefact of this.getIpsecConnections()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteIpsecConnection = function(id) {
    this.ipsec_connections = this.ipsec_connections ? this.ipsec_connections.filter((r) => r.id !== id) : []
}
