/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT View Javascript');

// TODO: Implement View Classes
class OkitJsonView {
    constructor(okitjson=null) {
        // Specify / Assign Model
        if (okitjson === null || okitjson === undefined) {
            this.okitjson = new OkitJson();
        } else if (typeof okitjson === 'string') {
            this.okitjson = JSON.parse(okitjson);
        } else if (okitjson instanceof Object) {
            this.okitjson = okitjson;
        } else {
            this.okitjson = new OkitJson();
        }
        // Define View Lists
        this.compartments = [];
        this.autonomous_databases = [];
        this.block_storage_volumes = [];
        this.containers = [];
        this.database_systems = [];
        this.dynamic_routing_gateways = [];
        this.fast_connects = [];
        this.file_storage_systems = [];
        this.instances = [];
        this.internet_gateways = [];
        this.load_balancers = [];
        this.local_peering_gateways = [];
        this.nat_gateways = [];
        this.network_security_groups = [];
        this.object_storage_buckets = [];
        this.remote_peering_gateways = [];
        this.route_tables = [];
        this.security_lists = [];
        this.service_gateways = [];
        this.subnets = [];
        this.virtual_cloud_networks = [];
        // Load Model to View
        this.parent_map = {};
        this.load();
    }

    get small_grid_size() {return 8;}
    get grid_size() {return this.small_grid_size * 10;}
    get stroke_colours() {
        return {
            red: "#F80000",
            bark: "#312D2A",
            gray: "#5f5f5f",
            blue: "#0066cc",
            orange: "#ff6600",
            purple: "#400080",
            icon_colour_01: "#F80000",
            icon_colour_02: "#5f5f5f",
            icon_colour_03: "#ff6600",
        };
    }
    get svg_highlight_colour() {return "#00cc00";}

    drop(source, target) {
        let newFunction = 'new' + source.name;
        let getFunction = 'get' + target.type.split(' ').join('');
        console.info('New Function : ' + newFunction);
        console.info('Get Function : ' + getFunction);
    }

    clear() {
        this.compartments = [];
        this.autonomous_databases = [];
        this.block_storage_volumes = [];
        this.containers = [];
        this.database_systems = [];
        this.dynamic_routing_gateways = [];
        this.fast_connects = [];
        this.file_storage_systems = [];
        this.instances = [];
        this.internet_gateways = [];
        this.load_balancers = [];
        this.local_peering_gateways = [];
        this.nat_gateways = [];
        this.network_security_groups = [];
        this.object_storage_buckets = [];
        this.remote_peering_gateways = [];
        this.route_tables = [];
        this.security_lists = [];
        this.service_gateways = [];
        this.subnets = [];
        this.virtual_cloud_networks = [];
        this.virtual_network_interfaces = [];
    }

    load() {
        this.clear();
        for (artefact of this.okitjson.compartments) {this.newCompartment(artefact);}
        for (artefact of this.okitjson.autonomous_databases) {this.newAutonomousDatabase(artefact);}
        for (artefact of this.okitjson.block_storage_volumes) {this.newBlockStorageVolume(artefact);}
        for (artefact of this.okitjson.database_systems) {this.newDatabaseSystem(artefact);}
        for (artefact of this.okitjson.dynamic_routing_gateways) {this.newDynamicRoutingGateway(artefact);}
        for (artefact of this.okitjson.fast_connects) {this.newFastConnect(artefact);}
        for (artefact of this.okitjson.file_storage_systems) {this.newFileStorageSystem(artefact);}
        for (artefact of this.okitjson.instances) {this.newInstance(artefact);}
        for (artefact of this.okitjson.internet_gateways) {this.newInternetGateway(artefact);}
        for (artefact of this.okitjson.load_balancers) {this.newLoadBalancer(artefact);}
        for (artefact of this.okitjson.local_peering_gateways) {this.newLocalPeeringGateway(artefact);}
        for (artefact of this.okitjson.nat_gateways) {this.newNATGateway(artefact);}
        for (artefact of this.okitjson.network_security_groups) {this.newNetworkSecurityGroup(artefact);}
        for (artefact of this.okitjson.object_storage_buckets) {this.newObjectStorageBucket(artefact);}
        //for (artefact of this.okitjson.remote_peering_gateways) {this.newRemotePeeringGateway(artefact);}
        for (artefact of this.okitjson.route_tables) {this.newCompartment(this.newRouteTable());}
        for (artefact of this.okitjson.security_lists) {this.newSecurityList(artefact);}
        for (artefact of this.okitjson.service_gateways) {this.newServiceGateway(artefact);}
        for (artefact of this.okitjson.subnets) {this.newSubnet(artefact);}
        for (artefact of this.okitjson.virtual_cloud_networks) {this.newVirtualCloudNetwork(artefact);}
    }

    draw() {
        console.info('Top Level View Draw');
    }

    getOkitJson() {
        return this.okitjson;
    }

