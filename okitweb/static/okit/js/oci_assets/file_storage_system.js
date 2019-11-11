console.info('Loaded File Storage System Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[file_storage_system_artifact] = [subnet_artifact];
asset_connect_targets[file_storage_system_artifact] = [instance_artifact];
asset_add_functions[file_storage_system_artifact] = "addFileStorageSystem";
asset_delete_functions[file_storage_system_artifact] = "deleteFileStorageSystem";
asset_clear_functions.push("clearFileStorageSystemVariables");

const file_storage_system_stroke_colour = "#F80000";
const file_storage_system_query_cb = "file-storage-system-query-cb";
let file_storage_system_ids = [];
let file_storage_system_count = 0;
let propertires_file_storage_system = {}

/*
** Reset variables
 */

function clearFileStorageSystemVariables() {
    file_storage_system_ids = [];
    file_storage_system_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addFileStorageSystem(subnet_id, compartment_id) {
    let id = 'okit-' + file_storage_system_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + file_storage_system_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('file_storage_systems')) {
        okitJson['file_storage_systems'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    file_storage_system_ids.push(id);

    // Increment Count
    file_storage_system_count += 1;
    let file_storage_system = {};
    file_storage_system['subnet_id'] = subnet_id;
    file_storage_system['compartment_id'] = compartment_id;
    file_storage_system['availability_domain'] = '1';
    file_storage_system['id'] = id;
    file_storage_system['display_name'] = generateDefaultName(file_storage_system_prefix, file_storage_system_count);
    file_storage_system['hostname_label'] = file_storage_system['display_name'].toLowerCase();
    okitJson['file_storage_systems'].push(file_storage_system);
    okitIdsJsonObj[id] = file_storage_system['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawFileStorageSystemSVG(file_storage_system);
    drawSVGforJson();
    loadFileStorageSystemProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */

function deleteFileStorageSystem(id) {
    console.groupCollapsed('Delete ' + file_storage_system_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove();
    // Remove Data Entry
    for (let i=0; i < okitJson['file_storage_systems'].length; i++) {
        if (okitJson['file_storage_systems'][i]['id'] == id) {
            okitJson['file_storage_systems'].splice(i, 1);
        }
    }
    // Remove Subnet references
    if ('subnets' in okitJson) {
        for (subnet of okitJson['subnets']) {
            if (subnet['file_storage_system_id'] == id) {
                subnet['file_storage_system_id'] = '';
            }
        }
    }
    console.groupEnd();
}

/*
** SVG Creation
 */
function getFileStorageSystemDimensions(id='') {
    return {width:icon_width, height:icon_height};
}

function newFileStorageSystemDefinition(artifact, position=0) {
    console.info('New ' + file_storage_system_artifact + ' Definition for ' + JSON.stringify(artifact));
    let dimensions = getFileStorageSystemDimensions();
    let definition = newArtifactSVGDefinition(artifact, file_storage_system_artifact);
    let first_child = getSubnetFirstChildOffset();
    definition['svg']['x'] = Math.round(first_child.dx + (icon_width * position) + (positional_adjustments.spacing.x * position));
    definition['svg']['y'] = Math.round(first_child.dy);
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = file_storage_system_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    console.info('New ' + file_storage_system_artifact + ' Definition ' + JSON.stringify(definition));
    return definition;
}

function drawFileStorageSystemSVG(artifact) {
    let parent_id = artifact['subnet_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + file_storage_system_artifact + ' : ' + id + ' [' + parent_id + ']');
    // Check if this File Storage System has been attached to a Subnet and if so do not draw because it will be done as part of
    // the subnet draw.
    if (okitJson.hasOwnProperty('subnets')) {
        for (let subnet of okitJson['subnets']) {
            if (subnet['file_storage_system_id'] == artifact['id']) {
                console.info(artifact['display_name'] + ' attached to subnet '+ subnet['display_name']);
                console.groupEnd();
                return;
            }
        }
    }

    if (!virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        virtual_cloud_network_bui_sub_artifacts[parent_id] = {};
    }

    if (virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!virtual_cloud_network_bui_sub_artifacts[parent_id].hasOwnProperty('element_position')) {
            virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'] = 0;
        }
        // Calculate Position
        let position = virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'];
        // Increment Icon Position
        virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'] += 1;

        let svg = drawArtifact(newFileStorageSystemDefinition(artifact, position));

        let rect = d3.select('#' + id);
        //let boundingClientRect = rect.node().getBoundingClientRect();
        /*
         Add click event to display properties
         Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
         Add dragevent versions
         Set common attributes on svg element and children
         */
        svg.on("click", function () {
            loadFileStorageSystemProperties(id);
            d3.event.stopPropagation();
        });
    } else {
        console.warn(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
    console.groupEnd();
}

/*
** Property Sheet Load function
 */
function loadFileStorageSystemProperties(id) {
    $("#properties").load("propertysheets/file_storage_system.html", function () {
        if ('file_storage_systems' in okitJson) {
            console.info('Loading File Storage System: ' + id);
            let json = okitJson['file_storage_systems'];
            for (let i = 0; i < json.length; i++) {
                let file_storage_system = json[i];
                //console.info(JSON.stringify(file_storage_system, null, 2));
                if (file_storage_system['id'] == id) {
                    //console.info('Found File Storage System: ' + id);
                    file_storage_system['virtual_cloud_network'] = okitIdsJsonObj[file_storage_system['vcn_id']];
                    // Load Properties
                    loadProperties(file_storage_system);
                    // Add Event Listeners
                    addPropertiesEventListeners(file_storage_system, []);
                    break;
                }
            }
        }
    });
}


/*
** Query OCI
 */

function queryFileStorageSystemAjax(compartment_id, vcn_id) {
    console.info('------------- queryFileStorageSystemAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('file_storage_system_filter' in okitQueryRequestJson) {
        request_json['file_storage_system_filter'] = okitQueryRequestJson['file_storage_system_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/FileStorageSystem',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            okitJson['file_storage_systems'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryFileStorageSystemAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + file_storage_system_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

$(document).ready(function() {
    clearFileStorageSystemVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', file_storage_system_query_cb);
    cell.append('label').text(file_storage_system_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(file_storage_system_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'file_storage_system_name_filter')
        .attr('name', 'file_storage_system_name_filter');
});

