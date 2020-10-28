/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer RemotePeeringConnection View Javascript');

/*
** Define RemotePeeringConnection View Artifact Class
 */
class RemotePeeringConnectionView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    get top_bottom_connectors_preferred() {return false;}

    /*
     ** SVG Processing
     */
    // Add Specific Mouse Events
    addMouseEvents(svg) {
        let self = this;
        let id = this.artefact_id;
        svg.on('mouseenter', () => {
            if (okitSettings.highlight_association) {
                if (self.drg_id !== '') {$(jqId(self.drg_id)).addClass('highlight-association');}
                $(jqId(id)).addClass('highlight-association');
            }
        })
        svg.on('mouseleave', () => {
            if (okitSettings.highlight_association) {
                if (self.drg_id !== '') {$(jqId(self.drg_id)).removeClass('highlight-association');}
                $(jqId(id)).removeClass('highlight-association');
            }
        });
    }
    // Draw Connections
    drawConnections() {
        if (this.drg_id !== '') {this.drawConnection(this.id, this.drg_id);}
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
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/remote_peering_connection.html", () => {
            // Build Dynamic Routing Gateways
            this.loadDynamicRoutingGateways('drg_id');
            // Regions
            let region_select = $(jqId('peer_region_name'));
            $(region_select).empty();
            region_select.append($('<option>').attr('value', '').text(''));
            for (const region of okitOciData.getRegions()) {
                region_select.append($('<option>').attr('value', region.id).text(region.display_name));
            }
            // Load Sheet
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/remote_peering_connection.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return RemotePeeringConnection.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }

}