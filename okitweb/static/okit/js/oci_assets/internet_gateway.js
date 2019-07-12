console.log('Loaded Internet Gateway Javascript');

var internet_gateway_ids = [];
var internet_gateway_count = 0;

/*
** Add Asset to JSON Model
 */
function addInternetGateway(vcnid) {
    var okitid = 'okit-ig-' + uuidv4();

    // Add Virtual Cloud Network to JSON

    if (!('internet_gateways' in OKITJsonObj['compartment'])) {
        OKITJsonObj['compartment']['internet_gateways'] = [];
    }

    // Add okitid & empty name to okitid JSON
    okitIdsJsonObj[okitid] = '';
    internet_gateway_ids.push(okitid);

    // Increment Count
    internet_gateway_count += 1;
    var internet_gateway = {};
    internet_gateway['virtual_cloud_network_id'] = vcnid;
    internet_gateway['virtual_cloud_network'] = '';
    internet_gateway['okitid'] = okitid;
    internet_gateway['ocid'] = '';
    internet_gateway['name'] = generateDefaultName('IG', internet_gateway_count);
    OKITJsonObj['compartment']['internet_gateways'].push(internet_gateway);
    okitIdsJsonObj[okitid] = internet_gateway['name'];
    console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawInternetGatewaySVG(internet_gateway);
}

/*
** SVG Creation
 */
function drawInternetGatewaySVG(internet_gateway) {
    var vcnid = internet_gateway['virtual_cloud_network_id'];
    var okitid = internet_gateway['okitid'];
    var position = vcn_element_icon_position;
    var translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
    var translate_y = icon_translate_y_start;
    var data_type = "Internet Gateway";

    // Increment Icon Position
    vcn_element_icon_position += 1;

    svg = d3.select('#' + vcnid + '-group');

    var ig = svg.append("g")
        .attr("id", okitid + '-group')
        .attr("transform", "translate(" + translate_x + ", " + translate_y + ")");
    ig.append("rect")
        .attr("id", okitid)
        .attr("data-type", data_type)
        .attr("title", internet_gateway['name'])
        .attr("x", icon_x)
        .attr("y", icon_y)
        .attr("width", icon_width)
        .attr("height", icon_height)
        .attr("stroke", icon_stroke_colour)
        .attr("stroke-dasharray", "5, 5")
        .attr("fill", "white")
        .attr("style", "fill-opacity: .25;");
    var iconsvg = ig.append("svg")
        .attr("id", okitid)
        .attr("data-type", data_type)
        .attr("width", "100")
        .attr("height", "100")
        .attr("viewbox", "0 0 200 200");
    var g1 = iconsvg.append("g")
        .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
//.attr("transform", "translate(" + translate_x + ", " + translate_y + ") scale(0.3, 0.3)");
    var g2 = g1.append("g");
    var g3 = g2.append("g");
    var g4 = g3.append("g");
    g4.append("path")
        .attr("class", "st0")
        .attr("d", "M200.4,104.2c-0.4,0-0.8,0-1.2,0.1c-1.6-5.2-6.5-9-12.3-9c-1.5,0-2.9,0.3-4.2,0.7c-2.6-3.8-7-6.3-12-6.3c-6.9,0-12.7,4.8-14.2,11.2c-0.1,0-0.3,0-0.4,0c-8,0-14.6,6.5-14.6,14.6c0,8,6.5,14.6,14.6,14.6h44.3c7.1,0,12.9-5.8,12.9-12.9C213.3,110,207.5,104.2,200.4,104.2z");
    var g5 = g3.append("g");
    var g6 = g5.append("g");
    g6.append("path")
        .attr("class", "st0")
        .attr("d", "M129,151.8l-3.4-4l3.2-2.7l3.4,4L129,151.8z M135.4,146.4l-3.4-4l3.2-2.7l3.4,4L135.4,146.4z M141.7,141.1l-3.4-4l3.2-2.7l3.4,4L141.7,141.1z M148.1,135.7l-3.4-4l3.2-2.7l3.4,4L148.1,135.7z");
    g6.append("path")
        .attr("class", "st0")
        .attr("d", "M103.5,140.8c-15.9,0-28.8,12.9-28.8,28.8c0,15.9,12.9,28.8,28.8,28.8c15.9,0,28.8-12.9,28.8-28.8C132.3,153.6,119.4,140.8,103.5,140.8z M82.2,171v-3h7.3v-4.5l10.4,6l-10.4,6V171H82.2z M103.7,190.7l-6-10.4h4.5v-21.6h-4.5l6-10.4l6,10.4h-4.5v21.6h4.5L103.7,190.7z M118.1,171v4.5l-10.4-6l10.4-6v4.5h7.3v3H118.1z");

    //var igelem = document.querySelector('#' + okitid);
    //igelem.addEventListener("click", function() { assetSelected('InternetGateway', okitid) });

    // Add click event to display properties
    $('#' + okitid).on("click", function() { assetSelected('InternetGateway', okitid) });
    d3.select('g#' + okitid + '-group').selectAll('path')
        .on("click", function() { assetSelected('InternetGateway', okitid) });
    assetSelected('InternetGateway', okitid);
}

/*
** Property Sheet Load function
 */
function loadInternetGatewayProperties(okitid) {
    $("#properties").load("propertysheets/internet_gateway.html", function () {
        if ('compartment' in OKITJsonObj && 'internet_gateways' in OKITJsonObj['compartment']) {
            console.log('Loading Internet Gateway: ' + okitid);
            var json = OKITJsonObj['compartment']['internet_gateways'];
            for (var i = 0; i < json.length; i++) {
                internet_gateway = json[i];
                //console.log(JSON.stringify(internet_gateway, null, 2));
                if (internet_gateway['okitid'] == okitid) {
                    //console.log('Found Internet Gateway: ' + okitid);
                    internet_gateway['virtual_cloud_network'] = okitIdsJsonObj[internet_gateway['virtual_cloud_network_id']];
                    $("#virtual_cloud_network").html(internet_gateway['virtual_cloud_network']);
                    $('#ocid').html(internet_gateway['ocid']);
                    $('#name').val(internet_gateway['name']);
                    var inputfields = document.querySelectorAll('.property-editor-table input');
                    [].forEach.call(inputfields, function (inputfield) {
                        inputfield.addEventListener('change', function () {
                            internet_gateway[inputfield.id] = inputfield.value;
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

