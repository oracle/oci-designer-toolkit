console.log('Loaded Drag & Drop Javascript');

/*
** Drag & Drop Handlers
 */

/*
** Define palette Drag & Drop functions
 */

var palatte_source_type = '';
var asset_drop_targets = {};

function setDragDropIcon(e) {
    var type = e.target.getAttribute('data-type');
    if (asset_drop_targets[palatte_source_type] == type) {
        e.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
    } else {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    }
}

function setDragDropIcon1(e) {
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
    } else if (palatte_source_type == "Load Balancer" && type != "Subnet") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else if (palatte_source_type == "Instance" && type != "Subnet") {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    } else {
        //console.log('Type: ' + e.target.getAttribute('data-type'));
        //console.log('Id: ' + e.target.id);
        e.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
    }
}

function handleDragStart(e) {
    console.log('Drag Start');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', this.title);
    palatte_source_type = this.title;
    //e.dataTransfer.setData('text/html', this.src);
    console.log(this.title);
    //console.log(this.src);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    setDragDropIcon(e);
    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    //this.classList.add('over');
    setDragDropIcon(e);
}

function handleDragLeave(e) {
    //this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
    console.log('Drag Drop');
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
        addVirtualCloudNetwork();
    } else if (title == "Internet Gateway" && type == "Virtual Cloud Network") {
        addInternetGateway(id);
    } else if (title == "Route Table" && type == "Virtual Cloud Network") {
        addRouteTable(id);
    } else if (title == "Security List" && type == "Virtual Cloud Network") {
        addSecurityList(id);
    } else if (title == "Subnet" && type == "Virtual Cloud Network") {
        addSubnet(id);
    } else if (title == "Load Balancer" && type == "Subnet") {
        addLoadBalancer(id);
    } else if (title == "Instance" && type == "Subnet") {
        addInstance(id);
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
    console.log('Drag End');

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

function handleConnectorDragStart(e) {
    e.preventDefault();
    // Set Start Element to know we are dragging
    connectorStartElement = e.target;
    var parentid = connectorStartElement.getAttribute('data-vcnid');
    console.log('DragStart Parent Id : ' + parentid);
    if (parentid == '' || parentid == null) {
        parentid = connectorStartElement.getAttribute('data-subnetid');
        console.log('DragStart Parent Id : ' + parentid);
    }
    var parent_svg = document.getElementById(parentid + "-svg");
    var boundingClientRect = connectorStartElement.getBoundingClientRect();

    // Define SVG position manipulation variables
    connectorContainerSVGPoint = parent_svg.createSVGPoint();
    connectorContainerScreenCTM = parent_svg.getScreenCTM();
    connectorContainerSVGPoint.x = boundingClientRect.x + (boundingClientRect.width/2);
    connectorContainerSVGPoint.y = boundingClientRect.y + boundingClientRect.height;

    // Convert to SVG Relative positioning
    var svgrelative = connectorContainerSVGPoint.matrixTransform(connectorContainerScreenCTM.inverse());
    //console.log("SVG Relative Point (" + svgrelative.x + ", " + svgrelative.y + ")");
    connectorStartXLeft = svgrelative.x;
    connectorStartYTop = svgrelative.y;

    // Start Drawing line
    var mousePos = getMousePosition(e);
    svg = d3.select('#' + parentid + "-svg");
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

function getMousePosition(evt) {
    if (evt.touches) { evt = evt.touches[0]; }
    return {
        x: (evt.clientX - connectorContainerScreenCTM.e) / connectorContainerScreenCTM.a,
        y: (evt.clientY - connectorContainerScreenCTM.f) / connectorContainerScreenCTM.d
    };
}

