console.log('Loaded Internet Gateway Javascript');

var subnet_ids = [];
var subnet_count = 0;

/*
** Add Asset to JSON Model
 */
function addSubnet(vcnid) {
    var okitid = 'okit-sn-' + uuidv4();

    // Add Virtual Cloud Network to JSON

    if (!('subnets' in OKITJsonObj['compartment'])) {
        OKITJsonObj['compartment']['subnets'] = [];
    }

    // Add okitid & empty name to okitid JSON
    okitIdsJsonObj[okitid] = '';
    subnet_ids.push(okitid);

    // Increment Count
    subnet_count += 1;
    var subnet = {};
    subnet['virtual_cloud_network_id'] = vcnid;
    subnet['virtual_cloud_network'] = '';
    subnet['okitid'] = okitid;
    subnet['ocid'] = '';
    subnet['name'] = generateDefaultName('SN', subnet_count);
    subnet['cidr'] = '';
    subnet['dns_label'] = '';
    subnet['route_table'] = '';
    subnet['route_table_id'] = '';
    subnet['security_lists'] = [];
    subnet['security_lists_id'] = [];
    OKITJsonObj['compartment']['subnets'].push(subnet);
    console.log(JSON.stringify(OKITJsonObj, null, 2));
    okitIdsJsonObj[okitid] = subnet['name'];
    displayOkitJson();
    drawSubnetSVG(subnet);
}

/*
** SVG Creation
 */
