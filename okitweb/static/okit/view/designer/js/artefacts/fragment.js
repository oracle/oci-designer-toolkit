/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Fragment View Javascript');

/*
** Define Compartment View Artifact Class
 */
class FragmentView extends OkitContainerDesignerArtefactView {
    constructor(artefact = null, json_view) {
        super(artefact, json_view);
    }

    get fragment_title() {return this.artefact.fragment_title;}
    get fragment_url() {return this.artefact.fragment_title;}
    get target_id() {return this.artefact.target_id;}
    get target_type() {return this.artefact.target_type;}

    load() {
        console.info('Loading ' + this.artefact.fragment_url);
        console.info(this);
        // Need local variables for ajax success to access
        let me = this;
        $.ajax({
            type: 'get',
            url: this.artefact.fragment_url,
            dataType: 'text',
            contentType: 'application/json',
            success: function(resp) {
                let fragment_json = JSON.parse(resp);
                me.artefact.load(fragment_json);
                me.artefact.updateIds();
                me.mergeJson();
                me.json_view.draw();
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
            }
        });
    }

    /*
    ** Merge Loaded Fragment
     */

    mergeJson() {
        if (this.target_type === Compartment.getArtifactReference()) {
            this.mergeToCompartment();
        } else if (this.target_type === VirtualCloudNetwork.getArtifactReference()) {
            this.mergeToVirtualCloudNetwork();
        } else {
            console.warn('Invalid Target Type for Merge ' + this.target_type);
        }
    }

    mergeToCompartment() {
        // Find Root Compartment
        let root_compartment_id = null;
        for (let compartment of this.artefact.getCompartments()) {
            if (compartment.compartment_id === null || compartment.compartment_id === compartment.id) {
                root_compartment_id = compartment.id;
                break;
            }
        }
        this.mergeAutonomousDatabases(root_compartment_id);
        this.mergeBlockStorageVolumes(root_compartment_id);
        this.mergeCompartments(root_compartment_id);
        this.mergeDatabaseSystems(root_compartment_id);
        this.mergeDynamicRoutingGateways(root_compartment_id);
        this.mergeFastConnects(root_compartment_id);
        this.mergeFileStorageSystems(root_compartment_id);
        this.mergeInstances(root_compartment_id);
        this.mergeInternetGateways(root_compartment_id);
        this.mergeLoadBalancers(root_compartment_id);
        this.mergeLocalPeeringGateways(root_compartment_id);
        this.mergeNATGateways(root_compartment_id);
        this.mergeNetworkSecurityGroups(root_compartment_id);
        this.mergeObjectStorageBuckets(root_compartment_id);
        this.mergeRouteTables(root_compartment_id);
        this.mergeSecurityLists(root_compartment_id);
        this.mergeServiceGateways(root_compartment_id);
        this.mergeSubnets(root_compartment_id);
        this.mergeVirtualCloudNetworks(root_compartment_id);
    }

    mergeToVirtualCloudNetwork() {
        // Loop through Virtual Cloud Networks in fragment and insert contents into target VCN
        let root_vcn_id = null;
        let root_compartment_id = null;
        for (let vcn of this.artefact.getVirtualCloudNetworks()) {
            console.info(`Processing ${vcn.display_name}`);
            root_vcn_id = vcn.id;
            root_compartment_id = vcn.compartment_id;
            this.mergeDatabaseSystems(root_compartment_id, root_vcn_id);
            this.mergeDynamicRoutingGateways(root_compartment_id, root_vcn_id);
            this.mergeFileStorageSystems(root_compartment_id, root_vcn_id);
            this.mergeInstances(root_compartment_id, root_vcn_id);
            this.mergeInternetGateways(root_compartment_id, root_vcn_id);
            this.mergeLoadBalancers(root_compartment_id, root_vcn_id);
            this.mergeLocalPeeringGateways(root_compartment_id, root_vcn_id);
            this.mergeNATGateways(root_compartment_id, root_vcn_id);
            this.mergeNetworkSecurityGroups(root_compartment_id, root_vcn_id);
            this.mergeRouteTables(root_compartment_id, root_vcn_id);
            this.mergeSecurityLists(root_compartment_id, root_vcn_id);
            this.mergeServiceGateways(root_compartment_id, root_vcn_id);
            this.mergeSubnets(root_compartment_id, root_vcn_id);
        }
    }

    mergeAutonomousDatabases(root_compartment_id) {
        for (let artefact of this.artefact.getAutonomousDatabases()) {
            let clone = this.okit_json.newAutonomousDatabase(artefact);
            if (clone.compartment_id === root_compartment_id) {
                clone.compartment_id = this.target_id;
            }
            this.json_view.newAutonomousDatabase(clone);
        }
    }

    mergeBlockStorageVolumes(root_compartment_id) {
        for (let artefact of this.artefact.getBlockStorageVolumes()) {
            let clone = this.okit_json.newBlockStorageVolume(artefact);
            if (clone.compartment_id === root_compartment_id) {
                clone.compartment_id = this.target_id;
            }
            this.json_view.newBlockStorageVolume(clone);
        }
    }

