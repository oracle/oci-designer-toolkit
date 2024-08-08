/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment LoadBalancer View Javascript');

/*
** Define LoadBalancer View Artifact Class
 */
class LoadBalancerView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    // get parent_id() {return this.artefact.subnet_ids[0];}
    // get parent() {return this.getJsonView().getSubnet(this.parent_id);}
    get parent_id() {
        const subnet = this.getJsonView().getSubnet(this.artefact.subnet_id)
        return (subnet && subnet.compartment_id === this.artefact.compartment_id) ? this.artefact.subnet_id : this.artefact.compartment_id
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
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
                    for (let instance of this.getOkitJson().getAllInstanceTypes()) {
                        if (instance.primary_vnic && instance.primary_vnic.private_ip === backend.ip_address) {
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
    // drawConnections() {
    //     // Check if there are any missing following query
    //     // this.checkBackends();
    //     this.artefact.backend_sets.forEach((bs) => {
    //         bs.backends.forEach((b) => {if (b.target_id !== '') {this.drawConnection(this.id, b.target_id)}})
    //     })
    // }

    /*
    ** Property Sheet Load function
     */
    newPropertiesSheet() {
        this.properties_sheet = new LoadBalancerProperties(this.artefact)
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
        return [Subnet.getArtifactReference(), Compartment.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropLoadBalancerView = function(target) {
    let view_artefact = this.newLoadBalancer();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    }
    else if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().subnet_ids.push(target.id);
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
    }
    return view_artefact;
}
OkitJsonView.prototype.newLoadBalancer = function(loadbalancer) {
    this.getLoadBalancers().push(loadbalancer ? new LoadBalancerView(loadbalancer, this) : new LoadBalancerView(this.okitjson.newLoadBalancer(), this));
    return this.getLoadBalancers()[this.getLoadBalancers().length - 1];
}
OkitJsonView.prototype.getLoadBalancers = function() {
    if (!this.load_balancers) this.load_balancers = []
    return this.load_balancers;
}
OkitJsonView.prototype.getLoadBalancer = function(id='') {
    for (let artefact of this.getLoadBalancers()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadLoadBalancers = function(load_balancers) {
    for (const artefact of load_balancers) {
        this.getLoadBalancers().push(new LoadBalancerView(new LoadBalancer(artefact, this.okitjson), this));
    }
}
