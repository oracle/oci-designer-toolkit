console.info('Loaded Object Storage Bucket Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[object_storage_bucket_artifact] = [compartment_artifact];
asset_connect_targets[object_storage_bucket_artifact] = [instance_artifact];
asset_add_functions[object_storage_bucket_artifact] = "addObjectStorageBucket";
asset_delete_functions[object_storage_bucket_artifact] = "deleteObjectStorageBucket";
asset_clear_functions.push("clearObjectStorageBucketVariables");

const object_storage_bucket_stroke_colour = "#F80000";
const object_storage_bucket_query_cb = "object-storage-bucket-query-cb";
let object_storage_bucket_ids = [];

/*
** Reset variables
 */

function clearObjectStorageBucketVariables() {
    object_storage_bucket_ids = [];
}

/*
** Add Asset to JSON Model
 */
function addObjectStorageBucket(parent_id, compartment_id) {
    let id = 'okit-' + object_storage_bucket_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + object_storage_bucket_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('object_storage_buckets')) {
        okitJson['object_storage_buckets'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    object_storage_bucket_ids.push(id);

    // Increment Count
    let object_storage_bucket_count = okitJson['object_storage_buckets'].length + 1;
    let object_storage_bucket = {};
    object_storage_bucket['compartment_id'] = parent_id;
    object_storage_bucket['id'] = id;
    object_storage_bucket['name'] = generateDefaultName(object_storage_bucket_prefix, object_storage_bucket_count);
    object_storage_bucket['display_name'] = object_storage_bucket['name'];
    object_storage_bucket['namespace'] = 'Tenancy Name';
    object_storage_bucket['storage_tier'] = 'Standard';
    object_storage_bucket['public_access_type'] = 'NoPublicAccess';
    okitJson['object_storage_buckets'].push(object_storage_bucket);
    okitIdsJsonObj[id] = object_storage_bucket['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawObjectStorageBucketSVG(object_storage_bucket);
    drawSVGforJson();
    loadObjectStorageBucketProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */

function deleteObjectStorageBucket(id) {
    console.groupCollapsed('Delete ' + object_storage_bucket_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['object_storage_buckets'].length; i++) {
        if (okitJson['object_storage_buckets'][i]['id'] == id) {
            okitJson['object_storage_buckets'].splice(i, 1);
        }
    }
    // Remove Instance references
    if ('instances' in okitJson) {
        for (let instance of okitJson['instances']) {
            for (let i=0; i < instance['object_storage_bucket_ids'].length; i++) {
                if (instance['object_storage_bucket_ids'][i] == id) {
                    instance['object_storage_bucket_ids'].splice(i, 1);
                }
            }
        }
    }
    console.groupEnd();
}

/*
** SVG Creation
 */
function getObjectStorageBucketDimensions(id='') {
    return {width:icon_width, height:icon_height};
}

function newObjectStorageBucketDefinition(artifact, position=0) {
    let dimensions = getObjectStorageBucketDimensions();
    let definition = newArtifactSVGDefinition(artifact, object_storage_bucket_artifact);
    let first_child = getCompartmentFirstChildOffset();
    definition['svg']['x'] = first_child.dx;
    definition['svg']['y'] = first_child.dy;
    // Add positioning offset
    definition['svg']['y'] += Math.round(positional_adjustments.padding.y * position);
    definition['svg']['y'] += Math.round(positional_adjustments.spacing.y * position);
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = object_storage_bucket_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

function drawObjectStorageBucketSVG(artifact) {
    let parent_id = artifact['compartment_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + object_storage_bucket_artifact + ' : ' + id);

    if (!artifact.hasOwnProperty('parent_id')) {
        artifact['parent_id'] = artifact['compartment_id'];
    }

    if (!compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        compartment_bui_sub_artifacts[parent_id] = {};
    }

    if (compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!compartment_bui_sub_artifacts[parent_id].hasOwnProperty('artifact_position')) {
            compartment_bui_sub_artifacts[parent_id]['artifact_position'] = 0;
        }
        // Calculate Position
        let position = compartment_bui_sub_artifacts[parent_id]['artifact_position'];
        // Increment Icon Position
        compartment_bui_sub_artifacts[parent_id]['artifact_position'] += 1;

        let svg = drawArtifact(newObjectStorageBucketDefinition(artifact, position));

        let rect = d3.select('#' + id);
        //let boundingClientRect = rect.node().getBoundingClientRect();
        /*
         Add click event to display properties
         Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
         Add dragevent versions
         Set common attributes on svg element and children
         */
        svg.on("click", function () {
            loadObjectStorageBucketProperties(id);
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
function loadObjectStorageBucketProperties(id) {
    $("#properties").load("propertysheets/object_storage_bucket.html", function () {
        if ('object_storage_buckets' in okitJson) {
            console.info('Loading ' + object_storage_bucket_artifact + ' : ' + id);
            let json = okitJson['object_storage_buckets'];
            for (let i = 0; i < json.length; i++) {
                let object_storage_bucket = json[i];
                if (object_storage_bucket['id'] == id) {
                    object_storage_bucket['virtual_cloud_network'] = okitIdsJsonObj[object_storage_bucket['vcn_id']];
                    // Load Properties
                    loadProperties(object_storage_bucket);
                    // Add Event Listeners
                    addPropertiesEventListeners(object_storage_bucket, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryObjectStorageBucketAjax(compartment_id) {
    console.info('------------- queryObjectStorageBucketAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    if ('object_storage_bucket_filter' in okitQueryRequestJson) {
        request_json['object_storage_bucket_filter'] = okitQueryRequestJson['object_storage_bucket_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/ObjectStorageBucket',
        dataType: 'text',
        contentType: 'application/json',
        //data: JSON.stringify(okitQueryRequestJson),
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            okitJson['object_storage_buckets'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryObjectStorageBucketAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + object_storage_bucket_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}


$(document).ready(function() {
    clearObjectStorageBucketVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', object_storage_bucket_query_cb);
    cell.append('label').text(object_storage_bucket_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(object_storage_bucket_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'object_storage_bucket_name_filter')
        .attr('name', 'object_storage_bucket_name_filter');
});

