/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Json View Javascript');

class OkitJsonView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'json-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'json-div') {
        return new OkitJsonView((model, oci_data, parent_id, resource_icons))
    }

    draw(for_export=false) {
        this.newCanvas()
    }

    newCanvas(width=800, height=800, for_export=false) {
        // Empty Existing
        const json_div = document.getElementById(this.parent_id)
        json_div.innerHTML = ''
        let root = document.createElement('ul')
        root.setAttribute('id', 'json_view_root')
        root.setAttribute('class', 'json-view-root')
        root.textContent = '{'
        json_div.appendChild(root)
        this.addAttributes(this.model, root)
    }

    addAttributes(obj, parent) {
        Object.entries(obj).forEach(([key, val]) => {
            
        })
    }
}
