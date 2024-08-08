/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKE Javascript');

/*
** Define Compartment Artifact Class
 */
class OkeCluster extends OkitArtifact {
    /*
    ** Create
     */
    constructor(data = {}, okitjson = {}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = '';
        // this.display_name = this.generateDefaultName(okitjson.oke_clusters.length + 1);
        this.vcn_id = '';
        this.kubernetes_version = '';
        this.cluster_pod_network_options = [this.newClusterPodNetworkOption()]
        this.options = this.newOptions();
        this.endpoint_config = this.newEndpointConfig()
        this.type = 'BASIC_CLUSTER'
        this.node_pool_type = 'Managed'
        // this.pools = []
            /*
            Each pool entry will have the following structure
            {
                name: this.display_name + '_pool1',
                node_config_details: {
                    placement_configs: [{availability_domain: 1, subnet_id: ''}],
                    size: 3
                },
                node_shape: 'VM.Standard.E2.1',
                subnet_ids: [],
                node_source_details: {os: 'Oracle Linux', os_version: '7.8', image: '', boot_volume_size_in_gbs: '50', source_type: 'image'},
                ssh_public_key: ''
            }
            */
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Check if built from a query
        // for (let pool of this.pools) {
        //     for (let config of pool.node_config_details.placement_configs) {
        //         if (config.availability_domain.length > 1) {
        //             config.region_availability_domain = config.availability_domain;
        //             config.availability_domain = this.getAvailabilityDomainNumber(config.region_availability_domain);
        //         }
        //     }
        // }
    }

    /*
    ** OKE Cluster Elements
    */
    newOptions() {
        return {
            add_ons: this.newAddOns(),
            admission_controller_options: this.newAdmissionControllerOptions(),
            kubernetes_network_config: this.newKubernetesNetworkConfig(),
            service_lb_subnet_ids: []
        }
    }
    newAddOns() {
        return {
            is_kubernetes_dashboard_enabled: false, 
            is_tiller_enabled: false
        }
    }
    newAdmissionControllerOptions() {
        return {
            is_pod_security_policy_enabled: false
        }
    }
    newKubernetesNetworkConfig() {
        return {
            pods_cidr: '', 
            services_cidr: ''
        }
    }

    newEndpointConfig() {
        return {
            is_public_ip_enabled: false,
            nsg_ids: [],
            subnet_id: ''
        }
    }

    newClusterPodNetworkOption() {
        return {
            cni_type: 'OCI_VCN_IP_NATIVE'
        }
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert();
        if (this.pools) {
            this.pools.forEach((pool) => this.getOkitJson().newNodePool(pool))
            // delete this.pools
        }
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'oke';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Oke Cluster';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newOkeCluster = function(data) {
    console.info('New OkeCluster');
    this.getOkeClusters().push(new OkeCluster(data, this));
    return this.getOkeClusters()[this.getOkeClusters().length - 1];
}
OkitJson.prototype.getOkeClusters = function() {
    if (!this.oke_clusters) this.oke_clusters = [];
    return this.oke_clusters;
}
OkitJson.prototype.getOkeCluster = function(id='') {
    for (let artefact of this.getOkeClusters()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteOkeCluster = function(id) {
    this.oke_clusters = this.oke_clusters ? this.oke_clusters.filter((r) => r.id !== id) : []
}
