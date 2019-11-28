console.info('Loaded Autonomous Database Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[autonomous_database_artifact] = [compartment_artifact];
asset_connect_targets[autonomous_database_artifact] = [instance_artifact];
asset_add_functions[autonomous_database_artifact] = "addAutonomousDatabase";
asset_delete_functions[autonomous_database_artifact] = "deleteAutonomousDatabase";
asset_clear_functions.push("clearAutonomousDatabaseVariables");

const autonomous_database_stroke_colour = "#F80000";
const autonomous_database_query_cb = "autonomous-database-query-cb";
let autonomous_database_ids = [];

/*
** Reset variables
 */

// TODO: Delete
function clearAutonomousDatabaseVariables() {
    autonomous_database_ids = [];
}

/*
** Add Asset to JSON Model
 */
// TODO: Delete
function addAutonomousDatabaseDeprecated(parent_id, compartment_id) {
    let id = 'okit-' + autonomous_database_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + autonomous_database_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('autonomous_databases')) {
        okitJson['autonomous_databases'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    autonomous_database_ids.push(id);

    // Increment Count
    let autonomous_database_count = okitJson['autonomous_databases'].length + 1;
    let autonomous_database = {};
    autonomous_database['compartment_id'] = parent_id;
    autonomous_database['id'] = id;
    autonomous_database['display_name'] = generateDefaultName(autonomous_database_prefix, autonomous_database_count);
    autonomous_database['db_name'] = autonomous_database['display_name'].replace('-', '');
    autonomous_database['admin_password'] = generatePassword();
    autonomous_database['data_storage_size_in_tbs'] = 1;
    autonomous_database['cpu_core_count'] = 1;
    autonomous_database['db_workload'] = 'OLTP';
    autonomous_database['is_auto_scaling_enabled'] = true;
    autonomous_database['is_free_tier'] = false;
    okitJson['autonomous_databases'].push(autonomous_database);
    okitIdsJsonObj[id] = autonomous_database['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    drawSVGforJson();
    loadAutonomousDatabaseProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */

// TODO: Delete
function deleteAutonomousDatabaseDeprecated(id) {
    console.groupCollapsed('Delete ' + autonomous_database_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['autonomous_databases'].length; i++) {
        if (okitJson['autonomous_databases'][i]['id'] == id) {
            okitJson['autonomous_databases'].splice(i, 1);
        }
    }
    // Remove Instance references
    if ('instances' in okitJson) {
        for (let instance of okitJson['instances']) {
            for (let i=0; i < instance['autonomous_database_ids'].length; i++) {
                if (instance['autonomous_database_ids'][i] == id) {
                    instance['autonomous_database_ids'].splice(i, 1);
                }
            }
        }
    }
    console.groupEnd();
}

/*
** SVG Creation
 */
// TODO: Delete
function getAutonomousDatabaseDimensionsDeprecated(id='') {
    return {width:icon_width, height:icon_height};
}

// TODO: Delete
function newAutonomousDatabaseDefinitionDeprecated(artifact, position=0) {
    let dimensions = getAutonomousDatabaseDimensions();
    let definition = newArtifactSVGDefinition(artifact, autonomous_database_artifact);
    definition['svg']['x'] = Math.round(icon_width / 4);
    definition['svg']['y'] = Math.round((icon_height * 2) + (icon_height * position) + (icon_spacing * position));
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = autonomous_database_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

// TODO: Delete
function drawAutonomousDatabaseSVGDeprecated(artifact) {
    let parent_id = artifact['compartment_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + autonomous_database_artifact + ' : ' + id);
    // Check if this Autonomous Database Volume has been attached to an Instance and if so do not draw because it will be done
    // as part of the instance
    if (okitJson.hasOwnProperty('instances')) {
        for (let instance of okitJson['instances']) {
            if (instance.hasOwnProperty('autonomous_database_ids')) {
                if (instance['autonomous_database_ids'].includes(artifact['id'])) {
                    console.info(artifact['display_name'] + ' attached to instance '+ instance['display_name']);
                    console.groupEnd();
                    return;
                }
            }
        }
    }
    if (!artifact.hasOwnProperty('parent_id')) {
        artifact['parent_id'] = artifact['compartment_id'];
    }

    if (!compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        compartment_bui_sub_artifacts[parent_id] = {};
    }

    if (compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!compartment_bui_sub_artifacts[parent_id].hasOwnProperty('artifact_position')) {
            compartment_bui_sub_artifacts[parent_id]['artifact_position'] = 0;
        }
        // Calculate Position
        let position = compartment_bui_sub_artifacts[parent_id]['artifact_position'];
        // Increment Icon Position
        compartment_bui_sub_artifacts[parent_id]['artifact_position'] += 1;

        let svg = drawArtifact(newAutonomousDatabaseDefinition(artifact, position));

        let rect = d3.select('#' + id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        /*
         Add click event to display properties
         Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
         Add dragevent versions
         Set common attributes on svg element and children
         */
        svg.on("click", function () {
            loadAutonomousDatabaseProperties(id);
            d3.event.stopPropagation();
        });
    } else {
        console.warn(parent_id + ' was not found in compartment sub artifacts : ' + JSON.stringify(compartment_bui_sub_artifacts));
    }
    console.groupEnd();
}

/*
** Property Sheet Load function
 */
// TODO: Delete
function loadAutonomousDatabasePropertiesDeprecated(id) {
    $("#properties").load("propertysheets/autonomous_database.html", function () {
        if ('autonomous_databases' in okitJson) {
            console.info('Loading ' + autonomous_database_artifact + ' : ' + id);
            let json = okitJson['autonomous_databases'];
            for (let i = 0; i < json.length; i++) {
                let autonomous_database = json[i];
                if (autonomous_database['id'] == id) {
                    // Load Properties
                    loadProperties(autonomous_database);
                    // Add Event Listeners
                    addPropertiesEventListeners(autonomous_database, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryAutonomousDatabaseAjax(compartment_id) {
    console.info('------------- queryAutonomousDatabaseAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    if ('autonomous_database_filter' in okitQueryRequestJson) {
        request_json['autonomous_database_filter'] = okitQueryRequestJson['autonomous_database_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/AutonomousDatabase',
        dataType: 'text',
        contentType: 'application/json',
        //data: JSON.stringify(okitQueryRequestJson),
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            //okitJson['autonomous_databases'] = response_json;
            okitJson.load({autonomous_databases: response_json});
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryAutonomousDatabaseAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + autonomous_database_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}


$(document).ready(function() {
    clearAutonomousDatabaseVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', autonomous_database_query_cb);
    cell.append('label').text(autonomous_database_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(autonomous_database_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'autonomous_database_name_filter')
        .attr('name', 'autonomous_database_name_filter');
});















/*
** Define Autonomous Database Class
 */
class AutonomousDatabase extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        // Configure default values
        this.id = 'okit-' + autonomous_database_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(autonomous_database_prefix, okitjson.autonomous_databases.length + 1);
        this.compartment_id = data.parent_id;
        this.db_name = this.display_name.replace('-', '');
        this.admin_password = generatePassword();
        this.data_storage_size_in_tbs = 1;
        this.cpu_core_count = 1;
        this.db_workload = 'OLTP';
        this.is_auto_scaling_enabled = true;
        this.is_free_tier = false;
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.compartment_id;
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            for (let parent of okitjson.compartments) {
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
        return new AutonomousDatabase(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return autonomous_database_artifact;
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
        // Remove Instance references
        for (let instance of this.getOkitJson().instances) {
            for (let i=0; i < instance['autonomous_database_ids'].length; i++) {
                if (instance.autonomous_database_ids[i] === this.id) {
                    instance.autonomous_database_ids.splice(i, 1);
                }
            }
        }
    }


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        if (this.isAttached()) {
            console.groupEnd();
            return;
        }
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
        definition['rect']['stroke']['colour'] = autonomous_database_stroke_colour;
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
            if (instance.autonomous_database_ids.includes(this.id)) {
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
        $("#properties").load("propertysheets/autonomous_database.html", function () {
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
        return [compartment_artifact];
    }
}

