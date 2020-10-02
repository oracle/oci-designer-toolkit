/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer LocalPeeringGateway View Javascript');

/*
** Define LocalPeeringGateway View Artifact Class
 */
class LocalPeeringGatewayView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.vcn_id;}
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}

    /*
     ** SVG Processing
     */
    // Add Specific Mouse Events
    addMouseEvents(svg) {
        let self = this;
        let id = this.artefact_id;
        svg.on('mouseenter', () => {
            if (okitSettings.highlight_association) {
                if (self.peer_id !== '') {$(jqId(self.peer_id)).addClass('highlight-association');}
                $(jqId(id)).addClass('highlight-association');
            }
        })
        svg.on('mouseleave', () => {
            if (okitSettings.highlight_association) {
                if (self.peer_id !== '') {$(jqId(self.peer_id)).removeClass('highlight-association');}
                $(jqId(id)).removeClass('highlight-association');
            }
        });
    }
    // Draw Connections
    drawConnections() {
        if (this.peer_id !== '') {this.drawConnection(this.id, this.peer_id);}
    }
    draw1() {
        console.log('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let me = this;
        let svg = super.draw();
        // Add Highlighting
        let fill = d3.select(d3Id(this.id)).attr('fill');
        svg.on("mouseover", function () {
            if (me.peer_id !== '') {
                d3.selectAll(d3Id(me.peer_id)).attr('fill', svg_highlight_colour);
                d3.select(d3Id(me.id)).attr('fill', svg_highlight_colour);
            }
            d3.event.stopPropagation();
        });
        svg.on("mouseout", function () {
            if (me.peer_id !== '') {
                d3.selectAll(d3Id(me.peer_id)).attr('fill', fill);
                d3.select(d3Id(me.id)).attr('fill', fill);
            }
            d3.event.stopPropagation();
        });
        console.log();
        return svg;
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let dimensions = this.getDimensions();
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        return definition;
    }

    // Return Artifact Dimensions
    getDimensions() {
        console.log('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getMinimumDimensions();
        // Calculate Size based on Child Artifacts
        // Check size against minimum
        dimensions.width  = Math.max(dimensions.width,  this.getMinimumDimensions().width);
        dimensions.height = Math.max(dimensions.height, this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.log();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: icon_width, height:icon_height};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/local_peering_gateway.html", () => {
            // Load Referenced Ids
            let route_table_select = $(jqId('route_table_id'));
            route_table_select.append($('<option>').attr('value', '').text(''));
            for (let route_table of okitJson.route_tables) {
                if (me.vcn_id === route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            // Load Local Peering Gateways from other VCNs
            let remote_peering_gateway_select = $(jqId('peer_id'));
            remote_peering_gateway_select.append($('<option>').attr('value', '').text(''));
            for (let local_peering_gateway of okitJson.local_peering_gateways) {
                if (me.vcn_id !== local_peering_gateway.vcn_id) {
                    remote_peering_gateway_select.append($('<option>').attr('value', local_peering_gateway.id).text(local_peering_gateway.display_name));
                }
            }
            // Load Properties
            loadPropertiesSheet(me.artefact);
            $(jqId('peer_id')).on('blur', () => {okitJson.getLocalPeeringGateway(me.peer_id).peer_id = me.id;});
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/local_peering_gateway.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return LocalPeeringGateway.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

}