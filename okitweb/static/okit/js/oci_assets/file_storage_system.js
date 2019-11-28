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
let propertires_file_storage_system = {}

/*
** Reset variables
 */

// TODO: Delete
function clearFileStorageSystemVariables() {
    file_storage_system_ids = [];
}

/*
** Add Asset to JSON Model
 */
// TODO: Delete
function addFileStorageSystemDeprecated(subnet_id, compartment_id) {
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
    let file_storage_system_count = okitJson['file_storage_systems'].length + 1;
    let file_storage_system = {};
    file_storage_system['subnet_id'] = subnet_id;
    file_storage_system['compartment_id'] = compartment_id;
    file_storage_system['availability_domain'] = '1';
    file_storage_system['id'] = id;
    file_storage_system['subnet_id'] = subnet_id;
    file_storage_system['source'] = getSubnet(subnet_id)['cidr_block'];
    file_storage_system['display_name'] = generateDefaultName(file_storage_system_prefix, file_storage_system_count);
    file_storage_system['hostname_label'] = file_storage_system['display_name'].toLowerCase();
    file_storage_system['path'] = '/mnt';
    file_storage_system['access'] = 'READ_ONLY';
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

// TODO: Delete
function deleteFileStorageSystemDeprecated(id) {
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
// TODO: Delete
function getFileStorageSystemDimensionsDeprecated(id='') {
    return {width:icon_width, height:icon_height};
}

// TODO: Delete
function newFileStorageSystemDefinitionDeprecated(artifact, position=0) {
    console.info('New ' + file_storage_system_artifact + ' Definition for ' + JSON.stringify(artifact));
    let dimensions = getFileStorageSystemDimensions();
    let definition = newArtifactSVGDefinition(artifact, file_storage_system_artifact);
    let first_child = getSubnetFirstChildOffset();
    definition['svg']['x'] = Math.round(first_child.dx);
    definition['svg']['y'] = Math.round(first_child.dy + (icon_width * position) + (positional_adjustments.spacing.y * position));
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = file_storage_system_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    console.info('New ' + file_storage_system_artifact + ' Definition ' + JSON.stringify(definition));
    return definition;
}

// TODO: Delete
function drawFileStorageSystemSVGDeprecated(artifact) {
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
// TODO: Delete
function loadFileStorageSystemPropertiesDeprecated(id) {
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

function queryFileStorageSystemAjax(compartment_id, subnet_id) {
    console.info('------------- queryFileStorageSystemAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['subnet_id'] = subnet_id;
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
            //okitJson['file_storage_systems'] = response_json;
            okitJson.load({file_storage_systems: response_json});
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryFileStorageSystemAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + file_storage_system_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.warn('Status : '+ status)
            console.warn('Error : '+ error)
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















/*
** Define File Storage System Class
 */
class FileStorageSystem extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        // Configure default values
        this.id = 'okit-' + file_storage_system_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(file_storage_system_prefix, okitjson.file_storage_systems.length + 1);
        this.compartment_id = '';
        this.subnet_id = data.parent_id;
        this.availability_domain = '1';
        this.source = this.getOkitJson().getSubnet(this.subnet_id)['cidr_block'];
        this.hostname_label = this.display_name.toLowerCase();
        this.path = '/mnt';
        this.access = 'READ_ONLY';
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.subnet_id;
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            for (let parent of okitjson.subnets) {
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
        return new FileStorageSystem(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return file_storage_system_artifact;
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

    deleteChildren() {}


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
        definition['rect']['stroke']['colour'] = file_storage_system_stroke_colour;
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
        $("#properties").load("propertysheets/file_storage_system.html", function () {
            // Load Referenced Ids
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
        return [subnet_artifact];
    }
}