    /*
    ** Common View Functions
     */
    addGrid(canvas_svg) {
        canvas_svg.append('rect')
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "url(#grid)");
    }

    /*
    ** Artefact Processing
     */

    // Autonomous Database
    dropAutonomousDatabaseView(target) {
        console.info('Drop Autonomous Database View');
        console.info(target);
        let view_artefact = this.newAutonomousDatabase();
        view_artefact.getArtefact().compartment_id = target.id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newAutonomousDatabase(database) {
        this.autonomous_databases.push(database ? new AutonomousDatabaseView(database, this) : new AutonomousDatabaseView(this.okitjson.newAutonomousDatabase(), this));
        return this.autonomous_databases[this.autonomous_databases.length - 1];
    }
    getAutonomousDatabases() {
        return this.autonomous_databases;
    }
    getAutonomousDatabase(id='') {
        for (let artefact of this.getAutonomousDatabases()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteAutonomousDatabase() {
        for (let i = 0; i < this.autonomous_databases.length; i++) {
            if (this.autonomous_databases[i].artefact_id === id) {
                this.autonomous_databases[i].delete();
                this.autonomous_databases.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteAutonomousDatabase(id);
    }

    // Block Storage
    dropBlockStorageVolumeView(target) {
        console.info('Drop Block Storage Volume View');
        console.info(target);
        let view_artefact = this.newBlockStorageVolume();
        view_artefact.getArtefact().compartment_id = target.id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newBlockStorageVolume(volume) {
        this.block_storage_volumes.push(volume ? new BlockStorageVolumeView(volume, this) : new BlockStorageVolumeView(this.okitjson.newBlockStorageVolume(), this));
        return this.block_storage_volumes[this.block_storage_volumes.length - 1];
    }
    getBlockStorageVolumes() {
        return this.block_storage_volumes;
    }
    getBlockStorageVolume(id='') {
        for (let artefact of this.getBlockStorageVolumes()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteBlockStorageVolume() {
        for (let i = 0; i < this.block_storage_volumes.length; i++) {
            if (this.block_storage_volumes[i].artefact_id === id) {
                this.block_storage_volumes[i].delete();
                this.block_storage_volumes.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteBlockStorageVolume(id);
    }

    // Compartment
    dropCompartmentView(target) {
        console.info('Drop Compartment View');
        console.info(target);
        let view_artefact = this.newCompartment();
        view_artefact.getArtefact().compartment_id = target.type === Compartment.getArtifactReference() ? target.id : target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newCompartment(compartment) {
        console.info('New Compartment View');
        this.compartments.push(compartment ? new CompartmentView(new Compartment(compartment, this.okitjson), this) : new CompartmentView(this.okitjson.newCompartment(), this));
        return this.compartments[this.compartments.length - 1];
    }
    getCompartments() {return this.compartments;}
    getCompartment(id) {
        for (let artefact of this.getCompartments()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteCompartment(id) {
        for (let i = 0; i < this.compartments.length; i++) {
            if (this.compartments[i].artefact_id === id) {
                this.compartments[i].delete();
                this.compartments.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteCompartment(id);
    }

    // Container
    dropContainerView() {}
    newContainer() {}
    getContainers() {}
    getContainer() {}
    deleteContainer() {}

    // Database System
    dropDatabaseSystemView(target) {
        console.info('Drop Database System View');
        console.info(target);
        let view_artefact = this.newDatabaseSystem();
        view_artefact.getArtefact().subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newDatabaseSystem(database) {
        this.database_systems.push(database ? new DatabaseSystemView(database, this) : new DatabaseSystemView(this.okitjson.newDatabaseSystem(), this));
        return this.database_systems[this.database_systems.length - 1];
    }
    getDatabaseSystems() {
        return this.database_systems;
    }
    getDatabaseSystem(id='') {
        for (let artefact of this.getDatabaseSystems()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteDatabaseSystem() {
        for (let i = 0; i < this.database_systems.length; i++) {
            if (this.database_systems[i].artefact_id === id) {
                this.database_systems[i].delete();
                this.database_systems.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteDatabaseSystem(id);
    }

    // Dynamic Routing Gateway
    dropDynamicRoutingGatewayView(target) {
        console.info('Drop Dynamic Routing Gateway View');
        console.info(target);
        let view_artefact = this.newDynamicRoutingGateway();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newDynamicRoutingGateway(gateway) {
        this.dynamic_routing_gateways.push(gateway ? new DynamicRoutingGatewayView(gateway, this) : new DynamicRoutingGatewayView(this.okitjson.newDynamicRoutingGateway(), this));
        return this.dynamic_routing_gateways[this.dynamic_routing_gateways.length - 1];
    }
    getDynamicRoutingGateways() {
        return this.dynamic_routing_gateways;
    }
    getDynamicRoutingGateway(id='') {
        for (let artefact of this.getDynamicRoutingGateways()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteDynamicRoutingGateway() {
        for (let i = 0; i < this.dynamic_routing_gateways.length; i++) {
            if (this.dynamic_routing_gateways[i].artefact_id === id) {
                this.dynamic_routing_gateways[i].delete();
                this.dynamic_routing_gateways.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteDynamicRoutingGateway(id);
    }

    // Fast Connect
    dropFastConnectView(target) {
        console.info('Drop Fast Connect View');
        console.info(target);
        let view_artefact = this.newFastConnect();
        view_artefact.getArtefact().compartment_id = target.id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newFastConnect(connect) {
        this.fast_connects.push(connect ? new FastConnectView(connect, this) : new FastConnectView(this.okitjson.newFastConnect(), this));
        return this.fast_connects[this.fast_connects.length - 1];
    }
    getFastConnects() {
        return this.fast_connects;
    }
    getFastConnect(id='') {
        for (let artefact of this.getFastConnects()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteFastConnect() {
        for (let i = 0; i < this.fast_connects.length; i++) {
            if (this.fast_connects[i].artefact_id === id) {
                this.fast_connects[i].delete();
                this.fast_connects.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteFastConnect(id);
    }

    // File Storage System
    dropFileStorageSystemView(target) {
        console.info('Drop File Storage System View');
        console.info(target);
        // Pass in subnet so we create a default mount
        let view_artefact = this.newFileStorageSystem(this.okitjson.newFileStorageSystem({subnet_id: target.id}));
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact ' + view_artefact.subnet_id);
        console.info(view_artefact)
        return view_artefact;
    }
    newFileStorageSystem(storage) {
        this.file_storage_systems.push(storage ? new FileStorageSystemView(storage, this) : new FileStorageSystemView(this.okitjson.newFileStorageSystem(), this));
        return this.file_storage_systems[this.file_storage_systems.length - 1];
    }
    getFileStorageSystems() {
        return this.file_storage_systems;
    }
    getFileStorageSystem(id='') {
        for (let artefact of this.getFileStorageSystems()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteFileStorageSystem() {
        for (let i = 0; i < this.file_storage_systems.length; i++) {
            if (this.file_storage_systems[i].artefact_id === id) {
                this.file_storage_systems[i].delete();
                this.file_storage_systems.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteFileStorageSystem(id);
    }

    // Instance
    dropInstanceView(target) {
        console.info('Drop Instance View');
        console.info(target);
        let view_artefact = this.newInstance();
        if (target.type === Subnet.getArtifactReference()) {
            view_artefact.getArtefact().primary_vnic.subnet_id = target.id;
            view_artefact.getArtefact().compartment_id = target.compartment_id;
        } else if (target.type === Compartment.getArtifactReference()) {
            view_artefact.getArtefact().compartment_id = target.id;
        }
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newInstance(instance) {
        this.instances.push(instance ? new InstanceView(instance, this) : new InstanceView(this.okitjson.newInstance(), this));
        return this.instances[this.instances.length - 1];
    }
    getInstances() {
        return this.instances;
    }
    getInstance(id='') {
        for (let artefact of this.getInstances()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteInstance() {
        for (let i = 0; i < this.instances.length; i++) {
            if (this.instances[i].artefact_id === id) {
                this.instances[i].delete();
                this.instances.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteInstance(id);
    }

    // Internet Gateway
    dropInternetGatewayView(target) {
        console.info('Drop Internet Gateway View');
        console.info(target);
        let view_artefact = this.newInternetGateway();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newInternetGateway(gateway) {
        let ig = gateway ? new InternetGatewayView(gateway, this) : new InternetGatewayView(this.okitjson.newInternetGateway(), this);
        if (ig.artefact === null) {
            return null;
        }
        this.internet_gateways.push(ig);
        return this.internet_gateways[this.internet_gateways.length - 1];
    }
    getInternetGateways() {
        return this.internet_gateways;
    }
    getInternetGateway(id='') {
        for (let artefact of this.getInternetGateways()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteInternetGateway() {
        for (let i = 0; i < this.internet_gateways.length; i++) {
            if (this.internet_gateways[i].artefact_id === id) {
                this.internet_gateways[i].delete();
                this.internet_gateways.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteInternetGateway(id);
    }

    // Load Balancer
    dropLoadBalancerView(target) {
        console.info('Drop Load Balancer View');
        console.info(target);
        let view_artefact = this.newLoadBalancer();
        view_artefact.getArtefact().subnet_ids.push(target.id);
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newLoadBalancer(loadbalancer) {
        this.load_balancers.push(loadbalancer ? new LoadBalancerView(loadbalancer, this) : new LoadBalancerView(this.okitjson.newLoadBalancer(), this));
        return this.load_balancers[this.load_balancers.length - 1];
    }
    getloadBalancers() {
        return this.load_balancers;
    }
    getLoadBalancer(id='') {
        for (let artefact of this.getloadBalancers()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteLoadBalancer() {
        for (let i = 0; i < this.load_balancers.length; i++) {
            if (this.load_balancers[i].artefact_id === id) {
                this.load_balancers[i].delete();
                this.load_balancers.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteLoadBalancer(id);
    }

    // Local Peering Gateway
    dropLocalPeeringGatewayView(target) {
        console.info('Drop Local Peering Gateway View');
        console.info(target);
        let view_artefact = this.newLocalPeeringGateway();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newLocalPeeringGateway(gateway) {
        this.local_peering_gateways.push(gateway ? new LocalPeeringGatewayView(gateway, this) : new LocalPeeringGatewayView(this.okitjson.newLocalPeeringGateway(), this));
        return this.local_peering_gateways[this.local_peering_gateways.length - 1];
    }
    getLocalPeeringGateways() {
        return this.local_peering_gateways;
    }
    getLocalPeeringGateway(id='') {
        for (let artefact of this.getLocalPeeringGateways()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteLocalPeeringGateway() {
        for (let i = 0; i < this.local_peering_gateways.length; i++) {
            if (this.local_peering_gateways[i].artefact_id === id) {
                this.local_peering_gateways[i].delete();
                this.local_peering_gateways.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteLocalPeeringGateway(id);
    }

    // NAT Gateway
    dropNATGatewayView(target) {
        console.info('Drop NAT Gateway View');
        console.info(target);
        let view_artefact = this.newNATGateway();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newNATGateway(gateway) {
        let ng = gateway ? new NATGatewayView(gateway, this) : new NATGatewayView(this.okitjson.newNATGateway(), this);
        if (ng.artefact === null) {
            return null;
        }
        this.nat_gateways.push(ng);
        return this.nat_gateways[this.nat_gateways.length - 1];
    }
    getNATGateways() {
        return this.nat_gateways;
    }
    getNATGateway(id='') {
        for (let artefact of this.getNATGateways()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteNATGateway() {
        for (let i = 0; i < this.nat_gateways.length; i++) {
            if (this.nat_gateways[i].artefact_id === id) {
                this.nat_gateways[i].delete();
                this.nat_gateways.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteNATGateway(id);
    }

    // Network Security Group
    dropNetworkSecurityGroupView(target) {
        console.info('Drop Network Security Group View');
        console.info(target);
        let view_artefact = this.newNetworkSecurityGroup();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newNetworkSecurityGroup(security) {
        this.network_security_groups.push(security ? new NetworkSecurityGroupView(security, this) : new NetworkSecurityGroupView(this.okitjson.newNetworkSecurityGroup(), this));
        return this.network_security_groups[this.network_security_groups.length - 1];
    }
    getNetworkSecurityGroups() {
        return this.network_security_groups;
    }
    getNetworkSecurityGroup(id='') {
        for (let artefact of this.getNetworkSecurityGroups()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteNetworkSecurityGroup() {
        for (let i = 0; i < this.network_security_groups.length; i++) {
            if (this.network_security_groups[i].artefact_id === id) {
                this.network_security_groups[i].delete();
                this.network_security_groups.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteNetworkSecurityGroup(id);
    }

    // Object Storage Bucket
    dropObjectStorageBucketView(target) {
        console.info('Drop Object Storage Bucket View');
        console.info(target);
        let view_artefact = this.newObjectStorageBucket();
        view_artefact.getArtefact().compartment_id = target.id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newObjectStorageBucket(storage) {
        this.object_storage_buckets.push(storage ? new ObjectStorageBucketView(storage, this) : new ObjectStorageBucketView(this.okitjson.newObjectStorageBucket(), this));
        return this.object_storage_buckets[this.object_storage_buckets.length - 1];
    }
    getObjectStorageBuckets() {
        return this.object_storage_buckets;
    }
    getObjectStorageBucket(id='') {
        for (let artefact of this.getObjectStorageBuckets()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteObjectStorageBucket() {
        for (let i = 0; i < this.object_storage_buckets.length; i++) {
            if (this.object_storage_buckets[i].artefact_id === id) {
                this.object_storage_buckets[i].delete();
                this.object_storage_buckets.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteObjectStorageBucket(id);
    }

    // Route Table
    dropRouteTableView(target) {
        console.info('Drop Route Table View');
        console.info(target);
        let view_artefact = this.newRouteTable();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newRouteTable(routetable) {
        this.route_tables.push(routetable ? new RouteTableView(routetable, this) : new RouteTableView(this.okitjson.newRouteTable(), this));
        return this.route_tables[this.route_tables.length - 1];
    }
    getRouteTables() {
        return this.route_tables;
    }
    getRouteTable(id='') {
        for (let artefact of this.getRouteTables()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteRouteTable() {
        for (let i = 0; i < this.route_tables.length; i++) {
            if (this.route_tables[i].artefact_id === id) {
                this.route_tables[i].delete();
                this.route_tables.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteRouteTable(id);
    }

    // Security List
    dropSecurityListView(target) {
        console.info('Drop Security List View');
        console.info(target);
        let view_artefact = this.newSecurityList();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newSecurityList(security) {
        this.security_lists.push(security ? new SecurityListView(security, this) : new SecurityListView(this.okitjson.newSecurityList(), this));
        return this.security_lists[this.security_lists.length - 1];
    }
    getSecurityLists() {
        return this.security_lists;
    }
    getSecurityList(id='') {
        for (let artefact of this.getSecurityLists()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteSecurityList() {
        for (let i = 0; i < this.security_lists.length; i++) {
            if (this.security_lists[i].artefact_id === id) {
                this.security_lists[i].delete();
                this.security_lists.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteSecurityList(id);
    }

    // Service Gateway
    dropServiceGatewayView(target) {
        console.info('Drop Service Gateway View');
        console.info(target);
        let view_artefact = this.newServiceGateway();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newServiceGateway(gateway) {
        this.service_gateways.push(gateway ? new ServiceGatewayView(gateway, this) : new ServiceGatewayView(this.okitjson.newServiceGateway(), this));
        return this.service_gateways[this.service_gateways.length - 1];
    }
    getServiceGateways() {
        return this.service_gateways;
    }
    getServiceGateway(id='') {
        for (let artefact of this.getServiceGateways()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteServiceGateway() {
        for (let i = 0; i < this.service_gateways.length; i++) {
            if (this.service_gateways[i].artefact_id === id) {
                this.service_gateways[i].delete();
                this.service_gateways.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteServiceGateway(id);
    }

    // Subnet
    dropSubnetView(target) {
        console.info('Drop Subnet View');
        console.info(target);
        let view_artefact = this.newSubnet();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newSubnet(subnet) {
        this.subnets.push(subnet ? new SubnetView(subnet, this) : new SubnetView(this.okitjson.newSubnet(), this));
        return this.subnets[this.subnets.length - 1];
    }
    getSubnets() {
        return this.subnets;
    }
    getSubnet(id='') {
        for (let artefact of this.getSubnets()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteSubnet() {
        for (let i = 0; i < this.subnets.length; i++) {
            if (this.subnets[i].artefact_id === id) {
                this.subnets[i].delete();
                this.subnets.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteSubnet(id);
    }

    // Virtual Cloud Network
    dropVirtualCloudNetworkView(target) {
        console.info('Drop Virtual Cloud Network View');
        console.info(target);
        let view_artefact = this.newVirtualCloudNetwork();
        view_artefact.getArtefact().compartment_id = target.id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newVirtualCloudNetwork(vcn) {
        this.virtual_cloud_networks.push(vcn ? new VirtualCloudNetworkView(vcn, this) : new VirtualCloudNetworkView(this.okitjson.newVirtualCloudNetwork(), this));
        return this.virtual_cloud_networks[this.virtual_cloud_networks.length - 1];
    }
    getVirtualCloudNetworks() {
        return this.virtual_cloud_networks;
    }
    getVirtualCloudNetwork(id='') {
        for (let artefact of this.virtual_cloud_networks) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    getVcn(id='') {
        return this.getVirtualCloudNetwork(id);
    }
    deleteVirtualCloudNetwork() {
        for (let i = 0; i < this.virtual_cloud_networks.length; i++) {
            if (this.virtual_cloud_networks[i].artefact_id === id) {
                this.virtual_cloud_networks[i].delete();
                this.virtual_cloud_networks.splice(i, 1);
                break;
            }
        }
        this.okitjson.deleteVirtualCloudNetwork(id);
    }

    // Virtual Network Interface
    newVirtualNetworkInterface(vnic) {
        this.virtual_network_interfaces.push(vnic ? new VirtualNetworkInterfaceView(vnic, this) : new VirtualNetworkInterfaceView(this.okitjson.newVirtualNetworkInterface(), this));
        return this.virtual_network_interfaces[this.virtual_network_interfaces.length - 1];
    }
    getVirtualNetworkInterfaces() {}
    getVirtualNetworkInterface() {}
    deleteVirtualNetworkInterface() {}

}

/*
** Simple Artefact View Class for all artefacts that are not Containers
 */
class OkitArtefactView {
    constructor(artefact=null, json_view) {
        this.artefact = artefact;
        this.getJsonView = function() {return json_view};
        // Raise Artefact Elements to View Class
        if (this.artefact) {
            for (let key in this.artefact) {
                Object.defineProperty(this, key, { get: function() {return this.artefact[key];} });
            }
        }
    }

    get json_view() {return this.getJsonView();}
    get okit_json() {return this.json_view.getOkitJson();}
    get id() {return this.artefact.id;}
    get artefact_id() {return this.artefact.id;}
    get compartment_id() {return this.artefact.compartment_id;}
    get parent_id() {return null;}
    get display_name() {return this.artefact.display_name;}
    get icon_width() {return 45;}
    get icon_height() {return 45;}
    get icon_dimensions() {return {width: this.icon_width, height: this.icon_height};}
    get collapsed_dimensions() {return this.icon_dimensions;}
    get minimum_width() {return this.icon_width;}
    get minimum_height() {return this.icon_height;}
    get minimum_dimensions() {return {width: this.minimum_width, height: this.minimum_height};}
    get dimensions() {return this.minimum_dimensions;}

    getParent() {return null;}

    getParentId() {return this.parent_id;}

    isAttached() {return false;}

    getArtefact() {return this.artefact;}

    getOkitJson() {return this.okit_json;}

    newSVGDefinition() {
        let definition = {};
        definition['artefact'] = this.getArtefact();
        definition['data_type'] = this.getArtefact().getArtifactReference();
        definition['name'] = {show: false, text: this.getArtefact()['display_name']};
        definition['label'] = {show: false, text: this.getArtefact().getArtifactReference()};
        definition['info'] = {show: false, text: this.getArtefact().getArtifactReference()};
        definition['svg'] = {x: 0, y: 0, width: this.icon_width, height: this.icon_height};
        definition['rect'] = {x: 0, y: 0,
            width: this.icon_width, height: this.icon_height,
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
        console.group(`Drawing (Default) ${this.getArtifactReference()} : ${this.display_name} (${this.artefact_id}) [${this.parent_id}]`);
        // Get Definition from Sub class
        let definition = this.getSvgDefinition();
        /*
        ** Draw Artefact based of returned definition.
         */
        let parent_svg_id  = this.parent_id + "-svg";
        let def_id         = definition['data_type'].replace(/ /g, '') + 'Svg';
        console.info('Creating ' + definition['data_type'] + ' ' + definition['artefact']['display_name']);
        console.info('Id             : ' + this.artefact_id );
        console.info('Parent Id      : ' + this.parent_id);
        console.info('Parent SVG Id  : ' + parent_svg_id);
        console.info('Compartment Id : ' + this.compartment_id);
        let rect_x         = definition['rect']['x'];
        let rect_y         = definition['rect']['y'];
        let rect_width     = definition['svg']['width']  + definition['rect']['width_adjust'];
        let rect_height    = definition['svg']['height'] + definition['rect']['height_adjust'];
        if (definition['icon']['y_translation'] < 0) {
            rect_y = Math.abs(definition['icon']['y_translation']);
            rect_height -= rect_y * 2;
        }
        if (definition['icon']['x_translation'] < 0) {
            rect_x = Math.abs(definition['icon']['x_translation']);
            rect_width -= rect_x * 2;
        }
        // Check for Artifact Display Name and if it does not exist set it to Artifact Name
        if (!definition['artefact'].hasOwnProperty('display_name')) {
            definition['artefact']['display_name'] = definition['artefact']['name'];
        }
        // Get Parent SVG
        let parent_svg = d3.select(d3Id(parent_svg_id));
        // Wrapper SVG Element to define ViewBox etc
        let svg = parent_svg.append("svg")
            .attr("id", this.artefact_id + '-svg')
            .attr("data-type", definition['data_type'])
            .attr("x",         definition['svg']['x'])
            .attr("y",         definition['svg']['y'])
            .attr("width",     definition['svg']['width'])
            .attr("height",    definition['svg']['height'])
            .attr("viewBox", "0 0 " + definition['svg']['width'] + " " + definition['svg']['height'])
            .attr("preserveAspectRatio", "xMinYMax meet");

        let rect = svg.append("rect")
            .attr("id", this.artefact_id)
            .attr("x",            rect_x)
            .attr("y",            rect_y)
            .attr("rx",           corner_radius)
            .attr("ry",           corner_radius)
            .attr("width",        rect_width)
            .attr("height",       rect_height)
            .attr("fill",         definition['rect']['fill'])
            .attr("style",        definition['rect']['style'])
            .attr("stroke",       definition['rect']['stroke']['colour'])
            .attr("stroke-width", definition['rect']['stroke']['width'])
            .attr("stroke-dasharray",
                definition['rect']['stroke']['dash'] + ", " + definition['rect']['stroke']['dash']);

        let text_align_x = rect_x;
        let text_anchor = "start"
        if (definition['name']['align']) {
            if (definition['name']['align'] === 'center') {
                text_align_x = (Math.round(definition['svg']['width']-20) / 2)
                text_anchor = "middle"
            }
            else if (definition['name']['align'] === 'right') {
                text_align_x = definition['svg']['width']-20
                text_anchor = "end"
            }
        }
        if (definition['name']['show']) {
            let name_svg = svg.append('svg')
                .attr("x", "10")
                .attr("y", "0")
                .attr("width", container_artefact_label_width)
                .attr("height", definition['svg']['height'])
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + container_artefact_label_width + " " + definition['svg']['height']);
            let name = name_svg.append("text")
                .attr("class", "svg-text")
                .attr("id", this.artefact_id + '-display-name')
                .attr("x", text_align_x)
                .attr("y", "55")
                .attr("text-anchor", text_anchor)
                .attr("vector-effects", "non-scaling-size")
                .text(definition['name']['text']);
        }
        if (definition['label']['show']) {
            let label_svg = svg.append('svg')
                .attr("x", "10")
                .attr("y", "0")
                .attr("width", container_artefact_label_width)
                .attr("height", definition['svg']['height'])
                .attr("preserveAspectRatio", "xMinYMax meet")
                .attr("viewBox", "0 0 " + container_artefact_label_width + " " + definition['svg']['height']);
            let name = label_svg.append("text")
                .attr("class", "svg-text")
                .attr("id", this.artefact_id + '-label')
                .attr("x", rect_x)
                .attr("y", definition['svg']['height'] - Math.max(10, (rect_y * 2) - 10))
                .attr("fill", definition['rect']['stroke']['colour'])
                .attr("vector-effects", "non-scaling-size")
                .text(definition['label']['text']);
        }
        if (definition['info']['show']) {
            let info_svg = svg.append('svg')
                .attr("x", Math.round(definition['svg']['width'] - container_artefact_info_width))
                .attr("y", "0")
                .attr("width", container_artefact_info_width)
                .attr("height", definition['svg']['height'])
                .attr("preserveAspectRatio", "xMinYMax meet")
                .attr("viewBox", "0 0 " + container_artefact_info_width + " " + definition['svg']['height']);
            let name = info_svg.append("text")
                .attr("class", "svg-text")
                .attr("id", this.artefact_id + '-info')
                .attr("x", 0)
                .attr("y", definition['svg']['height'] - Math.max(10, (rect_y * 2) - 10))
                .attr("fill", definition['rect']['stroke']['colour'])
                .attr("vector-effects", "non-scaling-size")
                .text(definition['info']['text']);
        }

        let svg_transform = ""
        if (definition['svg']['align']) {
            if (definition['svg']['align'] === 'center') {
                svg_transform = "translate(" + (definition['svg']['width']/2 - icon_width/2) + " , 0)"
            } else if (definition['svg']['align'] === 'right') {
                svg_transform = "translate(" + (definition['svg']['width'] - icon_width - icon_spacing) + " , 0)"
            }
        }

        svg.append('g')
            .append("use")
            .attr("xlink:href","#" + def_id)
            .attr("transform", svg_transform);

        svg.append("title")
            .attr("id", this.artefact_id + '-title')
            .text(definition['data_type'] + ": " + definition['artefact']['display_name']);

        // Set common attributes on svg element and children
        svg.on("contextmenu", handleContextMenu)
            .on("dragenter",  dragEnter)
            .on("dragover",   dragOver)
            .on("dragleave",  dragLeave)
            .on("drop",       dragDrop)
            .on("dragend",    dragEnd)
            .attr("data-type",           definition['data_type'])
            .attr("data-okit-id",        this.artefact_id)
            .attr("data-parent-id",      this.parent_id)
            .attr("data-compartment-id", this.compartment_id)
            .selectAll("*")
            .attr("data-type",           definition['data_type'])
            .attr("data-okit-id",        this.artefact_id)
            .attr("data-parent-id",      this.parent_id)
            .attr("data-compartment-id", this.compartment_id);
        /*
        ** Add Properties Load Event to created svg. We require the definition of the local variable "me" so that it can
        ** be used in the function dur to the fact that using "this" in the function will refer to the function not the
        ** Artifact.
         */
        let me = this;
        svg.on("click", function() {
            me.loadSlidePanels();
            $('.highlight:not(' + jqId(me.artefact_id) +')').removeClass('highlight');
            $(jqId(me.artefact_id)).toggleClass('highlight');
            $(jqId(me.artefact_id)).hasClass('highlight') ? selectedArtefact = me.id : selectedArtefact = null;
            d3.event.stopPropagation();
        });
        console.groupEnd();
        return svg;
    }

    /*
    ** Load Slide Panels Functions
     */
    loadSlidePanels() {
        this.loadProperties();
        this.loadValueProposition();
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/empty.html");
    }


    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/oci.html");
    }

    /*
    ** Child Offset Functions
     */
    getChildOffset(child_type) {
        console.group('Getting Offset for ' + child_type);
        let offset = {dx: 0, dy: 0};
        if (this.getTopEdgeArtifacts().includes(child_type)) {
            console.info('Top Edge Artifact');
            offset = this.getTopEdgeChildOffset();
        } else if (this.getTopArtifacts().includes(child_type)) {
            console.info('Top Artifact');
            offset = this.getTopChildOffset();
        } else if (this.getContainerArtifacts().includes(child_type)) {
            console.info('Container Artifact');
            offset = this.getContainerChildOffset();
        } else if (this.getBottomArtifacts().includes(child_type)) {
            console.info('Bottom Artifact');
            offset = this.getBottomChildOffset();
        } else if (this.getBottomEdgeArtifacts().includes(child_type)) {
            console.info('Bottom Edge Artifact');
            offset = this.getBottomEdgeChildOffset();
        } else if (this.getLeftEdgeArtifacts().includes(child_type)) {
            console.info('Left Edge Artifact');
            offset = this.getLeftEdgeChildOffset();
        } else if (this.getLeftArtifacts().includes(child_type)) {
            console.info('Left Artifact');
            offset = this.getLeftChildOffset();
        } else if (this.getRightArtifacts().includes(child_type)) {
            console.info('Right Artifact');
            offset = this.getRightChildOffset();
        } else if (this.getRightEdgeArtifacts().includes(child_type)) {
            console.info('Right Edge Artifact');
            offset = this.getRightEdgeChildOffset();
        } else {
            console.warn(child_type + ' Not Found for ' + this.display_name);
        }
        console.groupEnd();
        return offset
    }

    getFirstChildOffset() {
        alert('Get First Child function "getFirstChildOffset()" has not been implemented.');
    }

    // Top Edge
    hasTopEdgeChildren() {
        let children = false;
        let key = this.getParentKey();
        for (let group of this.getTopEdgeArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact[key] === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getTopEdgeChildrenMaxDimensions() {
        let max_dimensions = {height: 0, width: 0};
        for (let group of this.getTopEdgeArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    let dimension = artefact.dimensions;
                    max_dimensions.height = Math.max(max_dimensions.height, dimension.height);
                    max_dimensions.width += Math.round(dimension.width + positional_adjustments.spacing.x);
                }
            }
        }
        return max_dimensions;
    }

    getFirstTopEdgeChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.padding.x * 2 + positional_adjustments.spacing.x * 2),
            dy: 0
        };
        return offset;
    }

    getTopEdgeChildOffset() {
        alert('Get First Top Edge Child function "getTopEdgeChildOffset()" has not been implemented.');
    }

    // Top
    hasTopChildren() {
        let children = false;
        for (let group of this.getTopArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getTopChildrenMaxDimensions() {
        let max_dimensions = {height: 0, width: 0};
        for (let group of this.getTopArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    let dimension = artefact.dimensions;
                    max_dimensions.height = Math.max(max_dimensions.height, dimension.height);
                    max_dimensions.width += Math.round(dimension.width + positional_adjustments.spacing.x);
                }
            }
        }
        return max_dimensions;
    }

    getFirstTopChildOffset() {
        let offset = this.getFirstLeftChildOffset();
        if (this.hasLeftChildren()) {
            offset.dx += Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x);
        }
        return offset;
    }

    getTopChildOffset() {
        alert('Get Top Child function "getTopEdgeChildOffset()" has not been implemented.');
    }

    // Container
    hasContainerChildren() {
        let children = false;
        for (let group of this.getContainerArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getContainerChildrenMaxDimensions() {
        let max_dimensions = {height: 0, width: 0};
        for (let group of this.getContainerArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    let dimension = artefact.dimensions;
                    max_dimensions.height += Math.round(dimension.height + positional_adjustments.spacing.y);
                    max_dimensions.width = Math.max(max_dimensions.width, dimension.width);
                }
            }
        }
        return max_dimensions;
    }

    getFirstContainerChildOffset() {
        let offset = this.getFirstTopChildOffset();
        if (this.hasTopChildren()) {
            let dimensions = this.getTopChildrenMaxDimensions();
            offset.dy += Math.round(dimensions.height + positional_adjustments.spacing.y);
        }
        return offset;
    }

    getContainerChildOffset() {
        alert('Get Container Child function "getContainerChildOffset()" has not been implemented.');
    }

    // Bottom
    hasBottomChildren() {
        let children = false;
        for (let group of this.getBottomArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getBottomChildrenMaxDimensions() {
        let max_dimensions = {height: 0, width: 0};
        for (let group of this.getBottomArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    let dimension = artefact.dimensions;
                    max_dimensions.height = Math.max(max_dimensions.height, dimension.height);
                    max_dimensions.width += Math.round(dimension.width + positional_adjustments.spacing.x);
                }
            }
        }
        return max_dimensions;
    }

    getFirstBottomChildOffset() {
        let offset = this.getFirstTopChildOffset();
        if (this.hasTopChildren()) {
            let dimensions = this.getTopChildrenMaxDimensions();
            offset.dy += Math.round(dimensions.height + positional_adjustments.spacing.y * 4);
        }
        if (this.hasContainerChildren()) {
            let dimensions = this.getContainerChildrenMaxDimensions();
            offset.dy += Math.round(dimensions.height + positional_adjustments.spacing.y);
        }
        return offset;
    }

    getBottomChildOffset() {
        alert('Get Bottom Child function "getBottomEdgeChildOffset()" has not been implemented.');
    }

    // Bottom Edge
    hasBottomEdgeChildren() {
        let children = false;
        for (let group of this.getBottomEdgeArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getBottomEdgeChildrenMaxDimensions() {
        let max_dimensions = {height: 0, width: 0};
        for (let group of this.getBottomEdgeArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    let dimension = artefact.dimensions;
                    max_dimensions.height = Math.max(max_dimensions.height, dimension.height);
                    max_dimensions.width += Math.round(dimension.width + positional_adjustments.spacing.x);
                }
            }
        }
        return max_dimensions;
    }

    getFirstBottomEdgeChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.spacing.x),
            dy: 0
        };
        return offset;
    }

    getBottomEdgeChildOffset() {
        alert('Get Bottom Edge Child function "getBottomEdgeChildOffset()" has not been implemented.');
    }

    // Left Edge
    getLeftEdgeChildOffset() {
        alert('Get Left Edge Child function "getLeftEdgeChildOffset()" has not been implemented.');
    }

    // Left
    hasLeftChildren() {
        let children = false;
        for (let group of this.getLeftArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getLeftChildrenMaxDimensions() {
        let max_dimensions = {height: 0, width: 0};
        for (let group of this.getLeftArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    let dimension = artefact.dimensions;
                    max_dimensions.height += Math.round(dimension.height + positional_adjustments.spacing.y);
                    max_dimensions.width = Math.max(max_dimensions.width, dimension.width);
                }
            }
        }
        return max_dimensions;
    }

    getFirstLeftChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.spacing.x * 4),
            dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
        };
        return offset;
    }

    getLeftChildOffset() {
        alert('Get Left Child function "getLeftEdgeChildOffset()" has not been implemented.');
    }

    // Right
    hasRightChildren() {
        let children = false;
        for (let group of this.getRightArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getRightChildrenMaxDimensions() {
        let max_dimensions = {height: 0, width: 0};
        for (let group of this.getRightArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    let dimension = artefact.dimensions;
                    max_dimensions.height += Math.round(dimension.height + positional_adjustments.spacing.y);
                    max_dimensions.width = Math.max(max_dimensions.width, dimension.width);
                }
            }
        }
        return max_dimensions;
    }

    getFirstRightChildOffset() {
        let offset = this.getFirstLeftChildOffset();
        if (this.hasLeftChildren()) {
            offset.dx += Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x);
        }
        if (this.hasContainerChildren()) {
            let dimensions = this.getContainerChildrenMaxDimensions();
            offset.dx += dimensions.width;
            offset.dx += positional_adjustments.spacing.x;
            offset.dx += positional_adjustments.padding.x;
        }
        return offset;
    }

    getRightChildOffset() {
        alert('Get Right Child function "getRightEdgeChildOffset()" has not been implemented.');
    }

    // Right Edge
    hasRightEdgeChildren() {
        let children = false;
        for (let group of this.getRightEdgeArtifacts()) {
            for(let artefact of this.json_view[this.artefact.artefactToElement(group)]) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getFirstRightEdgeChildOffset() {
        let offset = {
            dx: Math.round(this.dimensions.width - icon_width),
            dy: Math.round(positional_adjustments.padding.x)
        };
        return offset;
    }

    getRightEdgeChildOffset() {
        alert('Get Right Edge Child function "getRightEdgeChildOffset()" has not been implemented.');
    }


    /*
    ** Child Type Functions
     */
    getTopEdgeArtifacts() {
        return [];
    }

    getTopArtifacts() {
        return [];
    }

    getContainerArtifacts() {
        return [];
    }

    getBottomArtifacts() {
        return [];
    }

    getBottomEdgeArtifacts() {
        return [];
    }

    getLeftEdgeArtifacts() {
        return [];
    }

    getLeftArtifacts() {
        return [];
    }

    getRightArtifacts() {
        return [];
    }

    getRightEdgeArtifacts() {
        return [];
    }

    /*
    ** Default name generation
     */

    generateConnectorId(sourceid, destinationid) {
        return sourceid + '-' + destinationid;
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        alert('Get Artifact Reference function "getArtifactReference()" has not been implemented.');
        return;
    }

    static getDropTargets() {
        console.warn('Get Drop Targets not implements');
        return [];
    }

    static getConnectTargets() {
        console.warn('Get Connect Targets not implements');
        return [];
    }

    /*
    ** Instance Versions of Static Functions
     */

    getArtifactReference() {
        return this.constructor.getArtifactReference();
    }

    getDropTargets() {
        // Return list of Artifact names
        return this.constructor.getDropTargets();
    }

    getConnectTargets() {
        return this.constructor.getgetConnectTargets();
    }

}

/*
** Container Artefact View class for Compartments / VCN / Subnets that can contain other artefacts.
 */
class OkitContainerArtefactView extends OkitArtefactView {
    constructor(artefact = null, json_view) {
        super(artefact, json_view);
    }

    get dimensions() {
        console.group(`Getting Dimensions of ${this.getArtifactReference() } : ${this.display_name} (${this.artefact_id})`);
        let padding = this.getPadding();
        let dimensions = {width: 0, height: 0};
        let offset = {dx: 0, dy: 0};
        // Process Top Edge Artifacts
        offset = this.getFirstTopEdgeChildOffset();
        let top_edge_dimensions = this.getTopEdgeChildrenMaxDimensions();
        dimensions.width  = Math.max(dimensions.width, top_edge_dimensions.width + offset.dx - padding.dx);
        dimensions.height = Math.max(dimensions.height, top_edge_dimensions.height);
        // Process Bottom Edge Artifacts
        offset = this.getFirstBottomEdgeChildOffset();
        let bottom_edge_dimensions = this.getBottomEdgeChildrenMaxDimensions();
        dimensions.width  = Math.max(dimensions.width, bottom_edge_dimensions.width);
        dimensions.height = Math.max(dimensions.height, bottom_edge_dimensions.height);
        // Process Top Artifacts
        offset = this.getFirstTopChildOffset();
        let top_dimensions = this.getTopChildrenMaxDimensions();
        dimensions.width   = Math.max(dimensions.width, top_dimensions.width);
        dimensions.height += top_dimensions.height;
        // Process Container Artifacts
        offset = this.getFirstContainerChildOffset();
        let container_dimensions = this.getContainerChildrenMaxDimensions();
        dimensions.width   = Math.max(dimensions.width, container_dimensions.width);
        dimensions.height += container_dimensions.height;
        // Process Bottom Artifacts
        offset = this.getFirstBottomChildOffset();
        let bottom_dimensions = this.getBottomChildrenMaxDimensions();
        dimensions.width   = Math.max(dimensions.width, bottom_dimensions.width);
        dimensions.height += bottom_dimensions.height;
        // Process Left Edge Artifacts
        // Process Right Edge Artifacts
        // Process Left Artifacts
        let left_dimensions = this.getLeftChildrenMaxDimensions();
        dimensions.width += left_dimensions.width;
        dimensions.height = Math.max(dimensions.height, left_dimensions.height);
        // Process Right Artifacts
        let right_dimensions = this.getRightChildrenMaxDimensions();
        dimensions.width += right_dimensions.width;
        dimensions.height = Math.max(dimensions.height, right_dimensions.height);
        if (this.hasRightChildren()) {
            dimensions.width += positional_adjustments.spacing.x;
            dimensions.width += positional_adjustments.padding.x;
        }
        // Add Padding
        dimensions.width += padding.dx * 2;
        dimensions.height += padding.dy * 2;
        // Check size against minimum
        dimensions['width']  = Math.max(dimensions['width'],  this.minimum_dimensions.width);
        dimensions['height'] = Math.max(dimensions['height'], this.minimum_dimensions.height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.groupEnd();
        return dimensions;
    }

    /*
    ** SVG Functions
     */
    getPadding() {
        let padding = {
            dx: Math.round(positional_adjustments.spacing.x * 4),
            dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
        };
        return padding;
    }

    getChildTypes() {
        let child_types = this.getContainerArtifacts().concat(
            this.getLeftEdgeArtifacts(),   this.getLeftArtifacts(),
            this.getRightEdgeArtifacts(),  this.getRightArtifacts(),
            this.getTopEdgeArtifacts(),    this.getTopArtifacts(),
            this.getBottomEdgeArtifacts(), this.getBottomArtifacts()
        );
        console.info('Child Types : ' + child_types);
        return child_types;
    }

    getChildElements() {
        let child_elements = [];
        this.getChildTypes().forEach(element => child_elements.push(this.artefact.artefactToElement(element)));
        return child_elements;
    }

    /*
    ** Child Offset Functions
     */
    getTopEdgeChildOffset() {
        let offset = this.getFirstTopEdgeChildOffset();
        // Count how many top edge children and adjust.
        let count = 0;
        for (let child of this.getTopEdgeArtifacts()) {
            count += $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").length;
        }
        console.info('Top Edge Count : ' + count);
        // Increment x position based on count
        offset.dx += Math.round((icon_width * count) + (positional_adjustments.spacing.x * count));
        return offset;
    }

    getTopChildOffset() {
        let offset = this.getFirstTopChildOffset();
        for (let child of this.getTopArtifacts()) {
            $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").each(
                function() {
                    offset.dx += Math.round(Number($(this).attr('width')) + positional_adjustments.spacing.x);
                });
        }
        return offset;
    }

    getContainerChildOffset() {
        console.info('Get Container Child Offset');
        let offset = this.getFirstContainerChildOffset();
        // Count how many top edge children and adjust.
        for (let child of this.getContainerArtifacts()) {
            //console.info('Container Child Count : ' + $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "'][data-parent-id='" + this.id + "']").length);
            $(jqId(this.id + '-svg')).children('svg[data-type="' + child + '"][data-parent-id="' + this.id + '"]').each(
                function() {
                    offset.dy += Math.round(Number($(this).attr('height')) + positional_adjustments.spacing.y);
                });
        }
        console.info('Offset : ' + JSON.stringify(offset));
        return offset;
    }

    getBottomChildOffset() {
        let offset = this.getFirstBottomChildOffset();
        for (let child of this.getBottomArtifacts()) {
            $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").each(
                function() {
                    offset.dx += Math.round(Number($(this).attr('width')) + positional_adjustments.spacing.x);
                });
        }
        return offset;
    }

    getBottomEdgeChildOffset() {}

    getLeftEdgeChildOffset() {}

    getLeftChildOffset() {
        let offset = this.getFirstLeftChildOffset();
        for (let child of this.getLeftArtifacts()) {
            $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").each(
                function() {
                    offset.dy += Math.round(icon_height + positional_adjustments.spacing.y);
                });
        }
        return offset;
    }

    getRightChildOffset() {
        let offset = this.getFirstRightChildOffset();
        for (let child of this.getRightArtifacts()) {
            $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").each(
                function() {
                    offset.dy += Math.round(icon_height + positional_adjustments.spacing.y);
                });
        }
        return offset;
    }

    getRightEdgeChildOffset() {
        let offset = this.getFirstRightEdgeChildOffset();
        for (let child of this.getRightEdgeArtifacts()) {
            $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").each(
                function() {
                    offset.dy += Math.round(icon_height + positional_adjustments.spacing.y);
                });
        }
        return offset;
    }

}

let okitJsonView = null;
