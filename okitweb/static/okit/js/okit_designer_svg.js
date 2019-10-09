console.log('Loaded SVG Javascript');

// SVG Icons
const icon_width = 45;
const icon_height = 45;
const icon_x = 25;
const icon_y = 25;
const icon_translate_x_start = -20;
const icon_translate_y_start = -20;
const icon_spacing = 10;
const icon_stroke_colour = "#F80000";
const viewbox_height = 1500;
const viewbox_width = 2500;
const text_viewbox_height = 1000;
const text_viewbox_width = 200;
const connector_colour = "black";
const container_artifact_x_padding = Math.round(icon_width  * 3 / 2);
const container_artifact_y_padding = Math.round(icon_height  * 3 / 2);
const container_artifact_label_width = 300;

/*
** SVG Drawing / Manipulating SVG Canvas
 */

function styleCanvas(canvas_svg) {
    canvas_svg.append('style')
        .attr("type", "text/css")
        .text('.st0{fill:#F80000;} .st1{fill:#939699;} text{font-weight: bold; font-size: 11pt; font-family: Ariel}');
}

function createSVGDefinitions(canvas_svg) {
    // Add Palette Icons
    let defs = canvas_svg.append('defs');
    for (let key in palette_svg) {
        let defid = key.replace(/ /g, '') + 'Svg';
        defs.append('g')
            .attr("id", defid)
            .attr("transform", "translate(-20, -20) scale(0.3, 0.3)")
            .html(palette_svg[key]);
    }
    // Add Connector Markers
    // Pointer
    let marker = defs.append('marker')
            .attr("id", "connector-end-triangle")
            .attr("viewBox", "0 0 100 100")
            .attr("refX", "1")
            .attr("refY", "5")
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "35")
            .attr("markerHeight", "35")
            .attr("orient", "auto");
    marker.append('path')
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", "black");
    // Circle
    marker = defs.append('marker')
        .attr("id", "connector-end-circle")
        .attr("viewBox", "0 0 100 100")
        .attr("refX", "5")
        .attr("refY", "5")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "35")
        .attr("markerHeight", "35")
        .attr("orient", "auto");
    marker.append('circle')
        .attr("cx", "5")
        .attr("cy", "5")
        .attr("r", "5")
        .attr("fill", connector_colour);
}

function newArtifactSVGDefinition(artifact, data_type) {
    let definition = {};
    definition['artifact'] = artifact;
    definition['data_type'] = data_type;
    definition['name'] = {show: false, text: artifact['display_name']};
    definition['label'] = {show: false, text: data_type};
    definition['svg'] = {x: 0, y: 0, width: icon_width, height: icon_height};
    definition['rect'] = {x: 0, y: 0,
        width: icon_width, height: icon_height,
        width_adjust: 0, height_adjust: 0,
        stroke: {colour: '#F80000', dash: 5},
        fill: 'white', style: 'fill-opacity: .25;'};
    definition['icon'] = {show: true, x_translation: 0, y_translation: 0};

    return definition
}

