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
        this.display_name = this.generateDefaultName(okitjson.compartments.length + 1);
        this.vcn_id = '';
        this.kubernetes_version = '';
        this.options = {
            add_ons: {is_kubernetes_dashboard_enabled: false, is_tiller_enabled: false},
            admission_controller_options: {is_pod_security_policy_enabled: false},
            kubernetes_network_config: {pods_cidr: '', services_cidr: ''},
            service_lb_subnet_ids: []
        };
        this.pools = [{
            name: this.display_name + '_pool1',
            node_config_details: {
                placement_configs: [{availability_domain: 1, subnet_id: ''}],
                size: 3
            },
            node_shape: 'VM.Standard.E2.1',
            subnet_ids: [],
            node_source_details: {os: 'Oracle Linux', version: '7.8', boot_volume_size_in_gbs: '50', source_type: 'image'},
            ssh_public_key: ''
        }];
        // Update with any passed data
        this.merge(data);
        this.convert();
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
}