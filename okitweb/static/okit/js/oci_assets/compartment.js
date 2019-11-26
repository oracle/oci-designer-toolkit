console.info('Loaded Compartment Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[compartment_artifact] = [];
asset_connect_targets[compartment_artifact] = [];
asset_add_functions[compartment_artifact] = "addCompartment";
asset_delete_functions[compartment_artifact] = "deleteCompartment";
asset_clear_functions.push("clearCompartmentVariables");

const compartment_stroke_colour = "#F80000";
const compartment_query_cb = "compartment-query-cb";
//const min_compartment_dimensions = {width:$('#canvas-wrapper').width(), height:$('#canvas-wrapper').height()};
let compartment_ids = [];
let compartment_bui_sub_artifacts = {};

/*
** Reset variables
 */

function clearCompartmentVariables() {
    compartment_ids = [];
    compartment_bui_sub_artifacts = {};
}

/*
** Add Asset to JSON Model
 */
// TODO: Delete
function addCompartmentDeprecated(compartment_id='') {
    let id = 'okit-' + compartment_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + compartment_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('compartments')) {
        okitJson['compartments'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    compartment_ids.push(id);

    // Increment Count
    let compartment_count = okitJson['compartments'].length + 1;
    let compartment = {};
    compartment['id'] = id;
    compartment['name'] = generateDefaultName(compartment_prefix, compartment_count);
    compartment['compartment_id'] = compartment_id;
    okitJson['compartments'].push(compartment);
    okitIdsJsonObj[id] = compartment['name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawCompartmentSVG(compartment);
    drawSVGforJson();
    loadCompartmentProperties(id);
    //openCompartment(id);
    //$('#' + id + "-tab-button").trigger('click');
    console.groupEnd();
}

// TODO: Delete
function initialiseCompartmentChildDataDeprecated(id) {
    // Add BUI artifact positional information
    compartment_bui_sub_artifacts[id] = {
        "compartment_position": 0,
        "compartment_count": 0,
        "artifact_position": 0,
        "artifact_count": 0
    };
}

/*
** Delete From JSON Model
 */

// TODO: Delete
function deleteCompartmentDeprecated(id) {
    console.groupCollapsed('Delete ' + compartment_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['compartments'].length; i++) {
        if (okitJson['compartments'][i]['id'] == id) {
            okitJson['compartments'].splice(i, 1);
        }
    }
    console.groupEnd();
}

/*
** SVG Creation
 */
// TODO: Delete
function getCompartmentFirstChildOffsetDeprecated() {
    let offset = {
        dx: Math.round(positional_adjustments.spacing.x),
        dy: Math.round(positional_adjustments.padding.y * 2)
    };
    return offset;
}

// TODO: Delete
function getCompartmentFirstChildContainerOffsetDeprecated(id='') {
    let offset = {
        dx: Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.y * 2),
        dy: Math.round(positional_adjustments.padding.y * 2)
    };
    return offset;
}

// TODO: Delete
function getCompartmentDimensionsDeprecated(id='') {
    console.groupCollapsed('Getting Dimensions of ' + compartment_artifact + ' : ' + id);
    const min_compartment_dimensions = {width:$('#canvas-wrapper').width(), height:$('#canvas-wrapper').height()};
    let dimensions = {width:container_artifact_x_padding * 2, height:container_artifact_y_padding * 2};
    let max_sub_container_dimensions = {width:0, height: 0, count:0};
    let max_virtual_cloud_network_dimensions = {width:0, height: 0, count:0};
    // Virtual Cloud Networks
    if (okitJson.hasOwnProperty('virtual_cloud_networks')) {
        for (let virtual_cloud_network of okitJson['virtual_cloud_networks']) {
            if (virtual_cloud_network['compartment_id'] == id) {
                let virtual_cloud_network_dimensions = getVirtualCloudNetworkDimensions(virtual_cloud_network['id']);
                max_virtual_cloud_network_dimensions['width'] = Math.max(virtual_cloud_network_dimensions['width'], max_virtual_cloud_network_dimensions['width']);
                max_virtual_cloud_network_dimensions['height'] += virtual_cloud_network_dimensions['height'];
                max_virtual_cloud_network_dimensions['count'] += 1;
            }
        }
    }
    // Calculate Largest Width
    // User 3 * positional_adjustments.spacing.y because positioning of vcn uses x-left of 2 * positional_adjustments.spacing.y and we want a space on the right.
    dimensions['width'] = Math.max((max_virtual_cloud_network_dimensions['width'] + positional_adjustments.padding.x + (3 * positional_adjustments.spacing.x)),
        max_sub_container_dimensions['width']);
    // Calculate Height
    dimensions['height'] += max_sub_container_dimensions['height'];
    dimensions['height'] += max_sub_container_dimensions['count'] + positional_adjustments.spacing.y;
    dimensions['height'] += max_virtual_cloud_network_dimensions['height'];
    dimensions['height'] += max_virtual_cloud_network_dimensions['count'] + positional_adjustments.spacing.y;
    // Check size against minimum
    dimensions['width'] = Math.max(dimensions['width'], min_compartment_dimensions['width']);
    dimensions['height'] = Math.max(dimensions['height'], min_compartment_dimensions['height']);

    console.info('Sub Container Dimensions         : ' + JSON.stringify(max_sub_container_dimensions));
    console.info('Virtual Cloud Network Dimensions : ' + JSON.stringify(max_virtual_cloud_network_dimensions));
    console.info('Overall Dimensions               : ' + JSON.stringify(dimensions));

    console.groupEnd();
    return dimensions;
}

// TODO: Delete
function newCompartmentDefinitionDeprecated(artifact, position=0) {
    let dimensions = getCompartmentDimensions(artifact['id']);
    let definition = newArtifactSVGDefinition(artifact, compartment_artifact);
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = compartment_stroke_colour;
    definition['rect']['stroke']['dash'] = 5;
    definition['name']['show'] = true;
    definition['label']['show'] = true;
    return definition;
}

// TODO: Delete
function drawCompartmentSVGDeprecated(artifact) {
    let id = artifact['id'];
    let parent_id = "canvas";
    let compartment_id = artifact['id'];
    artifact['parent_id'] = parent_id;
    artifact['compartment_id'] = id;
    console.groupCollapsed('Drawing ' + compartment_artifact + ' : ' + id);

    artifact['display_name'] = artifact['name'];

    let svg = drawArtifact(newCompartmentDefinition(artifact));

    //let rect = svg.select("rect[id='" + id + "']");
    let rect = svg.select("rect[id='" + id + "']");
    let boundingClientRect = rect.node().getBoundingClientRect();
    /*
     Add click event to display properties
     Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
     Add dragevent versions
     Set common attributes on svg element and children
     */
    svg.on("click", function() {
        loadCompartmentProperties(id);
        d3.event.stopPropagation();
    });
    /*
        .on("dragenter", handleDragEnter)
        .on("dragover", handleDragOver)
        .on("dragleave", handleDragLeave)
        .on("drop", handleDrop)
        .on("dragend", handleDragEnd);
    */

    initialiseCompartmentChildData(id);
    console.groupEnd();
}

/*
** Property Sheet Load function
 */
// TODO: Delete
function loadCompartmentPropertiesDeprecated(id) {
    $("#properties").load("propertysheets/compartment.html", function () {
        if ('compartments' in okitJson) {
            console.info('Loading ' + compartment_artifact + ' : ' + id);
            let json = okitJson['compartments'];
            for (let i = 0; i < json.length; i++) {
                let compartment = json[i];
                //console.info(JSON.stringify(compartment, null, 2));
                if (compartment['id'] == id) {
                    // Load Properties
                    loadProperties(compartment);
                    // Add Event Listeners
                    addPropertiesEventListeners(compartment, []);
                    okitJson['open_compartment_index'] = i;
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryCompartmentAjax() {
    console.info('------------- queryCompartmentAjax --------------------');
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/Compartment',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(okitQueryRequestJson),
        success: function(resp) {
            let response_json = [JSON.parse(resp)];
            okitJson['compartments'] = response_json;
            let len =  response_json.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    console.info('queryCompartmentAjax : ' + response_json[i]['name']);
                    /*
                    queryVirtualCloudNetworkAjax(response_json[i]['id']);
                    queryBlockStorageVolumeAjax(response_json[i]['id']);
                    queryDynamicRoutingGatewayAjax(response_json[i]['id']);
                    */
                    initiateCompartmentSubQueries(response_json[i]['id']);
                }
            } else {
                initiateCompartmentSubQueries(null);
            }
            redrawSVGCanvas();
            $('#' + compartment_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.error('Status : '+ status);
            console.error('Error  : '+ error);
        }
    });
}

function initiateCompartmentSubQueries(id='') {
    queryVirtualCloudNetworkAjax(id);
    queryBlockStorageVolumeAjax(id);
    queryDynamicRoutingGatewayAjax(id);
    queryAutonomousDatabaseAjax(id);
    queryObjectStorageBucketAjax(id);
}

// TODO: Delete
function loadCompartmentPaletteIconSVG() {
    console.info('------------- queryCompartmentAjax --------------------');
    $.ajax({
        type: 'get',
        url: palette_svg[compartment_artifact],
        dataType: 'xml',
        success: function(response) {
            console.info('loadCompartmentPaletteIconSVG Success');
            console.info(response);
            let xml = $(response);
            console.info("XML : " + xml.text());
            let g = xml.find("g");
            console.info("g : " + g.text());
        },
        error: function(xhr, status, error) {
            console.info('loadCompartmentPaletteIconSVG Error : '+ error)
            console.info('loadCompartmentPaletteIconSVG Status : '+ status)
        }
    });
}

$(document).ready(function() {
    clearCompartmentVariables();

    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', compartment_query_cb);
    cell.append('label').text(compartment_artifact);
    //loadCompartmentPaletteIconSVG();
});















/*
** Define Compartment Artifact Class
 */
class Compartment extends OkitContainerArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.parent_id = 'canvas';
        this.id = 'okit-' + compartment_prefix + '-' + uuidv4();
        this.compartment_id = this.id;
        this.name = generateDefaultName(compartment_prefix, okitjson.compartments.length + 1);
        this.display_name = this.name;
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new Compartment(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return compartment_artifact;
    }


    /*
    ** Delete Processing
     */
    delete() {
        console.groupCollapsed('Delete ' + this.getArtifactReference() + ' : ' + id);
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
        console.groupCollapsed('Drawing ' + compartment_artifact + ' : ' + this.id);
        let svg = drawArtifact(this.getSvgDefinition());
        // Add Properties Load Event to created svg
        let me = this;
        svg.on("click", function() {
            me.loadProperties();
            d3.event.stopPropagation();
        });
        console.groupEnd();
    }

    getSvgDefinition() {
        let dimensions = this.getDimensions(this.id);
        let definition = this.newSVGDefinition(this, compartment_artifact);
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = compartment_stroke_colour;
        definition['rect']['stroke']['dash'] = 5;
        definition['name']['show'] = true;
        definition['label']['show'] = true;
        return definition;
    }

    getDimensions() {
        return super.getDimensions('compartment_id');
    }
    // TODO: Delete
    getDimensions1(id='') {
        console.groupCollapsed('Getting Dimensions of ' + compartment_artifact + ' : ' + id);
        const min_compartment_dimensions = this.getMinimumDimensions();
        let dimensions = {width:container_artifact_x_padding * 2, height:container_artifact_y_padding * 2};
        let max_sub_container_dimensions = {width:0, height: 0, count:0};
        let max_virtual_cloud_network_dimensions = {width:0, height: 0, count:0};
        // Virtual Cloud Networks
        if (this.getOkitJson().hasOwnProperty('virtual_cloud_networks')) {
            for (let virtual_cloud_network of this.getOkitJson().virtual_cloud_networks) {
                if (virtual_cloud_network['compartment_id'] == id) {
                    let virtual_cloud_network_dimensions = virtual_cloud_network.getDimensions();
                    max_virtual_cloud_network_dimensions['width'] = Math.max(virtual_cloud_network_dimensions['width'], max_virtual_cloud_network_dimensions['width']);
                    max_virtual_cloud_network_dimensions['height'] += virtual_cloud_network_dimensions['height'];
                    max_virtual_cloud_network_dimensions['count'] += 1;
                }
            }
        }
        // Calculate Largest Width
        // User 3 * positional_adjustments.spacing.y because positioning of vcn uses x-left of 2 * positional_adjustments.spacing.y and we want a space on the right.
        dimensions['width'] = Math.max((max_virtual_cloud_network_dimensions['width'] + positional_adjustments.padding.x + (3 * positional_adjustments.spacing.x)),
            max_sub_container_dimensions['width']);
        // Calculate Height
        dimensions['height'] += max_sub_container_dimensions['height'];
        dimensions['height'] += max_sub_container_dimensions['count'] + positional_adjustments.spacing.y;
        dimensions['height'] += max_virtual_cloud_network_dimensions['height'];
        dimensions['height'] += max_virtual_cloud_network_dimensions['count'] + positional_adjustments.spacing.y;
        // Check size against minimum
        dimensions['width'] = Math.max(dimensions['width'], min_compartment_dimensions['width']);
        dimensions['height'] = Math.max(dimensions['height'], min_compartment_dimensions['height']);

        console.info('Sub Container Dimensions         : ' + JSON.stringify(max_sub_container_dimensions));
        console.info('Virtual Cloud Network Dimensions : ' + JSON.stringify(max_virtual_cloud_network_dimensions));
        console.info('Overall Dimensions               : ' + JSON.stringify(dimensions));

        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        // Check if this is the top level container
        if (this.id === this.compartment_id) {
            return {width: $('#canvas-wrapper').width(), height: $('#canvas-wrapper').height()};
        } else {
            return {width: container_artifact_x_padding * 2, height: container_artifact_y_padding * 2};
        }
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $("#properties").load("propertysheets/compartment.html", function () {
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
        return [compartment_artifact];
    }


    /*
    ** Child Type Functions
     */
    getContainerArtifacts() {
        return [virtual_cloud_network_artifact];
    }
}
