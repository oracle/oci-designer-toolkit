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

import { OkitResource } from '../resources/okit_resource.js'
import { OkitData } from '../data/okit.js'
import * as okit_resources from '../resources/resources.js'

class OkitView {
    static draw_hierarchy = [
        'region',
        'compartment', 
        'vcn', 
        'volume',
        'bucket',
        'cpe',
        'ipsec_connection',
        'remote_peering_connection',
        'internet_gateway',
        'nat_gateway',
        'service_gateway',
        'drg',
        'local_peering_gateway',
        'route_table',
        'security_list',
        'network_security_group',
        'subnet', 
        'cluster',
        'file_system',
        'instance', 
        'database',
        'mysql_db_system',
        'autonomous_database',
        'instance_pool',
        'load_balancer',
    ]

    constructor(okit_data=null, document=null, canvas_id=null, region=undefined, add_events=true, show_label='none', hide_attached=true, grid=false) {
        this.okit_data = okit_data
        this.document = document
        this.canvas_id = canvas_id
        this.canvas_svg_id = 'okit-canvas-svg'
        this.region = String(region)
        this.add_events = add_events
        this.show_label = show_label
        this.hide_attached = hide_attached
        this.grid = grid
        this.load(this.okit_data)
    }

    get coords() {return this.okit_data.okit.coords}
    get svg() {return this.okit_data.okit.svg}
    get canvas_rect_id() {return `${this.canvas_svg_id}-rect`}

    clear() {
        this.views = {}
    }

    load(okit_data) {
        this.clear()
        if (okit_data) this.okit_data = okit_data
        if (this.okit_data) {
            this.resources = {}
            // for (const [key, value] of Object.entries({...this.okit_data.okit.region.cross_region.resources, ...this.okit_data.okit.region[this.region].resources})) {
            for (const [key, value] of Object.entries(this.all_data_resources)) {
                this.resources[key] = []
                // const resourceName = `${key.charAt(0).toUpperCase()}${key.substring(1).toLowerCase()}`
                // const resourceName = `${key.split('_').map(k => k.charAt(0).toUpperCase()+k.substring(1).toLowerCase()).join('')}`
                const resourceName = this.resourceNameFromKey(key)
                // console.info('Resource Name:', key, resourceName)
                this.resources[key] = Array.from(value, r => new okit_resources[resourceName](r, this))
              }
        }
        if (this.okit_data.okit.coords === undefined) this.okit_data.okit.coords = {}
    }

    new(width=2560, height=1600) {
        const canvas = this.document.getElementById(this.canvas_id)
        // Clear
        if (canvas.lastChild) canvas.removeChild(canvas.lastChild)
        // Create
        const svg = this.document.createElement('svg')
        svg.setAttribute('id', this.canvas_svg_id)
        svg.setAttribute('x', 0)
        svg.setAttribute('y', 0)
        svg.setAttribute('width', width)
        svg.setAttribute('height', height)
        svg.setAttributeNS(null, 'viewBox', `0 0 ${width} ${height}`)
        svg.setAttributeNS(null, 'preserveAspectRatio', 'xMinYMin meet')
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        // Style
        const style = this.styleCanvas(svg)
        // Definitions
        const defs = this.addDefinitions(svg)
        // Add Resource Icon Definitions
        this.addResourceIcons(defs)
        // Rectagle Border
        const rect = this.document.createElement('rect')
        rect.setAttribute('id', this.canvas_rect_id)
        rect.setAttribute('width', '100%')
        rect.setAttribute('height', '100%')
        rect.setAttribute('fill', this.background_colour)
        svg.appendChild(rect)
        // Add Grid
        if (this.grid) this.addGrid(svg)
        // Add 
        canvas.appendChild(svg)
    }

    styleCanvas(svg) {
        const colours = Object.entries(this.stroke_colours).map(([k,v])=>`.${k} {fill: ${v}}`).join(' ')
        const font = 'text{font-weight: normal; font-size: 10pt}'
        const style = this.document.createElement('style')
        style.setAttribute('type', 'text/css')
        style.appendChild(this.document.createTextNode(`${colours} ${font}`))
        // Add to SVG
        svg.appendChild(style)
        return style
    }

