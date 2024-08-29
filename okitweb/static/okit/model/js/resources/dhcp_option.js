/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dhcp Option Javascript');

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
        // this.display_name = this.generateDefaultName(okitjson.dhcp_options.length + 1);
        this.compartment_id = '';
        this.vcn_id = '';
        // this.options = []
        this.options = [this.newOption()]
        this.default = false;
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    getVcnDnsLabel() {
        const vcn =  this.getOkitJson().getResource(this.vcn_id)
        return vcn ? vcn.dns_label : ''
    } 
    /*
    ** Create Option
    */
    newOption() {
        return {
            type: "DomainNameServer",
            server_type: "VcnLocalPlusInternet",
            custom_dns_servers: [],
            search_domain_names: []
        }
    }
    /*
    ** Delete Processing
     */
    deleteReferences() {
        // Subnet Reference
        this.getOkitJson().getSubnets().forEach((r) => r.dhcp_options_id = r.dhcp_options_id === this.id ? '' : r.dhcp_options_id)
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
    /*
    ** Artifact Specific Functions
    */
   addDefaultOptions(vcn_name) {
        const search_domain = this.newOption()
        search_domain.type =  "SearchDomain"            
        search_domain.server_type =  ''          
        search_domain.search_domain_names = [`${this.getVcnDnsLabel()}.oraclevcn.com`]
        this.options.push(search_domain)
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

