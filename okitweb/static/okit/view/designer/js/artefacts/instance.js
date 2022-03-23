/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Instance View Javascript');

/*
** Define Instance View Artifact Class
 */
class InstanceView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
        this.secondary_vnics_idx = 0;
    }

    // -- Reference
    get parent_id() {
        let primary_subnet = this.getJsonView().getSubnet(this.primary_vnic.subnet_id);
        if (primary_subnet && primary_subnet.compartment_id === this.artefact.compartment_id) {
            return this.primary_vnic.subnet_id;
        } else {
            return this.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    // --- Dimensions
    // TODO: Decide if show attachments is required
    // ---- Icon
    get icon_definition_id() {return this.shape.startsWith('BM.') ? OkitJsonView.toSvgIconDef('BareMetalCompute') : super.icon_definition_id;}
    // ---- Text
    get summary_tooltip() {return `Name: ${this.display_name} \nAvailability Domain: ${this.artefact.availability_domain} \nShape: ${this.artefact.shape} \nOS: ${this.source_details.os} ${this.source_details.version}`;}
    // Direct Subnet Access
    get subnet_id() {return this.artefact.primary_vnic.subnet_id;}
    set subnet_id(id) {this.artefact.primary_vnic.subnet_id = id;}
    get primary_vnic() {return this.artefact.primary_vnic}

    /*
     ** SVG Processing
     */
    // Add Specific Mouse Events
    addAssociationHighlighting() {
        for (let id of this.block_storage_volume_ids) {$(jqId(id)).addClass('highlight-association');}
        for (let vnic of this.getVnicAttachments()) {$(jqId(vnic.subnet_id)).addClass('highlight-association');}
        for (let id of this.primary_vnic.nsg_ids) {$(jqId(id)).addClass('highlight-association');}
    }

    removeAssociationHighlighting() {
        for (let id of this.block_storage_volume_ids) {$(jqId(id)).removeClass('highlight-association');}
        for (let vnic of this.getVnicAttachments()) {$(jqId(vnic.subnet_id)).removeClass('highlight-association');}
        for (let id of this.primary_vnic.nsg_ids) {$(jqId(id)).removeClass('highlight-association');}
    }
    // TODO: Decide If Required
    drawAttachmentsOrig() {
        let attachment_count = 0;
        for (let block_storage_id of this.block_storage_volume_ids) {
            let attachment = new BlockStorageVolumeView(this.getJsonView().getOkitJson().getBlockStorageVolume(block_storage_id), this.getJsonView());
            attachment.attached_id = this.id;
            attachment.draw();
            attachment_count += 1;
        }
        let start_idx = 1;
        if (this.parent.getArtifactReference() === Compartment.getArtifactReference() && this.primary_vnic.subnet_id !== '') {start_idx = 0;}
        for (let idx = start_idx;  idx < this.vnics.length; idx++) {
            let vnic = this.vnics[idx];
            let attachment = new VirtualNetworkInterfaceView(this.getJsonView().getOkitJson().getSubnet(vnic.subnet_id), this.getJsonView());
            attachment.attached_id = this.id;
            // Add the -vnic suffix
            //attachment.artefact.id += '-vnic';
            let svg = attachment.draw();
            attachment_count += 1;
        }
        console.log();
    }

    getVnicAttachments() {
        return (this.parent.getArtifactReference() === Compartment.getArtifactReference() && this.primary_vnic.subnet_id !== '') ? this.vnics : this.vnics.slice(1);
    }

    /*
    ** Property Sheet Load function
     */
    newPropertiesSheet() {
        this.properties_sheet = new InstanceProperties(this.artefact)
    }

    loadProperties() {
        let me = this;
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/instance_v2.html", () => {
            // Load Referenced Ids
            // Build Block Storage Select
            self.getJsonView().loadBlockStorageVolumesMultiSelect('block_storage_volume_ids')
            // Build Primary Vnic / Subnet List
            self.getJsonView().loadSubnetsSelect('subnet_id', true)
            // Build Network Security Groups
            this.loadNetworkSecurityGroups('nsg_ids', this.primary_vnic.subnet_id);

            // Change Event Handlers
            // Image Source / Platform or Custom
            $('#image_source').on('change', () => {self.handleImageSourceChange()})
            // Images
            $('#os').on('change', () => {self.handleImageOSChange()})
            // OS Versions
            $('#version').on('change', () => {self.handleImageOSVersionChange()})
            // Instance Type
            $('#instance_type').on('change', () => {self.handleInstanceTypeChange()})
            // Chipset 
            $('#chipset').on('change', () => {self.handleShapeSeriesChange()})

            $('#image_source').val(self.artefact.source_details.image_source)
            this.handleImageSourceChange()

            // Add Secondary Networks Table
            const vnics_tbody = self.addPropertyHTML('secondary_networks', 'array', 'Secondary VNICs', 'vnics', '', () => self.addSecondaryNetwork())

             // Load Properties
            loadPropertiesSheet(me.artefact);
            this.loadSecondaryNetworks()
        });
    }
    handleImageSourceChange() {
        this.artefact.source_details.image_source = $('#image_source').val()
        if (this.artefact.source_details.image_source === 'custom') {
            $('#image_id_row').removeClass('collapsed')
        } else {
            $('#image_id_row').addClass('collapsed')
        }
        this.loadImageOSs()
        this.handleImageOSChange()
    }
    loadImageOSs() {
        const self = this
        const oss = this.source_details.image_source === 'custom' ? okitOciData.getCustomImageOSs() : okitOciData.getPlatformImageOSs()
        console.info('OSs:', this.source_details.image_source, oss)
        const os_select = $(jqId('os'));
        let os_exists = false;
        $(os_select).empty();
        oss.forEach((os) => {
            console.info(os)
            os_select.append($('<option>').attr('value', os).text(os));
            os_exists = os_exists | self.source_details.os === os;
        })
        if (!os_exists) {
            this.source_details.os = $("#os option:first").val();
        }
        $("#os").val(this.source_details.os);
    }
    handleImageOSChange() {
        this.loadImageOSVersions();
        this.handleImageOSVersionChange();
    }
    loadImageOSVersions(os=undefined) {
        os = os ? os : $("#os").val()
        const self = this;
        const version_select = $(jqId('version'));
        const filter = (i) => i.operating_system === os
        const osv = this.source_details.image_source === 'custom' ? okitOciData.getCustomImageOSVersions(filter) : okitOciData.getPlatformImageOSVersions(filter)
        let version_exists = false;
        $(version_select).empty();
        for (let version of osv) {
            version_select.append($('<option>').attr('value', version).text(version));
            version_exists = version_exists | this.source_details.version === version;
        }
        if (!version_exists) {
            this.source_details.version = $("#version option:first").val();
        }
        $("#version").val(this.source_details.version);
    }
    handleImageOSVersionChange() {
        this.loadImageShapes();
        this.loadCustomImages()
    }
    loadCustomImages() {
        const self = this
        const custom_select = $('#image_id')
        const os = $('#os').val()
        const version = $('#version').val()
        let image_exists = false;
        $(custom_select).empty()
        if (this.source_details.image_source === 'custom') {
            okitOciData.getCustomImages().filter((i) => i.operating_system === os && i.operating_system_version === version).forEach((img) => {
                custom_select.append($('<option>').attr('value', img.id).text(img.display_name));
                image_exists = image_exists | this.source_details.image_id === img.id
            })
        }
        if (!image_exists) {
            this.source_details.image_id = $("#image_id option:first").val();
        }
        $("#image_id").val(this.source_details.image_id);
    }
    handleInstanceTypeChange() {
        const type = $('#instance_type').val()
        if (type === 'bm') {
            $('#chipset_row').addClass('collapsed')
            this.artefact.shape = okitOciData.getBareMetalInstanceShapes()[0].shape
        } else {
            $('#chipset_row').removeClass('collapsed')
            this.artefact.shape = okitOciData.getAMDInstanceShapes()[0].shape
        }
        this.loadImageShapes()
    }
    handleShapeSeriesChange() {
        const chipset = $('#chipset').val()
        this.artefact.shape = chipset === 'amd' ? okitOciData.getAMDInstanceShapes()[0].shape : chipset === 'arm' ? okitOciData.getARMInstanceShapes()[0].shape : okitOciData.getIntelInstanceShapes()[0].shape
        this.loadImageShapes()
    }
    loadImageShapes() {
        const self = this;
        const shapes = this.instance_type === 'bm' ? okitOciData.getBareMetalInstanceShapes() : this.chipset === 'amd' ? okitOciData.getAMDInstanceShapes() : this.chipset === 'arm' ? okitOciData.getARMInstanceShapes() : okitOciData.getIntelInstanceShapes()
        const shape_select = $(jqId('shape'));
        $(shape_select).empty();
        shapes.forEach((shape) => {
            let shape_text = `${shape.shape}`;
            shape_select.append($('<option>').attr('value', shape.shape).text(shape_text));
        })
        shape_select.on('change', () => {self.loadOCPUs($("#shape").val());});
        this.loadOCPUs()
    }
    // Secondary Networks (VNICs)
    loadSecondaryNetworks() {
        this.artefact.vnics.forEach((e, i) => {if (i > 0) this.addSecondaryNetworkHtml(e, i+1)})
        this.secondary_vnics_idx = this.artefact.vnics.length
    }
    addSecondaryNetwork() {
        const vnic = this.artefact.newVnic();
        this.artefact.vnics.push(vnic);
        this.secondary_vnics_idx += 1
        this.addSecondaryNetworkHtml(vnic, this.secondary_vnics_idx)
    }
    addSecondaryNetworkHtml(vnic, idx) {
        const id = 'vnic';
        const row = this.addPropertyHTML(this.tbodyId('vnics', ''), 'row', '', id, idx, () => this.deleteSecondaryNetwork(id, idx, vnic));
        const details = this.addPropertyHTML(row, 'object', 'VNIC', id, idx);
        const tbody = this.addPropertyHTML(details, 'properties', '', id, idx);
        let property = undefined
        // Subnet (Select)
        property = this.addPropertyHTML(tbody, 'select', 'Subnet', 'subnet_id', idx, (d, i, n) => vnic.subnet_id = n[i].value);
        this.getJsonView().loadSubnetsSelect(`subnet_id${idx}`, false)
        if (vnic.subnet_id === '' && property.node().options.length > 0) vnic.subnet_id = property.node().options[0].value
        property.attr('value', vnic.subnet_id)
        property.node().value = vnic.subnet_id
        // Hostname (Text)
        property = this.addPropertyHTML(tbody, 'text', 'Hostname', 'hostname_label', idx, (d, i, n) => vnic.hostname_label = n[i].value);
        property.attr('value', vnic.hostname_label)
        // Public IP (Checkbox)
        property = this.addPropertyHTML(tbody, 'checkbox', 'Assign Public IP', 'assign_public_ip', idx, (d, i, n) => vnic.assign_public_ip = n[i].checked);
        property.attr('checked', vnic.assign_public_ip)
        property.node().checked = vnic.assign_public_ip
        // Skip Source / Destination Check (Checkbox)
        property = this.addPropertyHTML(tbody, 'checkbox', 'Skip Source / Destination Check', 'skip_source_dest_check', idx, (d, i, n) => vnic.skip_source_dest_check = n[i].checked);
        property.attr('checked', vnic.skip_source_dest_check)
        property.node().checked = vnic.skip_source_dest_check
        property = this.addPropertyHTML(tbody, 'multiselect', 'Network Security Groups', 'nsg_ids', idx, (d, i, n) => vnic.nsg_ids = [...n[i].querySelectorAll('input[type="checkbox"]:checked')].map((c) => c.value));
        this.loadNetworkSecurityGroups(this.inputId('nsg_ids', idx), vnic.subnet_id ? vnic.subnet_id : this.primary_vnic.subnet_id)
        const cbs = [...document.querySelectorAll(`#${this.inputId('nsg_ids', idx)} input[type="checkbox"]`)]
        cbs.forEach((c) => c.checked = vnic.nsg_ids.includes(c.value) )
    }
    deleteSecondaryNetwork(id, idx, vnic) {
        this.artefact.vnics = this.artefact.vnics.filter((e) => e !== vnic)
        $(`#${this.trId(id, idx)}`).remove()
    }

    // V1 Implementation
    loadShapes() {
        const self = this;
        const shape_select = $(jqId('shape'));
        $(shape_select).empty();
        for (let shape of okitOciData.getInstanceShapes()) {
            let shape_text = `${shape.shape} (${shape.ocpus} OCPU ${shape.memory_in_gbs} GB Memory)`;
            // Simple Shape Text because we need to upgrade the oci module
            shape_text = `${shape.shape}`;
            shape_select.append($('<option>').attr('value', shape.shape).text(shape_text));
        }
        shape_select.on('change', () => {self.loadOSs($("#shape").val());self.loadOCPUs($("#shape").val());});
    }

    // V1 Implementation
    loadOSs(shape) {
        const self = this;
        const os_select = $(jqId('os'));
        let os_exists = false;
        $(os_select).empty();
        for (let os of okitOciData.getInstanceOS(shape)) {
            os_select.append($('<option>').attr('value', os).text(os));
            os_exists = os_exists | this.source_details.os === os;
        }
        os_select.on('change', () => {self.loadOSVersions($("#os").val());});
        if (!os_exists) {
            this.source_details.os = $("#os option:first").val();
        }
        $("#os").val(this.source_details.os);
    }

    // V1 Implementation
    loadOSVersions(os) {
        const self = this;
        const version_select = $(jqId('version'));
        let version_exists = false;
        $(version_select).empty();
        for (let version of okitOciData.getInstanceOSVersions(os)) {
            version_select.append($('<option>').attr('value', version).text(version));
            version_exists = version_exists | this.source_details.version === version;
        }
        if (!version_exists) {
            this.source_details.version = $("#version option:first").val();
        }
        $("#version").val(this.source_details.version);
    }

    loadOCPUs(shape_name=undefined) {
        shape_name = shape_name ? shape_name : this.shape;
        console.info('Shape:', shape_name)
        const self = this;
        const shape = okitOciData.getInstanceShape(shape_name);
        $('#ocpus_row').addClass('collapsed');
        $('#memory_in_gbs_row').addClass('collapsed');
        if (shape) {
            if (shape.memory_options && shape.ocpu_options) {
                if (this.shape_config.memory_in_gbs == 0) this.shape_config.memory_in_gbs = shape.memory_in_gbs;
                if (this.shape_config.ocpus == 0) this.shape_config.ocpus = shape.ocpus;
                const ocpus = document.getElementById('ocpus');
                if (ocpus) {
                    ocpus.setAttribute('min', shape.ocpu_options.min);
                    ocpus.setAttribute('max', shape.ocpu_options.max);
                    ocpus.setAttribute('value', this.shape_config.ocpus);
                    ocpus.value = this.shape_config.ocpus;
                    ocpus.addEventListener("input", () => {self.loadMemoryInGbp(shape_name)});
                    ocpus.dispatchEvent(new Event('input'));
                    $('#ocpus_row').removeClass('collapsed');
                    $('#memory_in_gbs_row').removeClass('collapsed');
                }
            } else {
                this.shape_config.memory_in_gbs = 0;
                this.shape_config.ocpus = 0;
            }
        }
    }

    loadMemoryInGbp(shape_name) {
        const self = this;
        const shape = okitOciData.getInstanceShape(shape_name);
        const memory_in_gbs = document.getElementById('memory_in_gbs');
        const min = Math.max(shape.memory_options.min_in_g_bs, (shape.memory_options.min_per_ocpu_in_gbs * this.shape_config.ocpus));
        const max = Math.min(shape.memory_options.max_in_g_bs, (shape.memory_options.max_per_ocpu_in_gbs * this.shape_config.ocpus));
        this.shape_config.memory_in_gbs = Math.max(this.shape_config.memory_in_gbs, min);
        memory_in_gbs.setAttribute('min', min);
        memory_in_gbs.setAttribute('max', max);
        //memory_in_gbs.dispatchEvent(new Event('input'));
        memory_in_gbs.setAttribute('value', this.shape_config.memory_in_gbs);
        memory_in_gbs.value = this.shape_config.memory_in_gbs;
    }

    // V1 Implementation
    loadSecondaryVnics() {
        // Empty Existing VNICs
        $(jqId('vnics_table_body')).empty();
        // VNICs
        for (let vnic_idx = 1; vnic_idx < this.vnics.length; vnic_idx++) {
            this.addVnicHtml(this.vnics[vnic_idx], vnic_idx);
        }
    }

    // V1 Implementation
    addSecondaryVnic() {
        let vnic = {subnet_id: '', assign_public_ip: true, nsg_ids: [], skip_source_dest_check: false, hostname_label: this.display_name.toLowerCase() + this.vnics.length};
        this.vnics.push(vnic);
        this.loadSecondaryVnics();
        displayOkitJson();
    }

    // V1 Implementation
    deleteSecondayVnic(vnic_idx) {
        this.vnics.splice(vnic_idx, 1);
        this.loadSecondaryVnics();
        displayOkitJson();
    }

    // V1 Implementation
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
        for (let subnet of this.getOkitJson().getSubnets()) {
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
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropInstanceView = function(target) {
    let view_artefact = this.newInstance();
    if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().primary_vnic.subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newInstance = function(instance) {
    this.getInstances().push(instance ? new InstanceView(instance, this) : new InstanceView(this.okitjson.newInstance(), this));
    return this.getInstances()[this.getInstances().length - 1];
}
OkitJsonView.prototype.getInstances = function() {
    if (!this.instances) this.instances = []
    return this.instances;
}
OkitJsonView.prototype.getInstance = function(id='') {
    for (let artefact of this.getInstances()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadInstances = function(instances) {
    for (const artefact of instances) {
        this.getInstances().push(new InstanceView(new Instance(artefact, this.okitjson), this));
    }
}
