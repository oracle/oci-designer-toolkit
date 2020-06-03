/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Instance Javascript');

const instance_query_cb = "instance-query-cb";
const min_instance_width = Math.round(icon_width * 3);
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
        this.shape = 'VM.Standard.E2.1';
        // # Optional
        this.fault_domain = '';
        this.agent_config = {is_monitoring_disabled: false, is_management_disabled: false};
        this.vnics = [];
        this.source_details = {os: 'Oracle Linux', version: '7.7', boot_volume_size_in_gbs: '50', source_type: 'image'};
        this.metadata = {authorized_keys: '', user_data: ''};
        // TODO: Future
        //this.launch_options_specified = false;
        //this.launch_options = {boot_volume_type: '', firmware: '', is_consistent_volume_naming_enabled: false, is_pv_encryption_in_transit_enabled: false, network_type: '', remote_data_volume_type: ''};
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
            this.availability_domain = this.getAvailabilityDomainNumber(this.region_availability_domain);
        }
        if (this.vnics.length > 0) {
            this.primary_vnic = this.vnics[0];
            for (let vnic of this.vnics) {
                vnic.region_availability_domain = vnic.availability_domain;
                vnic.availability_domain = this.getAvailabilityDomainNumber(vnic.region_availability_domain);
            }
        } else {
            this.primary_vnic = {subnet_id: '', assign_public_ip: true, nsg_ids: [], skip_source_dest_check: false, hostname_label: this.display_name.toLowerCase() + '0'};
            this.vnics[0] = this.primary_vnic;
        }
        // Add Parent Id to Primary VNIC if the parent is a subnet
        if (parent !== null) {
            if (parent.getArtifactReference() === Subnet.getArtifactReference()) {
                this.primary_vnic.subnet_id = parent.id;
            }
        }
        this.parent_id = this.getParentId();
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
        if (this.hostname_label !== undefined) {this.vnics[0].hostname_label = this.hostname_label; delete this.hostname_label;}
        for (let vnic of this.vnics) {
            if (!vnic.hasOwnProperty('assign_public_ip')) {vnic.assign_public_ip = true;}
            if (!vnic.hasOwnProperty('skip_source_dest_check')) {vnic.skip_source_dest_check = false;}
            if (!vnic.hasOwnProperty('nsg_ids')) {vnic.nsg_ids = [];}
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new Instance(this, this.getOkitJson());
    }


    /*
    ** Parent Processing Override
     */
    getParentId() {
        let primary_subnet = this.getOkitJson().getSubnet(this.primary_vnic.subnet_id);
        console.info(`Primary Subnet ${JSON.stringify(primary_subnet)}`);
        if (primary_subnet && primary_subnet.compartment_id === this.compartment_id) {
            this.parent_id = this.primary_vnic.subnet_id;
            return this.primary_vnic.subnet_id;
        } else {
            this.parent_id = this.compartment_id;
            return this.compartment_id;
        }
    }

    getParent() {
        let primary_subnet = this.getOkitJson().getSubnet(this.primary_vnic.subnet_id);
        if (primary_subnet && primary_subnet.compartment_id === this.compartment_id) {
            return this.getOkitJson().getSubnet(this.primary_vnic.subnet_id);
        } else {
            return this.getOkitJson().getCompartment(this.compartment_id);
        }
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
        let me = this;
        let svg = super.draw();
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
        console.groupCollapsed('Drawing ' + Instance.getArtifactReference() + ' : ' + this.id + ' Attachments');
        let attachment_count = 0;
        for (let block_storage_id of this.block_storage_volume_ids) {
            let artifact_clone = new BlockStorageVolume(this.getOkitJson().getBlockStorageVolume(block_storage_id), this.getOkitJson(), this);
            artifact_clone['parent_id'] = this.id;
            console.info('Drawing ' + this.getArtifactReference() + ' Block Storage Volume : ' + artifact_clone.display_name);
            artifact_clone.draw();
            attachment_count += 1;
        }
        let start_idx = 1;
        if (this.getParent().getArtifactReference() === Compartment.getArtifactReference() && this.primary_vnic.subnet_id !== '') {start_idx = 0;}
        for (let idx = start_idx;  idx < this.vnics.length; idx++) {
            let vnic = this.vnics[idx];
            let artifact_clone = new VirtualNetworkInterface(this.getOkitJson().getSubnet(vnic.subnet_id), this.getOkitJson(), this);
            // Add the -vnic suffix
            artifact_clone.id += '-vnic';
            artifact_clone['parent_id'] = this.id;
            console.info('Drawing ' + this.getArtifactReference() + ' Virtual Network Interface : ' + artifact_clone.display_name);
            let svg = artifact_clone.draw();
            // Add Highlighting
            let fill = d3.select(d3Id(artifact_clone.id)).attr('fill');
            svg.on("mouseover", function () {
                d3.selectAll(d3Id(artifact_clone.id)).attr('fill', svg_highlight_colour);
                d3.select(d3Id(vnic.subnet_id)).attr('fill', svg_highlight_colour);
                d3.event.stopPropagation();
            });
            svg.on("mouseout", function () {
                d3.selectAll(d3Id(artifact_clone.id)).attr('fill', fill);
                d3.select(d3Id(vnic.subnet_id)).attr('fill', fill);
                d3.event.stopPropagation();
            });
            attachment_count += 1;
        }
        console.groupEnd();
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
        definition['svg']['align'] = "center";
        definition['rect']['stroke']['colour'] = stroke_colours.blue;
        definition['rect']['stroke']['dash'] = 1;
        definition['rect']['height_adjust'] = (Math.round(icon_height / 2) * -1);
        definition['name']['show'] = true;
        definition['name']['align'] = "center";
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
        return {width: min_instance_width, height: min_instance_height};
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
            // Build Primary Vnic / Subnet List
            let subnet_select = $(jqId('subnet_id'));
            subnet_select.append($('<option>').attr('value', '').text(''));
            for (let subnet of this.getOkitJson().subnets) {
                let compartment = this.getOkitJson().getCompartment(this.getOkitJson().getSubnet(subnet.id).compartment_id);
                let vcn = this.getOkitJson().getVirtualCloudNetwork(this.getOkitJson().getSubnet(subnet.id).vcn_id);
                let display_name = `${compartment.display_name}/${vcn.display_name}/${subnet.display_name}`;
                subnet_select.append($('<option>').attr('value', subnet.id).text(display_name));
            }
            // Build Instance Shape Select
            let shape_select = $(jqId('shape'));
            $(shape_select).empty();
            for (let shape of okitOciData.shapes) {
                if (!shape.shape.startsWith('BM.')) {
                    let shape_text = `${shape.shape} (${shape.ocpus} OCPU ${shape.memory_in_gbs} GB Memory)`;
                    // Simple Shape Text because we need to upgrade the oci module
                    shape_text = `${shape.shape}`;
                    shape_select.append($('<option>').attr('value', shape.shape).text(shape_text));
                }
            }
            // Build Network Security Groups
            this.loadNetworkSecurityGroups('nsg_ids', this.primary_vnic.subnet_id);
            // Secondary Vnics
            this.loadSecondaryVnics();
            $(jqId('add_vnic')).on('click', () => {this.addSecondaryVnic();});
            // Load Properties
            loadPropertiesSheet(this);
        });
    }

    loadNetworkSecurityGroups(select_id, subnet_id) {
        $(jqId(select_id)).empty();
        if (subnet_id && subnet_id !== '') {
            let vcn = this.getOkitJson().getVirtualCloudNetwork(this.getOkitJson().getSubnet(subnet_id).vcn_id);
            for (let networkSecurityGroup of this.getOkitJson().network_security_groups) {
                if (networkSecurityGroup.vcn_id === vcn.id) {
                    $(jqId(select_id)).append($('<option>').attr('value', networkSecurityGroup.id).text(networkSecurityGroup.display_name));
                }
            }
        }
    }

    loadSecondaryVnics() {
        // Empty Existing VNICs
        $(jqId('vnics_table_body')).empty();
        // VNICs
        for (let vnic_idx = 1; vnic_idx < this.vnics.length; vnic_idx++) {
            this.addVnicHtml(this.vnics[vnic_idx], vnic_idx);
        }
    }

    addSecondaryVnic() {
        let vnic = {subnet_id: '', assign_public_ip: true, nsg_ids: [], skip_source_dest_check: false, hostname_label: this.display_name.toLowerCase() + this.vnics.length};
        this.vnics.push(vnic);
        this.loadSecondaryVnics();
        displayOkitJson();
    }

    deleteSecondayVnic(vnic_idx) {
        this.vnics.splice(vnic_idx, 1);
        this.loadSecondaryVnics();
        displayOkitJson();
    }

    addVnicHtml(vnic, idx) {
        let me = this;
        let tbody = d3.select(d3Id('vnics_table_body'));
        let row = tbody.append('div').attr('class', 'tr');
        let cell = row.append('div').attr('class', 'td')
            .attr("id", "rule_" + idx);
        let table = cell.append('div').attr('class', 'table okit-table okit-properties-table')
            .attr("id", "vnic_table_" + idx);
        // First Row with Delete Button
        let rule_cell = row.append('div').attr('class', 'td');
        rule_cell.append('button')
            .attr("type", "button")
            .attr("class", "okit-delete-button")
            .text("X")
            .on('click', function() {
                me.deleteSecondayVnic(idx);
            });
        // Subnet Id
        row = table.append('div').attr('class', 'tr');
        row.append('div').attr('class', 'td')
            .text("Subnet");
        cell = row.append('div').attr('class', 'td');
        let select = cell.append('select')
            .attr("class", "okit-property-value")
            .attr("id", "subnet_id" + idx)
            .on("change", function() {
                vnic.subnet_id = this.options[this.selectedIndex].value;
                displayOkitJson();
                redrawSVGCanvas();
                me.loadNetworkSecurityGroups("nsg_ids" + idx, vnic.subnet_id);
            });
        for (let subnet of this.getOkitJson().subnets) {
            let compartment = this.getOkitJson().getCompartment(this.getOkitJson().getSubnet(subnet.id).compartment_id);
            let vcn = this.getOkitJson().getVirtualCloudNetwork(this.getOkitJson().getSubnet(subnet.id).vcn_id);
            let display_name = `${compartment.display_name}/${vcn.display_name}/${subnet.display_name}`;
            select.append('option').attr('value', subnet.id).text(display_name);
        }
        $(jqId("subnet_id" + idx)).val(vnic.subnet_id);
        // Assign Public IP
        row = table.append('div').attr('class', 'tr');
        row.append('div').attr('class', 'td');
        cell = row.append('div').attr('class', 'td');
        cell.append('input')
            .attr('type', 'checkbox')
            .attr('id', 'assign_public_ip' + idx)
            .attr('name', 'assign_public_ip' + idx)
            .attr('checked', vnic.assign_public_ip)
            .on('change', function() {
                vnic.assign_public_ip = this.checked;
                displayOkitJson();
            });
        cell.append('label')
            .attr('for', 'assign_public_ip' + idx)
            .attr("class", "okit-property-value")
            .text('Assign Public IP');
        $(jqId('assign_public_ip' + idx)).prop('checked', vnic.assign_public_ip);
        // Hostname
        row = table.append('div').attr('class', 'tr');
        row.append('div').attr('class', 'td')
            .text('Hostname');
        cell = row.append('div').attr('class', 'td');
        cell.append('input')
            .attr("type", "text")
            .attr("class", "okit-property-value")
            .attr("id", 'hostname_label' + idx)
            .attr("name", 'hostname_label' + idx)
            .attr("value", vnic.hostname_label)
            .on("change", function() {
                vnic.hostname_label = this.value;
                displayOkitJson();
            });
        // Skip Source / Destination Check
        row = table.append('div').attr('class', 'tr');
        row.append('div').attr('class', 'td');
        cell = row.append('div').attr('class', 'td');
        cell.append('input')
            .attr('type', 'checkbox')
            .attr('id', 'skip_source_dest_check' + idx)
            .attr('name', 'skip_source_dest_check' + idx)
            .attr('checked', vnic.skip_source_dest_check)
            .on('change', function() {
                vnic.skip_source_dest_check = this.checked;
                displayOkitJson();
            });
        cell.append('label')
            .attr('for', 'skip_source_dest_check' + idx)
            .attr("class", "okit-property-value")
            .text('Skip Source / Destination Check');
        $(jqId('skip_source_dest_check' + idx)).prop('checked', vnic.skip_source_dest_check);
        // Network Security Groups
        row = table.append('div').attr('class', 'tr');
        row.append('div').attr('class', 'td')
            .text("Network Security Groups");
        cell = row.append('div').attr('class', 'td');
        select = cell.append('select')
            .attr("class", "okit-property-value")
            .attr("id", "nsg_ids" + idx)
            .attr("multiple", "multiple")
            .on("change", function() {
                vnic.nsg_ids = $(jqId("nsg_ids" + idx)).val();
                displayOkitJson();
            });
        this.loadNetworkSecurityGroups("nsg_ids" + idx, vnic.subnet_id);
        $(jqId("nsg_ids" + idx)).val(vnic.nsg_ids);
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
        return [BlockStorageVolume.getArtifactReference(), VirtualNetworkInterface.getArtifactReference()];
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

    static getConnectTargets() {
        return [LoadBalancer.getArtifactReference()];
    }

    static query(request = {}, region='') {
        console.info('------------- Instance Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        console.info('------------- Subnet      : ' + request.subnet_id);
        let me = this;
        queryCount++;
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
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function (xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error : ' + error);
                $('#' + instance_query_cb).prop('checked', true);
                queryCount--;
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
    cell.append('label').text(Instance.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(Instance.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'instance_name_filter')
        .attr('name', 'instance_name_filter');
});

