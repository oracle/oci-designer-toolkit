console.info('Loaded Block Storage Volume Javascript');

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

/*
** Reset variables
 */

// TODO: Delete
function clearBlockStorageVolumeVariables() {
    block_storage_volume_ids = [];
}

/*
** Add Asset to JSON Model
 */
// TODO: Delete
function addBlockStorageVolumeDeprecated(parent_id, compartment_id) {
    let id = 'okit-' + block_storage_volume_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + block_storage_volume_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('block_storage_volumes')) {
        okitJson['block_storage_volumes'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    block_storage_volume_ids.push(id);

    // Increment Count
    let block_storage_volume_count = okitJson['block_storage_volumes'].length + 1;
    let block_storage_volume = {};
    block_storage_volume['compartment_id'] = parent_id;
    block_storage_volume['availability_domain'] = '1';
    block_storage_volume['id'] = id;
    block_storage_volume['display_name'] = generateDefaultName(block_storage_volume_prefix, block_storage_volume_count);
    block_storage_volume['size_in_gbs'] = 1024;
    block_storage_volume['backup_policy'] = 'bronze';
    okitJson['block_storage_volumes'].push(block_storage_volume);
    okitIdsJsonObj[id] = block_storage_volume['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawBlockStorageVolumeSVG(block_storage_volume);
    drawSVGforJson();
    loadBlockStorageVolumeProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */
// TODO: Delete
function deleteBlockStorageVolumeDeprecated(id) {
    console.groupCollapsed('Delete ' + block_storage_volume_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['block_storage_volumes'].length; i++) {
        if (okitJson['block_storage_volumes'][i]['id'] == id) {
            okitJson['block_storage_volumes'].splice(i, 1);
        }
    }
    // Remove Instance references
    if ('instances' in okitJson) {
        for (let instance of okitJson['instances']) {
            for (let i=0; i < instance['block_storage_volume_ids'].length; i++) {
                if (instance['block_storage_volume_ids'][i] == id) {
                    instance['block_storage_volume_ids'].splice(i, 1);
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
function getBlockStorageVolumeDimensionsDeprecated(id='') {
    return {width:icon_width, height:icon_height};
}

// TODO: Delete
function newBlockStorageVolumeDefinitionDeprecated(artifact, position=0) {
    let dimensions = getBlockStorageVolumeDimensions();
    let definition = newArtifactSVGDefinition(artifact, block_storage_volume_artifact);
    let first_child = getCompartmentFirstChildOffset();
    definition['svg']['x'] = first_child.dx;
    definition['svg']['y'] = first_child.dy;
    // Add positioning offset
    definition['svg']['y'] += Math.round(positional_adjustments.padding.y * position);
    definition['svg']['y'] += Math.round(positional_adjustments.spacing.y * position);
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = block_storage_volume_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

// TODO: Delete
function drawBlockStorageVolumeSVGDeprecated(artifact) {
    let parent_id = artifact['compartment_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + block_storage_volume_artifact + ' : ' + id);
    // Check if this Block Storage Volume has been attached to an Instance and if so do not draw because it will be done
    // as part of the instance
    if (okitJson.hasOwnProperty('instances')) {
        for (let instance of okitJson['instances']) {
            if (instance.hasOwnProperty('block_storage_volume_ids')) {
                if (instance['block_storage_volume_ids'].includes(artifact['id'])) {
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
        if (!compartment_bui_sub_artifacts[parent_id].hasOwnProperty('artifact_position')) {
            compartment_bui_sub_artifacts[parent_id]['artifact_position'] = 0;
        }
        // Calculate Position
        let position = compartment_bui_sub_artifacts[parent_id]['artifact_position'];
        // Increment Icon Position
        compartment_bui_sub_artifacts[parent_id]['artifact_position'] += 1;

        let svg = drawArtifact(newBlockStorageVolumeDefinition(artifact, position));

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
        });
    } else {
        console.warn(parent_id + ' was not found in compartment sub artifacts : ' + JSON.stringify(compartment_bui_sub_artifacts));
    }
    console.groupEnd();
}

/*
** Property Sheet Load function
 */
// TODO: Delete
function loadBlockStorageVolumePropertiesDeprecated(id) {
    $("#properties").load("propertysheets/block_storage_volume.html", function () {
        if ('block_storage_volumes' in okitJson) {
            console.info('Loading ' + block_storage_volume_artifact + ' : ' + id);
            let json = okitJson['block_storage_volumes'];
            for (let i = 0; i < json.length; i++) {
                let block_storage_volume = json[i];
                if (block_storage_volume['id'] == id) {
                    block_storage_volume['virtual_cloud_network'] = okitIdsJsonObj[block_storage_volume['vcn_id']];
                    // Load Properties
                    loadProperties(block_storage_volume);
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
    console.info('------------- queryBlockStorageVolumeAjax --------------------');
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
            //okitJson['block_storage_volumes'] = response_json;
            okitJson.load({block_storage_volumes: response_json});
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryBlockStorageVolumeAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + block_storage_volume_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}


$(document).ready(function() {
    clearBlockStorageVolumeVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', block_storage_volume_query_cb);
    cell.append('label').text(block_storage_volume_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(block_storage_volume_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'block_storage_volume_name_filter')
        .attr('name', 'block_storage_volume_name_filter');
});














/*
** Define Block Storage Volume Class
 */
class BlockStorageVolume extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        // Configure default values
        this.id = 'okit-' + block_storage_volume_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(block_storage_volume_prefix, okitjson.block_storage_volumes.length + 1);
        this.compartment_id = data.parent_id;
        this.availability_domain = '1';
        this.size_in_gbs = 1024;
        this.backup_policy = 'bronze';
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = function() {return parent};
            this.parent_id = parent.id;
        } else {
            this.parent_id = this.compartment_id;
            for (let parent of okitjson.compartments) {
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
        return new BlockStorageVolume(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return block_storage_volume_artifact;
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
        // Remove Instance references
        for (let instance of this.getOkitJson().instances) {
            for (let i=0; i < instance.block_storage_volume_ids.length; i++) {
                if (instance.block_storage_volume_ids[i] === this.id) {
                    instance.block_storage_volume_ids.splice(i, 1);
                }
            }
        }
    }


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        if (this.isAttached()) {
            console.groupEnd();
            return;
        }
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
        return svg;
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
        definition['rect']['stroke']['colour'] = block_storage_volume_stroke_colour;
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

    isAttached() {
        // Check if this is attached but exclude when parent is the attachment type.
        if (this.getParent().getArtifactReference() !== instance_artifact) {
            for (let instance of this.getOkitJson().instances) {
                if (instance.block_storage_volume_ids.includes(this.id)) {
                    console.info(this.display_name + ' attached to instance ' + instance.display_name);
                    return true;
                }
            }
        }
        return false;
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $("#properties").load("propertysheets/block_storage_volume.html", function () {
            // Load Referenced Ids
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
        return [compartment_artifact];
    }
}


