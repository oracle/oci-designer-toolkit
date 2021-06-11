/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Dhcp Option Javascript');

/*
** Define Dhcp Option Class
*/
class DhcpOption extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.dhcp_options.length + 1);
        this.compartment_id = '';
        this.vcn_id = '';
        this.options = [{
            type: "DomainNameServer",
            server_type: "CustomDnsServer",
            custom_dns_servers: [],
            search_domain_names: []
        }]
        this.default = false;
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Clone Functionality
    */
    clone() {
        return new DhcpOption(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Subnet references
        for (let subnet of this.getOkitJson().subnets) {
            if (subnet.dhcp_options_id === this.id) {
                subnet.dhcp_options_id = '';
            }
        }
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'do';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Dhcp Option';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDhcpOption = function(data) {
    this.getDhcpOptions().push(new DhcpOption(data, this));
    return this.getDhcpOptions()[this.getDhcpOptions().length - 1];
}
OkitJson.prototype.getDhcpOptions = function() {
    if (!this.dhcp_options) {
        this.dhcp_options = [];
    }
    return this.dhcp_options;
}
OkitJson.prototype.getDhcpOption = function(id='') {
    for (let artefact of this.getDhcpOptions()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteDhcpOption = function(id) {
    for (let i = 0; i < this.dhcp_options.length; i++) {
        if (this.dhcp_options[i].id === id) {
            this.dhcp_options[i].delete();
            this.dhcp_options.splice(i, 1);
            break;
        }
    }
}

