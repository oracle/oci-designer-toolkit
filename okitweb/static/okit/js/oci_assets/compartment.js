console.log('Loaded Internet Gateway Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[compartment_artifact] = [];
asset_connect_targets[compartment_artifact] = [];
asset_add_functions[compartment_artifact] = "addCompartment";
asset_delete_functions[compartment_artifact] = "deleteCompartment";

const compartment_stroke_colour = "#F80000";
let compartment_ids = [];
let compartment_count = 0;
let compartment_bui_sub_artifacts = {};

/*
** Reset variables
 */

function clearCompartmentVariables() {
    compartment_ids = [];
    compartment_count = 0;
    compartment_bui_sub_artifacts = {};
}

/*
** Add Asset to JSON Model
 */
function addCompartment() {
    let id = 'okit-' + compartment_prefix + '-' + uuidv4();
    console.log('Adding ' + compartment_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!OKITJsonObj.hasOwnProperty('compartments')) {
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
    openCompartment(id);
    $('#' + id + "-tab-button").trigger('click');
}

function initialiseCompartmentChildData(id) {
    // Add BUI artifact positional information
    compartment_bui_sub_artifacts[id] = {
        "virtual_cloud_network_position": 0,
        "virtual_cloud_network_count": 0,
        "block_storage_position": 0,
        "block_storage_count": 0
    };
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
    let compartment_id = compartment['id'];
    console.log('Drawing ' + compartment_artifact + ' : ' + id);
    let svg_x = 0;
    let svg_y = 0;
    let data_type = compartment_artifact;

    // Add tab for canvas
    let tabwrapper = d3.select('#' + parent_id);
    let tabbar = d3.select('#compartment-tabs');
    tabbar.append("button")
        .on("click", function() { openCompartment(id); })
        //.on("click", function() { openCompartment(event, compartment['name']); })
        .attr("class", "tablinks active")
        .attr("id", id + "-tab-button")
        .text(compartment['name']);
    let compartment_div = tabwrapper.append("div")
        .attr("class", "tabcontent")
        .attr("id", id + "-tab-content");
        //.attr("id", compartment['name']);

    //let okitcanvas_svg = d3.select('#' + parent_id);
    let svg = compartment_div.append("svg")
        .attr("class", "svg-canvas")
        .attr("id", id + '-svg')
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("title", compartment['name'])
        .attr("x", svg_x)
        .attr("y", svg_y)
        .attr("width", "100%")
        .attr("height", "100%");
    svg.append('style')
        .text('.st0{fill:#F80000;}');
    let rect = svg.append("rect")
        .attr("id", id)
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("title", compartment['name'])
        .attr("x", svg_x)
        .attr("y", svg_x)
        //.attr("width", vcn_width - (icon_width * 2))
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("stroke-dasharray", "5, 5")
        .attr("stroke", compartment_stroke_colour)
        .attr("fill", "white")
        .attr("style", "fill-opacity: .25;");
    rect.append("title")
        .attr("id", id + '-title')
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .text(compartment_artifact + ": " + compartment['name']);

    let boundingClientRect = rect.node().getBoundingClientRect();
    /*
     Add click event to display properties
     Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
     Add dragevent versions
     Set common attributes on svg element and children
     */
    svg.on("click", function() {
        loadCompartmentProperties(id);
        d3.event.stopPropagation();
    })
        .on("dragenter", handleDragEnter)
        .on("dragover", handleDragOver)
        .on("dragleave", handleDragLeave)
        .on("drop", handleDrop)
        .on("dragend", handleDragEnd)
        .attr("data-type", data_type)
        .attr("data-okit-id", id)
        .attr("data-parentid", parent_id)
        .attr("data-compartment-id", compartment_id)
        .selectAll("*")
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parentid", parent_id)
            .attr("data-compartment-id", compartment_id);

    initialiseCompartmentChildData(id);
}

/*
** Property Sheet Load function
 */
function loadCompartmentProperties(id) {
    $("#properties").load("propertysheets/compartment.html", function () {
        if ('compartments' in OKITJsonObj) {
            console.log('Loading ' + compartment_artifact + ' : ' + id);
            let json = OKITJsonObj['compartments'];
            for (let i = 0; i < json.length; i++) {
                let compartment = json[i];
                //console.log(JSON.stringify(compartment, null, 2));
                if (compartment['id'] == id) {
                    //console.log('Found Internet Gateway: ' + id);
                    compartment['virtual_cloud_network'] = okitIdsJsonObj[compartment['vcn_id']];
                    $('#name').val(compartment['name']);
                    // Add Event Listeners
                    addPropertiesEventListeners(compartment, []);
                    OKITJsonObj['open_compartment_index'] = i;
                    break;
                }
            }
        }
    });
}

clearCompartmentVariables();

/*
** Query OCI
 */

function queryCompartmentAjax() {
    console.log('------------- queryCompartmentAjax --------------------');
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/Compartment',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(okitQueryRequestJson),
        success: function(resp) {
            let response_json = [JSON.parse(resp)];
            OKITJsonObj['compartments'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.log('queryCompartmentAjax : ' + response_json[i]['name']);
                queryVirtualCloudNetworkAjax(response_json[i]['id']);
            }
            redrawSVGCanvas();
            $('#compartment-query-cb').prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}


