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
const min_instance_width = Math.round((icon_width * 3) + (icon_spacing * 4));
const min_instance_height = Math.round(icon_height * 5 / 2);
let instance_ids = [];

/*
** Reset variables
 */

function clearInstanceVariables() {
    instance_ids = [];
}

/*
** Add Asset to JSON Model
 */
// TODO: Delete
function addInstanceDeprecated(subnet_id, compartment_id) {
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
    let instance_count = okitJson['instances'].length + 1;
    let instance = {};
    instance['subnet_id'] = subnet_id;
    instance['subnet'] = '';
    instance['compartment_id'] = compartment_id;
    instance['availability_domain'] = '1';
    instance['id'] = id;
    instance['display_name'] = generateDefaultName(instance_prefix, instance_count);
    instance['hostname_label'] = instance['display_name'].toLowerCase();
    instance['os'] = 'Oracle Linux';
    instance['version'] = '7.7';
    instance['shape'] = 'VM.Standard2.1';
    instance['boot_volume_size_in_gbs'] = '50';
    instance['authorized_keys'] = '';
    instance['cloud_init_yaml'] = '';
    instance['block_storage_volume_ids'] = [];
    instance['block_storage_volumes'] = [];
    instance['subnet_ids'] = [];
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

// TODO: Delete
function deleteInstanceDeprecated(id) {
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
// TODO: Delete
function getInstanceFirstChildEdgeOffsetDeprecated() {
    let offset = {
        dx: Math.round(positional_adjustments.spacing.x),
        dy: 0
    };
    return offset;
}

// TODO: Delete
function getInstanceDimensionsDeprecated(id='') {
    let dimensions = {width:getInstanceFirstChildEdgeOffset().dx, height:min_instance_height};
    console.groupCollapsed('Processing Instance ' + id);
    if (okitJson.hasOwnProperty('instances')) {
        for (let instance of okitJson['instances']) {
            console.info('Processing ' + instance.id);
            if (instance['id'] == id) {
                //dimensions['width'] = getInstanceFirstChildEdgeOffset();
                if (instance.hasOwnProperty('block_storage_volume_ids')) {
                    console.info('Found ' + instance['block_storage_volume_ids'].length + ' Attached Block Storage Volumes' )
                    dimensions['width'] += instance['block_storage_volume_ids'].length * positional_adjustments.padding.x;
                    dimensions['width'] += instance['block_storage_volume_ids'].length * positional_adjustments.spacing.x;
                }
                if (instance.hasOwnProperty('subnet_ids')) {
                    console.info('Found ' + instance['subnet_ids'].length + ' Attached Vnics' )
                    dimensions['width'] += instance['subnet_ids'].length * positional_adjustments.padding.x;
                    dimensions['width'] += instance['subnet_ids'].length * positional_adjustments.spacing.x;
                }
                break;
            }
        }
    } else {
        console.warn('Instances List not found');
    }
    console.info('Instance Dimensions ' + JSON.stringify(dimensions));
    dimensions['width'] = Math.max(dimensions['width'], min_instance_width);
    console.info('Instance Dimensions ' + JSON.stringify(dimensions));
    console.groupEnd();
    return dimensions;
}

// TODO: Delete
function newInstanceDefinitionDeprecated(artifact, position=0) {
    let dimensions = getInstanceDimensions(artifact['id']);
    let definition = newArtifactSVGDefinition(artifact, instance_artifact);
    let first_child = getSubnetFirstChildInstanceOffset(artifact['subnet_id']);
    definition['svg']['x'] = Math.round(first_child.dx + (min_instance_width * position) + (positional_adjustments.spacing.x * position));
    definition['svg']['y'] = Math.round(first_child.dy);
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = instance_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    definition['rect']['height_adjust'] = (Math.round(icon_height / 2) * -1);
    definition['name']['show'] = true;
    return definition;
}

// TODO: Delete
function drawInstanceSVGDeprecated(artifact) {
    let parent_id = artifact['subnet_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + instance_artifact + ' : ' + id + ' [' + parent_id + ']');
    console.info('Name : ' + artifact['display_name']);

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
        console.warn('Parent ' + parent_id + ' not found.');
        console.groupEnd();
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

// TODO: Delete
function clearInstanceSVGDeprecated(instance) {
    let id = instance['id'];
    d3.selectAll("line[id*='" + id + "']").remove();
}

// TODO: Delete
function drawInstanceConnectorsSVGDeprecated(instance) {
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

// TODO: Delete
function drawInstanceAttachmentsSVGDeprecated(instance) {
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
    if (instance.hasOwnProperty('subnet_ids')) {
        for (let subnet_id of instance['subnet_ids']) {
            for (let subnet of okitJson['subnets']) {
                if (subnet_id == subnet['id']) {
                    let artifact_clone = JSON.parse(JSON.stringify(subnet));
                    artifact_clone['parent_id'] = instance['id'];
                    drawAttachedSubnetVnic(artifact_clone, attachment_count);
                }
            }
            attachment_count += 1;
        }
    }
    console.groupEnd();
}

// TODO: Delete
function drawAttachedBlockStorageVolumeDeprecated(artifact, bs_count) {
    console.info('Drawing ' + instance_artifact + ' Block Storage Volume : ' + artifact['id']);
    let first_child = getInstanceFirstChildEdgeOffset();
    let dimensions = getInstanceDimensions(artifact['parent_id']);
    let artifact_definition = newBlockStorageVolumeDefinition(artifact, bs_count);
    artifact_definition['svg']['x'] = Math.round(first_child.dx + (positional_adjustments.padding.x * bs_count) + (positional_adjustments.spacing.x * bs_count));
    artifact_definition['svg']['y'] = Math.round(dimensions.height - positional_adjustments.padding.y);

    let svg = drawArtifact(artifact_definition);

    // Add click event to display properties
    svg.on("click", function () {
        loadBlockStorageVolumeProperties(artifact['id']);
        d3.event.stopPropagation();
    });
}

// TODO: Delete
function drawAttachedSubnetVnicDeprecated(artifact, bs_count) {
    console.info('Drawing ' + instance_artifact + ' Subnet Vnic : ' + artifact['id']);
    let first_child = getInstanceFirstChildEdgeOffset();
    let dimensions = getInstanceDimensions(artifact['parent_id']);
    let artifact_definition = newVirtualNetworkInterfaceDefinition(artifact, bs_count);
    artifact_definition['svg']['x'] = Math.round(first_child.dx + (positional_adjustments.padding.x * bs_count) + (positional_adjustments.spacing.x * bs_count));
    artifact_definition['svg']['y'] = Math.round(dimensions.height - positional_adjustments.padding.y);
    artifact_definition['rect']['stroke']['colour'] = stroke_colours.svg_orange;

    let id = artifact['id'];
    // Update id so it does not conflict with actual subnet
    artifact['id'] += '-vnic';

    let svg = drawArtifact(artifact_definition);

    // Add click event to display properties
    svg.on("click", function () {
        loadSubnetProperties(id);
        d3.event.stopPropagation();
    });
    let fill = d3.select('#' + id).attr('fill');
    svg.on("mouseover", function () {
        d3.select('#' + id).attr('fill', svg_highlight_colour);
        d3.event.stopPropagation();
    });
    svg.on("mouseout", function () {
        d3.select('#' + id).attr('fill', fill);
        d3.event.stopPropagation();
    });
}

/*
** Property Sheet Load function
 */
// TODO: Delete
function loadInstancePropertiesDeprecated(id) {
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
                    // Build Block Storage Select
                    let block_storage_volume_select = $('#block_storage_volume_ids');
                    if (okitJson.hasOwnProperty('block_storage_volumes')) {
                        for (let block_storage_volume of okitJson['block_storage_volumes']) {
                            block_storage_volume_select.append($('<option>').attr('value', block_storage_volume['id']).text(block_storage_volume['display_name']));
                        }
                    }
                    // Build Vnic / Subnet List
                    let subnet_select = $('#subnet_ids');
                    if (okitJson.hasOwnProperty('subnets')) {
                        for (let subnet of okitJson['subnets']) {
                            if (subnet['id'] != instance['subnet_id']) {
                                subnet_select.append($('<option>').attr('value', subnet['id']).text(subnet['display_name']));
                            }
                        }
                    }
                    // Load Properties
                    loadProperties(instance);
                    // Add Event Listeners
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















/*
** Define Instance Class
 */
class Instance extends OkitSvgArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        // Configure default values
        this.id = 'okit-' + instance_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(instance_prefix, okitjson.instances.length + 1);
        this.compartment_id = '';
        this.subnet_id = data.parent_id;
        this.availability_domain = '1';
        this.hostname_label = this.display_name.toLowerCase();
        this.os = 'Oracle Linux';
        this.version = '7.7';
        this.shape = 'VM.Standard2.1';
        this.boot_volume_size_in_gbs = '50';
        this.authorized_keys = '';
        this.cloud_init_yaml = '';
        this.block_storage_volume_ids = [];
        this.object_storage_bucket_ids = [];
        this.autonomous_database_ids = [];
        this.subnet_ids = [];
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
        return new Instance(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return instance_artifact;
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
        // Remove Load Balancer references
        for (load_balancer of this.getOkitJson().load_balancers) {
            for (let i = 0; i < load_balancer.instance_ids.length; i++) {
                if (load_balancer.instance_ids[i] === this.id) {
                    load_balancer.instance_ids.splice(i, 1);
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
        // Get Inner Rect to attach Connectors
        let rect = svg.select("rect[id='" + this.id + "']");
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add Connector Data
        svg.attr("data-compartment-id", this.compartment_id)
            .attr("data-connector-start-y", boundingClientRect.y)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", this.id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-connector-start-y", boundingClientRect.y)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", this.id)
            .attr("dragable", true);
        // Draw Attachments
        this.drawAttachments();
        console.groupEnd();
    }

    drawAttachments() {
        console.groupCollapsed('Drawing ' + instance_artifact + ' : ' + this.id + ' Attachments');
        let attachment_count = 0;
        for (let block_storage_id of this.block_storage_volume_ids) {
            let artifact_clone = new BlockStorageVolume(this.getOkitJson().getBlockStorageVolume(block_storage_id), this.getOkitJson(), this);
            artifact_clone['parent_id'] = this.id;
            console.info('Drawing ' + this.getArtifactReference() + ' Block Storage Volume : ' + artifact_clone.display_name);
            artifact_clone.draw();
            attachment_count += 1;
        }
        for (let subnet_id of this.subnet_ids) {
            for (let subnet of this.getOkitJson().subnets) {
                if (subnet_id == subnet['id']) {
                    let artifact_clone = new VirtualNetworkInterface(subnet, this.getOkitJson(), this);
                    artifact_clone['parent_id'] = this.id;
                    artifact_clone.draw();
                    //this.drawAttachedSubnetVnic(artifact_clone, attachment_count);
                }
            }
            attachment_count += 1;
        }
        console.groupEnd();
    }

    drawAttachedBlockStorageVolume(artifact, bs_count) {
        console.info('Drawing ' + instance_artifact + ' Block Storage Volume : ' + artifact.id);
        let first_child = this.getParent().getChildOffset(artifact.getArtifactReference());
        let dimensions = this.getDimensions();
        let artifact_definition = newBlockStorageVolumeDefinition(artifact, bs_count);
        artifact_definition['svg']['x'] = Math.round(first_child.dx + (positional_adjustments.padding.x * bs_count) + (positional_adjustments.spacing.x * bs_count));
        artifact_definition['svg']['y'] = Math.round(dimensions.height - positional_adjustments.padding.y);

        let svg = drawArtifact(artifact_definition);

        // Add click event to display properties
        svg.on("click", function () {
            loadBlockStorageVolumeProperties(artifact['id']);
            d3.event.stopPropagation();
        });
    }

    drawAttachedSubnetVnic(artifact, bs_count) {
        console.info('Drawing ' + instance_artifact + ' Subnet Vnic : ' + artifact.id);
        let first_child = this.getParent().getChildOffset(artifact.getArtifactReference());
        let dimensions = this.getDimensions();
        let artifact_definition = newVirtualNetworkInterfaceDefinition(artifact, bs_count);
        artifact_definition['svg']['x'] = Math.round(first_child.dx + (positional_adjustments.padding.x * bs_count) + (positional_adjustments.spacing.x * bs_count));
        artifact_definition['svg']['y'] = Math.round(dimensions.height - positional_adjustments.padding.y);
        artifact_definition['rect']['stroke']['colour'] = stroke_colours.svg_orange;

        let id = artifact['id'];
        // Update id so it does not conflict with actual subnet
        artifact['id'] += '-vnic';

        let svg = drawArtifact(artifact_definition);

        // Add click event to display properties
        svg.on("click", function () {
            loadSubnetProperties(id);
            d3.event.stopPropagation();
        });
        let fill = d3.select('#' + id).attr('fill');
        svg.on("mouseover", function () {
            d3.select('#' + id).attr('fill', svg_highlight_colour);
            d3.event.stopPropagation();
        });
        svg.on("mouseout", function () {
            d3.select('#' + id).attr('fill', fill);
            d3.event.stopPropagation();
        });
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
        definition['rect']['stroke']['colour'] = instance_stroke_colour;
        definition['rect']['stroke']['dash'] = 1;
        definition['rect']['height_adjust'] = (Math.round(icon_height / 2) * -1);
        definition['name']['show'] = true;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    // Return Artifact Dimensions
    getDimensions() {
        console.groupCollapsed('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getMinimumDimensions();
        // Calculate Size based on Child Artifacts
        // Process Bottom Edge Artifacts
        let offset = this.getFirstBottomEdgeChildOffset();
        let bottom_edge_dimensions = {width: offset.dx, height: offset.dy};
        // Block Storage
        bottom_edge_dimensions.width += Math.round(this.block_storage_volume_ids.length * positional_adjustments.padding.x);
        bottom_edge_dimensions.width += Math.round(this.block_storage_volume_ids.length * positional_adjustments.spacing.x);
        // Virtual Network Interface Cards
        bottom_edge_dimensions.width += Math.round(this.subnet_ids.length * positional_adjustments.padding.x);
        bottom_edge_dimensions.width += Math.round(this.subnet_ids.length * positional_adjustments.spacing.x);
        dimensions.width  = Math.max(dimensions.width, bottom_edge_dimensions.width);
        dimensions.height = Math.max(dimensions.height, bottom_edge_dimensions.height);
        // Check size against minimum
        dimensions.width  = Math.max(dimensions.width,  this.getMinimumDimensions().width);
        dimensions.height = Math.max(dimensions.height, this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: min_instance_width, height:min_instance_height};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $("#properties").load("propertysheets/instance.html", function () {
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
        return [];
    }


    /*
    ** Child Offset Functions
     */
    getBottomEdgeChildOffset() {
        let offset = this.getFirstBottomEdgeChildOffset();
        // Count how many top edge children and adjust.
        let count = 0;
        for (let child of this.getBottomEdgeArtifacts()) {
            count += $('#' + this.id + '-svg').children("svg[data-type='" + child + "']").length;
        }
        console.info('Bottom Edge Count : ' + count);
        let dimensions = this.getDimensions();
        // Increment x position based on count
        offset.dx += Math.round((icon_width * count) + (positional_adjustments.spacing.x * count));
        offset.dy = Math.round(dimensions.height - positional_adjustments.padding.y);
        return offset;
    }


    /*
    ** Child Artifact Functions
     */
    getBottomEdgeArtifacts() {
        return [block_storage_volume_artifact, virtual_network_interface_artifact];
    }
}

