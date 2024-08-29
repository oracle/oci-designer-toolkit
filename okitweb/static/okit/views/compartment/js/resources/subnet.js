/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment Subnet View Javascript');

/*
** Define Subnet View Artifact Class
 */
class SubnetView extends OkitContainerCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    getAttachedIds = () => [this.resource.route_table_id, this.resource.dhcp_options_id, ...this.resource.security_list_ids]

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
    get children1() {return [...this.json_view.getInstances(), ...this.json_view.getLoadBalancers(),
        ...this.json_view.getFileStorageSystems(), ...this.json_view.getAutonomousDatabases(),
        ...this.json_view.getDatabaseSystems(), ...this.json_view.getMysqlDatabaseSystems()].filter(child => child.parent_id === this.artefact.id);}
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
        console.info('Cloning Subnet Children:', this.children)
        for (let child of this.children) {
            child.clone().compartment_id = clone.compartment_id;
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
        let attachment_count = 0;
        // Draw Route Table
        if (this.artefact.route_table_id !== '') {
            let resource = this.getJsonView().getOkitJson().getRouteTable(this.route_table_id)
            resource = resource ? resource : new RouteTable({display_name: 'Missing From Design', read_only: true}, this.getJsonView().getOkitJson())
            if (resource) {
                let attachment = new RouteTableView(resource, this.getJsonView());
                attachment.attached_id = this.id;
                attachment.draw();
                attachment_count += 1;
            }
        }
        // Security Lists
        for (const security_list_id of this.artefact.security_list_ids) {
            let resource = this.getJsonView().getOkitJson().getSecurityList(security_list_id)
            resource = resource ? resource : new SecurityList({display_name: 'Missing From Design', read_only: true}, this.getJsonView().getOkitJson())
            if (resource) {
                let attachment = new SecurityListView(resource, this.getJsonView());
                attachment.attached_id = this.id;
                attachment.draw();
                attachment_count += 1;
            }
        }
        // Draw Dhcp Options
        if (this.artefact.dhcp_options_id !== '') {
            let resource = this.getJsonView().getOkitJson().getDhcpOption(this.dhcp_options_id)
            resource = resource ? resource : new DhcpOption({display_name: 'Missing From Design', read_only: true}, this.getJsonView().getOkitJson())
            if (resource) {
                let attachment = new DhcpOptionView(resource, this.getJsonView());
                attachment.attached_id = this.id;
                attachment.draw();
                attachment_count += 1;
            }
        }
    }

    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new SubnetProperties(this.artefact)
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
        return [Bastion.getArtifactReference(), LoadBalancer.getArtifactReference(), NetworkLoadBalancer.getArtifactReference(), DataIntegrationWorkspace.getArtifactReference(), NetworkFirewall.getArtifactReference()];
    }

    getBottomArtifacts() {
        return [Instance.getArtifactReference(), InstancePool.getArtifactReference(), DatabaseSystem.getArtifactReference(), 
            AutonomousDatabase.getArtifactReference(), MysqlDatabaseSystem.getArtifactReference(), AnalyticsInstance.getArtifactReference(), 
            ExadataCloudInfrastructure.getArtifactReference()];
    }

    getLeftArtifacts() {
        return [FileStorageSystem.getArtifactReference(), MountTarget.getArtifactReference(), InstanceConfiguration.getArtifactReference()];
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
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropSubnetView = function(target) {
    let view_artefact = this.newSubnet();
    if (target.type === VirtualCloudNetwork.getArtifactReference()) {
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.getArtefact().generateCIDR();
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newSubnet = function(subnet) {
    this.getSubnets().push(subnet ? new SubnetView(subnet, this) : new SubnetView(this.okitjson.newSubnet(), this));
    return this.getSubnets()[this.getSubnets().length - 1];
}
OkitJsonView.prototype.getSubnets = function() {
    if (!this.subnets) this.subnets = []
    return this.subnets;
}
OkitJsonView.prototype.getSubnet = function(id='') {
    for (let artefact of this.getSubnets()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadSubnets = function(subnets) {
    for (const artefact of subnets) {
        this.getSubnets().push(new SubnetView(new Subnet(artefact, this.okitjson), this));
    }
}
// OkitJsonView.prototype.loadSubnetsSelect = function(select_id, empty_option=false) {
//     $(jqId(select_id)).empty();
//     const subnet_select = $(jqId(select_id));
//     if (empty_option) {
//         subnet_select.append($('<option>').attr('value', '').text(''));
//     }
//     for (let subnet of this.getSubnets()) {
//         const compartment = this.getCompartment(subnet.compartment_id);
//         const vcn = this.getVirtualCloudNetwork(subnet.vcn_id);
//         const display_name = subnet.display_name;
//         // const display_name = `${compartment.display_name}/${vcn.display_name}/${subnet.display_name}`;
//         subnet_select.append($('<option>').attr('value', subnet.id).text(display_name));
//     }
// }
OkitJsonView.prototype.loadSubnetsSelect = function(id, empty_option=false, vcn_id=undefined) {
    // Build Subnet Select
    let select = $(jqId(id));
    $(select).empty();
    if (empty_option) select.append($('<option>').attr('value', '').text(''));
    for (const resource of this.getOkitJson().getSubnets().filter((s) => vcn_id === undefined || s.vcn_id === vcn_id)) {
        select.append($('<option>').attr('value', resource.id).text(resource.display_name));
    }
}
OkitArtefactView.prototype.loadSubnetsSelect = function(id, empty=true, vcn_id=undefined) {this.getJsonView().loadSubnetsSelect(id, empty, vcn_id)}
OkitArtefactView.prototype.loadSubnetSelect = function(id, empty=true, vcn_id=undefined) {this.getJsonView().loadSubnetsSelect(id, empty, vcn_id)}
