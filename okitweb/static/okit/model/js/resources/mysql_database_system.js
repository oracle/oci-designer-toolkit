/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Database System Javascript');

/*
** Define Autonomous Database Class
 */
class MysqlDatabaseSystem extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.mysql_database_systems.length + 1);
        this.compartment_id = data.parent_id;
        this.availability_domain = 1;
        this.hostname_label = this.display_name.toLowerCase();
        this.shape_name = '';
        this.configuration_id = '';
        this.subnet_id = '';
        this.admin_username = 'admin';
        this.admin_password = '';
        this.description ='';
        this.mysql_version = '';
        this.port = '';
        this.port_x = '';
        this.data_storage_size_in_gb = 50;
        this.fault_domain = '';
        this.description = this.name;
        this.is_highly_available = false
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Check if built from a query
        if (this.availability_domain.length > 1) {
            this.region_availability_domain = this.availability_domain;
            this.availability_domain = this.getAvailabilityDomainNumber(this.region_availability_domain);
        }
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'mysql';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'MySQL Database System';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newMysqlDatabaseSystem = function(data) {
    console.info('New MySQL Database System');
    this.getMysqlDatabaseSystems().push(new MysqlDatabaseSystem(data, this));
    return this.getMysqlDatabaseSystems()[this.getMysqlDatabaseSystems().length - 1];
}
OkitJson.prototype.getMysqlDatabaseSystems = function() {
    if (!this.mysql_database_systems) this.mysql_database_systems = [];
    return this.mysql_database_systems;
}
OkitJson.prototype.getMysqlDatabaseSystem = function(id='') {
    for (let artefact of this.getMysqlDatabaseSystems()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteMysqlDatabaseSystem = function(id) {
    this.mysql_database_systems = this.mysql_database_systems ? this.mysql_database_systems.filter((r) => r.id !== id) : []
}
