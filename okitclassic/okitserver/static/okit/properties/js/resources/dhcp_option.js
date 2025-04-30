/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded DhcpOption Properties Javascript');

/*
** Define DhcpOption Properties Class
*/
class DhcpOptionProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // VCN
        const vcn_id = this.createInput('select', 'Virtual Cloud Network', `${self.id}_vcn_id`, '', (d, i, n) => self.resource.vcn_id = n[i].value)
        this.vcn_id = vcn_id.input
        this.append(this.core_tbody, vcn_id.row)
        // Vcn Default
        const vcn_default = this.createInput('checkbox', 'VCN Default', `${self.id}_default`, '', (d, i, n) => self.resource.default = n[i].checked)
        this.default = vcn_default.input
        this.append(this.core_tbody, vcn_default.row)
        // Options
        const opts_details = this.createDetailsSection('Options', `${self.id}_options_details`)
        this.append(this.properties_contents, opts_details.details)
        this.options_div = opts_details.div
        const opt_table = this.createArrayTable('Options', `${self.id}_options`, '', () => self.addOption())
        this.options_tbody = opt_table.tbody
        this.append(this.options_div, opt_table.table)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Reference Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', true)
        // Assign Values
        this.vcn_id.property('value', this.resource.vcn_id)
        this.default.property('checked', this.resource.default)
        this.loadOptions()
    }
    loadOptions() {
        this.options_tbody.selectAll('*').remove()
        this.resource.options.forEach((e, i) => this.addOptionHtml(e, i+1))
        this.option_idx = this.resource.options.length;
    }
    addOptionHtml(option, idx) {
        const self = this
        const id = `${self.id}_option`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteOption(id, idx, option))
        this.append(this.options_tbody, delete_row.row)
        const opt_details = this.createDetailsSection('Option', `${self.id}_option_details`, idx)
        this.append(delete_row.div, opt_details.details)
        const opt_table = this.createTable('', `${self.id}_option`, '')
        this.append(opt_details.div, opt_table.table)
        // Option Type
        const option_type = this.createInput('select', 'Type', `${id}_type`, idx, (d, i, n) => {option.type = n[i].value; self.optionTypeChanged(option, id, idx)})
        this.append(opt_table.tbody, option_type.row)
        this.loadOptionTypeSelect(option_type.input)
        option_type.input.property('value', option.type)
        // Server Type
        const server_type = this.createInput('select', 'Server Type', `${id}_server_type`, idx, (d, i, n) => {option.server_type = n[i].value; self.showOptionRows(option, id, idx)})
        this.append(opt_table.tbody, server_type.row)
        this.loadServerTypeSelect(server_type.input)
        server_type.input.property('value', option.server_type)
        // Custom Dns Servers
        const dns_servers = this.createInput('text', 'Dns Servers', `${id}_custom_dns_servers`, idx, (d, i, n) => option.custom_dns_servers = n[i].value.replaceAll(' ', '').split(','))
        this.append(opt_table.tbody, dns_servers.row)
        dns_servers.input.property('value', option.custom_dns_servers ? option.custom_dns_servers.join(',') : '')
        // Search Domain Names
        const domain_names = this.createInput('text', 'Search Domain Names', `${id}_search_domain_names`, idx, (d, i, n) => option.search_domain_names = n[i].value.replaceAll(' ', '').split(','))
        this.append(opt_table.tbody, domain_names.row)
        domain_names.input.property('value', option.search_domain_names ? option.search_domain_names.join(',') : '')
        // Check Display
        this.showOptionRows(option, id, idx)
    }
    addOption() {
        const option = this.resource.newOption();
        this.resource.options.push(option);
        this.option_idx += 1
        this.addOptionHtml(option, this.option_idx);
    }
    deleteOption(id, idx, option) {
        this.resource.options = this.resource.options.filter((e) => e !== option)
        $(`#${id}${idx}_row`).remove()
    }
    loadOptionTypeSelect(select) {
        const types_map = new Map([
            ['Domain Name Server', 'DomainNameServer'],
            ['Search Domain', 'SearchDomain'],
        ]);
        this.loadSelectFromMap(select, types_map)
    }
    loadServerTypeSelect(select) {
        const types_map = new Map([
            ['Custom Dns Server', 'CustomDnsServer'],
            // ['Vcn Local', 'VcnLocal'],
            ['Vcn Local Plus Internet', 'VcnLocalPlusInternet'],
        ]);
        this.loadSelectFromMap(select, types_map)
    }
    loadTypeSelect(type_select, types_map) {
        types_map.forEach((v, t) => type_select.append('option').attr('value', v).text(t))
    }
    optionTypeChanged(option, id, idx) {
        if (option.type === 'SearchDomain') {
            option.server_type = ''
            option.custom_dns_servers = []
        } else if (option.server_type === '') {
            option.server_type = 'VcnLocalPlusInternet'
            option.search_domain_names = []
            d3.select(`#${this.trId(`${id}_server_type`, idx)}`).property('value', option.server_type)
        }
        this.showOptionRows(option, id, idx)
    }
    showOptionRows(option, id, idx) {
        this.hideProperty(`${id}_server_type`, idx)
        this.hideProperty(`${id}_custom_dns_servers`, idx)
        this.hideProperty(`${id}_search_domain_names`, idx)
        if (option.type === 'DomainNameServer') {
            this.showProperty(`${id}_server_type`, idx)
            if (option.server_type === 'CustomDnsServer') {
                this.showProperty(`${id}_custom_dns_servers`, idx)
            }
        } else {
            this.showProperty(`${id}_search_domain_names`, idx)
        }
        this.setPropertyValue(`${id}_server_type`, idx, option.server_type)
        this.setPropertyValue(`${id}_custom_dns_servers`, idx, option.custom_dns_servers ? option.custom_dns_servers.join(',') : '')
        this.setPropertyValue(`${id}_search_domain_names`, idx, option.search_domain_names ? option.search_domain_names.join(',') : '')
    }
}
