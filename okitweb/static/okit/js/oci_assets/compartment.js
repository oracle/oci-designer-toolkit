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
            //okitJson['compartments'] = response_json;
            okitJson.load({compartments: response_json});
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
            console.error('Status : ' + status);
            console.error('Error  : ' + error);
            $('#' + compartment_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        }
    });
}

function initiateCompartmentSubQueries(id='') {
    queryVirtualCloudNetworkAjax(id);
    queryBlockStorageVolumeAjax(id);
    queryDynamicRoutingGatewayAjax(id);
    queryAutonomousDatabaseAjax(id);
    queryObjectStorageBucketAjax(id);
    queryFastConnectAjax(id);
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
        console.groupCollapsed('Deleting Children of ' + this.getArtifactReference() + ' : ' + this.display_name);
        // Remove Compartments
        this.getOkitJson().compartments = this.getOkitJson().compartments.filter(function(child) {
            if (child.compartment_id === this.id && child.id !== this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Virtual Cloud Networks
        this.getOkitJson().virtual_cloud_networks = this.getOkitJson().virtual_cloud_networks.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Block Storage Volumes
        this.getOkitJson().block_storage_volumes = this.getOkitJson().block_storage_volumes.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Object Storage Buckets
        this.getOkitJson().object_storage_buckets = this.getOkitJson().object_storage_buckets.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Autonomous Databases
        this.getOkitJson().autonomous_databases = this.getOkitJson().autonomous_databases.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        console.groupEnd();
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


    /*
    ** Container Specific Overrides
     */
    // return the name of the element used by the child to reference this artifact
    getParentKey() {
        return 'compartment_id';
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
