console.log('Loaded Virtual Cloud Network Javascript');

/*
** Set Valid drop Targets
 */

asset_drop_targets["Virtual Cloud Network"] = ["Compartment"];
asset_connect_targets["Virtual Cloud Network"] = [];
asset_add_functions["Virtual Cloud Network"] = "addVirtualCloudNetwork";

var vcn_svg_width = "99%"
var vcn_svg_height = "70%"
var vcn_rect_width = "95%"
var vcn_rect_height = "85%"
var virtual_network_ids = [];
var virtual_cloud_network_count = 0;
var virtual_cloud_network_prefix = 'vcn';
var virtual_cloud_network_cidr = {};
var virtual_cloud_network_subcomponents = {};

/*
** Reset variables
 */

function clearVirtualCloudNetworkVariables() {
    virtual_network_ids = [];
    virtual_cloud_network_count = 0;
    virtual_cloud_network_cidr = {};
    virtual_cloud_network_subcomponents = {};
}

/*
** Add Asset to JSON Model
 */
function addVirtualCloudNetwork(compartmentid) {
    var id = 'okit-vcn-' + uuidv4();

    // Add Virtual Cloud Network to JSON

    if (!('virtual_cloud_networks' in OKITJsonObj['compartment'])) {
        OKITJsonObj['compartment']['virtual_cloud_networks'] = [];
    }

    // Add Sub Component position
    virtual_cloud_network_subcomponents[id] = {"load_balancer_position": 0, "instance_position": 0}

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    virtual_network_ids.push(id);

    // Increment Count
    virtual_cloud_network_count += 1;
    // Generate Cidr
    virtual_cloud_network_cidr[id] = '10.' + (virtual_cloud_network_count - 1) + '.0.0/16';
    // Build Virtual Cloud Network Object
    var virtual_cloud_network = {};
    virtual_cloud_network['id'] = id;
    virtual_cloud_network['display_name'] = generateDefaultName(virtual_cloud_network_prefix, virtual_cloud_network_count);
    virtual_cloud_network['cidr_block'] = virtual_cloud_network_cidr[id];
    virtual_cloud_network['dns_label'] = virtual_cloud_network['display_name'].toLowerCase().slice(-6);
    OKITJsonObj['compartment']['virtual_cloud_networks'].push(virtual_cloud_network);
    okitIdsJsonObj[id] = virtual_cloud_network['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawVirtualCloudNetworkSVG(virtual_cloud_network);
}

/*
** SVG Creation
 */
function drawVirtualCloudNetworkSVG(virtual_cloud_network) {
    var id = virtual_cloud_network['id'];
    var parent_id = ''
    var translate_x = 0;
    var translate_y = 0;
    var data_type = 'Virtual Cloud Network';

    var okitcanvas_svg = d3.select(okitcanvas);
    var svg = okitcanvas_svg.append("svg")
        .attr("id", id + '-svg')
        .attr("data-type", data_type)
        .attr("title", virtual_cloud_network['display_name'])
        .attr("x", 20)
        .attr("y", 70)
        .attr("width", vcn_svg_width)
        .attr("height", vcn_svg_height);
    var rect = svg.append("rect")
        .attr("id", id)
        .attr("data-type", data_type)
        .attr("title", virtual_cloud_network['display_name'])
        .attr("x", icon_width / 2)
        .attr("y", icon_height / 2)
        .attr("width", vcn_rect_width)
        .attr("height", vcn_rect_height)
        .attr("stroke", "purple")
        .attr("stroke-dasharray", "5, 5")
        .attr("fill", "white");
    rect.append("title")
        .text("Virtual Cloud Network: " + virtual_cloud_network['display_name']);
    var g = svg.append("g")
        .attr("transform", "translate(-20, -20) scale(0.3, 0.3)");
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M143.4,154.1c-0.4,0.8-0.9,1.5-1.5,2l6,15.2c0.1,0,0.2,0,0.3,0c0.9,0,1.8,0.3,2.6,0.7l14.7-14.3c-0.2-0.4-0.4-0.8-0.5-1.3L143.4,154.1z")
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M138.2,157.5c-2.2,0-4-1.2-5-3l-10.2,1.7c0,0.3-0.1,0.5-0.2,0.8l21.6,15.2l-5.8-14.7C138.4,157.4,138.3,157.5,138.2,157.5z")
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M134.4,147.7l-8.6-18.7c-0.1,0-0.1,0-0.2,0l-5.2,21.4c0.9,0.5,1.6,1.3,2,2.2l10.2-1.7C132.9,149.7,133.5,148.5,134.4,147.7z")
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M138.2,146.2c0.9,0,1.8,0.2,2.5,0.6l19.9-20c-0.1-0.3-0.3-0.6-0.4-0.9l-29.9-0.6c-0.3,0.9-0.8,1.6-1.5,2.3l8.6,18.7C137.8,146.2,138,146.2,138.2,146.2z")
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M163.2,129.3l-19.9,20c0.2,0.4,0.4,0.9,0.5,1.4l21.7,2.3c0.5-1.2,1.4-2.1,2.6-2.7l-3.2-20.4C164.2,129.7,163.7,129.5,163.2,129.3z")
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M144,87.8c-31,0-56.2,25.2-56.2,56.2c0,31,25.2,56.2,56.2,56.2s56.2-25.2,56.2-56.2C200.2,113,175,87.8,144,87.8z M170.6,160.9c-0.9,0-1.8-0.3-2.6-0.7l-14.7,14.3c0.4,0.7,0.6,1.6,0.6,2.5c0,3.1-2.5,5.6-5.6,5.6s-5.6-2.5-5.6-5.6c0-0.6,0.1-1.1,0.3-1.7l-22-15.5c-0.9,0.7-2.1,1.1-3.4,1.1c-3.1,0-5.6-2.5-5.6-5.6c0-3,2.3-5.4,5.2-5.6l5.2-21.4c-1.6-1-2.7-2.8-2.7-4.8c0-3.1,2.5-5.6,5.6-5.6c2.5,0,4.7,1.7,5.4,4l29.9,0.6c0.8-2.2,2.8-3.8,5.3-3.8c3.1,0,5.6,2.5,5.6,5.6c0,2.2-1.3,4.1-3.1,5l3.2,20.4c2.7,0.4,4.7,2.7,4.7,5.6C176.2,158.4,173.7,160.9,170.6,160.9z");

    // Add click event to display properties
    // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
    // Add dragevent versions
    $('#' + id + '-svg')
        .on("click", function() { loadVirtualCloudNetworkProperties(id); return false; })
        .on("mousemove", handleConnectorDrag)
        .on("mouseup", handleConnectorDrop)
        .on("dragenter", handleConnectorDragEnter)
        .on("dragleave", handleConnectorDragLeave);
    loadVirtualCloudNetworkProperties(id);

    //d3.select('#' + id)
    svg.selectAll("*")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id);
}

