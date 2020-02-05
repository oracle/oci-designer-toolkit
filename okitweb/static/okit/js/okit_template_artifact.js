/*
** Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Okit Template Artifact Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[template_artifact_artifact] = [compartment_artifact];

const template_artifact_stroke_colour = "#F80000";
const template_artifact_query_cb = "template-artifact-query-cb";

/*
** Define Okit Template Artifact Class
 */
class OkitTemplateArtifact extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.id = 'okit-' + template_artifact_prefix + '-' + uuidv4();
        //this.display_name = generateDefaultName(template_artifact_prefix, okitjson.template_artifacts.length + 1);
        this.display_name = this.generateDefaultName(okitjson.template_artifacts.length + 1);
        this.compartment_id = '';
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            this.getParent = function() {
                for (let parent of okitjson.parent_type_list) {
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
        return new OkitTemplateArtifact(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return template_artifact_artifact;
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

    deleteChildren() {}


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
        definition['rect']['stroke']['colour'] = template_artifact_stroke_colour;
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
        $("#properties").load("propertysheets/template_artifact.html", function () {
            // Load Referenced Ids
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
        // Return list of Artifact names
        return [];
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'ota';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'OkitTemplateArtifact';
    }

    static getDropTargets() {
        return [Parent.getArtifactReference()];
    }

    static query(request = {}, region='') {
        console.info('------------- OkitTemplateArtifact --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        let me = this;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/OkitTemplateArtifact',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request_json),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({template_artifacts: response_json});
                let len =  response_json.length;
                if (len > 0) {
                    for(let i=0;i<len;i++ ){
                        console.info('OkitTemplateArtifact : ' + response_json[i]['display_name']);
                        me.querySubComponents(request, region, response_json[i]['id']);
                    }
                } else {
                    // Do this to clear check boxes
                    me.querySubComponents(request, region, null);
                }
                redrawSVGCanvas(region);
                $('#' + template_artifact_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + template_artifact_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            }
        });
    }

    static querySubComponents(request = {}, region='', id='') {

    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', template_artifact_query_cb);
    cell.append('label').text(template_artifact_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(template_artifact_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'template_artifact_name_filter')
        .attr('name', 'template_artifact_name_filter');
});
