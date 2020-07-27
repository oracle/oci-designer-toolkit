/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Autonomous Database Javascript');

const autonomous_database_query_cb = "autonomous-database-query-cb";

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
        this.display_name = this.generateDefaultName(okitjson.autonomous_databases.length + 1);
        this.compartment_id = data.parent_id;
        this.db_name = this.display_name.replace('-', '');
        this.admin_password = generatePassword();
        this.data_storage_size_in_tbs = 1;
        this.cpu_core_count = 1;
        this.db_workload = 'OLTP';
        this.is_auto_scaling_enabled = true;
        this.is_free_tier = false;
        this.license_model = 'BRING_YOUR_OWN_LICENSE';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new AutonomousDatabase(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Instance references
        for (let instance of this.getOkitJson().instances) {
            for (let i=0; i < instance['autonomous_database_ids'].length; i++) {
                if (instance.autonomous_database_ids[i] === this.id) {
                    instance.autonomous_database_ids.splice(i, 1);
                }
            }
        }
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

    static query1(request = {}, region='') {
        console.info('------------- Autonomous Database Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/AutonomousDatabase',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({autonomous_databases: response_json});
                for (let artefact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artefact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + autonomous_database_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + autonomous_database_query_cb).prop('checked', true);
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
        .attr('id', autonomous_database_query_cb);
    cell.append('label').text(AutonomousDatabase.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(AutonomousDatabase.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'autonomous_database_name_filter')
        .attr('name', 'autonomous_database_name_filter');
});
