/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Visual Builder Instance Javascript');

/*
** Define Visual Builder Instance Class
*/
class VisualBuilderInstance extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.node_count = 1
        this.consumption_model = ''
        this.custom_endpoint = this.newCustomEndpoint()
        this.idcs_open_id = ''
        this.is_visual_builder_enabled = true
        this.pricing_estimates = {
            estimated_ocpu_per_hour: 1
        }
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    newCustomEndpoint() {
        return {
            hostname: '',
            certificate_secret_id: ''
        }
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'vbi';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Visual Builder Instance';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newVisualBuilderInstance = function(data) {
    this.getVisualBuilderInstances().push(new VisualBuilderInstance(data, this));
    return this.getVisualBuilderInstances()[this.getVisualBuilderInstances().length - 1];
}
OkitJson.prototype.getVisualBuilderInstances = function() {
    if (!this.visual_builder_instances) this.visual_builder_instances = []
    return this.visual_builder_instances;
}
OkitJson.prototype.getVisualBuilderInstance = function(id='') {
    for (let artefact of this.getVisualBuilderInstances()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteVisualBuilderInstance = function(id) {
    this.visual_builder_instances = this.visual_builder_instances ? this.visual_builder_instances.filter((r) => r.id !== id) : []
}

