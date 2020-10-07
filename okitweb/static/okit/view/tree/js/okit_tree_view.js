/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Tree View Javascript');

class OkitJsonTreeView extends OkitJsonView {
    constructor(okitjson = null, parent_id = 'canvas-div') {
        super(okitjson);
        this.parent_id = parent_id;
    }
    get root() {return 'root_ul';}
    get compartment_root() {return 'compartment_root';}
    get compartment_root_ul() {return this.compartment_root + '_ul';}
    get ad_root() {return 'availability_domain_root';}
    get ad_root_ul() {return this.ad_root + '_ul';}
    get ad_root_div() {return this.ad_root + '_div';}
    get network_root() {return 'network_root';}
    get network_root_ul() {return this.network_root + '_ul';}

    draw() {
        $(jqId(this.parent_id)).empty();
        // Add root
        d3.select(d3Id(this.parent_id)).append('ul')
            .attr('id', this.root)
            .attr('class', '');
        // Add Compartment Root
        this.addItemToTree(this.root, this.compartment_root, 'compartment-tree-view', 'Compartments', true);
        // Add Compartment Tree
        for (let compartment of this.getOkitJson().getCompartments()) {
            console.info('Checking ' + compartment.display_name);
            // Only Draw Top Level
            if (compartment.compartment_id === undefined || compartment.compartment_id === null || compartment.compartment_id === 'canvas') {
                this.drawCompartment(compartment.id, this.compartment_root_ul, 'ct');
                break;
            }
        }
        // Add Availability Domain Root
        this.addItemToTree(this.root, 'spacer_1', '', '-------------------', false);
        this.addItemToTree(this.root, this.ad_root, 'availability-domain-tree-view', 'Availability Domains', true);
        // Add Availability Domain
        for (let ad of [1, 2, 3]) {
            this.drawAvailabilityDomain(ad, this.ad_root_ul, 'at');
        }
        $(jqId(this.ad_root_div)).trigger('click');
        // Add Network Root
        this.addItemToTree(this.root, 'spacer_2', '', '-------------------', false);
        this.addItemToTree(this.root, this.network_root, 'vcn-tree-view', 'Networks', true);
        // Add Virtual Cloud Networks
        for (let vcn of this.getOkitJson().getVirtualCloudNetworks()) {
            this.drawVirtualCloudNetwork(vcn.id, this.network_root_ul, 'nt');
        }
    }

    // Add li & ul
    addItemToTree(parent_id, id, css_class, text, collapsible=false, prefix='') {
        d3.select(d3Id(parent_id)).append('li')
            .attr('id', `${prefix}${id}_li`)
            .attr('class', css_class)
            .append('div')
                .attr('id', `${prefix}${id}_div`)
                .append('label')
                    .attr('id', `${prefix}${id}_label`)
                    .text(text)
                    .on('click', () => {d3.select(d3Id(id + '-svg')).on('click')()})
                    .on('mouseover', () => {$(jqId(id)).addClass('okit-explorer-view-highlight')})
                    .on('mouseleave', () => {$(jqId(id)).removeClass('okit-explorer-view-highlight')});
        if (collapsible) {
            d3.select(d3Id(`${prefix}${id}_div`)).on('click', () => {
                $(jqId(`${prefix}${id}_li ul`)).toggleClass('hidden');
                $(jqId(`${prefix}${id}_div`)).toggleClass('tree_closed');
            });
            d3.select(d3Id(`${prefix}${id}_li`)).append('ul')
                .attr('id', `${prefix}${id}_ul`)
                .attr('class', '');
            $(jqId(`${prefix}${id}_li`)).addClass('collapsible-view-element');
        } else {
            $(jqId(`${prefix}${id}_li`)).addClass('simple-view-element');
        }
    }

