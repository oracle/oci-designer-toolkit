/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Instance Javascript');

/*
** Define Instance Class
 */
class Instance extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // # Required
        // this.display_name = this.generateDefaultName(okitjson.instances.length + 1);
        this.availability_domain = '1';
        this.compartment_id = '';
        this.shape = 'VM.Standard.E3.Flex';
        // # Optional
        this.count = 1;
        this.fault_domain = '';
        this.agent_config = {
            is_monitoring_disabled: false, 
            is_management_disabled: false
        };
        this.vnics = [];
        this.source_details = {
            os: 'Oracle Linux', 
            version: '8', 
            boot_volume_size_in_gbs: '50', 
            source_type: 'image', 
            image_source: 'platform'
        };
        this.metadata = {
            ssh_authorized_keys: '', 
            user_data: ''
        };
        this.shape_config = {
            memory_in_gbs: 16, 
            ocpus: 1
        };
        // TODO: Future
        //this.launch_options_specified = false;
        //this.launch_options = {boot_volume_type: '', firmware: '', is_consistent_volume_naming_enabled: false, is_pv_encryption_in_transit_enabled: false, network_type: '', remote_data_volume_type: ''};
        this.block_storage_volume_ids = [];
        this.volume_attachments = []
        this.preserve_boot_volume = false;
        this.is_pv_encryption_in_transit_enabled = false;
        // Update with any passed data
        this.merge(data);
        this.convert();
        if (this.vnics.length === 0) this.vnics.push(this.newVnic())
        // Expose subnet_id for the first Mount target at the top level
        delete this.subnet_id;
        Object.defineProperty(this, 'primary_vnic', {get: function() {return this.vnics[0];}, set: function(vnic) {this.vnics[0] = vnic;}, enumerable: true });
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.primary_vnic.subnet_id;}, set: function(id) {this.primary_vnic.subnet_id = id;}, enumerable: true });
        Object.defineProperty(this, 'instance_type', {get: function() {return this.shape.toLowerCase().substr(0,2);}, set: function(type) {}, enumerable: true });
        Object.defineProperty(this, 'chipset', {get: function() {return this.shape.startsWith('VM.') && this.shape.includes('.E') ? 'amd' : this.shape.startsWith('VM.') && this.shape.includes('.A') ? 'arm' : 'intel'}, set: function(chipset) {}, enumerable: true });
        Object.defineProperty(this, 'shape_series', {get: function() {return this.shape.startsWith('VM.') && this.shape.includes('.E') ? 'amd' : this.shape.startsWith('VM.') && this.shape.includes('.A') ? 'arm' : 'intel'}, set: function(chipset) {}, enumerable: true });
        Object.defineProperty(this, 'flex_shape', {get: function() {return this.shape.endsWith('.Flex')}, set: function(flex_shape) {}, enumerable: true });
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert();
        // Move Metadata elements
        if (this.metadata === undefined) {this.metadata = {};}
        if (this.cloud_init_yaml !== undefined) {this.metadata.user_data = String(this.cloud_init_yaml); delete this.cloud_init_yaml;}
        if (this.authorized_keys !== undefined) {this.metadata.ssh_authorized_keys = this.authorized_keys; delete this.authorized_keys;}
        if (this.metadata.authorized_keys !== undefined) {this.metadata.ssh_authorized_keys = this.metadata.authorized_keys; delete this.metadata.authorized_keys;}
        // Move Source Details elements
        if (this.source_details === undefined) {this.source_details = {};}
        if (this.os !== undefined) {this.source_details.os = this.os; delete this.os;}
        if (this.version !== undefined) {this.source_details.version = this.version; delete this.version;}
        if (this.boot_volume_size_in_gbs !== undefined) {this.source_details.boot_volume_size_in_gbs = this.boot_volume_size_in_gbs; delete this.boot_volume_size_in_gbs;}
        // Move Subnet_ids
        if (this.vnics === undefined) {this.vnics = [];}
        if (this.subnet_ids !== undefined) {if (this.subnet_ids.length > 0) {for (let subnet_id of this.subnet_ids) {this.vnics.push({subnet_id: subnet_id})}} delete this.subnet_ids;}
        if (this.subnet_id !== undefined) {if (this.vnics.length === 0) {this.vnics.push({subnet_id: ''})} this.vnics[0].subnet_id = this.subnet_id; delete this.subnet_id;}
        if (this.hostname_label !== undefined) {this.vnics[0].hostname_label = this.hostname_label; delete this.hostname_label;}
        for (let vnic of this.vnics) {
            if (!vnic.hasOwnProperty('assign_public_ip')) {vnic.assign_public_ip = true;}
            if (!vnic.hasOwnProperty('skip_source_dest_check')) {vnic.skip_source_dest_check = false;}
            if (!vnic.hasOwnProperty('nsg_ids')) {vnic.nsg_ids = [];}
            if (vnic.availability_domain) {vnic.availability_domain = this.getAvailabilityDomainNumber(vnic.availability_domain)}
        }
    }
    /*
    ** Create Secondary Network (VNIC)
    */
    newVnic() {
        return {
            subnet_id: '', 
            assign_public_ip: true, 
            nsg_ids: [], 
            skip_source_dest_check: false, 
            hostname_label: this.display_name.toLowerCase().substring(0, 64)
        }
    }
    /*
    ** Create Volume Attachment
    */
   newVolumeAttachment() {
       return {
           volume_id: '',
           attachment_type: 'paravirualized'
       }
   }

    /*
    ** Delete Processing
     */
    deleteReferences() {
        // Instance Volume Attachment
        this.getOkitJson().getLoadBalancers().forEach((r) => r.vnics = r.instance_ids.filter((id) => id != this.id))
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'in';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Instance';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newInstance = function(data) {
    console.info('New Instance');
    this.getInstances().push(new Instance(data, this));
    return this.getInstances()[this.getInstances().length - 1];
}
OkitJson.prototype.getInstances = function() {
    if (!this.instances) this.instances = [];
    return this.instances;
}
OkitJson.prototype.getInstance = function(id='') {
    for (let artefact of this.getInstances()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteInstance = function(id) {
    this.instances = this.instances ? this.instances.filter((r) => r.id !== id) : []
}
OkitJson.prototype.getInstanceByBlockVolumeId = function(id) {
    return this.getInstances().filter(i => i.block_storage_volume_ids.includes(id));
}
OkitJson.prototype.filterInstances = function(filter) {this.instances = this.instances ? this.instances.filter(filter) : []}
