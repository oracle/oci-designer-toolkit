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

    get parent_id() {return this.attached_id ? this.attached_id : this.artefact.compartment_id;}
    get attached() {
        if (!this.attached_id) {
            for (let instance of this.getOkitJson().instances) {
                if (instance.block_storage_volume_ids.includes(this.id)) {
                    console.info(this.display_name + ' attached to instance ' + instance.display_name);
                    return true;
                }
            }
        }
        return false;
    }

    getParent() {
        return this.attached_id ? this.getJsonView().getInstance(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);
    }

    getParentId() {
        return this.parent_id;
    }

    /*
     ** SVG Processing
     */
    // Additional draw Processing
    draw() {
        console.log('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        console.info(`Hide Attached : ${okitSettings.hide_attached}.`)
        console.info(`Is Attached   : ${this.attached}.`)
        if (!okitSettings.hide_attached || !this.attached) {
            console.info(`${this.display_name} is either not attached and we are displaying attached`);
            let svg = super.draw();
        }
        console.log();
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = this.dimensions['width'];
        definition['svg']['height'] = this.dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        return definition;
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