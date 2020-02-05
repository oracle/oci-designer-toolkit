/*
** Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Object Storage Bucket Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[object_storage_bucket_artifact] = [compartment_artifact];

const object_storage_bucket_query_cb = "object-storage-bucket-query-cb";

/*
** Define Object Storage Bucket Class
 */
class ObjectStorageBucket extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.id = 'okit-' + object_storage_bucket_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(object_storage_bucket_prefix, okitjson.object_storage_buckets.length + 1);
        this.compartment_id = data.parent_id;
        this.name = this.display_name;
        this.namespace = 'Tenancy Name';
        this.storage_tier = 'Standard';
        this.public_access_type = 'NoPublicAccess';
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            this.getParent = function() {
                for (let parent of okitjson.compartments) {
                    if (parent.id === this.parent_id) {
                        return parent
                    }
                }
                return null;
            }
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new ObjectStorageBucket(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return object_storage_bucket_artifact;
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
        for (let instance of this.getOkitJson().instances) {
            for (let i=0; i < instance['object_storage_bucket_ids'].length; i++) {
                if (instance.object_storage_bucket_ids[i] === this.id) {
                    instance.object_storage_bucket_ids.splice(i, 1);
                }
            }
        }
    }


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let svg = drawArtifact(this.getSvgDefinition());
        /*
        ** Add Properties Load Event to created svg. We require the definition of the local variable "me" so that it can
        ** be used in the function dur to the fact that using "this" in the function will refer to the function not the
        ** Artifact.
         */
        let me = this;
        svg.on("click", function() {
            me.loadProperties();
            d3.event.stopPropagation();
        });
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


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $("#properties").load("propertysheets/object_storage_bucket.html", function () {
            // Load Referenced Ids
            // Load Properties
            loadPropertiesSheet(me);
            // Add Event Listeners
            addPropertiesEventListeners(me, []);
        });
    }


    /*
    ** Child Offset Functions
     */
    getFirstChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x),
            dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
        };
        return offset;
    }

    getContainerChildOffset() {
        let offset = this.getFirstContainerChildOffset();
        return offset;
    }

    getTopEdgeChildOffset() {
        let offset = this.getFirstTopEdgeChildOffset();
        return offset;
    }

    getBottomEdgeChildOffset() {}

    getLeftEdgeChildOffset() {}

    getRightEdgeChildOffset() {}

    getTopChildOffset() {
        let offset = this.getTopEdgeChildOffset();
        return offset;
    }
    getBottomChildOffset() {}

    getLeftChildOffset() {}

    getRightChildOffset() {}


    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        // Return list of Artifact names
        return [compartment_artifact];
    }

    /*
    ** Static Query Functionality
     */

    static query(request = {}, region='') {
        console.info('------------- Object Storage Bucket Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/ObjectStorageBucket',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({object_storage_buckets: response_json});
                let len =  response_json.length;
                for(let i=0;i<len;i++ ){
                    console.info('Object Storage Bucket Query : ' + response_json[i]['display_name']);
                }
                redrawSVGCanvas(region);
                $('#' + object_storage_bucket_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + object_storage_bucket_query_cb).prop('checked', true);
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
        .attr('id', object_storage_bucket_query_cb);
    cell.append('label').text(object_storage_bucket_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(object_storage_bucket_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'object_storage_bucket_name_filter')
        .attr('name', 'object_storage_bucket_name_filter');
});
