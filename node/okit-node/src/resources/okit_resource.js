'use babel'
/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

/*
** Author: Andrew Hopkinson
*/

class OkitResource {
    static get svg() {return `
    <?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Compartments" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 161.9 162" enable-background="new 0 0 161.9 162" xml:space="preserve">
        ${this.def}
    </svg>
    `}

    // -- Child Positioning
    top_edge_children = []
    top_children = []
    container_children = []
    bottom_children = []
    bottom_edge_children = []
    left_edge_children = []
    left_children = []
    right_children = []
    right_edge_children = []

    constructor(json, view=undefined) {
        this.json = json
        this.view = view
        this.collapsed = true
        if (this.json) {
            for (const key of Object.keys(this.json).filter(k => k !== 'display_name' && k !== 'name')) {
                Object.defineProperty(this, key, {get: () => {return this.json[key]}, set: (val) => {this.json[key] = val}, enumerable: false, configurable: false})
            }
        }
        // Override display_name / name properties
        Object.defineProperty(this, 'display_name', {get: () => {return this.json.display_name ? this.json.display_name : this.json.name}, set: (val) => {this.json.display_name = val; this.json.name = val}, enumerable: true})
        Object.defineProperty(this, 'name', {get: () => {return this.display_name}, set: (val) => {this.display_name = val}, enumerable: true})
    }

    get parent_id() {return this.json.compartment_id}
    get parent() {return this.view ? this.view.all_resources.find(resource => resource.id === this.parent_id) : undefined}
    get parent_hierarchy() {return this.parent ? [this.parent_id, ...this.parent.parent_hierarchy] : [this.id]}
    get children() {return this.view ? this.view.all_resources.filter(child => child.parent_id === this.json.id) : []}

    draw(document) {
        if (document) {
            this.document = document
            const svg = this.drawSvg(document)
            this.drawRect(svg, document)
            this.drawText(svg, this.svg_name_text, document)
            this.drawText(svg, this.svg_type_text, document)
            this.drawText(svg, this.svg_info_text, document)
            this.drawText(svg, this.svg_label_text, document)
            this.drawTitle(svg, document)
            this.drawIcon(svg, document)
            // console.info(this.parent_id, this.parent)
            const canvas = document.getElementById(this.parent ? this.parent.svg_id : this.view.canvas_svg_id)
            canvas.appendChild(svg)
        }
    }

    drawSvg(document) {
        const definition = this.view.coords[this.json.id] ? this.view.coords[this.json.id] : this.svg_definition
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('id', definition.id)
        svg.setAttribute('x', definition.x)
        svg.setAttribute('y', definition.y)
        svg.setAttribute('width', definition.width)
        svg.setAttribute('height', definition.height)
        svg.setAttributeNS(null, 'viewBox', definition.viewbox)
        svg.setAttributeNS(null, 'preserveAspectRatio', 'xMinYMax meet')
        // Custom Attributes
        svg.setAttribute('data-okit-resource', this.constructor.name.toLowerCase())
        svg.setAttribute('data-parent-id', this.parent_id)
        svg.setAttribute('data-display-name', this.display_name)
        // Save Coords
        if (this.view.coords[this.json.id] === undefined) this.view.coords[this.json.id] = definition

        return svg
    }

    drawRect(svg, document) {
        const definition = this.rect_definition
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('id', definition.id)
        rect.setAttribute('x', definition.x)
        rect.setAttribute('y', definition.y)
        rect.setAttribute('rx', definition.rx)
        rect.setAttribute('ry', definition.ry)
        rect.setAttribute('width', definition.width)
        rect.setAttribute('height', definition.height)
        rect.setAttribute('fill', definition.fill)
        rect.setAttribute('style', definition.style)
        rect.setAttribute('stroke', definition.stroke_colour)
        rect.setAttribute('stroke-width', definition.stroke_width)
        rect.setAttribute('stroke-opacity', definition.stroke_opacity)
        rect.setAttribute('stroke-dasharray', definition.stroke_dasharray)
        svg.appendChild(rect)

        return rect
    }

    drawIcon(svg, document) {
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        icon.setAttribute('style', 'pointer-events: bounding-box')
        const use = document.createElement('use')
        use.setAttribute('xlink:href',`#${this.icon_definition_id}`)
        use.setAttribute('transform', this.icon_transform)
        icon.appendChild(use)
        svg.appendChild(icon)

        return icon
    }

    drawText(svg, svg_text, document) {
        if (svg_text.show) {
            const rect = this.rect_definition
            let text_anchor = 'start'
            let dx = 10
            let dy = 10
            // Horizontal Positioning
            if (svg_text.h_align === 'middle' || svg_text.h_align === 'centre' || svg_text.h_align === 'center') {
                dx = Math.round(this.svg_width / 2)
                text_anchor = 'middle'
            } else if (svg_text.h_align === 'end' || svg_text.h_align === 'right') {
                dx = this.svg_width - 10
                text_anchor = 'end'
                if (!this.collapsed) {dx -= rect.x}
            } else {
                dx = 10
                text_anchor = 'start'
                if (!this.collapsed) {dx += rect.x}
            }
            // Vertical Positioning
            if (svg_text.v_align === 'middle' || svg_text.v_align === 'centre' || svg_text.v_align === 'center') {
                dy = Math.round(this.svg_height / 2)
            } else if (svg_text.v_align === 'end' || svg_text.v_align === 'bottom') {
                dy = this.svg_height - 10
                if (!this.collapsed) {dy -= rect.y}
            } else {
                dy = 10
                if (!this.collapsed) {dy += rect.y + this.icon_height / 2}
            }
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            text.setAttribute('class', 'svg-text')
            text.setAttribute('id', `${this.id}-${svg_text.suffix}`)
            text.setAttribute('x', dx)
            text.setAttribute('y', dy)
            text.setAttribute('text-anchor', text_anchor)
            text.setAttribute('vector-effects', 'non-scaling-size')
            text.textContent = svg_text.text
            svg.appendChild(text)
        }
    }

