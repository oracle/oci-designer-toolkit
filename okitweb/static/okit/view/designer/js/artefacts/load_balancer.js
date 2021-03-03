/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
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
    // Direct Subnet Access
    get subnet_id() {return this.artefact.subnet_ids[0];}
    set subnet_id(id) {this.artefact.subnet_ids[0] = id;}

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

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        const self = this;
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
            if (this.shape === 'flexible') {
                document.getElementById('minimum_bandwidth_in_mbps_row').classList.remove('collapsed');
                document.getElementById('maximum_bandwidth_in_mbps_row').classList.remove('collapsed');
            } else {
                this.shape_details.minimum_bandwidth_in_mbps = 0;
                this.shape_details.maximum_bandwidth_in_mbps = 0;
            }
            document.getElementById('shape').addEventListener("change", (event) => {self.showHideBandwidth(event.target.value)});
            document.getElementById('minimum_bandwidth_in_mbps').addEventListener("input", () => {self.setMinMaxBandwidth()});
            // Load Properties
            loadPropertiesSheet(me.artefact);
        });
    }

    showHideBandwidth(shape) {
        const min_bandwidth = document.getElementById('minimum_bandwidth_in_mbps');
        const max_bandwidth = document.getElementById('maximum_bandwidth_in_mbps');
        if (shape === 'flexible') {
            document.getElementById('minimum_bandwidth_in_mbps_row').classList.remove('collapsed');
            document.getElementById('maximum_bandwidth_in_mbps_row').classList.remove('collapsed');
            this.shape_details.minimum_bandwidth_in_mbps = 10;
            this.shape_details.maximum_bandwidth_in_mbps = 10;
        } else {
            document.getElementById('minimum_bandwidth_in_mbps_row').classList.add('collapsed');
            document.getElementById('maximum_bandwidth_in_mbps_row').classList.add('collapsed');
            this.shape_details.minimum_bandwidth_in_mbps = 0;
            this.shape_details.maximum_bandwidth_in_mbps = 0;
        }
        //min_bandwidth.setAttribute('value', this.shape_details.minimum_bandwidth_in_mbps);
        min_bandwidth.value = this.shape_details.minimum_bandwidth_in_mbps;
        //max_bandwidth.setAttribute('value', this.shape_details.maximum_bandwidth_in_mbps);
        max_bandwidth.value = this.shape_details.maximum_bandwidth_in_mbps;
    }

    setMinMaxBandwidth() {
        const max_bandwidth = document.getElementById('minimum_bandwidth_in_mbps');
        const min = this.shape_details.minimum_bandwidth_in_mbps;
        max_bandwidth.setAttribute('min', min);
        this.shape_details.maximum_bandwidth_in_mbps = Math.max(this.shape_details.minimum_bandwidth_in_mbps, this.shape_details.maximum_bandwidth_in_mbps);
        max_bandwidth.value = this.shape_details.maximum_bandwidth_in_mbps;
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