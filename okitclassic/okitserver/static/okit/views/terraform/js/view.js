/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Terraform View Javascript');

class OkitTerraformView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'terraform-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
        this.terraform = {}
        this.selected_tab = this.generateTabId('provider.tf')
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'terraform-div') {
        console.info(`>>>>>>> Resource Icons:`, resource_icons)
        return new OkitTerraformView(model, oci_data, resource_icons, parent_id)
    }

    draw(for_export=false) {
        this.newCanvas()
    }

    newCanvas(width=800, height=800, for_export=false) {
        // Empty Existing
        // let json_div = document.getElementById(this.parent_id)
        // json_div.innerHTML = ''
        const canvas_div = d3.select(d3Id(this.parent_id));
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // Add Tab Bar
        const tab_bar = canvas_div.append('div')
            .attr('class', 'okit-tab-bar')
            .attr('id', 'terraform_view_tab_bar');
        // Add Tab Contents
        const tab_content = canvas_div.append('div')
            .attr('class', 'okit-tab-contents')
            .attr('id', 'terraform_view_tab_contents')
        this.generateTerraform(tab_bar, tab_content)
    }

    generateTerraform(tab_bar, tab_content) {
        const self = this
        $.ajax({
            cache: false,
            type: 'get',
            url: 'export/terraform',
            dataType: 'text',
            contentType: 'application/json',
            data: {
                destination: 'json',
                design: JSON.stringify(self.model)
            },
            success: function(resp) {
                self.terraform = JSON.parse(resp)
                self.objectToTabbedLayout(self.terraform, tab_bar, tab_content)
            },
            error: function(xhr, status, error) {
                console.info('Status : '+ status)
                console.info('Error : '+ error)
            }
        });
    }

    objectToTabbedLayout(data, tab_bar, tab_content) {
        const self = this
        Object.entries(data).forEach(([k,v]) => {
            self.addTab(tab_bar, k)
        })
        // $('#terraform_view_tab_bar button:first-child').trigger("click");
        $(`#${this.selected_tab}`).trigger("click");
    }

    addTab(tab_bar, key) {
        const self = this;
        tab_bar.append('button')
            .attr('class', 'okit-tab')
            .attr('id', this.generateTabId(key))
            .attr('type', 'button')
            .text(this.generateTabTitle(key))
            .on('click', function () {
                $('#terraform_view_tab_bar > button').removeClass("okit-tab-active");
                $(jqId(self.generateTabId(key))).addClass("okit-tab-active");
                self.loadTabContent(key);
                self.selected_tab = self.generateTabId(key)
            });
    }

    generateTabId(name) {
        return `${name.replaceAll('.', '_')}_tab`;
    }

    generateTabTitle(name) {
        return name;
    }

    loadTabContent(key) {
        const contents_div = d3.select(d3Id('terraform_view_tab_contents'));
        // Empty existing Canvas
        contents_div.selectAll('*').remove();
        // Build Table
        const table = contents_div.append('textarea')
            .attr('class', 'code')
            .attr('readonly', 'readonly')
            .text(this.terraform[key]);
    }

}


okitViewClasses.push(OkitTerraformView);

let okitTerraformView = null;
