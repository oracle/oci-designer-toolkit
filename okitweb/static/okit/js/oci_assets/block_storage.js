console.log('Loaded Block Storage Javascript');

/*
** Set Valid drop Targets
 */
let block_storage_artifact = 'Block Storage';


asset_drop_targets[block_storage_artifact] = ["Compartment"];
asset_connect_targets[block_storage_artifact] = [];
asset_add_functions[block_storage_artifact] = "addBlockStorage";
asset_delete_functions[block_storage_artifact] = "deleteBlockStorage";

let block_storage_ids = [];
let block_storage_count = 0;
let block_storage_prefix = 'bs';

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
function addBlockStorage(compartment_id) {
    let id = 'okit-bs-' + uuidv4();
    console.log('Adding ' + block_storage_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!('block_storages' in OKITJsonObj)) {
        OKITJsonObj['block_storages'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    block_storage_ids.push(id);

    // Increment Count
    block_storage_count += 1;
    let block_storage = {};
    block_storage['compartment_id'] = compartment_id;
    block_storage['id'] = id;
    block_storage['display_name'] = generateDefaultName(block_storage_prefix, block_storage_count);
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
    let parent_id = block_storage['vcn_id'];
    let id = block_storage['id'];
    console.log('Drawing ' + block_storage_artifact + ' : ' + id);
    let position = vcn_gateway_icon_position;
    let translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
    let translate_y = icon_translate_y_start;
    let svg_x = (icon_width / 2) + (icon_width * position) + (vcn_icon_spacing * position);
    let svg_y = (icon_height / 2) * -1;
    let data_type = block_storage_artifact;

    // Increment Icon Position
    vcn_gateway_icon_position += 1;

    //let okitcanvas_svg = d3.select(okitcanvas);
    let okitcanvas_svg = d3.select('#' + parent_id + "-svg");
    let svg = okitcanvas_svg.append("svg")
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
    let g1 = svg.append("g")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
    let g2 = g1.append("g");
    let g3 = g2.append("g");
    let g4 = g3.append("g");
    g4.append("path")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("class", "st0")
        .attr("d", "M200.4,104.2c-0.4,0-0.8,0-1.2,0.1c-1.6-5.2-6.5-9-12.3-9c-1.5,0-2.9,0.3-4.2,0.7c-2.6-3.8-7-6.3-12-6.3c-6.9,0-12.7,4.8-14.2,11.2c-0.1,0-0.3,0-0.4,0c-8,0-14.6,6.5-14.6,14.6c0,8,6.5,14.6,14.6,14.6h44.3c7.1,0,12.9-5.8,12.9-12.9C213.3,110,207.5,104.2,200.4,104.2z");
    let g5 = g3.append("g");
    let g6 = g5.append("g");
    g6.append("path")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("class", "st0")
        .attr("d", "M129,151.8l-3.4-4l3.2-2.7l3.4,4L129,151.8z M135.4,146.4l-3.4-4l3.2-2.7l3.4,4L135.4,146.4z M141.7,141.1l-3.4-4l3.2-2.7l3.4,4L141.7,141.1z M148.1,135.7l-3.4-4l3.2-2.7l3.4,4L148.1,135.7z");
    g6.append("path")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("class", "st0")
        .attr("d", "M103.5,140.8c-15.9,0-28.8,12.9-28.8,28.8c0,15.9,12.9,28.8,28.8,28.8c15.9,0,28.8-12.9,28.8-28.8C132.3,153.6,119.4,140.8,103.5,140.8z M82.2,171v-3h7.3v-4.5l10.4,6l-10.4,6V171H82.2z M103.7,190.7l-6-10.4h4.5v-21.6h-4.5l6-10.4l6,10.4h-4.5v21.6h4.5L103.7,190.7z M118.1,171v4.5l-10.4-6l10.4-6v4.5h7.3v3H118.1z");

    //loadBlockStorageProperties(id);
    // Add click event to display properties
    // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
    // Add dragevent versions
    // Set common attributes on svg element and children
    svg.on("click", function() { loadBlockStorageProperties(id); })
        .on("contextmenu", handleContextMenu)
        .attr("data-type", data_type)
        .attr("data-okit-id", id)
        .attr("data-parentid", parent_id)
        .selectAll("*")
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parentid", parent_id);
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
                    // Add Event Listeners
                    addPropertiesEventListeners(block_storage, []);
                    break;
                }
            }
        }
    });
}

clearBlockStorageVariables();
