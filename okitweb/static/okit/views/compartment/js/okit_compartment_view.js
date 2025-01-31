/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Compartment View Javascript');

class OkitCompartmentJsonView extends OkitJsonView {
    // Define Constants
    static get CANVAS_SVG() {return 'canvas-svg'}

    constructor(okitjson=null, oci_data=null, resource_icons=null, parent_id='canvas-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
        this.parent_id = parent_id;
        //this.display_grid = display_grid;
        // this.palette_svg = resource_icons.svg;
        // Set up Canvas info
        this.canvas = undefined 
        this.newCanvas()
    }

    getResources() {return Object.values(this).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])}
    getResource(id='') {return this.getResources().find((r) => r.id === id)}

    static newView(model, oci_data=null, resource_icons={}, parent_id='canvas-div') {
        console.info(`>>>>>>> Resource Icons:`, resource_icons)
        return new OkitCompartmentJsonView(model, oci_data, resource_icons, parent_id)
    }

    get display_grid() {return okitSettings.is_display_grid;}

    autoLayout() {
        
    }

    getRootContainers = () => Object.values(this).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter((r) => r instanceof OkitContainerCompartmentArtefactView && (r.parent_id === null || r.parent_id === '' || r.parent_id === 'canvas'))

    drawContainer(container) {
        container.draw();
        const children = Object.values(this).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter((r) => r.parent_id === container.id);
        console.info('Children: ', children)
        console.info('Container Children: ', children.filter((r) => r instanceof OkitContainerCompartmentArtefactView))
        console.info('Simple Children: ', children.filter((r) => !(r instanceof OkitContainerCompartmentArtefactView)))
        children.filter((r) => r instanceof OkitContainerCompartmentArtefactView).forEach((e) => this.drawContainer(e))
        children.filter((r) => !(r instanceof OkitContainerCompartmentArtefactView)).forEach((e) => e.draw())
    }

    draw(for_export=false) {
        console.info(`Drawing Compartment Canvas: For Export ${for_export}`);
        console.info('Canvas', this.canvas)
        // Display Json
        this.displayOkitJson();
        if (!this.canvas) {
            // New canvas
            let width = 0;
            let height = 0;
            for (let compartment of this.getCompartments()) {
                let dimensions = compartment.dimensions;
                width = Math.max(width, dimensions.width);
                height = Math.max(height, dimensions.height);
            }
            this.canvas = this.newCanvas(width, height, for_export);
        }
        this.clearCanvas()
        let canvas_svg = this.canvas

        // Get Canvas Root Containers
        Object.values(this).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter((r) => r instanceof OkitContainerCompartmentArtefactView && (r.parent_id === null || r.parent_id === '' || r.parent_id === 'canvas')).forEach((e) => this.drawContainer(e))

        // Resize Main Canvas if required
        $(jqId("canvas-svg")).children("svg [data-type='" + Compartment.getArtifactReference() + "']").each(function () {
            canvas_svg.attr('width', Math.max(Number(canvas_svg.attr('width')), Number(this.getAttribute('width'))));
            canvas_svg.attr('height', Math.max(Number(canvas_svg.attr('height')), Number(this.getAttribute('height'))));
            canvas_svg.attr('viewBox', '0 0 ' + canvas_svg.attr('width') + ' ' + canvas_svg.attr('height'));
        });
        if (selectedArtefact) {
            $(jqId(selectedArtefact)).toggleClass('highlight');
        }

        // Draw Connection
        this.drawConnections();
    }

    drawConnections() {
        Object.values(this).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter((r) => !(r instanceof OkitContainerCompartmentArtefactView)).forEach((e) => e.drawConnections())
    }

    /*
    ** Draw Functions for each specific Artefact
     */
    drawRootCompartment() {
        this.drawCompartments(null);
    }
    drawCompartments(parent_id) {
        for (let compartment of this.compartments) {
            if (compartment.compartment_id === parent_id) {
                compartment.draw();
                // Draw Sub Compartments
            }
        }
    }

    displayOkitJson() {}

    newCanvas(width=400, height=300, for_export=false) {
        console.info('New Canvas');
        let canvas_div = d3.select(d3Id(this.parent_id));
        let parent_width  = $(jqId(this.parent_id)).width();
        let parent_height = $(jqId(this.parent_id)).height();
        if (!for_export) {
            width = Math.round(Math.max(width, parent_width));
            height = Math.round(Math.max(height, parent_height));
        }
        // Round up to next grid size to display full grid.
        if (okitSettings && okitSettings.is_display_grid) {
            width += (grid_size - (width % grid_size) + 1);
            height += (grid_size - (height % grid_size) + 1);
        }
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // Zoom & Pan SVG
        // Zoom function associated with Canvas SVG but acts on the first <g> tag
        const zoom = d3.zoom().scaleExtent([0.1, 3]).on("zoom", (event) => {
            event = d3.event // Temp Work around for v0.67.0 release
            transform_group.attr("transform", event.transform)
        }); // event replaces d3.event
        const canvas_root_svg = canvas_div.append("svg")
        .attr("id", 'canvas_root_svg')
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .call(zoom);
        const transform_group = canvas_root_svg.append('g');
        d3.select('#zoom_in_toolbar_button').on('click', () => canvas_root_svg.transition().duration(750).call(zoom.scaleBy, 1.3))
        d3.select('#zoom_121_toolbar_button').on('click', () => canvas_root_svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.scale(1)))
        d3.select('#zoom_out_toolbar_button').on('click', () => canvas_root_svg.transition().duration(750).call(zoom.scaleBy, (1/1.3)))

        // Wrapper SVG Element to define ViewBox etc
        // let canvas_svg = canvas_div.append("svg")
        let canvas_svg = transform_group.append("svg")
            .attr("id", 'canvas-svg')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMinYMin meet");

        return canvas_svg;
    }

    clearCanvas() {
        let canvas_svg = d3.select(d3Id(OkitCompartmentJsonView.CANVAS_SVG));
        canvas_svg.selectAll('*').remove();
        this.styleCanvas(canvas_svg);
        this.addDefinitions(canvas_svg);
        canvas_svg.append('rect')
            .attr("id", "canvas-rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white");
        if (okitSettings.is_display_grid) {
            this.addGrid(canvas_svg);
        }
    }

    addDefinitions(canvas_svg) {
        // Add Palette Icons
        let defs = canvas_svg.append('defs');
        for (let key in this.resource_icons.svg) {
            let defid =  OkitJsonView.toSvgIconDef(key);
            // let defid = key.replace(/ /g, '').toLowerCase() + 'Svg';
            defs.append('g')
                .attr("id", defid)
                .attr("transform", "translate(4.5, 4.5) scale(0.8, 0.8)")
                .html(this.resource_icons.svg[key]);
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

    styleCanvas(canvas_svg) {
        let colours = '';
        for (let key in this.stroke_colours) {
            colours += '.' + key.replace(new RegExp('_', 'g'), '-') + '{fill:' + this.stroke_colours[key] + ';} ';
        }
        // Add Theme Styles
        let resource_styles = ''
        // Object.values(document.styleSheets).forEach((sheet) => {
        //     if (sheet.href && sheet.href.includes('theme.css')) {
        //         // Object.values(sheet.cssRules).forEach((rule) => console.info(rule.cssText))
        //         resource_styles = Object.values(sheet.cssRules).reduce((r, c) => `${r}${c.cssText} `, '')
        //     }
        // })
        canvas_svg.append('style')
            .attr("type", "text/css")
            .text(`${colours} ${resource_styles} text{font-weight: normal; font-size: 10pt}`);
    }
}

class OkitCompartmentArtefactView extends OkitArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent() {return this.getJsonView().getResource(this.parent_id)}

    loadCustomerPremiseEquipments(select_id) {
        $(jqId(select_id)).empty();
        const cpe_select = $(jqId(select_id));
        cpe_select.append($('<option>').attr('value', '').text(''));
        for (const cpe of this.getOkitJson().getCustomerPremiseEquipments()) {
            cpe_select.append($('<option>').attr('value', cpe.id).text(cpe.display_name));
        }
    }

    loadNetworkSecurityGroups(select_id, subnet_id) {
        $(jqId(select_id)).empty();
        let multi_select = d3.select(d3Id(select_id));
        if (subnet_id && subnet_id !== '') {
            if (this.getOkitJson().getSubnet(subnet_id) != undefined) {
                let vcn = this.getOkitJson().getVirtualCloudNetwork(this.getOkitJson().getSubnet(subnet_id).vcn_id);
                for (let networkSecurityGroup of this.getOkitJson().getNetworkSecurityGroups()) {
                    if (networkSecurityGroup.vcn_id === vcn.id) {
                        let div = multi_select.append('div');
                        div.append('input')
                            .attr('type', 'checkbox')
                            .attr('id', safeId(networkSecurityGroup.id))
                            .attr('value', networkSecurityGroup.id);
                        div.append('label')
                            .attr('for', safeId(networkSecurityGroup.id))
                            .text(networkSecurityGroup.display_name);
                    }
                }
            }
        }
    }

    loadLoadBalancerShapes(select_id) {
        $(jqId(select_id)).empty();
        const lb_select = $(jqId(select_id));
        for (let shape of okitOciData.getLoadBalancerShapes()) {
            lb_select.append($('<option>').attr('value', shape.name).text(titleCase(shape.name)));
        }
    }
}

class OkitContainerCompartmentArtefactView extends OkitContainerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent() {return this.getJsonView().getResource(this.parent_id)}
}

okitViewClasses.push(OkitCompartmentJsonView);

$(document).ready(function() {
    okitJsonView = OkitCompartmentJsonView.newView(okitJsonModel, okitOciData, resource_icons);
});
