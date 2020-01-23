/*
** Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
** The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]
*/
console.info('Loaded SVG Javascript');

// SVG Icons
const icon_width = 45;
const icon_height = 45;
const icon_translate_x_start = -20;
const icon_translate_y_start = -20;
const icon_spacing = 10;
const connector_colour = "#336699";
const corner_radius = 10;
const container_artifact_x_padding = Math.round(icon_width  * 3 / 2);
const container_artifact_y_padding = Math.round(icon_height  * 3 / 2);
const container_artifact_label_width = 300;
const container_artifact_info_width = 100;
const positional_adjustments = {
    padding: {x: Math.round(icon_width),   y: Math.round(icon_height)},
    spacing: {x: Math.round(icon_spacing), y: Math.round(icon_spacing)}
};
const path_connector = true;
const small_grid_size = 8;
const grid_size = small_grid_size * 10;
const stroke_colours = {
    red: "#F80000",
    bark: "#312D2A",
    gray: "#939699",
    blue: "#0066cc",
    orange: "#ff6600",
    purple: "#400080",
    icon_colour_01: "#F80000",
    icon_colour_02: "#939699",
};
const svg_highlight_colour = "#00cc00";

/*
** SVG Drawing / Manipulating SVG Canvas
 */

function styleCanvas(canvas_svg) {
    let colours = '';
    for (let key in stroke_colours) {
        //colours += '.' + key.replace('_', '-') + '{fill:' + stroke_colours[key] + ';} ';
        colours += '.' + key.replace(new RegExp('_', 'g'), '-') + '{fill:' + stroke_colours[key] + ';} ';
    }
    canvas_svg.append('style')
        .attr("type", "text/css")
        .text(colours + ' text{font-weight: bold; font-size: 11pt; font-family: Ariel}');
    //.text('.svg-red{fill:#F80000;} .svg-gray{fill:#939699;} .svg-blue{fill:#0066cc} .svg-orange{fill:#ff6600} .svg-purple{fill:#400080} text{font-weight: bold; font-size: 11pt; font-family: Ariel}');
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
    // Grid
    let small_grid = defs.append('pattern')
        .attr("id", "small-grid")
        .attr("width", small_grid_size)
        .attr("height", small_grid_size)
        .attr("patternUnits", "userSpaceOnUse");
    small_grid.append('path')
        .attr("d", "M "+ small_grid_size + " 0 L 0 0 0 " + small_grid_size)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-width", "0.5");
    let grid = defs.append('pattern')
        .attr("id", "grid")
        .attr("width", grid_size)
        .attr("height", grid_size)
        .attr("patternUnits", "userSpaceOnUse");
    grid.append('rect')
        .attr("width", grid_size)
        .attr("height", grid_size)
        .attr("fill", "url(#small-grid)");
    grid.append('path')
        .attr("d", "M " + grid_size + " 0 L 0 0 0 " + grid_size)
        .attr("fill", "none")
        .attr("stroke", "darkgray")
        .attr("stroke-width", "1");
}

function newArtifactSVGDefinition(artifact, data_type) {
    let definition = {};
    definition['artifact'] = artifact;
    definition['data_type'] = data_type;
    definition['name'] = {show: false, text: artifact['display_name']};
    definition['label'] = {show: false, text: data_type};
    definition['info'] = {show: false, text: data_type};
    definition['svg'] = {x: 0, y: 0, width: icon_width, height: icon_height};
    definition['rect'] = {x: 0, y: 0,
        width: icon_width, height: icon_height,
        width_adjust: 0, height_adjust: 0,
        stroke: {colour: '#F80000', dash: 5},
        fill: 'white', style: 'fill-opacity: .25;'};
    definition['icon'] = {show: true, x_translation: 0, y_translation: 0};
    definition['title_keys'] = [];

    return definition
}

