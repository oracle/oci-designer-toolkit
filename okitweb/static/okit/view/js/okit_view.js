/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT View Javascript');

// TODO: Implement View Classes
class OkitJsonView {
    constructor(okitjson=null) {
        if (okitjson === null || okitjson === undefined) {
            this.okitjson = new OkitJson();
        } else if (typeof okitjson === 'string') {
            this.okitjson = JSON.parse(okitjson);
        } else if (okitjson instanceof Object) {
            this.okitjson = okitjson;
        } else {
            this.okitjson = new OkitJson();
        }
    }

    load() {}

    draw() {}

    getOkitJson() {
        return this.okitjson;
    }

    /*
    ** Artefact Processing
     */

    // Autonomous Database
    newAutonomousDatabase() {
        return new AutonomousDatabaseView(this.okitjson.newAutonomousDatabase());
    }
    getAutonomousDatabase() {}
    deleteAutonomousDatabase() {}

    // Block Storage
    newBlockStorageVolume() {
        return new BlockStorageVolumeView(this.okitjson.newBlockStorageVolume());
    }
    getBlockStorageVolume() {}
    deleteBlockStorageVolume() {}

    // Compartment
    newCompartment() {
        return new CompartmentView(this.okitjson.newCompartment());
    }
    getCompartment() {}
    deleteCompartment() {}

    // Container
    newContainer() {}
    getContainer() {}
    deleteContainer() {}

    // Database System
    newDatabaseSystem() {
        return new DatabaseSystemView(this.okitjson.newDatabaseSystem());
    }
    getDatabaseSystem() {}
    deleteDatabaseSystem() {}

    // Dynamic Routing Gateway
    newDynamicRoutingGateway() {
        return new DynamicRoutingGatewayView(this.okitjson.newDynamicRoutingGateway());
    }
    getDynamicRoutingGateway() {}
    deleteDynamicRoutingGateway() {}

    // Fast Connect
    newFastConnect() {
        return new FastConnectView(this.okitjson.newFastConnect());
    }
    getFastConnect() {}
    deleteFastConnect() {}

    // File Storage System
    newFileStorageSystem() {
        return new FileStorageSystemView(this.okitjson.newFileStorageSystem());
    }
    getFileStorageSystem() {}
    deleteFileStorageSystem() {}

    // Instance
    newInstance() {
        return new InstanceView(this.okitjson.newInstance());
    }
    getInstance() {}
    deleteInstance() {}

    // Internet Gateway
    newInternetGateway() {
        return new InternetGatewayView(this.okitjson.newInternetGateway());
    }
    getInternetGateway() {}
    deleteInternetGateway() {}

    // Load Balancer
    newLoadBalancer() {
        return new LoadBalancerView(this.okitjson.newLoadBalancer());
    }
    getLoadBalancer() {}
    deleteLoadBalancer() {}

    // Local Peering Gateway
    newLocalPeeringGateway() {
        return new LocalPeeringGatewayView(this.okitjson.newLocalPeeringGateway());
    }
    getLocalPeeringGateway() {}
    deleteLocalPeeringGateway() {}

    // NAT Gateway
    newNATGateway() {
        return new NATGatewayView(this.okitjson.newNATGateway());
    }
    getNATGateway() {}
    deleteNATGateway() {}

    // Network Security Group
    newNetworkSecurityGroup() {
        return new NetworkSecurityGroupView(this.okitjson.newNetworkSecurityGroup());
    }
    getNetworkSecurityGroup() {}
    deleteNetworkSecurityGroup() {}

    // Object Storage Bucket
    newObjectStorageBucket() {
        return new ObjectStorageBucketView(this.okitjson.newObjectStorageBucket());
    }
    getObjectStorageBucket() {}
    deleteObjectStorageBucket() {}

    // Route Table
    newRouteTable() {
        return new RouteTableView(this.okitjson.newRouteTable());
    }
    getRouteTable() {}
    deleteRouteTable() {}

    // Security List
    newSecurityList() {
        return new SecurityListView(this.okitjson.newSecurityList());
    }
    getSecurityList() {}
    deleteSecurityList() {}

    // Service Gateway
    newServiceGateway() {
        return new ServiceGatewayView(this.okitjson.newServiceGateway());
    }
    getServiceGateway() {}
    deleteServiceGateway() {}

    // Subnet
    newSubnet() {
        return new SubnetView(this.okitjson.newSubnet());
    }
    getSubnet() {}
    deleteSubnet() {}

    // Virtual Cloud Network
    newVirtualCloudNetwork() {
        return new VirtualCloudNetworkView(this.okitjson.newVirtualCloudNetwork());
    }
    getVirtualCloudNetwork() {}
    deleteVirtualCloudNetwork() {}

    // Virtual Network Interface
    newVirtualNetworkInterface() {
        return new VirtualNetworkInterface(this.okitjson.newVirtualNetworkInterface());
    }
    getVirtualNetworkInterface() {}
    deleteVirtualNetworkInterface() {}

}

class OkitArtefactView {
    constructor(artefact=null, json_view) {
        this.artefact = artefact;
        this.json_view = json_view;
    }

    getJsonView() {
        return this.json_view;
    }

    getArtefact() {
        return this.artefact;
    }

    newSvgDefinition(artifact, data_type) {
        let definition = {};
        definition['artifact'] = artifact;
        definition['data_type'] = data_type;
        definition['name'] = {show: false, text: artifact['display_name']};
        definition['label'] = {show: false, text: data_type};
        definition['info'] = {show: false, text: data_type};
        definition['svg'] = {x: 0, y: 0, width: icon_width, height: icon_height};
        definition['rect'] = {x: 0, y: 0,
            width: icon_width, height: icon_height,
            width_adjust: 0, height_adjust: 0,
            stroke: {colour: '#F80000', dash: 5},
            fill: 'white', style: 'fill-opacity: .25;'};
        definition['icon'] = {show: true, x_translation: 0, y_translation: 0};
        definition['title_keys'] = [];

        return definition
    }
    getSvgDefinition() {
        alert('Get Svg Definition function "getSvgDefinition()" has not been implemented.');
        return;
    }

    draw() {
        let definition = this.getSvgDefinition();
    }

}

let okitJsonView = new okitJsonView();
