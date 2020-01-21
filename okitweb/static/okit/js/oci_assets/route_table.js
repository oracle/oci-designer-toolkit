console.info('Loaded Route Table Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[route_table_artifact] = [virtual_cloud_network_artifact];

const route_table_query_cb = "route-table-query-cb";

/*
** Query OCI
 */

function queryRouteTableAjax(compartment_id, vcn_id) {
    console.info('------------- queryRouteTableAjax --------------------');
    let request_json = JSON.clone(okitQueryRequestJson);
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('route_table_filter' in okitQueryRequestJson) {
        request_json['route_table_filter'] = okitQueryRequestJson['route_table_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/RouteTable',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            //okitJson['route_tables'] = response_json;
            okitJson.load({route_tables: response_json});
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryRouteTableAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + route_table_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : ' + status)
            console.info('Error : ' + error)
            $('#' + route_table_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        }
    });
}

/*
** Define Route Table Class
 */
class RouteTable extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.id = 'okit-' + route_table_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(route_table_prefix, okitjson.route_tables.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.route_rules = [];
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.vcn_id;
        if (parent !== null) {
            this.getParent = function() {return parent};
        } else {
            for (let parent of okitjson.virtual_cloud_networks) {
                if (parent.id === this.parent_id) {
                    this.getParent = function() {return parent};
                    break;
                }
            }
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new RouteTable(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return route_table_artifact;
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
        // Remove Subnet references
        for (let subnet of this.getOkitJson().subnets) {
            if (subnet.route_table_id === this.id) {
                subnet.route_table_id = '';
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
        // Check if this is attached but exclude when parent is the attachment type.
        if (this.getParent().getArtifactReference() !== subnet_artifact) {
            for (let subnet of this.getOkitJson().subnets) {
                if (subnet.route_table_id === this.id) {
                    console.info(this.display_name + ' attached to subnet ' + subnet.display_name);
                    return true;
                }
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
        $("#properties").load("propertysheets/route_table.html", function () {
            // Load Referenced Ids
            // Load Properties
            loadProperties(me);
            // Add Event Listeners
            addPropertiesEventListeners(me, []);
            // Route Rules
            for (let route_rule of me.route_rules) {
                me.addRouteRuleHtml(route_rule);
            }
            // Add Handler to Add Button
            document.getElementById('add_button').addEventListener('click', me.handleAddRouteRule, false);
            document.getElementById('add_button').route_table = me;
        });
    }

    handleAddRouteRule(evt) {
        //route_table = evt.target.route_table;
        console.info('Adding route rule to : ' + evt.target.route_table);
        let new_rule = {destination_type: "CIDR_BLOCK", destination: "0.0.0.0/0", network_entity_id: ""}
        evt.target.route_table.route_rules.push(new_rule);
        evt.target.route_table.addRouteRuleHtml(new_rule);
        displayOkitJson();
    }

    handleDeleteRouteRulesRow(evt) {
        let row = evt.target.parentNode.parentNode.parentNode.parentNode.parentNode;
        row.parentNode.removeChild(row);
        evt.target.route_table.route_rules.splice(evt.target.route_table.rule_num, 1);
        displayOkitJson();
    }

    addRouteRuleHtml(route_rule) {
        let rules_table_body = d3.select('#route_rules_table_body');
        let rules_count = $('#route_rules_table_body > tr').length;
        let rule_num = rules_count + 1;
        let row = rules_table_body.append('tr');
        let cell = row.append('td')
            .attr("id", "rule_" + rule_num)
            .attr("colspan", "2");
        let rule_table = cell.append('table')
            .attr("id", "rule_table_" + rule_num)
            .attr("class", "property-editor-table");
        // First Row with Delete Button
        let rule_row = rule_table.append('tr');
        let rule_cell = rule_row.append('td')
            .attr("colspan", "2");
        let delete_btn = rule_cell.append('input')
            .attr("type", "button")
            .attr("class", "delete-button")
            .attr("value", "-");
        delete_btn.node().addEventListener("click", this.handleDeleteRouteRulesRow, false);
        delete_btn.node().route_table = this;
        delete_btn.node().rule_num = rule_num;
        // Destination Type
        rule_row = rule_table.append('tr');
        rule_cell = rule_row.append('td')
            .text("Destination Type");
        rule_cell = rule_row.append('td');
        rule_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("readonly", "readonly")
            .attr("id", "destination_type")
            .attr("name", "destination_type")
            .attr("value", route_rule['destination_type'])
            .on("change", function() {
                route_rule['destination_type'] = this.value;
                displayOkitJson();
            });
        // Destination
        rule_row = rule_table.append('tr');
        rule_cell = rule_row.append('td')
            .text("Destination");
        rule_cell = rule_row.append('td');
        rule_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", "destination")
            .attr("name", "destination")
            .attr("value", route_rule['destination'])
            .on("change", function() {
                route_rule['destination'] = this.value;
                console.info('Changed destination: ' + this.value);
                displayOkitJson();
            });
        // Network Entity
        rule_row = rule_table.append('tr');
        rule_cell = rule_row.append('td')
            .text("Network Entity");
        rule_cell = rule_row.append('td');
        let network_entity_id_select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "network_entity_id")
            .on("change", function() {
                route_rule['network_entity_id'] = this.options[this.selectedIndex].value;
                console.info('Changed network_entity_id ' + this.selectedIndex);
                displayOkitJson();
            });
        let gateways = [];
        if (this.getParent().getArtifactReference() === virtual_cloud_network_artifact) {
            gateways = this.getParent().getGateways();
        } else {
            // Must be a child of the Virtual Cloud Network
            gateways = this.getParent().getParent().getGateways();
        }
        // Add Internet gateways
        for (let gateway of gateways) {
            let opt = network_entity_id_select.append('option')
                .attr("value", gateway.id)
                .text(gateway.display_name);
        }
        if (route_rule.network_entity_id === '' && gateways.length > 0) {
            route_rule.network_entity_id = gateways[0].id;
        }
        network_entity_id_select.property('value', route_rule.network_entity_id);
    }



    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        // Return list of Artifact names
        return [];
    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', route_table_query_cb);
    cell.append('label').text(route_table_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(route_table_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'route_table_name_filter')
        .attr('name', 'route_table_name_filter');
});















