/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Oracle Digital Assistant Javascript');

/*
** Define Oracle Digital Assistant Class
*/
class OracleDigitalAssistant extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.shape_name = 'DEVELOPMENT'
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'oda';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Oracle Digital Assistant';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newOracleDigitalAssistant = function(data) {
    this.getOracleDigitalAssistants().push(new OracleDigitalAssistant(data, this));
    return this.getOracleDigitalAssistants()[this.getOracleDigitalAssistants().length - 1];
}
OkitJson.prototype.getOracleDigitalAssistants = function() {
    if (!this.oracle_digital_assistants) this.oracle_digital_assistants = []
    return this.oracle_digital_assistants;
}
OkitJson.prototype.getOracleDigitalAssistant = function(id='') {
    for (let artefact of this.getOracleDigitalAssistants()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteOracleDigitalAssistant = function(id) {
    this.oracle_digital_assistants = this.oracle_digital_assistants ? this.oracle_digital_assistants.filter((r) => r.id !== id) : []
}

