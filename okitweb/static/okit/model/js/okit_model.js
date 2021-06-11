/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Model Javascript');

/*
** Representation of overall OKIT Model Data Structure
 */
class OkitJson {
    /*
    ** Create
     */
    constructor(okit_json_string = '') {
        this.title = "OKIT OCI Visualiser Json";
        this.description = `# Description\n__Created ${getCurrentDateTime()}__\n\n--------------------------------------\n\n`;
        this.created = getCurrentDateTime();
        this.updated = this.created;
        this.okit_version = okitVersion;

        this.autonomous_databases = [];
        this.block_storage_volumes = [];
        this.compartments = [];
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
        //this.web_application_firewalls = [];

        if (okit_json_string !== undefined && okit_json_string.length > 0) {
            this.load(JSON.parse(okit_json_string));
        }
    }

    getResourceLists() {
        return Object.entries(this).reduce((r, [k, v]) => {
                if (Array.isArray(v)) r[k] = v
                return r
            }, {})
    }

    /*
    ** Load Simple Json Structure and build Object Based JSON
     */
    load(okit_json) {
        console.log('Load OKIT Json');
        // Title & Description
        if (okit_json.title) {
            this.title = okit_json.title;
        }
        if (okit_json.description) {
            this.description = okit_json.description;
        }
        // Turn Off Default Security List / Route Table Processing
        const okitSettingsClone = JSON.clone(okitSettings);
        okitSettings.is_default_route_table   = false;
        okitSettings.is_default_security_list = false;
        okitSettings.is_default_dhcp_options = false;
        okitSettings.is_vcn_defaults = false;
        // Load
        for (const [key, value] of Object.entries(okit_json)) {
            if (Array.isArray(value)) {
                const func_name = titleCase(key.split('_').join(' ')).split(' ').join('');
                const get_function = `get${func_name}`;
                const new_function = `new${func_name.slice(0, -1)}`;
                // console.warn('Functions:', get_function, new_function);
                for (const resource of okit_json[key]) {this[new_function](resource);}
            }
        }
        // Reset Default Security List / Route Table Processing
        okitSettings.is_default_route_table   = okitSettingsClone.is_default_route_table;
        okitSettings.is_default_security_list = okitSettingsClone.is_default_security_list;
        okitSettings.is_default_dhcp_options = okitSettingsClone.is_default_dhcp_options;
        okitSettings.is_vcn_defaults = okitSettingsClone.is_vcn_defaults;
        // Check for VCN Defaults
        this.getVirtualCloudNetworks().forEach((vcn) => {
            if (vcn.default_route_table_id && this.getRouteTable(vcn.default_route_table_id)) this.getRouteTable(vcn.default_route_table_id).default = true;
            if (vcn.default_security_list_id && this.getSecurityList(vcn.default_security_list_id)) this.getSecurityList(vcn.default_security_list_id).default = true;
            if (vcn.default_dhcp_options_id && this.getDhcpOption(vcn.default_dhcp_options_id)) this.getDhcpOption(vcn.default_dhcp_options_id).default = true;
        });
    }
    load1(okit_json) {
        console.log('Load OKIT Json');
        // Title & Description
        if (okit_json.title) {
            this.title = okit_json.title;
        }
        if (okit_json.description) {
            this.description = okit_json.description;
        }
        // Compartments
        if (okit_json.hasOwnProperty('compartments')) {
            for (let artefact of okit_json['compartments']) {
                let obj = this.newCompartment(artefact);
            }
        }

        // Compartment Subcomponents
        // Autonomous Databases
        if (okit_json.hasOwnProperty('autonomous_databases')) {
            for (let artefact of okit_json['autonomous_databases']) {
                let obj = this.newAutonomousDatabase(artefact);
            }
        }
        // Block Storage Volumes
        if (okit_json.hasOwnProperty('block_storage_volumes')) {
            for (let artefact of okit_json['block_storage_volumes']) {
                let obj = this.newBlockStorageVolume(artefact);
            }
        }
        // Object Storage Buckets
        if (okit_json.hasOwnProperty('object_storage_buckets')) {
            for (let artefact of okit_json['object_storage_buckets']) {
                let obj = this.newObjectStorageBucket(artefact);
            }
        }
        // Exadata Infrastructures
        if (okit_json.hasOwnProperty('exadata_infrastructures')) {
            for (let artefact of okit_json['exadata_infrastructures']) {
                let obj = this.newExadataInfrastructure(artefact);
            }
        }
        // Virtual Cloud Networks
        // Turn Off Default Security List / Route Table Processing
        let okitSettingsClone = JSON.clone(okitSettings);
        okitSettings.is_default_route_table   = false;
        okitSettings.is_default_security_list = false;
        if (okit_json.hasOwnProperty('virtual_cloud_networks')) {
            for (let artefact of okit_json['virtual_cloud_networks']) {
                let obj = this.newVirtualCloudNetwork(artefact);
            }
        }
        // Reset
        okitSettings.is_default_route_table   = okitSettingsClone.is_default_route_table;
        okitSettings.is_default_security_list = okitSettingsClone.is_default_security_list;
        // Web Application Firewall
        if (okit_json.hasOwnProperty('web_application_firewalls')) {
            for (let artefact of okit_json['web_application_firewalls']) {
                let obj = this.newWebApplicationFirewall(artefact);
            }
        }
        // Customer Premise Equipments
        if (okit_json.hasOwnProperty('customer_premise_equipments')) {
            for (let artefact of okit_json['customer_premise_equipments']) {
                let obj = this.newCustomerPremiseEquipment(artefact);
            }
        }
        // Dynamic Routing Gateways
        if (okit_json.hasOwnProperty('dynamic_routing_gateways')) {
            for (let artefact of okit_json['dynamic_routing_gateways']) {
                let obj = this.newDynamicRoutingGateway(artefact);
            }
        }
        // IPSec Connections
        if (okit_json.hasOwnProperty('ipsec_connections')) {
            for (let artefact of okit_json['ipsec_connections']) {
                let obj = this.newIPSecConnection(artefact);
            }
        }
        // RemotePeering Connections
        if (okit_json.hasOwnProperty('remote_peering_connections')) {
            for (let artefact of okit_json['remote_peering_connections']) {
                let obj = this.newRemotePeeringConnection(artefact);
            }
        }

        // Virtual Cloud Network Sub Components
        // Internet Gateways
        if (okit_json.hasOwnProperty('internet_gateways')) {
            for (let artefact of okit_json['internet_gateways']) {
                let obj = this.newInternetGateway(artefact);
            }
        }
        // NAT Gateway
        if (okit_json.hasOwnProperty('nat_gateways')) {
            for (let artefact of okit_json['nat_gateways']) {
                let obj = this.newNATGateway(artefact);
            }
        }
        // Route Tables
        if (okit_json.hasOwnProperty('route_tables')) {
            for (let artefact of okit_json['route_tables']) {
                let obj = this.newRouteTable(artefact);
            }
        }
        // Security Lists
        if (okit_json.hasOwnProperty('security_lists')) {
            for (let artefact of okit_json['security_lists']) {
                let obj = this.newSecurityList(artefact);
            }
        }
        // Network Security Groups
        if (okit_json.hasOwnProperty('network_security_groups')) {
            for (let artefact of okit_json['network_security_groups']) {
                let obj = this.newNetworkSecurityGroup(artefact);
            }
        }
        // Service Gateways
        if (okit_json.hasOwnProperty('service_gateways')) {
            for (let artefact of okit_json['service_gateways']) {
                let obj = this.newServiceGateway(artefact);
            }
        }
        // Local Peering Gateways
        if (okit_json.hasOwnProperty('local_peering_gateways')) {
            for (let artefact of okit_json['local_peering_gateways']) {
                let obj = this.newLocalPeeringGateway(artefact);
            }
        }
        // Subnets
        if (okit_json.hasOwnProperty('subnets')) {
            for (let artefact of okit_json['subnets']) {
                let obj = this.newSubnet(artefact);
            }
        }
        // OkeClusters
        if (okit_json.hasOwnProperty('oke_clusters')) {
            for (let artefact of okit_json['oke_clusters']) {
                let obj = this.newOkeCluster(artefact);
            }
        }

        // Subnet Subcomponents
        // File Storage Systems
        if (okit_json.hasOwnProperty('file_storage_systems')) {
            for (let artefact of okit_json['file_storage_systems']) {
                let obj = this.newFileStorageSystem(artefact);
            }
        }
        // Database Systems
        if (okit_json.hasOwnProperty('database_systems')) {
            for (let artefact of okit_json['database_systems']) {
                let obj = this.newDatabaseSystem(artefact);
            }
        }
        // MySQL Database Systems
        if (okit_json.hasOwnProperty('mysql_database_systems')) {
            for (let artefact of okit_json['mysql_database_systems']) {
                let obj = this.newMySQLDatabaseSystem(artefact);
            }
        }
        // Instances
        if (okit_json.hasOwnProperty('instances')) {
            for (let artefact of okit_json['instances']) {
                let subnet = this.getSubnet(artefact.subnet_id)
                let obj = this.newInstance(artefact);
            }
        }
        // InstancePools
        if (okit_json.hasOwnProperty('instance_pools')) {
            for (let artefact of okit_json['instance_pools']) {
                let obj = this.newInstancePool(artefact);
            }
        }
        // Load Balancers
        if (okit_json.hasOwnProperty('load_balancers')) {
            for (let artefact of okit_json['load_balancers']) {
                let obj = this.newLoadBalancer(artefact);
            }
        }

        // Exadata Infrastructure Sub Components
        // VM Clusters
        if (okit_json.hasOwnProperty('vm_clusters')) {
            for (let artefact of okit_json['vm_clusters']) {
                let obj = this.newVmCluster(artefact);
            }
        }
        // VM Cluster Networks
        if (okit_json.hasOwnProperty('vm_cluster_networks')) {
            for (let artefact of okit_json['vm_cluster_networks']) {
                let obj = this.newVmClusterNetwork(artefact);
            }
        }

        // VM Cluster Sub Components
        // DB Homes
        if (okit_json.hasOwnProperty('db_homes')) {
            for (let artefact of okit_json['db_homes']) {
                let obj = this.newDbHome(artefact);
            }
        }
        // DB Nodes
        if (okit_json.hasOwnProperty('db_nodes')) {
            for (let artefact of okit_json['db_nodes']) {
                let obj = this.newDbNode(artefact);
            }
        }
        // Database
        if (okit_json.hasOwnProperty('databases')) {
            for (let artefact of okit_json['databases']) {
                let obj = this.newDatabase(artefact);
            }
        }

        console.log();
    }

