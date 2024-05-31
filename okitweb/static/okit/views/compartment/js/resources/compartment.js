/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment Compartment View Javascript');

/*
** Define Compartment View Artifact Class
 */
class CompartmentView extends OkitContainerCompartmentArtefactView {
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
    // get children1() {return [...this.json_view.getCompartments(), ...this.json_view.getVirtualCloudNetworks(),
    //     // ...this.json_view.getSubnets(), ...this.json_view.getExadataInfrastructures(),
    //     ...this.json_view.getBlockStorageVolumes(), ...this.json_view.getDynamicRoutingGateways(),
    //     ...this.json_view.getAutonomousDatabases(), ...this.json_view.getCustomerPremiseEquipments(),
    //     ...this.json_view.getObjectStorageBuckets(), ...this.json_view.getFastConnects(),
    //     ...this.json_view.getIpsecConnections(), ...this.json_view.getRemotePeeringConnections(),
    //     ...this.json_view.getInstances()].filter(child => child.parent_id === this.artefact.id);}
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
        console.info('Cloning Compartment Children:', this.children)
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
    newPropertiesSheet() {
        this.properties_sheet = new CompartmentProperties(this.artefact)
    }

    /*
    ** Child Type Functions
     */
    getLeftEdgeArtifacts() {
        return [WebApplicationFirewall.getArtifactReference()]
    }

    getTopArtifacts() {
        return [Instance.getArtifactReference(), InstancePool.getArtifactReference(), AnalyticsInstance.getArtifactReference(), LoadBalancer.getArtifactReference(), NetworkLoadBalancer.getArtifactReference(),
            IntegrationInstance.getArtifactReference(), OracleDigitalAssistant.getArtifactReference(), 
            DataIntegrationWorkspace.getArtifactReference(), VisualBuilderInstance.getArtifactReference(), 
            MysqlDatabaseSystem.getArtifactReference(), DatabaseSystem.getArtifactReference(), NetworkFirewall.getArtifactReference()];
    }

    getContainerArtifacts() {
        return [Compartment.getArtifactReference(), VirtualCloudNetwork.getArtifactReference(), Subnet.getArtifactReference(), ExadataInfrastructure.getArtifactReference()];
    }

    getLeftArtifacts() {
        return [Policy.getArtifactReference(), Vault.getArtifactReference(), Bastion.getArtifactReference(), 
            BlockStorageVolume.getArtifactReference(), FileSystem.getArtifactReference(), DnsZone.getArtifactReference(), 
            OkeCluster.getArtifactReference(), DataScienceProject.getArtifactReference(),
            InstanceConfiguration.getArtifactReference(), AutoscalingConfiguration.getArtifactReference(), DynamicGroup.getArtifactReference()];
    }

    getRightArtifacts() {
        return [DynamicRoutingGateway.getArtifactReference(), AutonomousDatabase.getArtifactReference(),
            ObjectStorageBucket.getArtifactReference(), FastConnect.getArtifactReference(),
            IpsecConnection.getArtifactReference(), RemotePeeringConnection.getArtifactReference(),
            Drg.getArtifactReference(), NosqlDatabase.getArtifactReference(), ExadataCloudInfrastructure.getArtifactReference(),
            OkeCluster.getArtifactReference()];
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
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropCompartmentView = function(target) {
    let view_artefact = this.newCompartment();
    view_artefact.getArtefact().compartment_id = target.type === Compartment.getArtifactReference() ? target.id : target.compartment_id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newCompartment = function(compartment) {
    this.getCompartments().push(compartment ? new CompartmentView(compartment, this) : new CompartmentView(this.okitjson.newCompartment(), this));
    return this.getCompartments()[this.getCompartments().length - 1];
}
OkitJsonView.prototype.getCompartments = function() {
    if (!this.compartments) this.compartments = []
    return this.compartments;
}
OkitJsonView.prototype.getCompartment = function(id) {
    for (let artefact of this.getCompartments()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadCompartments = function(compartments) {
    for (const artefact of compartments) {
        this.getCompartments().push(new CompartmentView(new Compartment(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.loadCompartmentsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const compartment_select = $(jqId(select_id));
    if (empty_option) {
        compartment_select.append($('<option>').attr('value', '').text(''));
    }
    for (let compartment of this.getCompartments()) {
        compartment_select.append($('<option>').attr('value', compartment.id).text(compartment.display_name));
    }
}
