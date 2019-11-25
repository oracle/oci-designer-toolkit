console.info('Loaded NAT Gateway Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[nat_gateway_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[nat_gateway_artifact] = [];
asset_add_functions[nat_gateway_artifact] = "addNATGateway";
asset_delete_functions[nat_gateway_artifact] = "deleteNATGateway";
asset_clear_functions.push("clearNATGatewayVariables");

const nat_gateway_stroke_colour = "purple";
const nat_gateway_query_cb = "nat-gateway-query-cb";
let nat_gateway_ids = [];

/*
** Reset variables
 */

// TODO: Delete
function clearNATGatewayVariables() {
    nat_gateway_ids = [];
}

/*
** Add Asset to JSON Model
 */
// TODO: Delete
function addNATGatewayDeprecated(vcn_id, compartment_id) {
    let id = 'okit-' + nat_gateway_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + nat_gateway_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('nat_gateways')) {
        okitJson['nat_gateways'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    nat_gateway_ids.push(id);

    // Increment Count
    let nat_gateway_count = okitJson['nat_gateways'].length + 1;
    let nat_gateway = {};
    nat_gateway['vcn_id'] = vcn_id;
    nat_gateway['virtual_cloud_network'] = '';
    nat_gateway['compartment_id'] = compartment_id;
    nat_gateway['id'] = id;
    nat_gateway['display_name'] = generateDefaultName(nat_gateway_prefix, nat_gateway_count);
    okitJson['nat_gateways'].push(nat_gateway);
    okitIdsJsonObj[id] = nat_gateway['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawNATGatewaySVG(nat_gateway);
    drawSVGforJson();
    loadNATGatewayProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */

// TODO: Delete
function deleteNATGatewayDeprecated(id) {
    console.groupCollapsed('Delete ' + nat_gateway_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['nat_gateways'].length; i++) {
        if (okitJson['nat_gateways'][i]['id'] == id) {
            okitJson['nat_gateways'].splice(i, 1);
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
// TODO: Delete
function getNATGatewayDimensionsDeprecated(id='') {
    return {width:icon_width, height:icon_height};
}

// TODO: Delete
function newNATGatewayDefinitionDeprecated(artifact, position=0) {
    let dimensions = getNATGatewayDimensions();
    let definition = newArtifactSVGDefinition(artifact, nat_gateway_artifact);
    let first_child = getVirtualCloudNetworkFirstChildGatewayOffset();
    definition['svg']['x'] = Math.round(first_child.dx + (icon_width * position) + (positional_adjustments.spacing.x * position));
    definition['svg']['y'] = first_child.dy;
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = nat_gateway_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

// TODO: Delete
function drawNATGatewaySVGDeprecated(artifact) {
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + nat_gateway_artifact + ' : ' + id + ' [' + parent_id + ']');

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

        let svg = drawArtifact(newNATGatewayDefinition(artifact, position));

        //loadNATGatewayProperties(id);
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadNATGatewayProperties(id);
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
// TODO: Delete
function loadNATGatewayPropertiesDeprecated(id) {
    $("#properties").load("propertysheets/nat_gateway.html", function () {
        if ('nat_gateways' in okitJson) {
            console.info('Loading NAT Gateway: ' + id);
            let json = okitJson['nat_gateways'];
            for (let i = 0; i < json.length; i++) {
                let nat_gateway = json[i];
                //console.info(JSON.stringify(nat_gateway, null, 2));
                if (nat_gateway['id'] == id) {
                    //console.info('Found NAT Gateway: ' + id);
                    nat_gateway['virtual_cloud_network'] = okitIdsJsonObj[nat_gateway['vcn_id']];
                    // Load Properties
                    loadProperties(nat_gateway);
                    // Add Event Listeners
                    addPropertiesEventListeners(nat_gateway, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryNATGatewayAjax(compartment_id, vcn_id) {
    console.info('------------- queryNATGatewayAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('nat_gateway_filter' in okitQueryRequestJson) {
        request_json['nat_gateway_filter'] = okitQueryRequestJson['nat_gateway_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/NATGateway',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            okitJson['nat_gateways'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryNATGatewayAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + nat_gateway_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

$(document).ready(function() {
    clearNATGatewayVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', nat_gateway_query_cb);
    cell.append('label').text(nat_gateway_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(nat_gateway_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'nat_gateway_name_filter')
        .attr('name', 'nat_gateway_name_filter');
});















/*
** Define NAT Gateway Class
 */
class NATGateway extends OkitSvgArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.id = 'okit-' + nat_gateway_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(nat_gateway_prefix, okitjson.nat_gateways.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.vcn_id;
        for (let parent of okitjson.virtual_cloud_networks) {
            if (parent.id === this.parent_id) {
                this.getParent = function() {return parent};
                break;
            }
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new NATGateway(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return nat_gateway_artifact;
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
        // Remove Internet Gateway references
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
        let position = 1;
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let dimensions = this.getDimensions();
        //let first_child = this.getParent().getTopEdgeChildOffset();
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = nat_gateway_stroke_colour;
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
        $("#properties").load("propertysheets/nat_gateway.html", function () {
            // Load Referenced Ids
            // Load Properties
            loadProperties(me);
            // Add Event Listeners
            addPropertiesEventListeners(me, [okitJson.draw]);
        });
    }


    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        // Return list of Artifact names
        return [virtual_cloud_gateway_artifact];
    }
}

