console.log('Loaded Block Storage Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[block_storage_volume_artifact] = [compartment_artifact];
asset_connect_targets[block_storage_volume_artifact] = [instance_artifact];
asset_add_functions[block_storage_volume_artifact] = "addBlockStorageVolume";
asset_delete_functions[block_storage_volume_artifact] = "deleteBlockStorageVolume";
asset_clear_functions.push("clearBlockStorageVolumeVariables");

const block_storage_volume_stroke_colour = "#F80000";
const block_storage_volume_query_cb = "block-storage-volume-query-cb";
let block_storage_volume_ids = [];
let block_storage_volume_count = 0;

/*
** Reset variables
 */

function clearBlockStorageVolumeVariables() {
    block_storage_volume_ids = [];
    block_storage_volume_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addBlockStorageVolume(parent_id, compartment_id) {
    let id = 'okit-' + block_storage_volume_prefix + '-' + uuidv4();
    console.log('Adding ' + block_storage_volume_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!OKITJsonObj.hasOwnProperty('block_storage_volumes')) {
        OKITJsonObj['block_storage_volumes'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    block_storage_volume_ids.push(id);

    // Increment Count
    block_storage_volume_count += 1;
    let block_storage_volume = {};
    block_storage_volume['compartment_id'] = parent_id;
    block_storage_volume['availability_domain'] = '1';
    block_storage_volume['id'] = id;
    block_storage_volume['display_name'] = generateDefaultName(block_storage_volume_prefix, block_storage_volume_count);
    block_storage_volume['size_in_gbs'] = 1024;
    block_storage_volume['backup_policy'] = 'bronze';
    OKITJsonObj['block_storage_volumes'].push(block_storage_volume);
    okitIdsJsonObj[id] = block_storage_volume['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    //drawBlockStorageVolumeSVG(block_storage_volume);
    drawSVGforJson();
    loadBlockStorageVolumeProperties(id);
}

/*
** Delete From JSON Model
 */

function deleteBlockStorageVolume(id) {
    console.log('Delete ' + block_storage_volume_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < OKITJsonObj['block_storage_volumes'].length; i++) {
        if (OKITJsonObj['block_storage_volumes'][i]['id'] == id) {
            OKITJsonObj['block_storage_volumes'].splice(i, 1);
        }
    }
    // Remove Instance references
    if ('instances' in OKITJsonObj) {
        for (let instance of OKITJsonObj['instances']) {
            for (let i=0; i < instance['block_storage_volume_ids'].length; i++) {
                if (instance['block_storage_volume_ids'][i] == id) {
                    instance['block_storage_volume_ids'].splice(i, 1);
                }
            }
        }
    }
}

/*
** SVG Creation
 */
function drawBlockStorageVolumeSVG(artifact) {
    // Check if this Block Storage Volume has been attached to an Instance and if so do not draw because it will be done
    // as part of the instance
    if (OKITJsonObj.hasOwnProperty('instances')) {
        for (let instance of OKITJsonObj['instances']) {
            if (instance.hasOwnProperty('block_storage_volume_ids')) {
                if (instance['block_storage_volume_ids'].includes(artifact['id'])) {
                    console.log(artifact['display_name'] + ' attached to instance '+ instance['display_name']);
                    return;
                }
            }
        }
    }
    if (!artifact.hasOwnProperty('parent_id')) {
        artifact['parent_id'] = artifact['compartment_id'];
    }
    let parent_id = artifact['parent_id'];
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.log('Drawing ' + block_storage_volume_artifact + ' : ' + id);

    if (!compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        compartment_bui_sub_artifacts[parent_id] = {};
    }

    if (compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!compartment_bui_sub_artifacts[parent_id].hasOwnProperty('block_storage_position')) {
            compartment_bui_sub_artifacts[parent_id]['block_storage_position'] = 0;
        }
        // Calculate Position
        let position = compartment_bui_sub_artifacts[parent_id]['block_storage_position'];
        // Increment Icon Position
        compartment_bui_sub_artifacts[parent_id]['block_storage_position'] += 1;

        let svg_x = (icon_width / 4);
        let svg_y = Math.round((icon_height * 2) + (icon_height * position) + (icon_spacing * position));
        let svg_width = icon_width;
        let svg_height = icon_height;
        let data_type = block_storage_volume_artifact;
        let stroke_colour = block_storage_volume_stroke_colour;
        let stroke_dash = 1;

        let svg = drawArtifactSVG(artifact, data_type, svg_x, svg_y, svg_width, svg_height, stroke_colour, stroke_dash);

        let rect = d3.select('#' + id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        /*
         Add click event to display properties
         Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
         Add dragevent versions
         Set common attributes on svg element and children
         */
        svg.on("click", function () {
            loadBlockStorageVolumeProperties(id);
            d3.event.stopPropagation();
        })
            .on("mousedown", handleConnectorDragStart)
            .on("mousemove", handleConnectorDrag)
            .on("mouseup", handleConnectorDrop)
            .on("mouseover", handleConnectorDragEnter)
            .on("mouseout", handleConnectorDragLeave)
            .on("dragstart", handleConnectorDragStart)
            .on("drop", handleConnectorDrop)
            .on("dragenter", handleConnectorDragEnter)
            .on("dragleave", handleConnectorDragLeave)
            .on("contextmenu", handleContextMenu)
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width/2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width/2))
            .attr("data-connector-id", id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width/2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width/2))
            .attr("data-connector-id", id)
            .attr("dragable", true);
    } else {
        console.log(parent_id + ' was not found in compartment sub artifacts : ' + JSON.stringify(compartment_bui_sub_artifacts));
    }
}

/*
** Property Sheet Load function
 */
function loadBlockStorageVolumeProperties(id) {
    $("#properties").load("propertysheets/block_storage_volume.html", function () {
        if ('block_storage_volumes' in OKITJsonObj) {
            console.log('Loading ' + block_storage_volume_artifact + ' : ' + id);
            let json = OKITJsonObj['block_storage_volumes'];
            for (let i = 0; i < json.length; i++) {
                let block_storage_volume = json[i];
                if (block_storage_volume['id'] == id) {
                    block_storage_volume['virtual_cloud_network'] = okitIdsJsonObj[block_storage_volume['vcn_id']];
                    $("#virtual_cloud_network").html(block_storage_volume['virtual_cloud_network']);
                    $('#display_name').val(block_storage_volume['display_name']);
                    $('#availability_domain').val(block_storage_volume['availability_domain']);
                    $('#size_in_gbs').val(block_storage_volume['size_in_gbs']);
                    $('#backup_policy').val(block_storage_volume['backup_policy']);
                    // Add Event Listeners
                    addPropertiesEventListeners(block_storage_volume, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryBlockStorageVolumeAjax(compartment_id) {
    console.log('------------- queryBlockStorageVolumeAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    if ('block_storage_volume_filter' in okitQueryRequestJson) {
        request_json['block_storage_volume_filter'] = okitQueryRequestJson['block_storage_volume_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/BlockStorageVolume',
        dataType: 'text',
        contentType: 'application/json',
        //data: JSON.stringify(okitQueryRequestJson),
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            OKITJsonObj['block_storage_volumes'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.log('queryBlockStorageVolumeAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + block_storage_volume_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}


$(document).ready(function() {
    clearBlockStorageVolumeVariables();

    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', block_storage_volume_query_cb);
    cell.append('label').text(block_storage_volume_artifact);
});

