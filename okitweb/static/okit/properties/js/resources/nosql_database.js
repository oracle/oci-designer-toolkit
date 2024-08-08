/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded NoSQL Database Properties Javascript');

/*
** Define NoSQL Database Properties Class
*/
class NosqlDatabaseProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['DDL', 'Indexes']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Auto Reclaimable
        const is_auto_reclaimable = this.createInput('checkbox', 'Auto Reclaimable', `${this.id}_is_auto_reclaimable`, '', (d, i, n) => {this.resource.is_auto_reclaimable = n[i].checked})
        this.is_auto_reclaimable = is_auto_reclaimable.input
        this.append(this.core_tbody, is_auto_reclaimable.row)
        // Capacity Mode
        const capacity_mode = this.createInput('select', 'Capacity Mode', `${this.id}_capacity_mode`, '', (d, i, n) => {this.resource.table_limits.capacity_mode = n[i].value; this.capacityModeChanged()})
        this.capacity_mode = capacity_mode.input
        this.append(this.core_tbody, capacity_mode.row)
        this.loadCapacityModeSelect(this.capacity_mode)
        // Max Storage
        const max_storage_in_gbs_data = {min: 1}
        const max_storage_in_gbs = this.createInput('number', 'Max Storage (Gbs)', `${this.id}_max_storage_in_gbs`, '', (d, i, n) => this.resource.table_limits.max_storage_in_gbs = n[i].value, max_storage_in_gbs_data)
        this.max_storage_in_gbs = max_storage_in_gbs.input
        this.max_storage_in_gbs_row = max_storage_in_gbs.row
        this.append(this.core_tbody, max_storage_in_gbs.row)
        // Max Read Units
        const max_read_units_data = {min: 1}
        const max_read_units = this.createInput('number', 'Max Read Units', `${this.id}_max_read_units`, '', (d, i, n) => this.resource.table_limits.max_read_units = n[i].value, max_read_units_data)
        this.max_read_units = max_read_units.input
        this.max_read_units_row = max_read_units.row
        this.append(this.core_tbody, max_read_units.row)
        // Max Read Units
        const max_write_units_data = {min: 1}
        const max_write_units = this.createInput('number', 'Max Read Units', `${this.id}_max_write_units`, '', (d, i, n) => this.resource.table_limits.max_write_units = n[i].value, max_write_units_data)
        this.max_write_units = max_write_units.input
        this.max_write_units_row = max_write_units.row
        this.append(this.core_tbody, max_write_units.row)
        // Pricing Estimates
        const pricing_estimates_details = this.createDetailsSection('Pricing Estimates', `${this.id}_pricing_estimates_details`)
        this. pricing_estimates_details =  pricing_estimates_details.details
        this.append(this.properties_contents, pricing_estimates_details.details)
        const pricing_estimates_table = this.createTable('', `${this.id}_pricing_estimates_properties`)
        this.pricing_estimates_tbody = pricing_estimates_table.tbody
        this.append(pricing_estimates_details.div, pricing_estimates_table.table)
        // On Demand Reads
        const estimated_on_demand_reads_per_month_data = {min: 0}
        const estimated_on_demand_reads_per_month = this.createInput('number', 'Estimated Monthly On Demand Reads', `${this.id}_estimated_on_demand_reads_per_month`, '', (d, i, n) => {n[i].reportValidity(); this.resource.pricing_estimates.estimated_on_demand_reads_per_month = n[i].value}, estimated_on_demand_reads_per_month_data)
        this.append(this.pricing_estimates_tbody, estimated_on_demand_reads_per_month.row)
        this.estimated_on_demand_reads_per_month = estimated_on_demand_reads_per_month.input
        this.estimated_on_demand_reads_per_month_row = estimated_on_demand_reads_per_month.row
        // On Demand Reads
        const estimated_on_demand_writes_per_month_data = {min: 0}
        const estimated_on_demand_writes_per_month = this.createInput('number', 'Estimated Monthly On Demand Writes', `${this.id}_estimated_on_demand_writes_per_month`, '', (d, i, n) => {n[i].reportValidity(); this.resource.pricing_estimates.estimated_on_demand_writes_per_month = n[i].value}, estimated_on_demand_writes_per_month_data)
        this.append(this.pricing_estimates_tbody, estimated_on_demand_writes_per_month.row)
        this.estimated_on_demand_writes_per_month = estimated_on_demand_writes_per_month.input
        this.estimated_on_demand_writes_per_month_row = estimated_on_demand_writes_per_month.row
        // DDL Statement
        const ddl_statement_data = {placeholder: `CREATE TABLE users (
    id INTEGER,
    firstName STRING,
    lastName STRING,
    otherNames ARRAY(RECORD(first STRING, last STRING)),
    age INTEGER,
    income INTEGER,
    address JSON,
    connections ARRAY(INTEGER),
    expenses MAP(INTEGER),
PRIMARY KEY (id)
);`}
        const ddl_statement = this.createTextArea(`${this.id}_ddl_statement`, '', (d, i, n) => this.resource.ddl_statement = n[i].value, ddl_statement_data)
        this.ddl_statement = ddl_statement.input
        this.append(this.ddl_contents, this.ddl_statement)
        // Indexes
        const indexes_details = this.createDetailsSection('Indexes', `${this.id}_indexes_details`)
        this.append(this.indexes_contents, indexes_details.details)
        this.indexes_div = indexes_details.div
        const indexes_table = this.createArrayTable('Indexes', `${this.id}_indexes_table`, '', () => this.addIndex())
        this.indexes_tbody = indexes_table.tbody
        this.append(indexes_details.div, indexes_table.table)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        // Assign Values
        this.is_auto_reclaimable.property('checked', this.resource.is_auto_reclaimable)
        this.ddl_statement.property('value', this.resource.ddl_statement)
        this.capacity_mode.property('value', this.resource.table_limits.capacity_mode)
        this.max_storage_in_gbs.property('value', this.resource.table_limits.max_storage_in_gbs)
        this.max_read_units.property('value', this.resource.table_limits.max_read_units)
        this.max_write_units.property('value', this.resource.table_limits.max_write_units)
        this.estimated_on_demand_reads_per_month.property('value', this.resource.pricing_estimates.estimated_on_demand_reads_per_month)
        this.estimated_on_demand_writes_per_month.property('value', this.resource.pricing_estimates.estimated_on_demand_writes_per_month)
        this.showHideReadWrite()
        this.loadIndexes()
    }
    loadIndexes() {
        this.indexes_tbody.selectAll('*').remove()
        this.resource.indexes.forEach((e, i) => this.addIndexHtml(e, i+1))
        this.index_idx = this.resource.indexes.length
    }
    addIndexHtml(index, idx) {
        const id = `${this.id}_index`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteIndex(id, idx, index))
        this.append(this.indexes_tbody, delete_row.row)
        const ed = this.createDetailsSection('Index', `${id}_index_details`, idx)
        this.append(delete_row.div, ed.details)
        const et = this.createTable('', `${id}_index`, '')
        this.append(ed.div, et.table)
        // Index Name
        const name_data = {
            minlength: '1',
            pattern: '^[a-zA-Z][a-zA-Z0-9]{1,}$',
            title: 'Only letters and numbers, starting with a letter. Minimum 1 character.',
            required: true                
        }
        const index_name = this.createInput('text', 'Name', `${id}_index_name`, idx, (d, i, n) => index.name = n[i].value, name_data)
        this.append(et.table, index_name.row)
        index_name.input.property('value', index.name)
        // Create if exists
        const is_if_not_exists = this.createInput('checkbox', 'Allowed if Exists', `${id}_is_if_not_exists`, idx, (d, i, n) => index.is_if_not_exists = n[i].checked)
        this.append(et.table, is_if_not_exists.row)
        is_if_not_exists.input.property('checked', index.is_if_not_exists)
        // Keys
        const keys_details = this.createDetailsSection('Key Columns', `${id}_keys_details`)
        this.append(ed.div, keys_details.details)
        const keys_table = this.createArrayTable('Keys', `${id}_keys_table`, '', () => this.addIndexKey(index, keys_table.tbody))
        this.append(keys_details.div, keys_table.table)
        this.loadIndexKeys(index, keys_table.tbody)
    }
    addIndex() {
        const index = this.resource.newIndex()
        this.resource.indexes.push(index)
        this.index_idx += 1
        this.addIndexHtml(index, this.index_idx)
    }
    deleteIndex(id, idx, index) {
        this.resource.indexes = this.resource.indexes.filter(i => i !== index)
        $(`#${id}${idx}_row`).remove()
    }
    loadIndexKeys(index, keys_tbody) {
        keys_tbody.selectAll('*').remove()
        index.keys.forEach((e, i) => this.addIndexKeyHtml(e, i+1, keys_tbody, index))
        this.index_key_idx = this.index_key_idx ? this.index_key_idx + index.keys.length : index.keys.length
    }
    addIndexKeyHtml(key, idx, keys_tbody, index) {
        const id = `${this.id}_key`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteIndexKey(id, idx, key, index, keys_tbody))
        this.append(keys_tbody, delete_row.row)
        const ed = this.createDetailsSection('Key', `${id}_key_details`, idx)
        this.append(delete_row.div, ed.details)
        const et = this.createTable('', `${id}_key`, '')
        this.append(ed.div, et.table)
        // Column Name
        const name_data = {
            minlength: '1',
            pattern: '^[a-zA-Z][a-zA-Z0-9]{1,}$',
            title: 'Only letters and numbers, starting with a letter. Minimum 1 character.',
            required: true                
        }
        const column_name = this.createInput('text', 'Column', `${id}_column_name`, idx, (d, i, n) => key.column_name = n[i].value, name_data)
        this.append(et.table, column_name.row)
        column_name.input.property('value', key.column_name)
        // Json Field Type
        const json_field_type = this.createInput('text', 'Json Field Type', `${id}_json_field_type`, idx, (d, i, n) => key.json_field_type = n[i].value)
        this.append(et.table, json_field_type.row)
        json_field_type.input.property('value', key.json_field_type)
        // Json Path
        const json_path = this.createInput('text', 'Json Path', `${id}_json_path`, idx, (d, i, n) => key.json_path = n[i].value)
        this.append(et.table, json_path.row)
        json_path.input.property('value', key.json_path)
    }
    addIndexKey(index, keys_tbody) {
        const key = this.resource.newIndexKey()
        index.keys.push(key)
        this.index_key_idx != 1
        this.addIndexKeyHtml(key, this.index_key_idx, keys_tbody, index)
    }
    deleteIndexKey(id, idx, key, index, keys_tbody) {
        index.keys = index.keys.filter(k => k !== key)
        $(`#${id}${idx}_row`).remove()
    }

    capacityModeChanged() {
        if (this.resource.table_limits.capacity_mode === 'ON_DEMAND') {
            this.resource.table_limits.max_read_units = 0
            this.resource.table_limits.max_write_units = 0
        } else {
            if (this.resource.table_limits.max_read_units === 0) this.resource.table_limits.max_read_units = 1
            if (this.resource.table_limits.max_write_units === 0) this.resource.table_limits.max_write_units = 1
        }
        this.showHideReadWrite()
    }

    showHideReadWrite() {
        this.pricing_estimates_details.classed('hidden', this.resource.table_limits.capacity_mode !== 'ON_DEMAND')
        this.max_read_units_row.classed('collapsed', this.resource.table_limits.capacity_mode === 'ON_DEMAND')
        this.max_write_units_row.classed('collapsed', this.resource.table_limits.capacity_mode === 'ON_DEMAND')
        this.max_read_units.property('value', this.resource.table_limits.max_read_units)
        this.max_write_units.property('value', this.resource.table_limits.max_write_units)
    }

    loadCapacityModeSelect(select) {
        const options_map = new Map([
            ['Provisioned', 'PROVISIONED'],
            ['On Demand', 'ON_DEMAND'],
        ]);
        this.loadSelectFromMap(select, options_map)
    }

}
