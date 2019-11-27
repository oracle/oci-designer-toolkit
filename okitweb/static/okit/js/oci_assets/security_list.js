console.info('Loaded Security List Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[security_list_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[security_list_artifact] = [subnet_artifact];
asset_add_functions[security_list_artifact] = "addSecurityList";
asset_delete_functions[security_list_artifact] = "deleteSecurityList";
asset_clear_functions.push("clearSecurityListVariables");

const security_list_stroke_colour = "#F80000";
const security_list_query_cb = "security-list-query-cb";
let security_list_ids = [];

/*
** Reset variables
 */

// TODO: Delete
function clearSecurityListVariables() {
    security_list_ids = [];
}

/*
** Add Asset to JSON Model
 */
// TODO: Delete
function addSecurityListDeprecated(vcn_id, compartment_id) {
    let id = 'okit-' + security_list_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + security_list_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('security_lists')) {
        okitJson['security_lists'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    security_list_ids.push(id);

    // Increment Count
    let security_list_count = okitJson['security_lists'].length + 1;
    let security_list = {};
    security_list['vcn_id'] = vcn_id;
    security_list['virtual_cloud_network'] = '';
    security_list['compartment_id'] = compartment_id;
    security_list['id'] = id;
    security_list['display_name'] = generateDefaultName(security_list_prefix, security_list_count);
    security_list['egress_security_rules'] = []
    security_list['ingress_security_rules'] = []
    okitJson['security_lists'].push(security_list);
    okitIdsJsonObj[id] = security_list['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //console.info(security_list_ids);
    //drawSecurityListSVG(security_list);
    drawSVGforJson();
    loadSecurityListProperties(id);
    console.groupEnd();
    return id;
}

/*
** Delete From JSON Model
 */

// TODO: Delete
function deleteSecurityListDeprecated(id) {
    console.groupCollapsed('Delete ' + security_list_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['security_lists'].length; i++) {
        if (okitJson['security_lists'][i]['id'] == id) {
            okitJson['security_lists'].splice(i, 1);
        }
    }
    // Remove Subnet references
    if ('subnets' in okitJson) {
        for (subnet of okitJson['subnets']) {
            for (let i=0; i < subnet['security_list_ids'].length; i++) {
                if (subnet['security_list_ids'][i] == id) {
                    subnet['security_list_ids'].splice(i, 1);
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
function getSecurityListDimensionsDeprecated(id='') {
    return {width:icon_width, height:icon_height};
}

// TODO: Delete
function newSecurityListDefinitionDeprecated(artifact, position=0) {
    let dimensions = getSecurityListDimensions();
    let definition = newArtifactSVGDefinition(artifact, security_list_artifact);
    let first_child = getVirtualCloudNetworkFirstChildOffset();
    definition['svg']['x'] = Math.round(first_child.dx + (icon_width * position) + (positional_adjustments.spacing.x * position));
    definition['svg']['y'] = Math.round(first_child.dy);
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = security_list_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

// TODO: Delete
function drawSecurityListSVGDeprecated(artifact) {
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + security_list_artifact + ' : ' + id + ' [' + parent_id + ']');
    // Check if this Route Table has been attached to a Subnet and if so do not draw because it will be done as part of
    // the subnet draw.
    if (okitJson.hasOwnProperty('subnets')) {
        for (let subnet of okitJson['subnets']) {
            if (subnet['security_list_ids'].includes(artifact['id'])) {
                console.info(artifact['display_name'] + ' attached to subnet '+ subnet['display_name']);
                console.groupEnd();
                return;
            }
        }
    }

    if (!virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        virtual_cloud_network_bui_sub_artifacts[parent_id] = {};
    }

    if (virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!virtual_cloud_network_bui_sub_artifacts[parent_id].hasOwnProperty('element_position')) {
            virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'] = 0;
        }
        // Calculate Position
        let position = virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'];
        // Increment Icon Position
        virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'] += 1;

        let svg = drawArtifact(newSecurityListDefinition(artifact, position));

        let rect = d3.select('#' + id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        /*
         Add click event to display properties
         Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
         Add dragevent versions
         Set common attributes on svg element and children
         */
        svg.on("click", function () {
            loadSecurityListProperties(id);
            d3.event.stopPropagation();
        });
    } else {
        console.warn(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
    console.groupEnd();
}

/*
** Property Sheet Load function
 */
// TODO: Delete
function loadSecurityListPropertiesDeprecated(id) {
    $("#properties").load("propertysheets/security_list.html", function () {
        if ('security_lists' in okitJson) {
            console.info('Loading Security List: ' + id);
            let json = okitJson['security_lists'];
            for (let i = 0; i < json.length; i++) {
                let security_list = json[i];
                //console.info(JSON.stringify(security_list, null, 2));
                if (security_list['id'] == id) {
                    //console.info('Found Security List: ' + id);
                    security_list['virtual_cloud_network'] = okitIdsJsonObj[security_list['vcn_id']];
                    // Load Properties
                    loadProperties(security_list);
                    // Add Event Listeners
                    addPropertiesEventListeners(security_list, []);
                    // Egress Rules
                    for (let rulecnt = 0; rulecnt < security_list['egress_security_rules'].length; rulecnt++) {
                        addAccessRuleHtml(security_list['egress_security_rules'][rulecnt], 'egress')
                    }
                    // Ingress Rules
                    for (let rulecnt = 0; rulecnt < security_list['ingress_security_rules'].length; rulecnt++) {
                        addAccessRuleHtml(security_list['ingress_security_rules'][rulecnt], 'ingress')
                    }
                    // Add Handler to Add Button
                    document.getElementById('egress_add_button').addEventListener('click', handleAddAccessRule, false);
                    document.getElementById('egress_add_button').security_list = security_list;
                    document.getElementById('ingress_add_button').addEventListener('click', handleAddAccessRule, false);
                    document.getElementById('ingress_add_button').security_list = security_list;
                    break;
                }
            }
        }
    });
}

// TODO: Delete
function addAccessRuleHtmlDeprecated(access_rule, access_type) {
    // default to ingress rules
    let rules_table_body = d3.select('#ingress_rules_table_body');
    let rules_count = $('#ingress_rules_table_body > tr').length;
    let source_dest = 'source';
    let source_dest_title = 'Source';
    if (access_type == 'egress') {
        rules_table_body = d3.select('#egress_rules_table_body');
        rules_count = $('#egress_rules_table_body > tr').length;
        source_dest = 'destination';
        source_dest_title = 'Destination';
    }
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
    rule_cell.append('input')
        .attr("type", "button")
        .attr("class", "delete-button")
        .attr("value", "-")
        .attr("onclick", "handleDeleteRouteRulesRow(this)");
    // Destination / Source Type
    rule_row = rule_table.append('tr');
    rule_cell = rule_row.append('td')
        .text(source_dest_title + " Type");
    rule_cell = rule_row.append('td');
    rule_cell.append('input')
        .attr("type", "text")
        .attr("class", "property-value")
        .attr("readonly", "readonly")
        .attr("id", source_dest + "_type")
        .attr("name", source_dest + "_type")
        .attr("value", access_rule[source_dest + '_type'])
        .on("change", function() {
            access_rule[source_dest + '_type'] = this.value;
            displayOkitJson();
        });
    // Stateful
    rule_row = rule_table.append('tr');
    rule_cell = rule_row.append('td');
    rule_cell = rule_row.append('td');
    rule_cell.append('input')
        .attr("type", "checkbox")
        .attr("id", "is_stateless")
        .attr("name", "is_stateless")
        .on("change", function() {
            access_rule['is_stateless'] = this.checked;
            console.info('Changed is_stateless: ' + this.checked);
            displayOkitJson();
        });
    if (access_rule['is_stateless']) {
        rule_cell.attr("checked", access_rule['is_stateless']);
    }
    rule_cell.append('label')
        .attr("class", "property-value")
        .text('Stateless');
    // Destination / Source
    rule_row = rule_table.append('tr');
    rule_cell = rule_row.append('td')
        .text(source_dest_title);
    rule_cell = rule_row.append('td');
    rule_cell.append('input')
        .attr("type", "text")
        .attr("class", "property-value")
        .attr("id", source_dest)
        .attr("name", source_dest)
        .attr("value", access_rule[source_dest])
        .on("change", function() {
            access_rule[source_dest] = this.value;
            console.info('Changed destination: ' + this.value);
            displayOkitJson();
        });
    // Add Protocol
    rule_row = rule_table.append('tr');
    rule_cell = rule_row.append('td')
        .text("Protocol");
    rule_cell = rule_row.append('td');
    let protocol_select = rule_cell.append('select')
        .attr("class", "property-value")
        .attr("id", "protocol")
        .on("change", function() {
            access_rule['protocol'] = this.options[this.selectedIndex].value;
            console.info('Changed network_entity_id ' + this.selectedIndex);
            displayOkitJson();
        });
    // Add Protocol Options
    let protocols = {
        'All': 'all',
        'ICMP': '1',
        'TCP': '6',
        'UDP': '17'
    };
    for (let key in protocols) {
        if (protocols.hasOwnProperty(key)) {
            let opt = protocol_select.append('option')
                .attr("value", protocols[key])
                .text(key);
            if (access_rule['protocol'] == protocols[key]) {
                opt.attr("selected", "selected");
            }
        }
    }
    if (access_rule['protocol'] == '') {
        access_rule['protocol'] = protocol_select.node().options[protocol_select.node().selectedIndex].value;
    }
}

// TODO: Delete
function handleAddAccessRuleDeprecated(evt) {
    console.info('Adding access rule');
    let new_rule = { "protocol": "all", "is_stateless": false}
    if (evt.target.id == 'egress_add_button') {
        new_rule["destination_type"] = "CIDR_BLOCK";
        new_rule["destination"] = "0.0.0.0/0";
        evt.target.security_list['egress_security_rules'].push(new_rule)
    } else {
        new_rule["source_type"] = "CIDR_BLOCK";
        new_rule["source"] = "0.0.0.0/0";
        evt.target.security_list['ingress_security_rules'].push(new_rule)
    }
    addAccessRuleHtml(new_rule, evt.target.id.split('_')[0]);
    displayOkitJson();
}

// TODO: Delete
function handleDeleteRouteRulesRowDeprecated(btn) {
    let row = btn.parentNode.parentNode.parentNode.parentNode.parentNode;
    row.parentNode.removeChild(row);
}


/*
** Query OCI
 */

function querySecurityListAjax(compartment_id, vcn_id) {
    console.info('------------- querySecurityListAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('security_list_filter' in okitQueryRequestJson) {
        request_json['security_list_filter'] = okitQueryRequestJson['security_list_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/SecurityList',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            okitJson['security_lists'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('querySecurityListAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + security_list_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

// TODO: Delete
function addDefaultSecurityListRulesDeprecated(id, vcn_cidr_block='10.0.0.0/16') {
    console.info('Adding Default Security List Rules for ' + id);
    for (let security_list of okitJson['security_lists']) {
        if (id == security_list.id) {
            // Add Egress Rule
            security_list.egress_security_rules.push(
                {
                    "destination": "0.0.0.0/0",
                    "destination_type": "CIDR_BLOCK",
                    "icmp_options": null,
                    "is_stateless": false,
                    "protocol": "all",
                    "tcp_options": null,
                    "udp_options": null
                }
            );
            // Ingress Rules
            security_list.ingress_security_rules.push(
                {
                    "icmp_options": null,
                    "is_stateless": false,
                    "protocol": "6",
                    "source": "0.0.0.0/0",
                    "source_type": "CIDR_BLOCK",
                    "tcp_options": {
                        "destination_port_range": {
                            "max": 22,
                            "min": 22
                        },
                        "source_port_range": null
                    },
                    "udp_options": null
                }
            );
            security_list.ingress_security_rules.push(
                {
                    "icmp_options": {
                        "code": 4,
                        "type": 3
                    },
                    "is_stateless": false,
                    "protocol": "1",
                    "source": "0.0.0.0/0",
                    "source_type": "CIDR_BLOCK",
                    "tcp_options": null,
                    "udp_options": null
                }
            );
            security_list.ingress_security_rules.push(
                {
                    "icmp_options": {
                        "code": null,
                        "type": 3
                    },
                    "is_stateless": false,
                    "protocol": "1",
                    "source": vcn_cidr_block,
                    "source_type": "CIDR_BLOCK",
                    "tcp_options": null,
                    "udp_options": null
                }
            );
            break;
        }
    }
}

$(document).ready(function() {
    clearSecurityListVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', security_list_query_cb);
    cell.append('label').text(security_list_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(security_list_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'security_list_name_filter')
        .attr('name', 'security_list_name_filter');
});















/*
** Define Security List Class
 */
class SecurityList extends OkitSvgArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        // Configure default values
        this.id = 'okit-' + security_list_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(security_list_prefix, okitjson.security_lists.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.egress_security_rules = [];
        this.ingress_security_rules = [];
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
        return new SecurityList(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return security_list_artifact;
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
            for (let i=0; i < subnet.security_list_ids.length; i++) {
                if (subnet.security_list_ids[i] === this.id) {
                    subnet.security_list_ids.splice(i, 1);
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
        definition['rect']['stroke']['colour'] = security_list_stroke_colour;
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
                if (subnet.security_list_ids.includes(this.id)) {
                    console.info(this.display_name + ' attached to subnet '+ subnet.display_name);
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
        $("#properties").load("propertysheets/security_list.html", function () {
            // Load Referenced Ids
            // Load Properties
            loadProperties(me);
            // Add Event Listeners
            addPropertiesEventListeners(me, []);
            // Egress Rules
            for (let security_rule of me.egress_security_rules) {
                me.addAccessRuleHtml(security_rule, 'egress');
            }
            // Ingress Rules
            for (let security_rule of me.ingress_security_rules) {
                me.addAccessRuleHtml(security_rule, 'ingress');
            }
            // Add Handler to Add Button
            document.getElementById('egress_add_button').addEventListener('click', me.handleAddEgressRule, false);
            document.getElementById('egress_add_button').security_list = me;
            document.getElementById('ingress_add_button').addEventListener('click', me.handleAddIngressRule, false);
            document.getElementById('ingress_add_button').security_list = me;
        });
    }

    handleAddEgressRule(evt) {
        console.info('Adding Egress rule');
        let new_rule = { "protocol": "all", "is_stateless": false}
        new_rule["destination_type"] = "CIDR_BLOCK";
        new_rule["destination"] = "0.0.0.0/0";
        evt.target.security_list.egress_security_rules.push(new_rule)
        evt.target.security_list.addAccessRuleHtml(new_rule, 'egress');
        displayOkitJson();
    }

    handleAddIngressRule(evt) {
        console.info('Adding Ingress rule');
        let new_rule = { "protocol": "all", "is_stateless": false}
        new_rule["source_type"] = "CIDR_BLOCK";
        new_rule["source"] = "0.0.0.0/0";
        evt.target.security_list.ingress_security_rules.push(new_rule)
        evt.target.security_list.addAccessRuleHtml(new_rule, 'ingress');
        displayOkitJson();
    }

    handleDeleteEgressRulesRow(evt) {
        let row = evt.target.parentNode.parentNode.parentNode.parentNode.parentNode;
        row.parentNode.removeChild(row);
        evt.target.security_list.egress_security_rules.splice(evt.target.security_list.rule_num, 1);
        displayOkitJson();
    }

    handleDeleteIngressRulesRow(evt) {
        let row = evt.target.parentNode.parentNode.parentNode.parentNode.parentNode;
        row.parentNode.removeChild(row);
        evt.target.security_list.ingress_security_rules.splice(evt.target.security_list.rule_num, 1);
        displayOkitJson();
    }

    addAccessRuleHtml(access_rule, access_type) {
        // default to ingress rules
        let rules_table_body = d3.select('#ingress_rules_table_body');
        let rules_count = $('#ingress_rules_table_body > tr').length;
        let source_dest = 'source';
        let source_dest_title = 'Source';
        if (access_type === 'egress') {
            rules_table_body = d3.select('#egress_rules_table_body');
            rules_count = $('#egress_rules_table_body > tr').length;
            source_dest = 'destination';
            source_dest_title = 'Destination';
        }
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
        if (access_type === 'egress') {
            delete_btn.node().addEventListener("click", this.handleDeleteEgressRulesRow, false);
        } else {
            delete_btn.node().addEventListener("click", this.handleDeleteIngressRulesRow, false);
        }
        delete_btn.node().security_list = this;
        delete_btn.node().rule_num = rule_num;
        // Destination / Source Type
        rule_row = rule_table.append('tr');
        rule_cell = rule_row.append('td')
            .text(source_dest_title + " Type");
        rule_cell = rule_row.append('td');
        rule_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("readonly", "readonly")
            .attr("id", source_dest + "_type")
            .attr("name", source_dest + "_type")
            .attr("value", access_rule[source_dest + '_type'])
            .on("change", function() {
                access_rule[source_dest + '_type'] = this.value;
                displayOkitJson();
            });
        // Stateful
        rule_row = rule_table.append('tr');
        rule_cell = rule_row.append('td');
        rule_cell = rule_row.append('td');
        rule_cell.append('input')
            .attr("type", "checkbox")
            .attr("id", "is_stateless")
            .attr("name", "is_stateless")
            .on("change", function() {
                access_rule['is_stateless'] = this.checked;
                console.info('Changed is_stateless: ' + this.checked);
                displayOkitJson();
            });
        if (access_rule['is_stateless']) {
            rule_cell.attr("checked", access_rule['is_stateless']);
        }
        rule_cell.append('label')
            .attr("class", "property-value")
            .text('Stateless');
        // Destination / Source
        rule_row = rule_table.append('tr');
        rule_cell = rule_row.append('td')
            .text(source_dest_title);
        rule_cell = rule_row.append('td');
        rule_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", source_dest)
            .attr("name", source_dest)
            .attr("value", access_rule[source_dest])
            .on("change", function() {
                access_rule[source_dest] = this.value;
                console.info('Changed destination: ' + this.value);
                displayOkitJson();
            });
        // Add Protocol
        rule_row = rule_table.append('tr');
        rule_cell = rule_row.append('td')
            .text("Protocol");
        rule_cell = rule_row.append('td');
        let protocol_select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "protocol")
            .on("change", function() {
                access_rule['protocol'] = this.options[this.selectedIndex].value;
                console.info('Changed network_entity_id ' + this.selectedIndex);
                displayOkitJson();
            });
        // Add Protocol Options
        let protocols = {
            'All': 'all',
            'ICMP': '1',
            'TCP': '6',
            'UDP': '17'
        };
        for (let key in protocols) {
            if (protocols.hasOwnProperty(key)) {
                let opt = protocol_select.append('option')
                    .attr("value", protocols[key])
                    .text(key);
                if (access_rule['protocol'] == protocols[key]) {
                    opt.attr("selected", "selected");
                }
            }
        }
        if (access_rule['protocol'] == '') {
            access_rule['protocol'] = protocol_select.node().options[protocol_select.node().selectedIndex].value;
        }
    }


    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        // Return list of Artifact names
        return [];
    }


    /*
    ** Artifact Specific Functions
     */
    addDefaultSecurityListRules(vcn_cidr_block='10.0.0.0/16') {
        console.info('Adding Default Security List Rules for ' + this.id);
        // Add Egress Rule
        this.egress_security_rules.push(
            {
                "destination": "0.0.0.0/0",
                "destination_type": "CIDR_BLOCK",
                "icmp_options": null,
                "is_stateless": false,
                "protocol": "all",
                "tcp_options": null,
                "udp_options": null
            }
        );
        // Ingress Rules
        this.ingress_security_rules.push(
            {
                "icmp_options": null,
                "is_stateless": false,
                "protocol": "6",
                "source": "0.0.0.0/0",
                "source_type": "CIDR_BLOCK",
                "tcp_options": {
                    "destination_port_range": {
                        "max": 22,
                        "min": 22
                    },
                    "source_port_range": null
                },
                "udp_options": null
            }
        );
        this.ingress_security_rules.push(
            {
                "icmp_options": {
                    "code": 4,
                    "type": 3
                },
                "is_stateless": false,
                "protocol": "1",
                "source": "0.0.0.0/0",
                "source_type": "CIDR_BLOCK",
                "tcp_options": null,
                "udp_options": null
            }
        );
        this.ingress_security_rules.push(
            {
                "icmp_options": {
                    "code": null,
                    "type": 3
                },
                "is_stateless": false,
                "protocol": "1",
                "source": vcn_cidr_block,
                "source_type": "CIDR_BLOCK",
                "tcp_options": null,
                "udp_options": null
            }
        );
    }
}