    addDefinitions(svg) {
        const defs = this.document.createElement('defs')
        // Add Connector Markers
        // Pointer
        let marker = this.document.createElement('marker')
        marker.setAttribute('id', 'connector-end-triangle')
        marker.setAttributeNS(null, 'viewBox', '0 0 100 100')
        marker.setAttributeNS(null, 'refX', '1')
        marker.setAttributeNS(null, 'refY', '5')
        marker.setAttributeNS(null, 'markerUnits', 'strokeWidth')
        marker.setAttributeNS(null, 'markerWidth', '35')
        marker.setAttributeNS(null, 'markerHeight', '35')
        marker.setAttribute('orient', 'auto');
        let path = this.document.createElement('path')
        path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z')
        path.setAttribute('fill', this.connector_colour);
        marker.appendChild(path)
        defs.appendChild(marker)
        // Circle
        marker = this.document.createElement('marker')
        marker.setAttribute('id', 'connector-end-circle')
        marker.setAttributeNS(null, 'viewBox', '0 0 100 100')
        marker.setAttributeNS(null, 'refX', '5')
        marker.setAttributeNS(null, 'refY', '5')
        marker.setAttributeNS(null, 'markerUnits', 'strokeWidth')
        marker.setAttributeNS(null, 'markerWidth', '35')
        marker.setAttributeNS(null, 'markerHeight', '35')
        marker.setAttribute('orient', 'auto');
        let circle = this.document.createElement('circle')
        circle.setAttribute('cx', '5')
        circle.setAttribute('cy', '5')
        circle.setAttribute('r', '5')
        circle.setAttribute('fill', this.connector_colour);
        marker.appendChild(circle)
        defs.appendChild(marker)
        // Grid
        let pattern = this.document.createElement('pattern')
        pattern.setAttribute('id', 'small-grid')
        pattern.setAttribute('width', this.small_grid_size)
        pattern.setAttribute('height', this.small_grid_size)
        pattern.setAttributeNS(null, 'patternUnits', 'userSpaceOnUse');
        path = this.document.createElement('path')
        path.setAttribute('d', 'M '+ this.small_grid_size + ' 0 L 0 0 0 ' + this.small_grid_size)
        path.setAttribute('fill', 'none')
        path.setAttribute('stroke', 'gray')
        path.setAttribute('stroke-width', '0.5');
        pattern.appendChild(path)
        defs.appendChild(pattern)
        pattern = this.document.createElement('pattern')
        pattern.setAttribute('id', 'grid')
        pattern.setAttribute('width', this.grid_size)
        pattern.setAttribute('height', this.grid_size)
        pattern.setAttributeNS(null, 'patternUnits', 'userSpaceOnUse');
        let rect = this.document.createElement('rect')
        rect.setAttribute('width', this.grid_size)
        rect.setAttribute('height', this.grid_size)
        rect.setAttribute('fill', 'url(#small-grid)');
        path = this.document.createElement('path')
        path.setAttribute('d', 'M ' + this.grid_size + ' 0 L 0 0 0 ' + this.grid_size)
        path.setAttribute('fill', 'none')
        path.setAttribute('stroke', 'darkgray')
        path.setAttribute('stroke-width', '1');
        pattern.appendChild(rect)
        pattern.appendChild(path)
        defs.appendChild(pattern)
        // Add to SVG
        svg.appendChild(defs)
        return defs
    }

    addResourceIcons(defs) {
        const template = this.document.createElement('template')
        // Object.keys(this.okit_data.okit.resources).forEach((key) => {
        Object.keys(this.all_data_resources).forEach((key) => {
            const resourceName = this.resourceNameFromKey(key)
            const def = this.document.createElement('g')
            def.setAttribute('id', `${key.replaceAll('_', '')}-svg`)
            def.setAttribute('transform', 'translate(-1, -1) scale(0.29, 0.29)')
            template.innerHTML = okit_resources[resourceName].svg.trim()
            const g = template.content.querySelector('g')
            g.removeAttribute('transform')
            def.appendChild(g)
            // Add
            defs.appendChild(def)
        })
        template.remove()
        return defs
    }

    addGrid(svg) {
        const rect = this.document.createElement('rect')
        rect.setAttribute('width', '100%')
        rect.setAttribute('height', '100%')
        rect.setAttribute('fill', 'url(#grid)')
        svg.appendChild(rect)
    }

    draw(okit_data=null) {
        if (okit_data) this.load(okit_data)
        this.new()
        // Main Icon / Containers
        this.constructor.draw_hierarchy.forEach(key => {if (key in this.resources) this.resources[key].forEach(resource => resource.draw(this.document))})
        // Draw Connectors
        this.constructor.draw_hierarchy.forEach(key => {if (key in this.resources) this.resources[key].forEach(resource => resource.drawConnectors(this.document))})
    }

    getResource(id) {return this.all_resources.find(resource => resource.id === id)}

    resourceNameFromKey(key) {
        return `${key.split('_').map(k => k.charAt(0).toUpperCase()+k.substring(1).toLowerCase()).join('')}`
    }

    // Function Getters
    get all_data_resources() {return {...this.okit_data.okit.region.cross_region.resources, ...this.okit_data.okit.region[this.region].resources}}
    get all_resources() {return this.resources ? [].concat(...Object.values(this.resources)) : []}
    get small_grid_size() {return 8;}
    get grid_size() {return this.small_grid_size * 10;}
    get stroke_colours() {
        return {
            red: '#F80000',
            bark: '#312D2A',
            gray: '#5f5f5f',
            blue: '#0066cc',
            orange: '#ff6600',
            purple: '#400080',
            icon_colour_01: '#312D2A',
            icon_colour_02: '#ff6600',
            icon_colour_03: '#0066cc',
            icon_colour_04: '#400080',
            icon_colour_04: '#5f5f5f',
        };
    }
    get background_colour() {return '#ffffff'}
    get connector_colour() {return '#5f5f5f'}
    get svg_highlight_colour() {return '#00cc00';}

}

export { OkitView }
