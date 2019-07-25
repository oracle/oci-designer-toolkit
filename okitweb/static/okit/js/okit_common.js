console.log('Loaded OKIT Common Javascript');

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
    return prefix + ('000' + count).slice(-3);
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

function displayOkitJson() {
    $('#okitjson').html(JSON.stringify(OKITJsonObj, null, 2));
}

/*
** Drag & Drop Handlers
 */

/*
** Define palette Drag & Drop functions
 */

var palatte_source_type = '';

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

/*
** SVG Psudo Drag & Drop
 */

function handleConnectorDrag(e) {
    if (connectorStartElement) {
        //console.log('Connector Drag : ' + getMousePosition(e).x + ' - ' + getMousePosition(e).y);
        var mousePos = getMousePosition(e);
        d3.select("#Connector")
            .attr("x2", mousePos.x)
            .attr("y2", mousePos.y);
    }
}

// TODO: Delete
function handleConnectorDragStartOrig(e) {
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

function handleConnectorDragStart(e) {
    e.preventDefault();
    // Set Start Element to know we are dragging
    connectorStartElement = e.target;
    var vcnid = connectorStartElement.getAttribute('data-vcnid');
    //console.log('DragStart VCNid : ' + vcnid);
    var okitcanvas_svg = document.getElementById(vcnid + "-svg");
    var boundingClientRect = connectorStartElement.getBoundingClientRect();

    // Define SVG position manipulation variables
    connectorContainerSVGPoint = okitcanvas_svg.createSVGPoint();
    connectorContainerScreenCTM = okitcanvas_svg.getScreenCTM();
    connectorContainerSVGPoint.x = boundingClientRect.x + (boundingClientRect.width/2);
    connectorContainerSVGPoint.y = boundingClientRect.y + boundingClientRect.height;

    // Convert to SVG Relative positioning
    var svgrelative = connectorContainerSVGPoint.matrixTransform(connectorContainerScreenCTM.inverse());
    //console.log("SVG Relative Point (" + svgrelative.x + ", " + svgrelative.y + ")");
    connectorStartXLeft = svgrelative.x;
    connectorStartYTop = svgrelative.y;

    // Start Drawing line
    var mousePos = getMousePosition(e);
    svg = d3.select('#' + vcnid + "-svg");
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

// TODO: Delete
function handleConnectorDropOrig(e) {
    if (connectorStartElement) {
        var sourceType = connectorStartElement.getAttribute('data-type');
        var destinationType = e.target.getAttribute('data-type');
        var vcnid = e.target.getAttribute('data-vcnid');
        var validSubnetSource = ['Route Table', 'Security List'];
        var sourceid = connectorStartElement.id;
        var id = e.target.id;
        //console.log('VCNid: '+ vcnid);
        //console.log('Connector Drop  : ' + e.target.id + ' - ' + destinationType);
        //console.log('Drag Start Type : ' + sourceType);

        if (validSubnetSource.indexOf(sourceType) >= 0 && destinationType == 'Subnet') {
            updateSubnetLinks(sourceType, sourceid, id);
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
                .attr("id", generateConnectorId(sourceid, id))
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

function handleConnectorDrop(e) {
    if (connectorStartElement) {
        var sourceType = connectorStartElement.getAttribute('data-type');
        var destinationType = e.target.getAttribute('data-type');
        var vcnid = e.target.getAttribute('data-vcnid');
        var validSubnetSource = ['Route Table', 'Security List'];
        var sourceid = connectorStartElement.id;
        var id = e.target.id;

        if (validSubnetSource.indexOf(sourceType) >= 0 && destinationType == 'Subnet') {
            updateSubnetLinks(sourceType, sourceid, id);
            console.log('Creating Connector Line');
            var boundingClientRect = e.target.getBoundingClientRect();
            connectorContainerSVGPoint.x = boundingClientRect.x + (boundingClientRect.width/2);
            connectorContainerSVGPoint.y = boundingClientRect.y;
            var svgrelative = connectorContainerSVGPoint.matrixTransform(connectorContainerScreenCTM.inverse());
            svg = d3.select("#" + vcnid + '-svg');
            svg.append('line')
                .attr("id", generateConnectorId(sourceid, id))
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

// TODO: Delete
function getMousePositionOrig(evt) {
    if (evt.touches) { evt = evt.touches[0]; }
    return {
        x: (evt.clientX - okitcanvasScreenCTM.e) / okitcanvasScreenCTM.a,
        y: (evt.clientY - okitcanvasScreenCTM.f) / okitcanvasScreenCTM.d
    };
}

function getMousePosition(evt) {
    if (evt.touches) { evt = evt.touches[0]; }
    return {
        x: (evt.clientX - connectorContainerScreenCTM.e) / connectorContainerScreenCTM.a,
        y: (evt.clientY - connectorContainerScreenCTM.f) / connectorContainerScreenCTM.d
    };
}

function generateConnectorId(sourceid, destinationid) {
    return sourceid + '-' + destinationid;
}

/*
** Json Object Processing
 */

var OKITJsonObj = {compartment: {id: 'okit-comp-' + uuidv4(), name: 'Not Specified', ocid: 'Not Specified'}};

/*
** New File functionality
 */

function handleNew(evt) {
    newDiagram();
}

function newDiagram() {
    console.log('Creating New Diagram');
    OKITJsonObj = {compartment: {id: 'okit-comp-' + uuidv4(), name: 'Not Specified', ocid: 'Not Specified'}};
    okitIdsJsonObj = {};
    clearSVG();
}

function clearSVG() {
    console.log('Clearing Diagram');
    $('#okitcanvas').empty();
    // Virtual Cloud Network
    vcn_gateway_icon_position = 0;
    vcn_element_icon_position = 0;
    virtual_network_ids = [];
    virtual_cloud_network_count = 0;
    // Internet Gateway
    internet_gateway_ids = [];
    internet_gateway_count = 0;
    // Route Table
    route_table_ids = [];
    route_table_count = 0;
    // Security List
    security_list_ids = [];
    security_list_count = 0;
    // Subnet
    subnet_ids = [];
    subnet_count = 0;
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
    // Clear existing
    clearSVG();
    // Draw SVG
    if ('compartment' in OKITJsonObj) {
        if ('virtual_cloud_networks' in OKITJsonObj['compartment']) {
            virtual_network_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['virtual_cloud_networks'].length; i++) {
                virtual_network_ids.push(OKITJsonObj['compartment']['virtual_cloud_networks'][i]['id']);
                okitIdsJsonObj[OKITJsonObj['compartment']['virtual_cloud_networks'][i]['id']] = OKITJsonObj['compartment']['virtual_cloud_networks'][i]['name'];
                virtual_cloud_network_count += 1;
                drawVirtualCloudNetworkSVG(OKITJsonObj['compartment']['virtual_cloud_networks'][i]);
            }
        }
        if ('internet_gateways' in OKITJsonObj['compartment']) {
            internet_gateway_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['internet_gateways'].length; i++) {
                internet_gateway_ids.push(OKITJsonObj['compartment']['internet_gateways'][i]['id']);
                okitIdsJsonObj[OKITJsonObj['compartment']['internet_gateways'][i]['id']] = OKITJsonObj['compartment']['internet_gateways'][i]['name'];
                internet_gateway_count += 1;
                drawInternetGatewaySVG(OKITJsonObj['compartment']['internet_gateways'][i]);
            }
        }
        if ('route_tables' in OKITJsonObj['compartment']) {
            route_table_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['route_tables'].length; i++) {
                route_table_ids.push(OKITJsonObj['compartment']['route_tables'][i]['id']);
                okitIdsJsonObj[OKITJsonObj['compartment']['route_tables'][i]['id']] = OKITJsonObj['compartment']['route_tables'][i]['name'];
                route_table_count += 1;
                drawRouteTableSVG(OKITJsonObj['compartment']['route_tables'][i]);
            }
        }
        if ('security_lists' in OKITJsonObj['compartment']) {
            security_list_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['security_lists'].length; i++) {
                security_list_ids.push(OKITJsonObj['compartment']['security_lists'][i]['id']);
                okitIdsJsonObj[OKITJsonObj['compartment']['security_lists'][i]['id']] = OKITJsonObj['compartment']['security_lists'][i]['name'];
                security_list_count += 1;
                drawSecurityListSVG(OKITJsonObj['compartment']['security_lists'][i]);
            }
        }
        if ('subnets' in OKITJsonObj['compartment']) {
            subnet_ids = [];
            for (var i=0; i < OKITJsonObj['compartment']['subnets'].length; i++) {
                subnet_ids.push(OKITJsonObj['compartment']['subnets'][i]['id']);
                okitIdsJsonObj[OKITJsonObj['compartment']['subnets'][i]['id']] = OKITJsonObj['compartment']['subnets'][i]['name'];
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

function handleQuery(e) {
    window.location = 'oci/query';
}

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

/*
** Property Sheet Load function
 */

function assetSelected(type, id) {
    //console.log("Selected: " + type + " - " + id);
    if (type == 'VirtualCloudNetwork') {
        //$("#properties").load("propertysheets/virtualcloudnetwork.html");
        loadVirtualCloudNetworkProperties(id);
    } else if (type == "InternetGateway") {
        loadInternetGatewayProperties(id);
    } else if (type == "RouteTable") {
        loadRouteTableProperties(id);
    } else if (type == "SecurityList") {
        loadSecurityListProperties(id);
    } else if (type == "Subnet") {
        loadSubnetProperties(id);
    } else {
        $("#properties").load("propertysheets/empty.html");
    }
}

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
        url: 'generate/terraform',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(OKITJsonObj),
        success: function(resp) {
            console.log('Response : ' + resp);
            window.location = 'generate/terraform';
            //openInNewTab('generate/terraform');
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}

function handleGenerateAnsible(e) {
    $.ajax({
        type: 'post',
        url: 'generate/ansible',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(OKITJsonObj),
        success: function(resp) {
            console.log('REST Response : ' + resp);
            window.location = 'generate/ansible';
            //openInNewTab('generate/ansible');
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}


