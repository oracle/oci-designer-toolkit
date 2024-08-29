/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded RemotePeeringConnection Javascript');

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
        // this.display_name = this.generateDefaultName(okitjson.ipsec_connections.length + 1);
        this.compartment_id = data.parent_id;
        this.drg_id = '';
        this.peer_id = '';
        this.peer_region_name = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
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
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newRemotePeeringConnection = function(data) {
    console.info('New Remote Peering Connection');
    this.getRemotePeeringConnections().push(new RemotePeeringConnection(data, this));
    return this.getRemotePeeringConnections()[this.getRemotePeeringConnections().length - 1];
}
OkitJson.prototype.getRemotePeeringConnections = function() {
    if (!this.remote_peering_connections) this.remote_peering_connections = [];
    return this.remote_peering_connections;
}
OkitJson.prototype.getRemotePeeringConnection = function(id='') {
    for (let artefact of this.getRemotePeeringConnections()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteRemotePeeringConnection = function(id) {
    this.remote_peering_connections = this.remote_peering_connections ? this.remote_peering_connections.filter((r) => r.id !== id) : []
}
