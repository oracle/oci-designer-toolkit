/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Service Gateway Javascript');

const service_gateway_query_cb = "service-gateway-query-cb";

/*
** Define ServiceGateway Class
 */
class ServiceGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.service_gateways.length + 1);
        this.compartment_id = data.compartment_id;
        this.vcn_id = data.parent_id;
        this.service_name = 'All Services';
        this.autonomous_database_ids = [];
        this.object_storage_bucket_ids = [];
        this.route_table_id = '';
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
        return new ServiceGateway(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Service Gateway references
        for (let route_table of this.getOkitJson().route_tables) {
            for (let i = 0; i < route_table.route_rules.length; i++) {
                if (route_table.route_rules[i]['network_entity_id'] === this.id) {
                    route_table.route_rules.splice(i, 1);
                }
            }
        }
    }


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let me = this;
        let svg = super.draw();
        // Get Inner Rect to attach Connectors
        let rect = svg.select("rect[id='" + safeId(this.id) + "']");
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add Connector Data
        svg.attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height / 2)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height / 2)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width))
            .attr("data-connector-id", this.id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height / 2)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height / 2)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width))
            .attr("data-connector-id", this.id)
            .attr("dragable", true);
        // Draw Connectors
        this.drawConnectors();
        console.groupEnd();
        return svg;
    }

    drawConnectors() {
        console.groupCollapsed('Drawing Connectors for ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        // Get Grand Parent
        let grandparent_id = d3.select(d3Id(this.parent_id)).attr('data-parent-id');
        // Define Connector Parent
        let parent_svg = d3.select(d3Id(grandparent_id + "-svg"));
        let parent_rect = d3.select(d3Id(grandparent_id));
        parent_svg = d3.select(d3Id('canvas-svg'));
        parent_rect = d3.select(d3Id('canvas-rect'));
        // Only Draw if parent exists
        if (parent_svg.node()) {
            console.info('Parent SVG     : ' + parent_svg.attr('id'));
            // Define SVG position manipulation variables
            let svgPoint = parent_svg.node().createSVGPoint();
            let screenCTM = parent_rect.node().getScreenCTM();
            svgPoint.x = d3.select(d3Id(this.id)).attr('data-connector-start-x');
            svgPoint.y = d3.select(d3Id(this.id)).attr('data-connector-start-y');
            let connector_start = svgPoint.matrixTransform(screenCTM.inverse());
            console.info('Start svgPoint.x : ' + svgPoint.x);
            console.info('Start svgPoint.y : ' + svgPoint.y);
            console.info('Start matrixTransform.x : ' + connector_start.x);
            console.info('Start matrixTransform.y : ' + connector_start.y);

            let connector_end = null;

            if (this.autonomous_database_ids.length > 0) {
                for (let i = 0; i < this.autonomous_database_ids.length; i++) {
                    let autonomous_database_svg = d3.select(d3Id(this.autonomous_database_ids[i]));
                    if (autonomous_database_svg.node()) {
                        svgPoint.x = autonomous_database_svg.attr('data-connector-start-x');
                        svgPoint.y = autonomous_database_svg.attr('data-connector-start-y');
                        connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                        console.info('End svgPoint.x   : ' + svgPoint.x);
                        console.info('End svgPoint.y   : ' + svgPoint.y);
                        console.info('End matrixTransform.x : ' + connector_end.x);
                        console.info('End matrixTransform.y : ' + connector_end.y);
                        let polyline = drawConnector(parent_svg, this.generateConnectorId(this.autonomous_database_ids[i], this.id),
                            {x:connector_start.x, y:connector_start.y}, {x:connector_end.x, y:connector_end.y}, true);
                    }
                }
            }

            if (this.object_storage_bucket_ids.length > 0) {
                for (let i = 0; i < this.object_storage_bucket_ids.length; i++) {
                    let object_storage_bucket_svg = d3.select(d3Id(this.object_storage_bucket_ids[i]));
                    if (object_storage_bucket_svg.node()) {
                        svgPoint.x = object_storage_bucket_svg.attr('data-connector-start-x');
                        svgPoint.y = object_storage_bucket_svg.attr('data-connector-start-y');
                        connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                        console.info('End svgPoint.x   : ' + svgPoint.x);
                        console.info('End svgPoint.y   : ' + svgPoint.y);
                        console.info('End matrixTransform.x : ' + connector_end.x);
                        console.info('End matrixTransform.y : ' + connector_end.y);
                        let polyline = drawConnector(parent_svg, this.generateConnectorId(this.object_storage_bucket_ids[i], this.id),
                            {x:connector_start.x, y:connector_start.y}, {x:connector_end.x, y:connector_end.y}, true);
                    }
                }
            }
        }
        console.groupEnd();
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
        definition['rect']['stroke']['colour'] = stroke_colours.purple;
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
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/service_gateway.html", () => {
            // Load Referenced Ids
            let route_table_select = $(jqId('route_table_id'));
            route_table_select.append($('<option>').attr('value', '').text(''));
            for (let route_table of okitJson.route_tables) {
                if (me.vcn_id === route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            let autonomous_database_select = $(jqId('autonomous_database_ids'));
            for (let autonomous_database of okitJson.autonomous_databases) {
                if (me.compartment_id === autonomous_database.compartment_id) {
                    autonomous_database_select.append($('<option>').attr('value', autonomous_database.id).text(autonomous_database.display_name));
                }
            }
            let object_storage_bucket_select = $(jqId('object_storage_bucket_ids'));
            for (let object_storage_bucket of okitJson.object_storage_buckets) {
                if (me.compartment_id === object_storage_bucket.compartment_id) {
                    object_storage_bucket_select.append($('<option>').attr('value', object_storage_bucket.id).text(object_storage_bucket.display_name));
                }
            }
            // Load Properties
            loadPropertiesSheet(me);
        });
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'sg';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Service Gateway';
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

    static query(request = {}, region='') {
        console.info('------------- Service Gateway Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/ServiceGateway',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({service_gateways: response_json});
                for (let artifact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artifact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + service_gateway_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + service_gateway_query_cb).prop('checked', true);
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
        .attr('id', service_gateway_query_cb);
    cell.append('label').text(ServiceGateway.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(ServiceGateway.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'service_gateway_name_filter')
        .attr('name', 'service_gateway_name_filter');
});

