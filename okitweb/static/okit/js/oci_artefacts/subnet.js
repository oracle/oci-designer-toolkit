/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Subnet Javascript');


const subnet_query_cb = "subnet-query-cb";

/*
** Define Subnet Artifact Class
 */
class Subnet extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={},) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.subnets.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.cidr_block = this.generateCIDR(this.vcn_id);
        this.dns_label = this.display_name.toLowerCase().slice(-5);
        this.prohibit_public_ip_on_vnic = false;
        this.route_table_id = '';
        this.security_list_ids = [];
        this.availability_domain = '0';
        this.is_ipv6enabled = false;
        this.ipv6cidr_block = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new Subnet(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        console.groupCollapsed('Deleting Children of ' + this.getArtifactReference() + ' : ' + this.display_name);
        // Remove Instances
        this.getOkitJson().instances = this.getOkitJson().instances.filter(function(child) {
            if (child.primary_vnic.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                //child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        for (let instance of this.getOkitJson().instances) {
            instance.vnics = instance.vnics.filter(function(child) {
                if (child.subnet_id === this.id) {
                    console.info('Deleting ' + child.hostname_label);
                    return false; // So the filter removes the element
                }
                return true;
            }, this);
        }
        // Remove Load Balancers
        this.getOkitJson().load_balancers = this.getOkitJson().load_balancers.filter(function(child) {
            if (child.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                //child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Remove File Storage Systems
        this.getOkitJson().file_storage_systems = this.getOkitJson().file_storage_systems.filter(function(child) {
            if (child.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                //child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        console.groupEnd();
    }

    /*
    ** Utility Methods
     */
    generateCIDR(vcn_id) {
        let vcn_cidr = '10.0.0.0/16';
        for (let virtual_cloud_network of this.getOkitJson()['virtual_cloud_networks']) {
            if (virtual_cloud_network['id'] == vcn_id) {
                vcn_cidr = virtual_cloud_network['cidr_block'];
                break;
            }
        }
        let vcn_octets = vcn_cidr.split('/')[0].split('.');
        for (let i = 0; i < this.getOkitJson().subnets.length; i++) {
            if (this.getOkitJson().subnets[i].id === this.id) {
                return vcn_octets[0] + '.' + vcn_octets[1] + '.' + i + '.' + vcn_octets[3] + '/24';
            }
        }
        return vcn_octets[0] + '.' + vcn_octets[1] + '.' + this.getOkitJson().subnets.length + '.' + vcn_octets[3] + '/24';
    }


    /*
    ** Container Specific Overrides
     */

    getNamePrefix() {
        return super.getNamePrefix() + 'sn';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Subnet';
    }

    static query(request = {}, region='') {
        console.info('------------- Subnet Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/Subnet',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({subnets: response_json});
                for (let artifact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artifact.display_name);
                    me.querySubComponents(request, region, artifact.id);
                }
                redrawSVGCanvas(region);
                $('#' + subnet_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function (xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + subnet_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }

    static querySubComponents(request = {}, region='', id='') {
        let sub_query_request = JSON.clone(request);
        sub_query_request.subnet_id = id;
        LoadBalancer.query(sub_query_request, region);
    }
}

$(document).ready(function () {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', subnet_query_cb);
    cell.append('label').text(Subnet.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(Subnet.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'subnet_name_filter')
        .attr('name', 'subnet_name_filter');
});
