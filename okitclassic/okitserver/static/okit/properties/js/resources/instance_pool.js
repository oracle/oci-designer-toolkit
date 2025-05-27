/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Instance Pool Properties Javascript');

/*
** Define Instance Pool Properties Class
*/
class InstancePoolProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Instance Configuration
        const instance_configuration_id = this.createInput('select', 'Instance Configuration', `${this.id}_instance_configuration_id`, '', (d, i, n) => this.resource.instance_configuration_id = n[i].value)
        this.instance_configuration_id = instance_configuration_id.input
        this.append(this.core_tbody, instance_configuration_id.row)
        // Size
        const size_data = {min: 0}
        const size = this.createInput('number', 'Pool Size', `${this.id}_size`, '', (d, i, n) => this.resource.size = n[i].value, size_data)
        this.size = size.input
        this.append(this.core_tbody, size.row)
        // Placement
        const placement_details = this.createDetailsSection('Placement', `${this.id}_placement_details`)
        this.append(this.properties_contents, placement_details.details)
        this.placement_div = placement_details.div
        const placement_table = this.createArrayTable('Availability Domains', `${this.id}_placement`, '', () => this.addPlacement())
        this.placement_tbody = placement_table.tbody
        this.append(placement_details.div, placement_table.table)
        // Loadbalancer
        const loadbalancer_details = this.createDetailsSection('Loadbalancer', `${this.id}_loadbalancer_details`)
        this.append(this.properties_contents, loadbalancer_details.details)
        this.loadbalancer_div = loadbalancer_details.div
        const loadbalancer_table = this.createArrayTable('Loadbalancers', `${this.id}_loadbalancer`, '', () => this.addLoadbalancer())
        this.loadbalancer_tbody = loadbalancer_table.tbody
        this.append(loadbalancer_details.div, loadbalancer_table.table)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadSelect(this.instance_configuration_id, 'instance_configuration', false)
        // Assign Values
        this.instance_configuration_id.property('value', this.resource.instance_configuration_id)
        this.size.property('value', this.resource.size)
        // Placements
        this.loadPlacements()
        // Load Balancers
        this.loadLoadbalancers()
    }
    // Placement
    loadPlacements() {
        this.placement_tbody.selectAll('*').remove()
        this.resource.placement_configurations.forEach((e, i) => this.addPlacementHtml(e, i+1))
        this.placement_idx = this.resource.placement_configurations.length;
    }
    addPlacementHtml(placement, idx) {
        const id = `${this.id}_placement`
        const delete_row = this.createDeleteRow(id, idx, () => this.deletePlacement(id, idx, placement))
        this.append(this.placement_tbody, delete_row.row)
        const placement_detail = this.createDetailsSection('Placement', `${id}_placement_details`, idx)
        this.append(delete_row.div, placement_detail.details)
        const placement_table = this.createTable('', `${id}_placement`, '')
        this.append(placement_detail.div, placement_table.table)
        // Availability Domain
        const availability_domain_data = this.ad_data
        const availability_domain = this.createInput('select', 'Availability Domain', `${this.id}_availability_domain`, '', (d, i, n) => placement.availability_domain = n[i].value, availability_domain_data)
        this.append(placement_table.tbody, availability_domain.row)
        availability_domain.input.property('value', placement.availability_domain.slice(-1))
        // Fault Domains
        const fd_data = this.fd_data
        delete fd_data.options['']
        const fault_domains = this.createInput('multiselect', 'Fault Domains', `${this.id}_fault_domains`, '', (d, i, n) => placement.fault_domains = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value), fd_data)
        this.append(placement_table.tbody, fault_domains.row)
        this.setMultiSelect(fault_domains.input, placement.fault_domains)
        // Subnet
        const primary_subnet_id = this.createInput('select', 'Subnet', `${id}_primary_subnet_id`, idx, (d, i, n) => placement.primary_subnet_id = n[i].value)
        this.append(placement_table.tbody, primary_subnet_id.row)
        this.loadSelect(primary_subnet_id.input, 'subnet', true)
        primary_subnet_id.input.property('value', placement.primary_subnet_id)
    }
    addPlacement() {
        const placement = this.resource.newPlacementConfiguration();
        this.resource.placement_configurations.push(placement);
        this.placement_idx += 1
        this.addPlacementHtml(placement, this.placement_idx);
    }
    deletePlacement(id, idx, placement) {
        this.resource.placement_configurations = this.resource.placement_configurations.filter((e) => e !== placement)
        $(`#${id}${idx}_row`).remove()
    }
    // Load Balancers
    loadLoadbalancers() {
        this.loadbalancer_tbody.selectAll('*').remove()
        this.resource.load_balancers.forEach((e, i) => this.addLoadbalancerHtml(e, i+1))
        this.loadbalancer_idx = this.resource.load_balancers.length;
    }
    addLoadbalancerHtml(loadbalancer, idx) {
        const id = `${this.id}_loadbalancer`
        let backend_set_name = undefined
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteLoadbalancer(id, idx, loadbalancer))
        this.append(this.loadbalancer_tbody, delete_row.row)
        const loadbalancer_detail = this.createDetailsSection('Loadbalancer', `${id}_loadbalancer_details`, idx)
        this.append(delete_row.div, loadbalancer_detail.details)
        const loadbalancer_table = this.createTable('', `${id}_loadbalancer`, '')
        this.append(loadbalancer_detail.div, loadbalancer_table.table)
        // Load Balancer
        const load_balancer_id = this.createInput('select', 'Load Balancer', `${id}_load_balancer_id`, idx, (d, i, n) => {loadbalancer.load_balancer_id = n[i].value; this.handleLoadbalancerChange(loadbalancer, backend_set_name)})
        this.append(loadbalancer_table.tbody, load_balancer_id.row)
        this.loadSelect(load_balancer_id.input, 'load_balancer', true)
        load_balancer_id.input.property('value', loadbalancer.load_balancer_id)
        // Backend Set
        backend_set_name = this.createInput('select', 'Backend Set', `${id}_backend_set_name`, idx, (d, i, n) => {loadbalancer.backend_set_name = n[i].value})
        this.append(loadbalancer_table.tbody, backend_set_name.row)
        this.loadBackendSets(loadbalancer, backend_set_name)
        backend_set_name.input.property('value', loadbalancer.backend_set_name)
        // Storage Percentage
        const port_data = {min: 0}
        const port = this.createInput('number', 'Port', `${this.id}_port`, '', (d, i, n) => {loadbalancer.port = n[i].value}, port_data)
        this.append(loadbalancer_table.tbody, port.row)
        port.input.property('value', loadbalancer.port)
    }
    addLoadbalancer() {
        const loadbalancer = this.resource.newLoadBalancer();
        this.resource.load_balancers.push(loadbalancer);
        this.loadbalancer_idx += 1
        this.addLoadbalancerHtml(loadbalancer, this.loadbalancer_idx);
    }
    deleteLoadbalancer(id, idx, loadbalancer) {
        this.resource.load_balancers = this.resource.load_balancers.filter((e) => e !== loadbalancer)
        $(`#${id}${idx}_row`).remove()
    }

    handleLoadbalancerChange(loadbalancer, backend_set_name) {
        console.info('Load Balancer Id Changed', loadbalancer, backend_set_name)
        this.loadBackendSets(loadbalancer, backend_set_name)
        backend_set_name.input.property('value', loadbalancer.backend_set_name)
    }

    loadBackendSets(loadbalancer, backend_set_name) {
        const select = backend_set_name.input
        console.info('Load Backend Set', loadbalancer, backend_set_name)
        select.selectAll('*').remove()
        const lb = this.resource.getOkitJson().getLoadBalancer(loadbalancer.load_balancer_id)
        if (lb) {
            lb.backend_sets.forEach(bs => select.append('option').attr('value', bs.name).text(bs.name))
            const options = Array.from(select.node().options).map((opt) => opt.value)            
            if ((!loadbalancer.backend_set_name || loadbalancer.backend_set_name === '') && options.length > 0) loadbalancer.backend_set_name = options[0]
        }
    }
}
