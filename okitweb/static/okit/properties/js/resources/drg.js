/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Drg Properties Javascript');

/*
** Define Drg Properties Class
*/
class DrgProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Route Distributions', 'Route Tables']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Route Distributions
        const route_distributions_details = this.createDetailsSection('Route Distributions', `${this.id}_route_distributions_details`)
        this.append(this.route_distributions_contents, route_distributions_details.details)
        this.route_distributions_div = route_distributions_details.div
        const route_distributions_table = this.createArrayTable('Route Distributions', `${this.id}_route_distributions_table`, '', () => this.addRouteDistribution())
        this.route_distributions_tbody = route_distributions_table.tbody
        this.append(route_distributions_details.div, route_distributions_table.table)
        // Route Tables
        const route_tables_details = this.createDetailsSection('Route Tables', `${this.id}_route_tables_details`)
        this.append(this.route_tables_contents, route_tables_details.details)
        this.route_tables_div = route_tables_details.div
        const route_tables_table = this.createArrayTable('Route Tables', `${this.id}_route_tables_table`, '', () => this.addRouteDistribution())
        this.route_tables_tbody = route_tables_table.tbody
        this.append(route_tables_details.div, route_tables_table.table)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
    }

    loadRouteDistributions() {
        this.route_distributions_tbody.selectAll('*').remove()
        this.resource.route_distributions.forEach((e, i) => this.addRouteDistributionHtml(e, i+1))
        this.route_distribution_idx = this.resource.route_distributions.length;
    }
    addRouteDistributionHtml(route_distribution, idx) {
        const id = `${this.id}_route_distribution`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteRouteDistribution(id, idx, route_distribution))
        this.append(this.route_distributions_tbody, delete_row.row)
        const route_distribution_details = this.createDetailsSection('Distribution', `${id}_distribution_details`, idx)
        this.append(delete_row.div, route_distribution_details.details)
        const route_distribution_table = this.createTable('', `${id}_distribution_table`, '')
        this.append(route_distribution_details.div, route_distribution_table.table)
    }
    addRouteDistribution() {
        const route_distribution = this.resource.newRouteDistribution
        this.resource.route_distributions.push(route_distribution)
        this.route_distribution_idx += 1
        this.addRouteDistributionHtml(route_distribution, this.route_distribution_idx)
    }
    deleteRouteDistribution(id, idx, route_distribution) {
        this.resource.route_distributions = this.resource.route_distributions.filter((e) => e !== route_distribution)
        $(`#${id}${idx}_row`).remove()
    }

}