    drawTitle(svg, document) {
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
        title.setAttribute('id', `${this.id}-title`)
        title.title = this.title
        svg.appendChild(title)
    }

    drawConnectors(document) {
        if (!this.parent || !this.parent.collapsed) {
            const svg = document.getElementById(this.view.canvas_svg_id)
            const rect = document.getElementById(this.view.canvas_rect_id)
            this.connections.forEach(resource => this.drawConnector(svg, rect, resource, document))
        }
    }

    drawConnector(svg, rect, destination, document) {
        const svg_start = svg.createSVGPoint
        const svg_end = svg.createSVGPoint
        const ctm = rect.createScreenCTM
        const start_offset = this.canvas_offset
        const end_offset = destination.parent.collapsed ? destination.parent.canvas_offset : destination.canvas_offset
        let start_point = {
            x: start_offset.left + start_offset.width / 2,
            y: start_offset.top + start_offset.height / 2,
            edge: 'bottom'
        }
        let end_point = {
            x: end_offset.left + end_offset.width / 2,
            y: end_offset.top + end_offset.height / 2,
            edge: 'top'
        }
        // Calculate Start Pont Edge
        if (this.is_top_edge_resource && destination.parent_hierarchy.includes(this.parent_id)) start_point.edge = 'bottom'
        else if (this.is_top_edge_resource && !destination.parent_hierarchy.includes(this.parent_id)) start_point.edge = 'top'
        else if (this.is_top_resource && end_point.y > start_point.y) start_point.edge = 'bottom'
        else if (this.is_top_resource && end_point.y < start_point.y) start_point.edge = 'top'
        else if (this.is_bottom_resource && end_point.y < start_point.y) start_point.edge = 'top'
        else if (this.is_bottom_resource && end_point.y > start_point.y) start_point.edge = 'bottom'
        else if (this.is_bottom_edge_resource && destination.parent_hierarchy.includes(this.parent_id)) start_point.edge = 'top'
        else if (this.is_bottom_edge_resource && !destination.parent_hierarchy.includes(this.parent_id)) start_point.edge = 'bottom'
        else if (this.is_left_edge_resource && destination.parent_hierarchy.includes(this.parent_id)) start_point.edge = 'right'
        else if (this.is_left_edge_resource && !destination.parent_hierarchy.includes(this.parent_id)) start_point.edge = 'left'
        else if (this.is_left_resource && end_point.x > start_point.x) start_point.edge = 'right'
        else if (this.is_left_resource && end_point.x < start_point.x) start_point.edge = 'left'
        else if (this.is_right_resource && end_point.x < start_point.x) start_point.edge = 'left'
        else if (this.is_right_resource && end_point.x > start_point.x) start_point.edge = 'right'
        else if (this.is_right_edge_resource && destination.parent_hierarchy.includes(this.parent_id)) start_point.edge = 'left'
        else if (this.is_right_edge_resource && !destination.parent_hierarchy.includes(this.parent_id)) start_point.edge = 'right'
        else if (end_point.x < start_point.x) start_point.edge = 'left'
        // Calculate Start Adjustment
        let start_adj = {dx: 0, dy: 0}
        let end_adj = {dx: 0, dy: 0}
        if (start_point.edge === 'top') start_adj = {dx: 0, dy: -(start_offset.height/2)}
        else if (start_point.edge === 'bottom') start_adj = {dx: 0, dy: (start_offset.height/2)}
        else if (start_point.edge === 'left') start_adj = {dx: -(start_offset.width/2), dy: 0}
        else if (start_point.edge === 'right') start_adj = {dx: (start_offset.width/2), dy: 0}
        else if (end_point.y > start_point.y) start_adj = {dx: 0, dy: (start_offset.height/2)}
        else if (end_point.y < start_point.y) start_adj = {dx: 0, dy: -(start_offset.height/2)}
        else if (end_point.x > start_point.x) start_adj = {dx: (start_offset.width/2), dy: 0}
        else if (end_point.x < start_point.x) start_adj = {dx: -(start_offset.width/2), dy: 0}

        // Calculate End Pont Edge
        if (destination.is_top_edge_resource && this.parent_hierarchy.includes(destination.parent_id)) end_point.edge = 'bottom'
        else if (destination.is_top_edge_resource && !this.parent_hierarchy.includes(destination.parent_id)) end_point.edge = 'top'
        else if (destination.is_top_resource && end_point.y < start_point.y) end_point.edge = 'bottom'
        else if (destination.is_top_resource && end_point.y > start_point.y) end_point.edge = 'top'
        else if (destination.is_bottom_resource && end_point.y > start_point.y) end_point.edge = 'top'
        else if (destination.is_bottom_resource && end_point.y < start_point.y) end_point.edge = 'bottom'
        else if (destination.is_bottom_edge_resource && this.parent_hierarchy.includes(destination.parent_id)) end_point.edge = 'top'
        else if (destination.is_bottom_edge_resource && !this.parent_hierarchy.includes(destination.parent_id)) end_point.edge = 'bottom'
        else if (destination.is_left_edge_resource && this.parent_hierarchy.includes(destination.parent_id)) end_point.edge = 'right'
        else if (destination.is_left_edge_resource && !this.parent_hierarchy.includes(destination.parent_id)) end_point.edge = 'left'
        else if (destination.is_left_resource && end_point.x < start_point.x) end_point.edge = 'right'
        else if (destination.is_left_resource && end_point.x > start_point.x) end_point.edge = 'left'
        else if (destination.is_right_resource && end_point.x > start_point.x) end_point.edge = 'left'
        else if (destination.is_right_resource && end_point.x < start_point.x) end_point.edge = 'right'
        else if (destination.is_right_edge_resource && this.parent_hierarchy.includes(destination.parent_id)) end_point.edge = 'left'
        else if (destination.is_right_edge_resource && !this.parent_hierarchy.includes(destination.parent_id)) end_point.edge = 'right'
        else if (end_point.x < start_point.x) end_point.edge = 'left'
        // Calculate End Adjustment
        if (end_point.edge === 'top') end_adj = {dx: 0, dy: -(end_offset.height/2)}
        else if (end_point.edge === 'bottom') end_adj = {dx: 0, dy: (end_offset.height/2)}
        else if (end_point.edge === 'left') end_adj = {dx: -(end_offset.width/2), dy: 0}
        else if (end_point.edge === 'right') end_adj = {dx: (end_offset.width/2), dy: 0}
        else if (end_point.y > start_point.y) end_adj = {dx: 0, dy: (end_offset.height/2)}
        else if (end_point.y < start_point.y) end_adj = {dx: 0, dy: -(end_offset.height/2)}
        else if (end_point.x > start_point.x) end_adj = {dx: (end_offset.width/2), dy: 0}
        else if (end_point.x < start_point.x) end_adj = {dx: -(end_offset.width/2), dy: 0}
        // Adjust Start & End Point
        start_point.x += start_adj.dx
        start_point.y += start_adj.dy
        end_point.x += end_adj.dx
        end_point.y += end_adj.dy
        // Create Connector Path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('id', this.generateConnectorId(this.id, destination.id))
        path.setAttribute('d', this.getPathPoints(start_point, end_point).join(' '))
        path.setAttribute('stroke-width', '2')
        path.setAttribute('stroke', this.connector_colour)
        path.setAttribute('fill', 'none')
        path.setAttribute('marker-start', 'url(#connector-end-circle)')
        path.setAttribute('marker-end', 'url(#connector-end-circle)')
        svg.appendChild(path)
    }

