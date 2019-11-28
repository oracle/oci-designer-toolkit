console.info('Loaded Compartment Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[compartment_artifact] = [];
asset_connect_targets[compartment_artifact] = [];

const compartment_stroke_colour = "#F80000";
const compartment_query_cb = "compartment-query-cb";

/*
** Query OCI
 */

function queryCompartmentAjax() {
    console.info('------------- queryCompartmentAjax --------------------');
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/Compartment',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(okitQueryRequestJson),
        success: function(resp) {
            let response_json = [JSON.parse(resp)];
            okitJson['compartments'] = response_json;
            let len =  response_json.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    console.info('queryCompartmentAjax : ' + response_json[i]['name']);
                    initiateCompartmentSubQueries(response_json[i]['id']);
                }
            } else {
                initiateCompartmentSubQueries(null);
            }
            redrawSVGCanvas();
            $('#' + compartment_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.error('Status : '+ status);
            console.error('Error  : '+ error);
        }
    });
}

function initiateCompartmentSubQueries(id='') {
    queryVirtualCloudNetworkAjax(id);
    queryBlockStorageVolumeAjax(id);
    queryDynamicRoutingGatewayAjax(id);
    queryAutonomousDatabaseAjax(id);
    queryObjectStorageBucketAjax(id);
}

/*
** Define Compartment Artifact Class
 */
class Compartment extends OkitContainerArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.parent_id = 'canvas';
        this.id = 'okit-' + compartment_prefix + '-' + uuidv4();
        this.compartment_id = this.id;
        this.name = generateDefaultName(compartment_prefix, okitjson.compartments.length + 1);
        this.display_name = this.name;
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new Compartment(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return compartment_artifact;
    }


    /*
    ** Delete Processing
     */
    delete() {
        console.groupCollapsed('Delete ' + this.getArtifactReference() + ' : ' + this.id);
        // Delete Child Artifacts
        this.deleteChildren();
        // Remove SVG Element
        d3.select("#" + this.id + "-svg").remove()
        console.groupEnd();
    }

    deleteChildren() {
        // Remove Compartments
        for (let child of this.getOkitJson().compartments) {
            if (child.compartment_id === this.id && child.id !== this.id) {
                child.delete();
            }
        }
        // Virtual Cloud Networks
        for (let child of this.getOkitJson().virtual_cloud_networks) {
            if (child.compartment_id === this.id) {
                child.delete();
            }
        }
        // Block Storage Volumes
        for (let child of this.getOkitJson().block_storage_volumes) {
            if (child.compartment_id === this.id) {
                child.delete();
            }
        }
        // Object Storage Buckets
        for (let child of this.getOkitJson().object_storage_buckets) {
            if (child.compartment_id === this.id) {
                child.delete();
            }
        }
        // Autonomous Databases
        for (let child of this.getOkitJson().autonomous_databases) {
            if (child.compartment_id === this.id) {
                child.delete();
            }
        }
    }


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + compartment_artifact + ' : ' + this.id);
        let svg = drawArtifact(this.getSvgDefinition());
        // Add Properties Load Event to created svg
        let me = this;
        svg.on("click", function() {
            me.loadProperties();
            d3.event.stopPropagation();
        });
        console.groupEnd();
    }

    getSvgDefinition() {
        let dimensions = this.getDimensions(this.id);
        let definition = this.newSVGDefinition(this, compartment_artifact);
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = compartment_stroke_colour;
        definition['rect']['stroke']['dash'] = 5;
        definition['icon']['x_translation'] = icon_translate_x_start;
        definition['icon']['y_translation'] = icon_translate_y_start;
        definition['name']['show'] = true;
        definition['label']['show'] = true;
        return definition;
    }

    getDimensions() {
        return super.getDimensions('compartment_id');
    }
    // TODO: Delete
    getDimensions1(id='') {
        console.groupCollapsed('Getting Dimensions of ' + compartment_artifact + ' : ' + id);
        const min_compartment_dimensions = this.getMinimumDimensions();
        let dimensions = {width:container_artifact_x_padding * 2, height:container_artifact_y_padding * 2};
        let max_sub_container_dimensions = {width:0, height: 0, count:0};
        let max_virtual_cloud_network_dimensions = {width:0, height: 0, count:0};
        // Virtual Cloud Networks
        if (this.getOkitJson().hasOwnProperty('virtual_cloud_networks')) {
            for (let virtual_cloud_network of this.getOkitJson().virtual_cloud_networks) {
                if (virtual_cloud_network['compartment_id'] == id) {
                    let virtual_cloud_network_dimensions = virtual_cloud_network.getDimensions();
                    max_virtual_cloud_network_dimensions['width'] = Math.max(virtual_cloud_network_dimensions['width'], max_virtual_cloud_network_dimensions['width']);
                    max_virtual_cloud_network_dimensions['height'] += virtual_cloud_network_dimensions['height'];
                    max_virtual_cloud_network_dimensions['count'] += 1;
                }
            }
        }
        // Calculate Largest Width
        // User 3 * positional_adjustments.spacing.y because positioning of vcn uses x-left of 2 * positional_adjustments.spacing.y and we want a space on the right.
        dimensions['width'] = Math.max((max_virtual_cloud_network_dimensions['width'] + positional_adjustments.padding.x + (3 * positional_adjustments.spacing.x)),
            max_sub_container_dimensions['width']);
        // Calculate Height
        dimensions['height'] += max_sub_container_dimensions['height'];
        dimensions['height'] += max_sub_container_dimensions['count'] + positional_adjustments.spacing.y;
        dimensions['height'] += max_virtual_cloud_network_dimensions['height'];
        dimensions['height'] += max_virtual_cloud_network_dimensions['count'] + positional_adjustments.spacing.y;
        // Check size against minimum
        dimensions['width'] = Math.max(dimensions['width'], min_compartment_dimensions['width']);
        dimensions['height'] = Math.max(dimensions['height'], min_compartment_dimensions['height']);

        console.info('Sub Container Dimensions         : ' + JSON.stringify(max_sub_container_dimensions));
        console.info('Virtual Cloud Network Dimensions : ' + JSON.stringify(max_virtual_cloud_network_dimensions));
        console.info('Overall Dimensions               : ' + JSON.stringify(dimensions));

        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        // Check if this is the top level container
        if (this.id === this.compartment_id) {
            return {width: $('#canvas-wrapper').width(), height: $('#canvas-wrapper').height()};
        } else {
            return {width: container_artifact_x_padding * 2, height: container_artifact_y_padding * 2};
        }
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $("#properties").load("propertysheets/compartment.html", function () {
            // Load Properties
            loadProperties(me);
            // Add Event Listeners
            addPropertiesEventListeners(me, []);
        });
    }


    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        return [compartment_artifact];
    }


    /*
    ** Child Type Functions
     */
    getContainerArtifacts() {
        return [virtual_cloud_network_artifact];
    }

    getLeftArtifacts() {
        return [block_storage_volume_artifact, autonomous_database_artifact, object_storage_bucket_artifact];
    }
}

$(document).ready(function() {
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', compartment_query_cb);
    cell.append('label').text(compartment_artifact);
});
