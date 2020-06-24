/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Load Balancer Javascript');

const load_balancer_query_cb = "load-balancer-query-cb";
const load_balancer_width = Math.round(icon_width * 3);
const load_balancer_height = Math.round(icon_height * 3 / 2);

/*
** Define Load Balancer Class
 */
class LoadBalancer extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.load_balancers.length + 1);
        this.compartment_id = '';
        this.subnet_id = data.parent_id;
        this.subnet_ids = [data.parent_id];
        this.is_private = false;
        this.shape = '100Mbps';
        this.protocol = 'HTTP';
        this.port = '80';
        this.instance_ids = [];
        this.ip_mode = '';
        this.network_security_group_ids = [];
        this.backend_policy = 'ROUND_ROBIN';
        this.health_checker = {url_path: '/'}
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = () => {return parent};
        }
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        if (this.shape_name !== undefined) {this.shape = this.shape_name; delete this.shape_name;}
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new LoadBalancer(this, this.getOkitJson());
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
        // Get Inner Rect to attach Connectors
        let rect = svg.select("rect[id='" + safeId(this.id) + "']");
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add Connector Data
        svg.attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", this.id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", this.id)
            .attr("dragable", true);
        // Draw Connectors
        this.drawConnectors();
        console.groupEnd();
        return svg;
    }

    drawConnectors() {
        console.groupCollapsed('Drawing Connectors for ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        // Check if there are any missing forllowing query
        this.checkConnectors();
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

            if (this.instance_ids.length > 0) {
                for (let i = 0; i < this.instance_ids.length; i++) {
                    let instance_svg = d3.select(d3Id(this.instance_ids[i]));
                    if (instance_svg.node()) {
                        svgPoint.x = instance_svg.attr('data-connector-start-x');
                        svgPoint.y = instance_svg.attr('data-connector-start-y');
                        connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                        console.info('End svgPoint.x   : ' + svgPoint.x);
                        console.info('End svgPoint.y   : ' + svgPoint.y);
                        console.info('End matrixTransform.x : ' + connector_end.x);
                        console.info('End matrixTransform.y : ' + connector_end.y);
                        let polyline = drawConnector(parent_svg, this.generateConnectorId(this.instance_ids[i], this.id),
                            {x:connector_start.x, y:connector_start.y}, {x:connector_end.x, y:connector_end.y});
                    }
                }
            }
        }
        console.groupEnd();
    }

    checkConnectors() {
        if (this.backend_sets) {
            for (let [key, value] of Object.entries(this.backend_sets)) {
                for (let backend of value.backends) {
                    for (let instance of this.getOkitJson().getInstances()) {
                        if (instance.primary_vnic.private_ip === backend.ip_address) {
                            if (!this.instance_ids.includes(instance.id)) {
                                this.instance_ids.push(instance.id);
                                backend.instance_id = instance.id;
                                delete backend.private_ip;
                            }
                        }
                    }
                }
            }
        }
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
        definition['svg']['align'] = "center";
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        definition['name']['show'] = true;
        definition['name']['align'] = "center";
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
        return {width: load_balancer_width, height: load_balancer_height};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/load_balancer.html", () => {
            // Load Referenced Ids
            let instances_select = $(jqId('instance_ids'));
            for (let instance of okitJson.instances) {
                instances_select.append($('<option>').attr('value', instance.id).text(instance.display_name));
            }
            let network_security_groups_select = $(jqId('network_security_group_ids'));
            for (let network_security_group of okitJson.network_security_groups) {
                network_security_groups_select.append($('<option>').attr('value', network_security_group.id).text(network_security_group.display_name));
            }
            // Load Properties
            loadPropertiesSheet(me);
        });
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'lb';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Load Balancer';
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

    static query(request = {}, region='') {
        console.info('------------- Load Balancer Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        console.info('------------- Subnet      : ' + request.subnet_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/LoadBalancer',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({load_balancers: response_json});
                for (let artifact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artifact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + load_balancer_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function (xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + load_balancer_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }
}

$(document).ready(function () {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', load_balancer_query_cb);
    cell.append('label').text(LoadBalancer.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(LoadBalancer.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'load_balancer_name_filter')
        .attr('name', 'load_balancer_name_filter');
});
