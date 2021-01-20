/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Properties Javascript');

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
    console.log('Loading Properties');
    $.each(json_element, function(key, val) {
        console.info('Key : ' + key + ' = ' + val);
        if (val == null) {
            console.info('Ignoring NULL Property ' + key);
            return true;
        } else if (Array.isArray(val) && val.some((e) => {return (typeof e === 'object')})) {
            console.info('Ignoring Object Array Property ' + key);
        } else if (typeof val === 'object' && !Array.isArray(val)) {
            console.info('Processing Object Property ' + key);
            loadPropertiesSheet(val);
        } else if (typeof val === 'function') {
            console.info('Ignoring Function Property ' + key);
            return true;
        } else if ($(jqId(key)).is("input:text")) {                     // Text
            console.info(key + ' is input:text.');
            $(jqId(key)).val(val);
            $(jqId(key)).on('input', () => {
                json_element[key] = $(jqId(key)).val();
                if (key === 'display_name' || key === 'name') {
                    json_element['display_name'] = json_element[key];
                    json_element['name'] = json_element[key];
                    $(jqId(json_element['id'] + '-title')).text(json_element[key]);
                    $(jqId(json_element['id'] + '-display-name')).text(json_element[key]);
                }
            });
        } else if ($(jqId(key)).is('input[type="number"]')) {                     // Number
            console.info(key + ' is input:number.');
            $(jqId(key)).val(val);
            $(jqId(key)).on('input', () => {
                json_element[key] = $(jqId(key)).val();
            });
        } else if ($(jqId(key)).is("input:checkbox")) {                // CheckBox
            console.info(key + ' is input:checkbox.');
            $(jqId(key)).on('input', () => {json_element[key] = $(jqId(key)).is(':checked'); redrawSVGCanvas();});
            $(jqId(key)).attr('checked', val);
        } else if ($(jqId(key)).is('div[class="okit-multiple-select"]')) { // Multiple Select
            console.info(key + ' is multiple select with value ' + val);
            $(jqId(key)).find("input:checkbox").each(function() {
                $(this).on('input', () => {
                    json_element[key] = [];
                    $(jqId(key)).find("input:checkbox").each(function() {
                        if ($(this).prop('checked')) {json_element[key].push($(this).val());}
                    });
                    redrawSVGCanvas();
                });
                if (val.includes($(this).val())) {$(this).prop("checked", true);}
            });
        } else if ($(jqId(key)).is("select")) {                        // Select
            console.info(key + ' is select with value ' + val);
            $(jqId(key)).on('change', () => {json_element[key] = $(jqId(key)).val() ? $(jqId(key)).val() : ''; $(jqId(key)).removeClass('okit-warning'); redrawSVGCanvas();});
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
                console.info('Label : Artifact Type ' + titleCase(artefact_type) + ' - ' + key);
                $(jqId(key)).html(okitJsonView['get' + titleCase(artefact_type)](val).display_name);
            } else {
                $(jqId(key)).html(val);
            }
        } else if ($(jqId(key)).is("textarea")) {                     // Text Area
            console.info(key + ' is textarea.');
            $(jqId(key)).val(val);
            $(jqId(key)).on('change', () => {json_element[key] = $(jqId(key)).val();});
        } else if ($(jqId(key)).is("div")) {
            console.info(key + ' is div.');
            loadPropertiesSheet(val);
        } else {
            console.info(`Ignoring Property ${key} No Corresponding HTML Element Found.`);
            return true;
        }
    });
    console.info('Loading Freeform Tags');
    if (json_element.hasOwnProperty('freeform_tags')) {
        $(jqId('freeform_tags')).empty();
        let tbody = d3.select(d3Id('freeform_tags'));
        for (const [key, value] of Object.entries(json_element.freeform_tags)) {
            console.info('Key: ' + key + ' Value: ' + value);
            let tr = tbody.append('div').attr('class', 'tr');
            tr.append('div').attr('class', 'td').append('label').text(key);
            tr.append('div').attr('class', 'td').append('label').text(value);
            let button = tr.append('div').attr('class', 'td').append('button')
                .attr('class', 'okit-delete-button')
                .attr('type', 'button')
                .text('X');
            button.on('click', function() {
                delete json_element.freeform_tags[key];
                loadPropertiesSheet(json_element);
                d3.event.stopPropagation();
            });
        }
    }
    // Add Freeform Tag "Add Row" Handler
    $(jqId('add_freeform_tag')).off('click'); // Remove Any Existing Events
    $(jqId('add_freeform_tag')).on('click',() => {addFreeformTag(json_element);});
    console.info('Loading Defined Tags');
    if (json_element.hasOwnProperty('defined_tags')) {
        $(jqId('defined_tags')).empty();
        let tbody = d3.select(d3Id('defined_tags'));
        for (const [namespace, tags] of Object.entries(json_element.defined_tags)) {
            for (const [key, value] of Object.entries(tags)) {
                console.info('Namespace: ' + namespace + ' Key: ' + key + ' Value: ' + value);
                let tr = tbody.append('div').attr('class', 'tr');
                tr.append('div').attr('class', 'td').append('label').text(namespace);
                tr.append('div').attr('class', 'td').append('label').text(key);
                tr.append('div').attr('class', 'td').append('label').text(value);
                let button = tr.append('div').attr('class', 'td').append('button')
                    .attr('class', 'okit-delete-button')
                    .attr('type', 'button')
                    .text('X');
                button.on('click', function () {
                    delete json_element.defined_tags[namespace][key];
                    if (Object.keys(json_element.defined_tags[namespace]).length === 0) {delete json_element.defined_tags[namespace];}
                    loadPropertiesSheet(json_element);
                    d3.event.stopPropagation();
                });
            }
        }
    }
    // Add Defined Tag "Add Row" Handler
    $(jqId('add_defined_tag')).off('click'); // Remove Any Existing Events
    $(jqId('add_defined_tag')).on('click',() => {addDefinedTag(json_element);});
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