function drawArtifact(definition) {
    let id             = definition['artifact']['id'];
    let parent_id      = definition['artifact']['parent_id'];
    let parent_svg_id  = parent_id + "-svg";
    let compartment_id = definition['artifact']['compartment_id'];
    let def_id         = definition['data_type'].replace(/ /g, '') + 'Svg';
    console.info('Creating ' + definition['data_type'] + ' ' + definition['artifact']['display_name'])
    console.info('Id             : ' + id )
    console.info('Parent Id      : ' + parent_id)
    console.info('Parent SVG Id  : ' + parent_svg_id);
    console.info('Compartment Id : ' + compartment_id);
    let rect_x         = definition['rect']['x'];
    let rect_y         = definition['rect']['y'];
    let rect_width     = definition['svg']['width']  + definition['rect']['width_adjust'];
    let rect_height    = definition['svg']['height'] + definition['rect']['height_adjust'];
    if (definition['icon']['y_translation'] < 0) {
        rect_y = Math.abs(definition['icon']['y_translation']);
        rect_height -= rect_y * 2;
    }
    if (definition['icon']['x_translation'] < 0) {
        rect_x = Math.abs(definition['icon']['x_translation']);
        rect_width -= rect_x * 2;
    }
    // Check for Artifact Display Name and if it does not exist set it to Artifact Name
    if (!definition['artifact'].hasOwnProperty('display_name')) {
        definition['artifact']['display_name'] = definition['artifact']['name'];
    }
    // Get Parent SVG
    let parent_svg = d3.select('#' + parent_svg_id);
    // Wrapper SVG Element to define ViewBox etc
    let svg = parent_svg.append("svg")
        .attr("id", id + '-svg')
        .attr("data-type", definition['data_type'])
        .attr("x",         definition['svg']['x'])
        .attr("y",         definition['svg']['y'])
        .attr("width",     definition['svg']['width'])
        .attr("height",    definition['svg']['height'])
        .attr("viewBox", "0 0 " + definition['svg']['width'] + " " + definition['svg']['height'])
        .attr("preserveAspectRatio", "xMinYMax meet");
    let rect = svg.append("rect")
        .attr("id", id)
        .attr("x",      rect_x)
        .attr("y",      rect_y)
        .attr("rx",     corner_radius)
        .attr("ry",     corner_radius)
        .attr("width",  rect_width)
        .attr("height", rect_height)
        .attr("fill",   definition['rect']['fill'])
        .attr("style",  definition['rect']['style'])
        .attr("stroke", definition['rect']['stroke']['colour'])
        .attr("stroke-dasharray",
            definition['rect']['stroke']['dash'] + ", " + definition['rect']['stroke']['dash']);
    let title = rect.append("title")
        .attr("id", id + '-title')
        .text(definition['data_type'] + ": " + definition['artifact']['display_name']);
    /*
    for (let key of definition['title_keys']) {
        title.append("tspan")
            .attr("class", 'key')
            .attr("dy", 25)
            .text("\n" + key.replace('_', ' ') + " : ");
        title.append("tspan")
            .attr("class", 'text')
            .attr("dy", 25)
            .text(definition['artifact'][key]);
    }
    */
    if (definition['name']['show']) {
        let name_svg = svg.append('svg')
            .attr("x", "10")
            .attr("y", "0")
            .attr("width", container_artifact_label_width)
            .attr("height", definition['svg']['height'])
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + container_artifact_label_width + " " + definition['svg']['height']);
        let name = name_svg.append("text")
            .attr("class", "svg-text")
            .attr("id", id + '-display-name')
            .attr("x", rect_x)
            .attr("y", "55")
            .attr("vector-effects", "non-scaling-size")
            .text(definition['name']['text']);
    }
    if (definition['label']['show']) {
        let label_svg = svg.append('svg')
            .attr("x", "10")
            .attr("y", "0")
            .attr("width", container_artifact_label_width)
            .attr("height", definition['svg']['height'])
            .attr("preserveAspectRatio", "xMinYMax meet")
            .attr("viewBox", "0 0 " + container_artifact_label_width + " " + definition['svg']['height']);
        let name = label_svg.append("text")
            .attr("class", "svg-text")
            .attr("id", id + '-label')
            .attr("x", rect_x)
            .attr("y", definition['svg']['height'] - Math.max(10, (rect_y * 2) - 10))
            .attr("fill", definition['rect']['stroke']['colour'])
            .attr("vector-effects", "non-scaling-size")
            .text(definition['label']['text']);
    }
    if (definition['info']['show']) {
        let info_svg = svg.append('svg')
            .attr("x", Math.round(definition['svg']['width'] - container_artifact_info_width))
            .attr("y", "0")
            .attr("width", container_artifact_info_width)
            .attr("height", definition['svg']['height'])
            .attr("preserveAspectRatio", "xMinYMax meet")
            .attr("viewBox", "0 0 " + container_artifact_info_width + " " + definition['svg']['height']);
        let name = info_svg.append("text")
            .attr("class", "svg-text")
            .attr("id", id + '-info')
            .attr("x", 0)
            .attr("y", definition['svg']['height'] - Math.max(10, (rect_y * 2) - 10))
            .attr("fill", definition['rect']['stroke']['colour'])
            .attr("vector-effects", "non-scaling-size")
            .text(definition['info']['text']);
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

function drawSVGforJson() {
    console.groupCollapsed('Drawing SVG Canvas');
    okitJson.draw();
    console.groupEnd();

}

function generateArc(radius, clockwise, xmod, ymod) {
    let arc = 'a' + radius + ',' + radius + ' 0 0 ' + clockwise + ' ' + xmod + radius + ',' + ymod + radius;
    return arc;
}

function drawConnector(parent_svg, id, start={x:0, y:0}, end={x:0, y:0}, horizontal=false) {
    console.groupCollapsed('Generating Connector');
    console.info('Start Coordinates : ' + JSON.stringify(start));
    console.info('End Coordinates   : ' + JSON.stringify(end));
    if (horizontal) {
        drawHorizontalConnector(parent_svg, id, start, end);
    } else {
        drawVerticalConnector(parent_svg, id, start, end);
    }
    console.groupEnd();
}

function drawVerticalConnector(parent_svg, id, start={x:0, y:0}, end={x:0, y:0},) {
    console.groupCollapsed('Generating Vertical Connector');
    console.info('Start Coordinates : ' + JSON.stringify(start));
    console.info('End Coordinates   : ' + JSON.stringify(end));
    if (path_connector) {
        let radius = corner_radius;
        let dy = Math.round((end['y'] - start['y']) / 2);
        let dx = end['x'] - start['x'];
        let arc1 = '';
        let arc2 = '';
        console.info('dx                : ' + dx);
        console.info('dy                : ' + dy);
        if (dy > 0 && dx > 0) {
            // First turn down and right with counter clockwise arc
            arc1 = 'a5,5 0 0 0 5,5';
            arc1 = generateArc(radius, 0, '', '');
            // Second turn right and down with clockwise arc
            arc2 = 'a5,5 0 0 1 5,5';
            arc2 = generateArc(radius, 1, '', '');
            // Reduce dy by radius
            dy -= radius;
            // Reduce dx by 2 * radius
            dx -= radius * 2;
        } else if (dy > 0 && dx < 0) {
            // First turn down and left with counter clockwise arc
            arc1 = 'a5,5 0 0 1 -5,5';
            arc1 = generateArc(radius, 1, '-', '');
            // Second turn left and down with clockwise arc
            arc2 = 'a5,5 0 0 0 -5,5';
            arc2 = generateArc(radius, 0, '-', '');
            // Reduce dy by radius
            dy -= radius;
            // Increase dx by 2 * radius
            dx += radius * 2;
        } else if (dy < 0 && dx < 0) {
            // First turn up and left with counter clockwise arc
            arc2 = 'a5,5 0 0 1 -5,-5';
            arc2 = generateArc(radius, 1, '-', '-');
            // Second turn left and up with clockwise arc
            arc1 = 'a5,5 0 0 0 -5,-5';
            arc1 = generateArc(radius, 0, '-', '-');
            // Increase dy by radius
            dy += radius;
            // Reduce dx by 2 * radius
            dx -= radius * 2;
        } else if (dy < 0 && dx > 0) {
            // First turn up and right with counter clockwise arc
            arc2 = 'a5,5 0 0 0 5,-5';
            arc2 = generateArc(radius, 0, '', '-');
            // Second turn right and up with clockwise arc
            arc1 = 'a5,5 0 0 1 5,-5';
            arc1 = generateArc(radius, 1, '', '-');
            // Reduce dy by radius
            dy += radius;
            // Increase dx by 2 * radius
            dx -= radius * 2;
        }
        let points = "m" + coordString(start) + " v" + dy + " " + arc1 + " h" + dx + " " + arc2 + " v" + dy;
        let path = parent_svg.append('path')
            .attr("id", id)
            .attr("d", points)
            //.attr("d", "M100,100 h50 a5,5 0 0 0 5,5 v50 a5,5 0 0 1 -5,5 h-50 a5,5 0 0 1 -5,-5 v-50 a5,5 0 0 1 5,-5 z")
            .attr("stroke-width", "2")
            .attr("stroke", connector_colour)
            .attr("fill", "none")
            .attr("marker-start", "url(#connector-end-circle)")
            .attr("marker-end", "url(#connector-end-circle)");
        //return path;
    } else {
        // Calculate Polyline points
        let ydiff = end['y'] - start['y'];
        let ymid = Math.round(start['y'] + ydiff / 2);
        let mid1 = {x: start['x'], y: ymid};
        let mid2 = {x: end['x'], y: ymid};
        let points = coordString(start) + " " + coordString(mid1) + " " + coordString(mid2) + " " + coordString(end);
        let polyline = parent_svg.append('polyline')
            .attr("id", id)
            .attr("points", points)
            .attr("stroke-width", "2")
            .attr("stroke", connector_colour)
            .attr("fill", "none")
            .attr("marker-start", "url(#connector-end-circle)")
            .attr("marker-end", "url(#connector-end-circle)");
        //return polyline;
    }
    console.groupEnd();
}

function drawHorizontalConnector(parent_svg, id, start={x:0, y:0}, end={x:0, y:0}) {
    console.groupCollapsed('Generating Horizontal Connector');
    console.info('Start Coordinates : ' + JSON.stringify(start));
    console.info('End Coordinates   : ' + JSON.stringify(end));
    if (path_connector) {
        let radius = corner_radius;
        let dy = end['y'] - start['y'];
        let dx = Math.round((end['x'] - start['x']) / 2);
        let arc1 = '';
        let arc2 = '';
        console.info('dx                : ' + dx);
        console.info('dy                : ' + dy);
        if (dy > 0 && dx > 0) {
            // First turn right and down with clockwise arc
            arc1 = 'a5,5 0 0 1 5,5';
            arc1 = generateArc(radius, 1, '', '');
            // Second turn down and right with counter clockwise arc
            arc2 = 'a5,5 0 0 0 5,5';
            arc2 = generateArc(radius, 0, '', '');
            // Reduce dx by radius
            dx -= radius;
            // Reduce dy by 2 * radius
            dy -= radius * 2;
        } else if (dy > 0 && dx < 0) {
            // First turn down and left with counter clockwise arc
            arc1 = 'a5,5 0 0 1 -5,5';
            arc1 = generateArc(radius, 1, '-', '');
            // Second turn left and down with clockwise arc
            arc2 = 'a5,5 0 0 0 -5,5';
            arc2 = generateArc(radius, 0, '-', '');
            // Increase dx by radius
            dx += radius;
            // Reduce dy by 2 * radius
            dy -= radius * 2;
        } else if (dy < 0 && dx < 0) {
            // First turn up and left with counter clockwise arc
            arc1 = 'a5,5 0 0 1 -5,-5';
            arc1 = generateArc(radius, 1, '-', '-');
            // Second turn left and up with clockwise arc
            arc2 = 'a5,5 0 0 0 -5,-5';
            arc2 = generateArc(radius, 0, '-', '-');
            // Reduce dx by radius
            dx -= radius;
            // Increase dy by 2 * radius
            dy += radius * 2;
        } else if (dy < 0 && dx > 0) {
            // First turn up and right with counter clockwise arc
            arc1 = 'a5,5 0 0 0 5,-5';
            arc1 = generateArc(radius, 0, '', '-');
            // Second turn right and up with clockwise arc
            arc2 = 'a5,5 0 0 1 5,-5';
            arc2 = generateArc(radius, 1, '', '-');
            // Reduce dx by radius
            dx -= radius;
            // Increase dy by 2 * radius
            dy += radius * 2;
        }
        let points = "m" + coordString(start) + " h" + dx + " " + arc1 + " " + " v" + dy + arc2 + " h" + dx;
        let path = parent_svg.append('path')
            .attr("id", id)
            .attr("d", points)
            //.attr("d", "M100,100 h50 a5,5 0 0 0 5,5 v50 a5,5 0 0 1 -5,5 h-50 a5,5 0 0 1 -5,-5 v-50 a5,5 0 0 1 5,-5 z")
            .attr("stroke-width", "2")
            .attr("stroke", connector_colour)
            .attr("fill", "none")
            .attr("marker-start", "url(#connector-end-circle)")
            .attr("marker-end", "url(#connector-end-circle)");
        //return path;
    } else {
        // Calculate Polyline points
        let ydiff = end['y'] - start['y'];
        let ymid = Math.round(start['y'] + ydiff / 2);
        let mid1 = {x: start['x'], y: ymid};
        let mid2 = {x: end['x'], y: ymid};
        let points = coordString(start) + " " + coordString(mid1) + " " + coordString(mid2) + " " + coordString(end);
        let polyline = parent_svg.append('polyline')
            .attr("id", id)
            .attr("points", points)
            .attr("stroke-width", "2")
            .attr("stroke", connector_colour)
            .attr("fill", "none")
            .attr("marker-start", "url(#connector-end-circle)")
            .attr("marker-end", "url(#connector-end-circle)");
        //return polyline;
    }
    console.groupEnd();
}

function coordString(coord) {
    let coord_str = coord['x'] + ',' + coord['y'];
    //console.info('Coord String : ' + coord_str);
    return coord_str;
}

function clearCanvas() {
    let canvas_svg = d3.select('#canvas-svg');
    canvas_svg.selectAll('*').remove();
    styleCanvas(canvas_svg);
    createSVGDefinitions(canvas_svg);
    addGrid(canvas_svg);
}

function addGrid(canvas_svg) {
    canvas_svg.append('rect')
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "url(#grid)");
}

