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
        this.clear();
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
    get top_level_compartment() {let tlc = this.getCompartments().filter(compartment => compartment.isTopLevel())[0]; console.info(`TLC ${tlc}`); console.info(tlc); return tlc;}

    drop(source, target) {
        let newFunction = 'new' + source.name;
        let getFunction = 'get' + target.type.split(' ').join('');
    }

    clear() {
        this.compartments = [];
        this.autonomous_databases = [];
        this.block_storage_volumes = [];
        this.customer_premise_equipments = [];
        this.database_systems = [];
        this.dynamic_routing_gateways = [];
        this.fast_connects = [];
        this.file_storage_systems = [];
        this.instances = [];
        this.instance_pools = [];
        this.internet_gateways = [];
        this.ipsec_connections = [];
        this.load_balancers = [];
        this.local_peering_gateways = [];
        this.mysql_database_systems = [];
        this.nat_gateways = [];
        this.network_security_groups = [];
        this.object_storage_buckets = [];
        this.oke_clusters = [];
        this.remote_peering_connections = [];
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
        for (let artefact of this.okitjson.customer_premise_equipments) {this.newCustomerPremiseEquipment(artefact);}
        for (let artefact of this.okitjson.database_systems) {this.newDatabaseSystem(artefact);}
        for (let artefact of this.okitjson.dynamic_routing_gateways) {this.newDynamicRoutingGateway(artefact);}
        for (let artefact of this.okitjson.fast_connects) {this.newFastConnect(artefact);}
        for (let artefact of this.okitjson.file_storage_systems) {this.newFileStorageSystem(artefact);}
        for (let artefact of this.okitjson.instances) {this.newInstance(artefact);}
        for (let artefact of this.okitjson.instance_pools) {this.newInstancePool(artefact);}
        for (let artefact of this.okitjson.internet_gateways) {this.newInternetGateway(artefact);}
        for (let artefact of this.okitjson.ipsec_connections) {this.newIPSecConnection(artefact);}
        for (let artefact of this.okitjson.load_balancers) {this.newLoadBalancer(artefact);}
        for (let artefact of this.okitjson.local_peering_gateways) {this.newLocalPeeringGateway(artefact);}
        for (let artefact of this.okitjson.mysql_database_systems) {this.newMySQLDatabaseSystem(artefact);}
        for (let artefact of this.okitjson.nat_gateways) {this.newNATGateway(artefact);}
        for (let artefact of this.okitjson.network_security_groups) {this.newNetworkSecurityGroup(artefact);}
        for (let artefact of this.okitjson.object_storage_buckets) {this.newObjectStorageBucket(artefact);}
        for (let artefact of this.okitjson.oke_clusters) {this.newOkeCluster(artefact);}
        for (let artefact of this.okitjson.remote_peering_connections) {this.newRemotePeeringConnection(artefact);}
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
    }

    draw(for_export=false) {
        console.warn('draw() function has not been implemented.');
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
        let view_artefact = this.newAutonomousDatabase();
        if (target.type === Subnet.getArtifactReference()) {
            view_artefact.getArtefact().subnet_id = target.id;
            view_artefact.getArtefact().compartment_id = target.compartment_id;
        } else if (target.type === Compartment.getArtifactReference()) {
            view_artefact.getArtefact().compartment_id = target.id;
        }
        view_artefact.recalculate_dimensions = true;
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
    loadAutonomousDatabases(autonomous_databases) {
        for (const artefact of autonomous_databases) {
            this.autonomous_databases.push(new AutonomousDatabaseView(new AutonomousDatabase(artefact, this.okitjson), this));
        }
    }

    // Block Storage
    dropBlockStorageVolumeView(target) {
        let view_artefact = this.newBlockStorageVolume();
        view_artefact.getArtefact().compartment_id = target.id;
        view_artefact.recalculate_dimensions = true;
        return view_artefact;
    }
    newBlockStorageVolume(volume) {
        this.block_storage_volumes.push(volume ? new BlockStorageVolumeView(volume, this) : new BlockStorageVolumeView(this.okitjson.newBlockStorageVolume(), this));
        return this.block_storage_volumes[this.block_storage_volumes.length - 1];
    }
    getBlockStorageVolumes() {return this.block_storage_volumes;}
    getBlockStorageVolume(id='') {
        for (let artefact of this.getBlockStorageVolumes()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    loadBlockStorageVolumes(block_storage_volumes) {
        for (const artefact of block_storage_volumes) {
            this.block_storage_volumes.push(new BlockStorageVolumeView(new BlockStorageVolume(artefact, this.okitjson), this));
        }
    }

    // Compartment
    dropCompartmentView(target) {
        let view_artefact = this.newCompartment();
        view_artefact.getArtefact().compartment_id = target.type === Compartment.getArtifactReference() ? target.id : target.compartment_id;
        view_artefact.recalculate_dimensions = true;
        return view_artefact;
    }
    newCompartment(compartment) {
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
    loadCompartments(compartments) {
        for (const artefact of compartments) {
            this.compartments.push(new CompartmentView(new Compartment(artefact, this.okitjson), this));
        }
    }
    loadCompartmentsSelect(select_id, empty_option=false) {
        $(jqId(select_id)).empty();
        const compartment_select = $(jqId(select_id));
        if (empty_option) {
            compartment_select.append($('<option>').attr('value', '').text(''));
        }
        for (let compartment of this.getCompartments()) {
            compartment_select.append($('<option>').attr('value', compartment.id).text(compartment.display_name));
        }
    }

    // Customer Premise Equipment
    dropCustomerPremiseEquipmentView(target) {
        let view_artefact = this.newCustomerPremiseEquipment();
        view_artefact.getArtefact().compartment_id = target.id;
        view_artefact.recalculate_dimensions = true;
        return view_artefact;
    }
    newCustomerPremiseEquipment(connect) {
        this.customer_premise_equipments.push(connect ? new CustomerPremiseEquipmentView(connect, this) : new CustomerPremiseEquipmentView(this.okitjson.newCustomerPremiseEquipment(), this));
        return this.customer_premise_equipments[this.customer_premise_equipments.length - 1];
    }
    getCustomerPremiseEquipments() {
        return this.customer_premise_equipments;
    }
    getCustomerPremiseEquipment(id='') {
        for (let artefact of this.getCustomerPremiseEquipments()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    loadCustomerPremiseEquipments(fast_connects) {
        for (const artefact of fast_connects) {
            this.customer_premise_equipments.push(new CustomerPremiseEquipmentView(new CustomerPremiseEquipment(artefact, this.okitjson), this));
        }
    }

    // Database System
    dropDatabaseSystemView(target) {
        let view_artefact = this.newDatabaseSystem();
        view_artefact.getArtefact().subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
    loadDatabaseSystems(database_systems) {
        for (const artefact of database_systems) {
            this.database_systems.push(new DatabaseSystemView(new DatabaseSystem(artefact, this.okitjson), this));
        }
    }

    // Dynamic Routing Gateway
    dropDynamicRoutingGatewayView(target) {
        let view_artefact = this.newDynamicRoutingGateway();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
    loadDynamicRoutingGateways(dynamic_routing_gateways) {
        for (const artefact of dynamic_routing_gateways) {
            this.dynamic_routing_gateways.push(new DynamicRoutingGatewayView(new DynamicRoutingGateway(artefact, this.okitjson), this));
        }
    }

    // Fast Connect
    dropFastConnectView(target) {
        let view_artefact = this.newFastConnect();
        view_artefact.getArtefact().compartment_id = target.id;
        view_artefact.recalculate_dimensions = true;
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
    loadFastConnects(fast_connects) {
        for (const artefact of fast_connects) {
            this.fast_connects.push(new FastConnectView(new FastConnect(artefact, this.okitjson), this));
        }
    }

    // File Storage System
    dropFileStorageSystemView(target) {
        // Pass in subnet so we create a default mount
        let view_artefact = this.newFileStorageSystem(this.okitjson.newFileStorageSystem({subnet_id: target.id}));
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
    loadFileStorageSystems(file_storage_systems) {
        for (const artefact of file_storage_systems) {
            this.file_storage_systems.push(new FileStorageSystemView(new FileStorageSystem(artefact, this.okitjson), this));
        }
    }

    // Instance
    dropInstanceView(target) {
        let view_artefact = this.newInstance();
        if (target.type === Subnet.getArtifactReference()) {
            view_artefact.getArtefact().primary_vnic.subnet_id = target.id;
            view_artefact.getArtefact().compartment_id = target.compartment_id;
        } else if (target.type === Compartment.getArtifactReference()) {
            view_artefact.getArtefact().compartment_id = target.id;
        }
        view_artefact.recalculate_dimensions = true;
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
    loadInstances(instances) {
        for (const artefact of instances) {
            this.instances.push(new InstanceView(new Instance(artefact, this.okitjson), this));
        }
    }

    // InstancePool
    dropInstancePoolView(target) {
        let view_artefact = this.newInstancePool();
        view_artefact.getArtefact().placement_configurations[0].primary_subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
                return artefact;
            }
        }
        return undefined;
    }
    loadInstancePools(instance_pools) {
        for (const artefact of instance_pools) {
            this.instance_pools.push(new InstancePoolView(new InstancePool(artefact, this.okitjson), this));
        }
    }

    // Internet Gateway
    dropInternetGatewayView(target) {
        // Check if Gateway Already exists
        for (let gateway of this.internet_gateways) {
            if (gateway.vcn_id === target.id) {
                alert('The maximum limit of 1 Internet Gateway per Virtual Cloud Network has been exceeded for ' + this.getVirtualCloudNetwork(target.id).display_name);
                return null;
            }
        }
        let view_artefact = this.newInternetGateway();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
    loadInternetGateways(internet_gateways) {
        for (const artefact of internet_gateways) {
            this.internet_gateways.push(new InternetGatewayView(new InternetGateway(artefact, this.okitjson), this));
        }
    }

    // IPSec Connection
    dropIPSecConnectionView(target) {
        let view_artefact = this.newIPSecConnection();
        view_artefact.getArtefact().compartment_id = target.id;
        view_artefact.recalculate_dimensions = true;
        return view_artefact;
    }
    newIPSecConnection(connect) {
        this.ipsec_connections.push(connect ? new IPSecConnectionView(connect, this) : new IPSecConnectionView(this.okitjson.newIPSecConnection(), this));
        return this.ipsec_connections[this.ipsec_connections.length - 1];
    }
    getIPSecConnections() {
        return this.ipsec_connections;
    }
    getIPSecConnection(id='') {
        for (let artefact of this.getIPSecConnections()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    loadIPSecConnections(fast_connects) {
        for (const artefact of fast_connects) {
            this.ipsec_connections.push(new IPSecConnectionView(new IPSecConnection(artefact, this.okitjson), this));
        }
    }

    // Load Balancer
    dropLoadBalancerView(target) {
        let view_artefact = this.newLoadBalancer();
        view_artefact.getArtefact().subnet_ids.push(target.id);
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
        return view_artefact;
    }
    newLoadBalancer(loadbalancer) {
        this.load_balancers.push(loadbalancer ? new LoadBalancerView(loadbalancer, this) : new LoadBalancerView(this.okitjson.newLoadBalancer(), this));
        return this.load_balancers[this.load_balancers.length - 1];
    }
    getLoadBalancers() {
        return this.load_balancers;
    }
    getLoadBalancer(id='') {
        for (let artefact of this.getLoadBalancers()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    loadLoadBalancers(load_balancers) {
        for (const artefact of load_balancers) {
            this.load_balancers.push(new LoadBalancerView(new LoadBalancer(artefact, this.okitjson), this));
        }
    }

    // Local Peering Gateway
    dropLocalPeeringGatewayView(target) {
        let view_artefact = this.newLocalPeeringGateway();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
    loadLocalPeeringGateways(local_peering_gateways) {
        for (const artefact of local_peering_gateways) {
            this.local_peering_gateways.push(new LocalPeeringGatewayView(new LocalPeeringGateway(artefact, this.okitjson), this));
        }
    }

    // MySQL Database System
    dropMySQLDatabaseSystemView(target) {
        let view_artefact = this.newMySQLDatabaseSystem();
        view_artefact.getArtefact().subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
        return view_artefact;
    }
    newMySQLDatabaseSystem(database) {
        this.mysql_database_systems.push(database ? new MySQLDatabaseSystemView(database, this) : new MySQLDatabaseSystemView(this.okitjson.newMySQLDatabaseSystem(), this));
        return this.mysql_database_systems[this.mysql_database_systems.length - 1];
    }
    getMySQLDatabaseSystems() {
        return this.mysql_database_systems;
    }
    getMySQLDatabaseSystem(id='') {
        for (let artefact of this.getMySQLDatabaseSystems()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    loadMySQLDatabaseSystems(database_systems) {
        for (const artefact of database_systems) {
            this.mysql_database_systems.push(new MySQLDatabaseSystemView(new MySQLDatabaseSystem(artefact, this.okitjson), this));
        }
    }

    // NAT Gateway
    dropNATGatewayView(target) {
        // Check if Gateway Already exists
        for (let gateway of this.nat_gateways) {
            if (gateway.vcn_id === target.id) {
                alert('The maximum limit of 1 NAT Gateway per Virtual Cloud Network has been exceeded for ' + this.getVirtualCloudNetwork(target.id).display_name);
                return null;
            }
        }
        let view_artefact = this.newNATGateway();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
    loadNATGateways(nat_gateways) {
        for (const artefact of nat_gateways) {
            this.nat_gateways.push(new NATGatewayView(new NATGateway(artefact, this.okitjson), this));
        }
    }

    // Network Security Group
    dropNetworkSecurityGroupView(target) {
        let view_artefact = this.newNetworkSecurityGroup();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
    loadNetworkSecurityGroups(network_security_groups) {
        for (const artefact of network_security_groups) {
            this.network_security_groups.push(new NetworkSecurityGroupView(new NetworkSecurityGroup(artefact, this.okitjson), this));
        }
    }
    loadNetworkSecurityGroupsSelect(select_id, empty_option=false) {
        $(jqId(select_id)).empty();
        const nsg_select = $(jqId(select_id));
        if (empty_option) {
            nsg_select.append($('<option>').attr('value', '').text(''));
        }
        for (let nsg of this.getNetworkSecurityGroups()) {
            nsg_select.append($('<option>').attr('value', nsg.id).text(nsg.display_name));
        }
    }
    loadNetworkSecurityGroupsMultiSelect(select_id, vcn_id) {
        $(jqId(select_id)).empty();
        const multi_select = d3.select(d3Id(select_id));
        for (let nsg of this.getNetworkSecurityGroups()) {
            if (nsg.vcn_id === vcn_id || !vcn_id) {
                const div = multi_select.append('div');
                div.append('input')
                    .attr('type', 'checkbox')
                    .attr('id', safeId(nsg.id))
                    .attr('value', nsg.id);
                div.append('label')
                    .attr('for', safeId(nsg.id))
                    .text(nsg.display_name);
            }
        }
    }

    // Object Storage Bucket
    dropObjectStorageBucketView(target) {
        let view_artefact = this.newObjectStorageBucket();
        view_artefact.getArtefact().compartment_id = target.id;
        view_artefact.recalculate_dimensions = true;
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
    loadObjectStorageBuckets(object_storage_buckets) {
        for (const artefact of object_storage_buckets) {
            this.object_storage_buckets.push(new ObjectStorageBucketView(new ObjectStorageBucket(artefact, this.okitjson), this));
        }
    }

    // OkeCluster
    dropOkeClusterView(target) {
        let view_artefact = this.newOkeCluster();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
    loadOkeClusters(oke_clusters) {
        for (const artefact of oke_clusters) {
            this.oke_clusters.push(new OkeClusterView(new OkeCluster(artefact, this.okitjson), this));
        }
    }

    // RemotePeeringConnection
    dropRemotePeeringConnectionView(target) {
        let view_artefact = this.newRemotePeeringConnection();
        view_artefact.getArtefact().compartment_id = target.id;
        view_artefact.recalculate_dimensions = true;
        return view_artefact;
    }
    newRemotePeeringConnection(connect) {
        this.remote_peering_connections.push(connect ? new RemotePeeringConnectionView(connect, this) : new RemotePeeringConnectionView(this.okitjson.newRemotePeeringConnection(), this));
        return this.remote_peering_connections[this.remote_peering_connections.length - 1];
    }
    getRemotePeeringConnections() {
        return this.remote_peering_connections;
    }
    getRemotePeeringConnection(id='') {
        for (let artefact of this.getRemotePeeringConnections()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    loadRemotePeeringConnections(fast_connects) {
        for (const artefact of fast_connects) {
            this.remote_peering_connections.push(new RemotePeeringConnectionView(new RemotePeeringConnection(artefact, this.okitjson), this));
        }
    }

    // Route Table
    dropRouteTableView(target) {
        let view_artefact = this.newRouteTable();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
    loadRouteTables(route_tables) {
        for (const artefact of route_tables) {
            this.route_tables.push(new RouteTableView(new RouteTable(artefact, this.okitjson), this));
        }
    }

    // Security List
    dropSecurityListView(target) {
        let view_artefact = this.newSecurityList();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.recalculate_dimensions = true;
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
    loadSecurityLists(security_lists) {
        for (const artefact of security_lists) {
            this.security_lists.push(new SecurityListView(new SecurityList(artefact, this.okitjson), this));
        }
    }

    // Service Gateway
    dropServiceGatewayView(target) {
        // Check if Gateway Already exists
        for (let gateway of this.service_gateways) {
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
    loadServiceGateways(service_gateways) {
        for (const artefact of service_gateways) {
            this.service_gateways.push(new ServiceGatewayView(new ServiceGateway(artefact, this.okitjson), this));
        }
    }

    // Subnet
    dropSubnetView(target) {
        let view_artefact = this.newSubnet();
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        view_artefact.getArtefact().generateCIDR();
        view_artefact.recalculate_dimensions = true;
        return view_artefact;
    }
    newSubnet(subnet) {
        this.subnets.push(subnet ? new SubnetView(subnet, this) : new SubnetView(this.okitjson.newSubnet(), this));
        return this.subnets[this.subnets.length - 1];
    }
    getSubnets() {return this.subnets;}
    getSubnet(id='') {
        for (let artefact of this.getSubnets()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    loadSubnets(subnets) {
        for (const artefact of subnets) {
            this.subnets.push(new SubnetView(new Subnet(artefact, this.okitjson), this));
        }
    }
    loadSubnetsSelect(select_id, empty_option=false) {
        $(jqId(select_id)).empty();
        const subnet_select = $(jqId(select_id));
        if (empty_option) {
            subnet_select.append($('<option>').attr('value', '').text(''));
        }
        for (let subnet of this.getSubnets()) {
            const compartment = this.getCompartment(subnet.compartment_id);
            const vcn = this.getVirtualCloudNetwork(subnet.vcn_id);
            const display_name = `${compartment.display_name}/${vcn.display_name}/${subnet.display_name}`;
            subnet_select.append($('<option>').attr('value', subnet.id).text(display_name));
        }
    }

    // Virtual Cloud Network
    dropVirtualCloudNetworkView(target) {
        let view_artefact = this.newVirtualCloudNetwork();
        view_artefact.getArtefact().compartment_id = target.id;
        view_artefact.getArtefact().generateCIDR();
        if (okitSettings.is_default_route_table) {
            let route_table = this.newRouteTable(this.getOkitJson().newRouteTable({vcn_id: view_artefact.id, compartment_id: view_artefact.compartment_id}));
        }
        if (okitSettings.is_default_security_list) {
            let security_list = this.newSecurityList(this.getOkitJson().newSecurityList({vcn_id: view_artefact.id, compartment_id: view_artefact.compartment_id}));
            security_list.artefact.addDefaultSecurityListRules(view_artefact.artefact.cidr_block);
        }
        view_artefact.recalculate_dimensions = true;
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
    loadVirtualCloudNetworks(virtual_cloud_networks) {
        for (const artefact of virtual_cloud_networks) {
            this.virtual_cloud_networks.push(new VirtualCloudNetworkView(new VirtualCloudNetwork(artefact, this.okitjson), this));
        }
    }
    loadVirtualCloudNetworksSelect(select_id, empty_option=false) {
        $(jqId(select_id)).empty();
        const vcn_select = $(jqId(select_id));
        if (empty_option) {
            vcn_select.append($('<option>').attr('value', '').text(''));
        }
        for (let vcn of this.getVirtualCloudNetworks()) {
            const compartment = this.getCompartment(vcn.compartment_id);
            const display_name = `${compartment.display_name}/${vcn.display_name}`;
            vcn_select.append($('<option>').attr('value', vcn.id).text(display_name));
        }
    }

    // Virtual Network Interface
    newVirtualNetworkInterface(vnic) {
        this.virtual_network_interfaces.push(vnic ? new VirtualNetworkInterfaceView(vnic, this) : new VirtualNetworkInterfaceView(this.okitjson.newVirtualNetworkInterface(), this));
        return this.virtual_network_interfaces[this.virtual_network_interfaces.length - 1];
    }
    getVirtualNetworkInterfaces() {return this.virtual_network_interfaces;}
    getVirtualNetworkInterface(id='') {
        for (let artefact of this.getVirtualNetworkInterfaces()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }

    // Fragment
    dropFragmentView(target) {
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
    static cut_copy_paste = {resource: undefined, paste_count: 0, is_cut: false};

    constructor(artefact=null, json_view) {
        this.artefact = artefact;
        this.collapsed = false;
        this._recalculate_dimensions = true;
        // Raise Artefact Elements to View Class
        if (this.artefact) {
            Object.entries(this.artefact).forEach(
                ([key, value]) => {
                    if (!(value instanceof Function)) {
                        Object.defineProperty(this, key, {
                            get: function () {
                                return this.artefact[key];
                            }
                        });
                    }
                }
            );
        }
        this.getJsonView = function() {return json_view};
        this.getOkitJson = function() {return json_view.getOkitJson()};
    }

    // -- Reference
    get resource_name() {return this.getArtifactReference();}
    get json_view() {return this.getJsonView();}
    get okit_json() {return this.getJsonView().getOkitJson();}
    get list_name() {return `${this.resource_name.toLowerCase().split(' ').join('_')}s`;}
    get json_model_list() {return this.okit_json[this.list_name];}
    get json_view_list() {return this.json_view[this.list_name];}
    //get id() {return this.artefact ? this.artefact.id : '';}
    get artefact_id() {return this.artefact ? this.artefact.id : '';}
    get attached() {return false;}
    get compartment_id() {return this.artefact ? this.artefact.compartment_id : '';}
    get parent_id() {return null;}
    get parent() {return null;}
    get children() {return [];}
    get display_name() {return this.artefact ? this.artefact.display_name : '';}
    get definition() {return this.artefact ? this.artefact.definition : '';}
    get is_collapsed() {return this.parent ? this.collapsed || this.parent.is_collapsed : this.collapsed;}
    // -- SVG Definitions
    // --- Standard
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
    get parent_svg_id() {return this.parent_id + "-svg";}
    get definition() {
        return {
            artefact: this.artefact,
            data_type: this.artefact ? this.artefact.getArtifactReference() : '',
            name: {
                show: false,
                text: this.display_name
            },
            label: {
                show: false,
                text: this.artefact ? this.artefact.getArtifactReference() : ''
            },
            info: {
                show: false,
                text: this.artefact ? this.artefact.getArtifactReference() : ''
            },
            svg: {
                x: this.svg_x,
                y: this.svg_y,
                width: this.svg_width,
                height: this.svg_height
            },
            rect: {
                x: this.rect_x,
                y: this.rect_y,
                width: this.rect_width,
                height: this.rect_height,
                width_adjust: this.rect_width_adjust,
                height_adjust: this.rect_height_adjust,
                stroke: {
                    colour: this.rect_stroke_colour,
                    dash: this.rect_stroke_dash,
                    opacity: this.rect_stroke_opacity
                },
                fill: this.rect_fill,
                style: this.rect_fill_style
            }, icon: {
                show: true,
                x_translation: this.icon_x_tranlation,
                y_translation: this.icon_y_tranlation
            },
            title_keys: []
        };
    }
    // --- Dimensions
    get recalculate_dimensions() {return this._recalculate_dimensions;}
    set recalculate_dimensions(recalculate) {this._recalculate_dimensions = true;this.parent ? this.parent.recalculate_dimensions = true : recalculate = false;}
    get width_multiplier() {return this.show_label ? okitSettings.show_label === 'name' ? 1.5 : 2 : 1;}
    get height_multiplier() {return this.show_label ?  1.5 : 1;}
    get icon_dimensions() {return {width: this.icon_width, height: this.icon_height};}
    get collapsed_dimensions() {return {width: this.icon_width * this.width_multiplier, height: this.icon_height * this.height_multiplier};}
    get minimum_dimensions() {return {width: this.icon_width * this.width_multiplier, height: this.icon_height * this.height_multiplier};}
    get dimensions() {return this.collapsed ? this.collapsed_dimensions : this.minimum_dimensions;}
    // --- Definitions
    get svg_definition() {
        return {
            id: this.svg_id,
            x: this.svg_x,
            y: this.svg_y,
            width: this.svg_width,
            height: this.svg_height,
            viewbox: this.viewbox
        }
    }
    get rect_definition() {
        let rect_x = this.rect_x;
        let rect_y = this.rect_y;
        let rect_width = this.rect_width + this.rect_width_adjust;
        let rect_height = this.rect_height + this.rect_height_adjust;
        if (this.icon_y_tranlation < 0) {
            rect_y = Math.abs(this.icon_y_tranlation);
            rect_height -= rect_y * 2;
        }
        if (this.icon_x_tranlation < 0) {
            rect_x = Math.abs(this.icon_x_tranlation);
            rect_width -= rect_x * 2;
        }
        return {
            id: this.rect_id,
            x: rect_x,
            y: rect_y,
            rx: this.rect_rx,
            ry: this.rect_ry,
            width: rect_width,
            height: rect_height,
            fill: this.rect_fill,
            style: this.rect_fill_style,
            stroke_colour: this.rect_stroke_colour,
            stroke_width: this.rect_stroke_width,
            stroke_opacity: this.rect_stroke_opacity,
            stroke_dasharray: this.rect_stroke_dasharray
        };
    }
    // ---- Svg
    get svg_id() {return this.artefact_id + '-svg';}
    get svg_x() {
        if (this.parent) {
            const offset = this.parent.getChildOffset(this.getArtifactReference());
            return offset.dx;
        } else {
            return 0;
        }
    }
    get svg_y() {
        if (this.parent) {
            const offset = this.parent.getChildOffset(this.getArtifactReference());
            return offset.dy;
        } else {
            return 0;
        }
    }
    get svg_height() {return this.collapsed ? this.collapsed_dimensions.height : this.dimensions.height;}
    get svg_width() {return this.collapsed ? this.collapsed_dimensions.width : this.dimensions.width;}
    // ---- ViewBox
    get viewbox_x() {return 0;}
    get viewbox_y() {return 0;}
    get viewbox_height() {return this.svg_height;}
    get viewbox_width() {return this.svg_width;}
    get viewbox() {return `${this.viewbox_x} ${this.viewbox_y} ${this.viewbox_width} ${this.viewbox_height}`;}
    // ---- Rectangle
    get rect_id() {return this.artefact_id;}
    get rect_x() {return 0;}
    get rect_y() {return 0;}
    get rect_rx() {return 0;}
    get rect_ry() {return 0;}
    get rect_height() {return this.svg_height;}
    get rect_width() {return this.svg_width;}
    get rect_height_adjust() {return 0;}
    get rect_width_adjust() {return 0;}
    get rect_fill() {return 'white';}
    get rect_fill_style() {return 'fill-opacity: .25;';}
    get rect_stroke_colour() {return this.stroke_colours.bark;}
    get rect_stroke_width() {return 1;}
    get rect_stroke_dash() {return 2;}
    get rect_stroke_space() {return 1;}
    get rect_stroke_dasharray() {return `${this.rect_stroke_dash}, ${this.rect_stroke_space}`;}
    get rect_stroke_opacity() {return 0;}
    // ---- Icon
    get icon_definition_id() {return this.getArtifactReference().replace(/ /g, '') + 'Svg';}
    get icon_height() {return 45;}
    get icon_width() {return 45;}
    get icon_x_tranlation() {return 0;}
    get icon_y_tranlation() {return 0;}
    get icon_v_align() {return 'top';}
    get icon_h_align() {return 'middle';}
    get icon_transform() {
        let dx = 0;
        let dy = 0;
        // Horizontal
        if (this.icon_h_align === 'middle' || this.icon_h_align === 'center' || this.icon_h_align === 'centre') {
            dx = this.svg_width/2 - this.icon_width/2;
        } else if (this.icon_h_align === 'end' || this.icon_h_align === 'right') {
            dx = this.svg_width - this.icon_width;
        }
        // Vertical
        if (this.icon_v_align === 'middle' || this.icon_v_align === 'center' || this.icon_v_align === 'centre') {
            dy = this.svg_height/2 - this.icon_height/2;
        } else if (this.icon_v_align === 'end' || this.icon_v_align === 'bottom') {
            dy = this.svg_height - this.icon_height;
        }
        return `translate(${dx}, ${dy})`;
    }
    // ---- Padding
    get padding_dx() {return 0;}
    get padding_dy() {return 0;}
    get padding() {return {dx: this.padding_dx, dy: this.padding_dy};}
    // ---- Text
    get svg_name_text() {return {show: this.show_name, v_align: this.name_v_align, h_align: this.name_h_align, text: this.name_text, suffix: 'display-name'};}
    get svg_type_text() {return {show: this.show_type, v_align: this.type_v_align, h_align: this.type_h_align, text: this.type_text, suffix: 'type-name'};}
    get svg_info_text() {return {show: this.show_info, v_align: this.info_v_align, h_align: this.info_h_align, text: this.info_text, suffix: 'info'};}
    get svg_label_text() {return {show: this.show_label, v_align: this.label_v_align, h_align: this.label_h_align, text: this.label_text, suffix: 'label'};}
    // ----- Name
    get show_name() {return false;}
    get name_v_align() {return 'top';}
    get name_h_align() {return 'start';}
    get name_text() {return this.display_name;}
    // ----- Type
    get show_type() {return false;}
    get type_v_align() {return 'bottom';}
    get type_h_align() {return 'start';}
    get type_text() {return this.getArtifactReference();}
    // ----- Info
    get show_info() {return false;}
    get info_v_align() {return 'bottom';}
    get info_h_align() {return 'end';}
    get info_text() {return '';}
    // ----- Label
    get show_label() {return okitSettings.show_label && okitSettings.show_label !== 'none';}
    get label_v_align() {return 'bottom';}
    get label_h_align() {return 'middle';}
    get label_text() {
        if (okitSettings.show_label) {
            if (okitSettings.show_label === 'name') {
                return this.name_text;
            } else if (okitSettings.show_label === 'type') {
                return this.type_text;
            } else {
                return '';
            }
        }
        return '';
    }
    // ----- Tooltip (title)
    get title() {
        if (okitSettings.tooltip_type) {
            if (okitSettings.tooltip_type === 'simple') {
                return this.simple_tooltip;
            } else if (okitSettings.tooltip_type === 'definition') {
                return this.definition_tooltip;
            } else if (okitSettings.tooltip_type === 'summary') {
                return this.summary_tooltip;
            } else {
                return '';
            }
        }
        return this.display_name;
    }
    get simple_tooltip() {return this.display_name;}
    get definition_tooltip() {return `Name: ${this.display_name} \nDefinition: ${this.definition}`;}
    get summary_tooltip() {return this.display_name;}
    // ---- Connectors
    get top_bottom_connectors_preferred() {return true;}
    // ---- Okit View Functions
    get new_function() {return `new${this.getArtifactReference().split(' ').join('')}`}
    get cloneable() {return true;}
    get moveable() {return true;}
    get pasteableOrig() {return this.json_view.copied_artefact ? this.json_view.copied_artefact.getDropTargets().includes(this.getArtifactReference()) : false;}
    get pasteable() {return OkitArtefactView.cut_copy_paste.resource ? OkitArtefactView.cut_copy_paste.resource.getDropTargets().includes(this.getArtifactReference()) : false;}
    get pasteableNew() {
        return OkitArtefactView.cut_copy_paste.resource ? OkitArtefactView.cut_copy_paste.resource.getDropTargets().includes(this.getArtifactReference()) : false;
    }

    getArtefact() {return this.artefact;}

    static new(artefact, json_view) {return new this(artefact, json_view);}

    cut() {OkitArtefactView.cut_copy_paste.resource = this; OkitArtefactView.cut_copy_paste.paste_count = 0; this.json_view.is_cut = true; this.deleteSvg();}

    copy() {OkitArtefactView.cut_copy_paste.resource = this; OkitArtefactView.cut_copy_paste.paste_count = 0; this.json_view.is_cut = false;}

    paste(drop_target) {
        const clone = OkitArtefactView.cut_copy_paste.resource.artefact.clone();
        if (!OkitArtefactView.cut_copy_paste.is_cut) clone.display_name += 'Copy';
        if (OkitArtefactView.cut_copy_paste.paste_count > 0) {clone.display_name += `-${OkitArtefactView.cut_copy_paste.paste_count}`;}
        OkitArtefactView.cut_copy_paste.paste_count += 1;
        clone.id = clone.okit_id;
        drop_target.updateCloneIds(clone);
        this.json_model_list.push(clone);
        return clone;
    }

    clone() {
        const clone = this.artefact.clone();
        if (!this.json_view.is_cut) clone.display_name += 'Copy';
        clone.id = clone.okit_id;
        this.json_model_list.push(clone);
        return clone;
    }

    delete() {
        for (let i = 0; i < this.json_model_list.length; i++) {
            if (this.json_model_list[i].id === this.id) {
                this.json_model_list[i].delete();
                this.json_model_list.splice(i, 1);
                break;
            }
        }
        // Remove SVG Element
        if ($(jqId(this.svg_id)).length) {$(jqId(this.svg_id)).remove()}
    }

    draw() {
        if ((!this.parent || !this.parent.is_collapsed) && (!okitSettings.hide_attached || !this.attached)) {
            console.info(`Drawing ${this.getArtifactReference()} : ${this.display_name} (${this.artefact_id}) [${this.parent_id}]`);
            const svg = this.drawSvg();
            this.drawRect(svg);
            this.drawText(svg, this.svg_name_text);
            this.drawText(svg, this.svg_type_text);
            this.drawText(svg, this.svg_info_text);
            this.drawText(svg, this.svg_label_text);
            this.drawTitle(svg);
            this.drawIcon(svg);
            // Add standard / common click event
            this.addClickEvent(svg);
            // Add standard / common mouse over event
            this.addMouseOverEvents(svg);
            // Add Mouse Over / Exist Events
            this.addMouseEvents(svg);
            // Add Drag Handling Events
            this.addDragEvents(svg);
            // Add Context Menu (Right-Click)
            this.addContextMenu(svg);
            // Add Custom Data Attributes
            this.addCustomAttributes(svg)
            // Add Attached Resources
            this.drawAttachments();
            // Return
            return svg;
        }
    }

    drawSvg() {
        const parent_svg = d3.select(d3Id(this.parent_svg_id));
        // Get attributes as local constant before create to stop NaN because append adds element before adding attributes.
        const definition = this.svg_definition;
        const svg = parent_svg.append("svg")
            .attr("id",        definition.id)
            .attr("data-type", this.artefact ? this.artefact.getArtifactReference() : '')
            .attr("x",         definition.x)
            .attr("y",         definition.y)
            .attr("width",     definition.width)
            .attr("height",    definition.height)
            .attr("viewBox",   definition.viewbox)
            .attr("preserveAspectRatio", "xMinYMax meet");
        return svg;
    }

    drawRect(svg) {
        const definition = this.rect_definition;
        const rect = svg.append("rect")
            .attr("id",               definition.id)
            .attr("x",                definition.x)
            .attr("y",                definition.y)
            .attr("rx",               definition.rx)
            .attr("ry",               definition.ry)
            .attr("width",            definition.width)
            .attr("height",           definition.height)
            .attr("fill",             definition.fill)
            .attr("style",            definition.style)
            .attr("stroke",           definition.stroke_colour)
            .attr("stroke-width",     definition.stroke_width)
            .attr("stroke-opacity",   definition.stroke_opacity)
            .attr("stroke-dasharray", definition.stroke_dasharray);
        return rect;
    }

    drawIcon(svg) {
        const icon = svg.append('g')
            .attr("style", "pointer-events: bounding-box;")
            .append("use")
            .attr("xlink:href",`#${this.icon_definition_id}`)
            .attr("transform", this.icon_transform);
        return icon;
    }

    drawText(svg, svg_text) {
        if (svg_text.show) {
            const rect = this.rect_definition;
            let text_anchor = 'start';
            let dx = 10;
            let dy = 10;
            // Horizontal Positioning
            if (svg_text.h_align === 'middle' || svg_text.h_align === 'centre' || svg_text.h_align === 'center') {
                dx = Math.round(this.svg_width / 2);
                text_anchor = 'middle';
            } else if (svg_text.h_align === 'end' || svg_text.h_align === 'right') {
                dx = this.svg_width - 10;
                text_anchor = 'end';
                if (!this.collapsed) {dx -= rect.x;}
            } else {
                dx = 10;
                text_anchor = 'start';
                if (!this.collapsed) {dx += rect.x;}
            }
            // Vertical Positioning
            if (svg_text.v_align === 'middle' || svg_text.v_align === 'centre' || svg_text.v_align === 'center') {
                dy = Math.round(this.svg_height / 2);
            } else if (svg_text.v_align === 'end' || svg_text.v_align === 'bottom') {
                dy = this.svg_height - 10;
                if (!this.collapsed) {dy -= rect.y;}
            } else {
                dy = 10;
                if (!this.collapsed) {dy += rect.y + this.icon_height / 2;}
            }
            const text = svg.append("text")
                .attr("class", "svg-text")
                .attr("id", `${this.artefact_id}-${svg_text.suffix}`)
                .attr("x", dx)
                .attr("y", dy)
                .attr("text-anchor", text_anchor)
                .attr("vector-effects", "non-scaling-size")
                .text(svg_text.text);
        }
    }

    drawTitle(svg) {
        svg.append("title")
            .attr("id", `${this.artefact_id}-title`)
            .text(this.title);
    }

    addClickEvent(svg) {
        const self = this;
        svg.on("click", function() {
            self.loadSlidePanels();
            d3.event.stopPropagation();
            $(jqId("context-menu")).addClass("hidden");
        });
    }

    addMouseOverEvents(svg) {
        const self = this;
        svg.on('mouseenter', () => {
            if (okitSettings.highlight_association) {self.addAssociationHighlighting();}
            $(jqId(self.id)).addClass('highlight-rect');
            d3.event.stopPropagation();
        })
        svg.on('mouseleave', () => {
            if (okitSettings.highlight_association) {self.removeAssociationHighlighting();}
            $(jqId(self.id)).removeClass('highlight-rect');
            d3.event.stopPropagation();
        });
    }

    addAssociationHighlighting() {}

    removeAssociationHighlighting() {}

    addDragEvents(svg) {
        svg.on("dragenter",  dragEnter)
            .on("dragover",  dragOver)
            .on("dragleave", dragLeave)
            .on("drop",      dragDrop)
            .on("dragend",   dragEnd);
    }

    addContextMenu(svg) {
        const self = this;
        svg.on("contextmenu", function () {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            const canvas_position = $(jqId("canvas-div")).offset();
            const position = {top: d3.event.pageY - canvas_position.top, left: d3.event.pageX - 5};
            $(jqId("context-menu")).empty();
            $(jqId("context-menu")).css(position);
            const contextmenu = d3.select(d3Id("context-menu"));
            contextmenu.on('mouseenter', function () {
                    $(jqId("context-menu")).removeClass("hidden");
                })
                .on('mouseleave', function () {
                    $(jqId("context-menu")).addClass("hidden");
                });

            contextmenu.append('label')
                .attr('class', 'okit-context-menu-title')
                .text(self.display_name)
            const ul = contextmenu.append('ul')
                .attr('class', 'okit-context-menu-list');
            if (self.compartment_id) {
                // Delete
                ul.append('li').append('a')
                    .attr('class', 'parent-item')
                    .attr('href', 'javascript:void(0)')
                    .text('Delete')
                    .on('click', function () {
                        self.delete();
                        self.json_view.update(self.okit_json);
                        $(jqId("context-menu")).addClass("hidden");
                    });
                // Cut
                if (self.moveable) {
                    ul.append('li').append('a')
                        .attr('class', 'parent-item')
                        .attr('href', 'javascript:void(0)')
                        .text('Cut')
                        .on('click', function () {
                            OkitArtefactView.cut_copy_paste = {paste_count: 0, is_cut: true};
                            self.cut();
                            //self.json_view.update(self.okit_json);
                            $(jqId("context-menu")).addClass("hidden");
                        });
                }
                // Clone
                if (self.cloneable) {
                    ul.append('li').append('a')
                        .attr('class', 'parent-item')
                        .attr('href', 'javascript:void(0)')
                        .text('Clone')
                        .on('click', function () {
                            self.clone();
                            self.json_view.update(self.okit_json);
                            $(jqId("context-menu")).addClass("hidden");
                        });
                }
                // Copy
                ul.append('li').append('a')
                    .attr('class', 'parent-item')
                    .attr('href', 'javascript:void(0)')
                    .text('Copy')
                    .on('click', function () {
                        OkitArtefactView.cut_copy_paste = {paste_count: 0, is_cut: false};
                        self.copy();
                        $(jqId("context-menu")).addClass("hidden");
                    });
                $(jqId("context-menu")).removeClass("hidden");
            }
            // Paste
            if (self.pasteable) {
                ul.append('li').append('a')
                    .attr('class', 'parent-item')
                    .attr('href', 'javascript:void(0)')
                    .text(`Paste ${OkitArtefactView.cut_copy_paste.resource.getArtifactReference()} ${OkitArtefactView.cut_copy_paste.resource.display_name}`)
                    .on('click', function () {
                        OkitArtefactView.cut_copy_paste.resource.paste(self);
                        if (OkitArtefactView.cut_copy_paste.is_cut) OkitArtefactView.cut_copy_paste.resource.delete();
                        self.json_view.update(self.okit_json);
                        $(jqId("context-menu")).addClass("hidden");
                    });
                $(jqId("context-menu")).removeClass("hidden");
            }
        });
    }

    addCustomAttributes(svg) {
        svg.attr("data-type",                  this.artefact ? this.artefact.getArtifactReference() : '')
            .attr("data-okit-id",        this.artefact_id)
            .attr("data-parent-id",      this.parent_id)
            .attr("data-compartment-id", this.compartment_id)
            .selectAll("*")
                .attr("data-type",                 this.artefact ? this.artefact.getArtifactReference() : '')
                .attr("data-okit-id",        this.artefact_id)
                .attr("data-parent-id",      this.parent_id)
                .attr("data-compartment-id", this.compartment_id);
    }

    addMouseEvents(svg) {}

    drawAttachments() {}

    drawConnections() {}

    drawConnection(start_id, end_id) {
        if (!this.parent.is_collapsed) {
            const canvas_svg = d3.select(d3Id('canvas-svg'));
            const canvas_rect = d3.select(d3Id('canvas-rect'));
            const svgStartPoint = canvas_svg.node().createSVGPoint();
            const svgEndPoint = canvas_svg.node().createSVGPoint();
            const screenCTM = canvas_rect.node().getScreenCTM();
            if (start_id && start_id !== '' && end_id && end_id !== '' && document.getElementById(start_id) && document.getElementById(end_id)) {
                let start_bcr = document.getElementById(start_id).getBoundingClientRect();
                let end_bcr = document.getElementById(end_id).getBoundingClientRect();
                let horizontal = false;
                if (this.top_bottom_connectors_preferred && start_bcr.y > end_bcr.y) {
                    // Start Connector on the top edge
                    svgStartPoint.x = Math.round(start_bcr.x + (start_bcr.width / 2));
                    svgStartPoint.y = start_bcr.y;
                    // End Connector on the bottom edge
                    svgEndPoint.x = Math.round(end_bcr.x + (end_bcr.width / 2));
                    svgEndPoint.y = Math.round(end_bcr.y + end_bcr.height);
                } else if (this.top_bottom_connectors_preferred && start_bcr.y < end_bcr.y) {
                    // Start Connector on the bottom edge
                    svgStartPoint.x = Math.round(start_bcr.x + (start_bcr.width / 2));
                    svgStartPoint.y = Math.round(start_bcr.y + start_bcr.height);
                    // End Connector on top edge
                    svgEndPoint.x = Math.round(end_bcr.x + (end_bcr.width / 2));
                    svgEndPoint.y = end_bcr.y;
                } else if (start_bcr.x < end_bcr.x) {
                    // Start Connector on right edge
                    svgStartPoint.x = Math.round(start_bcr.x + start_bcr.width);
                    svgStartPoint.y = Math.round(start_bcr.y + (start_bcr.height / 2));
                    // End Connector on left edge
                    svgEndPoint.x = end_bcr.x;
                    svgEndPoint.y = Math.round(end_bcr.y + (end_bcr.height / 2));
                    // Draw Horizontal
                    horizontal = true;
                } else if (start_bcr.x > end_bcr.x) {
                    // Start Connector on left edge
                    svgStartPoint.x = start_bcr.x;
                    svgStartPoint.y = Math.round(start_bcr.y + (start_bcr.height / 2));
                    // End Connector on right edge
                    svgEndPoint.x = Math.round(end_bcr.x + end_bcr.width);
                    svgEndPoint.y = Math.round(end_bcr.y + (end_bcr.height / 2));
                    // Draw Horizontal
                    horizontal = true;
                }
                let connector_start = svgStartPoint.matrixTransform(screenCTM.inverse());
                let connector_end = svgEndPoint.matrixTransform(screenCTM.inverse());

                if (horizontal) {
                    this.drawHorizontalConnector(canvas_svg, this.generateConnectorId(end_id, start_id), connector_start, connector_end);
                } else {
                    this.drawVerticalConnector(canvas_svg, this.generateConnectorId(end_id, start_id), connector_start, connector_end);
                }

            }
        }
    }

    drawVerticalConnector(parent_svg, id, start={x:0, y:0}, end={x:0, y:0},) {
        if (path_connector) {
            let radius = corner_radius;
            let dy = Math.round((end['y'] - start['y']) / 2);
            let dx = end['x'] - start['x'];
            let arc1 = '';
            let arc2 = '';
            if (dy > 0 && dx > 0) {
                // First turn down and right with counter clockwise arc
                arc1 = 'a5,5 0 0 0 5,5';
                arc1 = generateArc(radius, 0, '', '');
                // Second turn right and down with clockwise arc
                arc2 = 'a5,5 0 0 1 5,5';
                arc2 = generateArc(radius, 1, '', '');
                // Reduce dy by radius
                dy -= radius;
                // Reduce dx by 2 * radius
                dx -= radius * 2;
            } else if (dy > 0 && dx < 0) {
                // First turn down and left with counter clockwise arc
                arc1 = 'a5,5 0 0 1 -5,5';
                arc1 = generateArc(radius, 1, '-', '');
                // Second turn left and down with clockwise arc
                arc2 = 'a5,5 0 0 0 -5,5';
                arc2 = generateArc(radius, 0, '-', '');
                // Reduce dy by radius
                dy -= radius;
                // Increase dx by 2 * radius
                dx += radius * 2;
            } else if (dy < 0 && dx < 0) {
                // First turn up and left with counter clockwise arc
                arc2 = 'a5,5 0 0 1 -5,-5';
                arc2 = generateArc(radius, 1, '-', '-');
                // Second turn left and up with clockwise arc
                arc1 = 'a5,5 0 0 0 -5,-5';
                arc1 = generateArc(radius, 0, '-', '-');
                // Increase dy by radius
                dy += radius;
                // Reduce dx by 2 * radius
                dx -= radius * 2;
            } else if (dy < 0 && dx > 0) {
                // First turn up and right with counter clockwise arc
                arc2 = 'a5,5 0 0 0 5,-5';
                arc2 = generateArc(radius, 0, '', '-');
                // Second turn right and up with clockwise arc
                arc1 = 'a5,5 0 0 1 5,-5';
                arc1 = generateArc(radius, 1, '', '-');
                // Reduce dy by radius
                dy += radius;
                // Increase dx by 2 * radius
                dx -= radius * 2;
            }
            let points = "m" + this.coordString(start) + " v" + dy + " " + arc1 + " h" + dx + " " + arc2 + " v" + dy;
            let path = parent_svg.append('path')
                .attr("id", id)
                .attr("d", points)
                //.attr("d", "M100,100 h50 a5,5 0 0 0 5,5 v50 a5,5 0 0 1 -5,5 h-50 a5,5 0 0 1 -5,-5 v-50 a5,5 0 0 1 5,-5 z")
                .attr("stroke-width", "2")
                .attr("stroke", connector_colour)
                .attr("fill", "none")
                .attr("marker-start", "url(#connector-end-circle)")
                .attr("marker-end", "url(#connector-end-circle)");
            //return path;
        } else {
            // Calculate Polyline points
            let ydiff = end['y'] - start['y'];
            let ymid = Math.round(start['y'] + ydiff / 2);
            let mid1 = {x: start['x'], y: ymid};
            let mid2 = {x: end['x'], y: ymid};
            let points = this.coordString(start) + " " + this.coordString(mid1) + " " + this.coordString(mid2) + " " + this.coordString(end);
            let polyline = parent_svg.append('polyline')
                .attr("id", id)
                .attr("points", points)
                .attr("stroke-width", "2")
                .attr("stroke", connector_colour)
                .attr("fill", "none")
                .attr("marker-start", "url(#connector-end-circle)")
                .attr("marker-end", "url(#connector-end-circle)");
            //return polyline;
        }
    }

    drawHorizontalConnector(parent_svg, id, start={x:0, y:0}, end={x:0, y:0}) {
        if (path_connector) {
            let radius = corner_radius;
            let dy = end['y'] - start['y'];
            let dx = Math.round((end['x'] - start['x']) / 2);
            let arc1 = '';
            let arc2 = '';
            if (dy > 0 && dx > 0) {
                // First turn right and down with clockwise arc
                arc1 = 'a5,5 0 0 1 5,5';
                arc1 = generateArc(radius, 1, '', '');
                // Second turn down and right with counter clockwise arc
                arc2 = 'a5,5 0 0 0 5,5';
                arc2 = generateArc(radius, 0, '', '');
                // Reduce dx by radius
                dx -= radius;
                // Reduce dy by 2 * radius
                dy -= radius * 2;
            } else if (dy > 0 && dx < 0) {
                // First turn down and left with counter clockwise arc
                arc1 = 'a5,5 0 0 1 -5,5';
                arc1 = generateArc(radius, 1, '-', '');
                // Second turn left and down with clockwise arc
                arc2 = 'a5,5 0 0 0 -5,5';
                arc2 = generateArc(radius, 0, '-', '');
                // Increase dx by radius
                dx += radius;
                // Reduce dy by 2 * radius
                dy -= radius * 2;
            } else if (dy < 0 && dx < 0) {
                // First turn up and left with counter clockwise arc
                arc1 = 'a5,5 0 0 1 -5,-5';
                arc1 = generateArc(radius, 1, '-', '-');
                // Second turn left and up with clockwise arc
                arc2 = 'a5,5 0 0 0 -5,-5';
                arc2 = generateArc(radius, 0, '-', '-');
                // Reduce dx by radius
                dx -= radius;
                // Increase dy by 2 * radius
                dy += radius * 2;
            } else if (dy < 0 && dx > 0) {
                // First turn up and right with counter clockwise arc
                arc1 = 'a5,5 0 0 0 5,-5';
                arc1 = generateArc(radius, 0, '', '-');
                // Second turn right and up with clockwise arc
                arc2 = 'a5,5 0 0 1 5,-5';
                arc2 = generateArc(radius, 1, '', '-');
                // Reduce dx by radius
                dx -= radius;
                // Increase dy by 2 * radius
                dy += radius * 2;
            }
            let points = "m" + this.coordString(start) + " h" + dx + " " + arc1 + " " + " v" + dy + arc2 + " h" + dx;
            let path = parent_svg.append('path')
                .attr("id", id)
                .attr("d", points)
                //.attr("d", "M100,100 h50 a5,5 0 0 0 5,5 v50 a5,5 0 0 1 -5,5 h-50 a5,5 0 0 1 -5,-5 v-50 a5,5 0 0 1 5,-5 z")
                .attr("stroke-width", "2")
                .attr("stroke", connector_colour)
                .attr("fill", "none")
                .attr("marker-start", "url(#connector-end-circle)")
                .attr("marker-end", "url(#connector-end-circle)");
        } else {
            // Calculate Polyline points
            let ydiff = end['y'] - start['y'];
            let ymid = Math.round(start['y'] + ydiff / 2);
            let mid1 = {x: start['x'], y: ymid};
            let mid2 = {x: end['x'], y: ymid};
            let points = this.coordString(start) + " " + this.coordString(mid1) + " " + this.coordString(mid2) + " " + this.coordString(end);
            let polyline = parent_svg.append('polyline')
                .attr("id", id)
                .attr("points", points)
                .attr("stroke-width", "2")
                .attr("stroke", connector_colour)
                .attr("fill", "none")
                .attr("marker-start", "url(#connector-end-circle)")
                .attr("marker-end", "url(#connector-end-circle)");
        }
    }

    coordString(coord) {
        let coord_str = coord['x'] + ',' + coord['y'];
        return coord_str;
    }

    deleteSvg() {
        // Remove SVG Element
        if ($(jqId(this.svg_id)).length) {$(jqId(this.svg_id)).remove()}
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
        let offset = {dx: 0, dy: 0};
        if (this.getTopEdgeArtifacts().includes(child_type)) {
            offset = this.getTopEdgeChildOffset();
        } else if (this.getTopArtifacts().includes(child_type)) {
            offset = this.getTopChildOffset();
        } else if (this.getContainerArtifacts().includes(child_type)) {
            offset = this.getContainerChildOffset();
        } else if (this.getBottomArtifacts().includes(child_type)) {
            offset = this.getBottomChildOffset();
        } else if (this.getBottomEdgeArtifacts().includes(child_type)) {
            offset = this.getBottomEdgeChildOffset();
        } else if (this.getLeftEdgeArtifacts().includes(child_type)) {
            offset = this.getLeftEdgeChildOffset();
        } else if (this.getLeftArtifacts().includes(child_type)) {
            offset = this.getLeftChildOffset();
        } else if (this.getRightArtifacts().includes(child_type)) {
            offset = this.getRightChildOffset();
        } else if (this.getRightEdgeArtifacts().includes(child_type)) {
            offset = this.getRightEdgeChildOffset();
        } else {
            console.warn(child_type + ' Not Found for ' + this.display_name);
        }
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
        alert('Get Top Edge Child function "getTopEdgeChildOffset()" has not been implemented.');
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
                if (artefact.parent_id === this.id && (!artefact.attached || !okitSettings.hide_attached)) {
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
            offset.dx += Math.round(this.getLeftChildrenMaxDimensions().width + positional_adjustments.spacing.x);
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
                if (artefact.parent_id === this.id && (!artefact.attached || !okitSettings.hide_attached)) {
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
                if (artefact.parent_id === this.id && (!artefact.attached || !okitSettings.hide_attached)) {
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
            dy: Math.round((this.icon_height * OkitArtefactView.prototype.height_multiplier) + positional_adjustments.spacing.y * 2)
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
        let dx_adjustment = 0;
        if (this.hasTopChildren()) {
            let dimensions = this.getTopChildrenMaxDimensions();
            dx_adjustment = Math.max(dimensions.width, dx_adjustment);
        }
        if (this.hasContainerChildren()) {
            let dimensions = this.getContainerChildrenMaxDimensions();
            dx_adjustment = Math.max(dimensions.width, dx_adjustment);
        }
        if (this.hasBottomChildren()) {
            let dimensions = this.getBottomChildrenMaxDimensions();
            dx_adjustment = Math.max(dimensions.width, dx_adjustment);
        }
        offset.dx += dx_adjustment;
        offset.dx += positional_adjustments.spacing.x;
        offset.dx += positional_adjustments.padding.x;
        return offset;
    }

    getRightChildOffset() {
        alert('Get Right Child function "getRightChildOffset()" has not been implemented.');
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

    getRightEdgeChildrenMaxDimensions() {
        let max_dimensions = {height: 0, width: 0};
        for (let group of this.getRightEdgeArtifacts()) {
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

    getFirstRightEdgeChildOffset() {
        const width = this.dimensions.width;
        const icon_width = this.icon_width;
        const width_multiplier = OkitArtefactView.prototype.width_multiplier;
        let offset = {
            dx: Math.round(width - (icon_width * width_multiplier)),
            dy: Math.round(positional_adjustments.padding.y)
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

    /*
    ** Common Single Select Input build & load functions
     */

    loadDynamicRoutingGatewaySelect(id) {
        // Build Dynamic Routing Gateways
        let drg_select = $(jqId(id));
        $(drg_select).empty();
        drg_select.append($('<option>').attr('value', '').text(''));
        for (const drg of this.getOkitJson().getDynamicRoutingGateways()) {
            drg_select.append($('<option>').attr('value', drg.id).text(drg.display_name));
        }
    }
}

/*
** Container Artefact View class for Compartments / VCN / Subnets that can contain other artefacts.
 */
class OkitContainerArtefactView extends OkitArtefactView {
    constructor(artefact = null, json_view) {
        super(artefact, json_view);
        this._dimensions = {width: 0, height: 0};
    }

    // -- SVG Definitions
    // --- Dimensions
    get minimum_dimensions() {return {width: 300, height: 150};}
    get dimensions() {
        if (this.collapsed) {
            return this.collapsed_dimensions;
        } else if (this.recalculate_dimensions) {
            console.info(`Getting Dimensions of ${this.getArtifactReference()} : ${this.display_name} (${this.artefact_id})`);
            let padding = this.getPadding();
            let dimensions = {width: 0, height: 0};
            let offset = {dx: 0, dy: 0};
            // Process Top Edge Artifacts
            offset = this.getFirstTopEdgeChildOffset();
            const top_edge_dimensions = this.getTopEdgeChildrenMaxDimensions();
            dimensions.width = Math.max(dimensions.width, top_edge_dimensions.width + offset.dx - padding.dx);
            dimensions.height = Math.max(dimensions.height, top_edge_dimensions.height);
            // Process Top Artifacts
            offset = this.getFirstTopChildOffset();
            const top_dimensions = this.getTopChildrenMaxDimensions();
            dimensions.width = Math.max(dimensions.width, top_dimensions.width);
            dimensions.height += top_dimensions.height;
            // Process Container Artifacts
            offset = this.getFirstContainerChildOffset();
            const container_dimensions = this.getContainerChildrenMaxDimensions();
            dimensions.width = Math.max(dimensions.width, container_dimensions.width);
            dimensions.height += container_dimensions.height;
            // Process Bottom Artifacts
            offset = this.getFirstBottomChildOffset();
            const bottom_dimensions = this.getBottomChildrenMaxDimensions();
            dimensions.width = Math.max(dimensions.width, bottom_dimensions.width);
            dimensions.height += bottom_dimensions.height;
            // Process Bottom Edge Artifacts
            offset = this.getFirstBottomEdgeChildOffset();
            const bottom_edge_dimensions = this.getBottomEdgeChildrenMaxDimensions();
            dimensions.width = Math.max(dimensions.width, bottom_edge_dimensions.width);
            dimensions.height = Math.max(dimensions.height, bottom_edge_dimensions.height);
            // Process Left Edge Artifacts
            // Process Left Artifacts
            const left_dimensions = this.getLeftChildrenMaxDimensions();
            dimensions.width += left_dimensions.width;
            dimensions.height = Math.max(dimensions.height, left_dimensions.height);
            // Process Right Artifacts
            const right_dimensions = this.getRightChildrenMaxDimensions();
            dimensions.width += right_dimensions.width;
            dimensions.height = Math.max(dimensions.height, right_dimensions.height);
            if (this.hasRightChildren()) {
                dimensions.width += positional_adjustments.spacing.x;
                dimensions.width += positional_adjustments.padding.x;
            }
            // Process Right Edge Artifacts
            const right_edge_dimensions = this.getRightEdgeChildrenMaxDimensions();
            dimensions.width += right_dimensions.width;
            dimensions.height = Math.max(dimensions.height, right_edge_dimensions.height);
            if (this.hasRightEdgeChildren()) {
                dimensions.width += positional_adjustments.spacing.x;
                dimensions.width += positional_adjustments.padding.x;
            }
            // Add Padding
            dimensions.width += padding.dx * 2;
            dimensions.height += padding.dy * 2;
            // Check size against minimum
            dimensions['width'] = Math.max(dimensions['width'], this.minimum_dimensions.width);
            dimensions['height'] = Math.max(dimensions['height'], this.minimum_dimensions.height);
            this._recalculate_dimensions = false;
            this._dimensions = dimensions;
            return dimensions;
        } else {
            return this._dimensions;
        }
    }
    // ---- Icon
    get icon_x_tranlation() {return this.collapsed ? super.icon_x_tranlation : -20;}
    get icon_y_tranlation() {return this.collapsed ? super.icon_y_tranlation : -20;}
    get icon_h_align() {return this.collapsed ? super.icon_h_align : 'start';}
    // ---- Rectangle
    get rect_stroke_dash() {return this.collapsed ? super.rect_stroke_dash : 5;}
    get rect_stroke_space() {return this.collapsed ? super.rect_stroke_space : 2;}
    get rect_stroke_opacity() {return this.collapsed ? super.rect_stroke_opacity : 1;}
    // ---- Text
    // ----- Name
    get show_name() {return this.collapsed ? super.show_name : true;}
    // ----- Type
    get show_type() {return this.collapsed ? super.show_type : true;}
    // ----- Info
    get show_info() {return this.collapsed ? super.show_info : true;}
    // ----- Label
    get show_label() {return this.collapsed ? super.show_label : false;}
    // ---- Okit View Functions

    paste(drop_target) {
        const clone = super.paste(drop_target);
        this.cloneChildren(clone);
        return clone;
    }

    updateCloneIds(clone) {
        if (this.getArtifactReference() === Subnet.getArtifactReference()) {
            clone.subnet_id = this.id;
            clone.compartment_id = this.compartment_id;
        } else if (this.getArtifactReference() === VirtualCloudNetwork.getArtifactReference()) {
            clone.vcn_id = this.id;
            clone.compartment_id = this.compartment_id;
        } else {
            clone.compartment_id = this.id;
        }
        return clone;
    }

/*
** SVG Functions
 */
    drawIcon(svg) {
        const icon = super.drawIcon(svg);
        // Add Click Event to toggle collapsed
        const self = this;
        icon.on("click", function() {
            self.collapsed = !self.collapsed;
            self.recalculate_dimensions = true;
            self.getJsonView().draw();
        });
    }

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
    getDxOffset(offset, artefacts) {
        for (let child of artefacts) {
            $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").each(function() {
                offset.dx += Math.round(Number($(this).attr('width')) + positional_adjustments.spacing.x);
            });
        }
        return offset;
    }

    getDyOffset(offset, artefacts) {
        for (let child of artefacts) {
            $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").each(function() {
                offset.dy += Math.round(Number($(this).attr('height')) + positional_adjustments.spacing.y);
            });
        }
        return offset;
    }

    getTopEdgeChildOffset() {
        return this.getDxOffset(this.getFirstTopEdgeChildOffset(), this.getTopEdgeArtifacts());
    }

    getTopChildOffset() {
        return this.getDxOffset(this.getFirstTopChildOffset(), this.getTopArtifacts());
    }

    getContainerChildOffset() {
        return this.getDyOffset(this.getFirstContainerChildOffset(), this.getContainerArtifacts());
    }

    getBottomChildOffset() {
        return this.getDxOffset(this.getFirstBottomChildOffset(), this.getBottomArtifacts());
    }

    getBottomEdgeChildOffset() {
        return this.getDxOffset(this.getFirstBottomEdgeChildOffset(), this.getBottomEdgeArtifacts());
    }

    getLeftEdgeChildOffset() {
        return this.getDyOffset(this.getFirstLeftEdgeChildOffset(), this.getLeftEdgeArtifacts());
    }

    getLeftChildOffset() {
        return this.getDyOffset(this.getFirstLeftChildOffset(), this.getLeftArtifacts());
    }

    getRightChildOffset() {
        return this.getDyOffset(this.getFirstRightChildOffset(), this.getRightArtifacts());
    }

    getRightEdgeChildOffset() {
        return this.getDyOffset(this.getFirstRightEdgeChildOffset(), this.getRightEdgeArtifacts());
    }

}

let okitJsonView = null;