function addFreeformTag(json_element) {
    $(jqId('modal_dialog_title')).text('Add Tag');
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    let tagtable = d3.select(d3Id('modal_dialog_body')).append('div').append('div')
        .attr('class', 'table okit-table okit-modal-dialog-table');
    let thead = tagtable.append('div').attr('class', 'thead');
    let tr = thead.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'th').text('Tag Key');
    tr.append('div').attr('class', 'th').text('Tag Value');
    let tbody = tagtable.append('div').attr('class', 'tbody');
    tr = tbody.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'tag_key')
        .attr('type', 'text');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'tag_value')
        .attr('type', 'text');
    let addbutton = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'add_tag_btn')
        .attr('type', 'button')
        .text('Add Tag');
    addbutton.on("click", function() {
        let key = $(jqId('tag_key')).val().trim();
        let value = $(jqId('tag_value')).val().trim();
        if (/\s/.test(key)) {
            // It has any kind of whitespace
            alert('Whitespace not allowed in key replacing with "_".');
            key = key.replace(/\s+/g, '_');
        }
        if (key.length > 0 && value.length > 0) {
            json_element.freeform_tags[key] = value;
        }
        $(jqId('modal_dialog_wrapper')).addClass('hidden');
        loadPropertiesSheet(json_element);
        displayOkitJson();
        d3.event.stopPropagation();
    });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}

function deleteFreeformTag() {

}

function addDefinedTag(json_element) {
    $(jqId('modal_dialog_title')).text('Add Tag');
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    let tagtable = d3.select(d3Id('modal_dialog_body')).append('div').append('div')
        .attr('class', 'table okit-table okit-modal-dialog-table');
    let thead = tagtable.append('div').attr('class', 'thead');
    let tr = thead.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'th').text('Namespace');
    tr.append('div').attr('class', 'th').text('Tag Key');
    tr.append('div').attr('class', 'th').text('Tag Value');
    let tbody = tagtable.append('div').attr('class', 'tbody');
    tr = tbody.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'tag_namespace')
        .attr('type', 'text');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'tag_key')
        .attr('type', 'text');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'tag_value')
        .attr('type', 'text');
    let addbutton = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'add_tag_btn')
        .attr('type', 'button')
        .text('Add Tag');
    addbutton.on("click", function() {
        let namespace = $(jqId('tag_namespace')).val().trim();
        let key = $(jqId('tag_key')).val().trim();
        let value = $(jqId('tag_value')).val().trim();
        if (/\s/.test(namespace)) {
            // It has any kind of whitespace
            alert('Whitespace not allowed in namespace replacing with "_".');
            namespace = namespace.replace(/\s+/g, '_');
        }
        if (/\s/.test(key)) {
            // It has any kind of whitespace
            alert('Whitespace not allowed in key replacing with "_".');
            key = key.replace(/\s+/g, '_');
        }
        if (namespace.length > 0 && key.length > 0 && value.length > 0) {
            if (!json_element.defined_tags.hasOwnProperty(namespace)) {
                json_element.defined_tags[namespace] = {};
            }
            json_element.defined_tags[namespace][key] = value;
        }
        $(jqId('modal_dialog_wrapper')).addClass('hidden');
        loadPropertiesSheet(json_element);
        displayOkitJson();
        d3.event.stopPropagation();
    });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}

function deleteDefinedTag() {

}
