/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Properties Javascript');

/*
** Property Sheet Load function
 */

function handlePropertiesDragEnd(e) {
    console.info('Properties Drag End');
}

let asset_propereties_width = 0;
function handlePropertiesMouseDown(e) {
    console.info('Properties Mouse Down : ' + e.target.clientWidth);
    asset_propereties_width = e.target.clientWidth;
}

function handlePropertiesMouseUp(e) {
    console.info('Properties Mouse Up : ' + e.target.clientWidth);
    if (asset_propereties_width != e.target.clientWidth) {
        redrawSVGCanvas();
    }
}

function getDescendantProp(obj, desc) {
    let arr = desc.split('.');
    while (arr.length) {
        obj = obj[arr.shift()];
    }
    return obj;
}

function setDescendantProp(obj, desc, value) {
    let arr = desc.split('.');
    while (arr.length > 1) {
        obj = obj[arr.shift()];
    }
    return obj[arr[0]] = value;
}

let error_properties = [];
let warning_properties = [];

function loadPropertiesSheet(json_element) {
    console.info('Loading Properties - Read Only:', json_element.read_only);
    loadPropertiesSheetInputs(json_element, []);
    if (json_element.read_only) setPropertiesReadOnly();
}

function setPropertiesReadOnly() {
    $(`#${PROPERTIES_PANEL}`).find('input, textarea, select, button, checkbox').not('.documentation').attr('readonly', 'readonly');
    $(`#${PROPERTIES_PANEL}`).find('input, textarea, select, button, checkbox').not('.okit-tab, .documentation').attr('disabled', 'disabled');
}

