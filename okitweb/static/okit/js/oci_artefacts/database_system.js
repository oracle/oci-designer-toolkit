/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Database System Javascript');

const database_system_query_cb = "database-system-query-cb";

/*
** Define Autonomous Database Class
 */
class DatabaseSystem extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.database_systems.length + 1);
        this.compartment_id = data.parent_id;
        this.availability_domain = 1;
        this.database_edition = 'STANDARD_EDITION';
        this.db_home = {
            database: {
                admin_password: generatePassword(),
                db_name: this.display_name.replace('-', '').substr(4, 8),
                db_workload: 'OLTP'
            },
            db_version: ''
        };
        this.hostname = this.display_name.toLowerCase();
        this.shape = 'VM.Standard2.1';
        this.ssh_public_keys = '';
        this.subnet_id = data.parent_id;
        this.backup_network_nsg_ids = [];
        this.backup_subnet_id = '';
        this.cluster_name = '';
        this.cpu_core_count = 0;
        this.data_storage_percentage = 80;
        this.data_storage_size_in_gb = 256;
        this.db_system_options = {
            storage_management: 'ASM'
        }
        this.disk_redundancy = '';
        this.domain = '';
        this.fault_domains = [];
        this.license_model = 'LICENSE_INCLUDED';
        this.node_count = 1;
        this.nsg_ids = [];
        this.source = 'NONE'
        this.sparse_diskgroup = false;
        this.time_zone = '+00:00';
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = () => {return parent};
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new DatabaseSystem(this, this.getOkitJson());
    }


    /*
    ** Parent Processing Override
     */
    getParentId() {
        return this.compartment_id;
    }

    getParent() {
        return this.getOkitJson().getSubnet(this.subnet_id);
    }



    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Instance references
        for (let instance of this.getOkitJson().instances) {
            for (let i=0; i < instance['database_system_ids'].length; i++) {
                if (instance.database_system_ids[i] === this.id) {
                    instance.database_system_ids.splice(i, 1);
                }
            }
        }
    }


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        //if (this.isAttached()) {
        //    console.groupEnd();
        //    return;
        //}
        let svg = super.draw();
        /*
        ** Add Properties Load Event to created svg. We require the definition of the local variable "me" so that it can
        ** be used in the function dur to the fact that using "this" in the function will refer to the function not the
        ** Artifact.
         */
        // Get Inner Rect to attach Connectors
        let rect = svg.select("rect[id='" + safeId(this.id) + "']");
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
        console.groupEnd();
        return svg;
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        console.groupCollapsed('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let dimensions = this.getDimensions();
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    // Return Artifact Dimensions
    getDimensions() {
        console.groupCollapsed('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getMinimumDimensions();
        // Calculate Size based on Child Artifacts
        // Check size against minimum
        dimensions.width  = Math.max(dimensions.width,  this.getMinimumDimensions().width);
        dimensions.height = Math.max(dimensions.height, this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: icon_width, height:icon_height};
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
                if (!shape.shape.startsWith('BM.')) {
                    shape_select.append($('<option>').attr('value', shape.shape).text(shape.name));
                }
            }
            $(shape_select).on('click', function() {
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
            });
            // Load DB System Versions
            let db_version_select = $(jqId('db_version'));
            $(db_version_select).empty();
            //db_version_select.append($('<option>').attr('value', '').text('System Default'));
            for (let version of okitOciData.getDBVersions()) {
                db_version_select.append($('<option>').attr('value', version.version).text(version.version));
            }
            // Load Properties
            loadPropertiesSheet(me);
            // Click Select Lists we have added dynamic on click to
            $(shape_select).click();
        });
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'ds';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Database System';
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

    static query(request = {}, region='') {
        console.info('------------- Autonomous Database Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/DatabaseSystem',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({database_systems: response_json});
                for (let artifact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artifact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + database_system_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + database_system_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', database_system_query_cb);
    cell.append('label').text(DatabaseSystem.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(DatabaseSystem.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'database_system_name_filter')
        .attr('name', 'database_system_name_filter');
});
