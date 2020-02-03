/*
** Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
** The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]
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

function loadPropertiesSheet(json_element) {
    console.groupCollapsed('Loading Properties');
    $.each(json_element, function(key, val) {
        //console.info('Key : ' + key + ' = ' + val);
        if ($(jqId(key)).is("input:text")) {
            console.info(key + ' is input:text.');
            $(jqId(key)).val(val);
        } else if ($(jqId(key)).is("input:checkbox")) {
            console.info(key + ' is input:checkbox.');
            $(jqId(key)).attr('checked', val);
        } else if ($(jqId(key)).is("select")) {
            console.info(key + ' is select with value ' + val);
            $(jqId(key)).val(val);
        } else if ($(jqId(key)).is("label")) {
            console.info(key + ' is label.');
            if (key.endsWith('_id')) {
                // Get Artifact Associated With Id
                let artifact_type = key.substr(0, (key.length - 3));
                console.info('Label : Artifact Type ' + titleCase(artifact_type) + ' - ' + key);
                $(jqId(key)).html(okitJson['get' + titleCase(artifact_type)](val).display_name);
            } else {
                $(jqId(key)).html(val);
            }
        } else if ($(jqId(key)).is("textarea")) {
            console.info(key + ' is textarea.');
            $(jqId(key)).val(val);
        } else {
            console.warn(key + ' type unknown')
        }
    });
    console.groupEnd();
}

function addPropertiesEventListeners(json_element, callbacks=[], settings=false) {
    console.groupCollapsed('Adding Property Listeners for ' + json_element.display_name);
    // Default callbacks if not passed
    callbacks = (typeof callbacks !== 'undefined') ? callbacks : [];
    // Add Event Listeners
    // Input Fields
    $('.property-editor-table input').each(
        function(index) {
            let inputfield = $(this);
            inputfield.on('input', function () {
                console.warn('>>>>>>>> Change Event for ' + this.id + ' [' + this.type + '] ' + this.value + '(' + json_element.id + ')');
                console.warn(json_element);
                if (this.type === 'text') {
                    json_element[this.id] = this.value;
                    // If this is the name field copy to the Ids Map
                    if (this.id === 'display_name' || this.id === 'name') {
                        //json_element['display_name'] = this.value;
                        //json_element['name'] = this.value;
                        if (this.id === 'display_name') {
                            json_element['name'] = json_element['display_name'];
                        } else if (this.id === 'name') {
                            json_element['display_name'] = json_element['name'];
                        }
                        d3.select(d3Id(json_element['id'] + '-title'))
                            .text(json_element['display_name']);
                        let display_name = d3.select(d3Id(json_element['id'] + '-display-name'));
                        if (display_name && display_name != null) {
                            display_name.text(json_element['display_name']);
                        }
                    }
                } else if (this.type === 'checkbox') {
                    json_element[this.id] = $(this).is(':checked');
                } else {
                    console.info('Unknown input type ' + $(this).attr('type'));
                }
                console.warn(json_element);
            });
            inputfield.on('blur', function() {
                if (settings) {
                    saveOkitSettings();
                }
                drawSVGforJson();
            });
        }
    );
    // Select Boxes
    $('.property-editor-table select').each(
        function(index) {
            let inputfield = $(this);
            inputfield.on('change', function () {
                json_element[this.id] = $(this).val();
                // Redraw Connectors
                for (let f of callbacks) {
                    //console.log(' Calling ' + f);
                    f(this.id, json_element);
                }
                drawSVGforJson();
            });
            inputfield.on('blur', function() {
                if (settings) {
                    saveOkitSettings();
                }
            });
        }
    );
    // Text Areas
    $('.property-editor-table textarea').each(
        function(index) {
            let inputfield = $(this);
            inputfield.on('change', function() {
                console.info(this.id + ' Changed !!!!!!');
                json_element[this.id] = this.value.replace('\n', '\\n');
                json_element[this.id] = this.value;
            });
            inputfield.on('blur', function() {
                if (settings) {
                    saveOkitSettings();
                }
                drawSVGforJson();
            });
        }
    );
    console.groupEnd();
}
