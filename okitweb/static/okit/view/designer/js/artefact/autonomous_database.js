/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer AutonomousDatabase View Javascript');

/*
** Define AutonomousDatabase View Artifact Class
 */
class AutonomousDatabaseView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
        this.parent_id = artefact.compartment_id;
    }

    getParent() {
        return this.getAutonomousDatabase(this.getParentId());
    }

    getParentId() {
        return this.parent_id;
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new AutonomousDatabaseView(this.artefact, this.getJsonView());
    }


    /*
     ** SVG Processing
     */
    // Additional draw Processing
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.getArtefact().id + ' [' + this.parent_id + ']');
        if (this.isAttached()) {
            console.groupEnd();
            return;
        }
        let svg = super.draw();
        /*
        ** Add Properties Load Event to created svg. We require the definition of the local variable "me" so that it can
        ** be used in the function dur to the fact that using "this" in the function will refer to the function not the
        ** Artifact.
         */
        // Get Inner Rect to attach Connectors
        let rect = svg.select("rect[id='" + safeId(this.id) + "']");
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add Connector Data
        svg.attr("data-compartment-id", this.compartment_id)
            .attr("data-connector-start-y", boundingClientRect.y + (boundingClientRect.height / 2))
            .attr("data-connector-start-x", boundingClientRect.x)
            .attr("data-connector-end-y", boundingClientRect.y + (boundingClientRect.height / 2))
            .attr("data-connector-end-x", boundingClientRect.x)
            .attr("data-connector-id", this.id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-connector-start-y", boundingClientRect.y + (boundingClientRect.height / 2))
            .attr("data-connector-start-x", boundingClientRect.x)
            .attr("data-connector-end-y", boundingClientRect.y + (boundingClientRect.height / 2))
            .attr("data-connector-end-x", boundingClientRect.x)
            .attr("data-connector-id", this.id)
            .attr("dragable", true);
        console.groupEnd();
        return svg;
    }
    // Return Artifact Specific Definition.
    getSvgDefinition() {
        console.groupCollapsed('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = this.dimensions['width'];
        definition['svg']['height'] = this.dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    isAttached() {
        for (let instance of this.getOkitJson().instances) {
            if (instance.autonomous_database_ids.includes(this.id)) {
                console.info(this.display_name + ' attached to instance '+ instance.display_name);
                return true;
            }
        }
        return false;
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/autonomous_database.html", () => {
            $('#is_free_tier').on('change', () => {
                if($('#is_free_tier').is(':checked')) {
                    $('#license_model').val("LICENSE_INCLUDED");
                    $('#is_auto_scaling_enabled').prop('checked', false);
                    $('#license_model').attr('disabled', true);
                    $('#is_auto_scaling_enabled').attr('disabled', true);
                } else {
                    $('#license_model').removeAttr('disabled');
                    $('#is_auto_scaling_enabled').removeAttr('disabled');
                }
            });
            if (me.is_free_tier) {
                me.license_model = "LICENSE_INCLUDED";
                me.is_auto_scaling_enabled =  false;
                $('#license_model').attr('disabled', true);
                $('#is_auto_scaling_enabled').attr('disabled', true);
            }
            loadPropertiesSheet(me);
        });
    }

    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/autonomous_database.html");
    }


}