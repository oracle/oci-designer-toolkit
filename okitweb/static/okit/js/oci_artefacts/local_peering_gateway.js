/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Local Peering Gateway Javascript');

const local_peering_gateway_query_cb = "local-peering-gateway-query-cb";

/*
** Define Local Peering Gateway Class
 */
class LocalPeeringGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.local_peering_gateways.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.route_table_id = '';
        this.peer_id = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = () => {return parent};
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new LocalPeeringGateway(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {}


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let me = this;
        let svg = super.draw();
        // Add Highlighting
        let fill = d3.select(d3Id(this.id)).attr('fill');
        svg.on("mouseover", function () {
            if (me.peer_id !== '') {
                d3.selectAll(d3Id(me.peer_id)).attr('fill', svg_highlight_colour);
                d3.select(d3Id(me.id)).attr('fill', svg_highlight_colour);
            }
            d3.event.stopPropagation();
        });
        svg.on("mouseout", function () {
            if (me.peer_id !== '') {
                d3.selectAll(d3Id(me.peer_id)).attr('fill', fill);
                d3.select(d3Id(me.id)).attr('fill', fill);
            }
            d3.event.stopPropagation();
        });
        console.groupEnd();
        return svg;
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        console.groupCollapsed('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let dimensions = this.getDimensions();
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    // Return Artifact Dimensions
    getDimensions() {
        console.groupCollapsed('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getMinimumDimensions();
        // Calculate Size based on Child Artifacts
        // Check size against minimum
        dimensions.width  = Math.max(dimensions.width,  this.getMinimumDimensions().width);
        dimensions.height = Math.max(dimensions.height, this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: icon_width, height:icon_height};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/local_peering_gateway.html", () => {
            // Load Referenced Ids
            let route_table_select = $(jqId('route_table_id'));
            route_table_select.append($('<option>').attr('value', '').text(''));
            for (let route_table of okitJson.route_tables) {
                if (me.vcn_id === route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            // Load Local Peering Gateways from other VCNs
            let remote_peering_gateway_select = $(jqId('peer_id'));
            remote_peering_gateway_select.append($('<option>').attr('value', '').text(''));
            for (let local_peering_gateway of okitJson.local_peering_gateways) {
                if (me.vcn_id !== local_peering_gateway.vcn_id) {
                    remote_peering_gateway_select.append($('<option>').attr('value', local_peering_gateway.id).text(local_peering_gateway.display_name));
                }
            }
            // Load Properties
            loadPropertiesSheet(me);
            $(jqId('peer_id')).on('blur', () => {okitJson.getLocalPeeringGateway(me.peer_id).peer_id = me.id;});
        });
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'lpg';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Local Peering Gateway';
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

    static query(request = {}, region='') {
        console.info('------------- Local Peering Gateway Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/LocalPeeringGateway',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({local_peering_gateways: response_json});
                for (let artifact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artifact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + local_peering_gateway_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + local_peering_gateway_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }
}

function setPeeredGatewayPeerId(input_id, artifact) {
    if (input_id === 'peer_id' && artifact.peer_id) {
        okitJson.getLocalPeeringGateway(artifact.peer_id).peer_id = artifact.id;
    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', local_peering_gateway_query_cb);
    cell.append('label').text(LocalPeeringGateway.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(LocalPeeringGateway.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'local_peering_gateway_name_filter')
        .attr('name', 'local_peering_gateway_name_filter');
});
