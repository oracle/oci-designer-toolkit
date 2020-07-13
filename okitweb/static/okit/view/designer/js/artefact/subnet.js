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
    get parent_key() {return 'subnet_id';}
    get minimum_dimension() {return {width: this.subnet_width, height: this.subnet_height};}
    get subnet_width() {return 400;}
    get subnet_height() {return 150;}

    getParent() {
        return this.getSubnet(this.getParentId());
    }

    getParentId() {
        return this.parent_id;
    }

    /*
     ** SVG Processing
     */
    draw() {
        this.parent_id = this.vcn_id;
        let id = this.id;
        console.group('Drawing ' + Subnet.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let me = this;
        let svg = super.draw();
        let fill = d3.select(d3Id(this.id)).attr('fill');
        svg.on("mouseover", function () {
            d3.selectAll(d3Id(me.id + '-vnic')).attr('fill', svg_highlight_colour);
            d3.event.stopPropagation();
        });
        svg.on("mouseout", function () {
            d3.selectAll(d3Id(me.id + '-vnic')).attr('fill', fill);
            d3.event.stopPropagation();
        });
        this.drawAttachments();
        console.groupEnd();
    }

    drawAttachments() {
        console.info('Drawing ' + Subnet.getArtifactReference() + ' : ' + this.id + ' Attachments');
        let attachment_count = 0;
        // Draw Route Table
        if (this.route_table_id !== '') {
            let attached_artefact = new RouteTable(this.getOkitJson().getRouteTable(this.route_table_id), this.getOkitJson(), this);
            let parent_id = attached_artefact['parent_id'];
            attached_artefact['parent_id'] = this.id;
            console.info('Drawing ' + this.getArtifactReference() + ' Route Table : ' + attached_artefact.display_name);
            attached_artefact.draw();
            attached_artefact['parent_id'] = parent_id;
            attachment_count += 1;
        }
        // Security Lists
        for (let security_list_id of this.security_list_ids) {
            let attached_artefact = new SecurityList(this.getOkitJson().getSecurityList(security_list_id), this.getOkitJson(), this);
            let parent_id = attached_artefact['parent_id'];
            attached_artefact['parent_id'] = this.id;
            console.info('Drawing ' + this.getArtifactReference() + ' Security List : ' + attached_artefact.display_name);
            attached_artefact.draw();
            attached_artefact['parent_id'] = parent_id;
            attachment_count += 1;
        }
    }

    getSvgDefinition() {
        console.group('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
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
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/subnet.html", () => {
            // Load Referenced Ids
            let route_table_select = $(jqId('route_table_id'));
            route_table_select.append($('<option>').attr('value', '').text(''));
            for (let route_table of okitJson.route_tables) {
                if (me.vcn_id === route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            let security_lists_select = $(jqId('security_list_ids'));
            for (let security_list of okitJson.security_lists) {
                if (me.vcn_id === security_list.vcn_id) {
                    security_lists_select.append($('<option>').attr('value', security_list.id).text(security_list.display_name));
                }
            }
            // Load Properties
            loadPropertiesSheet(me);
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
        return [Instance.getArtifactReference()];
    }

    getLeftArtifacts() {
        return [FileStorageSystem.getArtifactReference(), DatabaseSystem.getArtifactReference()];
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