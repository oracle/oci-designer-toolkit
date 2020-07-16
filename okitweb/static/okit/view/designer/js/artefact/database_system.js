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

    get parent_id() {return this.artefact.compartment_id;}

    getParent() {
        return this.getDatabaseSystem(this.getParentId());
    }

    getParentId() {
        return this.parent_id;
    }

    /*
     ** SVG Processing
     */
    draw() {
        console.group('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        //if (this.isAttached()) {
        //    console.groupEnd();
        //    return;
        //}
        let me = this;
        let svg = super.draw();
        // Get Inner Rect to attach Connectors
        let rect = svg.select("rect[id='" + safeId(this.id) + "']");
        if (rect && rect.node()) {
            let boundingClientRect = rect.node().getBoundingClientRect();
            // Add Connector Data
            svg.attr("data-compartment-id", this.compartment_id)
                .attr("data-connector-start-y", boundingClientRect.y + (boundingClientRect.height / 2))
                .attr("data-connector-start-x", boundingClientRect.x)
                .attr("data-connector-end-y", boundingClientRect.y + (boundingClientRect.height / 2))
                .attr("data-connector-end-x", boundingClientRect.x)
                .attr("data-connector-id", this.id)
                .attr("dragable", true)
                .selectAll("*")
                .attr("data-connector-start-y", boundingClientRect.y + (boundingClientRect.height / 2))
                .attr("data-connector-start-x", boundingClientRect.x)
                .attr("data-connector-end-y", boundingClientRect.y + (boundingClientRect.height / 2))
                .attr("data-connector-end-x", boundingClientRect.x)
                .attr("data-connector-id", this.id)
                .attr("dragable", true);
        }
        console.groupEnd();
        return svg;
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        console.group('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        if (this.getParent()) {
            let first_child = this.getParent().getChildOffset(this.getArtifactReference());
            definition['svg']['x'] = first_child.dx;
            definition['svg']['y'] = first_child.dy;
        }
        definition['svg']['width'] = this.dimensions['width'];
        definition['svg']['height'] = this.dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    isAttached() {
        for (let instance of this.getOkitJson().instances) {
            if (instance.database_system_ids.includes(this.id)) {
                console.info(this.display_name + ' attached to instance '+ instance.display_name);
                return true;
            }
        }
        return false;
    }


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
                $(cpu_count_select).select();
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
            let nsg_select = $(jqId('nsg_ids'));
            this.loadNetworkSecurityGroups(nsg_select, this.subnet_id);
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
            loadPropertiesSheet(me);
            // Click Select Lists we have added dynamic on click to
            $(shape_select).change();
        });
    }

    loadNetworkSecurityGroups(select, subnet_id) {
        $(select).empty();
        let vcn = this.getOkitJson().getVirtualCloudNetwork(this.getOkitJson().getSubnet(subnet_id).vcn_id);
        for (let networkSecurityGroup of this.getOkitJson().network_security_groups) {
            if (networkSecurityGroup.vcn_id === vcn.id) {
                select.append($('<option>').attr('value', networkSecurityGroup.id).text(networkSecurityGroup.display_name));
            }
        }
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