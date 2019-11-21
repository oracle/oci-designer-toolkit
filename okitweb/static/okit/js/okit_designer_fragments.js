console.info('Loaded Fragments Javascript');

const fragment_artifact = 'Fragment';
asset_drop_targets[fragment_artifact] = [compartment_artifact, virtual_cloud_network_artifact];
asset_add_functions[fragment_artifact] = "addFragment";

/*
** Add Asset to JSON Model
 */
function addFragment(parent_id, compartment_id, fragment_title) {
    console.groupCollapsed('Adding ' + fragment_artifact + ' ' + fragment_title);
    let fragment = new Fragment(parent_id, compartment_id);
    fragment.add(fragment_title);
    console.groupEnd();
}

class Fragment {
    artifact = 'Fragment';
    drop_targets = [compartment_artifact, virtual_cloud_network_artifact];

    constructor (parent_id, compartment_id) {
        this.parent_id = parent_id;
        this.compartment_id = compartment_id;
    }

    add(title) {
        this.title = title;
        console.info('Adding ' + this.artifact + ' ' + title);
        let parent_type = d3.select('#' + this.parent_id).attr('data-type');
        console.info('Drop location type : ' + parent_type);
        // Load Fragment Json and process
        this.fragment_url = '/static/okit/fragments/json/' + this.title.toLowerCase().split(' ').join('_') + '.json';
        // Need local variables for ajax success to access
        let compartment_id = this.compartment_id;
        let parent_id = this.parent_id;
        $.ajax({
            type: 'get',
            url: this.fragment_url,
            dataType: 'text',
            contentType: 'application/json',
            success: function(resp) {
                let fragment_json = JSON.parse(resp);
                for (let key in fragment_json) {
                    console.info('Processing ' + key);
                    if (Array.isArray(fragment_json[key])) {
                        console.info('Found Array ' + key);
                        if (parent_type === compartment_artifact && key !== 'compartments') {
                            for (let element of fragment_json[key]) {
                                if (element.hasOwnProperty('compartment_id')) {
                                    element['compartment_id'] = compartment_id
                                }
                            }
                            if (okitJson.hasOwnProperty(key)) {
                                okitJson[key] = okitJson[key].concat(fragment_json[key]);
                            } else {
                                okitJson[key] = fragment_json[key];
                            }
                        } else if (parent_type === virtual_cloud_network_artifact && key !== 'compartments' && key !== 'virtual_cloud_networks') {
                            for (let element of fragment_json[key]) {
                                if (element.hasOwnProperty('compartment_id')) {
                                    element['compartment_id'] = compartment_id
                                }
                                if (element.hasOwnProperty('vcn_id')) {
                                    element['vcn_id'] = parent_id
                                }
                            }
                            if (okitJson.hasOwnProperty(key)) {
                                okitJson[key] = okitJson[key].concat(fragment_json[key]);
                            } else {
                                okitJson[key] = fragment_json[key];
                            }
                        }
                    }
                }
                displayOkitJson();
                drawSVGforJson();
            },
            error: function(xhr, status, error) {
                console.error('Status : '+ status);
                console.error('Error  : '+ error);
            }
        });
    }

    delete() {

    }

    draw() {

    }
}

