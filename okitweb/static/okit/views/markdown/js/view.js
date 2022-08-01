/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Markdown View Javascript');

class OkitMarkdownView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'markdown-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
        this.markdown = ''
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'markdown-div') {
        console.info(`>>>>>>> Resource Icons:`, resource_icons)
        return new OkitMarkdownView(model, oci_data, resource_icons, parent_id)
    }

    draw(for_export=false) {
        this.newCanvas()
    }

    newCanvas(width=800, height=800, for_export=false) {
        const canvas_div = d3.select(d3Id(this.parent_id));
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // Add TextArea
        this.generate()
        const tab_content = canvas_div.append('textarea')
            .attr('class', 'code')
            .attr('readonly', 'readonly')
            .text(this.markdown);
    }

    getSections() {
        if (this.sections === undefined) this.sections = this.newSections()
        return this.sections
    }

    newSections() {
        return {
            'Containers': {},
            'Networking': {},
            'Infrastructure': {},
            'Storage': {},
            'Databases': {},
            'External': {},
            'Exadata Infrastructure': {},
            'Identity': {}
        }
    }

    generate() {
        const md =[ 
            `# ${this.model.title}`,
            this.model.documentation,
            this.model.svg ? this.model.svg : '',
            Object.entries(this.sections).map(([section, resources]) => this.documentSection(section, resources)).join('\n'),
            this.documentUserDefinedTerraform(),
            this.documentGlobalTags()
            ]
        this.markdown = md.filter(s => s !== '').join('\n')
    }

    documentSection(section, resources) {
        console.info(`Section: ${section} Resources:`, resources)
        const md = Object.keys(resources).length === 0 ? '' : `## ${section}
${Object.entries(resources).map(([key, value]) => this.documentResources(key, value)).join('\n')}`
        console.info('Section Markdown', md)
        return  md
    }

    documentResources(name, resources) {
        console.info(`Resource Type: ${name} :`, resources)
        const md = Object.keys(resources).length === 0 ? '' : `### ${titleCase(name)}
${resources.map((resource) => resource.document()).join('\n')}`
        console.info('Resources Markdown', md)
        return  md
    }

    documentUserDefinedTerraform() {
        return ''
    }

    documentGlobalTags() {
        return ''
    }

}

class OkitMarkdownResource extends OkitArtefactView {
    constructor(resource=null, json_view) {
        super(resource, json_view)
    }

    document() {
        console.info('Documenting', this.resource)
        const md = [
            this.documentCommonDetails(),
            this.documentResource(),
            this.documentFreeformTags(),
            this.documentDefinedTags()
            ]
        console.info('Resource Markdown', md)
        return md.filter(s => s !== '').join('\n')
    }

    documentCommonDetails() {
        const md = [`#### ${this.resource.display_name}`]
        if (this.resource.documentation && this.resource.documentation.length) md.push(this.resource.documentation)
        if (this.resource.svg && this.resource.svg.length) md.push(this.resource.svg)
        console.info('Common Details Markdown', md)
        return md.filter(s => s !== '').join('\n')
    }

    documentFreeformTags() {
        const md = Object.keys(this.resource.freeform_tags).length === 0 ? '' : `##### Freeform Tags
| Key      | Value    |
| -------- | -------- |
${Object.entries(this.resource.freeform_tags).map(([k, v]) => `|${k}|${v}|`).join('\n')}`
            console.info('Freeform Tags Markdown', md)
            return md
        }

    documentDefinedTags() {
        const md = Object.keys(this.resource.defined_tags).length === 0 ? '' : `##### Defined Tags
| Namespace | Key      | Value    |
| --------- | -------- | -------- |
${Object.entries(this.resource.defined_tags).map(([n, kv]) => Object.entries(kv).map(([k, v]) => `|${n}|${k}|${v}|`).join('\n')).join('\n')}`
            console.info('Defined Tags Markdown', md)
            return md
        }

    documentResource() {return ''}
}
