/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Compartment View Javascript');

/*
** Define Compartment View Artifact Class
 */
class CompartmentView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
        this.parent_id = artefact.compartment_id;
    }

    get minimum_dimensions() {
        if (this.isTopLevel()) {
            return {width: $(`#${this.json_view.parent_id}`).width(), height: $(`#${this.json_view.parent_id}`).height()};
        } else {
            return {width: container_artifact_x_padding * 2, height: container_artifact_y_padding * 2};
        }
    }

    getParent() {
        return this.artefact.getOkitJson().getCompartment(this.getParentId());
    }

    getParentId() {
        return this.parent_id;
    }

    /*
    ** Test if Top Level compartment
     */

    isTopLevel() {
        return !this.getParent();
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
    getSvgDefinition() {
        let definition = this.newSVGDefinition(this, Compartment.getArtifactReference());
        console.info('>>>>>>>> Parent');
        console.info(this.getParent());
        if (this.getParent()) {
            let parent_first_child = this.getParent().getChildOffset(this.getArtifactReference());
            definition['svg']['x'] = parent_first_child.dx;
            definition['svg']['y'] = parent_first_child.dy;
        }
        definition['svg']['width'] = this.dimensions['width'];
        definition['svg']['height'] = this.dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 5;
        definition['rect']['stroke']['width'] = 2;
        definition['icon']['x_translation'] = icon_translate_x_start;
        definition['icon']['y_translation'] = icon_translate_y_start;
        definition['name']['show'] = true;
        definition['label']['show'] = true;
        return definition;
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/compartment.html", () => {loadPropertiesSheet(me);});
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