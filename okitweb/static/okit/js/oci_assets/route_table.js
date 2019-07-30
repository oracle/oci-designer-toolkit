console.log('Loaded Route Table Javascript');

var route_table_ids = [];
var route_table_count = 0;

/*
** Add Asset to JSON Model
 */
function addRouteTable(vcnid) {
    var id = 'okit-rt-' + uuidv4();

    // Add Virtual Cloud Network to JSON

    if (!('route_tables' in OKITJsonObj['compartment'])) {
        OKITJsonObj['compartment']['route_tables'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    route_table_ids.push(id);

    // Increment Count
    route_table_count += 1;
    var route_table = {};
    route_table['vcn_id'] = vcnid;
    route_table['virtual_cloud_network'] = '';
    route_table['id'] = id;
    route_table['display_name'] = generateDefaultName('RT', route_table_count);
    OKITJsonObj['compartment']['route_tables'].push(route_table);
    okitIdsJsonObj[id] = route_table['display_name'];
    console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawRouteTableSVG(route_table);
}

/*
** SVG Creation
 */
function drawRouteTableSVG(route_table) {
    var vcnid = route_table['vcn_id'];
    var id = route_table['id'];
    var position = vcn_element_icon_position;
    var translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
    var translate_y = icon_translate_y_start;
    var svg_x = (icon_width / 2) + (icon_width * position) + (vcn_icon_spacing * position);
    var svg_y = (icon_height / 4) * 3;
    var data_type = "Route Table";

    // Increment Icon Position
    vcn_element_icon_position += 1;

    var okitcanvas_svg = d3.select('#' + vcnid + "-svg");
    var svg = okitcanvas_svg.append("svg")
        .attr("id", id + '-svg')
        .attr("data-type", data_type)
        .attr("data-vcnid", vcnid)
        .attr("title", route_table['display_name'])
        .attr("x", svg_x)
        .attr("y", svg_y)
        .attr("width", "100")
        .attr("height", "100");
    svg.append("rect")
        .attr("id", id)
        .attr("data-type", data_type)
        .attr("data-vcnid", vcnid)
        .attr("title", route_table['display_name'])
        .attr("x", icon_x)
        .attr("y", icon_y)
        .attr("width", icon_width)
        .attr("height", icon_height)
        .attr("stroke", icon_stroke_colour)
        .attr("stroke-dasharray", "1, 1")
        .attr("fill", "white")
        .attr("style", "fill-opacity: .25;");
    var g = svg.append("g")
        .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
    g.append("rect")
        .attr("x", "99.6")
        .attr("y", "100.3")
        .attr("class", "st0")
        .attr("width", "22.1")
        .attr("height", "22.9");
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M188.4,123.3v-22.9h-59.6v22.9H188.4z M171.1,109.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4H171l3.1-5L171.1,109.2z M166.1,116.1h2.3v2.5h-2.3V116.1z M153.8,109.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5L153.8,109.2z M148.8,116.1h2.3v2.5h-2.3V116.1z M139.8,109.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5l-3-4.3H139.8z")
    g.append("rect")
        .attr("x", "99.6")
        .attr("y", "132.5")
        .attr("class", "st0")
        .attr("width", "22.1")
        .attr("height", "22.9");
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M188.4,155.5v-22.9h-59.6v22.9H188.4z M171.1,140.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4H171l3.1-5L171.1,140.2z M166.1,147.1h2.3v2.5h-2.3V147.1z M153.8,140.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5L153.8,140.2z M148.8,147.1h2.3v2.5h-2.3V147.1z M139.8,140.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5l-3-4.3H139.8z")
    g.append("rect")
        .attr("x", "99.6")
        .attr("y", "164.7")
        .attr("class", "st0")
        .attr("width", "22.1")
        .attr("height", "22.9");
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M188.4,187.7v-22.9h-59.6v22.9H188.4z M171.1,171.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4H171l3.1-5L171.1,171.2z M166.1,178.1h2.3v2.5h-2.3V178.1z M153.8,171.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5L153.8,171.2z M148.8,178.1h2.3v2.5h-2.3V178.1z M139.8,171.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5l-3-4.3H139.8z")

    //var igelem = document.querySelector('#' + id);
    //igelem.addEventListener("click", function() { assetSelected('RouteTable', id) });

    // Add click event to display properties
    $('#' + id).on("click", function() { assetSelected('RouteTable', id) });
    d3.select('svg#' + id + '-svg').selectAll('path')
        .on("click", function() { assetSelected('RouteTable', id) });
    assetSelected('RouteTable', id);

    // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
    $('#' + id).on("mousedown", handleConnectorDragStart);
    $('#' + id).on("mousemove", handleConnectorDrag);
    $('#' + id).on("mouseup", handleConnectorDrop);
    $('#' + id).on("mouseover", handleConnectorDragEnter);
    $('#' + id).on("mouseout", handleConnectorDragLeave);
    // Add dragevent versions
    $('#' + id).on("dragstart", handleConnectorDragStart);
    $('#' + id).on("drop", handleConnectorDrop);
    $('#' + id).on("dragenter", handleConnectorDragEnter);
    $('#' + id).on("dragleave", handleConnectorDragLeave);
    d3.select('#' + id)
        .attr("dragable", true);
}

/*
** Property Sheet Load function
 */
function loadRouteTableProperties(id) {
    $("#properties").load("propertysheets/route_table.html", function () {
        if ('compartment' in OKITJsonObj && 'route_tables' in OKITJsonObj['compartment']) {
            console.log('Loading Route Table: ' + id);
            var json = OKITJsonObj['compartment']['route_tables'];
            for (var i = 0; i < json.length; i++) {
                route_table = json[i];
                //console.log(JSON.stringify(route_table, null, 2));
                if (route_table['id'] == id) {
                    //console.log('Found Route Table: ' + id);
                    route_table['virtual_cloud_network'] = okitIdsJsonObj[route_table['vcn_id']];
                    $("#virtual_cloud_network").html(route_table['virtual_cloud_network']);
                    $('#display_name').val(route_table['display_name']);
                    var inputfields = document.querySelectorAll('.property-editor-table input');
                    [].forEach.call(inputfields, function (inputfield) {
                        inputfield.addEventListener('change', function () {
                            route_table[inputfield.id] = inputfield.value;
                            // If this is the name field copy to the Ids Map
                            if (inputfield.id == 'display_name') {
                                okitIdsJsonObj[id] = inputfield.value;
                            }
                            displayOkitJson();
                        });
                    });
                    break;
                }
            }
        }
    });
}

