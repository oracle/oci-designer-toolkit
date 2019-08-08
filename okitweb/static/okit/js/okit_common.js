console.log('Loaded OKIT Common Javascript');

// Asset name prefix
var display_name_prefix = 'okit-';

var okitIdsJsonObj = {};
/*
** SVG Creation standard values
 */
var icon_width = 45;
var icon_height = 45;
var icon_x = 25;
var icon_y = 25;
var icon_translate_x_start = 60;
var icon_translate_y_start = 10;
//var vcn_icon_spacing = 35;
var vcn_icon_spacing = 10;

var icon_stroke_colour = "#F80000";
var subnet_stroke_colour = ["orange", "blue", "green", "black"];

var vcn_gateway_icon_position = 0;
var vcn_element_icon_position = 0;


function generateDefaultName(prefix, count) {
    return display_name_prefix + prefix + ('000' + count).slice(-3);
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

function displayOkitJson() {
    $('#okitjson').html(JSON.stringify(OKITJsonObj, null, 2));
    console.log(JSON.stringify(OKITJsonObj, null, 2));}

function generateConnectorId(sourceid, destinationid) {
    return sourceid + '-' + destinationid;
}

function standardiseId(id) {
    return id.r.replace(/\./g, '-');
}

/*
** Json Object Processing
 */

var OKITJsonObj = {"compartment": {id: 'okit-comp-' + uuidv4(), name: 'Not Specified', ocid: 'Not Specified'}};

/*
** New File functionality
 */

function handleNew(evt) {
    // newDiagram();
    window.location = 'designer';
}

function newDiagram() {
    console.log('Creating New Diagram');
    OKITJsonObj = {compartment: {id: 'okit-comp-' + uuidv4(), name: 'Not Specified'}};
    okitIdsJsonObj = {};
    clearSVG();
}

function clearSVG() {
    console.log('Clearing Diagram');
    $('#okitcanvas').empty();
    // Virtual Cloud Network
    vcn_gateway_icon_position = 0;
    vcn_element_icon_position = 0;
    clearVirtualCloudNetworkVariables();
    // Internet Gateway
    clearInternetGatewayVariables();
    // Route Table
    clearRouteTableVariables();
    // Security List
    clearSecurityListVariables();
    // Subnet
    clearSubnetVariables();
    // Load Balancer
    clearLoadBalancerVariables();
    // Instance
    clearInstanceVariables();
    // Add Path Style
    //var okitcanvas_svg = d3.select('#okitcanvas');
    d3.select('#okitcanvas').append('style')
        .text('.st0{fill:#F80000;}');
}

/*
** Load file
 */

function getAsJson(readFile) {
    var reader = new FileReader();
    reader.onload = loaded;
    reader.onerror = errorHandler;
    reader.readAsText(readFile);
}

function loaded(evt) {
    // Obtain the read file data
    var fileString = evt.target.result;
    console.log('Loaded: ' + fileString);
    OKITJsonObj = JSON.parse(fileString);
    displayOkitJson();
    drawSVGforJson();
}

function drawSVGforJson() {
    console.log('******** Drawing SVG *********');
    // Clear existing
    clearSVG();
    // Draw SVG
    if ('compartment' in OKITJsonObj) {
        if ('virtual_cloud_networks' in OKITJsonObj['compartment']) {
            virtual_network_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['virtual_cloud_networks'].length; i++) {
                virtual_network_ids.push(OKITJsonObj['compartment']['virtual_cloud_networks'][i]['id']);
                okitIdsJsonObj[OKITJsonObj['compartment']['virtual_cloud_networks'][i]['id']] = OKITJsonObj['compartment']['virtual_cloud_networks'][i]['display_name'];
                virtual_cloud_network_count += 1;
                drawVirtualCloudNetworkSVG(OKITJsonObj['compartment']['virtual_cloud_networks'][i]);
            }
        }
        if ('internet_gateways' in OKITJsonObj['compartment']) {
            internet_gateway_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['internet_gateways'].length; i++) {
                internet_gateway_ids.push(OKITJsonObj['compartment']['internet_gateways'][i]['id']);
                okitIdsJsonObj[OKITJsonObj['compartment']['internet_gateways'][i]['id']] = OKITJsonObj['compartment']['internet_gateways'][i]['display_name'];
                internet_gateway_count += 1;
                drawInternetGatewaySVG(OKITJsonObj['compartment']['internet_gateways'][i]);
            }
        }
        if ('route_tables' in OKITJsonObj['compartment']) {
            route_table_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['route_tables'].length; i++) {
                route_table_ids.push(OKITJsonObj['compartment']['route_tables'][i]['id']);
                okitIdsJsonObj[OKITJsonObj['compartment']['route_tables'][i]['id']] = OKITJsonObj['compartment']['route_tables'][i]['display_name'];
                route_table_count += 1;
                drawRouteTableSVG(OKITJsonObj['compartment']['route_tables'][i]);
            }
        }
        if ('security_lists' in OKITJsonObj['compartment']) {
            security_list_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['security_lists'].length; i++) {
                security_list_ids.push(OKITJsonObj['compartment']['security_lists'][i]['id']);
                okitIdsJsonObj[OKITJsonObj['compartment']['security_lists'][i]['id']] = OKITJsonObj['compartment']['security_lists'][i]['display_name'];
                security_list_count += 1;
                drawSecurityListSVG(OKITJsonObj['compartment']['security_lists'][i]);
            }
        }
        if ('subnets' in OKITJsonObj['compartment']) {
            subnet_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['subnets'].length; i++) {
                subnet_ids.push(OKITJsonObj['compartment']['subnets'][i]['id']);
                okitIdsJsonObj[OKITJsonObj['compartment']['subnets'][i]['id']] = OKITJsonObj['compartment']['subnets'][i]['display_name'];
                subnet_count += 1;
                drawSubnetSVG(OKITJsonObj['compartment']['subnets'][i]);
                drawSubnetConnectorsSVG(OKITJsonObj['compartment']['subnets'][i]);
            }
        }
    }
}

function errorHandler(evt) {
    console.log('Error: ' + evt.target.error.name);
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    getAsJson(files[0]);
}

function handleLoadClick(evt) {
    hideNavMenu();
    var fileinput = document.getElementById("files");
    fileinput.click();
}

/*
** Reload / Redraw functionality
 */

function handleRedraw(evt) {
    redrawSVGCanvas();
    return false;
}

function redrawSVGCanvas() {
    hideNavMenu();
    clearSVG();
    drawSVGforJson();
}

/*
** Query OCI
 */

function handleQueryAjax(e) {
    $.ajax({
        type: 'get',
        url: 'oci/compartment',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(OKITJsonObj),
        success: function(resp) {
            console.log('Response : ' + resp);
            var jsonBody = JSON.parse(resp)
            var len =  jsonBody.length;
            for(var i=0;i<len;i++ ){
                console.log(jsonBody[i]['display_name']);
            }
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}

function handleQueryOci(e) {
    window.location = 'oci/query/oci';
}

/*
** Save file
 */

function handleSave(evt) {
    hideNavMenu();
    saveJson(JSON.stringify(OKITJsonObj, null, 2), "okit.json");
}

function saveJson(text, filename){
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click()
}

/*
** Export SVG
 */

function handleExport(evt) {
    hideNavMenu();
    saveSvg(okitcanvas, 'okit.svg')
}

function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

/*
** Set cursor icons
 */
function setBusyIcon() {
    $('*').css('cursor', 'wait');
}

function unsetBusyIcon() {
    $('*').css('cursor', 'auto');
}
