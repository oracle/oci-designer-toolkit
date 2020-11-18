/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Subnet View Javascript');

/*
** Define Subnet View Artifact Class
 */
class SubnetView extends OkitContainerDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.vcn_id;}
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}
    get type_text() {return this.prohibit_public_ip_on_vnic ? `Private ${this.getArtifactReference()}` : `Public ${this.getArtifactReference()}`;}
    get info_text() {return this.artefact.cidr_block;}
    get summary_tooltip() {return `Name: ${this.display_name} \nCIDR: ${this.artefact.cidr_block} \nDNS: ${this.artefact.dns_label}`;}

    /*
     ** SVG Processing
     */
    // Add Specific Mouse Events
    addAssociationHighlighting() {
        $(jqId(`${this.artefact_id}-vnic`)).addClass('highlight-association');
    }

    removeAssociationHighlighting() {
        $(jqId(`${this.artefact_id}-vnic`)).removeClass('highlight-association');
    }
    drawAttachments() {
        console.log(`Drawing ${this.getArtifactReference()} : ${this.display_name} Attachments (${this.artefact_id})`);
        let attachment_count = 0;
        // Draw Route Table
        if (this.artefact.route_table_id !== '') {
            let attachment = new RouteTableView(this.getJsonView().getOkitJson().getRouteTable(this.route_table_id), this.getJsonView());
            attachment.attached_id = this.id;
            attachment.draw();
            attachment_count += 1;
        }
        // Security Lists
        for (let security_list_id of this.artefact.security_list_ids) {
            let attachment = new SecurityListView(this.getJsonView().getOkitJson().getSecurityList(security_list_id), this.getJsonView());
            attachment.attached_id = this.id;
            attachment.draw();
            attachment_count += 1;
        }
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/subnet.html", () => {
            // Load Referenced Ids
            let route_table_select = $(jqId('route_table_id'));
            route_table_select.append($('<option>').attr('value', '').text(''));
            for (let route_table of me.artefact.getOkitJson().route_tables) {
                if (me.vcn_id === route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            let security_lists_select = d3.select(d3Id('security_list_ids'));
            for (let security_list of me.artefact.getOkitJson().security_lists) {
                if (me.vcn_id === security_list.vcn_id) {
                    let div = security_lists_select.append('div');
                    div.append('input')
                        .attr('type', 'checkbox')
                        .attr('id', safeId(security_list.id))
                        .attr('value', security_list.id);
                    div.append('label')
                        .attr('for', safeId(security_list.id))
                        .text(security_list.display_name);
                }
            }
            // Load Properties
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/subnet.html");
    }

    /*
    ** Dimension Overrides
     */
    getTopEdgeChildrenMaxDimensions() {
        let top_edge_dimensions = {width: 0, height: this.icon_height};
        if (this.artefact.route_table_id !== '') {
            const dimensions = this.json_view.getRouteTable(this.artefact.route_table_id).dimensions;
            top_edge_dimensions.width += (dimensions.width + positional_adjustments.spacing.x);
        }
        // Security Lists
        for (let security_list_id of this.artefact.security_list_ids) {
            const dimensions = this.json_view.getSecurityList(security_list_id).dimensions;
            top_edge_dimensions.width += (dimensions.width + positional_adjustments.spacing.x);
        }
        return top_edge_dimensions;
    }

    /*
    ** Child Artifact Functions
     */
    getTopEdgeArtifacts() {
        return [RouteTable.getArtifactReference(), SecurityList.getArtifactReference()];
    }

    getTopArtifacts() {
        return [LoadBalancer.getArtifactReference()];
    }

    getBottomArtifacts() {
        return [Instance.getArtifactReference(), InstancePool.getArtifactReference(), DatabaseSystem.getArtifactReference(), AutonomousDatabase.getArtifactReference(), MySQLDatabaseSystem.getArtifactReference()];
    }

    getLeftArtifacts() {
        return [FileStorageSystem.getArtifactReference()];
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return Subnet.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

}