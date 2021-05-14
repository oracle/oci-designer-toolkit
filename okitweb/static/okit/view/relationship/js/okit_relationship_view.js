/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Designer View Javascript');

class OkitRelationshipJsonView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'relationship-div') {
        super(okitjson, oci_data, parent_id, resource_icons);
        // this.oci_data = oci_data;
        // this.parent_id = parent_id;
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}
    get relationships() {
        let relationships = {nodes: [], links: []};
        if (this.model) {
            // Loop through Model elements and create and create a tab for each
            Object.entries(this.okitjson).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    if (value.length) {
                        for (let resource of value) {
                            relationships.nodes.push({
                                id: resource.id,
                                name: resource.display_name,
                                type: resource.getArtifactReference()
                            });
                            Object.entries(resource).forEach(([k, v]) => {
                                if (k.endsWith('_id')) {
                                    relationships.links.push({
                                        source: resource.id,
                                        target: v
                                    });
                                }
                            });
                        }
                    }
                }
            })
        }
        return relationships;
    }

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'relationship-div') {
        return new OkitRelationshipJsonView((model, oci_data, parent_id, resource_icons))
    }

    draw(for_export=false) {
        this.newCanvas()
    }

    newCanvas(width=100, height=100, for_export=false) {
        const data = this.relationships;
        const self = this;
        let canvas_div = d3.select(d3Id(this.parent_id));
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // Add Base SVG
        let svg = canvas_div.append("svg")
            .attr("id", 'relationship-svg')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom().on("zoom", function () {d3.select("svg g").attr("transform", d3.event.transform)}))
                .append("g")
                    .attr('transform', function(d) {return 'translate(' + [width / 2, height / 2] + ')'});
            // Initialize the links
        let link = svg.selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
                .attr("class", "links");

        // Initialize the nodes
        let node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(data.nodes)
            .enter()
            .append("g")
            .call(d3.drag()
                .on("start", self.dragstarted)
                .on("drag", self.dragged)
                .on("end", self.dragended));

        let nodes = node.append("rect")
            .attr("width", function(d) { return 1.5 * self.getRadius(d.type); })
            .attr("height", function(d) { return 1.5 * self.getRadius(d.type); })
            .attr('x', function(d) { return -0.75 * self.getRadius(d.type); })
            .attr('y', function(d) { return -0.75 * self.getRadius(d.type); })
            .attr("class", "nodes")
            .on("click", function(d) { alert(d.type); })

        let lables = node.append("text")
            .text(function(d) {return d.name;})
            .attr('x', "0" )
            .attr('y', function(d) { return self.getRadius(d.type) + 12; })
            .attr('dominant-baseline', "middle")
            .attr('text-anchor', "middle");

        let images = node.append("image")
            .attr("xlink:href", function(d) { return "images/" + d.type + ".svg"; })
            .attr("width", function(d) { return 1.4 * self.getRadius(d.type); })
            .attr("height", function(d) { return 1.4 * self.getRadius(d.type); })
            .attr('x', function(d) { return -0.7 * self.getRadius(d.type); })
            .attr('y', function(d) { return -0.7 * self.getRadius(d.type); });

        // use for to organise the graph
        this.simulation = d3.forceSimulation(data.nodes)
                .force("link", d3.forceLink().id(function(d) { return d.id; }).links(data.links))
                .force("charge", d3.forceManyBody().strength(-400 * self.getRadius(""))) 
                .force("center", d3.forceCenter(0, 0))
                .on("tick", self.ticked(link, node));
    }

    // force algorith
    ticked(link, node) {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";});
    }

    dragstarted(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    dragended(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    getRadius(type) {
        if (type === "server") {
            return 60;
        } else {
            return 30;
        }
    }
}

okitViewClasses.push(OkitRelationshipJsonView);

let okitRelationshipView = null;
