/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer IPSecConnection View Javascript');

/*
** Define IPSecConnection View Artifact Class
 */
class IPSecConnectionView extends OkitDesignerArtefactView {
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
                if (self.cpe_id !== '') {$(jqId(self.cpe_id)).addClass('highlight-association');}
                $(jqId(id)).addClass('highlight-association');
            }
        })
        svg.on('mouseleave', () => {
            if (okitSettings.highlight_association) {
                if (self.drg_id !== '') {$(jqId(self.drg_id)).removeClass('highlight-association');}
                if (self.cpe_id !== '') {$(jqId(self.cpe_id)).removeClass('highlight-association');}
                $(jqId(id)).removeClass('highlight-association');
            }
        });
    }
    // Draw Connections
    drawConnections() {
        if (this.cpe_id !== '') {this.drawConnection(this.id, this.cpe_id);}
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
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/ipsec_connection.html", () => {
            // Build Dynamic Routing Gateways
            let drg_select = $(jqId('drg_id'));
            $(drg_select).empty();
            drg_select.append($('<option>').attr('value', '').text(''));
            for (const drg of me.getOkitJson().getDynamicRoutingGateways()) {
                drg_select.append($('<option>').attr('value', drg.id).text(drg.display_name));
            }
            // Build Customer Premise Equipments
            let cpe_select = $(jqId('cpe_id'));
            $(cpe_select).empty();
            cpe_select.append($('<option>').attr('value', '').text(''));
            for (const cpe of me.getOkitJson().getCustomerPremiseEquipments()) {
                cpe_select.append($('<option>').attr('value', cpe.id).text(cpe.display_name));
            }
            // Load Sheet
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/ipsec_connection.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return IPSecConnection.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }

}