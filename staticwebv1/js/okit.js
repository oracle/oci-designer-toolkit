var palatte_source_type = '';
var okitIdsJsonObj = {};

/*
* Define palette Drag & Drop functions
 */

function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', this.title);
    palatte_source_type = this.title;
    //e.dataTransfer.setData('text/html', this.src);
    //console.log(this.title);
    //console.log(this.src);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    var type = e.target.getAttribute('data-type');
    if (palatte_source_type == "Virtual Cloud Network" && type != "Compartment") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else if (palatte_source_type == "Internet Gateway" && type != "Virtual Cloud Network") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else if (palatte_source_type == "Route Table" && type != "Virtual Cloud Network") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else if (palatte_source_type == "Security List" && type != "Virtual Cloud Network") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else if (palatte_source_type == "Subnet" && type != "Virtual Cloud Network") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else {
        //console.log('Type: ' + e.target.getAttribute('data-type'));
        //console.log('Id: ' + e.target.id);
        e.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
    }
    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    //this.classList.add('over');
    var type = e.target.getAttribute('data-type');
    if (palatte_source_type == "Virtual Cloud Network" && type != "Compartment") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else if (palatte_source_type == "Internet Gateway" && type != "Virtual Cloud Network") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else if (palatte_source_type == "Route Table" && type != "Virtual Cloud Network") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else if (palatte_source_type == "Security List" && type != "Virtual Cloud Network") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else if (palatte_source_type == "Subnet" && type != "Virtual Cloud Network") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else {
        //console.log('Type: ' + e.target.getAttribute('data-type'));
        //console.log('Id: ' + e.target.id);
        e.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
    }
}

function handleDragLeave(e) {
    //this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
    // this/e.target is current target element.

    if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
    }
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    //this.innerHTML = e.dataTransfer.getData('text/html');
    var title = e.dataTransfer.getData('text/plain');
    var type = e.target.getAttribute('data-type');
    var id = e.target.id;
    //console.log('Type: '+type+' - '+title+' - '+id)
    if (title == "Virtual Cloud Network" && type == "Compartment") {
        //iconSVGFile = 'svg/OCI_VCloudNetwork_red.svg';
        addVirtualCloudNetwork();
    } else if (title == "Internet Gateway" && type == "Virtual Cloud Network") {
        //iconSVGFile = 'svg/OCI_InternetGateway_red.svg';
        addInternetGateway(id);
    } else if (title == "Route Table" && type == "Virtual Cloud Network") {
        //iconSVGFile = 'svg/OCI_InternetGateway_red.svg';
        addRouteTable(id);
    } else if (title == "Security List" && type == "Virtual Cloud Network") {
        //iconSVGFile = 'svg/OCI_InternetGateway_red.svg';
        addSecurityList(id);
    } else if (title == "Subnet" && type == "Virtual Cloud Network") {
        //iconSVGFile = 'svg/OCI_InternetGateway_red.svg';
        addSubnet(id);
    }

    //var img = new Image();
    //img.src = iconSVGFile;
    //var ctx = okitcanvas.getContext("2d");
    //ctx.drawImage(img, 50, 50, 10, 10);

    this.classList.remove('over');  // this / e.target is previous target element.

    return false;
}

function handleDragEnd(e) {
    // this/e.target is the source node.

    [].forEach.call(cols, function (col) {
        col.classList.remove('over');
    });
}

var palatteicons = document.querySelectorAll('#palatte .palatteicon');
[].forEach.call(palatteicons, function (palatteicon) {
    palatteicon.addEventListener('dragstart', handleDragStart, false);
});

//var okitcanvas = document.querySelector('#okitcanvas');
var okitcanvas = document.getElementById('okitcanvas');
okitcanvas.addEventListener('dragenter', handleDragEnter, false)
okitcanvas.addEventListener('dragover', handleDragOver, false);
okitcanvas.addEventListener('dragleave', handleDragLeave, false);
okitcanvas.addEventListener('drop', handleDrop, false);
okitcanvas.addEventListener('dragend', handleDragEnd, false);

/*
** Define Connector Drag & Drop functions
 */

var okitcanvasSVGPoint = okitcanvas.createSVGPoint();
var okitcanvasScreenCTM = okitcanvas.getScreenCTM();
var connectorStartElement = null;
var connectorStartXLeft = 0;
var connectorStartYTop = 0;

