/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Drg Javascript');

/*
** Define Drg Class
*/
class Drg extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.drgs.length + 1);
        this.compartment_id = data.parent_id;
        // Route Tables
        this.route_tables = []
        this.route_distributions = []
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    convert() {
        super.convert()
        this.route_tables.forEach((rt, idx) => {
            rt.resource_name = rt.resource_name ? rt.resource_name : `${this.resource_name}RouteTable${idx}`
            rt.rules.forEach((rr, i) => rr.resource_name = rr.resource_name ? rr.resource_name : `${rt.resource_name}Rule${i}`)
        })
        this.route_distributions.forEach((rd, idx) => {
            rd.resource_name = rd.resource_name ? rd.resource_name : `${this.resource_name}RouteDistribution${idx}`
            rd.statements.forEach((rs, i) => {
                rs.resource_name = rs.resource_name ? rs.resource_name : `${rd.resource_name}Statement${i}`
                if (Array.isArray (rs.match_criteria))  rs.match_criteria = rs.match_criteria.length > 0 ? rs.match_criteria[0] : {}
            })
        })
    }
    /*
    ** Create Route Table
    */
    newRouteTable() {
        return {
            resource_name: `${this.generateResourceName()}RouteTable`,
            id: `${this.id}.rt${this.route_tables.length + 1}`,
            display_name: `${this.display_name} route table ${this.route_tables.length + 1}`,
            import_drg_route_distribution_id: '',
            is_ecmp_enabled: false,
            rules: []
        }
    }
    newRouteRule() {
        return {
            resource_name: `${this.generateResourceName()}RouteRule`,
            destination: '',
            destination_type: 'CIDR_BLOCK',
            next_hop_drg_attachment_id: ''
        }
    }
    /*
    ** Create Distributions
    */
    newRouteDistribution() {
        return {
            resource_name: `${this.generateResourceName()}RouteDistribution`,
            id: `${this.id}.rd${this.route_tables.length + 1}`,
            distribution_type: 'IMPORT',
            display_name: `${this.display_name} route distribution ${this.route_tables.length + 1}`,
            statements: []
        }
    }
    newDistributionStatement() {
        return {
            resource_name: `${this.generateResourceName()}DistributionStatement`,
            action: 'ACCEPT',
            match_criteria: this.newMatchCriteria(),
            priority: 1
        }
    }
    newMatchCriteria() {
        return {
            match_type: 'DRG_ATTACHMENT_ID',
            attachment_type: 'VCN',
            drg_attachment_id: ''
        }
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'drg';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Drg';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDrg = function(data) {
    this.getDrgs().push(new Drg(data, this));
    return this.getDrgs()[this.getDrgs().length - 1];
}
OkitJson.prototype.getDrgs = function() {
    if (!this.drgs) {
        this.drgs = [];
    }
    return this.drgs;
}
OkitJson.prototype.getDrg = function(id='') {
    for (let artefact of this.getDrgs()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteDrg = function(id) {
    this.drgs = this.drgs ? this.drgs.filter((r) => r.id !== id) : []
}

