/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Route Table Javascript');

/*
** Define Route Table Class
 */
class RouteTable extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.route_tables.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.route_rules = [];
        this.default = false;
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    newRule() {
        return {
            target_type: "internet_gateway",
            destination_type: "CIDR_BLOCK",
            destination: "0.0.0.0/0",
            network_entity_id: "",
            description: ""
        }
    }

    /*
    ** Delete Processing
     */
    deleteReferences() {
        // Subnet Reference
        this.getOkitJson().getSubnets().forEach((r) => r.route_table_id = r.route_table_id === this.id ? '' : r.route_table_id)
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'rt';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Route Table';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newRouteTable = function(data) {
    console.info('New Route Table');
    this.getRouteTables().push(new RouteTable(data, this));
    return this.getRouteTables()[this.getRouteTables().length - 1];
}
OkitJson.prototype.getRouteTables = function() {
    if (!this.route_tables) this.route_tables = [];
    return this.route_tables;
}
OkitJson.prototype.getRouteTable = function(id='') {
    for (let artefact of this.getRouteTables()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteRouteTable = function(id) {
    this.route_tables = this.route_tables ? this.route_tables.filter((r) => r.id !== id) : []
}
