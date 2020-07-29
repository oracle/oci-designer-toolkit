/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded NAT Gateway Javascript');

/*
** Define NAT Gateway Class
 */
class NATGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.nat_gateways.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.block_traffic = false;
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new NATGateway(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Internet Gateway references
        for (let route_table of this.getOkitJson().route_tables) {
            for (let i = 0; i < route_table.route_rules.length; i++) {
                if (route_table.route_rules[i]['network_entity_id'] === this.id) {
                    route_table.route_rules.splice(i, 1);
                }
            }
        }
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'ng';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'NAT Gateway';
    }

}
