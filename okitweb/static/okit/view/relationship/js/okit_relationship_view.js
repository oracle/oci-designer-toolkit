/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Designer View Javascript');

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
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}
    get relationships() {
        let nodes = []
        let ids = []
        let links = []
        if (this.model) {
            // Loop through Model elements and create node entries
            Object.entries(this.okitjson).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        for (let resource of value) {
                            nodes.push({
                                id: this.getSafeId(resource.id),
                                ocid: resource.id,
                                name: resource.display_name,
                                type: resource.getArtifactReference()
                            });
                            ids.push(resource.id)
                        }
                    }
                }
            })
            // Assign id to index
            // nodes.forEach((n, i) => n.id = i)
            // Loop through Model elements and create link entries but only to ids in nodes
            Object.entries(this.okitjson).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        for (let resource of value) {
                            Object.entries(resource).forEach(([k, v]) => {
                                if (k.endsWith('_id') && ids.indexOf(v) >= 0) {
                                    links.push({source: this.getSafeId(resource.id), target: this.getSafeId(v)});
                                } else if (k.endsWith('_ids')) {
                                    v.forEach((id) => {if (ids.indexOf(id) >= 0) links.push({source: this.getSafeId(resource.id),target: this.getSafeId(id)})});
                                }
                            });
                        }
                    }
                }
            })
            // Map Ids to index
            // relationships.nodes = relationships.nodes.map((d) => {return {id: ids.indexOf(d.id), ocid: d.ocid, name: d.name, type: d.type}});
            // relationships.nodes.forEach((n) => n.id = ids.indexOf(n.id));
        }
        return {nodes: nodes, links: links};
    }

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'relationship-div') {
        return new OkitRelationshipJsonView((model, oci_data, parent_id, resource_icons))
    }

    draw(for_export=false) {
        this.newCanvas()
    }

    newCanvas(width=800, height=800, for_export=false) {
        relationship_data = this.relationships;
        // console.warn('Data:', relationship_data);
        // console.warn('Data:', JSON.stringify(relationship_data, null, 2));
        const self = this;
        let canvas_div = d3.select(d3Id(this.parent_id));
        let parent_width  = $(jqId(this.parent_id)).width();
        let parent_height = $(jqId(this.parent_id)).height();
        if (!for_export) {
            width = Math.round(Math.max(width, parent_width));
            height = Math.round(Math.max(height, parent_height));
        }
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        relationship_svg = canvas_div.append("svg")
            .attr("id", 'relationship-svg')
            .attr("width", '100%')
            .attr("height", "100%")
            .call(d3.zoom().on("zoom", function () {d3.select("#relationship-svg g").attr("transform", d3.event.transform)}))
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
                        .attr("xlink:href", function(d) { return self.resource_icons.files[d.type]; })
                        // .attr("xlink:href", function(d) { return "images/" + d.type.replaceAll(' ','_') + ".svg"; })
                        .attr("width", function(d) { return 1.4 * self.getRadius(d.type); })
                        .attr("height", function(d) { return 1.4 * self.getRadius(d.type); })
                        .attr('x', function(d) { return -0.7 * self.getRadius(d.type); })
                        .attr('y', function(d) { return -0.7 * self.getRadius(d.type); });

        // use for to organise the graph
        relationship_simulation = d3.forceSimulation(relationship_data.nodes)
                            .force("link", d3.forceLink().id(function(d) { return d.id; }).links(relationship_data.links))
                            .force("charge", d3.forceManyBody().strength(-100 * self.getRadius("")))
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

    dragstarted(d) {
        if (!d3.event.active) relationship_simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    dragended(d) {
        if (!d3.event.active) relationship_simulation.alphaTarget(0);
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
