/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded NoSQL Database Javascript');

/*
** Define NoSQL Database Class
*/
class NosqlDatabase extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.ddl_statement = ''
        this.table_limits = {
            max_read_units: 0,
            max_storage_in_gbs: 1,
            max_write_units: 0,
            capacity_mode: 'ON_DEMAND'
        }
        this.is_auto_reclaimable = true        
        this.indexes = []
        this.pricing_estimates = {
            estimated_on_demand_reads_per_month: 0,
            estimated_on_demand_writes_per_month: 0
        }
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    convert() {
        super.convert()
        this.indexes.forEach((i) => i.resource_name = i.resource_name ? i.resource_name : `${this.resource_name}Index`)
    }

    newIndex() {
        return {
            resource_name: `${this.generateResourceName()}Index`,
            name: `${this.display_name}Index${this.indexes.length + 1}`,
            is_if_not_exists: true,
            keys: []
        }
    }
    newIndexKey() {
        return {
            column_name: '',
            json_field_type: '',
            json_path: ''
        }
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'nd';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'NoSQL Database';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newNosqlDatabase = function(data) {
    this.getNosqlDatabases().push(new NosqlDatabase(data, this));
    return this.getNosqlDatabases()[this.getNosqlDatabases().length - 1];
}
OkitJson.prototype.getNosqlDatabases = function() {
    if (!this.nosql_databases) this.nosql_databases = []
    return this.nosql_databases;
}
OkitJson.prototype.getNosqlDatabase = function(id='') {
    return this.getNosqlDatabases().find(r => r.id === id);
}
OkitJson.prototype.deleteNosqlDatabase = function(id) {
    this.nosql_databases = this.nosql_databases ? this.nosql_databases.filter((r) => r.id !== id) : []
}

