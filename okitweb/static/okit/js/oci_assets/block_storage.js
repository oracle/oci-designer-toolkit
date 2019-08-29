console.log('Loaded Block Storage Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[block_storage_artifact] = [compartment_artifact];
asset_connect_targets[block_storage_artifact] = [instance_artifact];
asset_add_functions[block_storage_artifact] = "addBlockStorage";
asset_delete_functions[block_storage_artifact] = "deleteBlockStorage";

let block_storage_ids = [];
let block_storage_count = 0;

/*
** Reset variables
 */

function clearBlockStorageVariables() {
    block_storage_ids = [];
    block_storage_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addBlockStorage(parent_id, compartment_id) {
    let id = 'okit-' + block_storage_prefix + '-' + uuidv4();
    console.log('Adding ' + block_storage_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!OKITJsonObj.hasOwnProperty('block_storages')) {
        OKITJsonObj['block_storages'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    block_storage_ids.push(id);

    // Increment Count
    block_storage_count += 1;
    let block_storage = {};
    block_storage['compartment_id'] = parent_id;
    block_storage['id'] = id;
    block_storage['display_name'] = generateDefaultName(block_storage_prefix, block_storage_count);
    block_storage['availability_domain'] = 'AD-1';
    block_storage['size'] = 1024;
    block_storage['backup_policy'] = 'bronze';
    OKITJsonObj['block_storages'].push(block_storage);
    okitIdsJsonObj[id] = block_storage['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawBlockStorageSVG(block_storage);
    loadBlockStorageProperties(id);
}

/*
** Delete From JSON Model
 */

function deleteBlockStorage(id) {
    console.log('Delete ' + block_storage_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < OKITJsonObj['block_storages'].length; i++) {
        if (OKITJsonObj['block_storages'][i]['id'] == id) {
            OKITJsonObj['block_storages'].splice(i, 1);
        }
    }
    // Remove Subnet references
    if ('route_tables' in OKITJsonObj) {
        for (route_table of OKITJsonObj['route_tables']) {
            for (let i = 0; i < route_table['route_rules'].length; i++) {
                if (route_table['route_rules'][i]['network_entity_id'] == id) {
                    route_table['route_rules'].splice(i, 1);
                }
            }
        }
    }
}

/*
** SVG Creation
 */
function drawBlockStorageSVG(block_storage) {
    let parent_id = block_storage['compartment_id'];
    let id = block_storage['id'];
    let compartment_id = block_storage['compartment_id'];
    console.log('Drawing ' + block_storage_artifact + ' : ' + id);
    if (compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!compartment_bui_sub_artifacts[parent_id].hasOwnProperty('block_storage_position')) {
            compartment_bui_sub_artifacts[parent_id]['block_storage_position'] = 0;
        }
        let position = compartment_bui_sub_artifacts[parent_id]['block_storage_position'];
        let translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
        let translate_y = icon_translate_y_start;
        let svg_x = 0; //(icon_width / 4);
        let svg_y = (icon_height / 4) * 3 + (icon_height * position) + (vcn_icon_spacing * position);
        let data_type = block_storage_artifact;

        // Increment Icon Position
        compartment_bui_sub_artifacts[parent_id]['block_storage_position'] += 1;

        //let okitcanvas_svg = d3.select(okitcanvas);
        let parent_svg = d3.select('#' + parent_id + "-svg");
        let svg = parent_svg.append("svg")
            .attr("id", id + '-svg')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", block_storage['display_name'])
            .attr("x", svg_x)
            .attr("y", svg_y)
            .attr("width", "100")
            .attr("height", "100");
        let rect = svg.append("rect")
            .attr("id", id)
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", block_storage['display_name'])
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
            .text(block_storage_artifact + ": " + block_storage['display_name']);
        let g = svg.append("g")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
        g.append("path")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("class", "st0")
            .attr("d", "M172.6,88.4c-13.7-1.6-28-1.6-28.6-1.6c-0.6,0-14.8,0-28.6,1.6c-24,2.8-24.2,7.8-24.2,7.9v95.5c0,0,0.3,5,24.2,7.9c13.7,1.6,28,1.6,28.6,1.6c0.6,0,14.8,0,28.6-1.6c24-2.8,24.2-7.8,24.2-7.9V96.3C196.8,96.2,196.5,91.2,172.6,88.4z M137.2,180.7h-18.9v-18.9h18.9V180.7z M137.2,146.5h-18.9v-18.9h18.9V146.5z M168.1,180.7h-18.9v-18.9h18.9V180.7z M168.1,146.5h-18.9v-18.9h18.9V146.5z M192.8,104.1c-1.8,2.8-18.9,7.5-48.3,7.5c-29.4,0-46.5-4.7-48.3-7.5c0,0,0,0,0,0c1.7-2.8,18.8-7.6,48.3-7.6C174,96.5,191.1,101.2,192.8,104.1C192.8,104.1,192.8,104.1,192.8,104.1z");

        let boundingClientRect = rect.node().getBoundingClientRect();
        /*
         Add click event to display properties
         Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
         Add dragevent versions
         Set common attributes on svg element and children
         */
        svg.on("click", function () {
            loadBlockStorageProperties(id);
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
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parentid", parent_id)
            .attr("data-compartment-id", compartment_id)
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width/2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width/2))
            .attr("data-connector-id", id)
            .attr("dragable", true)
            .selectAll("*")
                .attr("data-type", data_type)
                .attr("data-okit-id", id)
                .attr("data-parentid", parent_id)
                .attr("data-compartment-id", compartment_id)
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
function loadBlockStorageProperties(id) {
    $("#properties").load("propertysheets/block_storage.html", function () {
        if ('block_storages' in OKITJsonObj) {
            console.log('Loading ' + block_storage_artifact + ' : ' + id);
            let json = OKITJsonObj['block_storages'];
            for (let i = 0; i < json.length; i++) {
                block_storage = json[i];
                //console.log(JSON.stringify(block_storage, null, 2));
                if (block_storage['id'] == id) {
                    //console.log('Found ' + block_storage_artifact + ' : ' + id);
                    block_storage['virtual_cloud_network'] = okitIdsJsonObj[block_storage['vcn_id']];
                    $("#virtual_cloud_network").html(block_storage['virtual_cloud_network']);
                    $('#display_name').val(block_storage['display_name']);
                    $('#size').val(block_storage['size']);
                    // Add Event Listeners
                    addPropertiesEventListeners(block_storage, []);
                    break;
                }
            }
        }
    });
}

clearBlockStorageVariables();
