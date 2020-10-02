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

    getParent() {
        return this.parent;
    }

    getParentId() {
        return this.parent_id;
    }

    /*
     ** SVG Processing
     */
    draw() {
        console.log('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let me = this;
        let svg = super.draw();
        console.log();
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        if (this.parent) {
            let first_child = this.getParent().getChildOffset(this.getArtifactReference());
            definition['svg']['x'] = first_child.dx;
            definition['svg']['y'] = first_child.dy;
            definition['svg']['width'] = this.dimensions['width'];
            definition['svg']['height'] = this.dimensions['height'];
            definition['rect']['stroke']['colour'] = stroke_colours.bark;
            definition['rect']['stroke']['dash'] = 1;
        }
        return definition;
    }

    // Return Artifact Dimensions
    getDimensions() {
        console.log('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getMinimumDimensions();
        // Calculate Size based on Child Artifacts
        // Check size against minimum
        dimensions.width  = Math.max(dimensions.width,  this.getMinimumDimensions().width);
        dimensions.height = Math.max(dimensions.height, this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.log();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: icon_width, height:icon_height};
    }


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