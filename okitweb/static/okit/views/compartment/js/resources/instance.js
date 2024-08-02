/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment Instance View Javascript');

/*
** Define Instance View Artifact Class
 */
class InstanceView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
        this.secondary_vnics_idx = 0;
    }

    // -- Reference
    get parent_id() {
        let primary_subnet = this.getJsonView().getSubnet(this.primary_vnic.subnet_id);
        if (primary_subnet && primary_subnet.compartment_id === this.artefact.compartment_id) {
            return this.primary_vnic.subnet_id;
        } else {
            return this.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    // --- Dimensions
    // TODO: Decide if show attachments is required
    // ---- Icon
    get icon_definition_id() {return this.shape.startsWith('BM.') ? OkitJsonView.toSvgIconDef('BareMetalCompute') : super.icon_definition_id;}
    // ---- Text
    get summary_tooltip() {return `Name: ${this.display_name} \nAvailability Domain: ${this.artefact.availability_domain} \nShape: ${this.artefact.shape} \nOS: ${this.source_details.os} ${this.source_details.version}`;}
    // Direct Subnet Access
    get subnet_id() {return this.artefact.primary_vnic.subnet_id;}
    set subnet_id(id) {this.artefact.primary_vnic.subnet_id = id;}
    get primary_vnic() {return this.artefact.primary_vnic}

    /*
     ** SVG Processing
     */
     // Add Specific Mouse Events
    // addAssociationHighlighting() {
    //     for (let id of this.artefact.block_storage_volume_ids) {$(jqId(id)).addClass('highlight-association');}
    //     for (let vnic of this.getVnicAttachments().filter((v) => v.subnet_id !== '')) {$(jqId(vnic.subnet_id)).addClass('highlight-association');}
    //     for (let id of this.primary_vnic.nsg_ids) {$(jqId(id)).addClass('highlight-association');}
    // }

    // removeAssociationHighlighting() {
    //     for (let id of this.artefact.block_storage_volume_ids) {$(jqId(id)).removeClass('highlight-association');}
    //     for (let vnic of this.getVnicAttachments().filter((v) => v.subnet_id !== '')) {$(jqId(vnic.subnet_id)).removeClass('highlight-association');}
    //     for (let id of this.primary_vnic.nsg_ids) {$(jqId(id)).removeClass('highlight-association');}
    // }
    // TODO: Decide If Required
    drawAttachmentsOrig() {
        let attachment_count = 0;
        for (let block_storage_id of this.block_storage_volume_ids) {
            let attachment = new BlockStorageVolumeView(this.getJsonView().getOkitJson().getBlockStorageVolume(block_storage_id), this.getJsonView());
            attachment.attached_id = this.id;
            attachment.draw();
            attachment_count += 1;
        }
        let start_idx = 1;
        if (this.parent.getArtifactReference() === Compartment.getArtifactReference() && this.primary_vnic.subnet_id !== '') {start_idx = 0;}
        for (let idx = start_idx;  idx < this.vnics.length; idx++) {
            let vnic = this.vnics[idx];
            let attachment = new VirtualNetworkInterfaceView(this.getJsonView().getOkitJson().getSubnet(vnic.subnet_id), this.getJsonView());
            attachment.attached_id = this.id;
            // Add the -vnic suffix
            //attachment.artefact.id += '-vnic';
            let svg = attachment.draw();
            attachment_count += 1;
        }
        console.log();
    }

    getVnicAttachments() {
        return (this.parent.getArtifactReference() === Compartment.getArtifactReference() && this.primary_vnic.subnet_id !== '') ? this.vnic_attachments : this.vnic_attachments.slice(1);
    }

    /*
    ** Property Sheet Load function
     */
    newPropertiesSheet() {
        this.properties_sheet = new InstanceProperties(this.artefact)
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/instance.html");
    }

    /*
    ** Child Offset Functions
     */
    getBottomEdgeChildOffset() {
        let offset = this.getFirstBottomEdgeChildOffset();
        // Count how many top edge children and adjust.
        let count = 0;
        for (let child of this.getBottomEdgeArtifacts()) {
            count += $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").length;
        }
        console.info('Bottom Edge Count : ' + count);
        // Increment x position based on count
        offset.dx += Math.round((icon_width * count) + (positional_adjustments.spacing.x * count));
        offset.dy = Math.round(this.dimensions.height - positional_adjustments.padding.y);
        return offset;
    }


    /*
    ** Child Artifact Functions
     */
    getBottomEdgeArtifacts() {
        return [BlockStorageVolume.getArtifactReference(), VirtualNetworkInterface.getArtifactReference()];
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return Instance.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference(), Compartment.getArtifactReference()];
    }

    static getConnectTargets() {
        return [LoadBalancer.getArtifactReference()];
    }


}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropInstanceView = function(target) {
    let view_artefact = this.newInstance();
    if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().primary_vnic.subnet_id = target.id;
        view_artefact.artefact.primary_vnic.assign_public_ip = !this.getSubnet(target.id).prohibit_public_ip_on_vnic;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newInstance = function(instance) {
    this.getInstances().push(instance ? new InstanceView(instance, this) : new InstanceView(this.okitjson.newInstance(), this));
    return this.getInstances()[this.getInstances().length - 1];
}
OkitJsonView.prototype.getInstances = function() {
    if (!this.instances) this.instances = []
    return this.instances;
}
OkitJsonView.prototype.getInstance = function(id='') {
    for (let artefact of this.getInstances()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadInstances = function(instances) {
    for (const artefact of instances) {
        this.getInstances().push(new InstanceView(new Instance(artefact, this.okitjson), this));
    }
}
