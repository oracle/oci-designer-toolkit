/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Instance Pool View Javascript');

/*
** Define Compartment View Artifact Class
 */
class InstancePoolView extends OkitDesignerArtefactView {
    constructor(artefact = null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.placement_configurations[0].primary_subnet_id;}
    get parent() {return this.getJsonView().getSubnet(this.parent_id);}
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
