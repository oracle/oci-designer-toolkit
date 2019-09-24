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