    /*
    ** Clear Model 
    */
   clear() {
        // Clear
        this.title = "OKIT OCI Visualiser Json";
        this.description = `# Description\n__Created ${getCurrentDateTime()}__\n\n--------------------------------------\n\n`;
        this.created = getCurrentDateTime();
        this.updated = this.created;
        this.okit_version = okitVersion;
        for (const [key, value] of Object.entries(this)) {
            if (Array.isArray(value)) {this[key] = []}
        }
   }

    /*
    ** Artifact Processing
     */

    // Autonomous Database
    newAutonomousDatabase(data) {
        console.info('New Autonomous Database');
        this.autonomous_databases.push(new AutonomousDatabase(data, this));
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
    deleteAutonomousDatabase(id) {
        for (let i = 0; i < this.autonomous_databases.length; i++) {
            if (this.autonomous_databases[i].id === id) {
                this.autonomous_databases[i].delete();
                this.autonomous_databases.splice(i, 1);
                break;
            }
        }
    }

    // Block Storage Volume
    newBlockStorageVolume(data) {
        console.info('New Block Storage Volume');
        this.block_storage_volumes.push(new BlockStorageVolume(data, this));
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
    deleteBlockStorageVolume(id) {
        for (let i = 0; i < this.block_storage_volumes.length; i++) {
            if (this.block_storage_volumes[i].id === id) {
                this.block_storage_volumes[i].delete();
                this.block_storage_volumes.splice(i, 1);
                break;
            }
        }
    }

    // Compartment
    newCompartment(data = {}) {
        console.info('New Compartment');
        this.compartments.push(new Compartment(data, this));
        return this.compartments[this.compartments.length - 1];
    }
    getCompartments() {return this.compartments;}
    getCompartment(id='') {
        for (let artefact of this.getCompartments()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteCompartment(id) {
        for (let i = 0; i < this.compartments.length; i++) {
            if (this.compartments[i].id === id) {
                this.compartments[i].delete();
                this.compartments.splice(i, 1);
                break;
            }
        }
    }

    // Customer Premise Equipment
    newCustomerPremiseEquipment(data = {}) {
        console.info('New CustomerPremiseEquipment');
        this.customer_premise_equipments.push(new CustomerPremiseEquipment(data, this));
        return this.customer_premise_equipments[this.customer_premise_equipments.length - 1];
    }
    getCustomerPremiseEquipments() {return this.customer_premise_equipments;}
    getCustomerPremiseEquipment(id='') {
        for (let artefact of this.getCustomerPremiseEquipments()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteCustomerPremiseEquipment(id) {
        for (let i = 0; i < this.customer_premise_equipments.length; i++) {
            if (this.customer_premise_equipments[i].id === id) {
                this.customer_premise_equipments[i].delete();
                this.customer_premise_equipments.splice(i, 1);
                break;
            }
        }
    }

    // Database System
    newDatabaseSystem(data) {
        console.info('New Database System');
        this.database_systems.push(new DatabaseSystem(data, this));
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
    deleteDatabaseSystem(id) {
        for (let i = 0; i < this.database_systems.length; i++) {
            if (this.database_systems[i].id === id) {
                this.database_systems[i].delete();
                this.database_systems.splice(i, 1);
                break;
            }
        }
    }

    // Dynamic Routing Gateway
    newDynamicRoutingGateway(data) {
        console.info('New Dynamic Routing Gateway');
        this.dynamic_routing_gateways.push(new DynamicRoutingGateway(data, this));
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
    deleteDynamicRoutingGateway(id) {
        for (let i = 0; i < this.dynamic_routing_gateways.length; i++) {
            if (this.dynamic_routing_gateways[i].id === id) {
                this.dynamic_routing_gateways[i].delete();
                this.dynamic_routing_gateways.splice(i, 1);
                break;
            }
        }
    }

    // FastConnect
    newFastConnect(data) {
        console.info('New FastConnect');
        this.fast_connects.push(new FastConnect(data, this));
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
    deleteFastConnect(id) {
        for (let i = 0; i < this.fast_connects.length; i++) {
            if (this.fast_connects[i].id === id) {
                this.fast_connects[i].delete();
                this.fast_connects.splice(i, 1);
                break;
            }
        }
    }

    // File Storage System
    newFileStorageSystem(data) {
        console.info('New File Storage System');
        this.file_storage_systems.push(new FileStorageSystem(data, this));
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
    deleteFileStorageSystem(id) {
        for (let i = 0; i < this.file_storage_systems.length; i++) {
            if (this.file_storage_systems[i].id === id) {
                this.file_storage_systems[i].delete();
                this.file_storage_systems.splice(i, 1);
                break;
            }
        }
    }

    // Instance
    newInstance(data) {
        console.info('New Instance');
        this.instances.push(new Instance(data, this));
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
    deleteInstance(id) {
        for (let i = 0; i < this.instances.length; i++) {
            if (this.instances[i].id === id) {
                this.instances[i].delete();
                this.instances.splice(i, 1);
                break;
            }
        }
    }
    getInstanceByBlockVolumeId(id) {
        return this.getInstances().filter(i => i.block_storage_volume_ids.includes(id));
    }

    // InstancePool
    newInstancePool(data) {
        console.info('New InstancePool');
        this.instance_pools.push(new InstancePool(data, this));
        return this.instance_pools[this.instance_pools.length - 1];
    }
    getInstancePools() {
        return this.instance_pools;
    }
    getInstancePool(id='') {
        for (let artefact of this.getInstancePools()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteInstancePool(id) {
        for (let i = 0; i < this.instance_pools.length; i++) {
            if (this.instance_pools[i].id === id) {
                this.instance_pools[i].delete();
                this.instance_pools.splice(i, 1);
                break;
            }
        }
    }

    // Internet Gateway
    newInternetGateway(data) {
        console.info('New Internet Gateway');
        this.internet_gateways.push(new InternetGateway(data, this));
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
    deleteInternetGateway(id) {
        for (let i = 0; i < this.internet_gateways.length; i++) {
            if (this.internet_gateways[i].id === id) {
                this.internet_gateways[i].delete();
                this.internet_gateways.splice(i, 1);
                break;
            }
        }
    }

    // IPSec Connection
    newIpsecConnection(data) {return this.newIPSecConnection(data)}
    newIPSecConnection(data) {
        console.info('New IPSec Connection');
        this.ipsec_connections.push(new IPSecConnection(data, this));
        return this.ipsec_connections[this.ipsec_connections.length - 1];
    }
    getIpsecConnections() {return this.ipsec_connections;}
    getIpsecConnection(id='') {return this.getIPSecConnection(id)}
    getIPSecConnections() {return this.ipsec_connections;}
    getIPSecConnection(id='') {
        for (let artefact of this.getIPSecConnections()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteIPSecConnection(id) {
        for (let i = 0; i < this.ipsec_connections.length; i++) {
            if (this.ipsec_connections[i].id === id) {
                this.ipsec_connections[i].delete();
                this.ipsec_connections.splice(i, 1);
                break;
            }
        }
    }

    // Load Balancer
    newLoadBalancer(data) {
        console.info('New Load Balancer');
        this.load_balancers.push(new LoadBalancer(data, this));
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
    deleteLoadBalancer(id) {
        for (let i = 0; i < this.load_balancers.length; i++) {
            if (this.load_balancers[i].id === id) {
                this.load_balancers[i].delete();
                this.load_balancers.splice(i, 1);
                break;
            }
        }
    }

    // Local Peering Gateway
    newLocalPeeringGateway(data) {
        console.info('New Local Peering Gateway');
        this.local_peering_gateways.push(new LocalPeeringGateway(data, this));
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
    deleteLocalPeeringGateway(id) {
        for (let i = 0; i < this.local_peering_gateways.length; i++) {
            if (this.local_peering_gateways[i].id === id) {
                this.local_peering_gateways[i].delete();
                this.local_peering_gateways.splice(i, 1);
                break;
            }
        }
    }

    // MySQL Database System
    newMysqlDatabaseSystem(data) {return this.newMySQLDatabaseSystem(data)}
    newMySQLDatabaseSystem(data) {
        console.info('New MySQL Database System');
        this.mysql_database_systems.push(new MySQLDatabaseSystem(data, this));
        return this.mysql_database_systems[this.mysql_database_systems.length - 1];
    }
    getMysqlDatabaseSystems() {return this.mysql_database_systems;}
    getMysqlDatabaseSystem(id='') {return this.getMySQLDatabaseSystem(id)}
    getMySQLDatabaseSystems() {return this.mysql_database_systems;}
    getMySQLDatabaseSystem(id='') {
        for (let artefact of this.getMySQLDatabaseSystems()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteMySQLDatabaseSystem(id) {
        for (let i = 0; i < this.mysql_database_systems.length; i++) {
            if (this.mysql_database_systems[i].id === id) {
                this.mysql_database_systems[i].delete();
                this.mysql_database_systems.splice(i, 1);
                break;
            }
        }
    }

    // NAT Gateway
    newNatGateway(data) {return this.newNATGateway(data)}
    newNATGateway(data) {
        console.info('New NAT Gateway');
        this.nat_gateways.push(new NATGateway(data, this));
        return this.nat_gateways[this.nat_gateways.length - 1];
    }
    getNatGateways() {return this.nat_gateways;}
    getNatGateway(id='') {return this.getNATGateway(id)}
    getNATGateways() {return this.nat_gateways;}
    getNATGateway(id='') {
        for (let artefact of this.getNATGateways()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteNATGateway(id) {
        for (let i = 0; i < this.nat_gateways.length; i++) {
            if (this.nat_gateways[i].id === id) {
                this.nat_gateways[i].delete();
                this.nat_gateways.splice(i, 1);
                break;
            }
        }
    }

    // Network Security Group
    newNetworkSecurityGroup(data) {
        console.info('New Network Security Group');
        this.network_security_groups.push(new NetworkSecurityGroup(data, this));
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
    deleteNetworkSecurityGroup(id) {
        for (let i = 0; i < this.network_security_groups.length; i++) {
            if (this.network_security_groups[i].id === id) {
                this.network_security_groups[i].delete();
                this.network_security_groups.splice(i, 1);
                break;
            }
        }
    }

    // Object Storage Bucket
    newObjectStorageBucket(data) {
        console.info('New Object Storage Bucket');
        this.object_storage_buckets.push(new ObjectStorageBucket(data, this));
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
    deleteObjectStorageBucket(id) {
        for (let i = 0; i < this.object_storage_buckets.length; i++) {
            if (this.object_storage_buckets[i].id === id) {
                this.object_storage_buckets[i].delete();
                this.object_storage_buckets.splice(i, 1);
                break;
            }
        }
    }

    // OkeCluster
    newOkeCluster(data) {
        console.info('New OkeCluster');
        this.oke_clusters.push(new OkeCluster(data, this));
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
    deleteOkeCluster(id) {
        for (let i = 0; i < this.oke_clusters.length; i++) {
            if (this.oke_clusters[i].id === id) {
                this.oke_clusters[i].delete();
                this.oke_clusters.splice(i, 1);
                break;
            }
        }
    }

    // RemotePeeringConnection
    newRemotePeeringConnection(data) {
        console.info('New Remote Peering Connection');
        this.remote_peering_connections.push(new RemotePeeringConnection(data, this));
        return this.remote_peering_connections[this.remote_peering_connections.length - 1];
    }
    getRemotePeeringConnections() {return this.remote_peering_connections;}
    getRemotePeeringConnection(id='') {
        for (let artefact of this.getRemotePeeringConnections()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteRemotePeeringConnection(id) {
        for (let i = 0; i < this.remote_peering_connections.length; i++) {
            if (this.remote_peering_connections[i].id === id) {
                this.remote_peering_connections[i].delete();
                this.remote_peering_connections.splice(i, 1);
                break;
            }
        }
    }

    // Route Table
    newRouteTable(data) {
        console.info('New Route Table');
        this.route_tables.push(new RouteTable(data, this));
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
    deleteRouteTable(id) {
        for (let i = 0; i < this.route_tables.length; i++) {
            if (this.route_tables[i].id === id) {
                this.route_tables[i].delete();
                this.route_tables.splice(i, 1);
                break;
            }
        }
    }

    // Security List
    newSecurityList(data) {
        console.info('New Security List');
        this.security_lists.push(new SecurityList(data, this));
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
    deleteSecurityList(id) {
        for (let i = 0; i < this.security_lists.length; i++) {
            if (this.security_lists[i].id === id) {
                this.security_lists[i].delete();
                this.security_lists.splice(i, 1);
                break;
            }
        }
    }

    // Service Gateway
    newServiceGateway(data) {
        console.info('New Service Gateway');
        this.service_gateways.push(new ServiceGateway(data, this));
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
    deleteServiceGateway(id) {
        for (let i = 0; i < this.service_gateways.length; i++) {
            if (this.service_gateways[i].id === id) {
                this.service_gateways[i].delete();
                this.service_gateways.splice(i, 1);
                break;
            }
        }
    }

    // Subnet
    newSubnet(data) {
        console.info('New Subnet');
        this.subnets.push(new Subnet(data, this));
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
    deleteSubnet(id) {
        for (let i = 0; i < this.subnets.length; i++) {
            if (this.subnets[i].id === id) {
                this.subnets[i].delete();
                this.subnets.splice(i, 1);
                break;
            }
        }
    }

    // Virtual Cloud Network
    newVirtualCloudNetwork(data) {
        console.info('New Virtual Cloud Network');
        this.virtual_cloud_networks.push(new VirtualCloudNetwork(data, this));
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
    deleteVirtualCloudNetwork(id) {
        for (let i = 0; i < this.virtual_cloud_networks.length; i++) {
            if (this.virtual_cloud_networks[i].id === id) {
                this.virtual_cloud_networks[i].delete();
                this.virtual_cloud_networks.splice(i, 1);
                break;
            }
        }
    }

    // Fragment
    newFragment(target) {
        console.info('New Fragment');
        return new Fragment(target, this);
    }

    /*
    ** Export Functions
     */
    // Terraform
    exportTerraform(callback=null) {}
    // Ansible
    exportAnsible(callback=null) {}
    // Resource Manager
    exportResourceManager(callback=null) {}

    /*
    ** Data Validation
     */
    validate(successCallback = null, errorCallback = null) {
        $.ajax({
            type: 'post',
            url: 'validate',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(this),
            success: function(resp) {
                console.info('Validation Response : ' + resp);
                if (successCallback && successCallback !== null) successCallback(JSON.parse(resp));
            },
            error: function(xhr, status, error) {
                console.warn('Status : '+ status)
                console.warn('Error  : '+ error)
                if (errorCallback && errorCallback !== null) errorCallback(error);
            }
        });
    }

    /*
    ** Calculate price
     */
    estimateCost(callback=null) {
        $.ajax({
            type: 'post',
            url: 'pricing/estimate',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(this),
            success: function(resp) {
                //console.info('Estimator Response : ' + resp);
                if (callback && callback !== null) callback(JSON.parse(resp));
            },
            error: function(xhr, status, error) {
                console.warn('Status : '+ status)
                console.warn('Error  : '+ error)
            }
        });
    }

}

/*
** Model representation of each artefact within OCI
 */
class OkitArtifact {
    /*
    ** Create
     */
    constructor (okitjson) {
        this.getOkitJson = function() {return okitjson};
        // Add Id
        this.id = this.okit_id;
        // All Artefacts will have compartment id, display name & description
        this.compartment_id = '';
        this.display_name = '';
        this.definition = '';
        // Add default for common Tag variables
        this.freeform_tags = {};
        this.defined_tags = {};
        Object.defineProperty(this, 'okit_json', {
            get: function () {
                return okitjson;
            }
        });
        // Read Only flag to indicate that we should not create this Resource
        this.read_only = false;
    }

    get name() {return this.display_name;}
    set name(name) {this.display_name = name;}
    get okit_id() {return 'okit.' + this.constructor.name.toLowerCase() + '.' + uuidv4();}
    get resource_name() {return this.getArtifactReference();}
    get list_name() {return `${this.resource_name.toLowerCase().split(' ').join('_')}s`;}
    get json_model_list() {return this.okit_json[this.list_name];}
    set json_model_list(list) {this.okit_json[this.list_name] = list;}

    /*
    ** Clone Functionality
     */
    clone() {
        alert('Clone function "clone()" has not been implemented.');
        return;
    }

    /*
    ** Clean - Remove null & undefined
     */
    clean(obj) {
        return JSON.clean(obj);
    }

    /*
    ** Merge Functionality
     */
    merge(update) {
        if (update.name !== undefined) {
            if (update.display_name === undefined || update.display_name === '') update.display_name = update.name;
            delete update.name;
        }
        $.extend(true, this, this.clean(update));
    }

    /*
    ** Convert Functionality will be overridden to allow backwards compatibility
     */
    convert() {
        if (this.parent_id !== undefined) {delete this.parent_id;}
    }

    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        //alert('Get Artifact Reference function "getArtifactReference()" has not been implemented.');
        return this.constructor.getArtifactReference();
    }

    artefactToElement(name) {
        return name.toLowerCase().split(' ').join('_') + 's';
    }


    /*
    ** Delete Processing
     */
    delete() {
        console.info('Delete (Default) ' + this.getArtifactReference() + ' : ' + this.id);
        this.json_model_list = this.json_model_list.filter((e) => e.id != this.id)
        // Delete Child Artifacts
        this.deleteChildren();
    }

    deleteChildren() {
        console.warn('Default empty deleteChildren()');
    }

    getChildren(artefact) {
        console.warn('Default empty getChildren()');
    }


    /*
    ** Define Allowable SVG Drop Targets
     */
    getDropTargets() {
        // Return list of Artifact names
        return this.constructor.getDropTargets();
    }


    /*
    ** Default name generation
     */
    generateDefaultName(count = 0) {
        return this.getNamePrefix() + ('000' + count).slice(-3);
    }

    getNamePrefix() {
        return okitSettings ? okitSettings.name_prefix : 'okit-';
    }

    getAvailabilityDomainNumber(availability_domain) {
        if (availability_domain) {
            return availability_domain.slice(-1);
        } else {
            return availability_domain;
        }
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

    static query(request={}, region='') {
        console.error('Query not implemented');
    }

}

/*
** Model Representation of OCI Regions
 */
class OkitRegions {
    /*
    ** Create
     */
    constructor() {
        this['us-sanjose-1'] = new OkitJson();
        this['us-phoenix-1'] = new OkitJson();
        this['us-ashburn-1'] = new OkitJson();
        this['uk-london-1'] = new OkitJson();
        this['sa-saopaulo-1'] = new OkitJson();
        this['me-jeddah-1'] = new OkitJson();
        this['eu-zurich-1'] = new OkitJson();
        this['eu-frankfurt-1'] = new OkitJson();
        this['eu-amsterdam-1'] = new OkitJson();
        this['ca-toronto-1'] = new OkitJson();
        this['ca-montreal-1'] = new OkitJson();
        this['ap-tokyo-1'] = new OkitJson();
        this['ap-sydney-1'] = new OkitJson();
        this['ap-seoul-1'] = new OkitJson();
        this['ap-osaka-1'] = new OkitJson();
        this['ap-mumbai-1'] = new OkitJson();
        this['ap-melbourne-1'] = new OkitJson();
        this['ap-hyderabad-1'] = new OkitJson();
        this['ap-chuncheon-1'] = new OkitJson();
    }
}

let okitJsonModel
