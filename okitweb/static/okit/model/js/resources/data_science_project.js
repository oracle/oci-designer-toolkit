/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Data Science Project Javascript');

/*
** Define Data Science Project Class
*/
class DataScienceProject extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.description = ''
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'dsp';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Data Science Project';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDataScienceProject = function(data) {
    this.getDataScienceProjects().push(new DataScienceProject(data, this));
    return this.getDataScienceProjects()[this.getDataScienceProjects().length - 1];
}
OkitJson.prototype.getDataScienceProjects = function() {
    if (!this.data_science_projects) this.data_science_projects = []
    return this.data_science_projects;
}
OkitJson.prototype.getDataScienceProject = function(id='') {
    return this.getDataScienceProjects().find(r => r.id === id)
}
OkitJson.prototype.deleteDataScienceProject = function(id) {
    this.data_science_projects = this.data_science_projects ? this.data_science_projects.filter((r) => r.id !== id) : []
}

