/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT View Javascript');

class OkitJsonView {
    constructor(okitjson=null) {
        // Specify / Assign Model
        if (okitjson === null || okitjson === undefined) {
            this.okitjson = new OkitJson();
        } else if (typeof okitjson === 'string') {
            this.okitjson = new OkitJson(okitjson);
        } else if (okitjson instanceof Object) {
            this.okitjson = okitjson;
        } else {
            this.okitjson = new OkitJson();
        }
        // Define View Lists
        this.compartments = [];
        this.autonomous_databases = [];
        this.block_storage_volumes = [];
        this.database_systems = [];
        this.dynamic_routing_gateways = [];
        this.fast_connects = [];
        this.file_storage_systems = [];
        this.instances = [];
        this.instance_clusters = [];
        this.internet_gateways = [];
        this.load_balancers = [];
        this.local_peering_gateways = [];
        this.nat_gateways = [];
        this.network_security_groups = [];
        this.object_storage_buckets = [];
        this.oke_clusters = [];
        this.remote_peering_gateways = [];
        this.route_tables = [];
        this.security_lists = [];
        this.service_gateways = [];
        this.subnets = [];
        this.virtual_cloud_networks = [];
        // Load Model to View
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
        for (let artefact of this.okitjson.compartments) {this.newCompartment(artefact);}
        for (let artefact of this.okitjson.autonomous_databases) {this.newAutonomousDatabase(artefact);}
        for (let artefact of this.okitjson.block_storage_volumes) {this.newBlockStorageVolume(artefact);}
        for (let artefact of this.okitjson.database_systems) {this.newDatabaseSystem(artefact);}
        for (let artefact of this.okitjson.dynamic_routing_gateways) {this.newDynamicRoutingGateway(artefact);}
        for (let artefact of this.okitjson.fast_connects) {this.newFastConnect(artefact);}
        for (let artefact of this.okitjson.file_storage_systems) {this.newFileStorageSystem(artefact);}
        for (let artefact of this.okitjson.instances) {this.newInstance(artefact);}
        for (let artefact of this.okitjson.internet_gateways) {this.newInternetGateway(artefact);}
        for (let artefact of this.okitjson.load_balancers) {this.newLoadBalancer(artefact);}
        for (let artefact of this.okitjson.local_peering_gateways) {this.newLocalPeeringGateway(artefact);}
        for (let artefact of this.okitjson.nat_gateways) {this.newNATGateway(artefact);}
        for (let artefact of this.okitjson.network_security_groups) {this.newNetworkSecurityGroup(artefact);}
        for (let artefact of this.okitjson.object_storage_buckets) {this.newObjectStorageBucket(artefact);}
        //for (let artefact of this.okitjson.remote_peering_gateways) {this.newRemotePeeringGateway(artefact);}
        for (let artefact of this.okitjson.route_tables) {this.newRouteTable(artefact);}
        for (let artefact of this.okitjson.security_lists) {this.newSecurityList(artefact);}
        for (let artefact of this.okitjson.service_gateways) {this.newServiceGateway(artefact);}
        for (let artefact of this.okitjson.subnets) {this.newSubnet(artefact);}
        for (let artefact of this.okitjson.virtual_cloud_networks) {this.newVirtualCloudNetwork(artefact);}
    }

