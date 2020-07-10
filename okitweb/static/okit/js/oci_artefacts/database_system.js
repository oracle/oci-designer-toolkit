/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Database System Javascript');

const database_system_query_cb = "database-system-query-cb";

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
        this.display_name = this.generateDefaultName(okitjson.database_systems.length + 1);
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
        this.shape = 'VM.Standard2.1';
        this.ssh_public_keys = '';
        this.subnet_id = data.parent_id;
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
        this.source = 'NONE'
        this.sparse_diskgroup = false;
        this.time_zone = '+00:00';
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
        return new DatabaseSystem(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Instance references
        for (let instance of this.getOkitJson().instances) {
            for (let i=0; i < instance['database_system_ids'].length; i++) {
                if (instance.database_system_ids[i] === this.id) {
                    instance.database_system_ids.splice(i, 1);
                }
            }
        }
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

    static query(request = {}, region='') {
        console.info('------------- Autonomous Database Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/DatabaseSystem',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({database_systems: response_json});
                for (let artifact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artifact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + database_system_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + database_system_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', database_system_query_cb);
    cell.append('label').text(DatabaseSystem.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(DatabaseSystem.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'database_system_name_filter')
        .attr('name', 'database_system_name_filter');
});
