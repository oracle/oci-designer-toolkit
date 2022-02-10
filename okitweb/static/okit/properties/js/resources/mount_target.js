/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Mount Target Properties Javascript');

/*
** Define Mount Target View Class
*/
class MountTargetProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Exports']
        super(resource, resource_tabs)
    }

    nsg_filter = (r) => r.vcn_id === [...(this.resource.okit_json.subnet ? this.resource.okit_json.subnet : this.resource.okit_json.subnets ? this.resource.okit_json.subnets : [])].filter((s) => s.id === this.resource.subnet_id)[0].vcn_id
    fss_filter = (r) => r.availability_domain.toString() === this.resource.availability_domain.toString()

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // Availability Domain
        const [ad_row, ad_input] = this.createInput('select', 'Availability Domain', `${self.id}_availability_domain`, '', (d, i, n) => self.resource.availability_domain = n[i].value, {options: {1: 'Availability Domain 1', 2: 'Availability Domain 2', 3: 'Availability Domain 3'}})
        this.availability_domain = ad_input
        this.append(this.core_tbody, ad_row)
        // Subnet
        const [s_row, s_input] = this.createInput('select', 'Subnet', `${self.id}_subnet_id`, '', (d, i, n) => {self.resource.subnet_id = n[i].value;this.loadMultiSelect(this.nsg_ids, 'network_security_group', false, this.nsg_filter)})
        this.subnet_id = s_input
        this.append(this.core_tbody, s_row)

        // Optional Properties
        const [details, summary, div] = this.createDetailsSection('Optional Networking', `${self.id}_optional_network_details`)
        this.append(this.properties_contents, details)
        const [table, thead, tbody] = this.createTable('', `${self.id}_option_network_properties`)
        this.optional_network_tbody = tbody
        this.append(div, table)
        // Hostname
        const [hn_row, hn_input] = this.createInput('text', 'Hostname', `${self.id}_hostname_label`, '', (d, i, n) => self.resource.hostname_label = n[i].value)
        this.hostname_label = hn_input
        this.append(this.optional_network_tbody, hn_row)
        // IP Address
        const [ip_row, ip_input] = this.createInput('ipv4', 'IP Address', `${self.id}_ip_address`, '', (d, i, n) => {n[i].reportValidity(); self.resource.ip_address = n[i].value})
        this.ip_address = ip_input
        this.append(this.optional_network_tbody, ip_row)
        // Network Security Groups
        const [nsg_row, nsg_input] = this.createInput('multiselect', 'Network Security Groups', `${self.id}_nsg_ids`, '', (d, i, n) => self.resource.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.nsg_ids = nsg_input
        this.append(this.optional_network_tbody, nsg_row)
        // Exports
        const [es_details, es_summary, es_div] = this.createDetailsSection('Export Set', `${self.id}_export_set_details`)
        this.append(this.exports_contents, es_details)
        this.export_set_div = es_div
        const [e_table, e_thead, e_tbody] = this.createArrayTable('File Systems', `${self.id}_exports`, '', () => self.addExport())
        this.exports_tbody = e_tbody
        this.append(es_div, e_table)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadMultiSelect(this.nsg_ids, 'network_security_group', false, this.nsg_filter)
        // Assign Values
        this.availability_domain.property('value', this.resource.availability_domain)
        this.subnet_id.property('value', this.resource.subnet_id)
        this.hostname_label.property('value', this.resource.hostname_label)
        this.ip_address.property('value', this.resource.ip_address)
        Array.from(this.nsg_ids.node().querySelectorAll('input[type="checkbox"]')).filter((n) => this.resource.nsg_ids.includes(n.value)).forEach((n) => n.checked = true)
        this.loadExports()
    }
    loadExports() {
        this.exports_tbody.selectAll('*').remove()
        this.resource.exports.forEach((e, i) => this.addExportHtml(e, i+1))
        this.export_idx = this.resource.exports.length;
    }
    addExportHtml(fs_export, idx) {
        const id = `${self.id}_export`
        const [row, div] = this.createDeleteRow(id, idx, () => this.deleteExport(id, idx, fs_export))
        this.append(this.exports_tbody, row)
        const [e_details, e_summary, e_div] = this.createDetailsSection('Export', `${self.id}_export_details`, idx)
        this.append(div, e_details)
        const [e_table, e_thead, e_tbody] = this.createTable('', `${self.id}_export`, '')
        this.append(e_div, e_table)
        // File System
        const [fss_row, fss_input] = this.createInput('select', 'File System', `${id}_file_system_id`, idx, (d, i, n) => fs_export.file_system_id = n[i].value = n[i].value)
        this.append(e_tbody, fss_row)
        this.loadSelect(fss_input, 'file_system', false, this.fss_filter)
        fss_input.property('value', fs_export.file_system_id)
        // Path
        const [p_row, p_input] = this.createInput('text', 'Path', `${id}_hostname_label`, idx, (d, i, n) => fs_export.path = n[i].value)
        this.append(e_tbody, p_row)
        p_input.property('value', fs_export.path)
        // CIDR
        const [cidr_row, cidr_input] = this.createInput('ipv4_cidr', 'Source CIDR', `${id}_options_source`, idx, (d, i, n) => fs_export.options.source = n[i].value)
        this.append(e_tbody, cidr_row)
        cidr_input.property('value', fs_export.options.source)
        // Access
        const [oa_row, oa_input] = this.createInput('select', 'Permissions', `${id}_options_access`, idx, (d, i, n) => fs_export.options.access = n[i].value = n[i].value)
        this.append(e_tbody, oa_row)
        this.loadAccess(oa_input)
        oa_input.property('value', fs_export.options.access)
        // Identity Squash
        const [ois_row, ois_input] = this.createInput('select', 'Identity Squash', `${id}_options_identity_squash`, idx, (d, i, n) => fs_export.options.identity_squash = n[i].value = n[i].value)
        this.append(e_tbody, ois_row)
        this.loadIdentitySquash(ois_input)
        ois_input.property('value', fs_export.options.identity_squash)
        // Gid
        const [gid_row, gid_input] = this.createInput('text', 'Anonymous GID', `${id}_options_gid`, idx, (d, i, n) => fs_export.options.anonymous_gid = n[i].value)
        this.append(e_tbody, gid_row)
        gid_input.property('value', fs_export.options.anonymous_gid)
        // Uid
        const [uid_row, uid_input] = this.createInput('text', 'Anonymous UID', `${id}_options_uid`, idx, (d, i, n) => fs_export.options.anonymous_uid = n[i].value)
        this.append(e_tbody, uid_row)
        uid_input.property('value', fs_export.options.anonymous_uid)
        // Privileged
        const [psp_row, psp_input] = this.createInput('checkbox', 'Privileged Port', `${id}_options_require_privileged_source_port`, idx, (d, i, n) => fs_export.options.require_privileged_source_port = n[i].checked)
        this.append(e_tbody, psp_row)
        psp_input.property('checked', fs_export.options.require_privileged_source_port)
    }
    addExport() {
        console.info('Adding Export');
        const fs_export = this.resource.newExport();
        this.resource.exports.push(fs_export);
        // const idx = this.artefact.exports.length;
        this.export_idx += 1
        this.addExportHtml(fs_export, this.export_idx);
    }
    deleteExport(id, idx, fs_export) {
        this.resource.exports = this.resource.exports.filter((e) => e !== fs_export)
        $(`#${id}${idx}_row`).remove()
    }
    loadIdentitySquash(parent) {
        ['ALL', 'ROOT', 'NONE'].forEach((v) => parent.append('option').attr('value', v).text(titleCase(v)))
    }

    loadAccess(parent) {
        ['READ_ONLY', 'READ_WRITE'].forEach((v) => parent.append('option').attr('value', v).text(titleCase(v.replaceAll('_', ' '))))
    }

}
