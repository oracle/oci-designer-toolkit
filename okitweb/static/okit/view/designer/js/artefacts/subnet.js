/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
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

    get parent_id_orig() {return this.artefact.vcn_id;}
    get parent_orig() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}
    get parent_id() {
        const vcn = this.getJsonView().getVirtualCloudNetwork(this.artefact.vcn_id);
        if (vcn && vcn.compartment_id === this.artefact.compartment_id) {
            return this.artefact.vcn_id;
        } else {
            return this.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id) ? this.getJsonView().getVirtualCloudNetwork(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    get children() {return [...this.json_view.getInstances(), ...this.json_view.getLoadBalancers(),
        ...this.json_view.getFileStorageSystems(), ...this.json_view.getAutonomousDatabases(),
        ...this.json_view.getDatabaseSystems(), ...this.json_view.getMySQLDatabaseSystems()].filter(child => child.parent_id === this.artefact.id);}
    get type_text() {return this.prohibit_public_ip_on_vnic ? `Private ${this.getArtifactReference()}` : `Public ${this.getArtifactReference()}`;}
    get info_text() {return this.artefact.cidr_block;}
    get summary_tooltip() {return `Name: ${this.display_name} \nCIDR: ${this.artefact.cidr_block} \nDNS: ${this.artefact.dns_label}`;}

    clone() {
        const clone = super.clone();
        clone.generateCIDR();
        this.cloneChildren(clone);
        return clone;
    }

    cloneChildren(clone) {
        for (let child of this.children) {
            child.clone().subnet_id = clone.id;
        }
    }

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
        // Draw Dhcp Options
        if (this.artefact.dhcp_options_id !== '') {
            let attachment = new DhcpOptionView(this.getJsonView().getOkitJson().getDhcpOption(this.dhcp_options_id), this.getJsonView());
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
            // Virtual Cloud Network
            this.loadVirtualCloudNetworkSelect('vcn_id');
            $(jqId('vcn_id')).on('change', () => {if ($(jqId('vcn_id')).val() != '') me.artefact.generateCIDR();});
            // Route Table
            let route_table_select = $(jqId('route_table_id'));
            route_table_select.append($('<option>').attr('value', '').text(''));
            for (let route_table of me.artefact.getOkitJson().route_tables) {
                if (me.vcn_id === route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            // Security Lists
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
            // Dhcp Options
            this.json_view.loadDhcpOptionsSelect('dhcp_options_id', true)
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
            const resource = this.json_view.getRouteTable(this.artefact.route_table_id);
            const dimensions = resource ? resource.dimensions : {width: positional_adjustments.spacing.x * -1};
            top_edge_dimensions.width += (dimensions.width + positional_adjustments.spacing.x);
        }
        // Security Lists
        for (let security_list_id of this.artefact.security_list_ids) {
            const resource = this.json_view.getSecurityList(security_list_id)
            const dimensions = resource ? resource.dimensions : {width: positional_adjustments.spacing.x * -1};
            top_edge_dimensions.width += (dimensions.width + positional_adjustments.spacing.x);
        }
        if (this.artefact.dhcp_options_id !== '' && this.json_view.getDhcpOption) {
            const resource = this.json_view.getDhcpOption(this.artefact.dhcp_options_id)
            const dimensions = resource ? resource.dimensions : {width: positional_adjustments.spacing.x * -1};
            top_edge_dimensions.width += (dimensions.width + positional_adjustments.spacing.x);
   }
        return top_edge_dimensions;
    }

    /*
    ** Child Artifact Functions
     */
    getTopEdgeArtifacts() {
        return [RouteTable.getArtifactReference(), SecurityList.getArtifactReference(), DhcpOption.getArtifactReference()];
    }

    getTopArtifacts() {
        return [LoadBalancer.getArtifactReference()];
    }

    getBottomArtifacts() {
        return [Instance.getArtifactReference(), InstancePool.getArtifactReference(), DatabaseSystem.getArtifactReference(), 
            AutonomousDatabase.getArtifactReference(), MySQLDatabaseSystem.getArtifactReference(), AnalyticsInstance.getArtifactReference()];
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
        return [VirtualCloudNetwork.getArtifactReference(), Compartment.getArtifactReference()];
    }

}