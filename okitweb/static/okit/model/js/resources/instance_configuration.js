/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Instance Configuration Javascript');

/*
** Define Instance Configuration Class
*/
class InstanceConfiguration extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;

        this.instance_details = this.newInstanceDetails()
        // Update with any passed data
        this.merge(data);
        this.convert();
        Object.defineProperty(this, 'primary_vnic', {get: function() {return this.instance_details.launch_details.create_vnic_details;}, set: function(vnic) {this.instance_details.launch_details.create_vnic_details = vnic;}, enumerable: true });
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.primary_vnic.subnet_id;}, set: function(id) {this.primary_vnic.subnet_id = id;}, enumerable: true });
        Object.defineProperty(this, 'shape', {get: function() {return this.instance_details.launch_details.shape;}, set: function(shape) {this.instance_details.launch_details.shape = shape;}, enumerable: true });
        Object.defineProperty(this, 'instance_type', {get: function() {return !this.shape ? 'vm' : this.shape.toLowerCase().substr(0,2);}, set: function(type) {}, enumerable: true });
        Object.defineProperty(this, 'chipset', {get: function() {return !this.shape ? 'intel' : this.shape.startsWith('VM.') && this.shape.includes('.E') ? 'amd' : this.shape.startsWith('VM.') && this.shape.includes('.A') ? 'arm' : 'intel'}, set: function(chipset) {}, enumerable: true });
        Object.defineProperty(this, 'shape_series', {get: function() {return !this.shape ? 'intel' : this.shape.startsWith('VM.') && this.shape.includes('.E') ? 'amd' : this.shape.startsWith('VM.') && this.shape.includes('.A') ? 'arm' : 'intel'}, set: function(chipset) {}, enumerable: true });
        Object.defineProperty(this, 'flex_shape', {get: function() {return !this.shape ? false : this.shape.endsWith('.Flex')}, set: function(flex_shape) {}, enumerable: true });
        Object.defineProperty(this, 'block_storage_volume_ids', {get: () => {return this.instance_details.block_volumes.map((va) => va.volume_id)}})
        Object.defineProperty(this, 'vnics', {get: () => {return this.instance_details.secondary_vnics}})
        // Object.defineProperty(this, 'memory_in_gbs', {get: () => {return this.flex_shape ? this.shape_config.memory_in_gbs : okitOciData.getInstanceShape(this.shape) ? okitOciData.getInstanceShape(this.shape).memory_in_gbs : 0}})
        // Object.defineProperty(this, 'ocpus', {get: () => {return this.flex_shape ? this.shape_config.ocpus : okitOciData.getInstanceShape(this.shape) ? okitOciData.getInstanceShape(this.shape).ocpus : 0}})
        Object.defineProperty(this, 'assign_public_ip', {get: () => {return this.primary_vnic.assign_public_ip}})
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'ic';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Instance Configuration';
    }
    /*
    ** Custom Methods
    */
    newInstanceDetails = () => {
        const platform = this.getOkitJson().metadata.platform
        return {
            instance_type: 'compute',
            launch_details: {
                compartment_id: this.compartment_id,
                agent_config: {
                    is_monitoring_disabled: false, 
                    is_management_disabled: false
                },
                availability_domain: '1',
                shape: this.isOCI() ? 'VM.Standard.E3.Flex' : '',
                // shape: platform !== 'pca' ? 'VM.Standard.E3.Flex' : '',
                shape_config: {
                    memory_in_gbs: this.isOCI() ? 16 : '', 
                    ocpus: this.isOCI() ? 1 : ''    
                    // memory_in_gbs: platform !== 'pca' ? 16 : '', 
                    // ocpus: platform !== 'pca' ? 1 : ''    
                },
                source_details: {
                    image_id: '',
                    os: 'Oracle Linux', 
                    version: '8', 
                    boot_volume_size_in_gbs: '50', 
                    source_type: 'image', 
                    image_source: 'platform'
                },
                metadata: {
                    ssh_authorized_keys: '', 
                    user_data: ''    
                },
                create_vnic_details: this.newVnicAttachment()
            },
            block_volumes: [],
            secondary_vnics: []
        }
    }
    /*
    ** Create Secondary Network (VNIC)
    */
    newVnicAttachment = () => {
        return {
            // resource_name: `${this.generateResourceName()}VnicAttachment`,
            display_name: `${this.display_name} Vnic`,
            subnet_id: '', 
            assign_public_ip: true, 
            nsg_ids: [], 
            skip_source_dest_check: false, 
            hostname_label: this.display_name.toLowerCase().substring(0, 64)
        }
    }
    newSecondayVnicAttachment = () => {
        return {
            create_vnic_details: this.newVnicAttachment(),
            display_name: `${this.display_name} Vnic`
        }
    }
    /*
    ** Create Volume Attachment
    */
    newVolumeAttachment() {
        return {
            // resource_name: `${this.generateResourceName()}VolumeAttachment`,
            attach_details: {
                display_name: `${this.display_name} Volume Attachment`,
                type: 'paravirtualized',
                is_read_only: false,
                is_shareable: false
            },
            volume_id: ''
        }
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newInstanceConfiguration = function(data) {
    this.getInstanceConfigurations().push(new InstanceConfiguration(data, this));
    return this.getInstanceConfigurations()[this.getInstanceConfigurations().length - 1];
}
OkitJson.prototype.getInstanceConfigurations = function() {
    if (!this.instance_configurations) this.instance_configurations = []
    return this.instance_configurations;
}
OkitJson.prototype.getInstanceConfiguration = function(id='') {
    return this.getInstanceConfigurations().find(r => r.id === id)
}
OkitJson.prototype.deleteInstanceConfiguration = function(id) {
    this.instance_configurations = this.instance_configurations ? this.instance_configurations.filter((r) => r.id !== id) : []
}