function handleConnectorDrag(e) {
    if (connectorStartElement) {
        //console.log('Connector Drag : ' + getMousePosition(e).x + ' - ' + getMousePosition(e).y);
        var mousePos = getMousePosition(e);
        d3.select("#Connector")
            .attr("x2", mousePos.x)
            .attr("y2", mousePos.y);
    }
}

function handleConnectorDragStart(e) {
    e.preventDefault();
    // Set Start Element to know we are dragging
    connectorStartElement = e.target;

    //console.log('Connector Drag Start : ' + e.target.id + ' - ' + e.target.getAttribute('data-type'));
    //console.log('D3 x: '+connectorStartElement.getBoundingClientRect().x+' y: '+connectorStartElement.getBoundingClientRect().y);
    //console.log('D3 height: '+connectorStartElement.getBoundingClientRect().height+' width: '+connectorStartElement.getBoundingClientRect().width);
    // Calculate start point of bottom middle
    //var boundingClientRect = d3.select('#' + e.target.id).node().getBoundingClientRect();
    //console.log('D3 x: '+boundingClientRect.x+' y: '+boundingClientRect.y);
    //console.log('D3 height: '+boundingClientRect.height+' width: '+boundingClientRect.width);

    var boundingClientRect = connectorStartElement.getBoundingClientRect();
    okitcanvasSVGPoint.x = boundingClientRect.x + (boundingClientRect.width/2);
    okitcanvasSVGPoint.y = boundingClientRect.y + boundingClientRect.height;

    //var connectorStartOffset = $('#'+e.target.id).offset();
    //console.log('Offset x: '+connectorStartOffset.left+' y: '+connectorStartOffset.top);
    //okitcanvasSVGPoint.x = connectorStartOffset.left;
    //okitcanvasSVGPoint.y = connectorStartOffset.top;

    // Convert to SVG Relative positioning
    var svgrelative = okitcanvasSVGPoint.matrixTransform(okitcanvasScreenCTM.inverse());
    //console.log("SVG Relative Point (" + svgrelative.x + ", " + svgrelative.y + ")");
    connectorStartXLeft = svgrelative.x;
    connectorStartYTop = svgrelative.y;

    // Start Drawing line
    var mousePos = getMousePosition(e);
    svg = d3.select("#okitcanvas");
    svg.append('line')
        .attr("id", "Connector")
        .attr("x1", connectorStartXLeft)
        .attr("y1", connectorStartYTop)
        .attr("x2", connectorStartXLeft)
        .attr("y2", connectorStartYTop)
        //.attr("x2", mousePos.x)
        //.attr("y2", mousePos.y)
        .attr("stroke-width", "2")
        .attr("stroke-dasharray", "3, 3")
        .attr("stroke", "darkgray");

}

function handleConnectorDragEnter(e) {
    if (connectorStartElement) {
        //console.log('Connector Drag Enter : ' + e.target.id + ' - ' + e.target.getAttribute('data-type'));
    }
}

function handleConnectorDragLeave(e) {
    if (connectorStartElement) {
        //console.log('Connector Drag Leave : ' + e.target.id + ' - ' + e.target.getAttribute('data-type'));
    }
}

function handleConnectorDrop(e) {
    if (connectorStartElement) {
        var sourceType = connectorStartElement.getAttribute('data-type');
        var destinationType = e.target.getAttribute('data-type');
        var validSubnetSource = ['Route Table', 'Security List'];
        var sourceokitid = connectorStartElement.id;
        var okitid = e.target.id;
        //console.log('Connector Drop  : ' + e.target.id + ' - ' + destinationType);
        //console.log('Drag Start Type : ' + sourceType);

        if (validSubnetSource.indexOf(sourceType) >= 0 && destinationType == 'Subnet') {
            updateSubnetLinks(sourceType, sourceokitid, okitid);
            console.log('Creating Connector Line');
            //var offset = $('#'+e.target.id).offset();
            //okitcanvasSVGPoint.x = offset.left;
            //okitcanvasSVGPoint.y = offset.top;
            var boundingClientRect = e.target.getBoundingClientRect();
            okitcanvasSVGPoint.x = boundingClientRect.x + (boundingClientRect.width/2);
            okitcanvasSVGPoint.y = boundingClientRect.y;
            var svgrelative = okitcanvasSVGPoint.matrixTransform(okitcanvasScreenCTM.inverse());
            svg = d3.select("#okitcanvas");
            svg.append('line')
                .attr("id", generateConnectorId(sourceokitid, okitid))
                .attr("x1", connectorStartXLeft)
                .attr("y1", connectorStartYTop)
                .attr("x2", svgrelative.x)
                .attr("y2", svgrelative.y)
                .attr("stroke-width", "2")
                .attr("stroke", "black");
        }
    }

    connectorStartElement = null;
    connectorStartXLeft = 0;
    connectorStartYTop = 0;
    d3.selectAll("#Connector").remove();
}

