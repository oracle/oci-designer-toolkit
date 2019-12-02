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

function loadProperties(json_element) {
    console.groupCollapsed('Loading Properties');
    $.each(json_element, function(key, val) {
        //console.info('Key : ' + key + ' = ' + val);
        if ($('#' + key).is("input:text")) {
            console.info(key + ' is input:text.');
            $('#' + key).val(val);
        } else if ($('#' + key).is("input:checkbox")) {
            console.info(key + ' is input:checkbox.');
            $('#' + key).attr('checked', val);
        } else if ($('#' + key).is("select")) {
            console.info(key + ' is select with value ' + val);
            $('#' + key).val(val);
        } else if ($('#' + key).is("label")) {
            console.info(key + ' is label.');
            if (key.endsWith('_id')) {
                // Get Artifact Associated With Id
                let artifact_type = key.substr(0, (key.length - 3));
                console.info('Label : Artifact Type ' + titleCase(artifact_type) + ' - ' + key);
                $('#' + key).html(okitJson['get' + titleCase(artifact_type)](val).display_name);
            } else {
                $('#' + key).html(val);
            }
        } else if ($('#' + key).is("textarea")) {
            console.info(key + ' is textarea.');
            $('#' + key).val(val);
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
                if (this.type === 'text') {
                    json_element[this.id] = this.value;
                    // If this is the name field copy to the Ids Map
                    if (this.id === 'display_name') {
                        okitIdsJsonObj[json_element['id']] = this.value;
                        d3.select('#' + json_element['id'] + '-title')
                            .text(this.value);
                        let text = d3.select('#' + json_element['id'] + '-display-name');
                        if (text && text !== null) {
                            text.text(this.value);
                        }
                    } else if (this.id === 'name') {
                        // Compartment Processing
                        okitIdsJsonObj[json_element['id']] = this.value;
                        d3.select('#' + json_element['id'] + '-title')
                            .text(this.value);
                        let text = d3.select('#' + json_element['id'] + '-tab');
                        if (text && text !== null) {
                            text.text(this.value);
                        }
                    }
                } else if (this.type === 'checkbox') {
                    json_element[this.id] = $(this).is(':checked');
                    saveOkitSettings();
                } else {
                    console.info('Unknown input type ' + $(this).attr('type'));
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
                    console.log(' Calling ' + f);
                    f(json_element);
                }
                drawSVGforJson();
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
                drawSVGforJson();
            });
        }
    );
    console.groupEnd();
}
