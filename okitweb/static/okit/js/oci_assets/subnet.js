console.info('Loaded Subnet Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[subnet_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[subnet_artifact] = [];

const subnet_stroke_colour = "#ff6600";
const subnet_query_cb = "subnet-query-cb";

/*
** Query OCI
 */

function querySubnetAjax(compartment_id, vcn_id) {
    console.info('------------- querySubnetAjax --------------------');
    let request_json = {};
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
            //okitJson['subnets'] = response_json;
            okitJson.load({subnets: response_json});
            let len = response_json.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    console.info('querySubnetAjax : ' + response_json[i]['display_name']);
                    initiateSubnetSubQueries(compartment_id, response_json[i]['id']);
                }
            } else {
                initiateSubnetSubQueries(compartment_id, null);
            }
            redrawSVGCanvas();
            $('#' + subnet_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function (xhr, status, error) {
            console.info('Status : ' + status)
            console.info('Error : ' + error)
        }
    });
}

function initiateSubnetSubQueries(compartment_id, id='') {
    queryInstanceAjax(compartment_id, id);
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
        console.groupCollapsed('Delete ' + this.getArtifactReference() + ' : ' + id);
        // Delete Child Artifacts
        this.deleteChildren();
        // Remove SVG Element
        d3.select("#" + this.id + "-svg").remove()
        console.groupEnd();
    }

    deleteChildren() {
        // Remove Instances
        for (let child of this.getOkitJson().instances) {
            if (child.subnet_id === this.id) {
                child.delete();
            }
        }
        // Remove Load Balancers
        for (let child of this.getOkitJson().load_balancers) {
            if (child.subnet_id === this.id) {
                child.delete();
            }
        }
        // Remove File Storage Systems
        for (let child of this.getOkitJson().file_storage_systems) {
            if (child.subnet_id === this.id) {
                child.delete();
            }
        }
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
        let fill = d3.select('#' + this.id).attr('fill');
        svg.on("mouseover", function () {
            d3.selectAll('#' + me.id + '-vnic').attr('fill', svg_highlight_colour);
            d3.event.stopPropagation();
        });
        svg.on("mouseout", function () {
            d3.selectAll('#' + me.id + '-vnic').attr('fill', fill);
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
        definition['rect']['stroke']['colour'] = subnet_stroke_colour;
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
    // TODO: Delete
    getDimensions1() {
        console.groupCollapsed('Getting Dimensions of ' + subnet_artifact + ' : ' + this.id);
        let first_edge_child = this.getTopEdgeChildOffset();
        let first_load_balancer_child = this.getFirstLoadBalancerChildOffset(this.id);
        let first_instance_child = this.getFirstInstanceChildOffset(this.id);
        let first_child = this.getFirstChildOffset();
        let dimensions = {width:first_instance_child.dx, height:first_instance_child.dy};
        let max_load_balancer_dimensions = {width:0, height: 0, count:0};
        let max_instance_dimensions = {width:0, height: 0, count:0};
        let max_edge_dimensions = {width:0, height: 0, count:0};
        let max_file_storage_dimensions = {width:0, height: 0, count:0};
        // Get Subnet Details
        let subnet = {};
        for (subnet of okitJson['subnets']) {
            if (id == subnet['id']) {
                break;
            }
        }
        console.info('Base Dimensions : '+ JSON.stringify(dimensions));

        // Process Edge Artifacts
        if (okitJson.hasOwnProperty('security_lists')) {
            for (let security_list of okitJson['security_lists']) {
                if (subnet['security_list_ids'].indexOf(security_list['id']) >= 0) {
                    let edge_dimensions = getSecurityListDimensions(security_list['id']);
                    max_edge_dimensions['width'] += edge_dimensions['width'];
                    max_edge_dimensions['height'] = Math.max(max_edge_dimensions['height'], edge_dimensions['height']);
                    max_edge_dimensions['count'] += 1;
                }
            }
        }
        if (okitJson.hasOwnProperty('route_tables')) {
            for (let route_table of okitJson['route_tables']) {
                if (subnet['route_table_id'] == route_table['id']) {
                    let edge_dimensions = getRouteTableDimensions(route_table['id']);
                    max_edge_dimensions['width'] += edge_dimensions['width'];
                    max_edge_dimensions['height'] = Math.max(max_edge_dimensions['height'], edge_dimensions['height']);
                    max_edge_dimensions['count'] += 1;
                }
            }
        }
        dimensions['width'] = Math.max(dimensions['width'],
            Math.round(first_edge_child.dx + positional_adjustments.spacing.x + max_edge_dimensions['width'] + (max_edge_dimensions['count'] - 1) * positional_adjustments.spacing.x)
        );
        console.info('Post Edge Dimensions : '+ JSON.stringify(dimensions));

        // Process Load Balancers
        if (okitJson.hasOwnProperty('load_balancers')) {
            for (let load_balancer of okitJson['load_balancers']) {
                if (load_balancer['subnet_ids'][0] == id) {
                    let load_balancer_dimensions = getLoadBalancerDimensions(load_balancer['id']);
                    max_load_balancer_dimensions['width'] += Math.round(load_balancer_dimensions['width'] + positional_adjustments.spacing.x);
                    dimensions['height'] = Math.max(dimensions['height'], (first_load_balancer_child.dy + positional_adjustments.spacing.y + load_balancer_dimensions['height'] + positional_adjustments.padding.y));
                }
            }
        }
        dimensions['width'] = Math.max(dimensions['width'],
            Math.round(first_load_balancer_child.dx + positional_adjustments.spacing.x + max_load_balancer_dimensions['width'] + positional_adjustments.padding.x)
        );
        console.info('Load Balancer Offsets         : '+ JSON.stringify(first_load_balancer_child));
        console.info('Post Load Balancer Dimensions : '+ JSON.stringify(dimensions));

        // Process Instances
        if (okitJson.hasOwnProperty('instances')) {
            for (let instance of okitJson['instances']) {
                if (instance['subnet_id'] == id) {
                    let instance_dimensions = getInstanceDimensions(instance['id']);
                    max_instance_dimensions['width'] += Math.round(instance_dimensions['width'] + positional_adjustments.spacing.x);
                    dimensions['height'] = Math.max(dimensions['height'], (first_instance_child.dy + positional_adjustments.padding.y + instance_dimensions['height']));
                }
            }
        }
        dimensions['width'] = Math.max(dimensions['width'],
            Math.round(first_instance_child.dx + positional_adjustments.spacing.x + max_instance_dimensions['width'] + positional_adjustments.padding.x)
        );
        console.info('Instance Offsets              : '+ JSON.stringify(first_instance_child));
        console.info('Post Instance Dimensions      : '+ JSON.stringify(dimensions));

        // File Storage Systems
        if (okitJson.hasOwnProperty('file_storage_systems')) {
            for (let file_storage_system of okitJson['file_storage_systems']) {
                if (file_storage_system['subnet_id'] == id) {
                    let file_storage_dimensions = getFileStorageSystemDimensions(file_storage_system['id']);
                    max_file_storage_dimensions['height'] += Math.round(file_storage_dimensions['height'] + positional_adjustments.spacing.y);
                }
            }
        }
        dimensions['height'] = Math.max(dimensions['height'],
            Math.round(first_child.dy + positional_adjustments.spacing.y + max_file_storage_dimensions['height'] + positional_adjustments.padding.y));
        console.info('Post File System Dimensions   : '+ JSON.stringify(dimensions));

        // Check size against minimum
        dimensions['width']  = Math.max(dimensions['width'],  this.getMinimumDimensions().width);
        dimensions['height'] = Math.max(dimensions['height'], this.getMinimumDimensions().height);

        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));

        console.groupEnd();
        return dimensions;
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
                if (me.vcn_id == route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            let security_lists_select = $('#security_list_ids');
            for (let security_list of okitJson.security_lists) {
                if (me.vcn_id == security_list.vcn_id) {
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
    ** Artifact Specific Functions
     */
    hasLoadBalancer() {
        for (let load_balancer of this.getOkitJson().load_balancers) {
            if (load_balancer.subnet_ids[0] === this.id) {
                return true;
            }
        }
        return false;
    }

    hasFileStorageSystem() {
        for (let file_storage_system of this.getOkitJson().file_storage_systems) {
            if (file_storage_system.subnet_id === this.id) {
                return true;
            }
        }
        return false;
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
