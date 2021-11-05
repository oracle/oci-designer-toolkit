/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Drg Javascript');

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
        this.display_name = this.generateDefaultName(okitjson.drgs.length + 1);
        this.compartment_id = data.parent_id;
        // Route Tables
        this.route_tables = []
        this.route_distributions = []
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Create Route Table
    */
    newRouteTable() {
        return {
            display_name: `${this.display_name} route table ${this.route_tables.length + 1}`,
            import_drg_route_distribution_id: '',
            is_ecmp_enabled: false,
            rules: []
        }
    }
    newRouteRule() {
        return {
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
            distribution_type: 'IMPORT',
            display_name: `${this.display_name} route distribution ${this.route_tables.length + 1}`,
            statements: []
        }
    }
    newDistributionStatement() {
        return {
            action: 'ACCEPT',
            match_criteria: {
                match_type: 'DRG_ATTACHMENT_ID',
                attachment_type: 'VCN',
                drg_attachment_id: ''
            },
            priority: 1
        }
    }
    /*
    ** Clone Functionality
    */
    clone() {
        return new Drg(JSON.clone(this), this.getOkitJson());
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

