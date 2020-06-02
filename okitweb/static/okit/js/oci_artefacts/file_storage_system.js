/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded File Storage System Javascript');

const file_storage_system_query_cb = "file-storage-system-query-cb";

/*
** Define File Storage System Class
 */
class FileStorageSystem extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.file_storage_systems.length + 1);
        this.compartment_id = '';
        this.availability_domain = '1';
        this.exports = [];
        this.mount_targets = [];
        // Update with any passed data
        this.merge(data);
        // Check if built from a query
        if (this.availability_domain.length > 1) {
            this.region_availability_domain = this.availability_domain;
            this.availability_domain = this.region_availability_domain.slice(-1);
        }
        if (this.exports.length > 0) {
            this.primary_export = this.exports[0];
        } else {
            this.primary_export = {path: '/mnt', export_options: {source: this.getOkitJson().getSubnet(data.parent_id)['cidr_block'], access: 'READ_ONLY', anonymous_gid: '', anonymous_uid: '', identity_squash: 'NONE', require_privileged_source_port: true}};
            this.exports[0] = this.primary_export;
        }
        if (this.mount_targets.length > 0) {
            this.primary_mount_target = this.mount_targets[0];
        } else {
            this.primary_mount_target = {subnet_id: data.parent_id, hostname_label: this.display_name.toLowerCase(), nsg_ids: [], export_set: {max_fs_stat_bytes: '', max_fs_stat_files: ''}};
            this.mount_targets[0] = this.primary_mount_target;
        }
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = () => {return parent};
        }
        this.convert();
        this.parent_id = this.primary_mount_target.subnet_id;
    }


    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        // Export Element
        if (this.exports === undefined) {this.export = [];}
        if (this.exports[0].export_options === undefined) {this.exports[0].export_options = {};}
        if (this.path !== undefined) {this.exports[0].path = this.path; delete this.path;}
        if (this.source !== undefined) {this.exports[0].export_options.source = this.source; delete this.source;}
        if (this.access !== undefined) {this.exports[0].export_options.access = this.access; delete this.access;}
        // Mount Target
        if (this.mount_targets === undefined) {this.mount_target = [{}];}
        if (this.subnet_id !== undefined) {this.mount_targets[0].subnet_id = this.subnet_id; delete this.subnet_id;}
        if (this.hostname_label !== undefined) {this.mount_target[0].hostname_label = this.hostname_label; delete this.hostname_label;}
    }

    /*
    ** Clone Functionality
     */
    clone() {
        return new FileStorageSystem(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {}


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let me = this;
        let svg = super.draw();
        console.groupEnd();
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        console.groupCollapsed('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let dimensions = this.getDimensions();
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    // Return Artifact Dimensions
    getDimensions() {
        console.groupCollapsed('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getMinimumDimensions();
        // Calculate Size based on Child Artifacts
        // Check size against minimum
        dimensions.width  = Math.max(dimensions.width,  this.getMinimumDimensions().width);
        dimensions.height = Math.max(dimensions.height, this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: icon_width, height:icon_height};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/file_storage_system.html", () => {
            // Build Network Security Groups
            let nsg_select = $(jqId('nsg_ids'));
            this.loadNetworkSecurityGroups(nsg_select, this.primary_mount_target.subnet_id);
            // Load Properties
            loadPropertiesSheet(me);
        });
    }

    loadNetworkSecurityGroups(select, subnet_id) {
        $(select).empty();
        let vcn = this.getOkitJson().getVirtualCloudNetwork(this.getOkitJson().getSubnet(subnet_id).vcn_id);
        for (let networkSecurityGroup of this.getOkitJson().network_security_groups) {
            if (networkSecurityGroup.vcn_id === vcn.id) {
                select.append($('<option>').attr('value', networkSecurityGroup.id).text(networkSecurityGroup.display_name));
            }
        }
    }


    /*
    ** Child Offset Functions
     */
    getFirstChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x),
            dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
        };
        return offset;
    }

    getContainerChildOffset() {
        let offset = this.getFirstContainerChildOffset();
        return offset;
    }

    getTopEdgeChildOffset() {
        let offset = this.getFirstTopEdgeChildOffset();
        return offset;
    }

    getBottomEdgeChildOffset() {}

    getLeftEdgeChildOffset() {}

    getRightEdgeChildOffset() {}

    getTopChildOffset() {
        let offset = this.getTopEdgeChildOffset();
        return offset;
    }

    getBottomChildOffset() {}

    getLeftChildOffset() {}

    getRightChildOffset() {}


    getNamePrefix() {
        return super.getNamePrefix() + 'fss';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'File Storage System';
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

    static query(request = {}, region='') {
        console.info('------------- queryFileStorageSystemAjax --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        console.info('------------- Subnet      : ' + request.subnet_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/FileStorageSystem',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({file_storage_systems: response_json});
                for (let artifact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artifact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + file_storage_system_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + file_storage_system_query_cb).prop('checked', true);
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
        .attr('id', file_storage_system_query_cb);
    cell.append('label').text(FileStorageSystem.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(FileStorageSystem.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'file_storage_system_name_filter')
        .attr('name', 'file_storage_system_name_filter');
});
