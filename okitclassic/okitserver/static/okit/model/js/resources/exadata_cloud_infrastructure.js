/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Cloud Exadata Infrastructure Javascript');

/*
** Define Cloud Exadata Infrastructure Class
*/
class ExadataCloudInfrastructure extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.availability_domain = 1;
        this.shape = '';
        this.compute_count = null
        this.storage_count = null
        this.customer_contacts = []
        this.create_cluster = true
        this.cluster = this.newCluster()
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Expose Nested variables
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.cluster.subnet_id;}, set: function(id) {this.cluster.subnet_id = id;}, enumerable: true });
    }
    newCustomerContact() {
        return {email: ''}
    }
    newCluster() {
        return {
            resource_name: `${this.generateResourceName()}Cluster`,
            backup_subnet_id: '',
            cpu_core_count: 0,
            display_name: `${this.display_name}VMCluster`,
            gi_version: '',
            hostname: this.display_name,
            ssh_public_keys: '',
            subnet_id: '',
        
            backup_network_nsg_ids: [],
            cluster_name: `${this.display_name}`,
            data_collection_options: {
                is_diagnostics_events_enabled: true,
                is_health_monitoring_enabled: true,
                is_incident_logs_enabled: true
            },
            data_storage_percentage: 80,
            domain: '',
            is_local_backup_enabled: false,
            is_sparse_diskgroup_enabled: false,
            license_model: 'LICENSE_INCLUDED',
            nsg_ids: [],
            ocpu_count: 0,
            scan_listener_port_tcp: 1521,
            scan_listener_port_tcp_ssl: 2484,
            time_zone: ''
        }
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'eci';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Exadata Cloud Infrastructure';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newExadataCloudInfrastructure = function(data) {
    this.getExadataCloudInfrastructures().push(new ExadataCloudInfrastructure(data, this));
    return this.getExadataCloudInfrastructures()[this.getExadataCloudInfrastructures().length - 1];
}
OkitJson.prototype.getExadataCloudInfrastructures = function() {
    if (!this.exadata_cloud_infrastructures) this.exadata_cloud_infrastructures = []
    return this.exadata_cloud_infrastructures;
}
OkitJson.prototype.getExadataCloudInfrastructure = function(id='') {
    return this.getExadataCloudInfrastructures().find(r => r.id === id)
}
OkitJson.prototype.deleteExadataCloudInfrastructure = function(id) {
    this.exadata_cloud_infrastructures = this.exadata_cloud_infrastructures ? this.exadata_cloud_infrastructures.filter((r) => r.id !== id) : []
}

