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
    get parent() {return this.getJsonView().getSubnet(this.parent_id);}
    // TODO: Remove for new draw
    get minimum_dimensions() {return {width: 135, height: 100};}

    /*
     ** SVG Processing
     */
    checkBackends() {
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

    // Draw Connections
    drawConnections() {
        // Check if there are any missing following query
        this.checkBackends();
        for (let instance_id of this.artefact.instance_ids) {
            if (instance_id !== '') {this.drawConnection(this.id, instance_id);}
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
            // Build Network Security Groups
            this.loadNetworkSecurityGroups('network_security_group_ids', this.subnet_ids[0]);
            // Build Loadbalancer Shapes
            this.loadLoadBalancerShapes('shape');
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