    getPathPoints(start_point, end_point) {
        // Points
        let first_point = {x: start_point.x, y: start_point.y}
        let last_point = {x: end_point.x, y: end_point.y}
        // Check first point
        if (start_point.edge === 'left') first_point.x = start_point.x - this.connector_dx
        else if (start_point.edge === 'top') first_point.y = start_point.y - this.connector_dy
        else if (start_point.edge === 'right') first_point.x = start_point.x + this.connector_dx
        else if (start_point.edge === 'bottom') first_point.y = start_point.y + this.connector_dy
        // Check last point
        if (end_point.edge === 'left') last_point.x = end_point.x - this.connector_dx
        else if (end_point.edge === 'top') last_point.y = end_point.y - this.connector_dy
        else if (end_point.edge === 'right') last_point.x = end_point.x + this.connector_dx
        else if (end_point.edge === 'bottom') last_point.y = end_point.y + this.connector_dy
        // Calculate Mid Point
        let mid_point = {x: 0, y:0}
        if ((start_point.edge === 'left' || start_point.edge === 'right') && first_point.y < last_point.y && first_point.x > last_point.x) mid_point = {x: first_point.x, y: last_point.y}
        else if ((start_point.edge === 'left' || start_point.edge === 'right') && first_point.y < last_point.y && first_point.x < last_point.x) mid_point = {x: last_point.x, y: first_point.y}
        else if ((start_point.edge === 'left' || start_point.edge === 'right') && first_point.y < last_point.y && first_point.x === last_point.x) mid_point = {x: last_point.x, y: first_point.y}
        else if ((start_point.edge === 'left' || start_point.edge === 'right') && first_point.y > last_point.y && first_point.x > last_point.x) mid_point = {x: first_point.x, y: last_point.y}
        else if ((start_point.edge === 'left' || start_point.edge === 'right') && first_point.y > last_point.y && first_point.x < last_point.x) mid_point = {x: last_point.x, y: first_point.y}
        else if ((start_point.edge === 'left' || start_point.edge === 'right') && first_point.y > last_point.y && first_point.x === last_point.x) mid_point = {x: last_point.x, y: first_point.y}

        else if ((start_point.edge === 'top' || start_point.edge === 'bottom') && first_point.y < last_point.y && first_point.x < last_point.x) mid_point = {x: last_point.x, y: first_point.y}
        else if ((start_point.edge === 'top' || start_point.edge === 'bottom') && first_point.y < last_point.y && first_point.x > last_point.x) mid_point = {x: last_point.x, y: first_point.y}
        else if ((start_point.edge === 'top' || start_point.edge === 'bottom') && first_point.y < last_point.y && first_point.x === last_point.x) mid_point = {x: last_point.x, y: first_point.y}
        else if ((start_point.edge === 'top' || start_point.edge === 'bottom') && first_point.y > last_point.y && first_point.x < last_point.x) mid_point = {x: last_point.x, y: first_point.y}
        else if ((start_point.edge === 'top' || start_point.edge === 'bottom') && first_point.y > last_point.y && first_point.x > last_point.x) mid_point = {x: last_point.x, y: first_point.y}
        else if ((start_point.edge === 'top' || start_point.edge === 'bottom') && first_point.y > last_point.y && first_point.x === last_point.x) mid_point = {x: last_point.x, y: first_point.y}
        // Build Line Points Array
        // -- Start Point x,y
        let points = ['m', start_point.x, start_point.y]
        // First Point
        points = points.concat(['l', first_point.x - start_point.x, first_point.y - start_point.y])
        // Mid Point
        points = points.concat(['l', mid_point.x - first_point.x, mid_point.y - first_point.y])
        // Last Point
        points = points.concat(['l', last_point.x - mid_point.x, last_point.y - mid_point.y])
        // -- End Point x,y
        points = points.concat(['l', end_point.x - last_point.x, end_point.y - last_point.y])
        return points
    }

    generateArc(radius, clockwise, xmod, ymod) {return `a${radius},${radius} 0 0 ${clockwise} ${xmod}${radius},${ymod}${radius}`}
    
    coordString(coord) {return `${coord['x']},${coord['y']}`}

    generateConnectorId(sourceid, destinationid) {return `${sourceid}-${destinationid}`}