    // Autonomous Database
    drawAutonomousDatabase(id, parent_id, prefix = '') {
        console.info('Drawing Autonomous Database ' + id);
        this.addItemToTree(parent_id, id, 'autonomous-database-tree-view', this.getOkitJson().getAutonomousDatabase(id).display_name, false);
    }

    // Block Storage Volume
    drawBlockStorageVolume(id, parent_id, prefix = '') {
        console.info('Drawing Block Storage ' + id);
        this.addItemToTree(parent_id, id, 'block-storage-tree-view', this.getOkitJson().getBlockStorageVolume(id).display_name, false);
    }

    // Availability Domain
    drawAvailabilityDomain(id, parent_id, prefix='') {
        console.info('Drawing Availability Domain ' + id);
        this.addItemToTree(parent_id, `ad_${id}`, 'availability-domain-tree-view', `Availability Domain ${id}`, true, prefix);
        this.drawAvailabilityDomainSubComponents(id, prefix);
    }

    drawAvailabilityDomainSubComponents(id, prefix='') {
        // Subnets
        for (let subnet of this.getOkitJson().getSubnets()) {
            if (parseInt(subnet.availability_domain) === id) {
                this.drawSubnet(subnet.id, `${prefix}ad_${id}_ul`, prefix);
            }
        }
        // Instances
        for (let instance of this.getOkitJson().getInstances()) {
            if (parseInt(instance.availability_domain) === id) {
                this.drawInstance(instance.id, `${prefix}ad_${id}_ul`, prefix);
            }
        }
        // Database Systems
        for (let database_system of this.getOkitJson().getDatabaseSystems()) {
            if (parseInt(database_system.availability_domain) === id) {
                this.drawDatabaseSystem(database_system.id, `${prefix}ad_${id}_ul`, prefix);
            }
        }
        // Block Storage Volume
        for (let block_storage_volume of this.getOkitJson().getBlockStorageVolumes()) {
            if (parseInt(block_storage_volume.availability_domain) === id) {
                this.drawBlockStorageVolume(block_storage_volume.id, `${prefix}ad_${id}_ul`, prefix);
            }
        }
    }

    // Compartments
    drawCompartment(id, parent_id, prefix = '') {
        console.info('Drawing Compartment ' + id);
        this.addItemToTree(parent_id, id, 'compartment-tree-view', this.getOkitJson().getCompartment(id).display_name, true, prefix);
        this.drawCompartmentSubComponents(id, prefix);
    }

