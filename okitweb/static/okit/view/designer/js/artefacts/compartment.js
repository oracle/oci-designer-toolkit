/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Compartment View Javascript');

/*
** Define Compartment View Artifact Class
 */
class CompartmentView extends OkitContainerDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {
        return (this.artefact.compartment_id !== null && this.artefact.compartment_id !== this.artefact.id) ? this.artefact.compartment_id : 'canvas';
    }
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    get minimum_dimensions() {
        if (this.isTopLevel()) {
            return {width: $(`#${this.json_view.parent_id}`).width(), height: $(`#${this.json_view.parent_id}`).height()};
        } else {
            return super.minimum_dimensions;
        }
    }

    /*
    ** Test if Top Level compartment
     */

    isTopLevel() {
        return this.parent ? false : true;
    }

    /*
    ** Clone Functionality
     */
    clone() {
        return new CompartmentView(this.artefact, this.getJsonView());
    }

    /*
    ** SVG Processing
    */

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/compartment.html", () => {loadPropertiesSheet(me.artefact);});
    }


    /*
    ** Child Type Functions
     */
    getTopArtifacts() {
        return [Instance.getArtifactReference()];
    }

    getContainerArtifacts() {
        return [Compartment.getArtifactReference(), VirtualCloudNetwork.getArtifactReference()];
    }

    getLeftArtifacts() {
        return [BlockStorageVolume.getArtifactReference()];
    }

    getRightArtifacts() {
        return [DynamicRoutingGateway.getArtifactReference(), AutonomousDatabase.getArtifactReference(),
            ObjectStorageBucket.getArtifactReference(), FastConnect.getArtifactReference(),
            IPSecConnection.getArtifactReference(), RemotePeeringConnection.getArtifactReference()];
    }

    getRightEdgeArtifacts() {
        return [CustomerPremiseEquipment.getArtifactReference()];
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return Compartment.getArtifactReference();
    }

    static getDropTargets() {
        return [CompartmentView.getArtifactReference()];
    }


}