function loadPropertiesSheetInputs(json_element, hierarchy=[]) {
    $.each(json_element, function(key, val) {
        // console.info('Key : ' + key + ' = ' + val);
        if (val == null) {
            // console.info('Ignoring NULL Property ' + key);
            return true;
        } else if (Array.isArray(val) && val.some((e) => {return (typeof e === 'object')})) {
            // console.info('Ignoring Object Array Property ' + key);
        } else if (typeof val === 'object' && !Array.isArray(val)) {
            // console.info('Processing Object Property ' + key);
            loadPropertiesSheetInputs(val);
        } else if (typeof val === 'function') {
            // console.info('Ignoring Function Property ' + key);
            return true;
        } else if ($(jqId(key)).is("input:text")) {                     // Text
            // console.info(key + ' is input:text.');
            $(jqId(key)).val(val);
            $(jqId(key)).on('input', () => {
                const pattern = $(jqId(key)).attr('pattern');
                const input_val = $(jqId(key)).val()
                if (pattern) {
                    const regex = new RegExp(pattern)
                    console.info(key, 'Matches', pattern, regex.test(input_val))
                    if (!regex.test(input_val)) return false
                }
                if (Array.isArray(val)) json_element[key] = $(jqId(key)).val().split(',');
                else json_element[key] = $(jqId(key)).val();
                if (key === 'display_name' || key === 'name') {
                    json_element['display_name'] = json_element[key];
                    json_element['name'] = json_element[key];
                    $(jqId(json_element['id'] + '-title')).text(json_element[key]);
                    $(jqId(json_element['id'] + '-display-name')).text(json_element[key]);
                }
            });
        } else if ($(jqId(key)).is('input[type="number"]')) {                     // Number
            // console.info(key + ' is input:number.');
            $(jqId(key)).val(val);
            $(jqId(key)).on('input', () => {
                json_element[key] = $(jqId(key)).val();
            });
        } else if ($(jqId(key)).is("input:checkbox")) {                // CheckBox
            // console.info(key + ' is input:checkbox.');
            $(jqId(key)).on('input', () => {json_element[key] = $(jqId(key)).is(':checked'); redrawSVGCanvas();});
            $(jqId(key)).attr('checked', val);
        } else if ($(jqId(key)).is('div[class="okit-multiple-select"]')) { // Multiple Select
            // console.info(key + ' is multiple select with value ' + val);
            $(jqId(key)).find("input:checkbox").each(function() {
                $(this).on('input', () => {
                    json_element[key] = [];
                    $(jqId(key)).find("input:checkbox").each(function() {
                        if ($(this).prop('checked')) {json_element[key].push($(this).val());}
                    });
                    redrawSVGCanvas(true);
                });
                if (val.includes($(this).val())) {$(this).prop("checked", true);}
            });
        } else if ($(jqId(key)).is("select")) {                        // Select
            // console.info(key + ' is select with value ' + val);
            $(jqId(key)).on('change', () => {json_element[key] = $(jqId(key)).val() ? $(jqId(key)).val() : ''; $(jqId(key)).removeClass('okit-warning'); redrawSVGCanvas(true);});
            $(jqId(key)).val(val);
            if (!$(jqId(key)).val() && !Array.isArray(val) && String(val).trim() !== '') {
                console.warn(`Value ${val} not in select list ${key}`);
                $(jqId(key)).addClass('okit-warning');
                $(jqId(key)).change();
            } else if (!val || (!Array.isArray(val) && String(val).trim() === '')) {
                $(jqId(key)).val($(jqId(key) + ' option:first').val());
                json_element[key] = $(jqId(key)).val() ? $(jqId(key)).val() : '';
                console.info(`Value unspecified setting ${key} to first entry ${json_element[key]}`);
            }
        } else if ($(jqId(key)).is("label")) {                         // Label
            console.info(key + ' is label.');
            if (key.endsWith('_id')) {
                // Get Artifact Associated With Id
                let artefact_type = key.substr(0, (key.length - 3));
                // console.info('Label : Artifact Type ' + titleCase(artefact_type) + ' - ' + key);
                $(jqId(key)).html(okitJsonView['get' + titleCase(artefact_type)](val).display_name);
            } else {
                $(jqId(key)).html(val);
            }
        } else if ($(jqId(key)).is("textarea")) {                     // Text Area
            // console.info(key + ' is textarea.');
            $(jqId(key)).val(val);
            $(jqId(key)).on('change', () => {json_element[key] = $(jqId(key)).val();});
        } else if ($(jqId(key)).is("div")) {
            // console.info(key + ' is div.');
            loadPropertiesSheetInputs(val);
        } else {
            console.info(`Ignoring Property ${key} No Corresponding HTML Element Found.`);
            return true;
        }
    });
    addClickHandlers(json_element);
    loadTags(json_element);
    // Check status of advanced options
    console.info('Checking if Optional Should be open ' + okitSettings.is_optional_expanded);
    if (okitSettings.is_optional_expanded) {
        d3.select(d3Id("optional_properties")).attr("open", "open");
    }
    // Check for Errors & Warnings
    for (let property_name of error_properties) {
        $(jqId(property_name)).addClass('okit-error');
        $(jqId(property_name)).focus();
    }
    error_properties = [];
    for (let property_name of warning_properties) {
        $(jqId(property_name)).addClass('okit-warning');
    }
    warning_properties = [];
    // Set up Multi Select boxes to toggle select
    //$("select[multiple] option").mousedown(function() {let $self = $(this); $self.prop('selected', !$self.prop('selected')); return false;});

    // Add Highlight functions
    $(jqId('property-editor')).mouseenter(function() {$(jqId($('#id').val())).addClass('highlight-properties');});
    $(jqId('property-editor')).mouseleave(function() {$(jqId($('#id').val())).removeClass('highlight-properties');});
    // Display OCID if required
    if (okitSettings && okitSettings.show_ocids) {$(jqId('id_row')).removeClass('collapsed');}
}

/*
** Tag Processing
*/
function addClickHandlers(json_element) {
    // Add Click Handlers
    $(jqId('add_freeform_tag')).off('click'); // Remove Any Existing Events
    $(jqId('add_freeform_tag')).on('click',() => {handleAddFreeformTag(json_element);});
    $(jqId('add_defined_tag')).off('click'); // Remove Any Existing Events
    $(jqId('add_defined_tag')).on('click',() => {handleAddDefinedTag(json_element);});
}
function loadTags(json_element) {
    // Load tags
    $('#freeform_tags_tbody').empty()
    $('#defined_tags_tbody').empty()
    if (json_element.freeform_tags) {
        const tbody = d3.select('#freeform_tags_tbody')
        for (const [key, value] of Object.entries(json_element.freeform_tags)) {
            let tr = tbody.append('div').attr('class', 'tr')
            tr.append('div').attr('class', 'td').append('label').text(key)
            tr.append('div').attr('class', 'td').append('label').text(value)
            tr.append('div').attr('class', 'td delete-tag action-button-background delete').on('click', (event) => {
                delete json_element.freeform_tags[key];
                loadTags(json_element)
                event = d3.event // Temp Work around for v0.67.0 release
                event.stopPropagation() // event replaces d3.event
            })
        }
    }
    if (json_element.defined_tags) {
        const tbody = d3.select('#defined_tags_tbody')
        for (const [namespace, tags] of Object.entries(json_element.defined_tags)) {
            for (const [key, value] of Object.entries(tags)) {
                let tr = tbody.append('div').attr('class', 'tr')
                tr.append('div').attr('class', 'td').append('label').text(namespace)
                tr.append('div').attr('class', 'td').append('label').text(key)
                tr.append('div').attr('class', 'td').append('label').text(value)
                tr.append('div').attr('class', 'td  delete-tag action-button-background delete').on('click', (event) => {
                    delete json_element.defined_tags[namespace][key];
                    if (Object.keys(json_element.defined_tags[namespace]).length === 0) {delete json_element.defined_tags[namespace];}
                    loadTags(json_element)
                    event = d3.event // Temp Work around for v0.67.0 release
                    event.stopPropagation() // event replaces d3.event
                })
            }
        }
    }
}

