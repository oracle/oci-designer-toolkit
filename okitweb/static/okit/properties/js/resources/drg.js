/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
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


}
