/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Instance Javascript');

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
        // this.shape = okitjson && okitjson.metadata.platform !== 'pca' ? 'VM.Standard.E3.Flex' : '';
        this.shape = this.isOCI() ? 'VM.Standard.E3.Flex' : '';
        // # Optional
        this.count = 1;
        this.fault_domain = '';
        this.agent_config = {
            is_monitoring_disabled: false, 
            is_management_disabled: false
        };
        // if (this.isPCA()) {
        //     this.availability_config = {
        //         is_live_migration_preferred: true
        //     }
        // }
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
            memory_in_gbs: this.isOCI() ? 16 : '', 
            ocpus: this.isOCI() ? 1 : ''
            // memory_in_gbs: okitjson && okitjson.metadata.platform !== 'pca' ? 16 : '', 
            // ocpus: okitjson && okitjson.metadata.platform !== 'pca' ? 1 : ''
        };
        // TODO: Future
        //this.launch_options_specified = false;
        //this.launch_options = {boot_volume_type: '', firmware: '', is_consistent_volume_naming_enabled: false, is_pv_encryption_in_transit_enabled: false, network_type: '', remote_data_volume_type: ''};
        this.volume_attachments = []
        this.vnic_attachments = []
        this.preserve_boot_volume = false;
        this.is_pv_encryption_in_transit_enabled = false;
        this.lifecycle_state = ""
        // Terraform Provisioner
        // this.terraform_provisioners = {connection: this.newTFConnection(),provisioners: []}
        // Update with any passed data
        this.merge(data);
        this.convert();
        if (this.vnic_attachments.length === 0) this.vnic_attachments.push(this.newVnicAttachment())
        // Expose subnet_id for the first Mount target at the top level
        delete this.subnet_id;
        Object.defineProperty(this, 'primary_vnic', {get: function() {return this.vnic_attachments[0];}, set: function(vnic) {this.vnic_attachments[0] = vnic;}, enumerable: true });
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.primary_vnic.subnet_id;}, set: function(id) {this.primary_vnic.subnet_id = id;}, enumerable: true });
        Object.defineProperty(this, 'public_ip', {get: function() {return this.primary_vnic.public_ip;}, set: function(id) {}, enumerable: true });
        Object.defineProperty(this, 'instance_type', {get: function() {return !this.shape ? 'vm' : this.shape.toLowerCase().substr(0,2);}, set: function(type) {}, enumerable: true });
        Object.defineProperty(this, 'chipset', {get: function() {return !this.shape ? 'intel' : this.shape.startsWith('VM.') && this.shape.includes('.E') ? 'amd' : this.shape.startsWith('VM.') && this.shape.includes('.A') ? 'arm' : 'intel'}, set: function(chipset) {}, enumerable: true });
        Object.defineProperty(this, 'shape_series', {get: function() {return !this.shape ? 'intel' : this.shape.startsWith('VM.') && this.shape.includes('.E') ? 'amd' : this.shape.startsWith('VM.') && this.shape.includes('.A') ? 'arm' : 'intel'}, set: function(chipset) {}, enumerable: true });
        Object.defineProperty(this, 'flex_shape', {get: function() {return !this.shape ? false : this.shape.endsWith('.Flex')}, set: function(flex_shape) {}, enumerable: true });
        Object.defineProperty(this, 'block_storage_volume_ids', {get: () => {return this.volume_attachments.map((va) => va.volume_id)}})
        Object.defineProperty(this, 'vnics', {get: () => {return this.vnic_attachments}})
        Object.defineProperty(this, 'memory_in_gbs', {get: () => {return this.flex_shape ? this.shape_config.memory_in_gbs : okitOciData.getInstanceShape(this.shape) ? okitOciData.getInstanceShape(this.shape).memory_in_gbs : 0}})
        Object.defineProperty(this, 'ocpus', {get: () => {return this.flex_shape ? this.shape_config.ocpus : okitOciData.getInstanceShape(this.shape) ? okitOciData.getInstanceShape(this.shape).ocpus : 0}})
        Object.defineProperty(this, 'assign_public_ip', {get: () => {return this.primary_vnic.assign_public_ip}})
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
        // Networking
        if (this.vnics) {this.vnic_attachments = this.vnics; delete this.vnics}
        if (this.hostname_label !== undefined) {this.vnic_attachments[0].hostname_label = this.hostname_label; delete this.hostname_label;}
        this.vnic_attachments.forEach((vnic, i) => {
            if (!vnic.hasOwnProperty('resource_name')) vnic.resource_name = `${this.resource_name}VnicAttachment${i+1}`
            if (!vnic.hasOwnProperty('display_name')) vnic.display_name = `${this.display_name} Vnic`
            if (!vnic.hasOwnProperty('assign_public_ip')) {vnic.assign_public_ip = true;}
            if (!vnic.hasOwnProperty('skip_source_dest_check')) {vnic.skip_source_dest_check = false;}
            if (!vnic.hasOwnProperty('nsg_ids')) {vnic.nsg_ids = [];}
            if (vnic.hasOwnProperty('instance_id')) delete vnic.instance_id
            if (vnic.availability_domain) {vnic.availability_domain = this.getAvailabilityDomainNumber(vnic.availability_domain)}
        })
        // Storage
        if (this.block_storage_volume_ids) {this.volume_attachments = this.block_storage_volume_ids.map(v => {return {volume_id: v}}); delete this.block_storage_volume_ids}
        if (this.block_storage_volume) {this.volume_attachments = this.block_storage_volume; delete this.block_storage_volume}
        this.volume_attachments.forEach((bsv, i) => {
            if (!bsv.hasOwnProperty('resource_name')) bsv.resource_name = `${this.resource_name}VolumeAttachment${i+1}`
            if (!bsv.hasOwnProperty('display_name')) bsv.display_name = `${this.display_name} Vnic`
            if (!bsv.hasOwnProperty('attachment_type')) bsv.attachment_type = 'paravirtualized'
            if (!bsv.hasOwnProperty('is_read_only')) bsv.is_read_only = false
            if (!bsv.hasOwnProperty('is_shareable')) bsv.is_shareable = false
        })
    }
    get subnet_ids() {return this.vnic_attachments.map((v) => v.subnet_id)}
    get nsg_ids() {const nsg_ids = this.vnic_attachments.reduce((n, v) => [...n, ...v.nsg_ids], []); console.info('NSG Ids:', nsg_ids); return nsg_ids}
    /*
    ** Create Secondary Network (VNIC)
    */
    newVnicAttachment() {
        return {
            resource_name: `${this.generateResourceName()}VnicAttachment`,
            display_name: `${this.display_name} Vnic`,
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
            resource_name: `${this.generateResourceName()}VolumeAttachment`,
            display_name: `${this.display_name} Volume Attachment`,
            volume_id: '',
            attachment_type: 'paravirtualized',
            is_read_only: false,
            is_shareable: false
        }
    }
    /*
    ** Terraform Provisioner
    */
    newTFConnection() {
        return {}
    }
    newTFProvisioner() {
        return {}
    }

    /*
    ** Delete Processing
     */
    deleteReferences() {
        // Instance Volume Attachment
        // this.getOkitJson().getLoadBalancers().forEach((r) => r.instance_ids = r.instance_ids.filter((id) => id != this.id))
        this.getOkitJson().getLoadBalancers().forEach((lb) => {
            lb.backend_sets.forEach((bs) => {
                bs.backends = bs.backends.filter((b) => b.target_id != this.id)
            })
        })
        this.getOkitJson().getNetworkLoadBalancers().forEach((lb) => {
            lb.backend_sets.forEach((bs) => {
                bs.backends = bs.backends.filter((b) => b.target_id != this.id)
            })
        })
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
