/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded BoM View Javascript');

class OkitBoMView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'bom-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'bom-div') {
        return new OkitBoMView(model, oci_data, resource_icons, parent_id)
    }

    draw(for_export=false) {
        this.newCanvas()
        this.drawBoMPanel()
        this.drawEstimatePanel()
    }

    newCanvas(width=100, height=100, for_export=false) {
        const canvas_div = d3.select(d3Id(this.parent_id));
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // BoM
        this.bom_div = canvas_div.append('div').attr('id', 'bom_div').attr('class', 'okit-bom-bom-details')
        this.estimate_div = canvas_div.append('div').attr('id', 'bom_div').attr('class', 'okit-bom-estimate-details')
    }

    drawBoMPanel() {}

    drawEstimatePanel() {}

}


okitViewClasses.push(OkitBoMView);

let okitBoMView = null;
