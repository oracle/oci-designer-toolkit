/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Subnet View Javascript');

/*
** Define Subnet View Artifact Class
 */
class SubnetView extends OkitContainerDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.vcn_id;}
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}
    get minimum_dimensions() {return {width: 300, height: 150};}

    /*
     ** SVG Processing
     */
    draw() {
        console.log(`Drawing ${this.getArtifactReference()} : ${this.display_name} (${this.artefact_id}) [${this.parent_id}]`);
        let me = this;
        let svg = super.draw();
        let fill = d3.select(d3Id(this.id)).attr('fill');
        svg.on("mouseover", function () {
            //d3.selectAll(d3Id(me.id + '-vnic')).attr('fill', svg_highlight_colour);
            $(jqId(me.id + '-vnic')).addClass('highlight-vnic');
            d3.event.stopPropagation();
        });
        svg.on("mouseout", function () {
            //d3.selectAll(d3Id(me.id + '-vnic')).attr('fill', fill);
            $(jqId(me.id + '-vnic')).removeClass('highlight-vnic');
            d3.event.stopPropagation();
        });
        this.drawAttachments();
        console.log();
    }

    drawAttachments() {
        console.log(`Drawing ${this.getArtifactReference()} : ${this.display_name} Attachments (${this.artefact_id})`);
        let attachment_count = 0;
        // Draw Route Table
        if (this.artefact.route_table_id !== '') {
            let attachment = new RouteTableView(this.getJsonView().getOkitJson().getRouteTable(this.route_table_id), this.getJsonView());
            attachment.attached_id = this.id;
            console.info(`Drawing ${this.getArtifactReference()} Route Table : ${attachment.display_name}`);
            attachment.draw();
            attachment_count += 1;
        }
        // Security Lists
        for (let security_list_id of this.artefact.security_list_ids) {
            let attachment = new SecurityListView(this.getJsonView().getOkitJson().getSecurityList(security_list_id), this.getJsonView());
            attachment.attached_id = this.id;
            console.info(`Drawing ${this.getArtifactReference()} Security List : ${attachment.display_name}`);
            attachment.draw();
            attachment_count += 1;
        }
    }

    getSvgDefinition() {
        let definition = this.newSVGDefinition(this, Subnet.getArtifactReference());
        // Get Parents First Child Container Offset
        let parent_first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = parent_first_child.dx;
        definition['svg']['y'] = parent_first_child.dy;
        definition['svg']['width'] = this.dimensions['width'];
        definition['svg']['height'] = this.dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.orange;
        definition['rect']['stroke']['dash'] = 5;
        definition['rect']['stroke']['width'] = 2;
        definition['icon']['x_translation'] = icon_translate_x_start;
        definition['icon']['y_translation'] = icon_translate_y_start;
        definition['name']['show'] = true;
        definition['label']['show'] = true;
        if (this.prohibit_public_ip_on_vnic) {
            definition['label']['text'] = 'Private ' + Subnet.getArtifactReference();
        } else  {
            definition['label']['text'] = 'Public ' + Subnet.getArtifactReference();
        }
        definition['info']['show'] = true;
        definition['info']['text'] = this.cidr_block;
        return definition;
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/subnet.html", () => {
            // Load Referenced Ids
            let route_table_select = $(jqId('route_table_id'));
            route_table_select.append($('<option>').attr('value', '').text(''));
            for (let route_table of me.artefact.getOkitJson().route_tables) {
                if (me.vcn_id === route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            let security_lists_select = d3.select(d3Id('security_list_ids'));
            for (let security_list of me.artefact.getOkitJson().security_lists) {
                if (me.vcn_id === security_list.vcn_id) {
                    let div = security_lists_select.append('div');
                    div.append('input')
                        .attr('type', 'checkbox')
                        .attr('id', safeId(security_list.id))
                        .attr('value', security_list.id);
                    div.append('label')
                        .attr('for', safeId(security_list.id))
                        .text(security_list.display_name);
                }
            }
            // Load Properties
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/subnet.html");
    }

    /*
    ** Child Artifact Functions
     */
    getTopEdgeArtifacts() {
        return [RouteTable.getArtifactReference(), SecurityList.getArtifactReference()];
    }

    getTopArtifacts() {
        return [LoadBalancer.getArtifactReference()];
    }

    getBottomArtifacts() {
        return [Instance.getArtifactReference(), InstancePool.getArtifactReference(), DatabaseSystem.getArtifactReference(), AutonomousDatabase.getArtifactReference(), MySQLDatabaseSystem.getArtifactReference()];
    }

    getLeftArtifacts() {
        return [FileStorageSystem.getArtifactReference()];
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return Subnet.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

}