function drawArtifact(definition) {
    let id             = definition['artifact']['id'];
    let parent_id      = definition['artifact']['parent_id'];
    let compartment_id = definition['artifact']['compartment_id'];
    let def_id         = definition['data_type'].replace(/ /g, '') + 'Svg';
    console.log('<<<<<<<<<<<<<<<<<< Creating ' + definition['data_type'] + ' ' + definition['artifact']['display_name'] + ' >>>>>>>>>>>>>>>>>>')
    console.log('<<<<<<<<<<<<<<<<<< Id : ' + id + ' >>>>>>>>>>>>>>>>>>')
    console.log('<<<<<<<<<<<<<<<<<< Parent Id : ' + parent_id + ' >>>>>>>>>>>>>>>>>>')
    console.log('<<<<<<<<<<<<<<<<<< Compartment Id : ' + compartment_id + ' >>>>>>>>>>>>>>>>>>')
    let rect_x         = definition['rect']['x'];
    let rect_y         = definition['rect']['y'];
    let rect_width     = definition['svg']['width']  + definition['rect']['width_adjust'];
    let rect_height    = definition['svg']['height'] + definition['rect']['height_adjust'];
    if (definition['icon']['y_translation'] < 0) {
        rect_y = Math.abs(definition['icon']['y_translation']);
        rect_height -= rect_y;
    }
    if (definition['icon']['x_translation'] < 0) {
        rect_x = Math.abs(definition['icon']['x_translation']);
        rect_width -= rect_x;
    }
    // Get Parent SVG
    let parent_svg = d3.select('#' + parent_id + "-svg");
    // Wrapper SVG Element to define ViewBox etc
    let svg = parent_svg.append("svg")
        .attr("id", id + '-svg')
        .attr("data-type", definition['data_type'])
        .attr("x",         definition['svg']['x'])
        .attr("y",         definition['svg']['y'])
        .attr("width",     definition['svg']['width'])
        .attr("height",    definition['svg']['height'])
        //.attr("viewBox", "0 0 " + svg_width + " " + svg_height)
        .attr("preserveAspectRatio", "xMinYMax meet");
    let rect = svg.append("rect")
        .attr("id", id)
        .attr("x",      rect_x)
        .attr("y",      rect_y)
        .attr("width",  rect_width)
        .attr("height", rect_height)
        .attr("fill",   definition['rect']['fill'])
        .attr("style",  definition['rect']['style'])
        .attr("stroke", definition['rect']['stroke']['colour'])
        .attr("stroke-dasharray",
            definition['rect']['stroke']['dash'] + ", " + definition['rect']['stroke']['dash']);
    rect.append("title")
        .attr("id", id + '-title')
        .text(definition['data_type'] + ": " + definition['artifact']['display_name']);
    if (definition['name']['show']) {
        let name_svg = svg.append('svg')
            .attr("x", "10")
            .attr("y", "0")
            .attr("width", container_artifact_label_width)
            .attr("height", definition['svg']['height'])
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 200 " + definition['svg']['height']);
        let name = name_svg.append("text")
            .attr("class", "svg-text")
            .attr("id", id + '-display-name')
            .attr("x", rect_x)
            .attr("y", "55")
            .attr("vector-effects", "non-scaling-size")
            .text(definition['name']['text']);
    }
    if (definition['label']['show']) {
        let name_svg = svg.append('svg')
            .attr("x", "10")
            .attr("y", "0")
            .attr("width", container_artifact_label_width)
            .attr("height", definition['svg']['height'])
            .attr("preserveAspectRatio", "xMinYMax meet")
            .attr("viewBox", "0 0 300 " + definition['svg']['height']);
        let name = name_svg.append("text")
            .attr("class", "svg-text")
            .attr("id", id + '-label')
            .attr("x", rect_x)
            .attr("y", definition['svg']['height'] - 10)
            .attr("fill", definition['rect']['stroke']['colour'])
            .attr("vector-effects", "non-scaling-size")
            .text(definition['label']['text']);
    }

    svg.append('g')
        //.attr("transform", "translate("  + [icon_translate_x, icon_translate_y] + ")")
        //.attr("transform", "translate(-20, -20) scale(0.3, 0.3)")
        .append("use")
        .attr("xlink:href","#" + def_id);


    // Set common attributes on svg element and children
    svg.on("contextmenu", handleContextMenu)
        .on("dragenter",  handleDragEnter)
        .on("dragover",   handleDragOver)
        .on("dragleave",  handleDragLeave)
        .on("drop",       handleDrop)
        .on("dragend",    handleDragEnd)
        .attr("data-type",           definition['data_type'])
        .attr("data-okit-id",        id)
        .attr("data-parent-id",      parent_id)
        .attr("data-compartment-id", compartment_id)
        .selectAll("*")
            .attr("data-type",           definition['data_type'])
            .attr("data-okit-id",        id)
            .attr("data-parent-id",      parent_id)
            .attr("data-compartment-id", compartment_id);

    return svg;
}

