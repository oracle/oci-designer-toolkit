console.info('Loaded Dynamic Routing Gateway Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[dynamic_routing_gateway_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[dynamic_routing_gateway_artifact] = [];
asset_add_functions[dynamic_routing_gateway_artifact] = "addDynamicRoutingGateway";
asset_delete_functions[dynamic_routing_gateway_artifact] = "deleteDynamicRoutingGateway";
asset_clear_functions.push("clearDynamicRoutingGatewayVariables");

const dynamic_routing_gateway_stroke_colour = "purple";
const dynamic_routing_gateway_query_cb = "dynamic-routing-gateway-query-cb";
let dynamic_routing_gateway_ids = [];

/*
** Reset variables
 */

function clearDynamicRoutingGatewayVariables() {
    dynamic_routing_gateway_ids = [];
}

/*
** Add Asset to JSON Model
 */
function addDynamicRoutingGateway(vcn_id, compartment_id) {
    let id = 'okit-' + dynamic_routing_gateway_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding Dynamic Routing Gateway : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('dynamic_routing_gateways')) {
        okitJson['dynamic_routing_gateways'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    dynamic_routing_gateway_ids.push(id);

    // Increment Count
    let dynamic_routing_gateway_count = okitJson['dynamic_routing_gateways'].length + 1;
    let dynamic_routing_gateway = {};
    dynamic_routing_gateway['vcn_id'] = vcn_id;
    dynamic_routing_gateway['virtual_cloud_network'] = '';
    dynamic_routing_gateway['compartment_id'] = compartment_id;
    dynamic_routing_gateway['id'] = id;
    dynamic_routing_gateway['display_name'] = generateDefaultName(dynamic_routing_gateway_prefix, dynamic_routing_gateway_count);
    dynamic_routing_gateway['fast_connect_ids'] = [];
    dynamic_routing_gateway['ipsec_connection_ids'] = [];
    dynamic_routing_gateway['remote_peering_connection_ids'] = [];
    okitJson['dynamic_routing_gateways'].push(dynamic_routing_gateway);
    okitIdsJsonObj[id] = dynamic_routing_gateway['display_name'];
    console.info(JSON.stringify(okitJson, null, 2));
    //drawDynamicRoutingGatewaySVG(dynamic_routing_gateway);
    drawSVGforJson();
    loadDynamicRoutingGatewayProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */

function deleteDynamicRoutingGateway(id) {
    console.groupCollapsed('Delete ' + dynamic_routing_gateway_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['dynamic_routing_gateways'].length; i++) {
        if (okitJson['dynamic_routing_gateways'][i]['id'] == id) {
            okitJson['dynamic_routing_gateways'].splice(i, 1);
        }
    }
    // Remove Subnet references
    if ('route_tables' in okitJson) {
        for (route_table of okitJson['route_tables']) {
            for (let i = 0; i < route_table['route_rules'].length; i++) {
                if (route_table['route_rules'][i]['network_entity_id'] == id) {
                    route_table['route_rules'].splice(i, 1);
                }
            }
        }
    }
    console.groupEnd();
}

/*
** SVG Creation
 */
function getDynamicRoutingGatewayDimensions(id='') {
    return {width:icon_width, height:icon_height};
}

function newDynamicRoutingGatewayDefinition(artifact, position=0) {
    let definition = newArtifactSVGDefinition(artifact, dynamic_routing_gateway_artifact);
    let dimensions = getDynamicRoutingGatewayDimensions();
    definition['svg']['x'] = Math.round(icon_width * 2 + (icon_width * position) + (icon_spacing * position));
    definition['svg']['y'] = 0;
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = dynamic_routing_gateway_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

function drawDynamicRoutingGatewaySVG(artifact) {
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + dynamic_routing_gateway_artifact + ' : ' + id + ' [' + parent_id + ']');

    if (!virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        virtual_cloud_network_bui_sub_artifacts[parent_id] = {};
    }

    if (virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!virtual_cloud_network_bui_sub_artifacts[parent_id].hasOwnProperty('gateway_position')) {
            virtual_cloud_network_bui_sub_artifacts[parent_id]['gateway_position'] = 0;
        }
        // Calculate Position
        let position = virtual_cloud_network_bui_sub_artifacts[parent_id]['gateway_position'];
        // Increment Icon Position
        virtual_cloud_network_bui_sub_artifacts[parent_id]['gateway_position'] += 1;

        let svg = drawArtifact(newDynamicRoutingGatewayDefinition(artifact, position));

        //loadDynamicRoutingGatewayProperties(id);
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadDynamicRoutingGatewayProperties(id);
            d3.event.stopPropagation();
        });
        //    .on("contextmenu", handleContextMenu);
    } else {
        console.warn(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
    console.groupEnd();
}

/*
** Property Sheet Load function
 */
function loadDynamicRoutingGatewayProperties(id) {
    $("#properties").load("propertysheets/dynamic_routing_gateway.html", function () {
        if ('dynamic_routing_gateways' in okitJson) {
            console.info('Loading DynamicRouting Gateway: ' + id);
            let json = okitJson['dynamic_routing_gateways'];
            for (let i = 0; i < json.length; i++) {
                let dynamic_routing_gateway = json[i];
                //console.info(JSON.stringify(dynamic_routing_gateway, null, 2));
                if (dynamic_routing_gateway['id'] == id) {
                    //console.info('Found DynamicRouting Gateway: ' + id);
                    dynamic_routing_gateway['virtual_cloud_network'] = okitIdsJsonObj[dynamic_routing_gateway['vcn_id']];
                    // Build Fast Connect Select
                    let fast_connect_select = $('#fast_connect_ids');
                    if (okitJson.hasOwnProperty('fast_connects')) {
                        for (let fast_connect of okitJson['fast_connects']) {
                            fast_connect_select.append($('<option>').attr('value', fast_connect['id']).text(fast_connect['display_name']));
                        }
                    }
                    // Load Properties
                    loadProperties(dynamic_routing_gateway);
                    // Add Event Listeners
                    addPropertiesEventListeners(dynamic_routing_gateway, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryDynamicRoutingGatewayAjax(compartment_id) {
    console.info('------------- queryDynamicRoutingGatewayAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    if ('dynamic_routing_gateway_filter' in okitQueryRequestJson) {
        request_json['dynamic_routing_gateway_filter'] = okitQueryRequestJson['dynamic_routing_gateway_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/DynamicRoutingGateway',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            //okitJson['dynamic_routing_gateways'] = response_json;
            okitJson.load({dynamic_routing_gateways: response_json});
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryDynamicRoutingGatewayAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + dynamic_routing_gateway_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

/*
** Define Dynamic Routing Gateway Class
 */
class DynamicRoutingGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        // Configure default values
        this.id = 'okit-' + dynamic_routing_gateway_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(dynamic_routing_gateway_prefix, okitjson.dynamic_routing_gateways.length + 1);
        this.compartment_id = data.compartment_id;
        this.vcn_id = data.parent_id;
        this.fast_connect_ids = [];
        this.ipsec_connection_ids = [];
        this.remote_peering_connection_ids = [];
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.vcn_id;
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            for (let parent of okitjson.virtual_cloud_networks) {
                if (parent.id === this.parent_id) {
                    this.getParent = function () {
                        return parent
                    };
                    break;
                }
            }
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new DynamicRoutingGateway(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return dynamic_routing_gateway_artifact;
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

    deleteChildren() {
        // Remove Dynamic Routing Gateway references
        for (route_table of this.getOkitJson().route_tables) {
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
        definition['rect']['stroke']['colour'] = dynamic_routing_gateway_stroke_colour;
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
        $("#properties").load("propertysheets/dynamic_routing_gateway.html", function () {
            // Load Referenced Ids
            let fast_connect_select = $('#fast_connect_ids');
            for (let fast_connect of okitJson.fast_connects) {
                if (me.vcn_id == fast_connect.vcn_id) {
                    fast_connect_select.append($('<option>').attr('value', fast_connect.id).text(fast_connect.display_name));
                }
            }
            // Load Properties
            loadProperties(me);
            // Add Event Listeners
            addPropertiesEventListeners(me, []);
        });
    }


    /*
    ** Child Offset Functions
     */
    getFirstChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x),
            dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
        };
        return offset;
    }

    getContainerChildOffset() {
        let offset = this.getFirstContainerChildOffset();
        return offset;
    }

    getTopEdgeChildOffset() {
        let offset = this.getFirstTopEdgeChildOffset();
        return offset;
    }

    getBottomEdgeChildOffset() {}

    getLeftEdgeChildOffset() {}

    getRightEdgeChildOffset() {}

    getTopChildOffset() {
        let offset = this.getTopEdgeChildOffset();
        return offset;
    }
    getBottomChildOffset() {}

    getLeftChildOffset() {}

    getRightChildOffset() {}


    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        // Return list of Artifact names
        return [];
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
    cell.append('label').text(dynamic_routing_gateway_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(dynamic_routing_gateway_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'dynamic_routing_gateway_name_filter')
        .attr('name', 'dynamic_routing_gateway_name_filter');
});

