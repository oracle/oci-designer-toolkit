/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Instance View Javascript');

/*
** Define Instance View Artifact Class
 */
class InstanceView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {
        let primary_subnet = this.getJsonView().getSubnet(this.artefact.primary_vnic.subnet_id);
        if (primary_subnet && primary_subnet.compartment_id === this.artefact.compartment_id) {
            console.info('Using Subnet as parent');
            return this.primary_vnic.subnet_id;
        } else {
            console.info('Using Compartment as parent');
            return this.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    // TODO: Remove for new draw
    get minimum_dimensions() {return {width: 135, height: 100};}
    get dimensions() {
        console.log('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.minimum_dimensions;
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
        dimensions.width  = Math.max(dimensions.width,  this.minimum_dimensions.width);
        dimensions.height = Math.max(dimensions.height, this.minimum_dimensions.height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.log();
        return dimensions;
    }

    /*
     ** SVG Processing
     */
    draw() {
        console.log('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let svg = super.draw();
        // Draw Attachments
        this.drawAttachments();
        return svg;
    }

    drawAttachments() {
        console.log('Drawing ' + Instance.getArtifactReference() + ' : ' + this.id + ' Attachments');
        let attachment_count = 0;
        for (let block_storage_id of this.block_storage_volume_ids) {
            let attachment = new BlockStorageVolumeView(this.getJsonView().getOkitJson().getBlockStorageVolume(block_storage_id), this.getJsonView());
            attachment.attached_id = this.id;
            console.info('Drawing ' + this.getArtifactReference() + ' Block Storage Volume : ' + attachment.display_name);
            attachment.draw();
            attachment_count += 1;
        }
        let start_idx = 1;
        if (this.getParent().getArtifactReference() === Compartment.getArtifactReference() && this.primary_vnic.subnet_id !== '') {start_idx = 0;}
        for (let idx = start_idx;  idx < this.vnics.length; idx++) {
            let vnic = this.vnics[idx];
            let attachment = new VirtualNetworkInterfaceView(this.getJsonView().getOkitJson().getSubnet(vnic.subnet_id), this.getJsonView());
            attachment.attached_id = this.id;
            // Add the -vnic suffix
            //attachment.artefact.id += '-vnic';
            console.info('Drawing ' + this.getArtifactReference() + ' Virtual Network Interface : ' + attachment.display_name);
            let svg = attachment.draw();
            // Add Highlighting
            svg.on("mouseover", function () {
                $(`[id^='${attachment.id}']`).addClass('highlight-vnic');
                $(jqId(vnic.subnet_id)).addClass('highlight-vnic');
                d3.event.stopPropagation();
            });
            svg.on("mouseout", function () {
                $(`[id^='${attachment.id}']`).removeClass('highlight-vnic');
                $(jqId(vnic.subnet_id)).removeClass('highlight-vnic');
                d3.event.stopPropagation();
            });
            attachment_count += 1;
        }
        console.log();
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let parent = this.getParent();
        if (parent) {
            let first_child = parent.getChildOffset(this.getArtifactReference());
            definition['svg']['x'] = first_child.dx;
            definition['svg']['y'] = first_child.dy;
        }
        definition['svg']['width'] = this.dimensions['width'];
        definition['svg']['height'] = this.dimensions['height'];
        definition['svg']['align'] = "center";
        definition['rect']['stroke']['colour'] = stroke_colours.blue;
        definition['rect']['stroke']['dash'] = 1;
        definition['rect']['height_adjust'] = (Math.round(icon_height / 2) * -1);
        definition['name']['show'] = true;
        definition['name']['align'] = "center";
        return definition;
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/instance.html", () => {
            // Load Referenced Ids
            // Build Block Storage Select
            let block_storage_volume_select = d3.select(d3Id('block_storage_volume_ids'));
            for (let block_storage_volume of me.getOkitJson().block_storage_volumes) {
                let div = block_storage_volume_select.append('div');
                div.append('input')
                    .attr('type', 'checkbox')
                    .attr('id', safeId(block_storage_volume.id))
                    .attr('value', block_storage_volume.id);
                div.append('label')
                    .attr('for', safeId(block_storage_volume.id))
                    .text(block_storage_volume.display_name);
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
            for (let shape of okitOciData.getInstanceShapes()) {
                let shape_text = `${shape.shape} (${shape.ocpus} OCPU ${shape.memory_in_gbs} GB Memory)`;
                // Simple Shape Text because we need to upgrade the oci module
                shape_text = `${shape.shape}`;
                shape_select.append($('<option>').attr('value', shape.shape).text(shape_text));
            }
            // Build Network Security Groups
            this.loadNetworkSecurityGroups('nsg_ids', this.primary_vnic.subnet_id);
            // Secondary Vnics
            this.loadSecondaryVnics();
            $(jqId('add_vnic')).on('click', () => {this.addSecondaryVnic();});
            // Load OSs
            let os_select = $(jqId('os'));
            $(os_select).empty();
            for (let os of okitOciData.getInstanceOS()) {
                os_select.append($('<option>').attr('value', os).text(os));
            }
            os_select.on('change', () => {me.loadOSVersions($("#os").val());});
            // Load OS Versions
            this.loadOSVersions(this.source_details.os);
            // Load Properties
            loadPropertiesSheet(me.artefact);
        });
    }

    loadOSVersions(os) {
        let version_select = $(jqId('version'));
        $(version_select).empty();
        for (let version of okitOciData.getInstanceOSVersions(os)) {
            version_select.append($('<option>').attr('value', version).text(version));
        }
        $("#version").val($("#version option:first").val());
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
        select = cell.append('div')
            .attr("class", "okit-multiple-select")
            .attr("id", "nsg_ids" + idx)
            .on("change", function() {
                vnic.nsg_ids = [];
                $(jqId("nsg_ids" + idx)).find("input:checkbox").each(function() {
                    if ($(this).prop('checked')) {vnic.nsg_ids.push($(this).val());}
                });
                displayOkitJson();
            });
        this.loadNetworkSecurityGroups("nsg_ids" + idx, vnic.subnet_id);
        //$(jqId("nsg_ids" + idx)).val(vnic.nsg_ids);
        $(jqId("nsg_ids" + idx)).find("input:checkbox").each(function() {
            if (vnic.nsg_ids.includes($(this).val())) {$(this).prop("checked", true);}
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/instance.html");
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
        // Increment x position based on count
        offset.dx += Math.round((icon_width * count) + (positional_adjustments.spacing.x * count));
        offset.dy = Math.round(this.dimensions.height - positional_adjustments.padding.y);
        return offset;
    }


    /*
    ** Child Artifact Functions
     */
    getBottomEdgeArtifacts() {
        return [BlockStorageVolume.getArtifactReference(), VirtualNetworkInterface.getArtifactReference()];
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return Instance.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference(), Compartment.getArtifactReference()];
    }

    static getConnectTargets() {
        return [LoadBalancer.getArtifactReference()];
    }


}