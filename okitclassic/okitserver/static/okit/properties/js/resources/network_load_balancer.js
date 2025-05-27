/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded NetworkLoadBalancer Properties Javascript');

/*
** Define NetworkLoadBalancer Properties Class
*/
class NetworkLoadBalancerProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Backends', 'Listeners']
        super(resource, resource_tabs)
        // Update because 0 is a wild card
        this.port_range_data.min = 1
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // Subnet
        const subnet_id = this.createInput('select', 'Subnet', `${this.id}_subnet_id`, '', (d, i, n) => {this.resource.subnet_id = n[i].value;this.loadMultiSelect(this.network_security_group_ids, 'network_security_group', false, this.nsg_filter)})
        this.subnet_id = subnet_id.input
        this.append(this.core_tbody, subnet_id.row)
        // Is Private
        const is_private = this.createInput('checkbox', 'Private', `${this.id}_is_private`, '', (d, i, n) => {this.resource.is_private = n[i].checked; this.redraw(); this.updateListeners()})
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
        this.is_private.property('checked', this.resource.is_private)
        this.is_preserve_source_destination.property('checked', this.resource.is_preserve_source_destination)
        Array.from(this.network_security_group_ids.node().querySelectorAll('input[type="checkbox"]')).filter((n) => this.resource.network_security_group_ids.includes(n.value)).forEach((n) => n.checked = true)
        this.loadBackendSets()
        this.loadListeners()
    }

    updateBackendSets() {
        this.resource.backend_sets.forEach((bs) => {
            const any_port = this.resource.listeners.filter((l) => l.default_backend_set_name === bs.name).reduce((p, c) => p || c.use_any_port, false)
            this.updateBackends(bs, any_port)
        })
        this.loadBackendSets()
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
        const name = this.createInput('text', 'Name', `${id}_name`, idx, (d, i, n) => {backend_set.name = n[i].value;bs_details.summary.text(backend_set.name);this.loadListeners()}, this.spaceless_name_data)
        this.append(bs_table.table, name.row)
        name.input.property('value', backend_set.name)
        // Policy
        const policy = this.createInput('select', 'Policy', `${id}_policy`, idx, (d, i, n) => backend_set.policy = n[i].value)
        this.append(bs_table.table, policy.row)
        this.loadPolicySelect(policy.input)
        policy.input.property('value', backend_set.policy)

        // Health Checker
        const health_checker_details = this.createDetailsSection('Health Checker', `${id}_health_checker_details`, '', undefined, {}, false)
        this.append(bs_details.div, health_checker_details.details)
        const health_checker_table = this.createTable('Backends', `${id}_health_checker_table`, '')
        this.append(health_checker_details.div, health_checker_table.table)
        // Protocol
        const protocol = this.createInput('select', 'Protocol', `${id}_protocol`, idx, (d, i, n) => backend_set.health_checker.protocol = n[i].value)
        this.append(health_checker_table.table, protocol.row)
        this.loadHealthCheckProtocolSelect(protocol.input)
        protocol.input.property('value', backend_set.health_checker.protocol)
        // Interval In Millis
        const interval_in_millis = this.createInput('number', 'Interval (ms)', `${id}_interval_in_millis`, idx, (d, i, n) => {backend_set.health_checker.interval_in_millis = n[i].value})
        this.append(health_checker_table.table, interval_in_millis.row)
        interval_in_millis.input.property('value', backend_set.health_checker.interval_in_millis)
        // Port
        const port = this.createInput('number', 'Port', `${id}_port`, idx, (d, i, n) => {backend_set.health_checker.port = n[i].value}, this.port_range_data)
        this.append(health_checker_table.table, port.row)
        port.input.property('value', backend_set.health_checker.port)
        // URL Path
        const url_path = this.createInput('number', 'Url Path', `${id}_url_path`, idx, (d, i, n) => {backend_set.health_checker.url_path = n[i].value})
        this.append(health_checker_table.table, url_path.row)
        url_path.input.property('value', backend_set.health_checker.url_path)
        // Request Data
        const request_data = this.createInput('text', 'Request Data', `${id}_request_data`, idx, (d, i, n) => {backend_set.health_checker.request_data = n[i].value})
        this.append(health_checker_table.table, request_data.row)
        request_data.input.property('value', backend_set.health_checker.request_data)
        // Response RegEx
        const response_body_regex = this.createInput('text', 'Response RegEx', `${id}_response_body_regex`, idx, (d, i, n) => {backend_set.health_checker.response_body_regex = n[i].value})
        this.append(health_checker_table.table, response_body_regex.row)
        response_body_regex.input.property('value', backend_set.health_checker.response_body_regex)
        // Response Data
        const response_data = this.createInput('text', 'Response Data', `${id}_response_data`, idx, (d, i, n) => {backend_set.health_checker.response_data = n[i].value})
        this.append(health_checker_table.table, response_data.row)
        response_data.input.property('value', backend_set.health_checker.response_data)
        // Retries
        const retries = this.createInput('number', 'Retries', `${id}_retries`, idx, (d, i, n) => {backend_set.health_checker.retries = n[i].value})
        this.append(health_checker_table.table, retries.row)
        retries.input.property('value', backend_set.health_checker.retries)
        // Return Code
        const return_code = this.createInput('number', 'Return Code', `${id}_return_code`, idx, (d, i, n) => {backend_set.health_checker.return_code = n[i].value})
        this.append(health_checker_table.table, return_code.row)
        return_code.input.property('value', backend_set.health_checker.return_code)
        // Timeout in Millis
        const timeout_in_millis = this.createInput('number', 'Timeout (ms)', `${id}_timeout_in_millis`, idx, (d, i, n) => {backend_set.health_checker.timeout_in_millis = n[i].value})
        this.append(health_checker_table.table, timeout_in_millis.row)
        timeout_in_millis.input.property('value', backend_set.health_checker.timeout_in_millis)

        // Backends
        const backends_details = this.createDetailsSection('Backends', `${id}_backends_details`)
        this.append(bs_details.div, backends_details.details)
        const backends = this.createArrayTable('Backends', `${id}_backends`, '', () => this.addBackend(backend_set, backends.tbody))
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

    updateBackends(backend_set, any_port) {
        backend_set.backends.forEach((b) => b.port = any_port ? 0 : b.port)
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
        const name = this.createInput('text', 'Name', `${id}_name`, idx, (d, i, n) => {backend.name = n[i].value;bs_details.summary.text(backend.name)}, this.spaceless_name_data)
        this.append(bs_table.table, name.row)
        name.input.property('value', backend.name)
        // Target Id
        const target_id = this.createInput('select', 'Instance', `${id}_target_id`, idx, (d, i, n) => {
            backend.target_id = n[i].value;
            ip_address.row.classed('collapsed', backend.target_id !== '');
            if (backend.target_id !== '') {
                backend.ip_address = '';
                ip_address.input.property('value', backend.ip_address)
            }
        })
        this.append(bs_table.table, target_id.row)
        this.loadSelect(target_id.input, 'all_instances', true)
        target_id.input.property('value', backend.target_id)
        // IP Address
        const ip_address = this.createInput('ipv4', 'IP Address', `${id}_ip_address`, idx, (d, i, n) => backend.ip_address = n[i].value)
        this.append(bs_table.table, ip_address.row)
        ip_address.input.property('value', backend.ip_address)
        ip_address.row.classed('collapsed', backend.target_id !== '')
        // Port
        const listener_any_port = this.resource.listeners.filter((l) => l.default_backend_set_name === backend_set.name).reduce((p, c) => p || c.use_any_port, false)
        const port_data = listener_any_port ? {readonly: true} : this.port_range_data
        const port = this.createInput(listener_any_port ? 'text' : 'number', 'Port', `${id}_port`, idx, (d, i, n) => backend.port = n[i].value, port_data)
        this.append(bs_table.table, port.row)
        port.input.property('value', listener_any_port ? 'Any' : backend.port)
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

    updateListeners() {
        if (!this.resource.is_private) {
            this.resource.listeners.forEach((l) => l.protocol = l.protocol === 'ANY' ? 'TCP_AND_UDP' : l.protocol)
        }
        this.loadListeners()
    }
    loadListeners() {
        this.listeners_tbody.selectAll('*').remove()
        this.resource.listeners.forEach((e, i) => this.addListenerHtml(e, i+1))
        this.listeners_idx = this.resource.listeners.length;
    }
    addListenerHtml(listener, idx) {
        const id = `${this.id}_listener`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteListener(id, idx, listener))
        this.append(this.listeners_tbody, delete_row.row)
        const listener_details = this.createDetailsSection(listener.name, `${id}_listener_details`, idx)
        this.append(delete_row.div, listener_details.details)
        const listener_table = this.createTable('', `${id}_listener_table`, '')
        this.append(listener_details.div, listener_table.table)
        // Name
        const name = this.createInput('text', 'Name', `${id}_name`, idx, (d, i, n) => {listener.name = n[i].value;listener_details.summary.text(listener.name)}, this.spaceless_name_data)
        this.append(listener_table.table, name.row)
        name.input.property('value', listener.name)
        // Protocol
        const protocol = this.createInput('select', 'Protocol', `${id}_protocol`, idx, (d, i, n) => {
            listener.protocol = n[i].value;
            listener.port = listener.protocol == 'ANY' ? 0 : listener.port !== 0 ? listener.port : '80'
            listener.use_any_port = listener.protocol !== 'ANY' ? listener.use_any_port : true
            use_any_port.row.classed('collapsed', listener.protocol === 'ANY');
            port.input.property('value', listener.port)
            port.row.classed('collapsed', listener.use_any_port);
            if (listener.use_any_port) {this.updateBackendSets()}
            else {this.loadBackendSets()}
        })
        this.append(listener_table.table, protocol.row)
        this.loadListenerProtocolSelect(protocol.input)
        protocol.input.property('value', listener.protocol)
        // Use Any Port
        const use_any_port = this.createInput('checkbox', 'Use any Port', `${this.id}_use_any_port`, '', (d, i, n) => {
            listener.use_any_port = n[i].checked;
            listener.port = n[i].checked ? 0 : 80;
            port.input.property('value', listener.port)
            port.row.classed('collapsed', n[i].checked);
            if (listener.use_any_port) {this.updateBackendSets()}
            else {this.loadBackendSets()}
        })
        this.append(listener_table.table, use_any_port.row)
        use_any_port.input.property('checked', listener.use_any_port)
        use_any_port.row.classed('collapsed', listener.protocol === 'ANY')
        // Port
        const port = this.createInput('number', 'Port', `${id}_port`, idx, (d, i, n) => {listener.port = n[i].value}, this.port_range_data)
        this.append(listener_table.table, port.row)
        port.input.property('value', listener.port)
        port.row.classed('collapsed', listener.use_any_port || listener.protocol === 'ANY')
        // Default Backend Set
        const default_backend_set_name = this.createInput('select', 'Backend Set', `${id}_default_backend_set_name`, idx, (d, i, n) => listener.default_backend_set_name = n[i].value)
        this.append(listener_table.table, default_backend_set_name.row)
        this.loadDefaultBackendSetSelect(default_backend_set_name.input)
        default_backend_set_name.input.property('value', listener.default_backend_set_name)
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
            ['Two Tuple', 'TWO_TUPLE'],
        ]);
        this.loadSelectFromMap(select, types_map)
    }
    loadHealthCheckProtocolSelect(select) {
        const types_map = new Map([ // Map to Terraform Local Variable Names
            ['HTTP', 'HTTP'],
            ['HTTPS', 'HTTPS'],
            ['TCP', 'TCP'],
            ['UDP', 'UDP'],
        ]);
        this.loadSelectFromMap(select, types_map)
    }
    loadListenerProtocolSelect(select) {
        const types_map = new Map([ // Map to Terraform Local Variable Names
            ['TCP', 'TCP'],
            ['UDP', 'UDP'],
            ['TCP/UDP', 'TCP_AND_UDP'],
            // ['TCP/UDP/ICMP', 'ANY'],
        ]);
        if (this.resource.is_private) types_map.set('TCP/UDP/ICMP', 'ANY')
        this.loadSelectFromMap(select, types_map)
    }
    loadDefaultBackendSetSelect(select) {
        const values_map = new Map(this.resource.backend_sets.map((r) => [r.name, r.resource_name]))
        this.loadSelectFromMap(select, values_map)
    }
}