function handleAddFreeformTag(json_element, callback=loadTags) {
    console.info('Adding Freeform Tag')
    $('#data_entry_panel_title').text('Add Freeform Tag')
    $('#data_entry_panel_body').empty()
    $('#data_entry_panel_footer').empty()
    // Add input elements
    const body = d3.select('#data_entry_panel_body')
    let div = body.append('div').attr('class', 'okit-data-entry-text-property')
    div.append('div').append('label').text('Key')
    div.append('div').append('input').attr('type', 'text').attr('id', 'gdep_tag_key').attr('placeholder', 'Tag Key (No white space)')
    div = body.append('div').attr('class', 'okit-data-entry-text-property')
    div.append('div').append('label').text('Value')
    div.append('div').append('input').attr('type', 'text').attr('id', 'gdep_tag_value').attr('placeholder', 'Tag Value')
    // Add Footer button
    const footer = d3.select('#data_entry_panel_footer')
    footer.append('div').append('button').attr('type', 'button').text('Add Tag').on('click', () => {
        const key = $('#gdep_tag_key').val().replace(/\s+/g, '_')
        const val = $('#gdep_tag_value').val()
        if (key.length > 0 && val.length > 0) json_element.freeform_tags[key] = val
        callback(json_element)
        $('#data_entry_panel').addClass('okit-slide-hide-right')
    })
    // Display Panel
    $('#data_entry_panel').removeClass('okit-slide-hide-right')
}
function handleAddDefinedTag(json_element, callback=loadTags) {
    console.info('Adding Global Defined Tag')
    $('#data_entry_panel_title').text('Add Defined Tag')
    $('#data_entry_panel_body').empty()
    $('#data_entry_panel_footer').empty()
    // Add input elements
    const body = d3.select('#data_entry_panel_body')
    let div = body.append('div').attr('class', 'okit-data-entry-text-property')
    div.append('div').append('label').text('Namespace')
    div.append('div').append('input').attr('type', 'text').attr('id', 'gdep_tag_namespace').attr('placeholder', 'Tag Namespace (No white space)').attr('list', 'global_tag_namespaces')
    const global_tag_namespaces = div.append('datalist').attr('id', 'global_tag_namespaces')
    if (json_element.defined_tags) Object.keys(json_element.defined_tags).forEach((namespace) => global_tag_namespaces.append('option').attr('value', namespace))
    div = body.append('div').attr('class', 'okit-data-entry-text-property')
    div.append('div').append('label').text('Key')
    div.append('div').append('input').attr('type', 'text').attr('id', 'gdep_tag_key').attr('placeholder', 'Tag Key (No white space)')
    div = body.append('div').attr('class', 'okit-data-entry-text-property')
    div.append('div').append('label').text('Value')
    div.append('div').append('input').attr('type', 'text').attr('id', 'gdep_tag_value').attr('placeholder', 'Tag Value')
    // Add Footer button
    const footer = d3.select('#data_entry_panel_footer')
    footer.append('div').append('button').attr('type', 'button').text('Add Tag').on('click', () => {
        const namespace = $('#gdep_tag_namespace').val().replace(/\s+/g, '_')
        const key = $('#gdep_tag_key').val().replace(/\s+/g, '_')
        const val = $('#gdep_tag_value').val()
        if (namespace.length > 0 && key.length > 0 && val.length > 0) json_element.defined_tags[namespace] ? json_element.defined_tags[namespace][key] = val : json_element.defined_tags[namespace] = {key: val}
        callback(json_element)
        $('#data_entry_panel').addClass('okit-slide-hide-right')
    })
    // Display Panel
    $('#data_entry_panel').removeClass('okit-slide-hide-right')
}