    mergeCompartments(root_compartment_id) {
        // Merge Sub Compartments
        for (let compartment of this.artefact.getCompartments()) {
            if (root_compartment_id && compartment.id !== root_compartment_id) {
                let clone = this.okit_json.newCompartment(compartment);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newCompartment(clone);
            }
        }
    }

    mergeDatabaseSystems(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getDatabaseSystems()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newDatabaseSystem(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newDatabaseSystem(clone);
            } else {
                let clone = this.okit_json.newDatabaseSystem(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newDatabaseSystem(clone);
            }
        }
    }

    mergeDynamicRoutingGateways(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getDynamicRoutingGateways()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newDynamicRoutingGateway(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newDynamicRoutingGateway(clone);
            } else {
                let clone = this.okit_json.newDynamicRoutingGateway(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newDynamicRoutingGateway(clone);
            }
        }
    }

    mergeFastConnects(root_compartment_id) {
        for (let artefact of this.artefact.getFastConnects()) {
            let clone = this.okit_json.newFastConnect(artefact);
            if (clone.compartment_id === root_compartment_id) {
                clone.compartment_id = this.target_id;
            }
            this.json_view.newFastConnect(clone);
        }
    }

    mergeFileStorageSystems(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getFileStorageSystems()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newFileStorageSystem(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newFileStorageSystem(clone);
            } else {
                let clone = this.okit_json.newFileStorageSystem(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newFileStorageSystem(clone);
            }
        }
    }

    mergeInstances(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getInstances()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newInstance(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newInstance(clone);
            } else {
                let clone = this.okit_json.newInstance(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newInstance(clone);
            }
        }
    }

    mergeInternetGateways(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getInternetGateways()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newInternetGateway(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newInternetGateway(clone);
            } else {
                let clone = this.okit_json.newInternetGateway(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newInternetGateway(clone);
            }
        }
    }

    mergeLoadBalancers(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getLoadBalancers()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newLoadBalancer(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newLoadBalancer(clone);
            } else {
                let clone = this.okit_json.newLoadBalancer(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newLoadBalancer(clone);
            }
        }
    }

    mergeLocalPeeringGateways(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getLocalPeeringGateways()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newLocalPeeringGateway(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newLocalPeeringGateway(clone);
            } else {
                let clone = this.okit_json.newLocalPeeringGateway(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newLocalPeeringGateway(clone);
            }
        }
    }

    mergeNATGateways(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getNATGateways()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newNATGateway(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newNATGateway(clone);
            } else {
                let clone = this.okit_json.newNATGateway(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newNATGateway(clone);
            }
        }
    }

    mergeNetworkSecurityGroups(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getNetworkSecurityGroups()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newNetworkSecurityGroup(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newNetworkSecurityGroup(clone);
            } else {
                let clone = this.okit_json.newNetworkSecurityGroup(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newNetworkSecurityGroup(clone);
            }
        }
    }

    mergeObjectStorageBuckets(root_compartment_id) {
        for (let artefact of this.artefact.getObjectStorageBuckets()) {
            let clone = this.okit_json.newObjectStorageBucket(artefact);
            if (clone.compartment_id === root_compartment_id) {
                clone.compartment_id = this.target_id;
            }
            this.json_view.newObjectStorageBucket(clone);
        }
    }

    mergeRouteTables(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getRouteTables()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newRouteTable(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newRouteTable(clone);
            } else {
                let clone = this.okit_json.newRouteTable(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newRouteTable(clone);
            }
        }
    }

    mergeSecurityLists(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getSecurityLists()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newSecurityList(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newSecurityList(clone);
            } else {
                let clone = this.artefact.okit_json.newSecurityList(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newSecurityList(clone);
            }
        }
    }

    mergeServiceGateways(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getServiceGateways()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newServiceGateway(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newServiceGateway(clone);
            } else {
                let clone = this.okit_json.newServiceGateway(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newServiceGateway(clone);
            }
        }
    }

    mergeSubnets(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getSubnets()) {
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.okit_json.newSubnet(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.okit_json.getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newSubnet(clone);
            } else {
                let clone = this.okit_json.newSubnet(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newSubnet(clone);
            }
        }
    }

    mergeVirtualCloudNetworks(root_compartment_id) {
        for (let artefact of this.artefact.getVirtualCloudNetworks()) {
            let clone = this.okit_json.newVirtualCloudNetwork(artefact);
            console.info('Root Compartment Id : ' + root_compartment_id);
            console.info('VCN Compartment Id  : ' + clone.compartment_id);
            console.info('Target Id           : ' + this.target_id);
            if (clone.compartment_id === root_compartment_id) {
                clone.compartment_id = this.target_id;
            }
            this.json_view.newVirtualCloudNetwork(clone);
        }
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Fragment';
    }

    static getDropTargets() {
        return [CompartmentView.getArtifactReference(), VirtualCloudNetwork.getArtifactReference()];
    }
}