const default_canvas_width = Math.round($(window).width() / 10) * 10;
const default_canvas_height = Math.round(($(window).height() * 2) / 10) * 10;

function newCanvas(parent_id="canvas-wrapper", width=default_canvas_width, height=default_canvas_height) {
    console.groupCollapsed('New Canvas');
    let compartment_div = d3.select('#' + parent_id);
    //let canvas_width = Math.round($(window).width() / 10) * 10;
    //let canvas_height = Math.round(($(window).height() * 2) / 10) * 10;
    let parent_width  = $('#' + parent_id).width();
    let parent_height = $('#' + parent_id).height();
    width  = Math.round(Math.max(width, parent_width));
    height = Math.round(Math.max(height, parent_height));
    // Round up to next grid size to display full grid.
    width  += (grid_size - (width % grid_size) + 1);
    height += (grid_size - (height % grid_size) + 1);
    console.info('JQuery Width  : ' + $('#' + parent_id).width());
    console.info('JQuery Height : ' + $('#' + parent_id).height());
    console.info('Client Width  : ' + document.getElementById(parent_id).clientWidth);
    console.info('Client Height : ' + document.getElementById(parent_id).clientHeight);
    console.info('Window Width  : ' + $(window).width());
    console.info('Window Height : ' + $(window).height());
    console.info('Canvas Width  : ' + width);
    console.info('Canvas Height : ' + height);
    // Empty existing Canvas
    compartment_div.selectAll('*').remove();
    // Wrapper SVG Element to define ViewBox etc
    let canvas_svg = compartment_div.append("svg")
        //.attr("class", "svg-canvas")
        .attr("id", 'canvas-svg')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 " + width + " " + height)
        //.attr("viewBox", "0 0 " + parent_width + " " + parent_height)
        .attr("preserveAspectRatio", "xMinYMin meet");

    clearCanvas();
    console.groupEnd();

    return canvas_svg;
}

