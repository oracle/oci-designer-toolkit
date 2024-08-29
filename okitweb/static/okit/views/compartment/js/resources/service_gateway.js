/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment ServiceGateway View Javascript');

/*
** Define ServiceGateway View Artifact Class
 */
class ServiceGatewayView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.vcn_id;}
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}

    /*
     ** SVG Processing
     */
    drawConnectors() {
        // Get Grand Parent
        let grandparent_id = d3.select(d3Id(this.parent_id)).attr('data-parent-id');
        // Define Connector Parent
        let parent_svg = d3.select(d3Id(grandparent_id + "-svg"));
        let parent_rect = d3.select(d3Id(grandparent_id));
        parent_svg = d3.select(d3Id('canvas-svg'));
        parent_rect = d3.select(d3Id('canvas-rect'));
        // Only Draw if parent exists
        if (parent_svg.node()) {
            // Define SVG position manipulation variables
            let svgPoint = parent_svg.node().createSVGPoint();
            let screenCTM = parent_rect.node().getScreenCTM();
            svgPoint.x = d3.select(d3Id(this.id)).attr('data-connector-start-x');
            svgPoint.y = d3.select(d3Id(this.id)).attr('data-connector-start-y');
            let connector_start = svgPoint.matrixTransform(screenCTM.inverse());

            let connector_end = null;

            if (this.autonomous_database_ids.length > 0) {
                for (let i = 0; i < this.autonomous_database_ids.length; i++) {
                    let autonomous_database_svg = d3.select(d3Id(this.autonomous_database_ids[i]));
                    if (autonomous_database_svg.node()) {
                        svgPoint.x = autonomous_database_svg.attr('data-connector-start-x');
                        svgPoint.y = autonomous_database_svg.attr('data-connector-start-y');
                        connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                        let polyline = drawConnector(parent_svg, this.generateConnectorId(this.autonomous_database_ids[i], this.id),
                            {x:connector_start.x, y:connector_start.y}, {x:connector_end.x, y:connector_end.y}, true);
                    }
                }
            }

            if (this.object_storage_bucket_ids.length > 0) {
                for (let i = 0; i < this.object_storage_bucket_ids.length; i++) {
                    let object_storage_bucket_svg = d3.select(d3Id(this.object_storage_bucket_ids[i]));
                    if (object_storage_bucket_svg.node()) {
                        svgPoint.x = object_storage_bucket_svg.attr('data-connector-start-x');
                        svgPoint.y = object_storage_bucket_svg.attr('data-connector-start-y');
                        connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                        let polyline = drawConnector(parent_svg, this.generateConnectorId(this.object_storage_bucket_ids[i], this.id),
                            {x:connector_start.x, y:connector_start.y}, {x:connector_end.x, y:connector_end.y}, true);
                    }
                }
            }
        }
    }

    /*
    ** Property Sheet Load function
     */
    newPropertiesSheet() {
        this.properties_sheet = new ServiceGatewayProperties(this.artefact)
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/service_gateway.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return ServiceGateway.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropServiceGatewayView = function(target) {
    // Check if Gateway Already exists
    for (let gateway of this.getServiceGateways()) {
        if (gateway.vcn_id === target.id) {
            alert('The maximum limit of 1 Service Gateway per Virtual Cloud Network has been exceeded for ' + this.getVirtualCloudNetwork(target.id).display_name);
            return null;
        }
    }
    let view_artefact = this.newServiceGateway();
    view_artefact.getArtefact().vcn_id = target.id;
    view_artefact.getArtefact().compartment_id = target.compartment_id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newServiceGateway = function(gateway) {
    this.getServiceGateways().push(gateway ? new ServiceGatewayView(gateway, this) : new ServiceGatewayView(this.okitjson.newServiceGateway(), this));
    return this.getServiceGateways()[this.getServiceGateways().length - 1];
}
OkitJsonView.prototype.getServiceGateways = function() {
    if (!this.service_gateways) this.service_gateways = []
    return this.service_gateways;
}
OkitJsonView.prototype.getServiceGateway = function(id='') {
    for (let artefact of this.getServiceGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadServiceGateways = function(service_gateways) {
    for (const artefact of service_gateways) {
        this.getServiceGateways().push(new ServiceGatewayView(new ServiceGateway(artefact, this.okitjson), this));
    }
}