    // Function Getters
    // -- SVG
    // get container_hierarchy() {return this.children.filter(r => r instanceof OkitContainerResource).length > 0 ? [this, ...[].concat(...this.children.filter(r => r instanceof OkitContainerResource).map(r => r.container_hierarchy))].map(r => r ? r.id : undefined) : [this]}
    get connections() {return []}
    get canvas_offset_x() {return this.svg_definition.x + (this.parent ? this.parent.canvas_offset_x : 0)}
    get canvas_offset_y() {return this.svg_definition.y + (this.parent ? this.parent.canvas_offset_y : 0)}
    get canvas_offset() {
        const left = this.canvas_offset_x
        const top = this.canvas_offset_y
        const height = this.svg_definition.height
        const width = this.svg_definition.width
        return {left: left, top: top, height: height, width: width, right: left + width, bottom: top + height, x: left, y: top}
    }
    get coords() {return this.view.coords[this.json.id]}
    set coords(coords) {this.view.coords[this.json.id] = coords}
    // --- Connectors
    get corner_radius() {return 0}
    get path_connector() {return true}
    get connector_colour() {return '#5f5f5f'}
    // -- Search Safe Id
    get safe_id() {return this.json.id.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" )}
    // -- Dimensions
    get icon_dimensions() {return {width: 45, height: 45}}
    get collapsed_dimensions() {return this.icon_dimensions}
    get minimum_dimensions() {return {width: this.icon_width, height: this.icon_height}}
    get dimensions() {return this.collapsed ? this.collapsed_dimensions : this.minimum_dimensions}
    // -- Definitions
    get stroke_colours() {
        return {
            red: '#F80000',
            bark: '#312D2A',
            gray: '#5f5f5f',
            blue: '#0066cc',
            orange: '#ff6600',
            purple: '#400080',
            icon_colour_01: '#F80000',
            icon_colour_02: '#5f5f5f',
            icon_colour_03: '#ff6600',
        }
    }
    // --- icon
    get icon_definition_id() {return `${this.constructor.name.toLowerCase()}-svg`}
    get icon_height() {return 45}
    get icon_width() {return 45}
    get icon_x_tranlation() {return 0}
    get icon_y_tranlation() {return 0}
    get icon_v_align() {return 'top'}
    get icon_h_align() {return 'middle'}
    get icon_transform() {
        let dx = 0
        let dy = 0
        // Horizontal
        if (this.icon_h_align === 'middle' || this.icon_h_align === 'center' || this.icon_h_align === 'centre') {
            dx = this.svg_width/2 - this.icon_width/2
        } else if (this.icon_h_align === 'end' || this.icon_h_align === 'right') {
            dx = this.svg_width - this.icon_width
        }
        // Vertical
        if (this.icon_v_align === 'middle' || this.icon_v_align === 'center' || this.icon_v_align === 'centre') {
            dy = this.svg_height/2 - this.icon_height/2
        } else if (this.icon_v_align === 'end' || this.icon_v_align === 'bottom') {
            dy = this.svg_height - this.icon_height
        }
        return `translate(${dx}, ${dy})`
    }
    // --- svg
    get svg_id() {return `${this.json.id}-svg`}
    get svg_x() {return this.parent ? this.parent.getChildOffest(this).dx : 0}
    get svg_y() {return this.parent ? this.parent.getChildOffest(this).dy : 0}
    get svg_width() {return this.collapsed ? this.collapsed_dimensions.width : this.dimensions.width}
    get svg_height() {return this.collapsed ? this.collapsed_dimensions.height : this.dimensions.height}
    get svg_definition() {
        return this.view.coords[this.json.id] ? this.view.coords[this.json.id] : {
            id: this.svg_id,
            x: this.svg_x,
            y: this.svg_y,
            width: this.svg_width,
            height: this.svg_height,
            viewbox: this.viewbox
        }
    }
    // ---- ViewBox
    get viewbox_x() {return 0}
    get viewbox_y() {return 0}
    get viewbox_height() {return this.svg_height}
    get viewbox_width() {return this.svg_width}
    get viewbox() {return `${this.viewbox_x} ${this.viewbox_y} ${this.viewbox_width} ${this.viewbox_height}`}
    // --- rect
    get rect_id() {return `${this.json.id}`}
    get rect_x() {return 0}
    get rect_y() {return 0}
    get rect_rx() {return 0}
    get rect_ry() {return 0}
    get rect_height() {return this.svg_height}
    get rect_width() {return this.svg_width}
    get rect_height_adjust() {return 0}
    get rect_width_adjust() {return 0}
    get rect_fill() {return 'white'}
    get rect_fill_style() {return 'fill-opacity: .25'}
    get rect_stroke_colour() {return this.stroke_colours.bark}
    get rect_stroke_width() {return 1}
    get rect_stroke_dash() {return 2}
    get rect_stroke_space() {return 1}
    get rect_stroke_dasharray() {return `${this.rect_stroke_dash}, ${this.rect_stroke_space}`}
    get rect_stroke_opacity() {return 0}
    get rect_definition() {
        let rect_x = this.rect_x
        let rect_y = this.rect_y
        let rect_width = this.rect_width + this.rect_width_adjust
        let rect_height = this.rect_height + this.rect_height_adjust
        if (this.icon_y_tranlation < 0) {
            rect_y = Math.abs(this.icon_y_tranlation)
            rect_height -= rect_y * 2
        }
        if (this.icon_x_tranlation < 0) {
            rect_x = Math.abs(this.icon_x_tranlation)
            rect_width -= rect_x * 2
        }
        return {
            id: this.rect_id,
            x: rect_x,
            y: rect_y,
            rx: this.rect_rx,
            ry: this.rect_ry,
            width: rect_width,
            height: rect_height,
            fill: this.rect_fill,
            style: this.rect_fill_style,
            stroke_colour: this.rect_stroke_colour,
            stroke_width: this.rect_stroke_width,
            stroke_opacity: this.rect_stroke_opacity,
            stroke_dasharray: this.rect_stroke_dasharray
        }
    }
    // --- Positional
    get width_multiplier() {return this.show_label ? this.settings.show_label === 'name' ? 1.5 : 2 : 1}
    get height_multiplier() {return this.show_label ?  1.5 : 1}
    // ---- Padding
    get padding_dx() {return 0}
    get padding_dy() {return 0}
    get padding() {return {dx: this.padding_dx, dy: this.padding_dy}}
    get padding_top() {return 0}
    get padding_right() {return 0}
    get padding_bottom() {return 0}
    get padding_left() {return 0}
    // ---- Spacing
    get spacing_dx() {return 0}
    get spacing_dy() {return 0}
    get spacing() {return {dx: this.spacing_dx, dy: this.spacing_dy}}
     // ---- Connector
     get connector_dx() {return 10}
     get connector_dy() {return 10}
    // ---- Text
    get svg_name_text() {return {show: this.show_name, v_align: this.name_v_align, h_align: this.name_h_align, text: this.name_text, suffix: 'display-name'}}
    get svg_type_text() {return {show: this.show_type, v_align: this.type_v_align, h_align: this.type_h_align, text: this.type_text, suffix: 'type-name'}}
    get svg_info_text() {return {show: this.show_info, v_align: this.info_v_align, h_align: this.info_h_align, text: this.info_text, suffix: 'info'}}
    get svg_label_text() {return {show: this.show_label, v_align: this.label_v_align, h_align: this.label_h_align, text: this.label_text, suffix: 'label'}}
    // ----- Name
    get show_name() {return false}
    get name_v_align() {return 'top'}
    get name_h_align() {return 'start'}
    get name_text() {return this.display_name}
    // ----- Type
    get show_type() {return false}
    get type_v_align() {return 'bottom'}
    get type_h_align() {return 'start'}
    get type_text() {return this.constructor.name}
    // ----- Info
    get show_info() {return false}
    get info_v_align() {return 'bottom'}
    get info_h_align() {return 'end'}
    get info_text() {return ''}
    // ----- Label
    get show_label() {return this.view && this.view.show_label && this.view.show_label !== 'none'}
    get label_v_align() {return 'bottom'}
    get label_h_align() {return 'middle'}
    get label_text() {
        if (this.view.show_label) {
            if (this.view.show_label === 'name') {
                return this.name_text
            } else if (this.view.show_label === 'type') {
                return this.type_text
            } else {
                return ''
            }
        }
        return ''
    }
    // ----- Tooltip (title)
    get title() {
        if (this.view.tooltip_type) {
            if (this.view.tooltip_type === 'simple') {
                return this.simple_tooltip
            } else if (this.view.tooltip_type === 'definition') {
                return this.definition_tooltip
            } else if (this.view.tooltip_type === 'summary') {
                return this.summary_tooltip
            } else {
                return ''
            }
        }
        return this.display_name
    }
    get simple_tooltip() {return this.display_name}
    get definition_tooltip() {return `Name: ${this.display_name} \nDefinition: ${this.definition}`}
    get summary_tooltip() {return this.display_name}
    // ---- Connectors
    get top_bottom_connectors_preferred() {return true}

    // -- Child Offsets
    get default_offset() {return {dx: 30, dy:30}}
    // --- Top Edge
    get is_top_edge_resource() {return this.parent ? this.parent.top_edge_children.includes(this.constructor.name) : false}
    get has_top_edge_children() {return this.top_edge_children.length && this.view.all_resources.filter(r => r.parent_id === this.id && this.top_edge_children.includes(r.constructor.name)).length}
    get first_top_edge_offset() {
        return {
            dx: this.padding_left * 2,
            dy: 0
        }
    }
    get top_edge_child_offset() {
        let offset = this.first_top_edge_offset
        const children = this.document.getElementById(this.svg_id).querySelectorAll(`${this.top_edge_children.map(c => "[data-okit-resource='"+c.toLowerCase()+"']").join(',')}`)
        offset.dx += Array.from(children.values()).reduce((a, v) => a + (Number(v.getAttribute('width')) + this.spacing_dx), 0)
        return offset
    }
    // --- Top
    get is_top_resource() {return this.parent ? this.parent.top_children.includes(this.constructor.name) : false}
    get has_top_children() {return this.top_children.length && this.view.all_resources.filter(r => r.parent_id === this.id && this.top_children.includes(r.constructor.name)).length}
    get first_top_offset() {
        return {
            dx: this.has_left_children ? (this.padding_left + this.left_child_group_width + this.spacing_dx) : this.padding_left,
            dy: this.padding_top
        }
    }
    get top_child_offset() {
        let offset = this.first_top_offset
        const children = this.document.getElementById(this.svg_id).querySelectorAll(`${this.top_children.map(c => "[data-okit-resource='"+c.toLowerCase()+"']").join(',')}`)
        offset.dx += Array.from(children.values()).reduce((a, v) => a + (Number(v.getAttribute('width')) + this.spacing_dx), 0)
        return offset
    }
    // --- Container
    get has_container_children() {return this.container_children.length && this.view.all_resources.filter(r => r.parent_id === this.id && this.container_children.includes(r.constructor.name)).length}
    get first_container_offset() {
        return {
            dx: this.has_left_children ? (this.padding_left + this.left_child_group_width + this.spacing_dx) : this.padding_left,
            dy: this.has_top_children ? (this.padding_top + this.top_child_group_height + this.spacing_dy) : this.padding_top
        }
    }
    get container_child_offset() {
        let offset = this.first_container_offset
        // const children = this.document.getElementById(this.svg_id).querySelectorAll(`[data-parent-id='${this.id}'] ${this.container_children.map(c => "[data-okit-resource='"+c.toLowerCase()+"']").join(',')}`)
        const children = this.document.getElementById(this.svg_id).querySelectorAll(`${this.container_children.map(c => "[data-okit-resource='"+c.toLowerCase()+"']").join(',')}`)
        offset.dy += Array.from(children.values()).reduce((a, v) => a + (v.getAttribute('data-parent-id') === this.id ? Number(v.getAttribute('height')) + this.spacing_dy : 0), 0)
        return offset
    }
    // --- Bottom
    get is_bottom_resource() {return this.parent ? this.parent.bottom_children.includes(this.constructor.name) : false}
    get has_bottom_children() {return this.bottom_children.length && this.view.all_resources.filter(r => r.parent_id === this.id && this.bottom_children.includes(r.constructor.name)).length}
    get first_bottom_offset() {
        return {
            dx: this.has_left_children ? (this.padding_left + this.left_child_group_width + this.spacing_dx) : this.padding_left,
            dy: this.padding_top + (this.has_top_children ? this.top_child_group_height + this.spacing_dy : 0) + (this.has_container_children ? this.container_child_group_height + this.spacing_dy : 0)
        }
    }
   get bottom_child_offset() {
        let offset = this.first_bottom_offset
        const children = this.document.getElementById(this.svg_id).querySelectorAll(`${this.bottom_children.map(c => "[data-okit-resource='"+c.toLowerCase()+"']").join(',')}`)
        offset.dx += Array.from(children.values()).reduce((a, v) => a + (Number(v.getAttribute('width')) + this.spacing_dx), 0)
        return offset
    }
    // --- Bottom Edge
    get is_bottom_edge_resource() {return this.parent ? this.parent.bottom_edge_children.includes(this.constructor.name) : false}
    get has_bottom_edge_children() {return this.bottom_edge_children.length && this.view.all_resources.filter(r => r.parent_id === this.id && this.bottom_edge_children.includes(r.constructor.name)).length}
    get first_bottom_edge_offset() {
        return {
            dx: this.padding_left * 2,
            dy: this.padding_top + (this.has_top_children ? this.top_child_group_height + this.spacing_dy : 0) + (this.has_container_children ? this.container_child_group_height + this.spacing_dy : 0) + (this.has_bottom_children ? this.bottom_child_group_height + this.spacing_dy : 0) - (this.has_top_children || this.has_container_children || this.has_bottom_children ? this.spacing_dy : 0) + this.padding_bottom - this.icon_height
        }
    }
    get bottom_edge_child_offset() {
        let offset = this.first_bottom_edge_offset
        const children = this.document.getElementById(this.svg_id).querySelectorAll(`${this.bottom_edge_children.map(c => "[data-okit-resource='"+c.toLowerCase()+"']").join(',')}`)
        offset.dx += Array.from(children.values()).reduce((a, v) => a + (Number(v.getAttribute('width')) + this.spacing_dx), 0)
        return offset
    }
    // --- Left Edge
    get is_left_edge_resource() {return this.parent ? this.parent.left_edge_children.includes(this.constructor.name) : false}
    get has_left_edge_children() {return this.left_edge_children.length && this.view.all_resources.filter(r => r.parent_id === this.id && this.left_edge_children.includes(r.constructor.name)).length}
    get first_left_edge_offset() {
        return {
            dx: 0, 
            dy: this.padding_top * 2
        }
    }
    get left_edge_child_offset() {
        let offset = this.first_left_edge_offset
        const children = this.document.getElementById(this.svg_id).querySelectorAll(`${this.left_edge_children.map(c => "[data-okit-resource='"+c.toLowerCase()+"']").join(',')}`)
        offset.dy += Array.from(children.values()).reduce((a, v) => a + (Number(v.getAttribute('height')) + this.spacing_dy), 0)
        return offset
    }
    // --- Left
    get is_left_resource() {return this.parent ? this.parent.left_children.includes(this.constructor.name) : false}
    get has_left_children() {return this.left_children.length && this.view.all_resources.filter(r => r.parent_id === this.id && this.left_children.includes(r.constructor.name)).length}
    get first_left_offset() {
        return {
            dx: this.padding_left, 
            dy: this.padding_top
        }
    }
    get left_child_offset() {
        let offset = this.first_left_offset
        const children = this.document.getElementById(this.svg_id).querySelectorAll(`${this.left_children.map(c => "[data-okit-resource='"+c.toLowerCase()+"']").join(',')}`)
        offset.dy += Array.from(children.values()).reduce((a, v) => a + (Number(v.getAttribute('height')) + this.spacing_dy), 0)
        return offset
    }
    // --- Right
    get is_right_resource() {return this.parent ? this.parent.right_children.includes(this.constructor.name) : false}
    get has_right_children() {return this.right_children.length && this.view.all_resources.filter(r => r.parent_id === this.id && this.right_children.includes(r.constructor.name)).length}
    get first_right_offset() {
        return {
            dx: this.padding_left + (this.has_left_children ? this.left_child_group_width + this.spacing_dx : 0) + (this.has_container_children ? this.container_child_group_width + this.spacing_dx : 0), 
            dy: this.padding_top
        }
    }
    get right_child_offset() {
        let offset = this.first_right_offset
        const children = this.document.getElementById(this.svg_id).querySelectorAll(`${this.right_children.map(c => "[data-okit-resource='"+c.toLowerCase()+"']").join(',')}`)
        offset.dy += Array.from(children.values()).reduce((a, v) => a + (Number(v.getAttribute('height')) + this.spacing_dy), 0)
        return offset
    }
    // --- Right Edge
    get is_right_edge_resource() {return this.parent ? this.parent.right_edge_children.includes(this.constructor.name) : false}
    get has_right_edge_children() {return this.right_edge_children.length && this.view.all_resources.filter(r => r.parent_id === this.id && this.right_edge_children.includes(r.constructor.name)).length}
    get first_right_edge_offset() {
        return {
            dx: this.padding_left + (this.has_left_children ? this.left_child_group_width + this.spacing_dx : 0) + 
                Math.max((this.has_top_children ? this.top_child_group_width + this.spacing_dx : 0), (this.has_container_children ? this.container_child_group_width + this.spacing_dx : 0), (this.has_bottom_children ? this.bottom_child_group_width + this.spacing_dx : 0)) + 
                (this.has_right_children ? this.right_child_group_width + this.spacing_dx : 0) - (this.has_left_children || this.has_container_children || this.has_right_children ? this.spacing_dx : 0) + this.padding_right - this.icon_width, 
            dy: this.padding_top
        }
    }
    get right_edge_child_offset() {
        let offset = this.first_right_edge_offset
        const children = this.document.getElementById(this.svg_id).querySelectorAll(`${this.right_edge_children.map(c => "[data-okit-resource='"+c.toLowerCase()+"']").join(',')}`)
        offset.dy += Array.from(children.values()).reduce((a, v) => a + (Number(v.getAttribute('height')) + this.spacing_dy), 0)
        return offset
    }
    // -- Child Dimensions
    // --- Top Edge
    get top_edge_child_group_height() {return this.view.all_resources.filter(r => this.top_edge_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => Math.max(r.dimensions.height, a), 0)}
    get top_edge_child_group_width() {return this.view.all_resources.filter(r => this.top_edge_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => a + Math.round(r.dimensions.width + this.spacing_dx), 0)}
    get top_edge_child_dimensions() {return {height: this.top_edge_child_group_height, width: this.top_edge_child_group_width}
    }
    // --- Top
    get top_child_group_height() {return this.view.all_resources.filter(r => this.top_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => Math.max(r.dimensions.height, a), 0)}
    get top_child_group_width() {return this.view.all_resources.filter(r => this.top_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => a + Math.round(r.dimensions.width + this.spacing_dx), 0)}
    get top_child_dimensions() {return {height: this.top_child_group_height, width: this.top_child_group_width}
    }
    // --- Container
    get container_child_group_height() {return this.view.all_resources.filter(r => this.container_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => a + Math.round(r.dimensions.height + this.spacing_dy), 0)}
    get container_child_group_width() {return this.view.all_resources.filter(r => this.container_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => Math.max(r.dimensions.width, a), 0)}
    get container_child_dimensions() {return {height: this.container_child_group_height, width: this.container_child_group_width}
    }
    // --- Bottom
    get bottom_child_group_height() {return this.view.all_resources.filter(r => this.bottom_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => Math.max(r.dimensions.height, a), 0)}
    get bottom_child_group_width() {return this.view.all_resources.filter(r => this.bottom_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => a + Math.round(r.dimensions.width + this.spacing_dx), 0)}
    get bottom_child_dimensions() {return {height: this.bottom_child_group_height, width: this.bottom_child_group_width}
    }
    // --- Bottom Edge
    get bottom_edge_child_group_height() {return this.view.all_resources.filter(r => this.bottom_edge_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => Math.max(r.dimensions.height, a), 0)}
    get bottom_edge_child_group_width() {return this.view.all_resources.filter(r => this.bottom_edge_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => a + Math.round(r.dimensions.width + this.spacing_dx), 0)}
    get bottom_edge_child_dimensions() {return {height: this.bottom_edge_child_group_height, width: this.bottom_edge_child_group_width}
    }
    // --- Left Edge
    get left_edge_child_group_height() {return this.view.all_resources.filter(r => this.left_edge_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => a + Math.round(r.dimensions.height + this.spacing_dy), 0)}
    get left_edge_child_group_width() {return this.view.all_resources.filter(r => this.left_edge_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => Math.max(r.dimensions.width, a), 0)}
    get left_edge_child_dimensions() {return {height: this.left_edge_child_group_height, width: this.left_edge_child_group_width}
    }
    // --- Left
    get left_child_group_height() {return this.view.all_resources.filter(r => this.left_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => a + Math.round(r.dimensions.height + this.spacing_dy), 0)}
    get left_child_group_width() {return this.view.all_resources.filter(r => this.left_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => Math.max(r.dimensions.width, a), 0)}
    get left_child_dimensions() {return {height: this.left_child_group_height, width: this.left_child_group_width}
    }
    // --- Right
    get right_child_group_height() {return this.view.all_resources.filter(r => this.right_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => a + Math.round(r.dimensions.height + this.spacing_dy), 0)}
    get right_child_group_width() {return this.view.all_resources.filter(r => this.right_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => Math.max(r.dimensions.width, a), 0)}
    get right_child_dimensions() {return {height: this.right_child_group_height, width: this.right_child_group_width}
    }
    // --- Right Edge
    get right_edge_child_group_height() {return this.view.all_resources.filter(r => this.right_edge_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => a + Math.round(r.dimensions.height + this.spacing_dy), 0)}
    get right_edge_child_group_width() {return this.view.all_resources.filter(r => this.right_children.includes(r.constructor.name) && r.parent_id === this.id).reduce((a, r) => Math.max(r.dimensions.width, a), 0)}
    get right_edge_child_dimensions() {return {height: this.right_edge_child_group_height, width: this.right_edge_child_group_width}
    }

    // -- Child Functions
    getChildOffest(child) {
        let offset = {dx: 10, dy:10}
        // console.info('This Class Name  :', this.constructor.name, this.id)
        // console.info('Child Class Name :', child.constructor.name, child.id)
        if (this.top_edge_children.includes(child.constructor.name)) offset = this.top_edge_child_offset
        else if (this.top_children.includes(child.constructor.name)) offset = this.top_child_offset
        else if (this.container_children.includes(child.constructor.name)) offset = this.container_child_offset
        else if (this.bottom_children.includes(child.constructor.name)) offset = this.bottom_child_offset
        else if (this.bottom_edge_children.includes(child.constructor.name)) offset = this.bottom_edge_child_offset
        else if (this.left_edge_children.includes(child.constructor.name)) offset = this.left_edge_child_offset
        else if (this.left_children.includes(child.constructor.name)) offset = this.left_child_offset
        else if (this.right_children.includes(child.constructor.name)) offset = this.right_child_offset
        else if (this.right_edge_children.includes(child.constructor.name)) offset = this.right_edge_child_offset
        // console.info('================')

        return offset
    }

    // -- Search 
    safeId(id) {
        return id ? id.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" ) : id
    }
    
}

class OkitContainerResource extends OkitResource {
    constructor(json, view=undefined) {
        super(json, view)
        this.collapsed = false
        this._dimensions = {width: 0, height: 0}
    }

