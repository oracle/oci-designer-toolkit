/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
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
        // this.generate()
        // // const tab_content = canvas_div.append('textarea')
        // //     .attr('class', 'code')
        // //     .attr('readonly', 'readonly')
        // //     .text(this.markdown);
        // console.info('Remarkable', remarkable)
        // const md_converter = new remarkable.Remarkable()
        // canvas_div.html(md_converter.render(this.markdown))
        this.generateMarkdown()
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
        const md = [ 
            `# ${this.model.title}`,
            this.model.documentation,
            this.model.svg ? this.model.svg : '',
            Object.entries(this.sections).map(([section, resources]) => this.documentSection(section, resources)).join('\n'),
            this.documentUserDefinedTerraform(),
            this.documentGlobalTags()
            ]
        this.markdown = md.filter(s => s !== '').join('\n')
    }

    generateMarkdown() {
        let requestJson = JSON.clone(this.model);
        requestJson.use_variables = okitSettings.is_variables;
        const dimensions = setExportDisplay();
        console.info('Canvas Dimensions', dimensions)
        const okitcanvas = document.getElementById("canvas-svg");
        okitcanvas.setAttribute('width', dimensions.width)
        okitcanvas.setAttribute('height', dimensions.height)
        okitcanvas.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
        requestJson.svg = okitcanvas.outerHTML.replaceAll('\n', ' ');
        // Add Style and Def to Compartment SVG
        for (let compartment of requestJson.compartments) {
            let svg_id = okitJsonView.getCompartment(compartment.id).svg_id;
            let svg = d3.select(d3Id(svg_id));
            okitJsonView.addDefinitions(svg);
            compartment.svg = document.getElementById(svg_id).outerHTML.replaceAll('\n', ' ');
        }
        // Add Style and Def to VCN SVG
        if (requestJson.virtual_cloud_networks) {
            for (let vcn of requestJson.virtual_cloud_networks) {
                let svg_id = okitJsonView.getVirtualCloudNetwork(vcn.id).svg_id;
                let svg = d3.select(d3Id(svg_id));
                okitJsonView.addDefinitions(svg);
                vcn.svg = document.getElementById(svg_id).outerHTML.replaceAll('\n', ' ');
            }
        }
        // Add Style and Def to Subnet SVG
        if (requestJson.subnets) {
            for (let subnet of requestJson.subnets) {
                let svg_id = okitJsonView.getSubnet(subnet.id).svg_id;
                let svg = d3.select(d3Id(svg_id));
                okitJsonView.addDefinitions(svg);
                subnet.svg = document.getElementById(svg_id).outerHTML.replaceAll('\n', ' ');
            }
        }
        // okitJsonView.draw();
        $.ajax({
            cache: false,
            type: 'get',
            url: 'export/markdown',
            dataType: 'text',
            contentType: 'application/json',
            data: {
                design: JSON.stringify(requestJson)
            }
        }).done((resp) => {
            const canvas_div = d3.select(d3Id(this.parent_id));
            const md_converter = new remarkable.Remarkable({html: true})
            const response = JSON.parse(resp)
            this.markdown = response.markdown
            canvas_div.html(md_converter.render(this.markdown))    
        }).fail(() => {
            $.ajax({
                cache: false,
                type: 'post',
                url: 'export/markdown',
                dataType: 'text',
                contentType: 'application/json',
                data: JSON.stringify(requestJson)
            }).done((resp) => {
                const canvas_div = d3.select(d3Id(this.parent_id));
                const md_converter = new remarkable.Remarkable({html: true})
                const response = JSON.parse(resp)
                this.markdown = response.markdown
                canvas_div.html(md_converter.render(this.markdown))    
            })            
        })
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
