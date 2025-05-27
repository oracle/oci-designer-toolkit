/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Database System Javascript');

/*
** Define Autonomous Database Class
 */
class DatabaseSystem extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.database_systems.length + 1);
        this.compartment_id = data.parent_id;
        this.availability_domain = 1;
        this.database_edition = 'STANDARD_EDITION';
        this.db_home = {
            database: {
                admin_password: generatePassword(),
                db_name: this.display_name.replace('-', '').substr(4, 8),
                db_workload: 'OLTP'
            },
            db_version: '12.2.0.1'
        };
        this.hostname = this.display_name.toLowerCase();
        this.shape = '';
        this.ssh_public_keys = '';
        this.subnet_id = '';
        this.backup_network_nsg_ids = [];
        this.backup_subnet_id = '';
        this.cluster_name = '';
        this.cpu_core_count = 0;
        this.data_storage_percentage = 80;
        this.data_storage_size_in_gb = 256;
        this.db_system_options = {
            storage_management: 'ASM'
        }
        this.disk_redundancy = '';
        this.domain = '';
        this.fault_domains = [];
        this.license_model = 'LICENSE_INCLUDED';
        this.node_count = 1;
        this.nsg_ids = [];
        // this.source = 'NONE'
        // this.sparse_diskgroup = false;
        // this.time_zone = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'ds';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Database System';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDatabaseSystem = function(data) {
    console.info('New Database System');
    this.getDatabaseSystems().push(new DatabaseSystem(data, this));
    return this.getDatabaseSystems()[this.getDatabaseSystems().length - 1];
}
OkitJson.prototype.getDatabaseSystems = function() {
    if (!this.database_systems) this.database_systems = [];
    return this.database_systems;
}
OkitJson.prototype.getDatabaseSystem = function(id='') {
    for (let artefact of this.getDatabaseSystems()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteDatabaseSystem = function(id) {
    this.database_systems = this.database_systems ? this.database_systems.filter((r) => r.id !== id) : []
}
