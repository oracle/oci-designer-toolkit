console.info('Loaded Load Balancer Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[load_balancer_artifact] = [subnet_artifact];
asset_connect_targets[load_balancer_artifact] = [];
asset_add_functions[load_balancer_artifact] = "addLoadBalancer";
asset_update_functions[load_balancer_artifact] = "updateLoadBalancer";
asset_delete_functions[load_balancer_artifact] = "deleteLoadBalancer";
asset_clear_functions.push("clearLoadBalancerVariables");

const load_balancer_stroke_colour = "#F80000";
const load_balancer_query_cb = "load-balancer-query-cb";
const load_balancer_width = Math.round(icon_width * 6);
const load_balancer_height = Math.round(icon_height * 3 / 2);
const load_balancer_svg_width = Math.round(load_balancer_width + icon_x * 2);
const load_balancer_svg_height = Math.round(load_balancer_height + icon_y * 2);
let load_balancer_ids = [];

/*
** Reset variables
 */

function clearLoadBalancerVariables() {
    load_balancer_ids = [];
}

/*
** Add Asset to JSON Model
 */
// TODO: Delete
function addLoadBalancerDeprecated(subnet_id, compartment_id) {
    let id = 'okit-' + load_balancer_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + load_balancer_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('load_balancers')) {
        okitJson['load_balancers'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    load_balancer_ids.push(id);

    // Increment Count
    let load_balancer_count = okitJson['load_balancers'].length + 1;
    let load_balancer = {};
    load_balancer['subnet_ids'] = [subnet_id];
    load_balancer['subnets'] = [''];
    load_balancer['compartment_id'] = compartment_id;
    load_balancer['id'] = id;
    load_balancer['display_name'] = generateDefaultName(load_balancer_prefix, load_balancer_count);
    load_balancer['is_private'] = false;
    load_balancer['shape_name'] = '100Mbps';
    load_balancer['protocol'] = 'HTTP';
    load_balancer['port'] = '80';
    load_balancer['instances'] = [];
    load_balancer['instance_ids'] = [];
    okitJson['load_balancers'].push(load_balancer);
    okitIdsJsonObj[id] = load_balancer['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawLoadBalancerSVG(load_balancer);
    drawSVGforJson();
    loadLoadBalancerProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */

// TODO: Delete
function deleteLoadBalancerDeprecated(id) {
    console.groupCollapsed('Delete ' + load_balancer_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i = 0; i < okitJson['load_balancers'].length; i++) {
        if (okitJson['load_balancers'][i]['id'] == id) {
            okitJson['load_balancers'].splice(i, 1);
        }
    }
    console.groupEnd();
}

/*
** SVG Creation
 */
// TODO: Delete
function getLoadBalancerDimensionsDeprecated(id='') {
    return {width:load_balancer_width, height:load_balancer_height};
}

// TODO: Delete
function newLoadBalancerDefinitionDeprecated(artifact, position=0) {
    let dimensions = getLoadBalancerDimensions();
    let definition = newArtifactSVGDefinition(artifact, load_balancer_artifact);
    let first_child = getSubnetFirstChildLoadBalancerOffset(artifact['subnet_ids'][0]);
    definition['svg']['x'] = Math.round(first_child.dx + (load_balancer_width * position) + (positional_adjustments.spacing.x * position));
    definition['svg']['y'] = Math.round(first_child.dy);
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = load_balancer_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    definition['name']['show'] = true;
    return definition;
}

// TODO: Delete
function drawLoadBalancerSVGDeprecated(artifact) {
    let parent_id = artifact['subnet_ids'][0];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + load_balancer_artifact + ' : ' + id + ' [' + parent_id + ']');

    if (!subnet_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        subnet_bui_sub_artifacts[parent_id] = {};
    }

    // Only draw the instance if the subnet exists
    if (parent_id in subnet_bui_sub_artifacts) {
        if (!subnet_bui_sub_artifacts[parent_id].hasOwnProperty('load_balancer_position')) {
            subnet_bui_sub_artifacts[parent_id]['load_balancer_position'] = 0;
        }
        // Calculate Position
        let position = subnet_bui_sub_artifacts[parent_id]['load_balancer_position'];
        // Increment Icon Position
        subnet_bui_sub_artifacts[parent_id]['load_balancer_position'] += 1;

        let svg = drawArtifact(newLoadBalancerDefinition(artifact, position));

        //loadLoadBalancerProperties(id);
        let rect = d3.select('#' + id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadLoadBalancerProperties(id);
            d3.event.stopPropagation();
        });
        svg.attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true);
    }
    // Draw Connectors
    drawLoadBalancerConnectorsSVG(artifact);
    console.groupEnd();
    return;
}

// TODO: Delete
function clearLoadBalancerConnectorsSVGDeprecated(load_balancer) {
    let id = load_balancer['id'];
    d3.selectAll("line[id*='" + id + "']").remove();
}

// TODO: Delete
function drawLoadBalancerConnectorsSVGDeprecated(load_balancer) {
    let parent_id = load_balancer['subnet_ids'][0];
    let id = load_balancer['id'];
    let parent_svg = d3.select('#' + parent_id + "-svg");
    let parent_rect = d3.select('#' + parent_id);
    // Only Draw if parent exists
    if (parent_svg.node()) {
        console.info('Parent SVG     : ' + parent_svg.attr('id'));
        // Define SVG position manipulation variables
        let svgPoint = parent_svg.node().createSVGPoint();
        let screenCTM = parent_rect.node().getScreenCTM();
        svgPoint.x = d3.select('#' + id).attr('data-connector-start-x');
        svgPoint.y = d3.select('#' + id).attr('data-connector-start-y');
        let connector_start = svgPoint.matrixTransform(screenCTM.inverse());
        console.info('Start svgPoint.x : ' + svgPoint.x);
        console.info('Start svgPoint.y : ' + svgPoint.y);
        console.info('Start matrixTransform.x : ' + connector_start.x);
        console.info('Start matrixTransform.y : ' + connector_start.y);

        let connector_end = null;

        if (load_balancer['instance_ids'].length > 0) {
            for (let i = 0; i < load_balancer['instance_ids'].length; i++) {
                let instance_svg = d3.select('#' + load_balancer['instance_ids'][i]);
                if (instance_svg.node()) {
                    svgPoint.x = instance_svg.attr('data-connector-start-x');
                    svgPoint.y = instance_svg.attr('data-connector-start-y');
                    connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                    console.info('End svgPoint.x   : ' + svgPoint.x);
                    console.info('End svgPoint.y   : ' + svgPoint.y);
                    console.info('End matrixTransform.x : ' + connector_end.x);
                    console.info('End matrixTransform.y : ' + connector_end.y);
                    let polyline = drawConnector(parent_svg, generateConnectorId(load_balancer['instance_ids'][i], id),
                        {x:connector_start.x, y:connector_start.y}, {x:connector_end.x, y:connector_end.y});
                    /*
                    parent_svg.append('line')
                        .attr("id", generateConnectorId(load_balancer['instance_ids'][i], id))
                        .attr("x1", connector_start.x)
                        .attr("y1", connector_start.y)
                        .attr("x2", connector_end.x)
                        .attr("y2", connector_end.y)
                        .attr("stroke-width", "2")
                        .attr("stroke", "black")
                        .attr("marker-start", "url(#connector-end-circle)")
                        .attr("marker-end", "url(#connector-end-circle)");
                    */
                }
            }
        }
    }
}

/*
** Property Sheet Load function
 */
// TODO: Delete
function loadLoadBalancerPropertiesDeprecated(id) {
    $("#properties").load("propertysheets/load_balancer.html", function () {
        let name_id_mapping = {
            "instances": "instance_ids",
            "instance_ids": "instances"
        };
        if ('load_balancers' in okitJson) {
            console.info('Loading Load Balancer: ' + id);
            let json = okitJson['load_balancers'];
            for (let i = 0; i < json.length; i++) {
                let load_balancer = json[i];
                //console.info(JSON.stringify(load_balancer, null, 2));
                if (load_balancer['id'] == id) {
                    load_balancer['subnet'] = okitIdsJsonObj[load_balancer['subnet_ids'][0]];
                    let instances_select = $('#instance_ids');
                    //console.info('Instance Ids: ' + instance_ids);
                    for (let slid of instance_ids) {
                        instances_select.append($('<option>').attr('value', slid).text(okitIdsJsonObj[slid]));
                    }
                    // Load Properties
                    loadProperties(load_balancer);
                    // Add Event Listeners
                    addPropertiesEventListeners(load_balancer, [drawSVGforJson]);
                    break;
                }
            }
        }
    });
}

/*
** OKIT Json Update Function
 */
function updateLoadBalancer(source_type, source_id, id) {
    console.info('Update Load Balancer : ' + id + ' Adding ' + source_type + ' ' + source_id);
    let load_balancers = okitJson['load_balancers'];
    console.info(JSON.stringify(load_balancers))
    for (let i = 0; i < load_balancers.length; i++) {
        let load_balancer = load_balancers[i];
        console.info(i + ') ' + JSON.stringify(load_balancer))
        if (load_balancer['id'] == id) {
            if (source_type == instance_artifact) {
                if (load_balancer['instance_ids'].indexOf(source_id) > 0) {
                    // Already connected so delete existing line
                    d3.select("#" + generateConnectorId(source_id, id)).remove();
                } else {
                    load_balancer['instance_ids'].push(source_id);
                    load_balancer['instances'].push(okitIdsJsonObj[source_id]);
                }
            }
        }
    }
    displayOkitJson();
    loadLoadBalancerProperties(id);
}

/*
** Query OCI
 */

function queryLoadBalancerAjax(compartment_id, subnet_id) {
    console.info('------------- queryLoadBalancerAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['subnet_id'] = subnet_id;
    if ('load_balancer_filter' in okitQueryRequestJson) {
        request_json['load_balancer_filter'] = okitQueryRequestJson['load_balancer_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/LoadBalancer',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function (resp) {
            let response_json = JSON.parse(resp);
            okitJson['load_balancers'] = response_json;
            let len = response_json.length;
            for (let i = 0; i < len; i++) {
                console.info('queryLoadBalancerAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + load_balancer_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function (xhr, status, error) {
            console.info('Status : ' + status)
            console.info('Error : ' + error)
        }
    });
}

$(document).ready(function () {
    clearLoadBalancerVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', load_balancer_query_cb);
    cell.append('label').text(load_balancer_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(load_balancer_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'load_balancer_name_filter')
        .attr('name', 'load_balancer_name_filter');
});















/*
** Define Load Balancer Class
 */
class LoadBalancer extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        // Configure default values
        this.id = 'okit-' + load_balancer_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(load_balancer_prefix, okitjson.load_balancers.length + 1);
        this.compartment_id = '';
        this.subnet_id = data.parent_id;
        this.subnet_ids = [data.parent_id];
        this.is_private = false;
        this.shape_name = '100Mbps';
        this.protocol = 'HTTP';
        this.port = '80';
        this.instance_ids = [];
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.subnet_id;
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            for (let parent of okitjson.subnets) {
                if (parent.id === this.parent_id) {
                    this.getParent = function () {return parent};
                    break;
                }
            }
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new LoadBalancer(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return load_balancer_artifact;
    }


    /*
    ** Delete Processing
     */
    delete() {
        console.groupCollapsed('Delete ' + this.getArtifactReference() + ' : ' + this.id);
        // Delete Child Artifacts
        this.deleteChildren();
        // Remove SVG Element
        d3.select("#" + this.id + "-svg").remove()
        console.groupEnd();
    }

    deleteChildren() {}


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let svg = drawArtifact(this.getSvgDefinition());
        /*
        ** Add Properties Load Event to created svg. We require the definition of the local variable "me" so that it can
        ** be used in the function dur to the fact that using "this" in the function will refer to the function not the
        ** Artifact.
         */
        let me = this;
        svg.on("click", function() {
            me.loadProperties();
            d3.event.stopPropagation();
        });
        // Get Inner Rect to attach Connectors
        //let rect = d3.select('#' + this.id);
        let rect = svg.select("rect[id='" + this.id + "']");
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
    }

    drawConnectors() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let parent_svg = d3.select('#' + this.parent_id + "-svg");
        let parent_rect = d3.select('#' + this.parent_id);
        // Only Draw if parent exists
        if (parent_svg.node()) {
            console.info('Parent SVG     : ' + parent_svg.attr('id'));
            // Define SVG position manipulation variables
            let svgPoint = parent_svg.node().createSVGPoint();
            let screenCTM = parent_rect.node().getScreenCTM();
            svgPoint.x = d3.select('#' + this.id).attr('data-connector-start-x');
            svgPoint.y = d3.select('#' + this.id).attr('data-connector-start-y');
            let connector_start = svgPoint.matrixTransform(screenCTM.inverse());
            console.info('Start svgPoint.x : ' + svgPoint.x);
            console.info('Start svgPoint.y : ' + svgPoint.y);
            console.info('Start matrixTransform.x : ' + connector_start.x);
            console.info('Start matrixTransform.y : ' + connector_start.y);

            let connector_end = null;

            if (this.instance_ids.length > 0) {
                for (let i = 0; i < this.instance_ids.length; i++) {
                    let instance_svg = d3.select('#' + this.instance_ids[i]);
                    if (instance_svg.node()) {
                        svgPoint.x = instance_svg.attr('data-connector-start-x');
                        svgPoint.y = instance_svg.attr('data-connector-start-y');
                        connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                        console.info('End svgPoint.x   : ' + svgPoint.x);
                        console.info('End svgPoint.y   : ' + svgPoint.y);
                        console.info('End matrixTransform.x : ' + connector_end.x);
                        console.info('End matrixTransform.y : ' + connector_end.y);
                        let polyline = drawConnector(parent_svg, generateConnectorId(this.instance_ids[i], this.id),
                            {x:connector_start.x, y:connector_start.y}, {x:connector_end.x, y:connector_end.y});
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
        definition['rect']['stroke']['colour'] = load_balancer_stroke_colour;
        definition['rect']['stroke']['dash'] = 1;
        definition['name']['show'] = true;
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
        return {width: load_balancer_width, height:load_balancer_height};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $("#properties").load("propertysheets/load_balancer.html", function () {
            // Load Referenced Ids
            let instances_select = $('#instance_ids');
            for (let instance of okitJson.instances) {
                instances_select.append($('<option>').attr('value', instance.id).text(instance.display_name));
            }
            // Load Properties
            loadProperties(me);
            // Add Event Listeners
            addPropertiesEventListeners(me, []);
        });
    }


    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        // Return list of Artifact names
        return [];
    }
}

