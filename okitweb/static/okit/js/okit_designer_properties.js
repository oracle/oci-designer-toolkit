console.log('Loaded Properties Javascript');

/*
** Property Sheet Load function
 */

function handlePropertiesDragEnd(e) {
    console.log('Properties Drag End');
}

let asset_propereties_width = 0;
function handlePropertiesMouseDown(e) {
    console.log('Properties Mouse Down : ' + e.target.clientWidth);
    asset_propereties_width = e.target.clientWidth;
}

function handlePropertiesMouseUp(e) {
    console.log('Properties Mouse Up : ' + e.target.clientWidth);
    if (asset_propereties_width != e.target.clientWidth) {
        redrawSVGCanvas();
    }
}

function addPropertiesEventListeners(json_element, callbacks) {
    // Default callbacks if not passed
    callbacks = (typeof callbacks !== 'undefined') ? callbacks : [];
    // Add Event Listeners
    // Input Fields
    $('.property-editor-table input').each(
        function(index) {
            let inputfield = $(this);
            inputfield.on('input', function () {
                if (this.type == 'text') {
                    json_element[this.id] = this.value;
                    // If this is the name field copy to the Ids Map
                    if (this.id == 'display_name') {
                        okitIdsJsonObj[json_element['id']] = this.value;
                        d3.select('#' + json_element['id'] + '-title')
                            .text(this.value);
                        let text = d3.select('#' + json_element['id'] + '-display-name');
                        if (text && text != null) {
                            text.text(this.value);
                        }
                    } else if (this.id == 'name') {
                        // Compartment Processing
                        okitIdsJsonObj[json_element['id']] = this.value;
                        d3.select('#' + json_element['id'] + '-title')
                            .text(this.value);
                        let text = d3.select('#' + json_element['id'] + '-tab');
                        if (text && text != null) {
                            text.text(this.value);
                        }
                    }
                } else if (this.type == 'checkbox') {
                    json_element[this.id] = $(this).is(':checked');
                } else {
                    console.log('Unknown input type ' + $(this).attr('type'));
                }
                displayOkitJson();
            });
        }
    );
    // Select Boxes
    $('.property-editor-table select').each(
        function(index) {
            let inputfield = $(this);
            inputfield.on('change', function () {
                json_element[this.id] = $(this).val()
                displayOkitJson();
                // Redraw Connectors
                let f = '';
                for (f of callbacks) {
                    f(json_element);
                }
            });
        }
    );
    // Text Areas
    $('.property-editor-table textarea').each(
        function(index) {
            let inputfield = $(this);
            inputfield.on('change', function() {
                console.log(this.id + ' Changed !!!!!!');
                json_element[this.id] = this.value.replace('\n', '\\n');
                json_element[this.id] = this.value;
                displayOkitJson();
            });
        }
    );
}
