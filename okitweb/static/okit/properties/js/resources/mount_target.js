/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Mount Target Properties Javascript');

/*
** Define Mount Target Properties Class
*/
class MountTargetProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Exports']
        super(resource, resource_tabs)
    }

    // nsg_filter = (r) => r.vcn_id === [...(this.resource.okit_json.subnet ? this.resource.okit_json.subnet : this.resource.okit_json.subnets ? this.resource.okit_json.subnets : [])].filter((s) => s.id === this.resource.subnet_id)[0].vcn_id
    // fss_filter = (r) => r.availability_domain.toString() === this.resource.availability_domain.toString()

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // Availability Domain
        const ad_data = this.ad_data
        const ad = this.createInput('select', 'Availability Domain', `${self.id}_availability_domain`, '', (d, i, n) => self.resource.availability_domain = n[i].value, ad_data)
        this.availability_domain = ad.input
        this.append(this.core_tbody, ad.row)
        // Subnet
        const subnet_id = this.createInput('select', 'Subnet', `${self.id}_subnet_id`, '', (d, i, n) => {self.resource.subnet_id = n[i].value;this.loadMultiSelect(this.nsg_ids, 'network_security_group', false, this.nsg_filter)})
        this.subnet_id = subnet_id.input
        this.append(this.core_tbody, subnet_id.row)

        // Optional Properties
        const ond = this.createDetailsSection('Optional Networking', `${self.id}_optional_network_details`)
        this.append(this.properties_contents, ond.details)
        const ont = this.createTable('', `${self.id}_option_network_properties`)
        this.optional_network_tbody = ont.tbody
        this.append(ond.div, ont.table)
        // Hostname
        const hostname = this.createInput('text', 'Hostname', `${self.id}_hostname_label`, '', (d, i, n) => self.resource.hostname_label = n[i].value)
        this.hostname_label = hostname.input
        this.append(this.optional_network_tbody, hostname.row)
        // IP Address
        const ip = this.createInput('ipv4', 'IP Address', `${self.id}_ip_address`, '', (d, i, n) => {n[i].reportValidity(); self.resource.ip_address = n[i].value})
        this.ip_address = ip.input
        this.append(this.optional_network_tbody, ip.row)
        // Network Security Groups
        const nsg = this.createInput('multiselect', 'Network Security Groups', `${self.id}_nsg_ids`, '', (d, i, n) => self.resource.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.nsg_ids = nsg.input
        this.append(this.optional_network_tbody, nsg.row)
        // Exports
        const esd = this.createDetailsSection('Export Set', `${self.id}_export_set_details`)
        this.append(this.exports_contents, esd.details)
        this.export_set_div = esd.div
        const exports = this.createArrayTable('File Systems', `${self.id}_exports`, '', () => self.addExport())
        this.exports_tbody = exports.tbody
        this.append(esd.div, exports.table)
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
        const id = `${this.id}_export`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteExport(id, idx, fs_export))
        this.append(this.exports_tbody, delete_row.row)
        const ed = this.createDetailsSection('Export', `${id}_export_details`, idx)
        this.append(delete_row.div, ed.details)
        const et = this.createTable('', `${id}_export`, '')
        this.append(ed.div, et.table)
        // File System
        const fss = this.createInput('select', 'File System', `${id}_file_system_id`, idx, (d, i, n) => fs_export.file_system_id = n[i].value)
        this.append(et.table, fss.row)
        this.loadSelect(fss.input, 'file_system', false, this.fss_filter)
        fss.input.property('value', fs_export.file_system_id)
        // Path
        const path_data = this.resource.isOCI() ? {} : {readonly: true}
        const path = this.createInput('text', 'Path', `${id}_path`, idx, (d, i, n) => fs_export.path = n[i].value, path_data)
        this.append(et.table, path.row)
        path.input.property('value', fs_export.path)
        // CIDR
        const cidr = this.createInput('ipv4_cidr', 'Source CIDR', `${id}_options_source`, idx, (d, i, n) => {n[i].reportValidity(); fs_export.options.source = n[i].value})
        this.append(et.table, cidr.row)
        cidr.input.property('value', fs_export.options.source)
        // Access
        const oa = this.createInput('select', 'Permissions', `${id}_options_access`, idx, (d, i, n) => fs_export.options.access = n[i].value)
        this.append(et.table, oa.row)
        this.loadAccess(oa.input)
        oa.input.property('value', fs_export.options.access)
        // Identity Squash
        const ois = this.createInput('select', 'Identity Squash', `${id}_options_identity_squash`, idx, (d, i, n) => fs_export.options.identity_squash = n[i].value)
        this.append(et.table, ois.row)
        this.loadIdentitySquash(ois.input)
        ois.input.property('value', fs_export.options.identity_squash)
        // Gid
        const gid = this.createInput('text', 'Anonymous GID', `${id}_options_gid`, idx, (d, i, n) => fs_export.options.anonymous_gid = n[i].value)
        this.append(et.table, gid.row)
        gid.input.property('value', fs_export.options.anonymous_gid)
        // Uid
        const uid = this.createInput('text', 'Anonymous UID', `${id}_options_uid`, idx, (d, i, n) => fs_export.options.anonymous_uid = n[i].value)
        this.append(et.table, uid.row)
        uid.input.property('value', fs_export.options.anonymous_uid)
        // Privileged
        const psp = this.createInput('checkbox', 'Privileged Port', `${id}_options_require_privileged_source_port`, idx, (d, i, n) => fs_export.options.require_privileged_source_port = n[i].checked)
        this.append(et.table, psp.row)
        psp.input.property('checked', fs_export.options.require_privileged_source_port)
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
