/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment VirtualCloudNetwork View Javascript');

/*
** Define VirtualCloudNetwork View Artifact Class
 */
class VirtualCloudNetworkView extends OkitContainerCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    // get children1() {return [...this.json_view.getSubnets(), ...this.json_view.getInternetGateways(),
    //     ...this.json_view.getNatGateways(), ...this.json_view.getRouteTables(), ...this.json_view.getSecurityLists(), ...this.json_view.getDhcpOptions(),
    //     ...this.json_view.getNetworkSecurityGroups(), ...this.json_view.getServiceGateways(),
    //     ...this.json_view.getDynamicRoutingGateways(), ...this.json_view.getLocalPeeringGateways(),
    //     ...this.json_view.getOkeClusters()].filter(child => child.parent_id === this.artefact.id);}
    get info_text() {return this.artefact.cidr_block;}
    get summary_tooltip() {return `Name: ${this.display_name} \nCIDR: ${this.artefact.cidr_blocks} \nDNS: ${this.artefact.dns_label}`;}

    clone() {
        const clone = super.clone();
        clone.generateCIDR();
        this.cloneChildren(clone);
        return clone;
    }

    cloneChildren(clone) {
        console.info('Cloning VCN Children:', this.children)
        for (let child of this.children) {
            child.clone().compartment_id = clone.compartment_id;
            child.clone().vcn_id = clone.id;
        }
    }

    /*
     ** SVG Processing
     */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new VirtualCloudNetworkProperties(this.artefact)
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/virtual_cloud_network.html");
    }

    /*
    ** Child Artifact Functions
     */
    getTopEdgeArtifacts() {
        return [InternetGateway.getArtifactReference(), NatGateway.getArtifactReference()];
    }

    getTopArtifacts() {
        return [RouteTable.getArtifactReference(), SecurityList.getArtifactReference(), NetworkSecurityGroup.getArtifactReference(), DhcpOption.getArtifactReference()];
    }

    getContainerArtifacts() {
        return [Subnet.getArtifactReference()];
    }

    getRightEdgeArtifacts() {
        return[ServiceGateway.getArtifactReference(), DrgAttachment.getArtifactReference(), DynamicRoutingGatewayAttachment.getArtifactReference(), LocalPeeringGateway.getArtifactReference()]
    }

    getLeftArtifacts() {
        return [OkeCluster.getArtifactReference()];
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return VirtualCloudNetwork.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropVirtualCloudNetworkView = function(target) {
    let view_artefact = this.newVirtualCloudNetwork();
    view_artefact.getArtefact().compartment_id = target.id;
    view_artefact.getArtefact().generateCIDR();
    if (okitSettings.is_vcn_defaults) {
        // Default Route Table
        let route_table = this.newRouteTable(this.getOkitJson().newRouteTable({vcn_id: view_artefact.id, compartment_id: view_artefact.compartment_id, default: true}));
        // Default Security List
        let security_list = this.newSecurityList(this.getOkitJson().newSecurityList({vcn_id: view_artefact.id, compartment_id: view_artefact.compartment_id, default: true}));
        security_list.artefact.addDefaultSecurityListRules(view_artefact.artefact.cidr_block);
        // Defaul Dhcp Options
        let dhcp_options = this.newDhcpOption(this.getOkitJson().newDhcpOption({vcn_id: view_artefact.id, compartment_id: view_artefact.compartment_id, default: true}));
        dhcp_options.artefact.addDefaultOptions(view_artefact.display_name);
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newVirtualCloudNetwork = function(vcn) {
    this.getVirtualCloudNetworks().push(vcn ? new VirtualCloudNetworkView(vcn, this) : new VirtualCloudNetworkView(this.okitjson.newVirtualCloudNetwork(), this));
    return this.getVirtualCloudNetworks()[this.getVirtualCloudNetworks().length - 1];
}
OkitJsonView.prototype.getVirtualCloudNetworks = function() {
    if (!this.virtual_cloud_networks) this.virtual_cloud_networks = []
    return this.virtual_cloud_networks;
}
OkitJsonView.prototype.getVirtualCloudNetwork = function(id='') {
    for (let artefact of this.getVirtualCloudNetworks()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.getVcn = function(id='') {
    return this.getVirtualCloudNetwork(id);
}
OkitJsonView.prototype.loadVirtualCloudNetworks = function(virtual_cloud_networks) {
    for (const artefact of virtual_cloud_networks) {
        this.virtual_cloud_networks.push(new VirtualCloudNetworkView(new VirtualCloudNetwork(artefact, this.okitjson), this));
    }
}
// OkitJsonView.prototype.loadVirtualCloudNetworksSelect = function(select_id, empty_option=false) {
//     $(jqId(select_id)).empty();
//     const drg_select = $(jqId(select_id));
//     if (empty_option) {
//         drg_select.append($('<option>').attr('value', '').text(''));
//     }
//     for (let drg of this.getVirtualCloudNetworks()) {
//         drg_select.append($('<option>').attr('value', drg.id).text(drg.display_name));
//     }
// }
OkitJsonView.prototype.loadVirtualCloudNetworksSelect = function(id, empty_option=false) {
    // Build Virtual Cloud Network
    let select = $(jqId(id));
    $(select).empty();
    if (empty_option) select.append($('<option>').attr('value', '').text(''));
    for (const resource of this.getOkitJson().getVirtualCloudNetworks()) {
        select.append($('<option>').attr('value', resource.id).text(resource.display_name));
    }
}
OkitArtefactView.prototype.loadVirtualCloudNetworksSelect = function(id, empty=true) {this.getJsonView().loadVirtualCloudNetworksSelect(id, empty)}
OkitArtefactView.prototype.loadVirtualCloudNetworkSelect = function(id, empty=true) {this.getJsonView().loadVirtualCloudNetworksSelect(id, empty)}
