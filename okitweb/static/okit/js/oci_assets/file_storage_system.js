console.info('Loaded File Storage System Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[file_storage_system_artifact] = [subnet_artifact];

const file_storage_system_query_cb = "file-storage-system-query-cb";
/*
** Query OCI
 */

function queryFileStorageSystemAjax(compartment_id, subnet_id) {
    console.info('------------- queryFileStorageSystemAjax --------------------');
    let request_json = JSON.clone(okitQueryRequestJson);
    request_json['compartment_id'] = compartment_id;
    request_json['subnet_id'] = subnet_id;
    if ('file_storage_system_filter' in okitQueryRequestJson) {
        request_json['file_storage_system_filter'] = okitQueryRequestJson['file_storage_system_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/FileStorageSystem',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            //okitJson['file_storage_systems'] = response_json;
            okitJson.load({file_storage_systems: response_json});
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryFileStorageSystemAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + file_storage_system_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.warn('Status : ' + status)
            console.warn('Error : ' + error)
            $('#' + file_storage_system_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        }
    });
}

/*
** Define File Storage System Class
 */
class FileStorageSystem extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.id = 'okit-' + file_storage_system_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(file_storage_system_prefix, okitjson.file_storage_systems.length + 1);
        this.compartment_id = '';
        this.subnet_id = data.parent_id;
        this.availability_domain = '1';
        this.source = this.getOkitJson().getSubnet(this.subnet_id)['cidr_block'];
        this.hostname_label = this.display_name.toLowerCase();
        this.path = '/mnt';
        this.access = 'READ_ONLY';
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.subnet_id;
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            for (let parent of okitjson.subnets) {
                if (parent.id === this.parent_id) {
                    this.getParent = function () {
                        return parent
                    };
                    break;
                }
            }
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new FileStorageSystem(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return file_storage_system_artifact;
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
        $("#properties").load("propertysheets/file_storage_system.html", function () {
            // Load Referenced Ids
            // Load Properties
            loadProperties(me);
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
        return [subnet_artifact];
    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', file_storage_system_query_cb);
    cell.append('label').text(file_storage_system_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(file_storage_system_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'file_storage_system_name_filter')
        .attr('name', 'file_storage_system_name_filter');
});
