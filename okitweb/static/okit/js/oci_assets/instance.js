console.log('Loaded Instance Javascript');

/*
** Set Valid drop Targets
 */

asset_drop_targets["Instance"] = ["Subnet"];
asset_connect_targets["Instance"] = ["Load Balancer"];
asset_add_functions["Instance"] = "addInstance";
asset_delete_functions["Instance"] = "deleteInstance";

let instance_ids = [];
let instance_count = 0;
let instance_prefix = 'in';

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
function addInstance(subnetid) {
    let id = 'okit-in-' + uuidv4();
    console.log('Adding Instance : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!('instances' in OKITJsonObj)) {
        OKITJsonObj['instances'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    instance_ids.push(id);

    // Increment Count
    instance_count += 1;
    let instance = {};
    instance['subnet_id'] = subnetid;
    instance['subnet'] = '';
    instance['id'] = id;
    instance['display_name'] = generateDefaultName(instance_prefix, instance_count);
    instance['hostname_label'] = instance['display_name'].toLowerCase();
    instance['os'] = 'Oracle Linux';
    instance['version'] = '7.6';
    instance['shape'] = 'VM.Standard2.1';
    instance['boot_volume_size_in_gbs'] = '50';
    instance['authorized_keys'] = '';
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
    console.log('Drawing Instance : ' + id);
    //console.log('Subnet Id : ' + parent_id);
    //console.log('Subnet Content : ' + JSON.stringify(subnet_content));
    // Only draw the instance if the subnet exists
    if (parent_id in subnet_content) {
        let position = subnet_content[parent_id]['instance_position'];
        let translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
        let translate_y = icon_translate_y_start;
        let svg_x = (icon_width / 2) + (icon_width * position) + (vcn_icon_spacing * position);
        let svg_y = (icon_height / 4) * 9;
        let data_type = "Instance";

        // Increment Icon Position
        subnet_content[parent_id]['instance_position'] += 1;

        let parent_svg = d3.select('#' + parent_id + "-svg");
        let svg = parent_svg.append("svg")
            .attr("id", id + '-svg')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", instance['display_name'])
            .attr("x", svg_x)
            .attr("y", svg_y)
            .attr("width", "100")
            .attr("height", "100");
        let rect = svg.append("rect")
            .attr("id", id)
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", instance['display_name'])
            .attr("x", icon_x)
            .attr("y", icon_y)
            .attr("width", icon_width)
            .attr("height", icon_height)
            .attr("stroke", icon_stroke_colour)
            .attr("stroke-dasharray", "1, 1")
            .attr("fill", "white")
            .attr("style", "fill-opacity: .25;");
        rect.append("title")
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
        svg.on("click", function () {loadInstanceProperties(id);})
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
                .attr("data-connector-start-y", boundingClientRect.y)
                .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-end-y", boundingClientRect.y)
                .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-id", id)
                .attr("dragable", true);
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
                    // Add Event Listeners
                    addPropertiesEventListeners(instance, []);
                    break;
                }
            }
        }
    });
}

clearInstanceVariables();
