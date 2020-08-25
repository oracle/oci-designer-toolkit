/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKE Javascript');

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
        this.display_name = this.generateDefaultName(okitjson.oke_clusters.length + 1);
        this.vcn_id = '';
        this.kubernetes_version = '';
        this.options = {
            add_ons: {is_kubernetes_dashboard_enabled: false, is_tiller_enabled: false},
            admission_controller_options: {is_pod_security_policy_enabled: false},
            kubernetes_network_config: {pods_cidr: '', services_cidr: ''},
            service_lb_subnet_ids: []
        };
        this.pools = []
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
        for (let pool of this.pools) {
            for (let config of pool.node_config_details.placement_configs) {
                if (config.availability_domain.length > 1) {
                    config.region_availability_domain = config.availability_domain;
                    config.availability_domain = this.getAvailabilityDomainNumber(config.region_availability_domain);
                }
            }
        }
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert();
    }

    /*
    ** Clone Functionality
     */
    clone() {
        return new OkeCluster(this, this.getOkitJson());
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