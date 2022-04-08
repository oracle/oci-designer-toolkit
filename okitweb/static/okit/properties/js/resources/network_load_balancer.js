/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded NetworkLoadBalancer Properties Javascript');

/*
** Define NetworkLoadBalancer Properties Class
*/
class NetworkLoadBalancerProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Backends', 'Listeners']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // Subnet
        const subnet_id = this.createInput('select', 'Subnet', `${this.id}_subnet_id`, '', (d, i, n) => {this.resource.subnet_id = n[i].value;this.loadMultiSelect(this.network_security_group_ids, 'network_security_group', false, this.nsg_filter)})
        this.subnet_id = subnet_id.input
        this.append(this.core_tbody, subnet_id.row)
        // Is Private
        const is_private = this.createInput('checkbox', 'Private', `${this.id}_is_private`, '', (d, i, n) => {this.resource.is_private = n[i].checked; this.redraw()})
        this.is_private = is_private.input
        this.append(this.core_tbody, is_private.row)
        // Is Preserve Source / Destination
        const is_preserve_source_destination = this.createInput('checkbox', 'Preserve Source / Destination', `${this.id}_is_preserve_source_destination`, '', (d, i, n) => {this.resource.is_preserve_source_destination = n[i].checked; this.redraw()})
        this.is_preserve_source_destination = is_preserve_source_destination.input
        this.append(this.core_tbody, is_preserve_source_destination.row)
        // NSG Lists
        const network_security_group_ids = this.createInput('multiselect', 'Network Security Groups', `${this.id}_network_security_group_ids`, '', (d, i, n) => this.resource.network_security_group_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.network_security_group_ids = network_security_group_ids.input
        this.append(this.core_tbody, network_security_group_ids.row)
        // Backend Sets
        const backend_sets_details = this.createDetailsSection('Backend Sets', `${this.id}_backend_sets_details`)
        this.append(this.backends_contents, backend_sets_details.details)
        this.backend_sets_div = backend_sets_details.div
        const backend_sets = this.createArrayTable('Backend Sets', `${this.id}_backend_sets`, '', () => this.addBackendSet())
        this.backend_sets_tbody = backend_sets.tbody
        this.append(backend_sets_details.div, backend_sets.table)
        // Listeners
        const listeners_details = this.createDetailsSection('Listeners', `${this.id}_listeners_details`)
        this.append(this.listeners_contents, listeners_details.details)
        this.listeners_div = listeners_details.div
        const listeners = this.createArrayTable('Listeners', `${this.id}_listeners`, '', () => this.addListener())
        this.listeners_tbody = listeners.tbody
        this.append(listeners_details.div, listeners.table)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadMultiSelect(this.network_security_group_ids, 'network_security_group', false, this.nsg_filter)
        // Assign Values
        this.subnet_id.property('value', this.resource.subnet_id)
        Array.from(this.network_security_group_ids.node().querySelectorAll('input[type="checkbox"]')).filter((n) => this.resource.network_security_group_ids.includes(n.value)).forEach((n) => n.checked = true)
        this.loadBackendSets()
        this.loadListeners()
    }

    loadBackendSets() {
        this.backend_sets_tbody.selectAll('*').remove()
        this.resource.backend_sets.forEach((e, i) => this.addBackendSetHtml(e, i+1))
        this.backend_sets_idx = this.resource.backend_sets.length;
    }
    addBackendSetHtml(backend_set, idx) {
        const id = `${this.id}_backend_set`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteBackendSet(id, idx, backend_set))
        this.append(this.backend_sets_tbody, delete_row.row)
        const bs_details = this.createDetailsSection(backend_set.name, `${id}_backend_set_details`, idx)
        this.append(delete_row.div, bs_details.details)
        const bs_table = this.createTable('', `${id}_backend_set_table`, '')
        this.append(bs_details.div, bs_table.table)
        // Name
        const name = this.createInput('text', 'Name', `${id}_name`, idx, (d, i, n) => {backend_set.name = n[i].value;bs_details.summary.text(backend_set.name)})
        this.append(bs_table.table, name.row)
        name.input.property('value', backend_set.name)
        // Policy
        const policy = this.createInput('select', 'Policy', `${id}_policy`, idx, (d, i, n) => backend_set.policy = n[i].value = n[i].value)
        this.append(bs_table.table, policy.row)
        this.loadPolicySelect(policy.input)
        policy.input.property('value', backend_set.policy)
        // Backends
        const backends_details = this.createDetailsSection('Backends', `${id}_backends_details`)
        this.append(bs_details.div, backends_details.details)
        // this.backends_div = backends_details.div
        const backends = this.createArrayTable('Backends', `${id}_backends`, '', () => this.addBackend(backend_set, backends.tbody))
        // this.backends_tbody = backends.tbody
        this.append(backends_details.div, backends.table)
        this.loadBackends(backend_set, backends.tbody)
    }
    addBackendSet() {
        const backend_set = this.resource.newBackendSet();
        this.resource.backend_sets.push(backend_set);
        this.backend_sets_idx += 1
        this.addBackendSetHtml(backend_set, this.backend_sets_idx);
    }
    deleteBackendSet(id, idx, backend_set) {
        this.resource.backend_sets = this.resource.backend_sets.filter((e) => e !== backend_set)
        $(`#${id}${idx}_row`).remove()
    }

    loadBackends(backend_set, backends_tbody) {
        backends_tbody.selectAll('*').remove()
        backend_set.backends.forEach((e, i) => this.addBackendHtml(e, i+1, backend_set, backends_tbody))
        this.backends_idx = this.backends_idx ? this.backends_idx + backend_set.backends.length : backend_set.backends.length;
    }
    addBackendHtml(backend, idx, backend_set, backends_tbody) {
        const id = `${this.id}_backend`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteBackend(id, idx, backend, backend_set))
        this.append(backends_tbody, delete_row.row)
        const bs_details = this.createDetailsSection(backend.name, `${id}_backend_details`, idx)
        this.append(delete_row.div, bs_details.details)
        const bs_table = this.createTable('', `${id}_backend_table`, idx)
        this.append(bs_details.div, bs_table.table)
        // Name
        const name = this.createInput('text', 'Name', `${id}_name`, idx, (d, i, n) => {backend.name = n[i].value;bs_details.summary.text(backend.name)})
        this.append(bs_table.table, name.row)
        name.input.property('value', backend.name)
        // Target Id
        const target_id = this.createInput('select', 'Instance', `${id}_target_id`, idx, (d, i, n) => backend.target_id = n[i].value)
        this.append(bs_table.table, target_id.row)
        this.loadSelect(target_id.input, 'all_instances', false)
        target_id.input.property('value', backend.target_id)
        // Port
        const port = this.createInput('number', 'Port', `${id}_port`, idx, (d, i, n) => backend.port = n[i].value)
        this.append(bs_table.table, port.row)
        port.input.property('value', backend.port)
        // IP Address
        const ip_address = this.createInput('ipv4', 'IP Address', `${id}_ip_address`, idx, (d, i, n) => backend.ip_address = n[i].value)
        this.append(bs_table.table, ip_address.row)
        ip_address.input.property('value', backend.ip_address)
        // Weight
        const weight = this.createInput('number', 'Weight', `${id}_weight`, idx, (d, i, n) => backend.weight = n[i].value)
        this.append(bs_table.table, weight.row)
        weight.input.property('value', backend.weight)
        // Backup
        const is_backup = this.createInput('checkbox', 'Backup', `${id}_is_backup`, idx, (d, i, n) => backend.is_backup = n[i].checked)
        this.append(bs_table.table, is_backup.row)
        is_backup.input.property('checked', backend.is_backup)
        // Drain
        const is_drain = this.createInput('checkbox', 'Drain', `${id}_is_drain`, idx, (d, i, n) => backend.is_drain = n[i].checked)
        this.append(bs_table.table, is_drain.row)
        is_drain.input.property('checked', backend.is_drain)
        // Offline
        const is_offline = this.createInput('checkbox', 'Offline', `${id}_is_offline`, idx, (d, i, n) => backend.is_offline = n[i].checked)
        this.append(bs_table.table, is_offline.row)
        is_offline.input.property('checked', backend.is_offline)
    }
    addBackend(backend_set, backends_tbody) {
        const backend = this.resource.newBackend();
        backend_set.backends.push(backend);
        this.backends_idx += 1
        this.addBackendHtml(backend, this.backends_idx, backend_set, backends_tbody);
    }
    deleteBackend(id, idx, backend, backend_set) {
        backend_set.backends = backend_set.backends.filter((e) => e !== backend)
        $(`#${id}${idx}_row`).remove()
    }

    loadListeners() {
        this.listeners_tbody.selectAll('*').remove()
        this.resource.listeners.forEach((e, i) => this.addListenerHtml(e, i+1))
        this.listeners_idx = this.resource.listeners.length;
    }
    addListenerHtml(listeners, idx) {
        const id = `${this.id}_listeners`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteBackendSet(id, idx, listeners))
        this.append(this.listeners_tbody, delete_row.row)
        const ed = this.createDetailsSection('Listener', `${id}_listeners_details`, idx)
        this.append(delete_row.div, ed.details)
        const et = this.createTable('', `${id}_listeners_table`, '')
        this.append(ed.div, et.table)
    }
    addListener() {
        const listener = this.resource.newListener();
        this.resource.listeners.push(listener);
        this.listeners_idx += 1
        this.addListenerHtml(listener, this.listeners_idx);
    }
    deleteListener(id, idx, listener) {
        this.resource.listeners = this.resource.listeners.filter((e) => e !== listener)
        $(`#${id}${idx}_row`).remove()
    }
    loadPolicySelect(select) {
        const types_map = new Map([ // Map to Terraform Local Variable Names
            ['Five Tuple', 'FIVE_TUPLE'],
            ['Three Tuple', 'THREE_TUPLE'],
            ['Two Tuple', 'Two_TUPLE'],
        ]);
        this.loadSelectFromMap(select, types_map)
    }
}