    drawIcon(svg, document) {
        const icon = super.drawIcon(svg, document)
        if (this.view.add_events) {
            // Add Double Click Event to toggle collapsed
            const self = this
            icon.addEventListener('dblclick', () => {
                self.collapsed = !self.collapsed
                self.recalculate_dimensions = true
                self.view.draw()
            })
        }
    }

    // Function Getters
    // -- Dimensions
    get minimum_dimensions() {//return {width: 150, height: 100}}
    // get dimensions() {
        const minimum_dimensions = {width: 150, height: 50}
        const top_edge_child_dimensions = this.top_edge_child_dimensions
        const top_child_dimensions = this.top_child_dimensions
        const container_child_dimensions = this.container_child_dimensions
        const bottom_child_dimensions = this.bottom_child_dimensions
        const bottom_edge_child_dimensions = this.bottom_edge_child_dimensions
        const left_edge_child_dimensions = this.left_edge_child_dimensions
        const left_child_dimensions = this.left_child_dimensions
        const right_child_dimensions = this.right_child_dimensions
        const right_edge_child_dimensions = this.right_edge_child_dimensions
        let dimensions = {
            height: (this.has_top_children ? this.top_child_group_height + this.spacing_dy : 0) + (this.has_container_children ? this.container_child_group_height + this.spacing_dy : 0) + (this.has_bottom_children ? this.bottom_child_group_height + this.spacing_dy : 0) - (this.has_top_children || this.has_container_children || this.has_bottom_children ? this.spacing_dy : 0),
            width: (this.has_left_children ? this.left_child_group_width + this.spacing_dx : 0) + 
                    Math.max((this.has_top_children ? this.top_child_group_width + this.spacing_dx : 0), (this.has_container_children ? this.container_child_group_width + this.spacing_dx : 0), (this.has_bottom_children ? this.bottom_child_group_width + this.spacing_dx : 0)) + 
                    (this.has_right_children ? this.right_child_group_width + this.spacing_dx : 0) - (this.has_left_children || this.has_container_children || this.has_right_children ? this.spacing_dx : 0)
        }
        // let dimensions = {height: 0, width: 0}
        dimensions.width = Math.max(dimensions.width, top_edge_child_dimensions.width, top_child_dimensions.width, bottom_child_dimensions.width, bottom_edge_child_dimensions.width, minimum_dimensions.width)
        dimensions.height = Math.max(dimensions.height, left_edge_child_dimensions.height, left_child_dimensions.height, right_child_dimensions.height, right_edge_child_dimensions.height, minimum_dimensions.height)
        // dimensions.width = Math.max(dimensions.width, top_edge_child_dimensions.width, top_child_dimensions.width, bottom_child_dimensions.width, bottom_edge_child_dimensions.width, this.minimum_dimensions.width)
        // dimensions.height = Math.max(dimensions.height, left_edge_child_dimensions.height, left_child_dimensions.height, right_child_dimensions.height, right_edge_child_dimensions.height, this.minimum_dimensions.height)
        dimensions.width += (this.padding_left + this.padding_right)
        dimensions.height += (this.padding_top + this.padding_bottom)
        // console.info('-----------------------------------------')
        // console.info(this.display_name, 'Dimension:', dimensions)
        // console.info(this.display_name, 'Top Edge Dimension    :', top_edge_child_dimensions)
        // console.info(this.display_name, 'Top Dimension         :', top_child_dimensions)
        // console.info(this.display_name, 'Container Dimension   :', container_child_dimensions)
        // console.info(this.display_name, 'Bottom Dimension      :', bottom_child_dimensions)
        // console.info(this.display_name, 'Bottom Edge Dimension :', bottom_edge_child_dimensions)
        // console.info(this.display_name, 'Left Edge Dimension   :', left_edge_child_dimensions)
        // console.info(this.display_name, 'Left Dimension        :', left_child_dimensions)
        // console.info(this.display_name, 'Right Dimension       :', right_child_dimensions)
        // console.info(this.display_name, 'Right Edge Dimension  :', right_edge_child_dimensions)
        return dimensions
    }
    // ---- Padding
    get padding_dx() {return Math.round(this.spacing_dx * 4)}
    get padding_dy() {return Math.round(this.padding_dy + this.spacing_dy * 2)}
    get padding_top() {return 60}
    get padding_right() {return 60}
    get padding_bottom() {return 60}
    get padding_left() {return 60}
    // ---- Spacing
    get spacing_dx() {return 20}
    get spacing_dy() {return 20}
    // ---- Icon
    get icon_x_tranlation() {return this.collapsed ? super.icon_x_tranlation : -20}
    get icon_y_tranlation() {return this.collapsed ? super.icon_y_tranlation : -20}
    get icon_h_align() {return this.collapsed ? super.icon_h_align : 'start'}
    // ---- Rectangle
    get rect_stroke_dash() {return this.collapsed ? super.rect_stroke_dash : 5}
    get rect_stroke_space() {return this.collapsed ? super.rect_stroke_space : 2}
    get rect_stroke_opacity() {return this.collapsed ? super.rect_stroke_opacity : 1}
    // ---- Text
    // ----- Name
    get show_name() {return this.collapsed ? super.show_name : true}
    // ----- Type
    get show_type() {return this.collapsed ? super.show_type : true}
    // ----- Info
    get show_info() {return this.collapsed ? super.show_info : true}
    // ----- Label
    get show_label() {return this.collapsed ? super.show_label : false}
}

export { OkitResource, OkitContainerResource }
