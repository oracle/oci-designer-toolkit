/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Compartment Javascript');

const compartment_query_cb = "compartment-query-cb";

/*
** Define Compartment Artifact Class
 */
class Compartment extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = null;
        this.name = this.generateDefaultName(okitjson.compartments.length + 1);
        // Update with any passed data
        this.merge(data);
        this.convert();
        this.display_name = this.name;
    }

    /*
    ** Clone Functionality
     */
    clone() {
        return new Compartment(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        console.groupCollapsed('Deleting Children of ' + this.getArtifactReference() + ' : ' + this.display_name);
        // Remove Compartments
        this.getOkitJson().compartments = this.getOkitJson().compartments.filter(function(child) {
            if (child.compartment_id === this.id && child.id !== this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Virtual Cloud Networks
        this.getOkitJson().virtual_cloud_networks = this.getOkitJson().virtual_cloud_networks.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Block Storage Volumes
        this.getOkitJson().block_storage_volumes = this.getOkitJson().block_storage_volumes.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Object Storage Buckets
        this.getOkitJson().object_storage_buckets = this.getOkitJson().object_storage_buckets.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Autonomous Databases
        this.getOkitJson().autonomous_databases = this.getOkitJson().autonomous_databases.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        console.groupEnd();
        // Dynamic Routing Gateways
        this.getOkitJson().dynamic_routing_gateways = this.getOkitJson().dynamic_routing_gateways.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'comp';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Compartment';
    }

    static queryRoot(request = {}, region='') {
        console.info('------------- Compartment Query --------------------');
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/Compartment',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                response_json.parent_id = ROOT_CANVAS_ID;
                regionOkitJson[region].load({compartments: [response_json]});
                console.info(me.getArtifactReference() + ' Query : ' + response_json.name);
                me.querySubComponents(request, region, response_json.id);
                redrawSVGCanvas(region);
                $('#' + compartment_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
                $('#' + compartment_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }

    static query(request = {}, region='') {
        console.info('------------- Compartments Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/Compartments',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({compartments: response_json});
                for (let artefact of response_json) {
                    console.info(me.getArtifactReference() + 's Query : ' + artefact.display_name);
                    me.querySubComponents(request, region, artefact.id);
                }
                redrawSVGCanvas(region);
                $('#' + compartment_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
                $('#' + compartment_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }

    static querySubComponents(request = {}, region='', id='') {
        let sub_query_request = JSON.clone(request);
        sub_query_request.compartment_id = id;
        Compartment.query(sub_query_request, region);
        VirtualCloudNetwork.query(sub_query_request, region);
        BlockStorageVolume.query(sub_query_request, region);
        DynamicRoutingGateway.query(sub_query_request, region);
        AutonomousDatabase.query(sub_query_request, region);
        ObjectStorageBucket.query(sub_query_request, region);
        FastConnect.query(sub_query_request, region);
        Instance.query(sub_query_request, region);
        DatabaseSystem.query(sub_query_request, region);
        FileStorageSystem.query(sub_query_request, region);
    }
}

$(document).ready(function() {
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', compartment_query_cb);
    cell.append('label').text(Compartment.getArtifactReference());
});
