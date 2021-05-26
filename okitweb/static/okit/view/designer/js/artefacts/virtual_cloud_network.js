/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer VirtualCloudNetwork View Javascript');

/*
** Define VirtualCloudNetwork View Artifact Class
 */
class VirtualCloudNetworkView extends OkitContainerDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    get children() {return [...this.json_view.getSubnets(), ...this.json_view.getInternetGateways(),
        ...this.json_view.getNATGateways(), ...this.json_view.getRouteTables(), ...this.json_view.getSecurityLists(), ...this.json_view.getDhcpOptions(),
        ...this.json_view.getNetworkSecurityGroups(), ...this.json_view.getServiceGateways(),
        ...this.json_view.getDynamicRoutingGateways(), ...this.json_view.getLocalPeeringGateways(),
        ...this.json_view.getOkeClusters()].filter(child => child.parent_id === this.artefact.id);}
    get info_text() {return this.artefact.cidr_block;}
    get summary_tooltip() {return `Name: ${this.display_name} \nCIDR: ${this.artefact.cidr_blocks} \nDNS: ${this.artefact.dns_label}`;}

    clone() {
        const clone = super.clone();
        clone.generateCIDR();
        this.cloneChildren(clone);
        return clone;
    }

    cloneChildren(clone) {
        for (let child of this.children) {
            child.clone().vcn_id = clone.id;
        }
    }

    /*
     ** SVG Processing
     */
    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/virtual_cloud_network.html", () => {
            loadPropertiesSheet(me.artefact);
            $(jqId('cidr_blocks')).on('change', function() {
                console.info('CIDR Block Changed ' + $(jqId('cidr_block')).val());
                for (let subnet of me.artefact.getOkitJson().subnets) {
                    if (subnet.vcn_id === me.id) {
                        subnet.generateCIDR();
                    }
                }
                redrawSVGCanvas();
            });
        });
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
        return [InternetGateway.getArtifactReference(), NATGateway.getArtifactReference()];
    }

    getTopArtifacts() {
        return [RouteTable.getArtifactReference(), SecurityList.getArtifactReference(), NetworkSecurityGroup.getArtifactReference(), DhcpOption.getArtifactReference()];
    }

    getContainerArtifacts() {
        return [Subnet.getArtifactReference()];
    }

    getRightEdgeArtifacts() {
        return[ServiceGateway.getArtifactReference(), DynamicRoutingGateway.getArtifactReference(), LocalPeeringGateway.getArtifactReference()]
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