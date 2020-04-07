/*
** Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Fragments Javascript');

const fragment_artifact = 'Fragment';
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
        //this.fragment_url = '/static/okit/templates/' + this.title.toLowerCase().split(' ').join('_') + '.json';

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
        fragment_json.virtual_cloud_networks.forEach(function (artifact) {
            artifact.compartment_id = compartment_id;
            artifact.parent_id = compartment_id;
            this.getOkitJson().newVirtualCloudNetwork(artifact);
        }, this);
        // Remaining Artifacts
        this.addToVirtualCloudNetwork(fragment_json, null);
    }

    addToVirtualCloudNetwork(fragment_json={}, vcn_id=null) {
        console.info('Adding Fragment to Virtual Cloud Network ' + vcn_id);
        let ignore_elements = [this.artifactToElement(Compartment.getArtifactReference()), this.artifactToElement(VirtualCloudNetwork.getArtifactReference()), this.artifactToElement(subnet_artifact)];
        // Process Subnets (Container)
        fragment_json.subnets.forEach(function (artifact) {
            artifact.compartment_id = this.compartment_id;
            if (vcn_id !== null) {
                artifact.vcn_id = vcn_id;
            }
            artifact.parent_id = artifact.vcn_id;
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
        if (key === this.artifactToElement(AutonomousDatabase.getArtifactReference())) {
            // Process Autonomous Databases
            fragment_json.autonomous_databases.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newAutonomousDatabase(artifact);
            }, this);
        } else if (key === this.artifactToElement(BlockStorageVolume.getArtifactReference())) {
            // Process Block Storage Volumes
            fragment_json.block_storage_volumes.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newBlockStorageVolume(artifact);
            }, this);
        } else if (key === this.artifactToElement(DynamicRoutingGateway.getArtifactReference())) {
            // Process Dynamic Routing Gateways
            fragment_json.dynamic_routing_gateways.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                artifact.parent_id = artifact.vcn_id;
                this.getOkitJson().newDynamicRoutingGateway(artifact);
            }, this);
        } else if (key === this.artifactToElement(FastConnect.getArtifactReference())) {
            // Process Fast Connects
            fragment_json.fast_connects.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                this.getOkitJson().newFastConnect(artifact);
            }, this);
        } else if (key === this.artifactToElement(FileStorageSystem.getArtifactReference())) {
            // Process File Storage System
            fragment_json.file_storage_systems.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newFileStorageSystem(artifact);
            }, this);
        } else if (key === this.artifactToElement(Instance.getArtifactReference())) {
            // Process Instances
            fragment_json.instances.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newInstance(artifact);
            }, this);
        } else if (key === this.artifactToElement(InternetGateway.getArtifactReference())) {
            // Process Internet Gateways
            fragment_json.internet_gateways.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                artifact.parent_id = artifact.vcn_id;
                this.getOkitJson().newInternetGateway(artifact);
            }, this);
        } else if (key === this.artifactToElement(LoadBalancer.getArtifactReference())) {
            // Process Load Balancers
            fragment_json.load_balancers.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newLoadBalancer(artifact);
            }, this);
        } else if (key === this.artifactToElement(NATGateway.getArtifactReference())) {
            // Process NAT Gateways
            fragment_json.nat_gateways.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                artifact.parent_id = artifact.vcn_id;
                this.getOkitJson().newNATGateway(artifact);
            }, this);
        } else if (key === this.artifactToElement(ObjectStorageBucket.getArtifactReference())) {
            // Process Object Storage Buckets
            fragment_json.object_storage_buckets.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                this.getOkitJson().newObjectStorageBucket(artifact);
            }, this);
        } else if (key === this.artifactToElement(RouteTable.getArtifactReference())) {
            // Process Route Tables
            fragment_json.route_tables.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                artifact.parent_id = artifact.vcn_id;
                this.getOkitJson().newRouteTable(artifact);
            }, this);
        } else if (key === this.artifactToElement(SecurityList.getArtifactReference())) {
            // Process Security Lists
            fragment_json.security_lists.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                artifact.parent_id = artifact.vcn_id;
                this.getOkitJson().newSecurityList(artifact);
            }, this);
        } else if (key === this.artifactToElement(ServiceGateway.getArtifactReference())) {
            // Process Service Gateways
            fragment_json.service_gateways.forEach(function (artifact) {
                artifact.compartment_id = this.compartment_id;
                if (vcn_id !== null) {
                    artifact.vcn_id = vcn_id;
                }
                artifact.parent_id = artifact.vcn_id;
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
        console.info(this);
        // Need local variables for ajax success to access
        let me = this;
        $.ajax({
            type: 'get',
            url: this.fragment_url,
            dataType: 'text',
            contentType: 'application/json',
            success: function(resp) {
                let fragment_json = JSON.parse(resp);
                // Add Fragment to Json
                if (me.parent_type === Compartment.getArtifactReference()) {
                    me.addToCompartment(fragment_json, me.compartment_id);
                } else if (me.parent_type === VirtualCloudNetwork.getArtifactReference()) {
                    me.addToVirtualCloudNetwork(fragment_json, me.vcn_id);
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

