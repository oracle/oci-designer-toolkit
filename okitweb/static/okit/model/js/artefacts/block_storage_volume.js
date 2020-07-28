/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Block Storage Volume Javascript');

const block_storage_volume_query_cb = "block-storage-volume-query-cb";

/*
** Define Block Storage Volume Class
 */
class BlockStorageVolume extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.block_storage_volumes.length + 1);
        this.compartment_id = data.parent_id;
        this.availability_domain = '1';
        this.size_in_gbs = 1024;
        this.backup_policy = 'bronze';
        this.vpus_per_gb = '10';
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Check if built from a query
        if (this.availability_domain.length > 1) {
            this.region_availability_domain = this.availability_domain;
            this.availability_domain = this.region_availability_domain.slice(-1);
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new BlockStorageVolume(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Instance references
        for (let instance of this.getOkitJson().instances) {
            for (let i=0; i < instance.block_storage_volume_ids.length; i++) {
                if (instance.block_storage_volume_ids[i] === this.id) {
                    instance.block_storage_volume_ids.splice(i, 1);
                }
            }
        }
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'bsv';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Block Storage Volume';
    }

}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', block_storage_volume_query_cb);
    cell.append('label').text(BlockStorageVolume.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(BlockStorageVolume.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'block_storage_volume_name_filter')
        .attr('name', 'block_storage_volume_name_filter');
});
