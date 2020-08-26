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
        // Merge Containers Artefacts
        this.mergeCompartments(root_compartment_id);
        this.mergeVirtualCloudNetworks(root_compartment_id);
        this.mergeSubnets(root_compartment_id);
        // Merge Simple Artefacts
        this.mergeAutonomousDatabases(root_compartment_id);
        this.mergeBlockStorageVolumes(root_compartment_id);
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
        this.mergeOkeClusters(root_compartment_id);
        this.mergeRouteTables(root_compartment_id);
        this.mergeSecurityLists(root_compartment_id);
        this.mergeServiceGateways(root_compartment_id);
    }

    mergeToVirtualCloudNetwork() {
        // Loop through Virtual Cloud Networks in fragment and insert contents into target VCN
        let root_vcn_id = null;
        let root_compartment_id = null;
        for (let vcn of this.artefact.getVirtualCloudNetworks()) {
            console.info(`Processing ${vcn.display_name}`);
            root_vcn_id = vcn.id;
            root_compartment_id = vcn.compartment_id;
            // Merge Containers Artefacts
            this.mergeSubnets(root_compartment_id, root_vcn_id);
            // Merge Simple Artefacts
            // Merge Route Tables first because they may need to be update as part of later merge
            this.mergeRouteTables(root_compartment_id, root_vcn_id);
            this.mergeDatabaseSystems(root_compartment_id, root_vcn_id);
            this.mergeDynamicRoutingGateways(root_compartment_id, root_vcn_id);
            this.mergeFileStorageSystems(root_compartment_id, root_vcn_id);
            this.mergeInstances(root_compartment_id, root_vcn_id);
            this.mergeInternetGateways(root_compartment_id, root_vcn_id);
            this.mergeLoadBalancers(root_compartment_id, root_vcn_id);
            this.mergeLocalPeeringGateways(root_compartment_id, root_vcn_id);
            this.mergeNATGateways(root_compartment_id, root_vcn_id);
            this.mergeNetworkSecurityGroups(root_compartment_id, root_vcn_id);
            this.mergeOkeClusters(root_compartment_id, root_vcn_id);
            this.mergeSecurityLists(root_compartment_id, root_vcn_id);
            this.mergeServiceGateways(root_compartment_id, root_vcn_id);
        }
    }

    mergeAutonomousDatabases(root_compartment_id) {
        for (let artefact of this.artefact.getAutonomousDatabases()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            let clone = this.json_view.getOkitJson().newAutonomousDatabase(artefact);
            if (clone.compartment_id === root_compartment_id) {
                clone.compartment_id = this.target_id;
            }
            this.json_view.newAutonomousDatabase(clone);
        }
    }

    mergeBlockStorageVolumes(root_compartment_id) {
        for (let artefact of this.artefact.getBlockStorageVolumes()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            let clone = this.json_view.getOkitJson().newBlockStorageVolume(artefact);
            if (clone.compartment_id === root_compartment_id) {
                clone.compartment_id = this.target_id;
            }
            this.json_view.newBlockStorageVolume(clone);
        }
    }

    mergeCompartments(root_compartment_id) {
        // Merge Sub Compartments
        for (let artefact of this.artefact.getCompartments()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (root_compartment_id && artefact.id !== root_compartment_id) {
                let clone = this.json_view.getOkitJson().newCompartment(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newCompartment(clone);
            }
        }
    }

    mergeDatabaseSystems(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getDatabaseSystems()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newDatabaseSystem(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newDatabaseSystem(clone);
            } else {
                let clone = this.json_view.getOkitJson().newDatabaseSystem(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newDatabaseSystem(clone);
            }
        }
    }

    mergeDynamicRoutingGateways(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getDynamicRoutingGateways()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newDynamicRoutingGateway(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newDynamicRoutingGateway(clone);
            } else {
                let clone = this.json_view.getOkitJson().newDynamicRoutingGateway(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newDynamicRoutingGateway(clone);
            }
        }
    }

    mergeFastConnects(root_compartment_id) {
        for (let artefact of this.artefact.getFastConnects()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            let clone = this.json_view.getOkitJson().newFastConnect(artefact);
            if (clone.compartment_id === root_compartment_id) {
                clone.compartment_id = this.target_id;
            }
            this.json_view.newFastConnect(clone);
        }
    }

    mergeFileStorageSystems(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getFileStorageSystems()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newFileStorageSystem(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newFileStorageSystem(clone);
            } else {
                let clone = this.json_view.getOkitJson().newFileStorageSystem(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newFileStorageSystem(clone);
            }
        }
    }

    mergeInstances(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getInstances()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (root_vcn_id !== null && artefact.primary_vnic.subnet_id && artefact.primary_vnic.subnet_id !== '') {
                let clone = this.json_view.getOkitJson().newInstance(artefact);
                clone.compartment_id = this.json_view.getOkitJson().getSubnet(clone.primary_vnic.subnet_id).compartment_id;
                this.json_view.newInstance(clone);
            } else {
                let clone = this.json_view.getOkitJson().newInstance(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newInstance(clone);
            }
        }
    }

    mergeInternetGateways(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getInternetGateways()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let existing_ig = false;
                let gateway = null;
                for (gateway of this.json_view.getOkitJson().internet_gateways) {
                    if (gateway.vcn_id === this.target_id) {
                        existing_ig = true;
                    }
                }
                if (existing_ig) {
                    // Update Route Table Routes
                    for (let route_table of this.json_view.getOkitJson().route_tables) {
                        for (let rule of route_table.route_rules) {
                            if (rule.network_entity_id === artefact.id) {
                                rule.network_entity_id = gateway.id;
                            }
                        }
                    }
                } else {
                    let clone = this.json_view.getOkitJson().newInternetGateway(artefact);
                    clone.vcn_id = this.target_id;
                    clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                    this.json_view.newInternetGateway(clone);
                }
            } else {
                let clone = this.json_view.getOkitJson().newInternetGateway(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newInternetGateway(clone);
            }
        }
    }

    mergeLoadBalancers(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getLoadBalancers()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newLoadBalancer(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newLoadBalancer(clone);
            } else {
                let clone = this.json_view.getOkitJson().newLoadBalancer(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newLoadBalancer(clone);
            }
        }
    }

    mergeLocalPeeringGateways(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getLocalPeeringGateways()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newLocalPeeringGateway(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newLocalPeeringGateway(clone);
            } else {
                let clone = this.json_view.getOkitJson().newLocalPeeringGateway(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newLocalPeeringGateway(clone);
            }
        }
    }

    mergeNATGateways(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getNATGateways()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newNATGateway(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newNATGateway(clone);
            } else {
                let clone = this.json_view.getOkitJson().newNATGateway(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newNATGateway(clone);
            }
        }
    }

    mergeNetworkSecurityGroups(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getNetworkSecurityGroups()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newNetworkSecurityGroup(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newNetworkSecurityGroup(clone);
            } else {
                let clone = this.json_view.getOkitJson().newNetworkSecurityGroup(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newNetworkSecurityGroup(clone);
            }
        }
    }

    mergeObjectStorageBuckets(root_compartment_id) {
        for (let artefact of this.artefact.getObjectStorageBuckets()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            let clone = this.json_view.getOkitJson().newObjectStorageBucket(artefact);
            if (clone.compartment_id === root_compartment_id) {
                clone.compartment_id = this.target_id;
            }
            this.json_view.newObjectStorageBucket(clone);
        }
    }

    mergeOkeClusters(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getOkeClusters()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newOkeCluster(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newOkeCluster(clone);
            } else {
                let clone = this.json_view.getOkitJson().newOkeCluster(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newOkeCluster(clone);
            }
        }
    }

    mergeRouteTables(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getRouteTables()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newRouteTable(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newRouteTable(clone);
            } else {
                let clone = this.json_view.getOkitJson().newRouteTable(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newRouteTable(clone);
            }
        }
    }

    mergeSecurityLists(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getSecurityLists()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newSecurityList(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
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
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newServiceGateway(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newServiceGateway(clone);
            } else {
                let clone = this.json_view.getOkitJson().newServiceGateway(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newServiceGateway(clone);
            }
        }
    }

    mergeSubnets(root_compartment_id, root_vcn_id = null) {
        for (let artefact of this.artefact.getSubnets()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            if (artefact.vcn_id === root_vcn_id) {
                let clone = this.json_view.getOkitJson().newSubnet(artefact);
                clone.vcn_id = this.target_id;
                clone.compartment_id = this.json_view.getOkitJson().getVirtualCloudNetwork(this.target_id).compartment_id;
                this.json_view.newSubnet(clone);
            } else {
                let clone = this.json_view.getOkitJson().newSubnet(artefact);
                if (clone.compartment_id === root_compartment_id) {
                    clone.compartment_id = this.target_id;
                }
                this.json_view.newSubnet(clone);
            }
        }
    }

    mergeVirtualCloudNetworks(root_compartment_id) {
        for (let artefact of this.artefact.getVirtualCloudNetworks()) {
            // Remove existing reference to fragment OKIT Json so it can be replaced with the Json View version.
            delete artefact.getOkitJson;
            let clone = this.json_view.getOkitJson().newVirtualCloudNetwork(artefact);
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