    update(model) {
        if (model && model != null )
        {
            this.okitjson = model;
        }
        this.load();
        this.draw();
        console.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Updating View With Model>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.info(this);
        console.info(okitJsonView);
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
        if (target.type === Subnet.getArtifactReference()) {
            view_artefact.getArtefact().subnet_id = target.id;
            view_artefact.getArtefact().compartment_id = target.compartment_id;
        } else if (target.type === Compartment.getArtifactReference()) {
            view_artefact.getArtefact().compartment_id = target.id;
        }
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
    deleteAutonomousDatabase(id='') {
        this.okitjson.deleteAutonomousDatabase(id);
        this.update();
    }
    loadAutonomousDatabases(autonomous_databases) {
        for (const artefact of autonomous_databases) {
            this.autonomous_databases.push(new AutonomousDatabaseView(new AutonomousDatabase(artefact, this.okitjson), this));
        }
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
    deleteBlockStorageVolume(id='') {
        this.okitjson.deleteBlockStorageVolume(id);
        this.update();
    }
    loadBlockStorageVolumes(block_storage_volumes) {
        for (const artefact of block_storage_volumes) {
            this.block_storage_volumes.push(new BlockStorageVolumeView(new BlockStorageVolume(artefact, this.okitjson), this));
        }
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
        console.info('New Compartment View ' + compartment);
        this.compartments.push(compartment ? new CompartmentView(compartment, this) : new CompartmentView(this.okitjson.newCompartment(), this));
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
    deleteCompartment(id='') {
        this.okitjson.deleteCompartment(id);
        this.update();
    }
    loadCompartments(compartments) {
        for (const artefact of compartments) {
            this.compartments.push(new CompartmentView(new Compartment(artefact, this.okitjson), this));
        }
        console.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Loaded Compartments>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.info(this);
    }

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
    deleteDatabaseSystem(id='') {
        this.okitjson.deleteDatabaseSystem(id);
        this.update();
    }
    loadDatabaseSystems(database_systems) {
        for (const artefact of database_systems) {
            this.database_systems.push(new DatabaseSystemView(new DatabaseSystem(artefact, this.okitjson), this));
        }
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
    deleteDynamicRoutingGateway(id='') {
        this.okitjson.deleteDynamicRoutingGateway(id);
        this.update();
    }
    loadDynamicRoutingGateways(dynamic_routing_gateways) {
        for (const artefact of dynamic_routing_gateways) {
            this.dynamic_routing_gateways.push(new DynamicRoutingGatewayView(new DynamicRoutingGateway(artefact, this.okitjson), this));
        }
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
    deleteFastConnect(id='') {
        this.okitjson.deleteFastConnect(id);
        this.update();
    }
    loadFastConnects(fast_connects) {
        for (const artefact of fast_connects) {
            this.fast_connects.push(new FastConnectView(new FastConnect(artefact, this.okitjson), this));
        }
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
    deleteFileStorageSystem(id='') {
        this.okitjson.deleteFileStorageSystem(id);
        this.update();
    }
    loadFileStorageSystems(file_storage_systems) {
        for (const artefact of file_storage_systems) {
            this.file_storage_systems.push(new FileStorageSystemView(new FileStorageSystem(artefact, this.okitjson), this));
        }
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
                console.info(artefact);
                return artefact;
            }
        }
        return undefined;
    }
    deleteInstance(id='') {
        this.okitjson.deleteInstance(id);
        this.update();
    }
    loadInstances(instances) {
        for (const artefact of instances) {
            this.instances.push(new InstanceView(new Instance(artefact, this.okitjson), this));
        }
    }

    // InstancePool
    dropInstancePoolView(target) {
        console.info('Drop InstancePool View');
        console.info(target);
        let view_artefact = this.newInstancePool();
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
    newInstancePool(instance_pool) {
        this.instance_pools.push(instance_pool ? new InstancePoolView(instance_pool, this) : new InstancePoolView(this.okitjson.newInstancePool(), this));
        return this.instance_pools[this.instance_pools.length - 1];
    }
    getInstancePools() {
        return this.instances;
    }
    getInstancePool(id='') {
        for (let artefact of this.getInstancePools()) {
            if (artefact.id === id) {
                console.info(artefact);
                return artefact;
            }
        }
        return undefined;
    }
    deleteInstancePool(id='') {
        this.okitjson.deleteInstancePool(id);
        this.update();
    }
    loadInstancePools(instance_pools) {
        for (const artefact of instance_pools) {
            this.instance_pools.push(new InstancePoolView(new InstancePool(artefact, this.okitjson), this));
        }
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
    deleteInternetGateway(id='') {
        this.okitjson.deleteInternetGateway(id);
        this.update();
    }
    loadInternetGateways(internet_gateways) {
        for (const artefact of internet_gateways) {
            this.internet_gateways.push(new InternetGatewayView(new InternetGateway(artefact, this.okitjson), this));
        }
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
    deleteLoadBalancer(id='') {
        this.okitjson.deleteLoadBalancer(id);
        this.update();
    }
    loadLoadBalancers(load_balancers) {
        for (const artefact of load_balancers) {
            this.load_balancers.push(new LoadBalancerView(new LoadBalancer(artefact, this.okitjson), this));
        }
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
    deleteLocalPeeringGateway(id='') {
        this.okitjson.deleteLocalPeeringGateway(id);
        this.update();
    }
    loadLocalPeeringGateways(local_peering_gateways) {
        for (const artefact of local_peering_gateways) {
            this.local_peering_gateways.push(new LocalPeeringGatewayView(new LocalPeeringGateway(artefact, this.okitjson), this));
        }
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
    deleteNATGateway(id='') {
        this.okitjson.deleteNATGateway(id);
        this.update();
    }
    loadNATGateways(nat_gateways) {
        for (const artefact of nat_gateways) {
            this.nat_gateways.push(new NATGatewayView(new NATGateway(artefact, this.okitjson), this));
        }
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
    deleteNetworkSecurityGroup(id='') {
        this.okitjson.deleteNetworkSecurityGroup(id);
        this.update();
    }
    loadNetworkSecurityGroups(network_security_groups) {
        for (const artefact of network_security_groups) {
            this.network_security_groups.push(new NetworkSecurityGroupView(new NetworkSecurityGroup(artefact, this.okitjson), this));
        }
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
    deleteObjectStorageBucket(id='') {
        this.okitjson.deleteObjectStorageBucket(id);
        this.update();
    }
    loadObjectStorageBuckets(object_storage_buckets) {
        for (const artefact of object_storage_buckets) {
            this.object_storage_buckets.push(new ObjectStorageBucketView(new ObjectStorageBucket(artefact, this.okitjson), this));
        }
    }

    // OkeCluster
    dropOkeClusterView(target) {
        console.info('Drop OKE Cluster View');
        console.info(target);
        let view_artefact = this.newOkeCluster();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        console.info('View Artefact');
        console.info(view_artefact)
        return view_artefact;
    }
    newOkeCluster(cluster) {
        this.oke_clusters.push(cluster ? new OkeClusterView(cluster, this) : new OkeClusterView(this.okitjson.newOkeCluster(), this));
        return this.oke_clusters[this.oke_clusters.length - 1];
    }
    getOkeClusters() {
        return this.oke_clusters;
    }
    getOkeCluster(id='') {
        for (let artefact of this.getOkeClusters()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteOkeCluster() {
        this.okitjson.deleteOkeCluster(id);
        this.update();
    }
    loadOkeClusters(oke_clusters) {
        for (const artefact of oke_clusters) {
            this.oke_clusters.push(new OkeClusterView(new OkeCluster(artefact, this.okitjson), this));
        }
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
    deleteRouteTable(id='') {
        this.okitjson.deleteRouteTable(id);
        this.update();
    }
    loadRouteTables(route_tables) {
        for (const artefact of route_tables) {
            this.route_tables.push(new RouteTableView(new RouteTable(artefact, this.okitjson), this));
        }
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
    deleteSecurityList(id='') {
        this.okitjson.deleteSecurityList(id);
        this.update();
    }
    loadSecurityLists(security_lists) {
        for (const artefact of security_lists) {
            this.security_lists.push(new SecurityListView(new SecurityList(artefact, this.okitjson), this));
        }
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
    deleteServiceGateway(id='') {
        this.okitjson.deleteServiceGateway(id);
        this.update();
    }
    loadServiceGateways(service_gateways) {
        for (const artefact of service_gateways) {
            this.service_gateways.push(new ServiceGatewayView(new ServiceGateway(artefact, this.okitjson), this));
        }
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
    deleteSubnet(id='') {
        this.okitjson.deleteSubnet(id);
        this.update();
    }
    loadSubnets(subnets) {
        for (const artefact of subnets) {
            this.subnets.push(new SubnetView(new Subnet(artefact, this.okitjson), this));
        }
    }

    // Virtual Cloud Network
    dropVirtualCloudNetworkView(target) {
        console.info('Drop Virtual Cloud Network View');
        console.info(target);
        let view_artefact = this.newVirtualCloudNetwork();
        view_artefact.getArtefact().compartment_id = target.id;
        console.info('View Artefact');
        console.info(view_artefact)
        if (okitSettings.is_default_route_table) {
            console.info('Creating Default Route Table');
            let route_table = this.newRouteTable(this.getOkitJson().newRouteTable({vcn_id: view_artefact.id, compartment_id: view_artefact.compartment_id}));
        }
        if (okitSettings.is_default_security_list) {
            console.info('Creating Default Security List');
            let security_list = this.newSecurityList(this.getOkitJson().newSecurityList({vcn_id: view_artefact.id, compartment_id: view_artefact.compartment_id}));
            security_list.artefact.addDefaultSecurityListRules(view_artefact.artefact.cidr_block);
        }
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
    deleteVirtualCloudNetwork(id='') {
        this.okitjson.deleteVirtualCloudNetwork(id);
        this.update();
    }
    loadVirtualCloudNetworks(virtual_cloud_networks) {
        for (const artefact of virtual_cloud_networks) {
            this.virtual_cloud_networks.push(new VirtualCloudNetworkView(new VirtualCloudNetwork(artefact, this.okitjson), this));
        }
    }

    // Virtual Network Interface
    newVirtualNetworkInterface(vnic) {
        this.virtual_network_interfaces.push(vnic ? new VirtualNetworkInterfaceView(vnic, this) : new VirtualNetworkInterfaceView(this.okitjson.newVirtualNetworkInterface(), this));
        return this.virtual_network_interfaces[this.virtual_network_interfaces.length - 1];
    }
    getVirtualNetworkInterfaces() {}
    getVirtualNetworkInterface(id='') {}
    deleteVirtualNetworkInterface(id='') {}

    // Fragment
    dropFragmentView(target) {
        console.info('Drop Fragment View');
        console.info(target);
        let view_artefact = this.newFragment(target);
        view_artefact.load();
    }
    newFragment(target) {
        return new FragmentView(this.okitjson.newFragment(target), this);
    }

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
    get id() {return this.artefact ? this.artefact.id : '';}
    get artefact_id() {return this.artefact ? this.artefact.id : '';}
    get compartment_id() {return this.artefact ? this.artefact.compartment_id : '';}
    get parent_id() {return null;}
    get display_name() {return this.artefact ? this.artefact.display_name : '';}
    get icon_width() {return 45;}
    get icon_height() {return 45;}
    get icon_dimensions() {return {width: this.icon_width, height: this.icon_height};}
    get collapsed_dimensions() {return this.icon_dimensions;}
    get minimum_width() {return this.icon_width;}
    get minimum_height() {return this.icon_height;}
    get minimum_dimensions() {return {width: this.minimum_width, height: this.minimum_height};}
    get dimensions() {return this.minimum_dimensions;}
    get attached() {return false;}

    getParent() {return null;}

    getParentId() {return this.parent_id;}

    // TODO: Delete replaced by attached variable
    isAttached() {return false;}

    getArtefact() {return this.artefact;}

    getOkitJson() {return this.okit_json;}

    newSVGDefinition() {
        let definition = {};
        definition['artefact'] = this.artefact;
        definition['data_type'] = this.artefact ? this.artefact.getArtifactReference() : '';
        definition['name'] = {show: false, text: this.display_name };
        definition['label'] = {show: false, text: this.artefact ? this.artefact.getArtifactReference() : ''};
        definition['info'] = {show: false, text: this.artefact ? this.artefact.getArtifactReference() : ''};
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
        console.group(`Drawing ${this.getArtifactReference()} : ${this.display_name} (${this.artefact_id}) [${this.parent_id}]`);
        // Get Definition from Sub class
        let definition = this.getSvgDefinition();
        /*
        ** Draw Artefact based of returned definition.
         */
        let parent_svg_id  = this.parent_id + "-svg";
        let def_id         = definition['data_type'].replace(/ /g, '') + 'Svg';
        console.info('Creating ' + this.getArtifactReference() + ' ' + this.display_name);
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
            .text(this.display_name);

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

    delete() {
        // Remove SVG Element
        if ($(jqId(this.id + "-svg")).length) {$(jqId(this.id + "-svg")).remove()}
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
