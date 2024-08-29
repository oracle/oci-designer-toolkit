/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded DrgAttachment Properties Javascript');

/*
** Define DrgAttachment Properties Class
*/
class DrgAttachmentProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // VCN
        const vcn_id = this.createInput('select', 'Virtual Cloud Network', `${this.id}_vcn_id`, '', (d, i, n) => {this.resource.vcn_id = n[i].value; this.vcnChanged()})
        this.vcn_id = vcn_id.input
        this.append(this.core_tbody, vcn_id.row)
        // DRG
        const drg_id = this.createInput('select', 'Dynamic Routing Gateway', `${this.id}_drg_id`, '', (d, i, n) => {this.resource.drg_id = n[i].value; this.drgChanged()})
        this.drg_id = drg_id.input
        this.append(this.core_tbody, drg_id.row)
        // Advanced
        const advanced = this.createDetailsSection('Advanced', `${this.id}_advanced_details`)
        this.append(this.properties_contents, advanced.details)
        this.advanced_div = advanced.div
        const advanced_table = this.createTable('', `${this.id}_advanced`)
        this.advanced_tbody = advanced_table.tbody
        this.append(this.advanced_div, advanced_table.table)
        // VCN Route Table
        const route_table_id = this.createInput('select', 'VCN Route Table', `${this.id}_route_table_id`, '', (d, i, n) => {this.resource.route_table_id = n[i].value; this.redraw()})
        this.route_table_id = route_table_id.input
        this.append(this.advanced_tbody, route_table_id.row)
        // DRG Route Table
        const drg_route_table_id = this.createInput('select', 'DRG Route Table', `${this.id}_drg_route_table_id`, '', (d, i, n) => {this.resource.drg_route_table_id = n[i].value; this.redraw()})
        this.drg_route_table_id = drg_route_table_id.input
        this.append(this.advanced_tbody, drg_route_table_id.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Reference Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', false)
        this.loadSelect(this.drg_id, 'drg', true)
        this.loadSelect(this.route_table_id, 'route_table', true, this.vcn_filter)
        this.loadDrgRouteRulesSelect()
        // Assign Values
        this.vcn_id.property('value', this.resource.vcn_id)
        this.drg_id.property('value', this.resource.drg_id)
        this.route_table_id.property('value', this.resource.route_table_id)
        this.drg_route_table_id.property('value', this.resource.drg_route_table_id)
    }

    vcnChanged() {
        this.loadSelect(this.route_table_id, 'route_table', true, this.vcn_filter)
        this.resource.route_table_id = ''
        this.route_table_id.property('value', this.resource.route_table_id)
        this.redraw()
    }

    drgChanged() {
        this.loadDrgRouteRulesSelect()
        this.resource.drg_route_table_id = ''
        this.drg_route_table_id.property('value', this.resource.drg_route_table_id)
        this.redraw()
    }

    loadDrgRouteRulesSelect() {
       this.loadSelectFromList(this.drg_route_table_id, this.resource.drg_id !== '' ? this.resource.getOkitJson().getDrg(this.resource.drg_id).route_tables : [], true)
    }

}
