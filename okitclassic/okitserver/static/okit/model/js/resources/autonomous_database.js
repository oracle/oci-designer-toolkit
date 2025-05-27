/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Autonomous Database Javascript');

/*
** Define Autonomous Database Class
 */
class AutonomousDatabase extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.autonomous_databases.length + 1);
        this.compartment_id = data.parent_id;
        this.db_name = this.display_name.replace('-', '');
        this.admin_password = generatePassword();
        this.data_storage_size_in_tbs = 1;
        this.cpu_core_count = 1;
        this.db_workload = 'OLTP';
        // this.is_access_control_enabled = false
        this.is_auto_scaling_enabled = true;
        // this.is_auto_scaling_for_storage_enabled = true
        // this.is_data_guard_enabled = true 
        // this.is_dedicated = false 
        this.is_free_tier = false;
        this.license_model = 'BRING_YOUR_OWN_LICENSE';
        this.subnet_id = '';
        this.whitelisted_ips = [];
        this.nsg_ids = [];
        this.private_endpoint_label = this.display_name;
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'ad';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Autonomous Database';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newAutonomousDatabase = function(data) {
    console.info('New Autonomous Database');
    this.getAutonomousDatabases().push(new AutonomousDatabase(data, this));
    return this.getAutonomousDatabases()[this.getAutonomousDatabases().length - 1];
}
OkitJson.prototype.getAutonomousDatabases = function() {
    if (!this.autonomous_databases) this.autonomous_databases = [];
    return this.autonomous_databases;
}
OkitJson.prototype.getAutonomousDatabase = function(id='') {
    for (let artefact of this.getAutonomousDatabases()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteAutonomousDatabase = function(id) {
    this.autonomous_databases = this.autonomous_databases ? this.autonomous_databases.filter((r) => r.id !== id) : []
}