/*
** Property Sheet Load function
 */
function loadVirtualCloudNetworkProperties(id) {
    $("#properties").load("propertysheets/virtual_cloud_network.html", function () {
        if ('compartment' in OKITJsonObj && 'virtual_cloud_networks' in OKITJsonObj['compartment']) {
            console.log('Loading Virtual Cloud Network: ' + id);
            var json = OKITJsonObj['compartment']['virtual_cloud_networks'];
            for (var i = 0; i < json.length; i++) {
                virtual_cloud_network = json[i];
                //console.log(JSON.stringify(virtual_cloud_network, null, 2));
                if (virtual_cloud_network['id'] == id) {
                    //console.log('Found Virtual Cloud Network: ' + id);
                    $('#display_name').val(virtual_cloud_network['display_name']);
                    $('#cidr_block').val(virtual_cloud_network['cidr_block']);
                    $('#dns_label').val(virtual_cloud_network['dns_label']);
                    var inputfields = document.querySelectorAll('.property-editor-table input');
                    [].forEach.call(inputfields, function (inputfield) {
                        inputfield.addEventListener('change', function () {
                            virtual_cloud_network[inputfield.id] = inputfield.value;
                            // If this is the name field copy to the Ids Map
                            if (inputfield.id == 'display_name') {
                                okitIdsJsonObj[id] = inputfield.value;
                            } else if (inputfield.id == 'cidr_block') {
                                virtual_cloud_network['id'] = inputfield.value;
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


clearVirtualCloudNetworkVariables();
