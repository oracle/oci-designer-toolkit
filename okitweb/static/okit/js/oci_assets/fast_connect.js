console.info('Loaded FastConnect Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[fast_connect_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[fast_connect_artifact] = [];
asset_add_functions[fast_connect_artifact] = "addFastConnect";
asset_delete_functions[fast_connect_artifact] = "deleteFastConnect";
asset_clear_functions.push("clearFastConnectVariables");

const fast_connect_stroke_colour = "purple";
const fast_connect_query_cb = "fast-connect-query-cb";
let fast_connect_ids = [];

/*
** Reset variables
 */

function clearFastConnectVariables() {
    fast_connect_ids = [];
}

/*
** Add Asset to JSON Model
 */
function addFastConnect(vcn_id, compartment_id) {
    let id = 'okit-' + fast_connect_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding FastConnect : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('fast_connects')) {
        okitJson['fast_connects'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    fast_connect_ids.push(id);

    // Increment Count
    let fast_connect_count = okitJson['fast_connects'].length + 1;
    let fast_connect = {};
    fast_connect['vcn_id'] = vcn_id;
    fast_connect['virtual_cloud_network'] = '';
    fast_connect['compartment_id'] = compartment_id;
    fast_connect['id'] = id;
    fast_connect['display_name'] = generateDefaultName(fast_connect_prefix, fast_connect_count);
    okitJson['fast_connects'].push(fast_connect);
    okitIdsJsonObj[id] = fast_connect['display_name'];
    console.info(JSON.stringify(okitJson, null, 2));
    //drawFastConnectSVG(fast_connect);
    drawSVGforJson();
    loadFastConnectProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */

function deleteFastConnect(id) {
    console.groupCollapsed('Delete ' + fast_connect_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['fast_connects'].length; i++) {
        if (okitJson['fast_connects'][i]['id'] == id) {
            okitJson['fast_connects'].splice(i, 1);
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
function getFastConnectDimensions(id='') {
    return {width:icon_width, height:icon_height};
}

function newFastConnectDefinition(artifact, position=0) {
    let definition = newArtifactSVGDefinition(artifact, fast_connect_artifact);
    let dimensions = getFastConnectDimensions();
    definition['svg']['x'] = Math.round(icon_width * 2 + (icon_width * position) + (icon_spacing * position));
    definition['svg']['y'] = 0;
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = fast_connect_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

function drawFastConnectSVG(artifact) {
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + fast_connect_artifact + ' : ' + id + ' [' + parent_id + ']');

    if (!virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        virtual_cloud_network_bui_sub_artifacts[parent_id] = {};
    }

    if (virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!virtual_cloud_network_bui_sub_artifacts[parent_id].hasOwnProperty('fast_connect_position')) {
            virtual_cloud_network_bui_sub_artifacts[parent_id]['fast_connect_position'] = 0;
        }
        // Calculate Position
        let position = virtual_cloud_network_bui_sub_artifacts[parent_id]['fast_connect_position'];
        // Increment Icon Position
        virtual_cloud_network_bui_sub_artifacts[parent_id]['fast_connect_position'] += 1;

        let svg = drawArtifact(newFastConnectDefinition(artifact, position));

        //loadFastConnectProperties(id);
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadFastConnectProperties(id);
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
function loadFastConnectProperties(id) {
    $("#properties").load("propertysheets/fast_connect.html", function () {
        if ('fast_connects' in okitJson) {
            console.info('Loading FastConnect: ' + id);
            let json = okitJson['fast_connects'];
            for (let i = 0; i < json.length; i++) {
                let fast_connect = json[i];
                //console.info(JSON.stringify(fast_connect, null, 2));
                if (fast_connect['id'] == id) {
                    //console.info('Found FastConnect: ' + id);
                    fast_connect['virtual_cloud_network'] = okitIdsJsonObj[fast_connect['vcn_id']];
                    // Load Properties
                    loadProperties(fast_connect);
                    // Add Event Listeners
                    addPropertiesEventListeners(fast_connect, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryFastConnectAjax(compartment_id) {
    console.info('------------- queryFastConnectAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    if ('fast_connect_filter' in okitQueryRequestJson) {
        request_json['fast_connect_filter'] = okitQueryRequestJson['fast_connect_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/FastConnect',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            //okitJson['fast_connects'] = response_json;
            okitJson.load({fast_connects: response_json});
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryFastConnectAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + fast_connect_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

$(document).ready(function() {
    clearFastConnectVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', fast_connect_query_cb);
    cell.append('label').text(fast_connect_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(fast_connect_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'fast_connect_name_filter')
        .attr('name', 'fast_connect_name_filter');
});