function drawSubnetSVG(subnet) {
    var vcnid = subnet['virtual_cloud_network_id'];
    var okitid = subnet['okitid'];
    var position = 3;
    //var translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
    //var translate_y = icon_translate_y_start;
    var translate_x = icon_width;
    var translate_y = (icon_height * 5) + ((icon_height + 10) * (subnet_count - 1));
    var data_type = "Subnet";

    var vcn_width = d3.select('#' + vcnid).style("width").replace("px", "");
    var vcn_height = d3.select('#' + vcnid).style("height").replace("px", "");
    //console.log("VCN Width : "+vcn_width);
    //console.log("VCN Height : "+vcn_height);

    //svg = d3.select(okitcanvas);
    svg = d3.select('#' + vcnid + '-group');

    var sn = svg.append("g")
        .attr("id", okitid + '-group')
        .attr("transform", "translate(" + translate_x + ", " + translate_y + ")");
    sn.append("rect")
        .attr("id", okitid)
        .attr("data-type", data_type)
        .attr("title", subnet['name'])
        .attr("x", icon_x)
        .attr("y", icon_y)
        .attr("width", vcn_width - (icon_width * 2))
        .attr("height", icon_height)
        .attr("stroke", subnet_stroke_colour[(subnet_count % 3)])
        //.attr("stroke-dasharray", "5, 5")
        .attr("fill", subnet_stroke_colour[(subnet_count % 3)])
        .attr("style", "fill-opacity: .25;");
    var iconsvg = sn.append("svg")
        .attr("id", okitid)
        .attr("data-type", data_type)
        .attr("width", "100")
        .attr("height", "100")
        .attr("viewbox", "0 0 200 200");
    var g = iconsvg.append("g")
        .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M142.7,138v-13.5h-8.4v-20.8h20.8v20.8h-8.4V138h52.8c-3-27.4-26.2-48.8-54.4-48.8c-28.2,0-51.4,21.3-54.4,48.8H142.7z")
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M170,142v14.6h8.4v20.8h-20.8v-20.8h8.4V142h-41.5v14.6h8.4v20.8H112v-20.8h8.4V142H90.5c0,0.7-0.1,1.3-0.1,2c0,30.2,24.5,54.7,54.7,54.7c30.2,0,54.7-24.5,54.7-54.7c0-0.7-0.1-1.3-0.1-2H170z")

    //var igelem = document.querySelector('#' + okitid);
    //igelem.addEventListener("click", function() { assetSelected('Subnet', okitid) });
    $('#' + okitid).on("click", function() { assetSelected('Subnet', okitid) });
    d3.select('g#' + okitid + '-group').selectAll('path')
        .on("click", function() { assetSelected('Subnet', okitid) });
    assetSelected('Subnet', okitid);

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

function drawSubnetConnectorsSVG(subnet) {
    var vcnid = subnet['virtual_cloud_network_id'];
    var okitid = subnet['okitid'];

    var boundingClientRect = d3.select("#" + okitid).node().getBoundingClientRect();
    okitcanvasSVGPoint.x = boundingClientRect.x + (boundingClientRect.width/2);
    okitcanvasSVGPoint.y = boundingClientRect.y;
    var subnetrelative = okitcanvasSVGPoint.matrixTransform(okitcanvasScreenCTM.inverse());
    var sourcesvg = null;
    svg = d3.select("#okitcanvas");

    if (subnet['route_table_id'] != '') {
        boundingClientRect = d3.select("#" + subnet['route_table_id']).node().getBoundingClientRect();
        okitcanvasSVGPoint.x = boundingClientRect.x + (boundingClientRect.width/2);
        okitcanvasSVGPoint.y = boundingClientRect.y + boundingClientRect.height;
        sourcesvg = okitcanvasSVGPoint.matrixTransform(okitcanvasScreenCTM.inverse());
        svg.append('line')
            .attr("id", generateConnectorId(subnet['route_table_id'], okitid))
            .attr("x1", sourcesvg.x)
            .attr("y1", sourcesvg.y)
            .attr("x2", subnetrelative.x)
            .attr("y2", subnetrelative.y)
            .attr("stroke-width", "2")
            .attr("stroke", "black");
    }

    if (subnet['security_lists_id'].length > 0) {
        for (var i = 0; i < subnet['security_lists_id'].length; i++) {
            boundingClientRect = d3.select("#" + subnet['security_lists_id'][i]).node().getBoundingClientRect();
            okitcanvasSVGPoint.x = boundingClientRect.x + (boundingClientRect.width/2);
            okitcanvasSVGPoint.y = boundingClientRect.y + boundingClientRect.height;
            sourcesvg = okitcanvasSVGPoint.matrixTransform(okitcanvasScreenCTM.inverse());
            svg.append('line')
                .attr("id", generateConnectorId(subnet['security_lists_id'][i], okitid))
                .attr("x1", sourcesvg.x)
                .attr("y1", sourcesvg.y)
                .attr("x2", subnetrelative.x)
                .attr("y2", subnetrelative.y)
                .attr("stroke-width", "2")
                .attr("stroke", "black");
        }
    }
}

/*
** Property Sheet Load function
 */
function loadSubnetProperties(okitid) {
    $("#properties").load("propertysheets/subnet.html", function () {
        if ('compartment' in OKITJsonObj && 'subnets' in OKITJsonObj['compartment']) {
            console.log('Loading Security List: ' + okitid);
            var json = OKITJsonObj['compartment']['subnets'];
            for (var i = 0; i < json.length; i++) {
                subnet = json[i];
                //console.log(JSON.stringify(subnet, null, 2));
                if (subnet['okitid'] == okitid) {
                    //console.log('Found Subnet: ' + okitid);
                    subnet['virtual_cloud_network'] = okitIdsJsonObj[subnet['virtual_cloud_network_id']];
                    $("#virtual_cloud_network").html(subnet['virtual_cloud_network']);
                    $('#ocid').html(subnet['ocid']);
                    $('#name').val(subnet['name']);
                    $('#cidr').val(subnet['cidr']);
                    $('#dns_label').val(subnet['dns_label']);
                    var route_table_select = $('#route_table_id');
                    //console.log('Route Table Ids: ' + route_table_ids);
                    for (var rtcnt = 0; rtcnt < route_table_ids.length; rtcnt++) {
                        var rtid = route_table_ids[rtcnt];
                        if (rtid == subnet['route_table_id']) {
                            route_table_select.append($('<option>').attr('value', rtid).attr('selected', 'selected').text(okitIdsJsonObj[rtid]));
                        } else {
                            route_table_select.append($('<option>').attr('value', rtid).text(okitIdsJsonObj[rtid]));
                        }

                    }
                    var security_lists_select = $('#security_lists_id');
                    //console.log('Security List Ids: ' + security_list_ids);
                    for (var slcnt = 0; slcnt < security_list_ids.length; slcnt++) {
                        var slid = security_list_ids[slcnt];
                        if (subnet['security_lists_id'].indexOf(slid) >= 0) {
                            security_lists_select.append($('<option>').attr('value', slid).attr('selected', 'selected').text(okitIdsJsonObj[slid]));
                        } else {
                            security_lists_select.append($('<option>').attr('value', slid).text(okitIdsJsonObj[slid]));
                        }
                    }
                    var inputfields = document.querySelectorAll('.property-editor-table input');
                    [].forEach.call(inputfields, function (inputfield) {
                        inputfield.addEventListener('change', function () {
                            subnet[inputfield.id] = inputfield.value;
                            // If this is the name field copy to the Ids Map
                            if (inputfield.id == 'name') {
                                okitIdsJsonObj[okitid] = inputfield.value;
                            }
                            displayOkitJson();
                        });
                    });
                    inputfields = document.querySelectorAll('.property-editor-table select');
                    [].forEach.call(inputfields, function (inputfield) {
                        inputfield.addEventListener('change', function () {
                            // Check if Multi Select
                            if (inputfield.multiple) {
                                selectedopts = inputfield.querySelectorAll('option:checked');
                                if (selectedopts.length > 0) {
                                    subnet[inputfield.id] = Array.from(selectedopts, e=>e.value);
                                    subnet[inputfield.id.substring(0, inputfield.id.length - 3)] = Array.from(selectedopts, e=>e.text);
                                } else {
                                    subnet[inputfield.id] = [];
                                    subnet[inputfield.id.substring(0, inputfield.id.length - 3)] = [];
                                }
                            } else {
                                subnet[inputfield.id] = inputfield.options[inputfield.selectedIndex].value;
                                subnet[inputfield.id.substring(0, inputfield.id.length - 3)] = inputfield.options[inputfield.selectedIndex].text;
                            }
                            // If this is the name field copy to the Ids Map
                            displayOkitJson();
                        });
                    });
                    break;
                }
            }
        }
    });
}

/*
** OKIT Json Update Function
 */
function updateSubnetLinks(sourcetype, sourceid, okitid) {
    var subnets = OKITJsonObj['compartment']['subnets'];
    console.log('Updating Subnet ' + okitid + 'Adding ' + sourcetype + ' ' +sourceid);
    for (var i = 0; i < subnets.length; i++) {
        subnet = subnets[i];
        console.log('Before : ' + JSON.stringify(subnet, null, 2));
        if (subnet['okitid'] == okitid) {
            if (sourcetype == 'Route Table') {
                if (subnet['route_table_id'] != '') {
                    // Only single Route Table allow so delete existing line.
                    console.log('Deleting Connector : ' + generateConnectorId(subnet['route_table_id'], okitid));
                    d3.select("#" + generateConnectorId(subnet['route_table_id'], okitid)).remove();
                }
                subnet['route_table_id'] = sourceid;
            } else if (sourcetype == 'Security List') {
                if (subnet['security_lists_id'].indexOf(sourceid) >0 ) {
                    // Already connected so delete existing line
                    console.log('Deleting Connector : ' + generateConnectorId(sourceid, okitid));
                    d3.select("#" + generateConnectorId(sourceid, okitid)).remove();
                } else {
                    subnet['security_lists_id'].push(sourceid);
                }
            }
        }
        console.log('After : ' + JSON.stringify(subnet, null, 2));
    }
    displayOkitJson();
    assetSelected('Subnet', okitid);
}


