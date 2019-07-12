console.log('Loaded Route Table Javascript');

var route_table_ids = [];
var route_table_count = 0;

/*
** Add Asset to JSON Model
 */
function addRouteTable(vcnid) {
    var okitid = 'okit-rt-' + uuidv4();

    // Add Virtual Cloud Network to JSON

    if (!('route_tables' in OKITJsonObj['compartment'])) {
        OKITJsonObj['compartment']['route_tables'] = [];
    }

    // Add okitid & empty name to okitid JSON
    okitIdsJsonObj[okitid] = '';
    route_table_ids.push(okitid);

    // Increment Count
    route_table_count += 1;
    var route_table = {};
    route_table['virtual_cloud_network_id'] = vcnid;
    route_table['virtual_cloud_network'] = '';
    route_table['okitid'] = okitid;
    route_table['ocid'] = '';
    route_table['name'] = generateDefaultName('RT', route_table_count);
    OKITJsonObj['compartment']['route_tables'].push(route_table);
    okitIdsJsonObj[okitid] = route_table['name'];
    console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawRouteTableSVG(route_table);
}

/*
** SVG Creation
 */
function drawRouteTableSVG(route_table) {
    var vcnid = route_table['virtual_cloud_network_id'];
    var okitid = route_table['okitid'];
    var position = vcn_element_icon_position;
    var translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
    var translate_y = icon_translate_y_start;
    var data_type = "Route Table";

    // Increment Icon Position
    vcn_element_icon_position += 1;

    //svg = d3.select(okitcanvas);
    svg = d3.select('#' + vcnid + '-group');

    var rt = svg.append("g")
        .attr("id", okitid + '-group')
        .attr("transform", "translate(" + translate_x + ", " + translate_y + ")");
    rt.append("rect")
        .attr("id", okitid)
        .attr("data-type", data_type)
        .attr("title", route_table['name'])
        .attr("x", icon_x)
        .attr("y", icon_y)
        .attr("width", icon_width)
        .attr("height", icon_height)
        .attr("stroke", icon_stroke_colour)
        .attr("stroke-dasharray", "5, 5")
        .attr("fill", "white")
        .attr("style", "fill-opacity: .25;");
    var iconsvg = rt.append("svg")
        .attr("id", okitid)
        .attr("data-type", data_type)
        .attr("width", "100")
        .attr("height", "100")
        .attr("viewbox", "0 0 200 200");
    var g = iconsvg.append("g")
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

    //var igelem = document.querySelector('#' + okitid);
    //igelem.addEventListener("click", function() { assetSelected('RouteTable', okitid) });

    // Add click event to display properties
    $('#' + okitid).on("click", function() { assetSelected('RouteTable', okitid) });
    d3.select('g#' + okitid + '-group').selectAll('path')
        .on("click", function() { assetSelected('RouteTable', okitid) });
    assetSelected('RouteTable', okitid);

    // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
    $('#' + okitid).on("mousedown", handleConnectorDragStart);
    $('#' + okitid).on("mousemove", handleConnectorDrag);
    $('#' + okitid).on("mouseup", handleConnectorDrop);
    $('#' + okitid).on("mouseover", handleConnectorDragEnter);
    $('#' + okitid).on("mouseout", handleConnectorDragLeave);
    // Add dragevent versions
    $('#' + okitid).on("dragstart", handleConnectorDragStart);
    $('#' + okitid).on("drop", handleConnectorDrop);
    $('#' + okitid).on("dragenter", handleConnectorDragEnter);
    $('#' + okitid).on("dragleave", handleConnectorDragLeave);
    d3.select('#' + okitid)
        .attr("dragable", true);
}

/*
** Property Sheet Load function
 */
function loadRouteTableProperties(okitid) {
    $("#properties").load("propertysheets/route_table.html", function () {
        if ('compartment' in OKITJsonObj && 'route_tables' in OKITJsonObj['compartment']) {
            console.log('Loading Route Table: ' + okitid);
            var json = OKITJsonObj['compartment']['route_tables'];
            for (var i = 0; i < json.length; i++) {
                route_table = json[i];
                //console.log(JSON.stringify(route_table, null, 2));
                if (route_table['okitid'] == okitid) {
                    //console.log('Found Route Table: ' + okitid);
                    route_table['virtual_cloud_network'] = okitIdsJsonObj[route_table['virtual_cloud_network_id']];
                    $("#virtual_cloud_network").html(route_table['virtual_cloud_network']);
                    $('#ocid').html(route_table['ocid']);
                    $('#name').val(route_table['name']);
                    var inputfields = document.querySelectorAll('.property-editor-table input');
                    [].forEach.call(inputfields, function (inputfield) {
                        inputfield.addEventListener('change', function () {
                            route_table[inputfield.id] = inputfield.value;
                            // If this is the name field copy to the Ids Map
                            if (inputfield.id == 'name') {
                                okitIdsJsonObj[okitid] = inputfield.value;
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

