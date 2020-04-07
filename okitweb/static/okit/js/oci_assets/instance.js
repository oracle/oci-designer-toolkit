/*
** Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Instance Javascript');

asset_connect_targets[instance_artifact] = [load_balancer_artifact];

const instance_query_cb = "instance-query-cb";
const min_instance_width = Math.round((icon_width * 3) + (icon_spacing * 4));
const min_instance_height = Math.round(icon_height * 5 / 2);

/*
** Define Instance Class
 */
class Instance extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        // # Required
        this.display_name = this.generateDefaultName(okitjson.instances.length + 1);
        this.availability_domain = '1';
        this.compartment_id = '';
        this.shape = 'VM.Standard2.1';
        // # Optional
        this.fault_domain = '';
        this.hostname_label = this.display_name.toLowerCase();
        this.agent_config = {is_monitoring_disabled: false, is_management_disabled: false};
        this.vnics = [];
        this.source_details = {os: 'Oracle Linux', version: '7.7', boot_volume_size_in_gbs: '50'};
        this.metadata = {authorized_keys: '', user_data: ''};
        this.block_storage_volume_ids = [];
        this.object_storage_bucket_ids = [];
        this.autonomous_database_ids = [];
        this.preserve_boot_volume = false;
        this.is_pv_encryption_in_transit_enabled = false;
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Check if built from a query
        if (this.availability_domain.length > 1) {
            this.region_availability_domain = this.availability_domain;
            this.availability_domain = this.region_availability_domain.slice(-1);
        }
        if (this.vnics.length > 0) {
            this.primary_vnic = this.vnics[0];
        } else {
            this.primary_vnic = {subnet_id: ''};
            this.vnics[0] = this.primary_vnic;
        }
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = () => {return parent};
        }
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        // Move Metadata elements
        if (this.metadata === undefined) {this.metadata = {};}
        if (this.cloud_init_yaml !== undefined) {this.metadata.user_data = String(this.cloud_init_yaml); delete this.cloud_init_yaml;}
        if (this.authorized_keys !== undefined) {this.metadata.authorized_keys = this.authorized_keys; delete this.authorized_keys;}
        // Move Source Details elements
        if (this.source_details === undefined) {this.source_details = {};}
        if (this.os !== undefined) {this.source_details.os = this.os; delete this.os;}
        if (this.version !== undefined) {this.source_details.version = this.version; delete this.version;}
        if (this.boot_volume_size_in_gbs !== undefined) {this.source_details.boot_volume_size_in_gbs = this.boot_volume_size_in_gbs; delete this.boot_volume_size_in_gbs;}
        // Move Subnet_ids
        if (this.vnics === undefined) {this.vnics = [];}
        if (this.subnet_ids !== undefined) {if (this.subnet_ids.length > 0) {for (let subnet_id of this.subnet_ids) {this.vnics.push({subnet_id: subnet_id})}} delete this.subnet_ids;}
        if (this.subnet_id !== undefined) {if (this.vnics.length === 0) {this.vnics.push({subnet_id: ''})} this.vnics[0].subnet_id = this.subnet_id; delete this.subnet_id;}
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new Instance(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Load Balancer references
        for (let load_balancer of this.getOkitJson().load_balancers) {
            for (let i = 0; i < load_balancer.instance_ids.length; i++) {
                if (load_balancer.instance_ids[i] === this.id) {
                    load_balancer.instance_ids.splice(i, 1);
                }
            }
        }
    }


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let svg = drawArtifact(this.getSvgDefinition());
        /*
        ** Add Properties Load Event to created svg. We require the definition of the local variable "me" so that it can
        ** be used in the function dur to the fact that using "this" in the function will refer to the function not the
        ** Artifact.
         */
        let me = this;
        svg.on("click", function() {
            me.loadProperties();
            d3.event.stopPropagation();
        });
        // Get Inner Rect to attach Connectors
        let rect = svg.select("rect[id='" + safeId(this.id) + "']");
        if (rect && rect.node()) {
            let boundingClientRect = rect.node().getBoundingClientRect();
            // Add Connector Data
            svg.attr("data-compartment-id", this.compartment_id)
                .attr("data-connector-start-y", boundingClientRect.y)
                .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-end-y", boundingClientRect.y)
                .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-id", this.id)
                .attr("dragable", true)
                .selectAll("*")
                .attr("data-connector-start-y", boundingClientRect.y)
                .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-end-y", boundingClientRect.y)
                .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-id", this.id)
                .attr("dragable", true);
            // Draw Attachments
            this.drawAttachments();
        }
        console.groupEnd();
        return svg;
    }

    drawAttachments() {
        console.groupCollapsed('Drawing ' + instance_artifact + ' : ' + this.id + ' Attachments');
        let attachment_count = 0;
        for (let block_storage_id of this.block_storage_volume_ids) {
            let artifact_clone = new BlockStorageVolume(this.getOkitJson().getBlockStorageVolume(block_storage_id), this.getOkitJson(), this);
            artifact_clone['parent_id'] = this.id;
            console.info('Drawing ' + this.getArtifactReference() + ' Block Storage Volume : ' + artifact_clone.display_name);
            artifact_clone.draw();
            attachment_count += 1;
        }
        for (let vnic of this.vnics) {
            let subnet_id = vnic.subnet_id;
            if (subnet_id !== '' && subnet_id != this.parent_id) {
                let artifact_clone = new VirtualNetworkInterface(this.getOkitJson().getSubnet(subnet_id), this.getOkitJson(), this);
                // Add the -vnic suffix
                artifact_clone.id += '-vnic';
                artifact_clone['parent_id'] = this.id;
                console.info('Drawing ' + this.getArtifactReference() + ' Virtual Network Interface : ' + artifact_clone.display_name);
                let svg = artifact_clone.draw();
                // Add Highlighting
                let fill = d3.select(d3Id(artifact_clone.id)).attr('fill');
                svg.on("mouseover", function () {
                    d3.selectAll(d3Id(artifact_clone.id)).attr('fill', svg_highlight_colour);
                    d3.select(d3Id(subnet_id)).attr('fill', svg_highlight_colour);
                    d3.event.stopPropagation();
                });
                svg.on("mouseout", function () {
                    d3.selectAll(d3Id(artifact_clone.id)).attr('fill', fill);
                    d3.select(d3Id(subnet_id)).attr('fill', fill);
                    d3.event.stopPropagation();
                });
                /*
                for (let subnet of this.getOkitJson().subnets) {
                    if (subnet_id == subnet['id']) {
                        let artifact_clone = new VirtualNetworkInterface(subnet, this.getOkitJson(), this);
                        artifact_clone['parent_id'] = this.id;
                        artifact_clone.draw();
                        //this.drawAttachedSubnetVnic(artifact_clone, attachment_count);
                    }
                }
                */
                attachment_count += 1;
            }
        }
        console.groupEnd();
    }

    drawAttachedSubnetVnic(artifact, bs_count) {
        console.info('Drawing ' + instance_artifact + ' Subnet Vnic : ' + artifact.id);
        let first_child = this.getParent().getChildOffset(artifact.getArtifactReference());
        let dimensions = this.getDimensions();
        let artifact_definition = newVirtualNetworkInterfaceDefinition(artifact, bs_count);
        artifact_definition['svg']['x'] = Math.round(first_child.dx + (positional_adjustments.padding.x * bs_count) + (positional_adjustments.spacing.x * bs_count));
        artifact_definition['svg']['y'] = Math.round(dimensions.height - positional_adjustments.padding.y);
        artifact_definition['rect']['stroke']['colour'] = stroke_colours.svg_orange;

        let id = artifact['id'];
        // Update id so it does not conflict with actual subnet
        artifact['id'] += '-vnic';

        let svg = drawArtifact(artifact_definition);

        // Add click event to display properties
        svg.on("click", function () {
            loadSubnetProperties(id);
            d3.event.stopPropagation();
        });
        let fill = d3.select(d3Id(id)).attr('fill');
        svg.on("mouseover", function () {
            d3.select(d3Id(id)).attr('fill', svg_highlight_colour);
            d3.event.stopPropagation();
        });
        svg.on("mouseout", function () {
            d3.select(d3Id(id)).attr('fill', fill);
            d3.event.stopPropagation();
        });
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        console.groupCollapsed('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let dimensions = this.getDimensions();
        let parent = this.getParent();
        if (parent) {
            let first_child = parent.getChildOffset(this.getArtifactReference());
            definition['svg']['x'] = first_child.dx;
            definition['svg']['y'] = first_child.dy;
        }
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.blue;
        definition['rect']['stroke']['dash'] = 1;
        definition['rect']['height_adjust'] = (Math.round(icon_height / 2) * -1);
        definition['name']['show'] = true;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    // Return Artifact Dimensions
    getDimensions() {
        console.groupCollapsed('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getMinimumDimensions();
        // Calculate Size based on Child Artifacts
        // Process Bottom Edge Artifacts
        let offset = this.getFirstBottomEdgeChildOffset();
        let bottom_edge_dimensions = {width: offset.dx, height: offset.dy};
        // Block Storage
        bottom_edge_dimensions.width += Math.round(this.block_storage_volume_ids.length * positional_adjustments.padding.x);
        bottom_edge_dimensions.width += Math.round(this.block_storage_volume_ids.length * positional_adjustments.spacing.x);
        // Virtual Network Interface Cards
        bottom_edge_dimensions.width += Math.round(this.vnics.length * positional_adjustments.padding.x);
        bottom_edge_dimensions.width += Math.round(this.vnics.length * positional_adjustments.spacing.x);
        dimensions.width  = Math.max(dimensions.width, bottom_edge_dimensions.width);
        dimensions.height = Math.max(dimensions.height, bottom_edge_dimensions.height);
        // Check size against minimum
        dimensions.width  = Math.max(dimensions.width,  this.getMinimumDimensions().width);
        dimensions.height = Math.max(dimensions.height, this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: min_instance_width, height:min_instance_height};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/instance.html", () => {
            // Load Referenced Ids
            // Build Block Storage Select
            let block_storage_volume_select = $(jqId('block_storage_volume_ids'));
            for (let block_storage_volume of me.getOkitJson().block_storage_volumes) {
                block_storage_volume_select.append($('<option>').attr('value', block_storage_volume.id).text(block_storage_volume.display_name));
            }
            // Build Vnic / Subnet List
            let subnet_select = $(jqId('subnet_ids'));
            for (let subnet of me.getOkitJson().subnets) {
                if (subnet.id !== me.subnet_id) {
                    subnet_select.append($('<option>').attr('value', subnet.id).text(subnet.display_name));
                }
            }
            // Load Properties
            loadPropertiesSheet(me);
        });
    }


    /*
    ** Child Offset Functions
     */
    getBottomEdgeChildOffset() {
        let offset = this.getFirstBottomEdgeChildOffset();
        // Count how many top edge children and adjust.
        let count = 0;
        for (let child of this.getBottomEdgeArtifacts()) {
            count += $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").length;
        }
        console.info('Bottom Edge Count : ' + count);
        let dimensions = this.getDimensions();
        // Increment x position based on count
        offset.dx += Math.round((icon_width * count) + (positional_adjustments.spacing.x * count));
        offset.dy = Math.round(dimensions.height - positional_adjustments.padding.y);
        return offset;
    }


    /*
    ** Child Artifact Functions
     */
    getBottomEdgeArtifacts() {
        return [block_storage_volume_artifact, virtual_network_interface_artifact];
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'in';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Instance';
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference(), Compartment.getArtifactReference()];
    }

    static query(request = {}, region='') {
        console.info('------------- Instance Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        console.info('------------- Subnet      : ' + request.subnet_id);
        let me = this;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/Instance',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({instances: response_json});
                for (let artifact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artifact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + instance_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            },
            error: function (xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + instance_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            }
        });
    }
}

$(document).ready(function () {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', instance_query_cb);
    cell.append('label').text(instance_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(instance_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'instance_name_filter')
        .attr('name', 'instance_name_filter');
});

