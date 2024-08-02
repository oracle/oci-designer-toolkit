/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT OCI Import View Javascript');

class OkitOciImportView extends OkitJsonView {
    resource_prefix = 'oi_rt'
    constructor(import_json, okitjson = null, parent_id = 'oci_import_panel') {
        super(okitjson);
        this.parent_id = parent_id;
        this.import_json = import_json;
    }
    get root() {return 'root_ul';}

    draw() {
        $(jqId(this.parent_id)).empty();
        this.addImportOptions()
        this.addResourceTreeDiv()
    }

    addImportOptions() {
        const self = this
        const parent = d3.select(d3Id(this.parent_id));
        const options_div = parent.append('div').attr('class', 'okit-oci-import-options')
        const import_btn = options_div.append('button').text('Import')
            .on('click', () => {
                let selected = {}
                $("#oi_resources_tree_div").find("input:checked").each((i, ob) => { 
                    const resource_type = $(ob).attr('data-resource-type')
                    const resource_id = $(ob).attr('data-resource-id')
                    console.info('Type:', resource_type,'Id:', resource_id);
                    selected[resource_type] = selected[resource_type] ? [...selected[resource_type], ...[resource_id]] : [resource_id]
                });
                console.info('Selected', selected)
                Object.entries(selected).forEach(([k, v]) => {
                    console.info('Key', k, 'Value', v)
                    self.getOkitJson()[k] = self.getOkitJson()[k] ? [...self.getOkitJson()[k], ...this.import_json[k].filter((r) => v.includes(r.id))] : this.import_json[k].filter((r) => v.includes(r.id))
                })
                self.getOkitJson().checkCompartmentIds()
                newCompartmentView()
                redrawSVGCanvas()
            })
    }

    addResourceTreeDiv() {
        const parent = d3.select(d3Id(this.parent_id));
        const tree_div = parent.append('div')
            .attr('id', 'oi_resources_tree_div')
            .attr('class', 'okit-oci-import-view tree-view')
        const root_ul = tree_div.append('ul')
            .attr('id', 'oi_resources_root_ul')
            .attr('class', '')
        // Loop through sorted resource lists
        Object.entries(this.import_json.getResourceLists()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, v]) => {
            if (v.length > 0) {
                const parent = this.addCollapsibleTreeElement(root_ul, `${this.resource_prefix}_${k}_root`, `${k.slice(0, -1).split('_').join('-')}`, `${titleCase(k.split('_').join(' '))}`, `${this.resource_prefix}`);
                v.forEach((resource) => {this.addSimpleTreeElement(parent, resource.id, `${k.slice(0, -1).split('_').join('-')}`, resource.display_name, `${this.resource_prefix}`, k)})
            }
        })
    }

    addCollapsibleTreeElement(parent, id, css_class, text, prefix='') {
        const li = parent.append('li')
            .attr('id', `${prefix}${id}_li`)
            .attr('class', `okit-oci-import-resource-group`);
        const div = li.append('div')
            .attr('id', `${prefix}${id}_div`)
            .attr('class', css_class);
        // const cb = div.append('input').attr('type', 'checkbox').attr('checked', 'checked')
        const label = div.append('label')
            .attr('id', `${prefix}${id}_label`)
            .text(text);
        const ul = li.append('ul')
                .attr('id', `${prefix}${id}_ul`)
                .attr('class', '');
        return ul
    }

    addSimpleTreeElement(parent, id, css_class, text, prefix='', key) {
        const li = parent.append('li')
            .attr('id', `${prefix}${id}_li`)
            .attr('class', `okit-oci-import-resource`);
        const div = li.append('div')
            .attr('id', `${prefix}${id}_div`)
            // .attr('class', css_class);
        const cb = div.append('input').attr('type', 'checkbox')
            .attr('data-resource-type', key)
            .attr('data-resource-id', id)
        const label = div.append('label')
            .attr('id', `${prefix}${id}_label`)
            .text(text);
        return li
    }

}