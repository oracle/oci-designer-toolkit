/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Relationship View Javascript');

// Globals 
let relationship_data = undefined
let relationship_svg = undefined
let relationship_link = undefined
let relationship_node = undefined
let relationship_nodes = undefined
let relationship_labels = undefined
let relationship_images = undefined
let relationship_simulation = undefined

class OkitRelationshipJsonView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'relationship-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
        this.included = []
        this.excluded = ['compartments']
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}
    get relationships() {
        if (this.model) {
            // Identify Resources to display
            const resources = Object.entries(this.okitjson).filter(([k, v]) => !this.excluded.includes(k) && Array.isArray(v)).reduce((a, [k, v]) => [...a, ...v], [])
            // Create Nodes
            const nodes = resources.map((resource) => {return {id: this.getSafeId(resource.id), ocid: resource.id, name: resource.display_name, type: resource.getArtifactReference()}})
            // Get Ids of displayed resources
            const ids = resources.map((resource) => resource.id)
            // Create Links
            const links = resources.reduce((a, r) => [...a, ...r.getAssociations().filter((id) => ids.includes(id)).map((id) => {return {source: this.getSafeId(r.id), target: this.getSafeId(id)}})], [])
            return {nodes: nodes, links: links};
        } else {
            return {nodes: [], links: []};
        }
    }

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'relationship-div') {
        console.info(`>>>>>>> Resource Icons:`, resource_icons)
        return new OkitRelationshipJsonView(model, oci_data, resource_icons, parent_id)
    }

    draw(for_export=false) {
        this.newCanvas()
        this.drawResourceSelection()
        this.drawRelationshipSVG()
    }

    newCanvas(width=800, height=800, for_export=false) {
        const self = this;
        let canvas_div = d3.select(d3Id(this.parent_id));
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // Add Select Div
        this.selection_div = canvas_div.append("div").attr('class', 'relationship-selection')
        // Add relationship display area
        this.relationship_svg_div = canvas_div.append("div").attr('class', 'relationship-svg-div')
    }

    drawResourceSelection() {
        this.selection_div.selectAll('*').remove()
        if (this.model) {
            Object.entries(this.model).filter(([k, v]) => Array.isArray(v)).sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, v]) => {
                const resource_div = this.selection_div.append('div')
                const cb = resource_div.append('input').attr('type', 'checkbox')
                    .attr('id', `${k}_relationship_cb`)
                // cb.on('input', (event, d) => { // event replaces d3.event
                cb.on('input', (d, i, n) => { // event replaces d3.event
                    // const n = cb.nodes()
                    // const i = 0 // n.indexOf(event.currentTarget)
                    console.debug('Draw Resource Selection (d)', d)
                    console.debug('Draw Resource Selection (n)', n)
                    console.debug('Draw Resource Selection (i)', i)
                    console.debug('Draw Resource Selection (this)', this)
                    if (n[i].checked) {
                        this.excluded = this.excluded.filter((e) => e !== k)
                    } else {
                        this.excluded.push(k)
                    }
                    this.drawRelationshipSVG()
                })
                const label = resource_div.append('label')
                    .attr('for', `${k}_relationship_cb`)
                    .text(titleCase(k.replaceAll('_', ' ')))
                    cb.property('checked', !this.excluded.includes(k))
            })
        }
    }

    drawRelationshipSVG(width=800, height=800, for_export=false) {
        this.relationship_svg_div.selectAll('*').remove()
        const self = this;
        width = this.relationship_svg_div.node().clientWidth
        height = this.relationship_svg_div.node().clientHeight
        relationship_data = this.relationships;
        // Add SVG
        relationship_svg = this.relationship_svg_div.append("svg")
            .attr("id", 'relationship-svg')
            .attr("width", '100%')
            .attr("height", "100%")
            .call(d3.zoom().scaleExtent([0.1, 3]).on("zoom", function (event) {
                event = d3.event // Temp Work around for v0.67.0 release
                d3.select("#relationship-svg g").attr("transform", event.transform)
            })) // event replaces d3.event
            .append("g")
            // .attr('transform', function(d) {return 'translate(' + [width / 2, height / 2] + ')'});

        // Initialize the links
        relationship_link = relationship_svg.selectAll("line")
                        .data(relationship_data.links)
                        .enter()
                        .append("line")
                        .attr("class", "links");

        // Initialize the nodes
        relationship_node = relationship_svg.append("g")
                        .attr("class", "nodes")
                        .selectAll("g")
                        .data(relationship_data.nodes)
                        .enter()
                        .append("g")
                        .call(d3.drag()
                            .on("start", self.dragstarted)
                            .on("drag", self.dragged)
                            .on("end", self.dragended));

        relationship_nodes = relationship_node.append("rect")
                        .attr("width", function(d) { return 1.5 * self.getRadius(d.type); })
                        .attr("height", function(d) { return 1.5 * self.getRadius(d.type); })
                        .attr('x', function(d) { return -0.75 * self.getRadius(d.type); })
                        .attr('y', function(d) { return -0.75 * self.getRadius(d.type); })
                        .attr("class", "nodes")
                        .on("click", function(d) { alert(d.type); })

        relationship_labels = relationship_node.append("text")
                        .text(function(d) {return d.name;})
                        .attr('x', "0" )
                        .attr('y', function(d) { return self.getRadius(d.type) + 12; })
                        .attr('dominant-baseline', "middle")
                        .attr('text-anchor', "middle");

        relationship_images = relationship_node.append("image")
                        .attr("xlink:href", function(d) { return self.resource_icons.files[d.type.toLowerCase()]; })
                        // .attr("xlink:href", function(d) { return "images/" + d.type.replaceAll(' ','_') + ".svg"; })
                        .attr("width", function(d) { return 1.4 * self.getRadius(d.type); })
                        .attr("height", function(d) { return 1.4 * self.getRadius(d.type); })
                        .attr('x', function(d) { return -0.7 * self.getRadius(d.type); })
                        .attr('y', function(d) { return -0.7 * self.getRadius(d.type); });

        // use for to organise the graph
        relationship_simulation = d3.forceSimulation(relationship_data.nodes)
                            .force("link", d3.forceLink().id(function(d) { return d.id; }).links(relationship_data.links))
                            .force("charge", d3.forceManyBody().strength(-30))
                            .force("collision", d3.forceCollide().radius(50))
                            .force("center", d3.forceCenter(width / 2, height / 2))
                            .on("tick", self.ticked);
    }

    ticked() {
        relationship_link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        relationship_node
          .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";});
    }

    // dragstarted(event, d) {
    dragstarted(d) {
        let event = d3.event // Temp Work around for v0.67.0 release
        if (!event.active) relationship_simulation.alphaTarget(0.3).restart(); // event replaces d3.event
        d.fx = d.x;
        d.fy = d.y;
    }

    // dragged(event, d) {
    dragged(d) {
        let event = d3.event // Temp Work around for v0.67.0 release
        d.fx = event.x; // event replaces d3.event
        d.fy = event.y;
    }

    // dragended(event, d) {
    dragended(d) {
        let event = d3.event // Temp Work around for v0.67.0 release
        if (!event.active) relationship_simulation.alphaTarget(0); // event replaces d3.event
        d.fx = null;
        d.fy = null;
    }

    getRadius(type) {
        if (type === "Compartment") {
            return 40;
        } else {
            return 30;
        }
    }

    addResourceIcons(svg) {
        // Add Resource Icons
        let defs = svg.append('defs');
        for (let key in this.resource_icons) {
            let defid = key.replace(/ /g, '') + 'Svg';
            defs.append('g')
                .attr("id", defid)
                .attr("transform", "translate(-1, -1) scale(0.29, 0.29)")
                .html(this.resource_icons[key]);
        }
        return defs
    }

}

okitViewClasses.push(OkitRelationshipJsonView);

let okitRelationshipView = null;
