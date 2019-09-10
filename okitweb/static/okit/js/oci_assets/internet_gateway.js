console.log('Loaded Internet Gateway Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[internet_gateway_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[internet_gateway_artifact] = [];
asset_add_functions[internet_gateway_artifact] = "addInternetGateway";
asset_delete_functions[internet_gateway_artifact] = "deleteInternetGateway";

const internet_gateway_stroke_colour = "purple";
let internet_gateway_ids = [];
let internet_gateway_count = 0;

/*
** Reset variables
 */

function clearInternetGatewayVariables() {
    internet_gateway_ids = [];
    internet_gateway_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addInternetGateway(vcn_id, compartment_id) {
    let id = 'okit-' + internet_gateway_prefix + '-' + uuidv4();
    console.log('Adding Internet Gateway : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!OKITJsonObj.hasOwnProperty('internet_gateways')) {
        OKITJsonObj['internet_gateways'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    internet_gateway_ids.push(id);

    // Increment Count
    internet_gateway_count += 1;
    let internet_gateway = {};
    internet_gateway['vcn_id'] = vcn_id;
    internet_gateway['virtual_cloud_network'] = '';
    internet_gateway['compartment_id'] = compartment_id;
    internet_gateway['id'] = id;
    internet_gateway['display_name'] = generateDefaultName(internet_gateway_prefix, internet_gateway_count);
    OKITJsonObj['internet_gateways'].push(internet_gateway);
    okitIdsJsonObj[id] = internet_gateway['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawInternetGatewaySVG(internet_gateway);
    loadInternetGatewayProperties(id);
}

/*
** Delete From JSON Model
 */

function deleteInternetGateway(id) {
    console.log('Delete Internet Gateway ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < OKITJsonObj['internet_gateways'].length; i++) {
        if (OKITJsonObj['internet_gateways'][i]['id'] == id) {
            OKITJsonObj['internet_gateways'].splice(i, 1);
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
function drawInternetGatewaySVG(internet_gateway) {
    let parent_id = internet_gateway['vcn_id'];
    let id = internet_gateway['id'];
    let compartment_id = internet_gateway['compartment_id'];
    console.log('Drawing Internet Gateway : ' + id);
    if (virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        let position = virtual_cloud_network_bui_sub_artifacts[parent_id]['gateway_position'];
        let svg_x = Math.round((icon_width / 2) + (icon_width * position) + (vcn_icon_spacing * position));
        let svg_y = Math.round((icon_height / 2) * -1);
        let data_type = internet_gateway_artifact;

        // Increment Icon Position
        virtual_cloud_network_bui_sub_artifacts[parent_id]['gateway_position'] += 1;

        let parent_svg = d3.select('#' + parent_id + "-svg");
        let svg = parent_svg.append("svg")
            .attr("id", id + '-svg')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", internet_gateway['display_name'])
            .attr("x", svg_x)
            .attr("y", svg_y)
            .attr("width", "100")
            .attr("height", "100");
        let rect = svg.append("rect")
            .attr("id", id)
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", internet_gateway['display_name'])
            .attr("x", icon_x)
            .attr("y", icon_y)
            .attr("width", icon_width)
            .attr("height", icon_height)
            .attr("stroke", internet_gateway_stroke_colour)
            .attr("stroke-dasharray", "1, 1")
            .attr("fill", "white")
            .attr("style", "fill-opacity: .25;");
        rect.append("title")
            .attr("id", id + '-title')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .text("Internet Gateway: " + internet_gateway['display_name']);
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

        //loadInternetGatewayProperties(id);
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadInternetGatewayProperties(id);
            d3.event.stopPropagation();
        })
            .on("contextmenu", handleContextMenu)
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parentid", parent_id)
            .attr("data-compartment-id", compartment_id)
            .selectAll("*")
                .attr("data-type", data_type)
                .attr("data-okit-id", id)
                .attr("data-parentid", parent_id)
                .attr("data-compartment-id", compartment_id);
    } else {
        console.log(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
}

/*
** Property Sheet Load function
 */
function loadInternetGatewayProperties(id) {
    $("#properties").load("propertysheets/internet_gateway.html", function () {
        if ('internet_gateways' in OKITJsonObj) {
            console.log('Loading Internet Gateway: ' + id);
            let json = OKITJsonObj['internet_gateways'];
            for (let i = 0; i < json.length; i++) {
                let internet_gateway = json[i];
                //console.log(JSON.stringify(internet_gateway, null, 2));
                if (internet_gateway['id'] == id) {
                    //console.log('Found Internet Gateway: ' + id);
                    internet_gateway['virtual_cloud_network'] = okitIdsJsonObj[internet_gateway['vcn_id']];
                    $("#virtual_cloud_network").html(internet_gateway['virtual_cloud_network']);
                    $('#display_name').val(internet_gateway['display_name']);
                    // Add Event Listeners
                    addPropertiesEventListeners(internet_gateway, []);
                    break;
                }
            }
        }
    });
}

clearInternetGatewayVariables();

/*
** Query OCI
 */

function queryInternetGatewayAjax(compartment_id, vcn_id) {
    console.log('------------- queryInternetGatewayAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('internet_gateway_filter' in okitQueryRequestJson) {
        request_json['internet_gateway_filter'] = okitQueryRequestJson['internet_gateway_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/InternetGateway',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            OKITJsonObj['internet_gateways'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.log('queryInternetGatewayAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#internet-gateway-query-cb').prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}


