console.info('Loaded Instance Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[instance_artifact] = [subnet_artifact];
asset_connect_targets[instance_artifact] = [load_balancer_artifact];
asset_add_functions[instance_artifact] = "addInstance";
asset_update_functions[instance_artifact] = "updateInstance";
asset_delete_functions[instance_artifact] = "deleteInstance";
asset_clear_functions.push("clearInstanceVariables");

//const instance_stroke_colour = "blue";
const instance_stroke_colour = "#6699cc";
const instance_query_cb = "instance-query-cb";
const instance_width = Math.round((icon_width * 3) + (icon_spacing * 4));
const instance_height = Math.round(icon_height * 5 / 2);
let instance_ids = [];
let instance_count = 0;

/*
** Reset variables
 */

function clearInstanceVariables() {
    instance_ids = [];
    instance_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addInstance(subnet_id, compartment_id) {
    let id = 'okit-' + instance_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + instance_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('instances')) {
        okitJson['instances'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    instance_ids.push(id);

    // Increment Count
    instance_count += 1;
    let instance = {};
    instance['subnet_id'] = subnet_id;
    instance['subnet'] = '';
    instance['compartment_id'] = compartment_id;
    instance['availability_domain'] = '1';
    instance['id'] = id;
    instance['display_name'] = generateDefaultName(instance_prefix, instance_count);
    instance['hostname_label'] = instance['display_name'].toLowerCase();
    instance['os'] = 'Oracle Linux';
    instance['version'] = '7.6';
    instance['shape'] = 'VM.Standard2.1';
    instance['boot_volume_size_in_gbs'] = '50';
    instance['authorized_keys'] = '';
    instance['cloud_init_yaml'] = '';
    instance['block_storage_volume_ids'] = [];
    instance['block_storage_volumes'] = [];
    okitJson['instances'].push(instance);
    okitIdsJsonObj[id] = instance['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawInstanceSVG(instance);
    drawSVGforJson();
    loadInstanceProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */

function deleteInstance(id) {
    console.groupCollapsed('Delete ' + instance_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i = 0; i < okitJson['instances'].length; i++) {
        if (okitJson['instances'][i]['id'] == id) {
            okitJson['instances'].splice(i, 1);
        }
    }
    // Remove Load Balancer references
    if ('load_balancers' in okitJson) {
        for (load_balancer of okitJson['load_balancers']) {
            for (let i = 0; i < load_balancer['instance_ids'].length; i++) {
                if (load_balancer['instance_ids'][i] == id) {
                    load_balancer['instance_ids'].splice(i, 1);
                }
            }
        }
    }
    console.groupEnd();
}

/*
** SVG Creation
 */
function getInstanceDimensions(id='') {
    return {width:instance_width, height:instance_height};
}

function newInstanceDefinition(artifact, position=0) {
    let dimensions = getInstanceDimensions();
    let definition = newArtifactSVGDefinition(artifact, instance_artifact);
    definition['svg']['x'] = Math.round((icon_width * 3 / 2) + (instance_width * position) + (icon_spacing * position));
    definition['svg']['y'] = Math.round(icon_height * 4);
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = instance_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    definition['rect']['height_adjust'] = (Math.round(icon_height / 2) * -1);
    definition['name']['show'] = true;
    return definition;
}

function drawInstanceSVG(artifact) {
    let parent_id = artifact['subnet_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + instance_artifact + ' : ' + id + ' [' + parent_id + ']');

    // Test if parent exists
    let parent_exists = false;
    if (okitJson.hasOwnProperty('subnets')) {
        for (subnet of okitJson['subnets']) {
            if (parent_id == subnet['id']) {
                parent_exists = true;
                break;
            }
        }
    }
    if (!parent_exists) {
        console.info('Parent ' + parent_id + ' not found.');
        return
    }

    if (!subnet_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        subnet_bui_sub_artifacts[parent_id] = {};
    }

    // Only draw the instance if the subnet exists
    if (subnet_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!subnet_bui_sub_artifacts[parent_id].hasOwnProperty('instance_position')) {
            subnet_bui_sub_artifacts[parent_id]['instance_position'] = 0;
        }
        // Calculate Position
        let position = subnet_bui_sub_artifacts[parent_id]['instance_position'];
        // Increment Icon Position
        subnet_bui_sub_artifacts[parent_id]['instance_position'] += 1;

        let svg = drawArtifact(newInstanceDefinition(artifact, position));

        //loadInstanceProperties(id);
        let rect = d3.select('#' + id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadInstanceProperties(id);
            d3.event.stopPropagation();
        });
        svg.attr("data-compartment-id", compartment_id)
            .attr("data-connector-start-y", boundingClientRect.y)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-connector-start-y", boundingClientRect.y)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true);
    }
    // Draw any connected artifacts
    drawInstanceAttachmentsSVG(artifact);
    console.groupEnd();
}

function clearInstanceSVG(instance) {
    let id = instance['id'];
    d3.selectAll("line[id*='" + id + "']").remove();
}

function drawInstanceConnectorsSVG(instance) {
    let id = instance['id'];
    console.info('>>>> Drawing ' + instance_artifact + ' : ' + id + ' Connectors');
    // If Block Storage Volumes Ids are missing then initialise.
    // This may occur during a query
    if (!instance.hasOwnProperty('block_storage_volume_ids')) {
        instance['block_storage_volume_ids'] = [];
    }
    for (let block_storage_id of instance['block_storage_volume_ids']) {
        let block_storage_svg = d3.select('#' + block_storage_id);
        if (block_storage_svg.node()) {
            let parent_id = block_storage_svg.attr('data-parent-id');
            let parent_svg = d3.select('#' + parent_id + "-svg");
            if (parent_svg.node()) {
                console.info('Parent SVG : ' + parent_svg.node());
                // Define SVG position manipulation variables
                let svgPoint = parent_svg.node().createSVGPoint();
                let screenCTM = parent_svg.node().getScreenCTM();
                // Start
                svgPoint.x = d3.select('#' + id).attr('data-connector-start-x');
                svgPoint.y = d3.select('#' + id).attr('data-connector-start-y');
                let connector_start = svgPoint.matrixTransform(screenCTM.inverse());
                // End
                svgPoint.x = block_storage_svg.attr('data-connector-start-x');
                svgPoint.y = block_storage_svg.attr('data-connector-start-y');
                let connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                parent_svg.append('line')
                    .attr("id", generateConnectorId(block_storage_id, id))
                    .attr("x1", connector_start.x)
                    .attr("y1", connector_start.y)
                    .attr("x2", connector_end.x)
                    .attr("y2", connector_end.y)
                    .attr("stroke-width", "2")
                    .attr("stroke", "black");
            }
        }
    }
}

function drawInstanceAttachmentsSVG(instance) {
    let id = instance['id'];
    console.groupCollapsed('Drawing ' + instance_artifact + ' : ' + id + ' Attachments');
    // If Block Storage Volumes Ids are missing then initialise.
    // This may occur during a query
    if (!instance.hasOwnProperty('block_storage_volume_ids')) {
        instance['block_storage_volume_ids'] = [];
    }
    let attachment_count = 0;
    for (let block_storage_id of instance['block_storage_volume_ids']) {
        for (let block_storage_volume of okitJson['block_storage_volumes']) {
            if (block_storage_id == block_storage_volume['id']) {
                let artifact_clone = JSON.parse(JSON.stringify(block_storage_volume));
                artifact_clone['parent_id'] = instance['id'];
                drawAttachedBlockStorageVolume(artifact_clone, attachment_count);
            }
        }
        attachment_count += 1;
    }
    console.groupEnd();
}

function drawAttachedBlockStorageVolume(artifact, bs_count) {
    console.info('Drawing ' + instance_artifact + ' Block Storage Volume : ' + artifact['id']);
    let artifact_definition = newBlockStorageVolumeDefinition(artifact, bs_count);
    artifact_definition['svg']['x'] = Math.round(icon_spacing + (icon_width * bs_count) + (icon_spacing * bs_count));
    artifact_definition['svg']['y'] = Math.round(instance_height - icon_height);

    let svg = drawArtifact(artifact_definition);

    /*
    let svg_x = icon_spacing + (icon_width * bs_count) + (icon_spacing * bs_count);
    let svg_y = Math.round(instance_height - icon_height);
    let svg_width = icon_width;
    let svg_height = icon_height;
    let data_type = block_storage_volume_artifact;
    let stroke_colour = block_storage_volume_stroke_colour;
    let stroke_dash = 1;
    // Draw Block Storage Volume
    let svg = drawArtifactSVG(artifact, data_type, svg_x, svg_y, svg_width, svg_height, stroke_colour, stroke_dash);
    */
    // Add click event to display properties
    svg.on("click", function () {
        loadBlockStorageVolumeProperties(artifact['id']);
        d3.event.stopPropagation();
    });
}

/*
** Property Sheet Load function
 */
function loadInstanceProperties(id) {
    $("#properties").load("propertysheets/instance.html", function () {
        if ('instances' in okitJson) {
            console.info('Loading Instance: ' + id);
            let json = okitJson['instances'];
            for (let i = 0; i < json.length; i++) {
                let instance = json[i];
                //console.info(JSON.stringify(instance, null, 2));
                if (instance['id'] == id) {
                    //console.info('Found Route Table: ' + id);
                    //instance['virtual_cloud_network'] = okitIdsJsonObj[instance['vcn_id']];
                    instance['subnet'] = okitIdsJsonObj[instance['subnet_id']];
                    /*
                    $("#virtual_cloud_network").html(instance['virtual_cloud_network']);
                    $('#display_name').val(instance['display_name']);
                    $('#hostname_label').val(instance['hostname_label']);
                    $('#boot_volume_size_in_gbs').val(instance['boot_volume_size_in_gbs']);
                    $('#authorized_keys').val(instance['authorized_keys']);
                    $('#cloud_init_yaml').val(instance['cloud_init_yaml']);
                    */
                    let block_storage_volume_select = $('#block_storage_volume_ids');
                    //for (let bsvid of block_storage_volume_ids) {
                    //    block_storage_volume_select.append($('<option>').attr('value', bsvid).text(okitIdsJsonObj[bsvid]));
                    //}
                    if (okitJson.hasOwnProperty('block_storage_volumes')) {
                        for (let block_storage_volume of okitJson['block_storage_volumes']) {
                            block_storage_volume_select.append($('<option>').attr('value', block_storage_volume['id']).text(block_storage_volume['display_name']));
                        }
                    }
                    //block_storage_volume_select.val(instance['block_storage_volume_ids']);
                    // Load Properties
                    loadProperties(instance);
                    // Add Event Listeners
                    //addPropertiesEventListeners(instance, [drawInstanceAttachmentsSVG]);
                    addPropertiesEventListeners(instance, [drawSVGforJson]);
                    break;
                }
            }
        }
    });
}

/*
** OKIT Json Update Function
 */
function updateInstance(source_type, source_id, id) {
    console.groupCollapsed('Update ' + instance_artifact + ' : ' + id + ' Adding ' + source_type + ' ' + source_id);
    let instances = okitJson['instances'];
    //console.info(JSON.stringify(instances))
    for (let i = 0; i < instances.length; i++) {
        let instance = instances[i];
        console.info(i + ') ' + JSON.stringify(instance))
        if (instance['id'] == id) {
            if (source_type == block_storage_volume_artifact) {
                if (instance['block_storage_volume_ids'].indexOf(source_id) > 0) {
                    // Already connected so delete existing line
                    d3.select("#" + generateConnectorId(source_id, id)).remove();
                } else {
                    instance['block_storage_volume_ids'].push(source_id);
                    //instance['block_storage_volumes'].push(okitIdsJsonObj[source_id]);
                }
            }
        }
    }
    displayOkitJson();
    loadInstanceProperties(id);
    console.groupEnd();
}

/*
** Query OCI
 */

function queryInstanceAjax(compartment_id, subnet_id) {
    console.info('------------- queryInstanceAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['subnet_id'] = subnet_id;
    if ('instance_filter' in okitQueryRequestJson) {
        request_json['instance_filter'] = okitQueryRequestJson['instance_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/Instance',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function (resp) {
            let response_json = JSON.parse(resp);
            okitJson['instances'] = response_json;
            let len = response_json.length;
            for (let i = 0; i < len; i++) {
                console.info('queryInstanceAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + instance_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function (xhr, status, error) {
            console.info('Status : ' + status)
            console.info('Error : ' + error)
        }
    });
}

$(document).ready(function () {
    clearInstanceVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', instance_query_cb);
    cell.append('label').text(instance_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(instance_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'instance_name_filter')
        .attr('name', 'instance_name_filter');
});



