/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment BlockStorageVolume View Javascript');

/*
** Define BlockStorageVolume View Artifact Class
 */
class BlockStorageVolumeView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    // TODO: Enable when Instance code added
    get attached1() {
        if (!this.attached_id) {
            for (let instance of this.getOkitJson().getInstances()) {
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
        for (let instance of this.getOkitJson().getInstances()) {
            if (instance.block_storage_volume_ids.includes(this.id)) {
                $(jqId(instance.id)).addClass('highlight-association');
            }
        }
        $(jqId(this.artefact_id)).addClass('highlight-association');
    }

    removeAssociationHighlighting() {
        for (let instance of this.getOkitJson().getInstances()) {
            if (instance.block_storage_volume_ids.includes(this.id)) {
                $(jqId(instance.id)).removeClass('highlight-association');
            }
        }
        $(jqId(this.artefact_id)).removeClass('highlight-association');
    }

    /*
    ** Property Sheet Load function
     */
    newPropertiesSheet() {
        this.properties_sheet = new BlockStorageVolumeProperties(this.artefact)
    }

    // loadProperties() {
    //     let okitJson = this.getOkitJson();
    //     let me = this;
    //     $(jqId(PROPERTIES_PANEL)).load("propertysheets/block_storage_volume.html", () => {loadPropertiesSheet(me.artefact);});
    // }

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
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropBlockStorageVolumeView = function(target) {
    let view_artefact = this.newBlockStorageVolume();
    view_artefact.getArtefact().compartment_id = target.id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newBlockStorageVolume = function(volume) {
    this.getBlockStorageVolumes().push(volume ? new BlockStorageVolumeView(volume, this) : new BlockStorageVolumeView(this.okitjson.newBlockStorageVolume(), this));
    return this.getBlockStorageVolumes()[this.getBlockStorageVolumes().length - 1];
}
OkitJsonView.prototype.getBlockStorageVolumes = function() {
    if (!this.block_storage_volumes) this.block_storage_volumes = []
    return this.block_storage_volumes;
}
OkitJsonView.prototype.getBlockStorageVolume = function(id='') {
    for (let artefact of this.getBlockStorageVolumes()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadBlockStorageVolumes = function(block_storage_volumes) {
    for (const artefact of block_storage_volumes) {
        this.getBlockStorageVolumes().push(new BlockStorageVolumeView(new BlockStorageVolume(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.loadBlockStorageVolumesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let resource of this.getBlockStorageVolumes()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(resource.id))
            .attr('value', resource.id);
        div.append('label')
            .attr('for', safeId(resource.id))
            .text(resource.display_name);
    }
}