function getMousePosition(evt) {
    if (evt.touches) { evt = evt.touches[0]; }
    return {
        x: (evt.clientX - okitcanvasScreenCTM.e) / okitcanvasScreenCTM.a,
        y: (evt.clientY - okitcanvasScreenCTM.f) / okitcanvasScreenCTM.d
    };
}

function generateConnectorId(sourceid, destinationid) {
    return sourceid + '-' + destinationid;
}

/*
** Json Object Processing
 */

var OKITJsonObj = {compartment: {okitid: 'okit-comp-' + uuidv4(), name: 'Not Specified', ocid: 'Not Specified'}};

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
    // Draw SVG
    if ('compartment' in OKITJsonObj) {
        if ('virtual_cloud_networks' in OKITJsonObj['compartment']) {
            virtual_network_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['virtual_cloud_networks'].length; i++) {
                virtual_network_ids.push(OKITJsonObj['compartment']['virtual_cloud_networks'][i]['okitid']);
                okitIdsJsonObj[OKITJsonObj['compartment']['virtual_cloud_networks'][i]['okitid']] = OKITJsonObj['compartment']['virtual_cloud_networks'][i]['name'];
                virtual_cloud_network_count += 1;
                drawVirtualCloudNetworkSVG(OKITJsonObj['compartment']['virtual_cloud_networks'][i]);
            }
        }
        if ('internet_gateways' in OKITJsonObj['compartment']) {
            internet_gateway_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['internet_gateways'].length; i++) {
                internet_gateway_ids.push(OKITJsonObj['compartment']['internet_gateways'][i]['okitid']);
                okitIdsJsonObj[OKITJsonObj['compartment']['internet_gateways'][i]['okitid']] = OKITJsonObj['compartment']['internet_gateways'][i]['name'];
                internet_gateway_count += 1;
                drawInternetGatewaySVG(OKITJsonObj['compartment']['internet_gateways'][i]);
            }
        }
        if ('route_tables' in OKITJsonObj['compartment']) {
            route_table_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['route_tables'].length; i++) {
                route_table_ids.push(OKITJsonObj['compartment']['route_tables'][i]['okitid']);
                okitIdsJsonObj[OKITJsonObj['compartment']['route_tables'][i]['okitid']] = OKITJsonObj['compartment']['route_tables'][i]['name'];
                route_table_count += 1;
                drawRouteTableSVG(OKITJsonObj['compartment']['route_tables'][i]);
            }
        }
        if ('security_lists' in OKITJsonObj['compartment']) {
            security_list_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['security_lists'].length; i++) {
                security_list_ids.push(OKITJsonObj['compartment']['security_lists'][i]['okitid']);
                okitIdsJsonObj[OKITJsonObj['compartment']['security_lists'][i]['okitid']] = OKITJsonObj['compartment']['security_lists'][i]['name'];
                security_list_count += 1;
                drawSecurityListSVG(OKITJsonObj['compartment']['security_lists'][i]);
            }
        }
        if ('subnets' in OKITJsonObj['compartment']) {
            subnet_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['subnets'].length; i++) {
                subnet_ids.push(OKITJsonObj['compartment']['subnets'][i]['okitid']);
                okitIdsJsonObj[OKITJsonObj['compartment']['subnets'][i]['okitid']] = OKITJsonObj['compartment']['subnets'][i]['name'];
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

document.getElementById('files').addEventListener('change', handleFileSelect, false);

/*
** Save file
 */

function handleSave(evt) {
    saveJson(JSON.stringify(OKITJsonObj, null, 2), "okit.json");
}

function saveJson(text, filename){
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click()
}

document.getElementById('savejson').addEventListener('click', handleSave, false);

/*
** Generate Button handlers
 */

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

function handleGenerateTerraform(e) {
    $.ajax({
        type: 'post',
        url: 'http://localhost:6443/okit/rest/v1/terraform',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(OKITJsonObj),
        success: function(resp) {
            console.log('REST Response : ' + resp);
            openInNewTab('http://localhost:6443/okit/rest/v1/terraform/' + resp);
        }
    });
}

document.getElementById('generateterraform').addEventListener('click', handleGenerateTerraform, false);

function handleGenerateAnsible(e) {
    $.ajax({
        type: 'post',
        url: 'http://localhost:6443/okit/rest/v1/ansible',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(OKITJsonObj),
        success: function(resp) {
            console.log('REST Response : ' + resp);
            openInNewTab('http://localhost:6443/okit/rest/v1/ansible/' + resp);
        }
    });
}

document.getElementById('generateansible').addEventListener('click', handleGenerateAnsible, false);

/*
** Add Assets to JSON Model
 */
var virtual_network_ids = [];
var internet_gateway_ids = [];
var route_table_ids = [];
var security_list_ids = [];
var subnet_ids = [];

var virtual_cloud_network_count = 0;
var internet_gateway_count = 0;
var route_table_count = 0;
var security_list_count = 0;
var subnet_count = 0;

function generateDefaultName(prefix, count) {
    return prefix + ('000' + count).slice(-3);
}

function addVirtualCloudNetwork() {
    var okitid = 'okit-vcn-' + uuidv4();

    // Add Virtual Cloud Network to JSON

    if (!('virtual_cloud_networks' in OKITJsonObj['compartment'])) {
        OKITJsonObj['compartment']['virtual_cloud_networks'] = [];
    }

    // Add okitid & empty name to okitid JSON
    okitIdsJsonObj[okitid] = '';
    virtual_network_ids.push(okitid);

    // Increment Count
    virtual_cloud_network_count += 1;
    var virtual_cloud_network = {};
    virtual_cloud_network['okitid'] = okitid;
    virtual_cloud_network['ocid'] = '';
    virtual_cloud_network['name'] = generateDefaultName('VCN', virtual_cloud_network_count);
    virtual_cloud_network['cidr'] = '';
    virtual_cloud_network['dns_label'] = '';
    OKITJsonObj['compartment']['virtual_cloud_networks'].push(virtual_cloud_network);
    okitIdsJsonObj[okitid] = virtual_cloud_network['name'];
    console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawVirtualCloudNetworkSVG(virtual_cloud_network);
}

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

function addSecurityList(vcnid) {
    var okitid = 'okit-sl-' + uuidv4();

    // Add Virtual Cloud Network to JSON

    if (!('security_lists' in OKITJsonObj['compartment'])) {
        OKITJsonObj['compartment']['security_lists'] = [];
    }

    // Add okitid & empty name to okitid JSON
    okitIdsJsonObj[okitid] = '';
    security_list_ids.push(okitid);

    // Increment Count
    security_list_count += 1;
    var security_list = {};
    security_list['virtual_cloud_network_id'] = vcnid;
    security_list['virtual_cloud_network'] = '';
    security_list['okitid'] = okitid;
    security_list['ocid'] = '';
    security_list['name'] = generateDefaultName('SL', security_list_count);
    OKITJsonObj['compartment']['security_lists'].push(security_list);
    okitIdsJsonObj[okitid] = security_list['name'];
    console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawSecurityListSVG(security_list);
}

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
** SVG Creation functions
 */
var icon_width = 45;
var icon_height = 45;
var icon_x = 25;
var icon_y = 25;
var icon_translate_x_start = 60;
var icon_translate_y_start = 10;
var vcn_icon_spacing = 35;

var icon_stroke_colour = "#F80000";
var subnet_stroke_colour = ["orange", "blue", "green", "black"];

var vcn_element_icon_position = 0;

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

function drawVirtualCloudNetworkSVG(virtual_cloud_network) {
    var okitid = virtual_cloud_network['okitid'];
    var translate_x = 0;
    var translate_y = 0;
    var data_type = 'Virtual Cloud Network';

    svg = d3.select(okitcanvas);
    /*
    d3.xml('svg/OCI_InternetGateway_red.svg', function(error, xml) {
        if (error) throw error;
        svg.append(xml.documentElement.getElementsByTagName('g')[0]);
    });
    */
    var vcngroup = svg.append("g")
        .attr("id", okitid + '-group')
        .attr("transform", "translate(" + translate_x + ", " + translate_y + ")");
    var vcn = vcngroup.append("g");
    vcn.append("rect")
        .attr("id", okitid)
        .attr("data-type", data_type)
        .attr("title", virtual_cloud_network['name'])
        .attr("x", 20)
        .attr("y", 50)
        .attr("width", 800)
        .attr("height", 400)
        .attr("stroke", "purple")
        .attr("stroke-dasharray", "5, 5")
        .attr("fill", "white");
    var iconsvg = vcn.append("svg")
        .attr("width", "100")
        .attr("height", "100")
        .attr("viewbox", "0 0 20 20");
    var g = iconsvg.append("g")
        .attr("transform", "translate(0, 30) scale(0.3, 0.3)");
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

    //var vcnelem = document.querySelector('#' + okitid);
    //vcnelem.addEventListener("click", function() { assetSelected('VirtualCloudNetwork', okitid) });
    $('#' + okitid).on("click", function() { assetSelected('VirtualCloudNetwork', okitid) });
    d3.select('g#' + okitid + '-group').selectAll('path')
        .on("click", function() { assetSelected('VirtualCloudNetwork', okitid) });
    assetSelected('VirtualCloudNetwork', okitid);

    // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
    $('#' + okitid).on("mousemove", handleConnectorDrag);
    $('#' + okitid).on("mouseup", handleConnectorDrop);
}

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

function drawSecurityListSVG(security_list) {
    var vcnid = security_list['virtual_cloud_network_id'];
    var okitid = security_list['okitid'];
    var position = vcn_element_icon_position;
    var translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
    var translate_y = icon_translate_y_start;
    var data_type = "Security List";

    // Increment Icon Position
    vcn_element_icon_position += 1;

    //svg = d3.select(okitcanvas);
    svg = d3.select('#' + vcnid + '-group');

    var sl = svg.append("g")
        .attr("id", okitid + '-group')
        .attr("transform", "translate(" + translate_x + ", " + translate_y + ")");
    sl.append("rect")
        .attr("id", okitid)
        .attr("data-type", data_type)
        .attr("title", security_list['name'])
        .attr("x", icon_x)
        .attr("y", icon_y)
        .attr("width", icon_width)
        .attr("height", icon_height)
        .attr("stroke", icon_stroke_colour)
        .attr("stroke-dasharray", "5, 5")
        .attr("fill", "white")
        .attr("style", "fill-opacity: .25;");
    var iconsvg = sl.append("svg")
        .attr("id", okitid)
        .attr("data-type", data_type)
        .attr("width", "100")
        .attr("height", "100")
        .attr("viewbox", "0 0 200 200");
    var g = iconsvg.append("g")
        .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M144,85.5l-43.8,18.8v41.8v0.1c1.3,23.2,18.4,43.6,43.8,56.3c25.5-12.7,42.5-33.1,43.8-56.3v-0.1v-41.8L144,85.5z M151.3,161.8h-31.5v-4.3h31.5V161.8z M151.3,144.7h-31.5v-4.3h31.5V144.7z M151.3,126.6h-31.5v-4.3h31.5V126.6zM170.4,155.8l-7.7,7.7l-4.9-4.9c-0.6-0.6-0.6-1.5,0-2c0.6-0.6,1.5-0.6,2,0l2.8,2.8l5.6-5.6c0.6-0.6,1.5-0.6,2,0C171,154.3,171,155.2,170.4,155.8z M159.4,138.6c-0.6-0.6-0.6-1.5,0-2c0.6-0.6,1.5-0.6,2,0l3,3l3-3c0.6-0.6,1.5-0.6,2,0c0.6,0.6,0.6,1.5,0,2l-3,3l3,3c0.6,0.6,0.6,1.5,0,2c-0.3,0.3-0.6,0.4-1,0.4c-0.4,0-0.7-0.1-1-0.4l-3-3l-3,3c-0.3,0.3-0.6,0.4-1,0.4c-0.4,0-0.7-0.1-1-0.4c-0.6-0.6-0.6-1.5,0-2l3-3L159.4,138.6z M170.7,121.9l-7.7,7.7l-4.9-4.9c-0.6-0.6-0.6-1.5,0-2c0.6-0.6,1.5-0.6,2,0l2.8,2.8l5.6-5.6c0.6-0.6,1.5-0.6,2,0C171.2,120.4,171.2,121.3,170.7,121.9z")

    //var igelem = document.querySelector('#' + okitid);
    //igelem.addEventListener("click", function() { assetSelected('SecurityList', okitid) });
    $('#' + okitid).on("click", function() { assetSelected('SecurityList', okitid) });
    d3.select('g#' + okitid + '-group').selectAll('path')
        .on("click", function() { assetSelected('SecurityList', okitid) });
    assetSelected('SecurityList', okitid);

    // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
    $('#' + okitid).on("mousedown", handleConnectorDragStart);
    //$('#' + okitid).on("mousemove", handleConnectorDrag);
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
** Property Sheet Load functions
 */

function assetSelected(type, okitid) {
    //console.log("Selected: " + type + " - " + okitid);
    if (type == 'VirtualCloudNetwork') {
        //$("#properties").load("propertysheets/virtualcloudnetwork.html");
        loadVirtualCloudNetworkProperties(okitid);
    } else if (type == "InternetGateway") {
        loadInternetGatewayProperties(okitid);
    } else if (type == "RouteTable") {
        loadRouteTableProperties(okitid);
    } else if (type == "SecurityList") {
        loadSecurityListProperties(okitid);
    } else if (type == "Subnet") {
        loadSubnetProperties(okitid);
    } else {
        $("#properties").load("propertysheets/empty.html");
    }
}

function loadVirtualCloudNetworkProperties(okitid) {
    $("#properties").load("propertysheets/virtual_cloud_network.html", function () {
        if ('compartment' in OKITJsonObj && 'virtual_cloud_networks' in OKITJsonObj['compartment']) {
            console.log('Loading Virtual Cloud Network: ' + okitid);
            var json = OKITJsonObj['compartment']['virtual_cloud_networks'];
            for (var i = 0; i < json.length; i++) {
                virtual_cloud_network = json[i];
                //console.log(JSON.stringify(virtual_cloud_network, null, 2));
                if (virtual_cloud_network['okitid'] == okitid) {
                    //console.log('Found Virtual Cloud Network: ' + okitid);
                    $('#ocid').html(virtual_cloud_network['ocid']);
                    $('#name').val(virtual_cloud_network['name']);
                    $('#cidr').val(virtual_cloud_network['cidr']);
                    $('#dns_label').val(virtual_cloud_network['dns_label']);
                    var inputfields = document.querySelectorAll('.property-editor-table input');
                    [].forEach.call(inputfields, function (inputfield) {
                        inputfield.addEventListener('change', function () {
                            virtual_cloud_network[inputfield.id] = inputfield.value;
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

function loadSecurityListProperties(okitid) {
    $("#properties").load("propertysheets/security_list.html", function () {
        if ('compartment' in OKITJsonObj && 'security_lists' in OKITJsonObj['compartment']) {
            console.log('Loading Security List: ' + okitid);
            var json = OKITJsonObj['compartment']['security_lists'];
            for (var i = 0; i < json.length; i++) {
                security_list = json[i];
                //console.log(JSON.stringify(security_list, null, 2));
                if (security_list['okitid'] == okitid) {
                    //console.log('Found Security List: ' + okitid);
                    security_list['virtual_cloud_network'] = okitIdsJsonObj[security_list['virtual_cloud_network_id']];
                    $("#virtual_cloud_network").html(security_list['virtual_cloud_network']);
                    $('#ocid').html(security_list['ocid']);
                    $('#name').val(security_list['name']);
                    var inputfields = document.querySelectorAll('.property-editor-table input');
                    [].forEach.call(inputfields, function (inputfield) {
                        inputfield.addEventListener('change', function () {
                            security_list[inputfield.id] = inputfield.value;
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
** Set Empty Properties Sheet
 */

$("#properties").load("propertysheets/empty.html");

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

function displayOkitJson() {
    $('#okitjson').html(JSON.stringify(OKITJsonObj, null, 2));
}
