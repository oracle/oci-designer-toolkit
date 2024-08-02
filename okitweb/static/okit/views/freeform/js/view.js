/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Freeform View Javascript');

class OkitFreeformView {
    constructor(okitjson, oci_data, resource_icons, parent_id) {
        this.okitjson = okitjson
        this.oci_data = oci_data
        this.resource_icons = resource_icons
        this.parent_id = parent_id
        if (!this.view) this.addThisView() 
        this.newViewHtml()
    }
    get model() {return this.okitjson ? this.okitjson.model.oci : {}}
    get data() {return this.oci_data}
    get icons() {return this.resource_icons}
    get view() {return this.okitjson.views.find((v) => v.view === this.constructor.name)}

    static newView(okitjson, oci_data=null, resource_icons=[], parent_id = 'freeform-div') {
        return new OkitFreeformView(okitjson, oci_data, resource_icons, parent_id)
    }

    addThisView() {
        const view = {
            view: this.constructor.name,
            layouts: {
                default: this.newLayout()
            }
        }
        this.okitjson.views.push(view)
        return view
    }

    newLayout(title='') {
        return {
            id: '',
            title: title,
            coords: []
        }
    }

    newCoords() {
        return {
            id: '',
            ocid: '',
            details: false,
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            class: ''
        }
    }

    newViewHtml() {
        this.parent_div = d3.select(`#${this.parent_id}`)
        // Clear
        this.parent_div.selectAll('*').remove()
        // Add Panels
        // Resource List
        this.resource_div = this.parent_div.append('div').attr('class', 'fv-resource-list')
        // Layouts
        this.layouts_div = this.parent_div.append('div').attr('class', 'fv-layouts')
        this.layouts_header_div = this.layouts_div.append('div').attr('class', 'fv-layouts-header')
        this.layouts_header_table = this.layouts_header_div.append('div').attr('class', 'table')
        this.layouts_header_thead = this.layouts_header_table.append('div').attr('class', 'thead')
        this.layouts_header_tr = this.layouts_header_thead.append('div').attr('class', 'tr')
        this.layouts_tab_bar = this.layouts_header_tr.append('div').attr('class', 'th').append('div').attr('id', 'layouts_tab_bar').attr('class', 'okit-tab-bar fv-layouts-tab-bar')
        this.layouts_header_tr.append('div').attr('class', 'th add-property action-button-background action-button-column').on('click', () => this.addLayout())
    }

    addResources() {}

    addLayout() {
        const title = `design${Object.keys(this.view.layouts).length + 1}`
        const layout = this.newLayout(title)
        this.view.layouts[title] = layout
        const tab = this.layouts_tab_bar.append('div').attr('class', 'okit-tab fv-tab')
        const name = tab.append('input').attr('type', 'text').on('change', (d, i, n) => {
            layout.title = n[i].value
        })
        const action = tab.append('div').attr('class', 'delete-property action-button-background delete').on('click', () => {})
    }

    draw(for_export=false) {

    }

    deleteResource(ocid) {}
}
