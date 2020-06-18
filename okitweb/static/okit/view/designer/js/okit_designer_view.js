/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Designer View Javascript');

// TODO: Implement View Classes
class OkitDesignerJsonView extends OkitJsonView {
    constructor(okitjson=null, parent_id = 'canvas-div') {
        super(okitjson);
        this.parent_id = parent_id;
    }

    draw() {
        console.groupCollapsed('Drawing SVG Canvas');
        // Display Json
        this.displayOkitJson();
        // New canvas
        let width = 0;
        let height = 0;
        for (let compartment of this.getOkitJson().compartments) {
            let dimensions = this.newCompartment(compartment).getDimensions();
            width = Math.max(width, dimensions.width);
            height = Math.max(height, dimensions.height);
        }
        let canvas_svg = newCanvas(this.parent_id, width, height);

        // Draw Compartments
        for (let compartment of this.compartments) {
            this.newCompartment(compartment).draw();
        }

        // Draw Compartment Sub Components
        // Virtual Cloud Networks
        for (let virtual_cloud_network of this.virtual_cloud_networks) {
            this.newVirtualCloudNetwork(virtual_cloud_network).draw();
        }
        // Block Storage Volumes
        for (let block_storage_volume of this.block_storage_volumes) {
            this.newBlockStorageVolume(block_storage_volume).draw();
        }
        // Object Storage Buckets
        for (let object_storage_bucket of this.object_storage_buckets) {
            this.newObjectStorageBucket(object_storage_bucket).draw();
        }
        // Autonomous Databases
        for (let autonomous_database of this.autonomous_databases) {
            this.newAutonomousDatabase(autonomous_database).draw();
        }
        // FastConnects
        for (let fast_connect of this.fast_connects) {
            this.newFastConnect(fast_connect).draw();
        }

        // Draw Virtual Cloud Network Sub Components
        // Internet Gateways
        for (let internet_gateway of this.internet_gateways) {
            this.newInternetGateway(internet_gateway).draw();
        }
        // NAT Gateways
        for (let nat_gateway of this.nat_gateways) {
            this.newNATGateway(nat_gateway).draw();
        }
        // Service Gateways
        for (let service_gateway of this.service_gateways) {
            this.newServiceGateway(service_gateway).draw();
        }
        // Dynamic Routing Gateways
        for (let dynamic_routing_gateway of this.dynamic_routing_gateways) {
            this.newDynamicRoutingGateway(dynamic_routing_gateway).draw();
        }
        // Local Peering Gateways
        for (let local_peering_gateway of this.local_peering_gateways) {
            this.newLocalPeeringGateway(local_peering_gateway).draw();
        }
        // Route Tables
        for (let route_table of this.route_tables) {
            this.newRouteTable(route_table).draw();
        }
        // Security Lists
        for (let security_list of this.security_lists) {
            this.newSecurityList(security_list).draw();
        }
        // Network Security Groups
        for (let network_security_group of this.network_security_groups) {
            this.newNetworkSecurityGroup(network_security_group).draw();
        }
        // Subnets
        for (let subnet of this.subnets) {
            this.newSubnet(subnet).draw();
        }

        // Draw Subnet Sub Components
        // Database System
        for (let database_system of this.database_systems) {
            this.newDatabaseSystem(database_system).draw();
        }
        // File Storage System
        for (let file_storage_system of this.file_storage_systems) {
            this.newFileStorageSystem(file_storage_system).draw();
        }
        // Containers
        for (let container of this.containers) {
            this.newContainer(container).draw();
        }
        // Instances
        for (let instance of this.instances) {
            this.newInstance(instance).draw();
        }
        // Load Balancers
        for (let load_balancer of this.load_balancers) {
            this.newLoadBalancer(load_balancer).draw();
        }

        // Resize Main Canvas if required
        console.info('Canvas Width   : ' + canvas_svg.attr('width'));
        console.info('Canvas Height  : ' + canvas_svg.attr('height'));
        console.info('Canvas viewBox : ' + canvas_svg.attr('viewBox'));
        $(jqId("canvas-svg")).children("svg [data-type='" + Compartment.getArtifactReference() + "']").each(function () {
            console.info('Id      : ' + this.getAttribute('id'));
            console.info('Width   : ' + this.getAttribute('width'));
            console.info('Height  : ' + this.getAttribute('height'));
            console.info('viewBox : ' + this.getAttribute('viewBox'));
            canvas_svg.attr('width', Math.max(Number(canvas_svg.attr('width')), Number(this.getAttribute('width'))));
            canvas_svg.attr('height', Math.max(Number(canvas_svg.attr('height')), Number(this.getAttribute('height'))));
            canvas_svg.attr('viewBox', '0 0 ' + canvas_svg.attr('width') + ' ' + canvas_svg.attr('height'));
        });
        console.info('Canvas Width   : ' + canvas_svg.attr('width'));
        console.info('Canvas Height  : ' + canvas_svg.attr('height'));
        console.info('Canvas viewBox : ' + canvas_svg.attr('viewBox'));
        if (selectedArtefact) {
            $(jqId(selectedArtefact)).toggleClass('highlight');
        }

        console.info(this);

        console.groupEnd();
    }

    displayOkitJson() {}

    newCanvas() {}

    styleCanvas() {}
}

class OkitDesignerArtefactView extends OkitArtefactView {
    constructor(artefact=null) {
        super(artefact);
    }
}

$(document).ready(function() {
    okitJsonView = new OkitDesignerJsonView();
});
