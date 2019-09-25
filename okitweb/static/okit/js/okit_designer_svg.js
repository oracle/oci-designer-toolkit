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

/*
** SVG Drawing / Manipulating SVG Canvas
 */

function drawArtifactSVG(artifact, data_type, svg_x=0, svg_y=0, svg_width=45, svg_height=45, stroke_colour="#F80000",
                         stroke_dash=5, show_name=false, show_label=false, icon_translate_x=0, icon_translate_y=0,
                         rect_width_adjust=0, rect_height_adjust = 0) {
    let id = artifact['id'];
    let parent_id = artifact['parent_id'];
    let compartment_id = artifact['compartment_id'];
    let display_name = artifact['display_name'];
    let def_id = data_type.replace(/ /g, '') + 'Svg';
    console.log('<<<<<<<<<<<<<<<<<< Creating ' + data_type + ' ' + display_name + ' >>>>>>>>>>>>>>>>>>')
    console.log('<<<<<<<<<<<<<<<<<< Id : ' + id + ' >>>>>>>>>>>>>>>>>>')
    console.log('<<<<<<<<<<<<<<<<<< Parent Id : ' + parent_id + ' >>>>>>>>>>>>>>>>>>')
    console.log('<<<<<<<<<<<<<<<<<< Compartment Id : ' + compartment_id + ' >>>>>>>>>>>>>>>>>>')
    let rect_x = 0;
    let rect_y = 0;
    let rect_width = svg_width + rect_width_adjust;
    let rect_height = svg_height + rect_height_adjust;
    if (icon_translate_y < 0) {
        rect_y = Math.abs(icon_translate_y);
        rect_height -= rect_y;
    }
    if (icon_translate_x < 0) {
        rect_x = Math.abs(icon_translate_x);
        rect_width -= rect_x;
    }
    // Get Parent SVG
    let parent_svg = d3.select('#' + parent_id + "-svg");
    // Wrapper SVG Element to define ViewBox etc
    let svg = parent_svg.append("svg")
        .attr("id", id + '-svg')
        .attr("data-type", data_type)
        .attr("x", svg_x)
        .attr("y", svg_y)
        .attr("width", svg_width)
        .attr("height", svg_height)
        //.attr("viewBox", "0 0 " + svg_width + " " + svg_height)
        .attr("preserveAspectRatio", "xMinYMax meet");
    let rect = svg.append("rect")
        .attr("id", id)
        .attr("x", rect_x)
        .attr("y", rect_y)
        .attr("width", rect_width)
        .attr("height", rect_height)
        .attr("fill", "white")
        .attr("style", "fill-opacity: .25;")
        .attr("stroke", stroke_colour)
        .attr("stroke-dasharray", stroke_dash + ", " + stroke_dash);
    rect.append("title")
        .attr("id", id + '-title')
        .text(data_type + ": " + display_name);
    if (show_name) {
        let name_svg = svg.append('svg')
            .attr("x", "10")
            .attr("y", "0")
            .attr("width", "200")
            .attr("height", svg_height)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 200 " + svg_height);
        let name = name_svg.append("text")
            .attr("class", "svg-text")
            .attr("id", id + '-display-name')
            .attr("x", rect_x)
            .attr("y", "55")
            .attr("vector-effects", "non-scaling-size")
            .text(artifact['display_name']);
    }
    if (show_label) {
        let name_svg = svg.append('svg')
            .attr("x", "10")
            .attr("y", "0")
            .attr("width", "300")
            .attr("height", svg_height)
            .attr("preserveAspectRatio", "xMinYMax meet")
            .attr("viewBox", "0 0 300 " + svg_height);
        let name = name_svg.append("text")
            .attr("class", "svg-text")
            .attr("id", id + '-label')
            .attr("x", rect_x)
            .attr("y", svg_height - 10)
            .attr("fill", stroke_colour)
            .attr("vector-effects", "non-scaling-size")
            .text(data_type);
    }

    svg.append('g')
        //.attr("transform", "translate("  + [icon_translate_x, icon_translate_y] + ")")
        //.attr("transform", "translate(-20, -20) scale(0.3, 0.3)")
        .append("use")
        .attr("xlink:href","#" + def_id);


    // Set common attributes on svg element and children
    svg.on("contextmenu", handleContextMenu)
        .on("dragenter", handleDragEnter)
        .on("dragover", handleDragOver)
        .on("dragleave", handleDragLeave)
        .on("drop", handleDrop)
        .on("dragend", handleDragEnd)
        .attr("data-type", data_type)
        .attr("data-okit-id", id)
        .attr("data-parent-id", parent_id)
        .attr("data-compartment-id", compartment_id)
        .selectAll("*")
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parent-id", parent_id)
            .attr("data-compartment-id", compartment_id);

    return svg;
}


