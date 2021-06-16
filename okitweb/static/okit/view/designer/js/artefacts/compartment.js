/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Compartment View Javascript');

/*
** Define Compartment View Artifact Class
 */
class CompartmentView extends OkitContainerDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
        this.export = false;
    }

    get parent_id() {
        return (this.artefact.compartment_id !== null && this.artefact.compartment_id !== '' && this.artefact.compartment_id !== this.artefact.id) ? this.artefact.compartment_id : 'canvas';
        // return (this.artefact.compartment_id !== null && this.artefact.compartment_id !== '' && this.artefact.compartment_id !== this.artefact.id) ? this.artefact.compartment_id : 'pseudo-compartment';
    }
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    // get parent() {return this.getJsonView().getCompartment(this.parent_id) ? this.getJsonView().getCompartment(this.parent_id) : this.getJsonView().canvas;}
    get children() {return [...this.json_view.getCompartments(), ...this.json_view.getVirtualCloudNetworks(),
        // ...this.json_view.getSubnets(), ...this.json_view.getExadataInfrastructures(),
        ...this.json_view.getBlockStorageVolumes(), ...this.json_view.getDynamicRoutingGateways(),
        ...this.json_view.getAutonomousDatabases(), ...this.json_view.getCustomerPremiseEquipments(),
        ...this.json_view.getObjectStorageBuckets(), ...this.json_view.getFastConnects(),
        ...this.json_view.getIPSecConnections(), ...this.json_view.getRemotePeeringConnections(),
        ...this.json_view.getInstances()].filter(child => child.parent_id === this.artefact.id);}
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
        return this.parent || this.export ? false : true;
    }

    /*
    ** Clone Functionality
     */
    clone() {
        const clone = super.clone();
        this.cloneChildren(clone);
        return clone;
    }

    cloneChildren(clone) {
        for (let child of this.children) {
            child.clone().compartment_id = clone.id;
        }
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
        return [Instance.getArtifactReference(), AnalyticsInstance.getArtifactReference(), IntegrationInstance.getArtifactReference()];
    }

    getContainerArtifacts() {
        return [Compartment.getArtifactReference(), VirtualCloudNetwork.getArtifactReference(), Subnet.getArtifactReference(), ExadataInfrastructure.getArtifactReference()];
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