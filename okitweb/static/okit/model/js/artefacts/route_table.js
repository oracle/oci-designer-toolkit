/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Route Table Javascript');

const route_table_query_cb = "route-table-query-cb";

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
        this.display_name = this.generateDefaultName(okitjson.route_tables.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.route_rules = [];
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new RouteTable(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Subnet references
        for (let subnet of this.getOkitJson().subnets) {
            if (subnet.route_table_id === this.id) {
                subnet.route_table_id = '';
            }
        }
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

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', route_table_query_cb);
    cell.append('label').text(RouteTable.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(RouteTable.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'route_table_name_filter')
        .attr('name', 'route_table_name_filter');
});