function drawSVGforJson(artifact={}) {
    console.log('******** Drawing SVG *********');
    displayOkitJson();
    // Clear existing
    clearSVG();

    // Draw Outer SVG
    if (OKITJsonObj.hasOwnProperty('compartments')) {
        compartment_ids = [];
        for (let i = 0; i < OKITJsonObj['compartments'].length; i++) {
            compartment_ids.push(OKITJsonObj['compartments'][i]['id']);
            okitIdsJsonObj[OKITJsonObj['compartments'][i]['id']] = OKITJsonObj['compartments'][i]['name']
            compartment_count += 1;
            drawCompartmentSVG(OKITJsonObj['compartments'][i]);
        }
    }

    // Draw Compartment Subcomponents
    if (OKITJsonObj.hasOwnProperty('virtual_cloud_networks')) {
        virtual_network_ids = [];
        for (let i=0; i < OKITJsonObj['virtual_cloud_networks'].length; i++) {
            virtual_network_ids.push(OKITJsonObj['virtual_cloud_networks'][i]['id']);
            okitIdsJsonObj[OKITJsonObj['virtual_cloud_networks'][i]['id']] = OKITJsonObj['virtual_cloud_networks'][i]['display_name'];
            virtual_cloud_network_count += 1;
            drawVirtualCloudNetworkSVG(OKITJsonObj['virtual_cloud_networks'][i]);
        }
    }
    if (OKITJsonObj.hasOwnProperty('block_storage_volumes')) {
        block_storage_volume_ids = [];
        for (let i=0; i < OKITJsonObj['block_storage_volumes'].length; i++) {
            block_storage_volume_ids.push(OKITJsonObj['block_storage_volumes'][i]['id']);
            okitIdsJsonObj[OKITJsonObj['block_storage_volumes'][i]['id']] = OKITJsonObj['block_storage_volumes'][i]['display_name'];
            block_storage_volume_count += 1;
            drawBlockStorageVolumeSVG(OKITJsonObj['block_storage_volumes'][i]);
        }
    }

    // Draw Virtual Cloud Network Subcomponents
    if (OKITJsonObj.hasOwnProperty('internet_gateways')) {
        internet_gateway_ids = [];
        for (let i=0; i < OKITJsonObj['internet_gateways'].length; i++) {
            internet_gateway_ids.push(OKITJsonObj['internet_gateways'][i]['id']);
            okitIdsJsonObj[OKITJsonObj['internet_gateways'][i]['id']] = OKITJsonObj['internet_gateways'][i]['display_name'];
            internet_gateway_count += 1;
            drawInternetGatewaySVG(OKITJsonObj['internet_gateways'][i]);
        }
    }
    if (OKITJsonObj.hasOwnProperty('route_tables')) {
        route_table_ids = [];
        for (let i=0; i < OKITJsonObj['route_tables'].length; i++) {
            route_table_ids.push(OKITJsonObj['route_tables'][i]['id']);
            okitIdsJsonObj[OKITJsonObj['route_tables'][i]['id']] = OKITJsonObj['route_tables'][i]['display_name'];
            route_table_count += 1;
            drawRouteTableSVG(OKITJsonObj['route_tables'][i]);
        }
    }
    if (OKITJsonObj.hasOwnProperty('security_lists')) {
        security_list_ids = [];
        for (let i=0; i < OKITJsonObj['security_lists'].length; i++) {
            security_list_ids.push(OKITJsonObj['security_lists'][i]['id']);
            okitIdsJsonObj[OKITJsonObj['security_lists'][i]['id']] = OKITJsonObj['security_lists'][i]['display_name'];
            security_list_count += 1;
            drawSecurityListSVG(OKITJsonObj['security_lists'][i]);
        }
    }
    if (OKITJsonObj.hasOwnProperty('subnets')) {
        subnet_ids = [];
        for (let i=0; i < OKITJsonObj['subnets'].length; i++) {
            subnet_ids.push(OKITJsonObj['subnets'][i]['id']);
            okitIdsJsonObj[OKITJsonObj['subnets'][i]['id']] = OKITJsonObj['subnets'][i]['display_name'];
            initialiseSubnetChildData(OKITJsonObj['subnets'][i]['id']);
            subnet_count += 1;
            drawSubnetSVG(OKITJsonObj['subnets'][i]);
            //drawSubnetConnectorsSVG(OKITJsonObj['subnets'][i]);
        }
    }

    // Draw Subnet Subcomponents
    if (OKITJsonObj.hasOwnProperty('instances')) {
        instance_ids = [];
        for (let i=0; i < OKITJsonObj['instances'].length; i++) {
            instance_ids.push(OKITJsonObj['instances'][i]['id']);
            okitIdsJsonObj[OKITJsonObj['instances'][i]['id']] = OKITJsonObj['instances'][i]['display_name'];
            instance_count += 1;
            drawInstanceSVG(OKITJsonObj['instances'][i]);
            //drawInstanceConnectorsSVG(OKITJsonObj['instances'][i]);
        }
    }
    if (OKITJsonObj.hasOwnProperty('load_balancers')) {
        load_balancer_ids = [];
        for (let i=0; i < OKITJsonObj['load_balancers'].length; i++) {
            load_balancer_ids.push(OKITJsonObj['load_balancers'][i]['id']);
            okitIdsJsonObj[OKITJsonObj['load_balancers'][i]['id']] = OKITJsonObj['load_balancers'][i]['display_name'];
            load_balancer_count += 1;
            drawLoadBalancerSVG(OKITJsonObj['load_balancers'][i]);
            drawLoadBalancerConnectorsSVG(OKITJsonObj['load_balancers'][i]);
        }
    }
}