function drawSVGforJson(artifact={}) {
    console.log('******** Drawing SVG *********');
    displayOkitJson();
    // Clear existing
    clearDiagram();

    // Draw Outer SVG
    if (okitJson.hasOwnProperty('compartments')) {
        compartment_ids = [];
        for (let i = 0; i < okitJson['compartments'].length; i++) {
            compartment_ids.push(okitJson['compartments'][i]['id']);
            okitIdsJsonObj[okitJson['compartments'][i]['id']] = okitJson['compartments'][i]['name']
            compartment_count += 1;
            drawCompartmentSVG(okitJson['compartments'][i]);
        }
    }

    // Draw Compartment Subcomponents
    if (okitJson.hasOwnProperty('virtual_cloud_networks')) {
        virtual_network_ids = [];
        for (let i=0; i < okitJson['virtual_cloud_networks'].length; i++) {
            virtual_network_ids.push(okitJson['virtual_cloud_networks'][i]['id']);
            okitIdsJsonObj[okitJson['virtual_cloud_networks'][i]['id']] = okitJson['virtual_cloud_networks'][i]['display_name'];
            virtual_cloud_network_count += 1;
            drawVirtualCloudNetworkSVG(okitJson['virtual_cloud_networks'][i]);
        }
    }
    if (okitJson.hasOwnProperty('block_storage_volumes')) {
        block_storage_volume_ids = [];
        for (let i=0; i < okitJson['block_storage_volumes'].length; i++) {
            block_storage_volume_ids.push(okitJson['block_storage_volumes'][i]['id']);
            okitIdsJsonObj[okitJson['block_storage_volumes'][i]['id']] = okitJson['block_storage_volumes'][i]['display_name'];
            block_storage_volume_count += 1;
            drawBlockStorageVolumeSVG(okitJson['block_storage_volumes'][i]);
        }
    }

    // Draw Virtual Cloud Network Subcomponents
    if (okitJson.hasOwnProperty('internet_gateways')) {
        internet_gateway_ids = [];
        for (let i=0; i < okitJson['internet_gateways'].length; i++) {
            internet_gateway_ids.push(okitJson['internet_gateways'][i]['id']);
            okitIdsJsonObj[okitJson['internet_gateways'][i]['id']] = okitJson['internet_gateways'][i]['display_name'];
            internet_gateway_count += 1;
            drawInternetGatewaySVG(okitJson['internet_gateways'][i]);
        }
    }
    if (okitJson.hasOwnProperty('nat_gateways')) {
        nat_gateway_ids = [];
        for (let i=0; i < okitJson['nat_gateways'].length; i++) {
            nat_gateway_ids.push(okitJson['nat_gateways'][i]['id']);
            okitIdsJsonObj[okitJson['nat_gateways'][i]['id']] = okitJson['nat_gateways'][i]['display_name'];
            nat_gateway_count += 1;
            drawNATGatewaySVG(okitJson['nat_gateways'][i]);
        }
    }
    if (okitJson.hasOwnProperty('route_tables')) {
        route_table_ids = [];
        for (let i=0; i < okitJson['route_tables'].length; i++) {
            route_table_ids.push(okitJson['route_tables'][i]['id']);
            okitIdsJsonObj[okitJson['route_tables'][i]['id']] = okitJson['route_tables'][i]['display_name'];
            route_table_count += 1;
            drawRouteTableSVG(okitJson['route_tables'][i]);
        }
    }
    if (okitJson.hasOwnProperty('security_lists')) {
        security_list_ids = [];
        for (let i=0; i < okitJson['security_lists'].length; i++) {
            security_list_ids.push(okitJson['security_lists'][i]['id']);
            okitIdsJsonObj[okitJson['security_lists'][i]['id']] = okitJson['security_lists'][i]['display_name'];
            security_list_count += 1;
            drawSecurityListSVG(okitJson['security_lists'][i]);
        }
    }
    if (okitJson.hasOwnProperty('subnets')) {
        subnet_ids = [];
        for (let i=0; i < okitJson['subnets'].length; i++) {
            subnet_ids.push(okitJson['subnets'][i]['id']);
            okitIdsJsonObj[okitJson['subnets'][i]['id']] = okitJson['subnets'][i]['display_name'];
            initialiseSubnetChildData(okitJson['subnets'][i]['id']);
            subnet_count += 1;
            drawSubnetSVG(okitJson['subnets'][i]);
            //drawSubnetConnectorsSVG(okitJson['subnets'][i]);
        }
    }

    // Draw Subnet Subcomponents
    if (okitJson.hasOwnProperty('instances')) {
        instance_ids = [];
        for (let i=0; i < okitJson['instances'].length; i++) {
            instance_ids.push(okitJson['instances'][i]['id']);
            okitIdsJsonObj[okitJson['instances'][i]['id']] = okitJson['instances'][i]['display_name'];
            instance_count += 1;
            drawInstanceSVG(okitJson['instances'][i]);
            //drawInstanceConnectorsSVG(okitJson['instances'][i]);
        }
    }
    if (okitJson.hasOwnProperty('load_balancers')) {
        load_balancer_ids = [];
        for (let i=0; i < okitJson['load_balancers'].length; i++) {
            load_balancer_ids.push(okitJson['load_balancers'][i]['id']);
            okitIdsJsonObj[okitJson['load_balancers'][i]['id']] = okitJson['load_balancers'][i]['display_name'];
            load_balancer_count += 1;
            drawLoadBalancerSVG(okitJson['load_balancers'][i]);
            drawLoadBalancerConnectorsSVG(okitJson['load_balancers'][i]);
        }
    }
}

