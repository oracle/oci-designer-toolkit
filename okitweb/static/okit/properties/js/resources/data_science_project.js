/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Data Science Project Properties Javascript');

/*
** Define Data Science Project Properties Class
*/
class DataScienceProjectProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Notebook Sessions']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Description
        const description = this.createInput('text', 'Description', `${this.id}_description`, '', (d, i, n) => this.resource.description = n[i].value)
        this.description = description.input
        this.append(this.core_tbody, description.row)
        // Notebook Sessions
        const notebook_sessions_details = this.createDetailsSection('Notebook Sessions', `${this.id}_notebook_sessions_details`)
        this.append(this.notebook_sessions_contents, notebook_sessions_details.details)
        this.notebook_sessions_div = notebook_sessions_details.div
        const notebook_sessions_table = this.createArrayTable('Sessions', `${this.id}_notebook_sessions_table`, '', () => this.addNotebookSession())
        this.notebook_sessions_tbody = notebook_sessions_table.tbody
        this.append(this.notebook_sessions_div, notebook_sessions_table.table)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        // Assign Values
        this.description.property('value', this.resource.description)
        this.loadNotebookSessions()
    }

    loadNotebookSessions() {
        this.notebook_sessions_tbody.selectAll('*').remove()
        this.resource.notebook_sessions.forEach((e, i) => this.addNotebookSessionHtml(e, i+1))
        this.notebook_session_idx = this.resource.notebook_sessions.length;
    }
    addNotebookSession() {
        const session = this.resource.newNotebookSession()
        this.resource.notebook_sessions.push(session)
        this.notebook_session_idx += 1
        this.addNotebookSessionHtml(session, this.notebook_session_idx)
    }
    deleteNotebookSession(id, idx, session) {
        this.resource.notebook_sessions = this.resource.notebook_sessions.filter((e) => e !== session)
        $(`#${id}${idx}_row`).remove()
    }
    addNotebookSessionHtml(session, idx) {
        const id = `${this.id}_notebook_session`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteNotebookSession(id, idx, session))
        this.append(this.notebook_sessions_tbody, delete_row.row)
        const session_details = this.createDetailsSection('Session', `${id}_details`, idx)
        this.append(delete_row.div, session_details.details)
        const session_table = this.createTable('', `${id}_session`, '')
        this.append(session_details.div, session_table.table)
        // Name
        const display_name = this.createInput('text', 'Name', `${id}_display_name`, '', (d, i, n) => session.display_name = n[i].value)
        this.append(session_table.tbody, display_name.row)
        display_name.input.property('value', session.display_name)
        // Subnet
        const subnet_id = this.createInput('select', 'Subnet', `${id}_subnet_id`, '', (d, i, n) => session.notebook_session_config_details.subnet_id = n[i].value)
        this.append(session_table.tbody, subnet_id.row)
        this.loadSelect(subnet_id.input, 'subnet', true)
        subnet_id.input.property('value', session.notebook_session_config_details.subnet_id)
        // Shape
        const shape = this.createInput('select', 'Shape', `${id}_shape`, '', (d, i, n) => {session.notebook_session_config_details.shape = n[i].value; this.handleShapeChange(n[i].value, session, ocpus.input, memory_in_gbs.input)})
        this.append(session_table.tbody, shape.row)
        this.loadShapes(shape.input, session)
        shape.input.property('value', session.notebook_session_config_details.shape)
        // Block Storage Size
        const block_storage_size_in_gbs_data = {min: 50, max: 32768, step: 10}
        const block_storage_size_in_gbs = this.createInput('number', 'Block Storage Size (in GB)', `${id}_block_storage_size_in_gbs`, '', (d, i, n) => session.notebook_session_config_details.block_storage_size_in_gbs = n[i].value, block_storage_size_in_gbs_data)
        this.append(session_table.tbody, block_storage_size_in_gbs.row)
        block_storage_size_in_gbs.input.property('value', session.notebook_session_config_details.block_storage_size_in_gbs)
        // OCPUS
        const ocpus_data = {min: 1, max: 64}
        const ocpus = this.createInput('number', 'OCPUs', `${id}_ocpus`, '', (d, i, n) => {session.notebook_session_config_details.notebook_session_shape_config_details.ocpus = n[i].value; this.handleOcpusChanged(n[i].value, session, memory_in_gbs.input)}, ocpus_data)
        this.append(session_table.tbody, ocpus.row)
        ocpus.input.property('value', session.notebook_session_config_details.notebook_session_shape_config_details.ocpus)
        // Memory
        const memory_in_gbs_data = {min: 1, max: 16}
        const memory_in_gbs = this.createInput('number', 'Memory (in GB)', `${id}_memory_in_gbs`, '', (d, i, n) => session.notebook_session_config_details.notebook_session_shape_config_details.memory_in_gbs = n[i].value, memory_in_gbs_data)
        this.append(session_table.tbody, memory_in_gbs.row)
        memory_in_gbs.input.property('value', session.notebook_session_config_details.notebook_session_shape_config_details.memory_in_gbs)
    }
    loadShapes(select, session) {
        const shape_groups = {
            'AMD  ': (s) => s.name.startsWith('VM.') && s.name.includes('.Flex') && s.name.includes('.E') && !s.name.includes('.Dense'),
            'Intel': (s) => s.name.startsWith('VM.') && s.name.includes('.Flex') && !s.name.includes('.A') && !s.name.includes('.E'),
        }
        this.loadReferenceSelect(select, 'getDataScienceNotebookSessionShape', false, undefined, shape_groups)
        const options = Array.from(select.node().options).map((opt) => opt.value)
        session.notebook_session_config_details.shape = options.includes(session.notebook_session_config_details.shape) ? session.notebook_session_config_details.shape : options.length > 0 ? options[0] : ''
    }
    handleShapeChange(shape, session, ocpus, memory_in_gbs) {
        this.loadOCPUs(shape, session, ocpus)
        this.loadMemoryInGbp(shape, session, memory_in_gbs)
    }
    handleOcpusChanged(ocpus=undefined, session, memory_in_gbs) {
        this.loadMemoryInGbp(session.shape, session, memory_in_gbs)
    }
    loadOCPUs(shape, session, ocpus) {
        const instance_shape = okitOciData.getInstanceShape(shape)
        if (instance_shape && instance_shape.memory_options && instance_shape.ocpu_options) {
            ocpus.attr('min', instance_shape.ocpu_options.min)
            ocpus.attr('max', instance_shape.ocpu_options.max)
            session.notebook_session_config_details.notebook_session_shape_config_details.ocpus = session.notebook_session_config_details.notebook_session_shape_config_details.ocpus > instance_shape.ocpu_options.min ? session.notebook_session_config_details.notebook_session_shape_config_details.ocpus : instance_shape.ocpus
        } else {
            session.notebook_session_config_details.notebook_session_shape_config_details.ocpus = 0
        }
        ocpus.property('value', session.notebook_session_config_details.notebook_session_shape_config_details.ocpus)
    }
    loadMemoryInGbp(shape, session, memory_in_gbs) {
        const instance_shape = okitOciData.getInstanceShape(shape)
        if (instance_shape && instance_shape.memory_options && instance_shape.ocpu_options) {
            const min = Math.max(instance_shape.memory_options.min_in_g_bs, (instance_shape.memory_options.min_per_ocpu_in_gbs * session.notebook_session_config_details.notebook_session_shape_config_details.ocpus));
            const max = Math.min(instance_shape.memory_options.max_in_g_bs, (instance_shape.memory_options.max_per_ocpu_in_gbs * session.notebook_session_config_details.notebook_session_shape_config_details.ocpus));
            memory_in_gbs.attr('min', min)
            memory_in_gbs.attr('max', max)
            session.notebook_session_config_details.notebook_session_shape_config_details.memory_in_gbs = session.notebook_session_config_details.notebook_session_shape_config_details.memory_in_gbs > min ? session.notebook_session_config_details.notebook_session_shape_config_details.memory_in_gbs : min
        } else {
            session.notebook_session_config_details.notebook_session_shape_config_details.memory_in_gbs = 0
        }
        memory_in_gbs.property('value', session.notebook_session_config_details.notebook_session_shape_config_details.memory_in_gbs)
    }

}
