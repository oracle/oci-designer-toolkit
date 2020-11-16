/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer BlockStorageVolume View Javascript');

/*
** Define BlockStorageVolume View Artifact Class
 */
class BlockStorageVolumeView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    // TODO: Enable when Instance code added
    get attached1() {
        if (!this.attached_id) {
            for (let instance of this.getOkitJson().instances) {
                if (instance.block_storage_volume_ids.includes(this.id)) {
                    return true;
                }
            }
        }
        return false;
    }
    get parent_id() {return this.attached_id ? this.attached_id : this.artefact.compartment_id;}
    get parent() {return this.attached_id ? this.getJsonView().getInstance(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}

    /*
     ** SVG Processing
     */
    // Add Specific Mouse Events
    addAssociationHighlighting() {
        for (let instance of this.getOkitJson().instances) {
            if (instance.block_storage_volume_ids.includes(this.id)) {
                $(jqId(instance.id)).addClass('highlight-association');
            }
        }
        $(jqId(this.artefact_id)).addClass('highlight-association');
    }

    removeAssociationHighlighting() {
        for (let instance of this.getOkitJson().instances) {
            if (instance.block_storage_volume_ids.includes(this.id)) {
                $(jqId(instance.id)).removeClass('highlight-association');
            }
        }
        $(jqId(this.artefact_id)).removeClass('highlight-association');
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/block_storage_volume.html", () => {loadPropertiesSheet(me.artefact);});
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/block_storage_volume.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return BlockStorageVolume.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }

}