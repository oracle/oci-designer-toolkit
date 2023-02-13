/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OkeCluster Properties Javascript');

/*
** Define OkeCluster Properties Class
*/
class OkeClusterProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // VCN
        const vcn_id = this.createInput('select', 'Virtual Cloud Network', `${this.id}_vcn_id`, '', (d, i, n) => this.resource.vcn_id = n[i].value)
        this.vcn_id = vcn_id.input
        this.append(this.core_tbody, vcn_id.row)
        // Kubernetes Version
        const kubernetes_version = this.createInput('select', 'Kubernetes Version', `${this.id}_kubernetes_version`, '', (d, i, n) => this.resource.kubernetes_version = n[i].value)
        this.kubernetes_version = kubernetes_version.input
        this.append(this.core_tbody, kubernetes_version.row)

        // Kubernetes Options
        const options_details = this.createDetailsSection('Kubernetes Options', `${this.id}_options_details`)
        this.append(this.properties_contents, options_details.details)
        this.options_div = options_details.div
        const options_table = this.createTable('', `${this.id}_options_table`)
        this.options_tbody = options_table.tbody
        this.append(this.options_div, options_table.table)
        // Kubernetes Dashboard Enabled
        const is_kubernetes_dashboard_enabled = this.createInput('checkbox', 'Kubernetes Dashboard', `${this.id}_is_kubernetes_dashboard_enabled`, '', (d, i, n) => {this.resource.options.add_ons.is_kubernetes_dashboard_enabled = n[i].checked})
        this.is_kubernetes_dashboard_enabled = is_kubernetes_dashboard_enabled.input
        this.append(this.options_tbody, is_kubernetes_dashboard_enabled.row)
        // Tiller Enabled
        const is_tiller_enabled = this.createInput('checkbox', 'Tiller', `${this.id}_is_tiller_enabled`, '', (d, i, n) => {this.resource.options.add_ons.is_tiller_enabled = n[i].checked})
        this.is_tiller_enabled = is_tiller_enabled.input
        this.append(this.options_tbody, is_tiller_enabled.row)
        // Pod Security
        const is_pod_security_policy_enabled = this.createInput('checkbox', 'Pod Security', `${this.id}_is_pod_security_policy_enabled`, '', (d, i, n) => {this.resource.options.add_ons.is_pod_security_policy_enabled = n[i].checked})
        this.is_pod_security_policy_enabled = is_pod_security_policy_enabled.input
        this.append(this.options_tbody, is_pod_security_policy_enabled.row)

        // Kubernetes Networking
        const network_details = this.createDetailsSection('Kubernetes Networking', `${this.id}_network_details`)
        this.append(this.properties_contents, network_details.details)
        this.network_div = network_details.div
        const network_table = this.createTable('', `${this.id}_network_table`)
        this.network_tbody = network_table.tbody
        this.append(this.network_div, network_table.table)
        // Service CIDR Block
        const services_cidr = this.createInput('ipv4_cidr', 'Service CIDR', `${this.id}_services_cidr`, '', (d, i, n) => {n[i].reportValidity(); this.resource.options.kubernetes_network_config.services_cidr = n[i].value; this.redraw()})
        this.services_cidr = services_cidr.input
        this.append(this.network_tbody, services_cidr.row)
        // Pods CIDR Block
        const pods_cidr = this.createInput('ipv4_cidr', 'Pods CIDR', `${this.id}_pods_cidr`, '', (d, i, n) => {n[i].reportValidity(); this.resource.options.kubernetes_network_config.pods_cidr = n[i].value; this.redraw()})
        this.pods_cidr = pods_cidr.input
        this.append(this.network_tbody, pods_cidr.row)
        // Service Loadbalancer Subnets
        const service_lb_subnet_ids = this.createInput('select', 'Service Loadbalancer Regional Subnet', `${this.id}_service_lb_subnet_ids`, '', (d, i, n) => this.resource.options.service_lb_subnet_ids = [n[i].value])
        this.service_lb_subnet_ids = service_lb_subnet_ids.input
        this.append(this.network_tbody, service_lb_subnet_ids.row)

        // Kubernetes Endpoint
        const endpoint_details = this.createDetailsSection('Kubernetes Endpoint', `${this.id}_endpoint_details`)
        this.append(this.properties_contents, endpoint_details.details)
        this.endpoint_div = endpoint_details.div
        const endpoint_table = this.createTable('', `${this.id}_endpoint_table`)
        this.endpoint_tbody = endpoint_table.tbody
        this.append(this.endpoint_div, endpoint_table.table)
        // Subnet
        const subnet_id = this.createInput('select', 'Subnet', `${this.id}_subnet_id`, '', (d, i, n) => this.resource.endpoint_config.subnet_id = n[i].value)
        this.append(this.endpoint_tbody, subnet_id.row)
        this.subnet_id = subnet_id.input
        // Public IP
        const is_public_ip_enabled = this.createInput('checkbox', 'Public IP', `${this.id}_is_public_ip_enabled`, '', (d, i, n) => {this.resource.endpoint_config.is_public_ip_enabled = n[i].checked})
        this.is_public_ip_enabled = is_public_ip_enabled.input
        this.append(this.endpoint_tbody, is_public_ip_enabled.row)
        // NSG Lists
        const nsg_ids = this.createInput('multiselect', 'Network Security Groups', `${this.id}_nsg_ids`, '', (d, i, n) => this.resource.endpoint_config.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.nsg_ids = nsg_ids.input
        this.append(this.endpoint_tbody, nsg_ids.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Reference Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', true)
        this.loadSelect(this.subnet_id, 'subnet', true, this.vcn_filter)
        this.loadSelect(this.service_lb_subnet_ids, 'subnet', true, this.vcn_filter)
        this.loadReferenceSelect(this.kubernetes_version, 'getKubernetesVersions')
        this.loadMultiSelect(this.nsg_ids, 'network_security_group', false, this.vcn_filter)
        // Assign Values
        this.vcn_id.property('value', this.resource.vcn_id)
        this.kubernetes_version.property('value', this.resource.kubernetes_version)
        // Options
        this.is_kubernetes_dashboard_enabled.property('checked', this.resource.options.add_ons.is_kubernetes_dashboard_enabled)
        this.is_tiller_enabled.property('checked', this.resource.options.add_ons.is_tiller_enabled)
        this.is_pod_security_policy_enabled.property('checked', this.resource.options.add_ons.is_pod_security_policy_enabled)
        // Networking
        this.services_cidr.property('value', this.resource.options.kubernetes_network_config.services_cidr)
        this.pods_cidr.property('value', this.resource.options.kubernetes_network_config.pods_cidr)
        this.service_lb_subnet_ids.property('value', this.resource.options.service_lb_subnet_ids[0])
        // Endpoint
        this.subnet_id.property('value', this.resource.endpoint_config.subnet_id)
        this.is_public_ip_enabled.property('checked', this.resource.endpoint_config.is_public_ip_enabled)
        this.setMultiSelect(this.nsg_ids, this.resource.endpoint_config.nsg_ids)
    }
}
