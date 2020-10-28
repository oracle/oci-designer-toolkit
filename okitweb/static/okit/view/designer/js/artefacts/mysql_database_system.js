/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer MySQLDatabaseSystem View Javascript');

/*
** Define MySQLDatabaseSystem View Artifact Class
 */
class MySQLDatabaseSystemView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.subnet_id;}
    get parent() {return this.getJsonView().getSubnet(this.parent_id);}
    // TODO: Remove for new draw
    get minimum_dimensions() {return {width: 135, height: 100};}

    /*
     ** SVG Processing
     */
    // Return Artifact Specific Definition.
    getSvgDefinition() {
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        if (this.getParent()) {
            let first_child = this.getParent().getChildOffset(this.getArtifactReference());
            definition['svg']['x'] = first_child.dx;
            definition['svg']['y'] = first_child.dy;
        }
        definition['svg']['width'] = this.dimensions['width'];
        definition['svg']['height'] = this.dimensions['height'];
        definition['svg']['align'] = "center";
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        definition['rect']['height_adjust'] = (Math.round(icon_height / 2) * -1);
        definition['name']['show'] = true;
        definition['name']['align'] = "center";
        return definition;
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/mysql_database_system.html", () => {
            // Load DB System Configurations
            let configuration_select = $(jqId('configuration_id'));
            // Load DB System Shapes
            let shape_select = $(jqId('shape_name'));
            $(shape_select).empty();
            for (let shape of okitOciData.getMySQLShapes()) {
                shape_select.append($('<option>').attr('value', shape.name).text(shape.name));
            }
            $(shape_select).on('change', function() {
                console.info('Selected Shape ' + $(this).val());
                $(configuration_select).empty();
                for (let configuration of okitOciData.getMySQLConfigurations($(this).val())) {
                    configuration_select.append($('<option>').attr('value', configuration.id).text(configuration.display_name));
                }
                $(configuration_select).change();
            });
            // Load MySQL System Versions
            let version_select = $(jqId('mysql_version'));
            $(version_select).empty();
            version_select.append($('<option>').attr('value', '').text('System Default'));
            for (let version of okitOciData.getMySQLVersions()) {
                version_select.append($('<option>').attr('value', version.version).text(version.description));
            }
            // Load Properties
            loadPropertiesSheet(me.artefact);
            // Click Select Lists we have added dynamic on click to
            $(shape_select).change();
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/mysql_database_system.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return MySQLDatabaseSystem.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

}