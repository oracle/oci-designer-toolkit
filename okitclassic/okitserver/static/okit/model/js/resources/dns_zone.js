/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dns Zone Javascript');

/*
** Define Dns Zone Class
*/
class DnsZone extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.zone_type = ''
        this.scope = ''
        this.rrsets = []
        /*
        ** TODO: Add Resource / Artefact specific parameters and default
        */
        // Update with any passed data
        this.merge(data);
        this.convert();
        // TODO: If the Resource is within a Subnet but the subnet_iss is not at the top level then raise it with the following functions if not required delete them.
        // Expose subnet_id at the top level
        // Object.defineProperty(this, 'subnet_id', {get: function() {return this.primary_mount_target.subnet_id;}, set: function(id) {this.primary_mount_target.subnet_id = id;}, enumerable: false });
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'dz';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Dns Zone';
    }

    newRRSet() {
        return {
            rtype: '',
            scope: '',
            view_id: '',
            items: []
        }
    }

    newRecord() {
        return {
            domain: '',
            rdata: '',
            rtype: '',
            ttl: ''
        }
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDnsZone = function(data) {
    this.getDnsZones().push(new DnsZone(data, this));
    return this.getDnsZones()[this.getDnsZones().length - 1];
}
OkitJson.prototype.getDnsZones = function() {
    if (!this.dns_zones) this.dns_zones = []
    return this.dns_zones;
}
OkitJson.prototype.getDnsZone = function(id='') {
    return this.getDnsZones().find(r => r.id === id)
}
OkitJson.prototype.deleteDnsZone = function(id) {
    this.dns_zones = this.dns_zones ? this.dns_zones.filter((r) => r.id !== id) : []
}

