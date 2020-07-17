/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Dynamic Routing Gateway Javascript');

const dynamic_routing_gateway_query_cb = "dynamic-routing-gateway-query-cb";

/*
** Define Dynamic Routing Gateway Class
 */
class DynamicRoutingGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.dynamic_routing_gateways.length + 1);
        this.compartment_id = data.compartment_id;
        this.vcn_id = data.parent_id;
        this.fast_connect_ids = [];
        this.ipsec_connection_ids = [];
        this.remote_peering_connection_ids = [];
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new DynamicRoutingGateway(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Dynamic Routing Gateway references
        for (let route_table of this.getOkitJson().route_tables) {
            for (let i = 0; i < route_table.route_rules.length; i++) {
                if (route_table.route_rules[i]['network_entity_id'] === this.id) {
                    route_table.route_rules.splice(i, 1);
                }
            }
        }
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'drg';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Dynamic Routing Gateway';
    }

    static query(request = {}, region='') {
        console.info('------------- Dynamic Routing Gateway Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/DynamicRoutingGateway',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({dynamic_routing_gateways: response_json});
                for (let artefact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artefact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + dynamic_routing_gateway_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + dynamic_routing_gateway_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', dynamic_routing_gateway_query_cb);
    cell.append('label').text(DynamicRoutingGateway.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(DynamicRoutingGateway.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'dynamic_routing_gateway_name_filter')
        .attr('name', 'dynamic_routing_gateway_name_filter');
});

