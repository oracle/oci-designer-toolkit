/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded DhcpOption Properties Javascript');

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
        const [vcn_row, vcn_input] = this.createInput('select', 'Virtual Cloud Network', `${self.id}_vcn_id`, '', (d, i, n) => self.resource.vcn_id = n[i].value)
        this.vcn_id = vcn_input
        this.append(this.core_tbody, vcn_row)
        // Vcn Default
        const [default_row, default_input] = this.createInput('checkbox', 'VCN Default', `${self.id}_default`, '', (d, i, n) => self.resource.default = n[i].checked)
        this.default = default_input
        this.append(this.core_tbody, default_row)
        // Options
        const [opts_details, opts_summary, opts_div] = this.createDetailsSection('Options', `${self.id}_options_details`)
        this.append(this.properties_contents, opts_details)
        this.options_div = opts_div
        const [opt_table, opt_thead, opt_tbody] = this.createArrayTable('Options', `${self.id}_options`, '', () => self.addOption())
        this.options_tbody = opt_tbody
        this.append(opts_div, opt_table)
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
        const [row, div] = this.createDeleteRow(id, idx, () => this.deleteOption(id, idx, option))
        this.append(this.options_tbody, row)
        const [opt_details, opt_summary, opt_div] = this.createDetailsSection('Option', `${self.id}_option_details`, idx)
        this.append(div, opt_details)
        const [opt_table, opt_thead, opt_tbody] = this.createTable('', `${self.id}_option`, '')
        this.append(opt_div, opt_table)
        // Option Type
        const [ot_row, ot_input] = this.createInput('select', 'Type', `${id}_type`, idx, (d, i, n) => {option.type = n[i].value = n[i].value; self.showOptionRows(option, id, idx)})
        this.append(opt_tbody, ot_row)
        this.loadOptionTypeSelect(ot_input)
        ot_input.property('value', option.type)
        // Server Type
        const [st_row, st_input] = this.createInput('select', 'Server Type', `${id}_server_type`, idx, (d, i, n) => {option.server_type = n[i].value = n[i].value; self.showOptionRows(option, id, idx)})
        this.append(opt_tbody, st_row)
        this.loadServerTypeSelect(st_input)
        st_input.property('value', option.server_type)
        // Custom Dns Servers
        const [dns_row, dns_input] = this.createInput('text', 'Dns Servers', `${id}_custom_dns_servers`, idx, (d, i, n) => option.custom_dns_servers = n[i].value.replaceAll(' ', '').split(','))
        this.append(opt_tbody, dns_row)
        dns_input.property('value', option.custom_dns_servers ? option.custom_dns_servers.join(',') : '')
        // Search Domain Names
        const [domain_row, domain_input] = this.createInput('text', 'Search Domain Names', `${id}_search_domain_names`, idx, (d, i, n) => option.search_domain_names = n[i].value.replaceAll(' ', '').split(','))
        this.append(opt_tbody, domain_row)
        domain_input.property('value', option.search_domain_names ? option.search_domain_names.join(',') : '')
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
    }
}