function drawConnector(parent_svg, id, start={x:0, y:0}, end={x:0, y:0}) {
    // Calculate Polyline points
    let ydiff = end['y'] - start['y'];
    let ymid = Math.round(start['y'] + ydiff / 2);
    let mid1 = {x:start['x'], y:ymid};
    let mid2 = {x:end['x'],   y:ymid};
    let points = coordString(start) + " " + coordString(mid1) + " " + coordString(mid2) + " " + coordString(end);
    let polyline = parent_svg.append('polyline')
        .attr("id", id)
        .attr("points", points)
        .attr("stroke-width", "2")
        .attr("stroke", connector_colour)
        .attr("fill", "none")
        .attr("marker-start", "url(#connector-end-circle)")
        .attr("marker-end", "url(#connector-end-circle)");
    return polyline;
}

function coordString(coord) {
    let coord_str = coord['x'] + ',' + coord['y'];
    //console.log('Coord String : ' + coord_str);
    return coord_str;
}

function clearCanvas() {
    let canvas_svg = d3.select('#canvas-svg');
    canvas_svg.selectAll('*').remove();
    styleCanvas(canvas_svg);
    createSVGDefinitions(canvas_svg);
}

function newCanvas(parent_id="canvas-wrapper") {
    let compartment_div = d3.select('#' + parent_id);
    let window_width = $(window).width();
    let window_height = $(window).height();
    //console.log('JQuery Width  : ' + $('#' + parent_id).width());
    //console.log('JQuery Height : ' + $('#' + parent_id).height());
    //console.log('Client Width  : ' + document.getElementById(parent_id).clientWidth);
    //console.log('Client Height : ' + document.getElementById(parent_id).clientHeight);
    // Empty existing Canvas
    compartment_div.selectAll('*').remove();
    // Wrapper SVG Element to define ViewBox etc
    let canvas_svg = compartment_div.append("svg")
    //.attr("class", "svg-canvas")
        .attr("id", 'canvas-svg')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", window_width)
        .attr("height", window_height)
        .attr("viewBox", "0 0 " + window_width + " " + window_height)
        //.attr("viewBox", "0 0 " + viewbox_width + " " + viewbox_height)
        .attr("preserveAspectRatio", "xMinYMin meet");

    clearCanvas();

    return canvas_svg;
}
