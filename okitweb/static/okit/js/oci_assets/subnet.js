/*
** Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
** The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]
*/
console.info('Loaded Subnet Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[subnet_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[subnet_artifact] = [];

const subnet_query_cb = "subnet-query-cb";

/*
** Query OCI
 */
// TODO: Delete
function querySubnetAjax1(compartment_id, vcn_id) {
    console.info('------------- querySubnetAjax --------------------');
    let request_json = JSON.clone(okitQueryRequestJson);
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('subnet_filter' in okitQueryRequestJson) {
        request_json['subnet_filter'] = okitQueryRequestJson['subnet_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/Subnet',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function (resp) {
            let response_json = JSON.parse(resp);
            regionOkitJson[okitQueryRequestJson.region].load({subnets: response_json});
            //okitJson.load({subnets: response_json});
            let len = response_json.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    console.info('querySubnetAjax : ' + response_json[i]['display_name']);
                    initiateSubnetSubQueries(compartment_id, response_json[i]['id']);
                }
            } else {
                initiateSubnetSubQueries(compartment_id, null);
            }
            redrawSVGCanvas(okitQueryRequestJson.region);
            $('#' + subnet_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function (xhr, status, error) {
            console.info('Status : ' + status)
            console.info('Error : ' + error)
            $('#' + subnet_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        }
    });
}
// TODO: Delete
function initiateSubnetSubQueries(compartment_id, id='') {
    //queryInstanceAjax(compartment_id, id);
    queryLoadBalancerAjax(compartment_id, id);
    queryFileStorageSystemAjax(compartment_id, id);
}

/*
** Define Subnet Artifact Class
 */
class Subnet extends OkitContainerArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.id = 'okit-' + subnet_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(subnet_prefix, okitjson.subnets.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.cidr_block = this.generateCIDR(this.vcn_id);
        this.dns_label = this.display_name.toLowerCase().slice(-5);
        this.prohibit_public_ip_on_vnic = false;
        this.route_table_id = '';
        this.security_list_ids = [];
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.vcn_id;
        for (let parent of okitjson.virtual_cloud_networks) {
            if (parent.id === this.parent_id) {
                this.getParent = function() {return parent};
                break;
            }
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new Subnet(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return subnet_artifact;
    }


    /*
    ** Delete Processing
     */
    delete() {
        console.groupCollapsed('Delete ' + this.getArtifactReference() + ' : ' + this.id);
        // Delete Child Artifacts
        this.deleteChildren();
        // Remove SVG Element
        d3.select("#" + this.id + "-svg").remove()
        console.groupEnd();
    }

    deleteChildren() {
        console.groupCollapsed('Deleting Children of ' + this.getArtifactReference() + ' : ' + this.display_name);
        // Remove Instances
        this.getOkitJson().instances = this.getOkitJson().instances.filter(function(child) {
            if (child.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Remove Load Balancers
        this.getOkitJson().load_balancers = this.getOkitJson().load_balancers.filter(function(child) {
            if (child.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Remove File Storage Systems
        this.getOkitJson().file_storage_systems = this.getOkitJson().file_storage_systems.filter(function(child) {
            if (child.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        console.groupEnd();
    }


    /*
     ** SVG Processing
     */
    draw() {
        this.parent_id = this.vcn_id;
        let id = this.id;
        console.groupCollapsed('Drawing ' + subnet_artifact + ' : ' + this.id + ' [' + this.parent_id + ']');
        let svg = drawArtifact(this.getSvgDefinition());

        // Add Properties Load Event to created svg
        let me = this;
        svg.on("click", function () {
            me.loadProperties();
            d3.event.stopPropagation();
        });
        let fill = d3.select(d3Id(this.id)).attr('fill');
        svg.on("mouseover", function () {
            d3.selectAll(d3Id(me.id + '-vnic')).attr('fill', svg_highlight_colour);
            d3.event.stopPropagation();
        });
        svg.on("mouseout", function () {
            d3.selectAll(d3Id(me.id + '-vnic')).attr('fill', fill);
            d3.event.stopPropagation();
        });
        this.drawAttachments();
        console.groupEnd();
    }

    drawAttachments() {
        console.info('Drawing ' + subnet_artifact + ' : ' + this.id + ' Attachments');
        let attachment_count = 0;
        // Draw Route Table
        if (this.route_table_id !== '') {
            let artifact_clone = new RouteTable(this.getOkitJson().getRouteTable(this.route_table_id), this.getOkitJson(), this);
            artifact_clone['parent_id'] = this.id;
            console.info('Drawing ' + this.getArtifactReference() + ' Route Table : ' + artifact_clone.display_name);
            artifact_clone.draw();
            attachment_count += 1;
        }
        // Security Lists
        for (let security_list_id of this.security_list_ids) {
            let artifact_clone = new SecurityList(this.getOkitJson().getSecurityList(security_list_id), this.getOkitJson(), this);
            artifact_clone['parent_id'] = this.id;
            console.info('Drawing ' + this.getArtifactReference() + ' Security List : ' + artifact_clone.display_name);
            artifact_clone.draw();
            attachment_count += 1;
        }
    }

    getSvgDefinition() {
        console.groupCollapsed('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getDimensions(this.id);
        let definition = this.newSVGDefinition(this, subnet_artifact);
        // Get Parents First Child Container Offset
        let parent_first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = parent_first_child.dx;
        definition['svg']['y'] = parent_first_child.dy;
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.orange;
        definition['rect']['stroke']['dash'] = 5;
        definition['icon']['x_translation'] = icon_translate_x_start;
        definition['icon']['y_translation'] = icon_translate_y_start;
        definition['name']['show'] = true;
        definition['label']['show'] = true;
        if (this.prohibit_public_ip_on_vnic) {
            definition['label']['text'] = 'Private ' + subnet_artifact;
        } else  {
            definition['label']['text'] = 'Public ' + subnet_artifact;
        }
        definition['info']['show'] = true;
        definition['info']['text'] = this.cidr_block;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    getDimensions() {
        return super.getDimensions('subnet_id');
    }

    getMinimumDimensions() {
        return {width: 400, height: 150};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $("#properties").load("propertysheets/subnet.html", function () {
            // Load Referenced Ids
            let route_table_select = $('#route_table_id');
            for (let route_table of okitJson.route_tables) {
                if (me.vcn_id === route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            let security_lists_select = $('#security_list_ids');
            for (let security_list of okitJson.security_lists) {
                if (me.vcn_id === security_list.vcn_id) {
                    security_lists_select.append($('<option>').attr('value', security_list.id).text(security_list.display_name));
                }
            }
            // Load Properties
            loadProperties(me);
            // Add Event Listeners
            addPropertiesEventListeners(me, []);
        });
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
        return vcn_octets[0] + '.' + vcn_octets[1] + '.' + this.getOkitJson().subnets.length + '.' + vcn_octets[3] + '/24';
    }


    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        return [compartment_artifact];
    }


    /*
    ** Child Artifact Functions
     */
    getTopEdgeArtifacts() {
        return [route_table_artifact, security_list_artifact];
    }

    getTopArtifacts() {
        return [load_balancer_artifact];
    }

    getBottomArtifacts() {
        return [instance_artifact];
    }

    getLeftArtifacts() {
        return [file_storage_system_artifact];
    }


    /*
    ** Container Specific Overrides
     */
    // return the name of the element used by the child to reference this artifact
    getParentKey() {
        return 'subnet_id';
    }

    /*
    ** Static Query Functionality
     */

    static query(request = {}, region='') {
        console.info('------------- Subnet Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/Subnet',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({subnets: response_json});
                let len = response_json.length;
                if (len > 0) {
                    for (let i = 0; i < len; i++) {
                        console.info('Subnet Query : ' + response_json[i]['display_name']);
                        me.querySubComponents(request, region, response_json[i]['id']);
                    }
                } else {
                    me.querySubComponents(request, region, null);
                }
                redrawSVGCanvas(region);
                $('#' + subnet_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            },
            error: function (xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + subnet_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            }
        });
    }

    static querySubComponents(request = {}, region='', id='') {
        let sub_query_request = JSON.clone(request);
        sub_query_request.subnet_id = id;
        LoadBalancer.query(sub_query_request, region);
        FileStorageSystem.query(sub_query_request, region);
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
    cell.append('label').text(subnet_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(subnet_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'subnet_name_filter')
        .attr('name', 'subnet_name_filter');
});
