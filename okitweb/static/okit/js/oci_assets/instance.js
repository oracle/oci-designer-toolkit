console.log('Loaded Instance Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[instance_artifact] = [subnet_artifact];
asset_connect_targets[instance_artifact] = [load_balancer_artifact];
asset_add_functions[instance_artifact] = "addInstance";
asset_update_functions[instance_artifact] = "updateInstance";
asset_delete_functions[instance_artifact] = "deleteInstance";

const instance_stroke_colour = "blue";
const instance_width = Math.round(icon_width * 4);
const instance_height = Math.round(icon_height * 2 + icon_height / 2);
const instance_svg_width = Math.round(instance_width + icon_x * 2);
const instance_svg_height = Math.round(instance_height + icon_y * 2);
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
    console.log('Adding Instance : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!OKITJsonObj.hasOwnProperty('instances')) {
        OKITJsonObj['instances'] = [];
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
    OKITJsonObj['instances'].push(instance);
    okitIdsJsonObj[id] = instance['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawInstanceSVG(instance);
    loadInstanceProperties(id);
}

/*
** Delete From JSON Model
 */

function deleteInstance(id) {
    console.log('Delete Instance ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < OKITJsonObj['instances'].length; i++) {
        if (OKITJsonObj['instances'][i]['id'] == id) {
            OKITJsonObj['instances'].splice(i, 1);
        }
    }
    // Remove Load Balancer references
    if ('load_balancers' in OKITJsonObj) {
        for (load_balancer of OKITJsonObj['load_balancers']) {
            for (let i=0; i < load_balancer['instance_ids'].length; i++) {
                if (load_balancer['instance_ids'][i] == id) {
                    load_balancer['instance_ids'].splice(i, 1);
                }
            }
        }
    }
}

/*
** SVG Creation
 */
function drawInstanceSVG(instance) {
    let parent_id = instance['subnet_id'];
    let id = instance['id'];
    let compartment_id = instance['compartment_id'];
    console.log('Drawing Instance : ' + id);
    console.log('instance_svg_height : ' + instance_svg_height);
    console.log('instance_svg_width : ' + instance_svg_width);
    console.log('instance_height : ' + instance_height);
    console.log('instance_width : ' + instance_width);
    //console.log('Subnet Id : ' + parent_id);
    //console.log('Subnet Content : ' + JSON.stringify(subnet_bui_sub_artifacts));
    // Only draw the instance if the subnet exists
    if (subnet_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        let position = subnet_bui_sub_artifacts[parent_id]['instance_position'];
        let svg_x = Math.round((icon_width / 2) + (instance_width * position) + (vcn_icon_spacing * position));
        let svg_y = Math.round((icon_height / 4) * 9);
        let data_type = instance_artifact;
        console.log('svg_x : ' + svg_x);
        console.log('svg_y : ' + svg_y);

        // Increment Icon Position
        subnet_bui_sub_artifacts[parent_id]['instance_position'] += 1;

        let parent_svg = d3.select('#' + parent_id + "-svg");
        let svg = parent_svg.append("svg")
            .attr("id", id + '-svg')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", instance['display_name'])
            .attr("x", svg_x)
            .attr("y", svg_y)
            .attr("width", instance_svg_width)
            .attr("height", instance_svg_height);
        let rect = svg.append("rect")
            .attr("id", id)
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", instance['display_name'])
            .attr("x", icon_x)
            .attr("y", icon_y)
            .attr("width", instance_width)
            .attr("height", instance_height)
            .attr("stroke", instance_stroke_colour)
            .attr("stroke-dasharray", "1, 1")
            .attr("fill", "white")
            .attr("style", "fill-opacity: .25;");
        rect.append("title")
            .attr("id", id + '-title')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .text("Instance: " + instance['display_name']);
        let g = svg.append("g")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
        g.append("circle")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("class", "st0")
            .attr("cx", "173")
            .attr("cy", "171.9")
            .attr("r", "3.8");
        g.append("path")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("class", "st0")
            .attr("d", "M194.6,81.8H93.4c-3.5,0-6.3,2.8-6.3,6.3v111.8c0,3.5,2.8,6.3,6.3,6.3h101.1c3.5,0,6.3-2.8,6.3-6.3V88.1C200.9,84.7,198,81.8,194.6,81.8z M132.4,114.5v-0.8v-6.6c0-1.5,1.2-2.7,2.7-2.7h17.8c1.5,0,2.7,1.2,2.7,2.7v6.6v0.8v10.7c0,1.5-1.2,2.7-2.7,2.7h-17.8c-1.5,0-2.7-1.2-2.7-2.7V114.5z M132.4,142.6v-0.8v-6.6c0-1.5,1.2-2.7,2.7-2.7h17.8c1.5,0,2.7,1.2,2.7,2.7v6.6v0.8v10.7c0,1.5-1.2,2.7-2.7,2.7h-17.8c-1.5,0-2.7-1.2-2.7-2.7V142.6z M105.1,114.5v-0.8v-6.6c0-1.5,1.2-2.7,2.7-2.7h17.8c1.5,0,2.7,1.2,2.7,2.7v6.6v0.8v10.7c0,1.5-1.2,2.7-2.7,2.7h-17.8c-1.5,0-2.7-1.2-2.7-2.7V114.5zM105.1,142.6v-0.8v-6.6c0-1.5,1.2-2.7,2.7-2.7h17.8c1.5,0,2.7,1.2,2.7,2.7v6.6v0.8v10.7c0,1.5-1.2,2.7-2.7,2.7h-17.8c-1.5,0-2.7-1.2-2.7-2.7V142.6z M182.9,180.2c0,1.9-1.6,3.5-3.5,3.5h-70.7c-1.9,0-3.5-1.6-3.5-3.5v-19.6h77.8V180.2z M182.9,141.8v0.8v10.7c0,1.5-1.2,2.7-2.7,2.7h-17.8c-1.5,0-2.7-1.2-2.7-2.7v-10.7v-0.8v-6.6c0-1.5,1.2-2.7,2.7-2.7h17.8c1.5,0,2.7,1.2,2.7,2.7V141.8z M182.9,113.8v0.8v10.7c0,1.5-1.2,2.7-2.7,2.7h-17.8c-1.5,0-2.7-1.2-2.7-2.7v-10.7v-0.8v-6.6c0-1.5,1.2-2.7,2.7-2.7h17.8c1.5,0,2.7,1.2,2.7,2.7V113.8z")

        //loadInstanceProperties(id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {loadInstanceProperties(id); d3.event.stopPropagation(); })
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
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parentid", parent_id)
            .attr("data-compartment-id", compartment_id)
            .attr("data-connector-start-y", boundingClientRect.y)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true)
            .selectAll("*")
                .attr("data-type", data_type)
                .attr("data-okit-id", id)
                .attr("data-parentid", parent_id)
                .attr("data-compartment-id", compartment_id)
                .attr("data-connector-start-y", boundingClientRect.y)
                .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-end-y", boundingClientRect.y)
                .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-id", id)
                .attr("dragable", true);
    }
}

function clearInstanceSVG(instance) {
    let id = instance['id'];
    d3.selectAll("line[id*='" + id + "']").remove();
}

function drawInstanceConnectorsSVG(instance) {
    let id = instance['id'];
    for (let block_storage_id of instance['block_storage_volume_ids']) {
        let block_storage_svg = d3.select('#' + block_storage_id);
        if (block_storage_svg.node()) {
            let parent_id = block_storage_svg.attr('data-parentid');
            let parent_svg = d3.select('#' + parent_id + "-svg");
            if (parent_svg.node()) {
                console.log('Parent SVG : ' + parent_svg.node());
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

/*
** Property Sheet Load function
 */
function loadInstanceProperties(id) {
    $("#properties").load("propertysheets/instance.html", function () {
        if ('instances' in OKITJsonObj) {
            console.log('Loading Instance: ' + id);
            let json = OKITJsonObj['instances'];
            for (let i = 0; i < json.length; i++) {
                instance = json[i];
                //console.log(JSON.stringify(instance, null, 2));
                if (instance['id'] == id) {
                    //console.log('Found Route Table: ' + id);
                    instance['virtual_cloud_network'] = okitIdsJsonObj[instance['subnet_id']];
                    $("#virtual_cloud_network").html(instance['virtual_cloud_network']);
                    $('#display_name').val(instance['display_name']);
                    $('#hostname_label').val(instance['hostname_label']);
                    $('#boot_volume_size_in_gbs').val(instance['boot_volume_size_in_gbs']);
                    $('#authorized_keys').val(instance['authorized_keys']);
                    $('#cloud_init_yaml').val(instance['cloud_init_yaml']);
                    let block_storage_volume_select = $('#block_storage_volume_ids');
                    for (let bsvid of block_storage_volume_ids) {
                        block_storage_volume_select.append($('<option>').attr('value', bsvid).text(okitIdsJsonObj[bsvid]));
                    }
                    block_storage_volume_select.val(instance['block_storage_volume_ids']);
                    // Add Event Listeners
                    addPropertiesEventListeners(instance, []);
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
    console.log('Update ' + instance_artifact + ' : ' + id + ' Adding ' + source_type + ' ' + source_id);
    let instances = OKITJsonObj['instances'];
    //console.log(JSON.stringify(instances))
    for (let i = 0; i < instances.length; i++) {
        let instance = instances[i];
        console.log(i + ') ' + JSON.stringify(instance))
        if (instance['id'] == id) {
            if (source_type == block_storage_volume_artifact) {
                if (instance['block_storage_volume_ids'].indexOf(source_id) > 0 ) {
                    // Already connected so delete existing line
                    d3.select("#" + generateConnectorId(source_id, id)).remove();
                } else {
                    instance['block_storage_volume_ids'].push(source_id);
                    instance['block_storage_volumes'].push(okitIdsJsonObj[source_id]);
                }
            }
        }
    }
    displayOkitJson();
    loadInstanceProperties(id);
}

clearInstanceVariables();
