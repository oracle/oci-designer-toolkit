/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
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
        this.notebook_sessions = []
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    newNotebookSession() {
        return {
            resource_name: `${this.generateResourceName()}NotebookSession`,
            display_name: this.display_name,
            notebook_session_config_details: this.newNotebookSessionConfig()
            // notebook_session_runtime_config_details: this.newNotebookSessionRuntimeConfig()
        }
    }

    newNotebookSessionConfig() {
        return {
            shape: '',
            block_storage_size_in_gbs: 50,
            notebook_session_shape_config_details: {
                memory_in_gbs: 16,
                ocpus: 1
            },
            subnet_id: ''
        }
    }

    newNotebookSessionRuntimeConfig() {
        return {
            notebook_session_git_config_details: {
                url: ''
            }
        }
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

