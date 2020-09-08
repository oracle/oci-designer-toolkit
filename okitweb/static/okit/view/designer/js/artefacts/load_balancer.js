/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer LoadBalancer View Javascript');

/*
** Define LoadBalancer View Artifact Class
 */
class LoadBalancerView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.subnet_ids[0];}
    get minimum_width() {return 135;}
    get minimum_height() {return 100;}

    getParent() {
        return this.getJsonView().getSubnet(this.parent_id);
    }

    getParentId() {
        return this.parent_id;
    }

    /*
     ** SVG Processing
     */
    draw() {
        console.group('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let me = this;
        let svg = super.draw();
        // Get Inner Rect to attach Connectors
        let rect = svg.select("rect[id='" + safeId(this.id) + "']");
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add Connector Data
        svg.attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", this.id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", this.id)
            .attr("dragable", true);
        // Draw Connectors
        this.drawConnectors();
        console.groupEnd();
        return svg;
    }

    drawConnectors() {
        console.group('Drawing Connectors for ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        // Check if there are any missing forllowing query
        this.checkConnectors();
        // Get Grand Parent
        let grandparent_id = d3.select(d3Id(this.parent_id)).attr('data-parent-id');
        // Define Connector Parent
        let parent_svg = d3.select(d3Id(grandparent_id + "-svg"));
        let parent_rect = d3.select(d3Id(grandparent_id));
        parent_svg = d3.select(d3Id('canvas-svg'));
        parent_rect = d3.select(d3Id('canvas-rect'));
        // Only Draw if parent exists
        if (parent_svg.node()) {
            console.info('Parent SVG     : ' + parent_svg.attr('id'));
            // Define SVG position manipulation variables
            let svgPoint = parent_svg.node().createSVGPoint();
            let screenCTM = parent_rect.node().getScreenCTM();
            svgPoint.x = d3.select(d3Id(this.id)).attr('data-connector-start-x');
            svgPoint.y = d3.select(d3Id(this.id)).attr('data-connector-start-y');
            let connector_start = svgPoint.matrixTransform(screenCTM.inverse());
            console.info('Start svgPoint.x : ' + svgPoint.x);
            console.info('Start svgPoint.y : ' + svgPoint.y);
            console.info('Start matrixTransform.x : ' + connector_start.x);
            console.info('Start matrixTransform.y : ' + connector_start.y);

            let connector_end = null;

            if (this.instance_ids.length > 0) {
                for (let i = 0; i < this.instance_ids.length; i++) {
                    let instance_svg = d3.select(d3Id(this.instance_ids[i]));
                    if (instance_svg.node()) {
                        svgPoint.x = instance_svg.attr('data-connector-start-x');
                        svgPoint.y = instance_svg.attr('data-connector-start-y');
                        connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                        console.info('End svgPoint.x   : ' + svgPoint.x);
                        console.info('End svgPoint.y   : ' + svgPoint.y);
                        console.info('End matrixTransform.x : ' + connector_end.x);
                        console.info('End matrixTransform.y : ' + connector_end.y);
                        let polyline = drawConnector(parent_svg, this.generateConnectorId(this.instance_ids[i], this.id),
                            {x:connector_start.x, y:connector_start.y}, {x:connector_end.x, y:connector_end.y});
                    }
                }
            }
        }
        console.groupEnd();
    }

    checkConnectors() {
        if (this.backend_sets) {
            for (let [key, value] of Object.entries(this.backend_sets)) {
                for (let backend of value.backends) {
                    for (let instance of this.getOkitJson().getInstances()) {
                        if (instance.primary_vnic.private_ip === backend.ip_address) {
                            if (!this.instance_ids.includes(instance.id)) {
                                this.instance_ids.push(instance.id);
                                backend.instance_id = instance.id;
                                delete backend.private_ip;
                            }
                        }
                    }
                }
            }
        }
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = this.dimensions['width'];
        definition['svg']['height'] = this.dimensions['height'];
        definition['svg']['align'] = "center";
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        definition['name']['show'] = true;
        definition['name']['align'] = "center";
        return definition;
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/load_balancer.html", () => {
            // Load Referenced Ids
            let instances_select = d3.select(d3Id('instance_ids'));
            for (let instance of me.artefact.getOkitJson().instances) {
                let div = instances_select.append('div');
                div.append('input')
                    .attr('type', 'checkbox')
                    .attr('id', safeId(instance.id))
                    .attr('value', instance.id);
                div.append('label')
                    .attr('for', safeId(instance.id))
                    .text(instance.display_name);
            }
            let network_security_groups_select = d3.select(d3Id('network_security_group_ids'));
            for (let network_security_group of okitJson.network_security_groups) {
                let div = network_security_groups_select.append('div');
                div.append('input')
                    .attr('type', 'checkbox')
                    .attr('id', safeId(network_security_group.id))
                    .attr('value', network_security_group.id);
                div.append('label')
                    .attr('for', safeId(network_security_group.id))
                    .text(network_security_group.display_name);
            }
            // Load Properties
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/load_balancer.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return LoadBalancer.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

}