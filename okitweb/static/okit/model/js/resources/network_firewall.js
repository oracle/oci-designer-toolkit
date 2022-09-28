/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Network Firewall Javascript');

/*
** Define Network Firewall Class
*/
class NetworkFirewall extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.availability_domain = '1';
        this.network_firewall_policy_id = ''
        this.network_firewall_policy = this.newNetworkFirewallPolicy()
        this.subnet_id = ''
        this.ipv4address = ''
        this.ipv6address = ''
        this.network_security_group_ids = []
        this.pricing_estimates = {
            estimated_gb_data_processed: 0
        }
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    newNetworkFirewallPolicy() {
        return {
            resource_name: `${this.generateResourceName()}Policy`,
            display_name: `${this.display_name} Policy`,
            ip_address_lists: {},
            url_lists: {},
            security_rules: [],
            decryption_rules: []
        }
    }
    newSecurityRule() {
        return {}
    }
    newDecryptionRule() {
        return {}
    }

    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'nf';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Network Firewall';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newNetworkFirewall = function(data) {
    this.getNetworkFirewalls().push(new NetworkFirewall(data, this));
    return this.getNetworkFirewalls()[this.getNetworkFirewalls().length - 1];
}
OkitJson.prototype.getNetworkFirewalls = function() {
    if (!this.network_firewalls) this.network_firewalls = []
    return this.network_firewalls;
}
OkitJson.prototype.getNetworkFirewall = function(id='') {
    return this.getNetworkFirewalls().find(r => r.id === id)
}
OkitJson.prototype.deleteNetworkFirewall = function(id) {
    this.network_firewalls = this.network_firewalls ? this.network_firewalls.filter((r) => r.id !== id) : []
}

