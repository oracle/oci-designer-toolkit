/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Dhcp Option View Javascript');

/*
** Define Dhcp Option View Class
*/
class DhcpOptionView extends OkitArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.dhcp_options) json_view.dhcp_options = [];
        super(artefact, json_view);
    }
    get attached() {
        if (!this.attached_id) {
            for (let subnet of this.getOkitJson().subnets) {
                if (subnet.dhcp_options_id === this.id) {
                    return true;
                }
            }
        }
        return false;
    }
    get parent_id() {return this.attached_id ? this.attached_id : this.artefact.vcn_id;}
    get parent() {return this.attached_id ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getVirtualCloudNetwork(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/dhcp_option.html", () => {
            loadPropertiesSheet(self.artefact);
            // Load Options
            self.loadOptions();
            // Add Handler to Add Button
            $(jqId('add_option')).on('click', () => {self.addOption();});
        });
    }
    loadOptions() {
        // Empty Existing Rules
        $(jqId('options_table_body')).empty();
        // Route Rules
        let option_idx = 1;
        for (let option of this.options) {
            this.addOptionHtml(option, option_idx);
            option_idx += 1;
        }
    }
    addOption() {
        let new_option = {
            type: "DomainNameServer",
            server_type: "CustomDnsServer",
            custom_dns_servers: [],
            search_domain_names: []
        };
        this.options.push(new_option);
        this.loadOptions();
        displayOkitJson();
    }
    deleteOption(option_idx) {
        this.options.splice(option_idx, 1);
        this.loadOptions();
        displayOkitJson();
    }
    addOptionHtml(option, option_idx=1) {
        let self = this;
        let vcn_id = '';
        if (this.parent.getArtifactReference() === VirtualCloudNetwork.getArtifactReference()) {
            vcn_id = this.parent_id;
        } else if (this.parent.getArtifactReference() === Subnet.getArtifactReference()) {
            vcn_id = this.parent.vcn_id;
        } else {
            // Must be a child of the Virtual Cloud Network
            vcn_id = this.parent.parent_id;
        }

        let options_table_body = d3.select('#options_table_body');
        let row = options_table_body.append('div').attr('class', 'tr');
        let cell = row.append('div').attr('class', 'td')
            .attr("id", "option_" + option_idx);
        let option_table = cell.append('div').attr('class', 'table okit-table okit-properties-table')
            .attr("id", "option_table_" + option_idx);
        // First Row with Delete Button
        let option_cell = row.append('div').attr('class', 'td');
        option_cell.append('button')
            .attr("type", "button")
            .attr("class", "okit-delete-button")
            .text("X")
            .on('click', function() {
                self.deleteOption(option_idx - 1);
                self.loadOptions();
                displayOkitJson();
            });

        // Option Type
        const types_map = new Map([
            ['Domain Name Server', 'DomainNameServer'],
            ['Search Domain', 'SearchDomain'],
        ]);
        let option_row = option_table.append('div').attr('class', 'tr');
        option_row.append('div').attr('class', 'td')
            .text("Type");
        let type_select = option_row.append('div').attr('class', 'td').append('select')
            .attr("class", "property-value")
            .attr("id", "type" + option_idx)
            .on("change", function() {
                const option_type = this.options[this.selectedIndex].value;
                // Reset Other Options
                option.server_type = '';
                option.custom_dns_servers = '';
                option.search_domain_names = '';
                // Get Type
                option['type'] = option_type;
                if (option_type === 'DomainNameServer') {
                    $(jqId("server_type_row" + option_idx)).removeClass('collapsed');
                    $(jqId("custom_dns_servers_row" + option_idx)).removeClass('collapsed');
                    $(jqId("search_domain_names_row" + option_idx)).addClass('collapsed');
                    // Set Default for server type
                    option.server_type = 'CustomDnsServer';
                    $(jqId("server_type" + option_idx)).val(option.server_type);
                } else {
                    $(jqId("server_type_row" + option_idx)).addClass('collapsed');
                    $(jqId("custom_dns_servers_row" + option_idx)).addClass('collapsed');
                    $(jqId("search_domain_names_row" + option_idx)).removeClass('collapsed');
                }
                displayOkitJson();
            });
        types_map.forEach((value, key) => {
            type_select.append('option')
                .attr('value', value)
                .text(key);
        });
        type_select.property('value', option.type);
        if (!option.type || option.type === '') {
            option.type = 'DomainNameServer';
        }
        $(jqId("type" + option_idx)).val(option.type);

        // Server Type
        const server_types_map = new Map([
            ['Custom Dns Server', 'CustomDnsServer'],
            // ['Vcn Local', 'VcnLocal'],
            ['Vcn Local Plus Internet', 'VcnLocalPlusInternet'],
        ]);
        option_row = option_table.append('div').attr('class', 'tr collapsed')
            .attr('id', "server_type_row" + option_idx);
        option_row.append('div').attr('class', 'td')
            .text("Server Type");
        let server_type = option_row.append('div').attr('class', 'td').append('select')
            .attr("class", "property-value")
            .attr("id", "server_type" + option_idx)
            .on("change", function() {
                let server_type = this.options[this.selectedIndex].value;
                option['server_type'] = server_type;
                if (server_type === 'VcnLocalPlusInternet') {
                    $(jqId("custom_dns_servers_row" + option_idx)).addClass('collapsed');
                } else {
                    $(jqId("custom_dns_servers_row" + option_idx)).removeClass('collapsed');
                }
                displayOkitJson();
            });
        server_types_map.forEach((value, key) => {
            server_type.append('option')
                .attr('value', value)
                .text(key);
        });
        $(jqId("server_type" + option_idx)).val(option.server_type);
        // Custom Dns Servers
        option_row = option_table.append('div').attr('class', 'tr collapsed').attr('id', 'custom_dns_servers_row' + option_idx);
        option_row.append('div').attr('class', 'td')
            .text("Dns Servers");
        option_cell = option_row.append('div').attr('class', 'td');
        option_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", "custom_dns_servers" + option_idx)
            .attr("name", "custom_dns_servers")
            .attr("value", option.custom_dns_servers ? option['custom_dns_servers'].join(',') : '')
            .on("change", function() {
                option['custom_dns_servers'] = this.value.replaceAll(' ', '').split(',');
                displayOkitJson();
            });

        // Search Domain Names
        option_row = option_table.append('div').attr('class', 'tr collapsed').attr('id', 'search_domain_names_row' + option_idx);
        option_row.append('div').attr('class', 'td')
            .text("Search Domain Names");
        option_cell = option_row.append('div').attr('class', 'td');
        option_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", "search_domain_names" + option_idx)
            .attr("name", "search_domain_names")
            .attr("value", option['search_domain_names'].join(','))
            .on("change", function() {
                option['search_domain_names'] = this.value.replaceAll(' ', '').split(',');
                displayOkitJson();
            });
        // Check Display
        if (option.type === 'DomainNameServer') {
            $(jqId("server_type_row" + option_idx)).removeClass('collapsed');
            $(jqId("custom_dns_servers_row" + option_idx)).removeClass('collapsed');
            $(jqId("search_domain_names_row" + option_idx)).addClass('collapsed');
        } else {
            $(jqId("server_type_row" + option_idx)).addClass('collapsed');
            $(jqId("custom_dns_servers_row" + option_idx)).addClass('collapsed');
            $(jqId("search_domain_names_row" + option_idx)).removeClass('collapsed');
        }
        if (option.server_type === 'VcnLocalPlusInternet') {
            $(jqId("custom_dns_servers_row" + option_idx)).addClass('collapsed');
        } else {
            $(jqId("custom_dns_servers_row" + option_idx)).removeClass('collapsed');
        }
}
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/dhcp_option.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return DhcpOption.getArtifactReference();
    }
    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference(), Subnet.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDhcpOptionView = function(target) {
    let view_artefact = this.newDhcpOption();
    if (target.type === VirtualCloudNetwork.getArtifactReference()) {
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Subnet.getArtifactReference()) {
        const subnet = this.getOkitJson().getSubnet(target.id)
        view_artefact.getArtefact().vcn_id = subnet.vcn_id;
        view_artefact.getArtefact().compartment_id = target.id;
        subnet.dhcp_options_id = view_artefact.id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDhcpOption = function(obj) {
    this.getDhcpOptions().push(obj ? new DhcpOptionView(obj, this) : new DhcpOptionView(this.okitjson.newDhcpOption(), this));
    return this.getDhcpOptions()[this.getDhcpOptions().length - 1];
}
OkitJsonView.prototype.getDhcpOptions = function() {
    if (!this.dhcp_options) {
        this.dhcp_options = [];
    }
    return this.dhcp_options;
}
OkitJsonView.prototype.getDhcpOption = function(id='') {
    for (let artefact of this.getDhcpOptions()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDhcpOptions = function(dhcp_options) {
    for (const artefact of dhcp_options) {
        this.getDhcpOptions().push(new DhcpOptionView(new DhcpOption(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDhcpOption = function(id) {
    // Build Dialog
    const self = this;
    let dhcp_option = this.getDhcpOption(id);
    $(jqId('modal_dialog_title')).text('Move ' + dhcp_option.display_name);
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
        .attr('id', 'move_dhcp_option_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_dhcp_option_subnet_id');
    $(jqId("move_dhcp_option_subnet_id")).val(dhcp_option.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (dhcp_option.artefact.subnet_id !== $(jqId("move_dhcp_option_subnet_id")).val()) {
                self.getSubnet(dhcp_option.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_dhcp_option_subnet_id")).val()).recalculate_dimensions = true;
                dhcp_option.artefact.subnet_id = $(jqId("move_dhcp_option_subnet_id")).val();
                dhcp_option.artefact.compartment_id = self.getSubnet(dhcp_option.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDhcpOption = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.dhcp_options.push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDhcpOptionsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const dhcp_option_select = $(jqId(select_id));
    if (empty_option) {
        dhcp_option_select.append($('<option>').attr('value', '').text(''));
    }
    for (let dhcp_option of this.getDhcpOptions()) {
        dhcp_option_select.append($('<option>').attr('value', dhcp_option.id).text(dhcp_option.display_name));
    }
}
OkitJsonView.prototype.loadDhcpOptionsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let dhcp_option of this.getDhcpOptions()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(dhcp_option.id))
            .attr('value', dhcp_option.id);
        div.append('label')
            .attr('for', safeId(dhcp_option.id))
            .text(dhcp_option.display_name);
    }
}
