/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Web Application Firewall Javascript');

/*
** Define Web Application Firewall Class
*/
class WebApplicationFirewall extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        /*
        ** TODO: Add Resource / Artefact specific parameters and default
        */
        // Update with any passed data
        this.merge(data);
        this.convert();
        // TODO: If the Resource is within a Subnet but the subnet_iss is not at the top level then raise it with the following functions if not required delete them.
        // Expose subnet_id at the top level
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.primary_mount_target.subnet_id;}, set: function(id) {this.primary_mount_target.subnet_id = id;}, enumerable: false });
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'waf';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Web Application Firewall';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newWebApplicationFirewall = function(data) {
    this.getWebApplicationFirewalls().push(new WebApplicationFirewall(data, this));
    return this.getWebApplicationFirewalls()[this.getWebApplicationFirewalls().length - 1];
}
OkitJson.prototype.getWebApplicationFirewalls = function() {
    if (!this.web_application_firewalls) this.web_application_firewalls = []
    return this.web_application_firewalls;
}
OkitJson.prototype.getWebApplicationFirewall = function(id='') {
    return this.getWebApplicationFirewalls().find(r => r.id === id)
}
OkitJson.prototype.deleteWebApplicationFirewall = function(id) {
    this.web_application_firewalls = this.web_application_firewalls ? this.web_application_firewalls.filter((r) => r.id !== id) : []
}

