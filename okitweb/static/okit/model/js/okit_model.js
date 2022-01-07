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
        const now = getCurrentDateTime();
        this.title = "OKIT OCI Visualiser Json";
        this.description = `# Description\n__Created ${getCurrentDateTime()}__\n\n--------------------------------------\n\n`;
        // this.created = getCurrentDateTime();
        // this.updated = this.created;
        // this.okit_version = okitVersion;
        // this.okit_model_id = `okit-model-${uuidv4()}`;
        this.metadata = {
            resource_count: 0,
            platform: 'oci',
            created: now,
            updated: now,
            okit_version: okitVersion,
            okit_model_id: `okit-model-${uuidv4()}`
        }
        this.user_defined = {terraform: ''};
        this.freeform_tags = {};
        this.defined_tags = {};

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

    get deployment_platforms() {return ['oci', 'pca', 'freetier']}
    get created() {return this.metadata.created}
    get updated() {return this.metadata.updated}
    get okit_version() {return this.metadata.okit_version}
    get okit_model_id() {return this.metadata.okit_model_id}

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
        if (okit_json.title) {this.title = okit_json.title;}
        if (okit_json.description) {this.description = okit_json.description;}
        if (okit_json.user_defined && okit_json.user_defined.terraform) {this.user_defined.terraform = okit_json.user_defined.terraform}
        if (okit_json.freeform_tags) {this.freeform_tags = okit_json.freeform_tags}
        if (okit_json.defined_tags) {this.defined_tags = okit_json.defined_tags}
        if (okit_json.metadata) {this.metadata = {...this.metadata, ...okit_json.metadata}}
        // Update from older versions of file
        if (okit_json.created) {this.metadata.created = okit_json.created}
        if (okit_json.updated) {this.metadata.updated = okit_json.updated}
        if (okit_json.okit_version) {this.metadata.okit_version = okit_json.okit_version}
        if (okit_json.okit_model_id) {this.metadata.okit_model_id = okit_json.okit_model_id}
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
                // Increment resource count by number of resources added
                this.metadata.resource_count += this[key].length;
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
        // Check for root compartment
        this.checkCompartmentIds();
    }
    checkCompartmentIds() {
        const compartment_ids = this.compartments ? this.compartments.map((c) => c.id) : []
        let root_ids = this.compartments ? this.compartments.filter((c) => c.compartment_id === null) : []
        if (root_ids.length === 0) {
            this.compartments = [new Compartment({display_name: 'Deployment Compartment'}, this), ...this.compartments]
            root_ids = this.compartments ? this.compartments.filter((c) => c.compartment_id === null) : []
        }
        const root_id = root_ids[0].id
        // Assign Resources to root compartment if their compartment id is not in the design
        for (const [key, value] of Object.entries(this)) {
            if (Array.isArray(value)) {
                value.filter((v) => v.id !== root_id && !compartment_ids.includes(v.compartment_id)).forEach((r) => r.compartment_id = root_id)
            }
        }
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
        this.meta_data = {
            resource_count: 0,
            platform: 'oci',
            created: getCurrentDateTime(),
            updated: this.created,
            okit_version: okitVersion,
            okit_model_id: `okit-model-${uuidv4()}`
            }
        this.user_defined = {terraform: ''};
        this.freeform_tags = {};
        this.defined_tags = {};
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
        this.autonomous_databases = this.autonomous_databases ? this.autonomous_databases.filter((r) => r.id !== id) : []
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
        this.block_storage_volumes = this.block_storage_volumes ? this.block_storage_volumes.filter((r) => r.id !== id) : []
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
        this.compartments = this.compartments ? this.compartments.filter((r) => r.id !== id) : []
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
        this.customer_premise_equipments = this.customer_premise_equipments ? this.customer_premise_equipments.filter((r) => r.id !== id) : []
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
        this.database_systems = this.database_systems ? this.database_systems.filter((r) => r.id !== id) : []
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
        this.dynamic_routing_gateways = this.dynamic_routing_gateways ? this.dynamic_routing_gateways.filter((r) => r.id !== id) : []
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
        this.fast_connects = this.fast_connects ? this.fast_connects.filter((r) => r.id !== id) : []
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
        this.file_storage_systems = this.file_storage_systems ? this.file_storage_systems.filter((r) => r.id !== id) : []
    }

    // All Instance Resources
    getAllInstanceTypes() {
        return [...this.getInstances(), ...this.getAnalyticsInstances()]
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
        this.instances = this.instances ? this.instances.filter((r) => r.id !== id) : []
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
        this.instance_pools = this.instance_pools ? this.instance_pools.filter((r) => r.id !== id) : []
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
        this.internet_gateways = this.internet_gateways ? this.internet_gateways.filter((r) => r.id !== id) : []
    }

    // IPSec Connection
    newIpsecConnection(data) {
        console.info('New IPSec Connection');
        this.ipsec_connections.push(new IpsecConnection(data, this));
        return this.ipsec_connections[this.ipsec_connections.length - 1];
    }
    getIpsecConnections() {return this.ipsec_connections;}
    getIpsecConnection(id='') {
        for (let artefact of this.getIpsecConnections()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteIpsecConnection(id) {
        this.ipsec_connections = this.ipsec_connections ? this.ipsec_connections.filter((r) => r.id !== id) : []
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
        this.load_balancers = this.load_balancers ? this.load_balancers.filter((r) => r.id !== id) : []
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
        this.local_peering_gateways = this.local_peering_gateways ? this.local_peering_gateways.filter((r) => r.id !== id) : []
    }

    // MySQL Database System
    newMysqlDatabaseSystem(data) {
        console.info('New MySQL Database System');
        this.mysql_database_systems.push(new MysqlDatabaseSystem(data, this));
        return this.mysql_database_systems[this.mysql_database_systems.length - 1];
    }
    getMysqlDatabaseSystems() {return this.mysql_database_systems;}
    getMysqlDatabaseSystem(id='') {
        for (let artefact of this.getMysqlDatabaseSystems()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteMysqlDatabaseSystem(id) {
        this.mysql_database_systems = this.mysql_database_systems ? this.mysql_database_systems.filter((r) => r.id !== id) : []
    }

    // NAT Gateway
    newNatGateway(data) {
        console.info('New NAT Gateway');
        this.nat_gateways.push(new NatGateway(data, this));
        return this.nat_gateways[this.nat_gateways.length - 1];
    }
    getNatGateways() {return this.nat_gateways;}
    getNatGateway(id='') {
        for (let artefact of this.getNatGateways()) {
            if (artefact.id === id) {
                return artefact;
            }
        }
        return undefined;
    }
    deleteNatGateway(id) {
        this.nat_gateways = this.nat_gateways ? this.nat_gateways.filter((r) => r.id !== id) : []
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
        this.network_security_groups = this.network_security_groups ? this.network_security_groups.filter((r) => r.id !== id) : []
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
        this.object_storage_buckets = this.object_storage_buckets ? this.object_storage_buckets.filter((r) => r.id !== id) : []
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
        this.oke_clusters = this.oke_clusters ? this.oke_clusters.filter((r) => r.id !== id) : []
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
        this.remote_peering_connections = this.remote_peering_connections ? this.remote_peering_connections.filter((r) => r.id !== id) : []
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
        this.route_tables = this.route_tables ? this.route_tables.filter((r) => r.id !== id) : []
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
        this.security_lists = this.security_lists ? this.security_lists.filter((r) => r.id !== id) : []
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
        this.service_gateways = this.service_gateways ? this.service_gateways.filter((r) => r.id !== id) : []
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
        this.subnets = this.subnets ? this.subnets.filter((r) => r.id !== id) : []
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
        this.virtual_cloud_networks = this.virtual_cloud_networks ? this.virtual_cloud_networks.filter((r) => r.id !== id) : []
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
        this.display_name = this.generateDefaultName(okitjson.metadata.resource_count += 1);
        this.definition = '';
        this.okit_reference = `okit-${uuidv4()}`;
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
        // Add Terraform Resource Name
        this.resource_name = undefined;
    }

    get name() {return this.display_name;}
    set name(name) {this.display_name = name;}
    get okit_id() {return 'okit.' + this.constructor.name.toLowerCase() + '.' + uuidv4();}
    get resource_type() {return this.getArtifactReference();}
    get list_name() {return `${this.resource_type.toLowerCase().split(' ').join('_')}s`;}
    get json_model_list() {return this.okit_json[this.list_name];}
    set json_model_list(list) {this.okit_json[this.list_name] = list;}
    get children() {return Object.values(this.getOkitJson()).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter((r) => r.parent_id === this.id)}

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
        if (this.resource_name === undefined || this.resource_name === '') this.resource_name = this.generateTFResourceName(this.display_name)
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
        return okitSettings ? okitSettings.name_prefix : 'okit';
    }

    getAvailabilityDomainNumber(availability_domain) {
        if (availability_domain) {
            return availability_domain.slice(-1);
        } else {
            return availability_domain;
        }
    }

    generateTFResourceName(name) {return titleCase(name).split(' ').join('').replaceAll('-','_')}

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
class OkitRegionsJson {
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
