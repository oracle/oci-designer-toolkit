console.log('Loaded Subnet Javascript');

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
let security_list_count = 0;

/*
** Reset variables
 */

function clearSecurityListVariables() {
    security_list_ids = [];
    security_list_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addSecurityList(vcn_id, compartment_id) {
    let id = 'okit-' + security_list_prefix + '-' + uuidv4();
    console.log('Adding Security List : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!OKITJsonObj.hasOwnProperty('security_lists')) {
        OKITJsonObj['security_lists'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    security_list_ids.push(id);

    // Increment Count
    security_list_count += 1;
    let security_list = {};
    security_list['vcn_id'] = vcn_id;
    security_list['virtual_cloud_network'] = '';
    security_list['compartment_id'] = compartment_id;
    security_list['id'] = id;
    security_list['display_name'] = generateDefaultName(security_list_prefix, security_list_count);
    security_list['egress_security_rules'] = []
    security_list['ingress_security_rules'] = []
    OKITJsonObj['security_lists'].push(security_list);
    okitIdsJsonObj[id] = security_list['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    //console.log(security_list_ids);
    displayOkitJson();
    drawSecurityListSVG(security_list);
    loadSecurityListProperties(id);
}

/*
** Delete From JSON Model
 */

function deleteSecurityList(id) {
    console.log('Delete Security List ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < OKITJsonObj['security_lists'].length; i++) {
        if (OKITJsonObj['security_lists'][i]['id'] == id) {
            OKITJsonObj['security_lists'].splice(i, 1);
        }
    }
    // Remove Subnet references
    if ('subnets' in OKITJsonObj) {
        for (subnet of OKITJsonObj['subnets']) {
            for (let i=0; i < subnet['security_list_ids'].length; i++) {
                if (subnet['security_list_ids'][i] == id) {
                    subnet['security_list_ids'].splice(i, 1);
                }
            }
        }
    }
}

/*
** SVG Creation
 */
function drawSecurityListSVG(artifact) {
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.log('Drawing ' + security_list_artifact + ' : ' + id + ' [' + parent_id + ']');

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

        let svg_x = Math.round(icon_width + (icon_width * position) + (vcn_icon_spacing * position));
        let svg_y = Math.round(icon_height * 3 / 2);
        let svg_width = icon_width;
        let svg_height = icon_height;
        let data_type = security_list_artifact;
        let stroke_colour = security_list_stroke_colour;
        let stroke_dash = 1;

        let svg = drawArtifactSVG(artifact, data_type, svg_x, svg_y, svg_width, svg_height, stroke_colour, stroke_dash);

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
        })
            .on("mousedown", handleConnectorDragStart)
            .on("mousemove", handleConnectorDrag)
            .on("mouseup", handleConnectorDrop)
            .on("mouseover", handleConnectorDragEnter)
            .on("mouseout", handleConnectorDragLeave)
            .on("dragstart", handleConnectorDragStart)
            .on("drop", handleConnectorDrop)
            .on("dragenter", handleConnectorDragEnter)
            .on("dragleave", handleConnectorDragLeave)
            .on("contextmenu", handleContextMenu)
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-type", data_type)
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true);
    } else {
        console.log(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
}

// TODO: Delete
function drawSecurityListSVGOrig(security_list) {
    let parent_id = security_list['vcn_id'];
    let id = security_list['id'];
    let compartment_id = security_list['compartment_id'];
    console.log('Drawing Security List : ' + id);
    if (virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        let position = virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'];
        let svg_x = Math.round((icon_width / 2) + (icon_width * position) + (vcn_icon_spacing * position));
        let svg_y = Math.round(icon_height * 3 / 4);
        let data_type = security_list_artifact;

        // Increment Icon Position
        virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'] += 1;

        let parent_svg = d3.select('#' + parent_id + "-svg");
        let svg = parent_svg.append("svg")
            .attr("id", id + '-svg')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", security_list['display_name'])
            .attr("x", svg_x)
            .attr("y", svg_y)
            .attr("width", "100")
            .attr("height", "100");
        let rect = svg.append("rect")
            .attr("id", id)
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", security_list['display_name'])
            .attr("x", icon_x)
            .attr("y", icon_y)
            .attr("width", icon_width)
            .attr("height", icon_height)
            .attr("stroke", security_list_stroke_colour)
            .attr("stroke-dasharray", "1, 1")
            .attr("fill", "white")
            .attr("style", "fill-opacity: .25;");
        rect.append("title")
            .attr("id", id + '-title')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .text("Security List: " + security_list['display_name']);
        let g = svg.append("g")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
        g.append("path")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("class", "st0")
            .attr("d", "M144,85.5l-43.8,18.8v41.8v0.1c1.3,23.2,18.4,43.6,43.8,56.3c25.5-12.7,42.5-33.1,43.8-56.3v-0.1v-41.8L144,85.5z M151.3,161.8h-31.5v-4.3h31.5V161.8z M151.3,144.7h-31.5v-4.3h31.5V144.7z M151.3,126.6h-31.5v-4.3h31.5V126.6zM170.4,155.8l-7.7,7.7l-4.9-4.9c-0.6-0.6-0.6-1.5,0-2c0.6-0.6,1.5-0.6,2,0l2.8,2.8l5.6-5.6c0.6-0.6,1.5-0.6,2,0C171,154.3,171,155.2,170.4,155.8z M159.4,138.6c-0.6-0.6-0.6-1.5,0-2c0.6-0.6,1.5-0.6,2,0l3,3l3-3c0.6-0.6,1.5-0.6,2,0c0.6,0.6,0.6,1.5,0,2l-3,3l3,3c0.6,0.6,0.6,1.5,0,2c-0.3,0.3-0.6,0.4-1,0.4c-0.4,0-0.7-0.1-1-0.4l-3-3l-3,3c-0.3,0.3-0.6,0.4-1,0.4c-0.4,0-0.7-0.1-1-0.4c-0.6-0.6-0.6-1.5,0-2l3-3L159.4,138.6z M170.7,121.9l-7.7,7.7l-4.9-4.9c-0.6-0.6-0.6-1.5,0-2c0.6-0.6,1.5-0.6,2,0l2.8,2.8l5.6-5.6c0.6-0.6,1.5-0.6,2,0C171.2,120.4,171.2,121.3,170.7,121.9z")

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
        })
            .on("mousedown", handleConnectorDragStart)
            .on("mousemove", handleConnectorDrag)
            .on("mouseup", handleConnectorDrop)
            .on("mouseover", handleConnectorDragEnter)
            .on("mouseout", handleConnectorDragLeave)
            .on("dragstart", handleConnectorDragStart)
            .on("drop", handleConnectorDrop)
            .on("dragenter", handleConnectorDragEnter)
            .on("dragleave", handleConnectorDragLeave)
            .on("contextmenu", handleContextMenu)
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parentid", parent_id)
            .attr("data-compartment-id", compartment_id)
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parentid", parent_id)
            .attr("data-compartment-id", compartment_id)
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true);
    } else {
        console.log(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
}

/*
** Property Sheet Load function
 */
function loadSecurityListProperties(id) {
    $("#properties").load("propertysheets/security_list.html", function () {
        if ('security_lists' in OKITJsonObj) {
            console.log('Loading Security List: ' + id);
            let json = OKITJsonObj['security_lists'];
            for (let i = 0; i < json.length; i++) {
                let security_list = json[i];
                //console.log(JSON.stringify(security_list, null, 2));
                if (security_list['id'] == id) {
                    //console.log('Found Security List: ' + id);
                    security_list['virtual_cloud_network'] = okitIdsJsonObj[security_list['vcn_id']];
                    $("#virtual_cloud_network").html(security_list['virtual_cloud_network']);
                    $('#display_name').val(security_list['display_name']);
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

function addAccessRuleHtml(access_rule, access_type) {
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
        .attr("class", "property-value")
        .attr("id", "is_stateless")
        .attr("name", "is_stateless")
        .on("change", function() {
            access_rule['is_stateless'] = this.checked;
            console.log('Changed is_stateless: ' + this.checked);
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
            console.log('Changed destination: ' + this.value);
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
            console.log('Changed network_entity_id ' + this.selectedIndex);
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

function handleAddAccessRule(evt) {
    console.log('Adding access rule');
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

function handleDeleteRouteRulesRow(btn) {
    let row = btn.parentNode.parentNode.parentNode.parentNode.parentNode;
    row.parentNode.removeChild(row);
}


/*
** Query OCI
 */

function querySecurityListAjax(compartment_id, vcn_id) {
    console.log('------------- querySecurityListAjax --------------------');
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
            OKITJsonObj['security_lists'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.log('querySecurityListAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + security_list_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}

$(document).ready(function() {
    clearSecurityListVariables();

    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', security_list_query_cb);
    cell.append('label').text(security_list_artifact);
});

