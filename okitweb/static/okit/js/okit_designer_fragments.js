/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Fragments Javascript');

const fragment_artefact = 'Fragment';
asset_add_functions[fragment_artefact] = "addFragment";

/*
** Add Asset to JSON Model
 */
function addFragment(parent_id, compartment_id, fragment_title) {
    console.groupCollapsed('Adding ' + fragment_artefact + ' ' + fragment_title);
    let fragment = new Fragment(parent_id, compartment_id);
    fragment.add(fragment_title);
    console.groupEnd();
}

// Use global because the static class field fails in FireFox
let fragmentType = null;

class Fragment extends OkitArtifact {
    //static _fragmentType = ''

    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.compartment_id;
        this.vcn_id = data.parent_id;
        this.title = data.title;
        this.fragment_url = '/static/okit/fragments/json/' + this.title.toLowerCase().split(' ').join('_') + '.json';

        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Get Parent Type
        this.parent_type = d3.select(d3Id(data.parent_id)).attr('data-type');
        console.log('Fragment Parent Type : ' + this.parent_type);
        if (this.parent_type === Compartment.getArtifactReference()) {
            this.compartment_id = data.parent_id;
        } else if (this.parent_type === VirtualCloudNetwork.getArtifactReference()) {
            this.vcn_id = data.parent_id;
        }
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            for (let parent of okitjson[this.artefactToElement(this.parent_type)]) {
                if (parent.id === this.parent_id) {
                    this.getParent = function () {
                        return parent
                    };
                    break;
                }
            }
        }
        this.load();
    }


    /*
    ** Get Container Child Artifacts
     */


    /*
    ** Add functionality
     */
    addToCompartment(fragment_json={}, compartment_id=null) {
        console.info('Adding Fragment to Compartment ' + compartment_id);
        // We always need to process containers first so the sequence is :
        //  1. Compartments
        //  2. Virtual Cloud Networks
        //  3. Subnets

        // Process Add Sub Compartments
        // process Add Virtual Cloud Networks
        fragment_json.virtual_cloud_networks.forEach(function (artefact) {
            artefact.compartment_id = compartment_id;
            artefact.parent_id = compartment_id;
            this.getOkitJson().newVirtualCloudNetwork(artefact);
        }, this);
        // Remaining Artifacts
        this.addToVirtualCloudNetwork(fragment_json, null);
    }

    addToVirtualCloudNetwork(fragment_json={}, vcn_id=null) {
        console.info('Adding Fragment to Virtual Cloud Network ' + vcn_id);
        let ignore_elements = [this.artefactToElement(Compartment.getArtifactReference()), this.artefactToElement(VirtualCloudNetwork.getArtifactReference()), this.artefactToElement(Subnet.getArtifactReference())];
        // Process Subnets (Container)
        fragment_json.subnets.forEach(function (artefact) {
            artefact.compartment_id = this.compartment_id;
            if (vcn_id !== null) {
                artefact.vcn_id = vcn_id;
            }
            artefact.parent_id = artefact.vcn_id;
            this.getOkitJson().newSubnet(artefact);
        }, this);
        // Process Remaining
        for (let key in fragment_json) {
            console.info('Processing ' + key);
            if (Array.isArray(fragment_json[key])) {
                if (ignore_elements.indexOf(key) >= 0) {
                    // Ignore because these are compartment sub containers
                    continue;
                } else {
                    this.addCommon(fragment_json, key, vcn_id);
                }
            }
        }
    }

    addCommon(fragment_json, key, vcn_id=null) {
        if (key === this.artefactToElement(AutonomousDatabase.getArtifactReference())) {
            // Process Autonomous Databases
            fragment_json.autonomous_databases.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                this.getOkitJson().newAutonomousDatabase(artefact);
            }, this);
        } else if (key === this.artefactToElement(BlockStorageVolume.getArtifactReference())) {
            // Process Block Storage Volumes
            fragment_json.block_storage_volumes.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                this.getOkitJson().newBlockStorageVolume(artefact);
            }, this);
        } else if (key === this.artefactToElement(DynamicRoutingGateway.getArtifactReference())) {
            // Process Dynamic Routing Gateways
            fragment_json.dynamic_routing_gateways.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artefact.vcn_id = vcn_id;
                }
                artefact.parent_id = artefact.vcn_id;
                if (this.getOkitJson().newDynamicRoutingGateway(artefact) === null) {
                    // Gateway already exists so we need to update Route Table entries
                    this.updateRouteTableRoutes(fragment_json, artefact, DynamicRoutingGateway.getArtifactReference());
                }
            }, this);
        } else if (key === this.artefactToElement(FastConnect.getArtifactReference())) {
            // Process Fast Connects
            fragment_json.fast_connects.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artefact.vcn_id = vcn_id;
                }
                this.getOkitJson().newFastConnect(artefact);
            }, this);
        } else if (key === this.artefactToElement(FileStorageSystem.getArtifactReference())) {
            // Process File Storage System
            fragment_json.file_storage_systems.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                this.getOkitJson().newFileStorageSystem(artefact);
            }, this);
        } else if (key === this.artefactToElement(Instance.getArtifactReference())) {
            // Process Instances
            fragment_json.instances.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                this.getOkitJson().newInstance(artefact);
            }, this);
        } else if (key === this.artefactToElement(InternetGateway.getArtifactReference())) {
            // Process Internet Gateways
            fragment_json.internet_gateways.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artefact.vcn_id = vcn_id;
                }
                artefact.parent_id = artefact.vcn_id;
                if (this.getOkitJson().newInternetGateway(artefact) === null) {
                    // Gateway already exists so we need to update Route Table entries
                    this.updateRouteTableRoutes(fragment_json, artefact, InternetGateway.getArtifactReference());
                }
            }, this);
        } else if (key === this.artefactToElement(LoadBalancer.getArtifactReference())) {
            // Process Load Balancers
            fragment_json.load_balancers.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                this.getOkitJson().newLoadBalancer(artefact);
            }, this);
        } else if (key === this.artefactToElement(NATGateway.getArtifactReference())) {
            // Process NAT Gateways
            fragment_json.nat_gateways.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artefact.vcn_id = vcn_id;
                }
                artefact.parent_id = artefact.vcn_id;
                if (this.getOkitJson().newNATGateway(artefact) === null) {
                    // Gateway already exists so we need to update Route Table entries
                    this.updateRouteTableRoutes(fragment_json, artefact, NATGateway.getArtifactReference());
                }
            }, this);
        } else if (key === this.artefactToElement(ObjectStorageBucket.getArtifactReference())) {
            // Process Object Storage Buckets
            fragment_json.object_storage_buckets.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                this.getOkitJson().newObjectStorageBucket(artefact);
            }, this);
        } else if (key === this.artefactToElement(RouteTable.getArtifactReference())) {
            // Process Route Tables
            fragment_json.route_tables.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artefact.vcn_id = vcn_id;
                }
                artefact.parent_id = artefact.vcn_id;
                this.getOkitJson().newRouteTable(artefact);
            }, this);
        } else if (key === this.artefactToElement(SecurityList.getArtifactReference())) {
            // Process Security Lists
            fragment_json.security_lists.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artefact.vcn_id = vcn_id;
                }
                artefact.parent_id = artefact.vcn_id;
                this.getOkitJson().newSecurityList(artefact);
            }, this);
        } else if (key === this.artefactToElement(ServiceGateway.getArtifactReference())) {
            // Process Service Gateways
            fragment_json.service_gateways.forEach(function (artefact) {
                artefact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artefact.vcn_id = vcn_id;
                }
                artefact.parent_id = artefact.vcn_id;
                if (this.getOkitJson().newServiceGateway(artefact) === null) {
                    // Gateway already exists so we need to update Route Table entries
                    this.updateRouteTableRoutes(fragment_json, artefact, ServiceGateway.getArtifactReference());
                }
            }, this);
        } else {
            console.warn('Unknown Json Artifact List ' + key);
        }
    }

    /*
    ** Fragment  Load Functions
     */
    load() {
        console.info('Loading ' + this.fragment_url);
        console.info(this);
        // Need local variables for ajax success to access
        let me = this;
        $.ajax({
            type: 'get',
            url: this.fragment_url,
            dataType: 'text',
            contentType: 'application/json',
            success: function(resp) {
                let fragment_json = me.updateIds(JSON.parse(resp));
                // Add Fragment to Json
                if (me.parent_type === Compartment.getArtifactReference()) {
                    me.addToCompartment(fragment_json, me.compartment_id);
                } else if (me.parent_type === VirtualCloudNetwork.getArtifactReference()) {
                    me.addToVirtualCloudNetwork(fragment_json, me.vcn_id);
                } else {
                    console.warn('Invalid Drop Parent ' + me.parent_type);
                }
                displayOkitJson();
                okitJson.draw();
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
            }
        });
    }

    // TODO: Code update processing. First we need to change the way we get parent_id
    updateIds(fragment_json) {
        // Regenerate all Ids so the fragment can be dropped multiple times
        //this.updateCompartmentIds(fragment_json);
        return fragment_json;
    }
    updateCompartmentIds(fragment_json) {
        for (let compartment of fragment_json.compartments) {
            let id = compartment.id;
            let new_id = 'okit.compartment.' + uuidv4();
            // Autonomous Database
            for (let artefact of fragment_json.autonomous_databases) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Autonomous Database
            for (let artefact of fragment_json.block_storage_volumes) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Compartments
            for (let artefact of fragment_json.compartments) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Database Systems
            for (let artefact of fragment_json.database_systems) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Dynamic Routing Gateway
            for (let artefact of fragment_json.dynamic_routing_gateways) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Fast Connect
            for (let artefact of fragment_json.fast_connects) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // File Storage Systems
            for (let artefact of fragment_json.file_storage_systems) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Instance
            for (let artefact of fragment_json.instances) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Internet Gateways
            for (let artefact of fragment_json.internet_gateways) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Load Balancers
            for (let artefact of fragment_json.load_balancers) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Local Peering Gateways
            for (let artefact of fragment_json.local_peering_gateways) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // NAT Gateways
            for (let artefact of fragment_json.nat_gateways) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Network Security Groups
            for (let artefact of fragment_json.network_security_groups) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Object Storage Bucket
            for (let artefact of fragment_json.object_storage_buckets) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Route Tables
            for (let artefact of fragment_json.route_tables) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Security Lists
            for (let artefact of fragment_json.security_lists) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Subnets
            for (let artefact of fragment_json.subnets) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Virtual Cloud Network
            for (let artefact of fragment_json.virtual_cloud_networks) {
                if (artefact.compartment_id === id) {artefact.compartment_id = new_id;}
            }
            // Update this id
            compartment.id = new_id;
        }
    }


    delete() {

    }

    draw() {

    }

    updateRouteTableRoutes(fragment_json, artefact, gateway_type) {
        let gateway_id = '';
        if (gateway_type === InternetGateway.getArtifactReference()) {
            for (let gateway of this.getOkitJson().internet_gateways) {
                if (gateway.vcn_id === artefact.vcn_id) {
                    gateway_id = gateway.id;
                    break;
                }
            }
        }
        // Check main OKIT json in case the route table has already been processed
        for (let route_table of this.getOkitJson().route_tables) {
            for (let rule of route_table.route_rules) {
                if (rule.network_entity_id === artefact.id) {
                    rule.network_entity_id = gateway_id;
                }
            }
        }
        // Check main fragment json in case the route table has not been processed
        for (let route_table of fragment_json.route_tables) {
            for (let rule of route_table.route_rules) {
                if (rule.network_entity_id === artefact.id) {
                    rule.network_entity_id = gateway_id;
                }
            }
        }
    }

    /*
    ** Static Functionality
     */
    static setFragmentType(type) {
        fragmentType = type;
    }
    static getArtifactReference() {
        //return this._fragmentType;
        return fragmentType;
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference(), VirtualCloudNetwork.getArtifactReference()];
    }


}