    drawCompartmentSubComponents(id, prefix='') {
        // Autonomous Databases
        for (let autonomous_database of this.getOkitJson().getAutonomousDatabases()) {
            if (autonomous_database.compartment_id === id) {
                this.drawAutonomousDatabase(autonomous_database.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Block Storage Volumes
        for (let block_storage_volume of this.getOkitJson().getBlockStorageVolumes()) {
            if (block_storage_volume.compartment_id === id) {
                this.drawBlockStorageVolume(block_storage_volume.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Object Storage Buckets
        for (let object_storage_bucket of this.getOkitJson().getObjectStorageBuckets()) {
            if (object_storage_bucket.compartment_id === id) {
                this.drawObjectStorageBucket(object_storage_bucket.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Compartments
        for (let compartment of this.getOkitJson().getCompartments()) {
            if (compartment.compartment_id === id) {
                this.drawCompartment(compartment.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Virtual Cloud Networks
        for (let vcn of this.getOkitJson().getVirtualCloudNetworks()) {
            if (vcn.compartment_id === id) {
                this.drawVirtualCloudNetwork(vcn.id, `${prefix}${id}_ul`, prefix);
            }
        }
    }

    // Database Systems
    drawDatabaseSystem(id, parent_id, prefix = '') {
        console.info('Drawing Database System ' + id);
        this.addItemToTree(parent_id, id, 'database-system-tree-view', this.getOkitJson().getDatabaseSystem(id).display_name, false);
    }

    // Dynamic Routing Gateway
    drawDynamicRoutingGateway(id, parent_id, prefix = '') {
        console.info('Drawing Dynamic Routing Gateway ' + id);
        this.addItemToTree(parent_id, id, 'drg-tree-view', this.getOkitJson().getDynamicRoutingGateway(id).display_name, false);
    }

    // Fast Connect
    drawFastConnect(id, parent_id, prefix = '') {
        console.info('Drawing Fast Connect ' + id);
        this.addItemToTree(parent_id, id, 'fast-connect-tree-view', this.getOkitJson().getFastConnect(id).display_name, false);
    }

    // File Storage System
    drawFileStorageSystem(id, parent_id, prefix = '') {
        console.info('Drawing File Storage System ' + id);
        this.addItemToTree(parent_id, id, 'file-storage-tree-view', this.getOkitJson().getFileStorageSystem(id).display_name, false);
    }

    // Instance
    drawInstance(id, parent_id, prefix = '') {
        console.info('Drawing Instance ' + id);
        this.addItemToTree(parent_id, id, 'instance-tree-view', this.getOkitJson().getInstance(id).display_name, false);
    }

    // InternetGateway
    drawInternetGateway(id, parent_id, prefix = '') {
        console.info('Drawing Internet gateway ' + id);
        this.addItemToTree(parent_id, id, 'internet-gateway-tree-view', this.getOkitJson().getInternetGateway(id).display_name, false);
    }

    // Load Balancers
    drawLoadBalancer(id, parent_id, prefix = '') {
        console.info('Drawing Load Balancer ' + id);
        this.addItemToTree(parent_id, id, 'loadbalancer-tree-view', this.getOkitJson().getLoadBalancer(id).display_name, false);
    }

    // Local Peering Gateway
    drawLocalPeeringGateway(id, parent_id, prefix = '') {
        console.info('Drawing Local Peering Gateway ' + id);
        this.addItemToTree(parent_id, id, 'lpg-tree-view', this.getOkitJson().getLocalPeeringGateway(id).display_name, false);
    }

    // NAT Gateway
    drawNATGateway(id, parent_id, prefix = '') {
        console.info('Drawing NAT Gateway ' + id);
        this.addItemToTree(parent_id, id, 'nat-gateway-tree-view', this.getOkitJson().getNATGateway(id).display_name, false);
    }

    // Network Security Group
    drawNetworkSecurityGroup(id, parent_id, prefix = '') {
        console.info('Drawing Network Security Group ' + id);
        this.addItemToTree(parent_id, id, 'network-security-group-tree-view', this.getOkitJson().getNetworkSecurityGroup(id).display_name, false);
    }

    // Object Storage Bucket
    drawObjectStorageBucket(id, parent_id, prefix = '') {
        console.info('Drawing Object Storage Bucket ' + id);
        this.addItemToTree(parent_id, id, 'object-storage-tree-view', this.getOkitJson().getObjectStorageBucket(id).display_name, false);
    }

    // Route Table
    drawRouteTable(id, parent_id, prefix = '') {
        console.info('Drawing Route Table ' + id);
        this.addItemToTree(parent_id, id, 'route-table-tree-view', this.getOkitJson().getRouteTable(id).display_name, false);
    }

    // Security List
    drawSecurityList(id, parent_id, prefix = '') {
        console.info('Drawing Security List ' + id);
        this.addItemToTree(parent_id, id, 'security-list-tree-view', this.getOkitJson().getSecurityList(id).display_name, false);
    }

    // Service Gateway
    drawServiceGateway(id, parent_id, prefix = '') {
        console.info('Drawing Service Gateway ' + id);
        this.addItemToTree(parent_id, id, 'service-gateway-tree-view', this.getOkitJson().getServiceGateway(id).display_name, false);
    }

    // Subnets
    drawSubnet(id, parent_id, prefix = '') {
        console.info('Drawing Subnet ' + id);
        this.addItemToTree(parent_id, id, 'subnet-tree-view', this.getOkitJson().getSubnet(id).display_name, true, prefix);
        this.drawSubnetSubComponents(id, prefix);
    }

    drawSubnetSubComponents(id, prefix='') {
        // Route Tables
        for (let route_table of this.getOkitJson().getRouteTables()) {
            if (route_table.id === this.getOkitJson().getSubnet(id).route_table_id) {
                this.drawRouteTable(route_table.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Security Lists
        for (let security_list of this.getOkitJson().getSecurityLists()) {
            if (this.getOkitJson().getSubnet(id).security_list_ids.includes(security_list.id)) {
                this.drawSecurityList(security_list.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Load Balancers
        for (let loadbalancer of this.getOkitJson().getLoadBalancers()) {
            if (loadbalancer.subnet_id === id) {
                this.drawLoadBalancer(loadbalancer.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Instances
        for (let instance of this.getOkitJson().getInstances()) {
            if (instance.primary_vnic.subnet_id === id) {
                this.drawInstance(instance.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // File Storage Systems
        for (let file_storage_system of this.getOkitJson().getFileStorageSystems()) {
            if (file_storage_system.subnet_id === id) {
                this.drawFileStorageSystem(file_storage_system.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Database Systems
        for (let database_system of this.getOkitJson().getDatabaseSystems()) {
            if (database_system.subnet_id === id) {
                this.drawDatabaseSystem(database_system.id, `${prefix}${id}_ul`, prefix);
            }
        }
    }

    // Virtual Cloud Networks
    drawVirtualCloudNetwork(id, parent_id, prefix = '') {
        console.info('Drawing Virtual Cloud Network ' + id);
        this.addItemToTree(parent_id, id, 'vcn-tree-view', this.getOkitJson().getVirtualCloudNetwork(id).display_name, true, prefix);
        this.drawVirtualCloudNetworkSubComponents(id, prefix);
    }

    drawVirtualCloudNetworkSubComponents(id, prefix='') {
        // Internet Gateways
        for (let internet_gateway of this.getOkitJson().getInternetGateways()) {
            if (internet_gateway.vcn_id === id) {
                this.drawInternetGateway(internet_gateway.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // NAT Gateways
        for (let nat_gateway of this.getOkitJson().getNATGateways()) {
            if (nat_gateway.vcn_id === id) {
                this.drawNATGateway(nat_gateway.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Local Peering Gateways
        for (let local_peering_gateway of this.getOkitJson().getLocalPeeringGateways()) {
            if (local_peering_gateway.vcn_id === id) {
                this.drawLocalPeeringGateway(local_peering_gateway.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Dynamic Routing Gateways
        for (let dynamic_routing_gateway of this.getOkitJson().getDynamicRoutingGateways()) {
            if (dynamic_routing_gateway.vcn_id === id) {
                this.drawDynamicRoutingGateway(dynamic_routing_gateway.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Service Gateways
        for (let service_gateway of this.getOkitJson().getServiceGateways()) {
            if (service_gateway.vcn_id === id) {
                this.drawServiceGateway(service_gateway.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Route Tables
        for (let route_table of this.getOkitJson().getRouteTables()) {
            if (route_table.vcn_id === id) {
                this.drawRouteTable(route_table.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Security Lists
        for (let security_list of this.getOkitJson().getSecurityLists()) {
            if (security_list.vcn_id === id) {
                this.drawSecurityList(security_list.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Network Security Groups
        for (let network_security_group of this.getOkitJson().getNetworkSecurityGroups()) {
            if (network_security_group.vcn_id === id) {
                this.drawNetworkSecurityGroup(network_security_group.id, `${prefix}${id}_ul`, prefix);
            }
        }
        // Subnets
        for (let subnet of this.getOkitJson().getSubnets()) {
            if (subnet.vcn_id === id) {
                this.drawSubnet(subnet.id, `${prefix}${id}_ul`, prefix);
            }
        }
    }

}
