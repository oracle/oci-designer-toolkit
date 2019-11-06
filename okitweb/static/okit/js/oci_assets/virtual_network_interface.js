console.info('Loaded Virtual Network Interface Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[virtual_network_interface_artifact] = [compartment_artifact];
asset_connect_targets[virtual_network_interface_artifact] = [instance_artifact];
asset_add_functions[virtual_network_interface_artifact] = "addVirtualNetworkInterface";
asset_delete_functions[virtual_network_interface_artifact] = "deleteVirtualNetworkInterface";
asset_clear_functions.push("clearVirtualNetworkInterfaceVariables");

const virtual_network_interface_stroke_colour = stroke_colours.svg_red;
const virtual_network_interface_query_cb = "virtual-network-interface-query-cb";
let virtual_network_interface_ids = [];
let virtual_network_interface_count = 0;

/*
** Reset variables
 */

function clearVirtualNetworkInterfaceVariables() {
    virtual_network_interface_ids = [];
    virtual_network_interface_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addVirtualNetworkInterface(parent_id, compartment_id) {
    let id = 'okit-' + virtual_network_interface_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + virtual_network_interface_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('virtual_network_interfaces')) {
        okitJson['virtual_network_interfaces'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    virtual_network_interface_ids.push(id);

    // Increment Count
    virtual_network_interface_count += 1;
    let virtual_network_interface = {};
    virtual_network_interface['compartment_id'] = parent_id;
    virtual_network_interface['id'] = id;
    virtual_network_interface['display_name'] = generateDefaultName(virtual_network_interface_prefix, virtual_network_interface_count);
    okitJson['virtual_network_interfaces'].push(virtual_network_interface);
    okitIdsJsonObj[id] = virtual_network_interface['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawVirtualNetworkInterfaceSVG(virtual_network_interface);
    drawSVGforJson();
    loadVirtualNetworkInterfaceProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */

function deleteVirtualNetworkInterface(id) {
    console.groupCollapsed('Delete ' + virtual_network_interface_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['virtual_network_interfaces'].length; i++) {
        if (okitJson['virtual_network_interfaces'][i]['id'] == id) {
            okitJson['virtual_network_interfaces'].splice(i, 1);
        }
    }
    // Remove Instance references
    if ('instances' in okitJson) {
        for (let instance of okitJson['instances']) {
            for (let i=0; i < instance['virtual_network_interface_ids'].length; i++) {
                if (instance['virtual_network_interface_ids'][i] == id) {
                    instance['virtual_network_interface_ids'].splice(i, 1);
                }
            }
        }
    }
    console.groupEnd();
}

/*
** SVG Creation
 */
function getVirtualNetworkInterfaceDimensions(id='') {
    return {width:icon_width, height:icon_height};
}

function newVirtualNetworkInterfaceDefinition(artifact, position=0) {
    let dimensions = getVirtualNetworkInterfaceDimensions();
    let definition = newArtifactSVGDefinition(artifact, virtual_network_interface_artifact);
    definition['svg']['x'] = Math.round(icon_width / 4);
    definition['svg']['y'] = Math.round((icon_height * 2) + (icon_height * position) + (icon_spacing * position));
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = virtual_network_interface_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

function drawVirtualNetworkInterfaceSVG(artifact) {
    let parent_id = artifact['parent_id'];
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + virtual_network_interface_artifact + ' : ' + id);
    // Check if this Virtual Network Interface Volume has been attached to an Instance and if so do not draw because it will be done
    // as part of the instance
    if (okitJson.hasOwnProperty('instances')) {
        for (let instance of okitJson['instances']) {
            if (instance.hasOwnProperty('virtual_network_interface_ids')) {
                if (instance['virtual_network_interface_ids'].includes(artifact['id'])) {
                    console.info(artifact['display_name'] + ' attached to instance '+ instance['display_name']);
                    console.groupEnd();
                    return;
                }
            }
        }
    }
    if (!artifact.hasOwnProperty('parent_id')) {
        artifact['parent_id'] = artifact['compartment_id'];
    }

    if (!compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        compartment_bui_sub_artifacts[parent_id] = {};
    }

    if (compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!compartment_bui_sub_artifacts[parent_id].hasOwnProperty('virtual_network_interface_position')) {
            compartment_bui_sub_artifacts[parent_id]['virtual_network_interface_position'] = 0;
        }
        // Calculate Position
        let position = compartment_bui_sub_artifacts[parent_id]['virtual_network_interface_position'];
        // Increment Icon Position
        compartment_bui_sub_artifacts[parent_id]['virtual_network_interface_position'] += 1;

        let svg = drawArtifact(newVirtualNetworkInterfaceDefinition(artifact, position));

        let rect = d3.select('#' + id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        /*
         Add click event to display properties
         Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
         Add dragevent versions
         Set common attributes on svg element and children
         */
        svg.on("click", function () {
            loadVirtualNetworkInterfaceProperties(id);
            d3.event.stopPropagation();
        });
    } else {
        console.warn(parent_id + ' was not found in compartment sub artifacts : ' + JSON.stringify(compartment_bui_sub_artifacts));
    }
    console.groupEnd();
}

/*
** Property Sheet Load function
 */
function loadVirtualNetworkInterfaceProperties(id) {
    $("#properties").load("propertysheets/virtual_network_interface.html", function () {
        if ('virtual_network_interfaces' in okitJson) {
            console.info('Loading ' + virtual_network_interface_artifact + ' : ' + id);
            let json = okitJson['virtual_network_interfaces'];
            for (let i = 0; i < json.length; i++) {
                let virtual_network_interface = json[i];
                if (virtual_network_interface['id'] == id) {
                    virtual_network_interface['virtual_cloud_network'] = okitIdsJsonObj[virtual_network_interface['vcn_id']];
                    // Load Properties
                    loadProperties(virtual_network_interface);
                    // Add Event Listeners
                    addPropertiesEventListeners(virtual_network_interface, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryVirtualNetworkInterfaceAjax(compartment_id) {
    console.info('------------- queryVirtualNetworkInterfaceAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    if ('virtual_network_interface_filter' in okitQueryRequestJson) {
        request_json['virtual_network_interface_filter'] = okitQueryRequestJson['virtual_network_interface_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/VirtualNetworkInterface',
        dataType: 'text',
        contentType: 'application/json',
        //data: JSON.stringify(okitQueryRequestJson),
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            okitJson['virtual_network_interfaces'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryVirtualNetworkInterfaceAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + virtual_network_interface_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}


$(document).ready(function() {
    clearVirtualNetworkInterfaceVariables();

    // Setup Search Checkbox
    /*
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', virtual_network_interface_query_cb);
    cell.append('label').text(virtual_network_interface_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(virtual_network_interface_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'virtual_network_interface_name_filter')
        .attr('name', 'virtual_network_interface_name_filter');
    */
});

