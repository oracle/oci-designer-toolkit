console.log('Loaded Internet Gateway Javascript');

/*
** Set Valid drop Targets
 */
let compartment_artifact = 'Compartment';

asset_drop_targets[compartment_artifact] = [];
asset_connect_targets[compartment_artifact] = [];
asset_add_functions[compartment_artifact] = "addCompartment";
asset_delete_functions[compartment_artifact] = "deleteCompartment";

let compartment_ids = [];
let compartment_count = 0;
let compartment_prefix = 'comp';

/*
** Reset variables
 */

function clearCompartmentVariables() {
    compartment_ids = [];
    compartment_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addCompartment(vcnid) {
    let id = 'okit-compartment-' + uuidv4();
    console.log('Adding Internet Gateway : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!('compartments' in OKITJsonObj)) {
        OKITJsonObj['compartments'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    compartment_ids.push(id);

    // Increment Count
    compartment_count += 1;
    let compartment = {};
    compartment['id'] = id;
    compartment['name'] = generateDefaultName(compartment_prefix, compartment_count);
    OKITJsonObj['compartments'].push(compartment);
    okitIdsJsonObj[id] = compartment['name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawCompartmentSVG(compartment);
    loadCompartmentProperties(id);
}

/*
** Delete From JSON Model
 */

function deleteCompartment(id) {
    console.log('Delete Compartment ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < OKITJsonObj['compartments'].length; i++) {
        if (OKITJsonObj['compartments'][i]['id'] == id) {
            OKITJsonObj['compartments'].splice(i, 1);
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
function drawCompartmentSVG(compartment) {
    let parent_id = "canvas-wrapper";
    let id = compartment['id'];
    console.log('Drawing Compartment : ' + id);
    let position = vcn_gateway_icon_position;
    let translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
    let translate_y = icon_translate_y_start;
    let svg_x = (icon_width / 2) + (icon_width * position) + (vcn_icon_spacing * position);
    let svg_y = (icon_height / 2) * -1;
    let data_type = "Internet Gateway";

    // Increment Icon Position
    vcn_gateway_icon_position += 1;

    let okitcanvas_svg = d3.select('#' + parent_id);
    let svg = okitcanvas_svg.append("svg")
        .attr("id", id + '-svg')
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("title", compartment['name'])
        .attr("x", svg_x)
        .attr("y", svg_y)
        .attr("width", "100")
        .attr("height", "100");
    svg.append("title")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .text("Internet Gateway: " + compartment['display_name']);

    //loadCompartmentProperties(id);
    // Add click event to display properties
    // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
    // Add dragevent versions
    // Set common attributes on svg element and children
    svg.on("click", function() { loadCompartmentProperties(id); })
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
function loadCompartmentProperties(id) {
    $("#properties").load("propertysheets/compartment.html", function () {
        if ('compartments' in OKITJsonObj) {
            console.log('Loading Internet Gateway: ' + id);
            let json = OKITJsonObj['compartments'];
            for (let i = 0; i < json.length; i++) {
                compartment = json[i];
                //console.log(JSON.stringify(compartment, null, 2));
                if (compartment['id'] == id) {
                    //console.log('Found Internet Gateway: ' + id);
                    compartment['virtual_cloud_network'] = okitIdsJsonObj[compartment['vcn_id']];
                    $('#name').val(compartment['name']);
                    // Add Event Listeners
                    addPropertiesEventListeners(compartment, []);
                    break;
                }
            }
        }
    });
}

clearCompartmentVariables();
