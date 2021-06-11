/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Analytics Instance View Javascript');

/*
** Define Analytics Instance View Class
*/
class AnalyticsInstanceView extends OkitArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.analytics_instances) json_view.analytics_instances = [];
        super(artefact, json_view);
    }
    // -- Reference
    get parent_id() {
        let primary_subnet = this.getJsonView().getSubnet(this.subnet_id);
        if (primary_subnet && primary_subnet.compartment_id === this.artefact.compartment_id) {
            return this.subnet_id;
        } else {
            return this.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    // Direct Subnet Access
    get subnet_id() {return this.artefact.network_endpoint_details.subnet_id;}
    set subnet_id(id) {this.artefact.network_endpoint_details.subnet_id = id;}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/analytics_instance.html", () => {
            // Add Subnet & Vcn Lists
            this.loadVirtualCloudNetworkSelect('vcn_id');
            this.loadSubnetSelect('subnet_id');
            // Add Handler for Network Endpoint
            $(jqId('network_endpoint_type')).on('change', () => {self.changeNetworkEndpoint();});
            self.collapseExpandNetworkEndPointInputs();
            // Whitelisted Vcns
            self.loadWhitelistedVcns();
            // Add Handler to Add Button
            $(jqId('add_whitelisted_vcns')).on('click', () => {self.addWhitelistedVcn();});
            // load Properties
            loadPropertiesSheet(self.artefact);
        });
    }
    changeNetworkEndpoint() {
        const vcn_id = $(jqId('vcn_id'));
        const subnet_id = $(jqId('subnet_id'));
        const whitelisted_ips = $(jqId('whitelisted_ips'));
        // Display Rows
        this.collapseExpandNetworkEndPointInputs();
        // Reset based on type
        this.resetNetworkEndPointInputs();
        // Assign values
        subnet_id.val(this.network_endpoint_details.subnet_id);
        vcn_id.val(this.network_endpoint_details.vcn_id);               
        whitelisted_ips.val(this.network_endpoint_details.whitelisted_ips);
        this.loadWhitelistedVcns();
    }
    collapseExpandNetworkEndPointInputs() {
        const vcn_id_row = $(jqId('vcn_id_row'));
        const subnet_id_row = $(jqId('subnet_id_row'));
        const whitelisted_ips_row = $(jqId('whitelisted_ips_row'));
        const whitelisted_vcns_row = $(jqId('whitelisted_vcns_row'));
        // Collapse All
        subnet_id_row.addClass('collapsed');
        vcn_id_row.addClass('collapsed');
        whitelisted_ips_row.addClass('collapsed');
        whitelisted_vcns_row.addClass('collapsed');
        if (this.network_endpoint_details.network_endpoint_type === 'PUBLIC') {
            whitelisted_ips_row.removeClass('collapsed');
            whitelisted_vcns_row.removeClass('collapsed');
        } else if (this.network_endpoint_details.network_endpoint_type === 'PRIVATE') {
            subnet_id_row.removeClass('collapsed');
            vcn_id_row.removeClass('collapsed');   
        }
    }
    resetNetworkEndPointInputs() {
        console.warn('AnalyticsInstanceView Reseting Endpoint [', this.network_endpoint_details.network_endpoint_type, ']')
        if (this.network_endpoint_details.network_endpoint_type === 'PUBLIC') {
            // Reset Values
            this.network_endpoint_details.subnet_id = '';
            this.network_endpoint_details.vcn_id = '';
        } else if (this.network_endpoint_details.network_endpoint_type === 'PRIVATE') {
            // Reset Values
            this.network_endpoint_details.whitelisted_ips = '';
            this.network_endpoint_details.whitelisted_vcns = [];
        } else {
            // Reset Values
            this.network_endpoint_details.subnet_id = '';
            this.network_endpoint_details.vcn_id = '';
            this.network_endpoint_details.whitelisted_ips = '';
            this.network_endpoint_details.whitelisted_vcns = [];
        }
    }
    loadWhitelistedVcns() {
        // Empty Existing Vcns
        $(jqId('whitelisted_vcns_body')).empty();
        // Route Vcns
        let idx = 1;
        for (let vcn of this.network_endpoint_details.whitelisted_vcns) {
            this.addWhitelistedVcnHtml(vcn, idx);
            idx += 1;
        }
    }
    addWhitelistedVcn() {
        let new_vcn = {
            id: "",
            whitelisted_ips: ""
        };
        this.network_endpoint_details.whitelisted_vcns.push(new_vcn);
        this.loadWhitelistedVcns();
        displayOkitJson();
    }
    deleteWhitelistedVcn(idx) {
        this.network_endpoint_details.whitelisted_vcns.splice(idx, 1);
        this.loadWhitelistedVcns();
        displayOkitJson();
    }
    addWhitelistedVcnHtml(vcn, idx=1) {
        const self = this;
        const tbody = d3.select('#whitelisted_vcns_body');
        const row = tbody.append('div').attr('class', 'tr');
        const table = row.append('div').attr('class', 'td')
            .attr('id', `vcn_${idx}`)
            .append('div').attr('class', 'table okit-table okit-properties-table')
                .attr("id", `vcn_table_${idx}`);
        row.append('div').attr('class', 'td')
            .append('button')
                .attr("type", "button")
                .attr("class", "okit-delete-button")
                .text("X")
                .on('click', function() {
                    me.deleteWhitelistedVcn(idx - 1);
                    me.loadWhitelistedVcns();
                    displayOkitJson();
                });
        // Vcn
        let tr = table.append('div').attr('class', 'tr')
        tr.append('div').attr('class', 'td').text("Vcn");
        tr.append('div').attr('class', 'td')
            .append('select')
                .attr('class', 'property-value')
                .attr('id', `vcn_id${idx}`)
                .on('change', () => {vcn.id = this.options[this.selectedIndex].value});
        this.loadVirtualCloudNetworkSelect(`vcn_id${idx}`)
        $(`#vcn_id${idx}`).val(vcn.id);
        // Ips
        tr = table.append('div').attr('class', 'tr')
        tr.append('div').attr('class', 'td').text("Ips");
        tr.append('div').attr('class', 'td')
            .append('input')
                .attr('type', 'text')
                .attr('class', 'property-value')
                .attr('id', `whitelisted_ips${idx}`)
                .attr('name', `whitelisted_ips${idx}`)
                .attr('value', vcn.whitelisted_ips)
                .on('change', () => {vcn.whitelisted_ips = this.value});
    }
   /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/analytics_instance.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return AnalyticsInstance.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference(), Subnet.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropAnalyticsInstanceView = function(target) {
    let view_artefact = this.newAnalyticsInstance();
    if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().network_endpoint_details.subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        // Add vcn_id
        view_artefact.getArtefact().network_endpoint_details.vcn_id = this.getSubnet(target.id).vcn_id;
        // Set Private because we have dropped on Subnet
        view_artefact.getArtefact().network_endpoint_details.network_endpoint_type = 'PRIVATE';
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newAnalyticsInstance = function(obj) {
    this.getAnalyticsInstances().push(obj ? new AnalyticsInstanceView(obj, this) : new AnalyticsInstanceView(this.okitjson.newAnalyticsInstance(), this));
    return this.getAnalyticsInstances()[this.getAnalyticsInstances().length - 1];
}
OkitJsonView.prototype.getAnalyticsInstances = function() {
    if (!this.analytics_instances) {
        this.analytics_instances = [];
    }
    return this.analytics_instances;
}
OkitJsonView.prototype.getAnalyticsInstance = function(id='') {
    for (let artefact of this.getAnalyticsInstances()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadAnalyticsInstances = function(analytics_instances) {
    for (const artefact of analytics_instances) {
        this.getAnalyticsInstances().push(new AnalyticsInstanceView(new AnalyticsInstance(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveAnalyticsInstance = function(id) {
    // Build Dialog
    const self = this;
    let analytics_instance = this.getAnalyticsInstance(id);
    $(jqId('modal_dialog_title')).text('Move ' + analytics_instance.display_name);
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    const table = d3.select(d3Id('modal_dialog_body')).append('div')
        .attr('class', 'table okit-table');
    const tbody = table.append('div')
        .attr('class', 'tbody');
    // Subnet
    let tr = tbody.append('div')
        .attr('class', 'tr');
    tr.append('div')
        .attr('class', 'td')
        .text('Subnet');
    tr.append('div')
        .attr('class', 'td')
        .append('select')
        .attr('id', 'move_analytics_instance_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_analytics_instance_subnet_id');
    $(jqId("move_analytics_instance_subnet_id")).val(analytics_instance.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (analytics_instance.artefact.subnet_id !== $(jqId("move_analytics_instance_subnet_id")).val()) {
                self.getSubnet(analytics_instance.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_analytics_instance_subnet_id")).val()).recalculate_dimensions = true;
                analytics_instance.artefact.subnet_id = $(jqId("move_analytics_instance_subnet_id")).val();
                analytics_instance.artefact.compartment_id = self.getSubnet(analytics_instance.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteAnalyticsInstance = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.analytics_instances.push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadAnalyticsInstancesSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const analytics_instance_select = $(jqId(select_id));
    if (empty_option) {
        analytics_instance_select.append($('<option>').attr('value', '').text(''));
    }
    for (let analytics_instance of this.getAnalyticsInstances()) {
        analytics_instance_select.append($('<option>').attr('value', analytics_instance.id).text(analytics_instance.display_name));
    }
}
OkitJsonView.prototype.loadAnalyticsInstancesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let analytics_instance of this.getAnalyticsInstances()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(analytics_instance.id))
            .attr('value', analytics_instance.id);
        div.append('label')
            .attr('for', safeId(analytics_instance.id))
            .text(analytics_instance.display_name);
    }
}
