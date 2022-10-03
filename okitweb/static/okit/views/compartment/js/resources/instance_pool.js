/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment Instance Pool View Javascript');

/*
** Define Compartment View Artifact Class
 */
class InstancePoolView extends OkitCompartmentArtefactView {
    constructor(artefact = null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.placement_configurations[0].primary_subnet_id;}
    get parent() {return this.getJsonView().getSubnet(this.parent_id);}
    // ---- Okit View Functions
    get cloneable() {return false;}
    // Test Functions variables
    get subnet_id() {return this.artefact.placement_configurations[0].primary_subnet_id;}

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/instance_pool.html", () => {loadPropertiesSheet(self.artefact);});
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/instance_pool.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return InstancePool.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropInstancePoolView = function(target) {
    let view_artefact = this.newInstancePool();
    view_artefact.getArtefact().placement_configurations[0].primary_subnet_id = target.id;
    view_artefact.getArtefact().compartment_id = target.compartment_id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newInstancePool = function(instance_pool) {
    this.getInstancePools().push(instance_pool ? new InstancePoolView(instance_pool, this) : new InstancePoolView(this.okitjson.newInstancePool(), this));
    return this.getInstancePools()[this.getInstancePools().length - 1];
}
OkitJsonView.prototype.getInstancePools = function() {
    if (!this.instance_pools) this.instance_pools = []
    return this.instance_pools;
}
OkitJsonView.prototype.getInstancePool = function(id='') {
    for (let artefact of this.getInstancePools()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadInstancePools = function(instance_pools) {
    for (const artefact of instance_pools) {
        this.getInstancePools().push(new InstancePoolView(new InstancePool(artefact, this.okitjson), this));
    }
}
