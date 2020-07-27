/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Security List Javascript');

const security_list_query_cb = "security-list-query-cb";

/*
** Define Security List Class
 */
class SecurityList extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.security_lists.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.egress_security_rules = [];
        this.ingress_security_rules = [];
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new SecurityList(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Subnet references
        for (let subnet of this.getOkitJson().subnets) {
            for (let i=0; i < subnet.security_list_ids.length; i++) {
                if (subnet.security_list_ids[i] === this.id) {
                    subnet.security_list_ids.splice(i, 1);
                }
            }
        }
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'sl';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Security List';
    }

    static query1(request = {}, region='') {
        console.info('------------- Security List Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/SecurityList',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({security_lists: response_json});
                for (let artefact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artefact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + security_list_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + security_list_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }


    /*
    ** Artifact Specific Functions
     */
    addDefaultSecurityListRules(vcn_cidr_block='10.0.0.0/16') {
        console.info('Adding Default Security List Rules for ' + this.id);
        // Add Egress Rule
        this.egress_security_rules.push(
            {
                "destination": "0.0.0.0/0",
                "destination_type": "CIDR_BLOCK",
                "icmp_options": null,
                "is_stateless": false,
                "protocol": "all",
                "tcp_options": null,
                "udp_options": null,
                "description": ""
            }
        );
        // Ingress Rules
        this.ingress_security_rules.push(
            {
                "icmp_options": null,
                "is_stateless": false,
                "protocol": "6",
                "source": "0.0.0.0/0",
                "source_type": "CIDR_BLOCK",
                "tcp_options": {
                    "destination_port_range": {
                        "max": 22,
                        "min": 22
                    },
                    "source_port_range": null
                },
                "udp_options": null,
                "description": ""
            }
        );
        this.ingress_security_rules.push(
            {
                "icmp_options": {
                    "code": 4,
                    "type": 3
                },
                "is_stateless": false,
                "protocol": "1",
                "source": "0.0.0.0/0",
                "source_type": "CIDR_BLOCK",
                "tcp_options": null,
                "udp_options": null,
                "description": ""
            }
        );
        this.ingress_security_rules.push(
            {
                "icmp_options": {
                    "code": null,
                    "type": 3
                },
                "is_stateless": false,
                "protocol": "1",
                "source": vcn_cidr_block,
                "source_type": "CIDR_BLOCK",
                "tcp_options": null,
                "udp_options": null,
                "description": ""
            }
        );
    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', security_list_query_cb);
    cell.append('label').text(SecurityList.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(SecurityList.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'security_list_name_filter')
        .attr('name', 'security_list_name_filter');
});















