/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer DatabaseSystem View Javascript');

/*
** Define DatabaseSystem View Artifact Class
 */
class DatabaseSystemView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    // TODO: Enable when Instance code added
    get attached1() {
        if (!this.attached_id) {
            for (let instance of this.getOkitJson().instances) {
                if (instance.database_system_ids.includes(this.id)) {
                    return true;
                }
            }
        }
        return false;
    }
    get parent_id() {return this.artefact.subnet_id;}
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
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/database_system.html", () => {
            // Load DB System Shapes
            let shape_select = $(jqId('shape'));
            $(shape_select).empty();
            for (let shape of okitOciData.getDBSystemShapes()) {
                if (shape.shape.startsWith('VM.') || shape.shape.startsWith('BM.') || shape.shape.startsWith('Exadata.')) {
                    shape_select.append($('<option>').attr('value', shape.shape).text(shape.name));
                }
            }
            $(shape_select).on('change', function() {
                let shape = okitOciData.getDBSystemShape($(this).val());
                console.info('Selected Shape ' + JSON.stringify(shape));
                let cpu_count_select = $(jqId('cpu_core_count'));
                $(cpu_count_select).empty();
                cpu_count_select.append($('<option>').attr('value', 0).text('System Default'));
                for (let i = shape.minimum_core_count; i < shape.available_core_count; i += shape.core_count_increment) {
                    cpu_count_select.append($('<option>').attr('value', i).text(i));
                }
                $(cpu_count_select).val(0);
                $(cpu_count_select).select().change();
                if (shape.shape_family === 'VIRTUALMACHINE') {
                    $(jqId('data_storage_percentage_tr')).addClass('collapsed');
                    $(jqId('cpu_core_count_tr')).addClass('collapsed');
                    if (shape.maximum_node_count > 1) {
                        $(jqId('node_count_tr')).removeClass('collapsed');
                    } else {
                        $(jqId('node_count_tr')).addClass('collapsed');
                        $(jqId('node_count_tr')).val(1);
                        $(jqId('cluster_name_tr')).addClass('collapsed');
                        $(jqId('cluster_name')).val('');
                    }
                } else {
                    $(jqId('node_count_tr')).addClass('collapsed');
                    $(jqId('data_storage_percentage_tr')).removeClass('collapsed');
                    $(jqId('cpu_core_count_tr')).removeClass('collapsed');
                    if (shape.shape_family === 'EXADATA') {
                        $(jqId('cluster_name_tr')).removeClass('collapsed');
                    }
                }
            });
            // Load DB System Versions
            let db_version_select = $(jqId('db_version'));
            $(db_version_select).empty();
            //db_version_select.append($('<option>').attr('value', '').text('System Default'));
            for (let version of okitOciData.getDBVersions()) {
                db_version_select.append($('<option>').attr('value', version.version).text(version.version));
            }
            // Build Network Security Groups
            this.loadNetworkSecurityGroups('nsg_ids', this.subnet_id);
            // Add change event to node count to hide/display cluster name
            $(jqId('node_count')).on('change', () => {
                if ($(jqId('node_count')).val() > 1) {
                    $(jqId('cluster_name_tr')).removeClass('collapsed');
                } else {
                    $(jqId('cluster_name_tr')).addClass('collapsed');
                    $(jqId('cluster_name')).val('');
                }
            });
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
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/database_system.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return DatabaseSystem.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

}