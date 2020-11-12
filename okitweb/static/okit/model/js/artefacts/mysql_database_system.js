/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Database System Javascript');

/*
** Define Autonomous Database Class
 */
class MySQLDatabaseSystem extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.mysql_database_systems.length + 1);
        this.compartment_id = data.parent_id;
        this.availability_domain = 1;
        this.hostname_label = this.display_name.toLowerCase();
        this.shape_name = '';
        this.configuration_id = '';
        this.subnet_id = '';
        this.admin_username = '';
        this.admin_password = '';
        this.description ='';
        this.mysql_version = '';
        this.port = '';
        this.port_x = '';
        this.data_storage_size_in_gb = 256;
        this.fault_domain = '';
        this.description = this.name;
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Check if built from a query
        if (this.availability_domain.length > 1) {
            this.region_availability_domain = this.availability_domain;
            this.availability_domain = this.getAvailabilityDomainNumber(this.region_availability_domain);
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new MySQLDatabaseSystem(this, this.getOkitJson());
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
