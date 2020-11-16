/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer FileStorageSystem View Javascript');

/*
** Define FileStorageSystem View Artifact Class
 */
class FileStorageSystemView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.primary_mount_target.subnet_id;}
    get parent() {return this.getJsonView().getSubnet(this.parent_id);}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/file_storage_system.html", () => {
            // Build Network Security Groups
            this.loadNetworkSecurityGroups('nsg_ids', this.primary_mount_target.subnet_id);
            // Load Properties
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/file_storage_system.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return FileStorageSystem.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

}