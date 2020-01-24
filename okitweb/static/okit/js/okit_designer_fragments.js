/*
** Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
** The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]
*/
console.info('Loaded Fragments Javascript');

const fragment_artifact = 'Fragment';
asset_drop_targets[fragment_artifact] = [compartment_artifact, virtual_cloud_network_artifact];
asset_add_functions[fragment_artifact] = "addFragment";

/*
** Add Asset to JSON Model
 */
function addFragment(parent_id, compartment_id, fragment_title) {
    console.groupCollapsed('Adding ' + fragment_artifact + ' ' + fragment_title);
    let fragment = new Fragment(parent_id, compartment_id);
    fragment.add(fragment_title);
    console.groupEnd();
}

class Fragment extends OkitArtifact {
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
        this.fragment_url = '/static/okit/templates/' + this.title.toLowerCase().split(' ').join('_') + '.json';

        // Get Parent Type
        this.parent_type = d3.select(d3Id(data.parent_id)).attr('data-type');
        console.log('Fragment Parent Type : ' + this.parent_type);
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.parent_id;
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            for (let parent of okitjson[this.artifactToElement(this.parent_type)]) {
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
    ** Add functionality
     */
    addToCompartment(fragment_json={}) {
        // We always need to process containers firt so the sequence is :
        //  1. Compartments
        //  2. Virtual Cloud Networks
        //  3. Subnets

        // Process Add Sub Compartments
        // process Add Virtual Cloud Networks
        fragment_json.virtual_cloud_networks.forEach(function (artifact) {
            artifact.compartment_id = this.compartment_id;
            this.getOkitJson().newVirtualCloudNetwork(artifact);
        }, this);
        // Remaining Artifacts
        this.addToVirtualCloudNetwork(fragment_json, null);
    }

    addToVirtualCloudNetwork(fragment_json={}, vcn_id=null) {
        let ignore_elements = [this.artifactToElement(compartment_artifact), this.artifactToElement(virtual_cloud_network_artifact), this.artifactToElement(subnet_artifact)];
        // Process Subnets (Container)
        fragment_json.subnets.forEach(function (artifact) {
            artifact.compartment_id = this.compartment_id;
            if (vcn_id !== null) {
                artifact.vcn_id = vcn_id;
            }
            this.getOkitJson().newSubnet(artifact);
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
        if (key === this.artifactToElement(autonomous_database_artifact)) {
            // Process Autonomous Databases
            fragment_json.autonomous_databases.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newAutonomousDatabase(artifact);
            }, this);
        } else if (key === this.artifactToElement(block_storage_volume_artifact)) {
            // Process Block Storage Volumes
            fragment_json.block_storage_volumes.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newBlockStorageVolume(artifact);
            }, this);
        } else if (key === this.artifactToElement(dynamic_routing_gateway_artifact)) {
            // Process Dynamic Routing Gateways
            fragment_json.dynamic_routing_gateways.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                this.getOkitJson().newDynamicRoutingGateway(artifact);
            }, this);
        } else if (key === this.artifactToElement(fast_connect_artifact)) {
            // Process Fast Connects
            fragment_json.fast_connects.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                this.getOkitJson().newFastConnect(artifact);
            }, this);
        } else if (key === this.artifactToElement(instance_artifact)) {
            // Process Instances
            fragment_json.instances.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newInstance(artifact);
            }, this);
        } else if (key === this.artifactToElement(internet_gateway_artifact)) {
            // Process Internet Gateways
            fragment_json.internet_gateways.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                this.getOkitJson().newInternetGateway(artifact);
            }, this);
        } else if (key === this.artifactToElement(load_balancer_artifact)) {
            // Process Load Balancers
            fragment_json.load_balancers.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newLoadBalancer(artifact);
            }, this);
        } else if (key === this.artifactToElement(nat_gateway_artifact)) {
            // Process NAT Gateways
            fragment_json.nat_gateways.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                this.getOkitJson().newNATGateway(artifact);
            }, this);
        } else if (key === this.artifactToElement(object_storage_bucket_artifact)) {
            // Process Object Storage Buckets
            fragment_json.object_storage_buckets.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newObjectStorageBucket(artifact);
            }, this);
        } else if (key === this.artifactToElement(route_table_artifact)) {
            // Process Route Tables
            fragment_json.route_tables.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                this.getOkitJson().newRouteTable(artifact);
            }, this);
        } else if (key === this.artifactToElement(security_list_artifact)) {
            // Process Security Lists
            fragment_json.security_lists.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                this.getOkitJson().newSecurityList(artifact);
            }, this);
        } else if (key === this.artifactToElement(service_gateway_artifact)) {
            // Process Service Gateways
            fragment_json.service_gateways.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                this.getOkitJson().newServiceGateway(artifact);
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
        // Need local variables for ajax success to access
        let vcn_id = this.parent_id;
        let me = this;
        $.ajax({
            type: 'get',
            url: this.fragment_url,
            dataType: 'text',
            contentType: 'application/json',
            success: function(resp) {
                let fragment_json = JSON.parse(resp);
                // Add Fragment to Json
                if (me.parent_type === compartment_artifact) {
                    me.addToCompartment(fragment_json);
                } else if (me.parent_type === virtual_cloud_network_artifact) {
                    me.addToVirtualCloudNetwork(fragment_json, vcn_id);
                } else {
                    console.warn('Invalid Drop Parent ' + me.parent_type);
                }
                displayOkitJson();
                drawSVGforJson();
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
            }
        });
    }


    delete() {

    }

    draw() {

    }
}

