/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Tree View Javascript');

// TODO: Implement View Classes
class OkitJsonTreeView extends OkitJsonView {
    constructor(okitjson = null, parent_id = 'canvas-div') {
        super(okitjson);
        this.parent_id = parent_id;
    }

    draw() {
        $(jqId(this.parent_id)).empty();
        for (let compartment of this.getOkitJson().getCompartments()) {
            console.info('Checking ' + compartment.display_name);
            // Only Draw Top Level
            if (compartment.compartment_id === undefined || compartment.compartment_id === null || compartment.compartment_id === 'canvas') {
                this.drawCompartment(compartment.id, this.parent_id);
                break;
            }
        }
    }

    // Add ul > li
    addListItem(parent_id, id, css_class, text, collapsible=false) {
        let label = d3.select(d3Id(parent_id)).append('ul')
                        .attr('id', id + '_ul')
                        .attr('class', '')
                        .append('li')
                            .attr('id', id + '_li')
                            .attr('class', css_class)
                            .append('div')
                                .append('label')
                                    .text(text)
                                    .on('mouseover', () => {$(jqId(id)).addClass('okit-explorer-view-highlight')})
                                    .on('mouseleave', () => {$(jqId(id)).removeClass('okit-explorer-view-highlight')});
        if (collapsible) {
            label.on('click', () => {$(jqId(id + '_li ul')).toggleClass('hidden')});
        }
    }

    // Autonomous Database
    drawAutonomousDatabase(id, parent_id) {
        console.info('Drawing Autonomous Database ' + id);
        this.addListItem(parent_id, id, 'autonomous-database-tree-view', this.getOkitJson().getAutonomousDatabase(id).display_name, false);
    }

    // Block Storage Volume
    drawBlockStorageVolume(id, parent_id) {
        console.info('Drawing Block Storage ' + id);
        this.addListItem(parent_id, id, 'block-storage-tree-view', this.getOkitJson().getBlockStorageVolume(id).display_name, false);
    }


    // Compartments
    drawCompartment(id, parent_id) {
        console.info('Drawing Compartment ' + id);
        this.addListItem(parent_id, id, 'compartment-tree-view', this.getOkitJson().getCompartment(id).display_name, true);
        this.drawCompartmentSubComponents(id);
    }

    drawCompartmentSubComponents(id) {
        // Autonomous Databases
        for (let autonomous_database of this.getOkitJson().getAutonomousDatabases()) {
            if (autonomous_database.compartment_id === id) {
                this.drawAutonomousDatabase(autonomous_database.id, `${id}_li`);
            }
        }
        // Block Storage Volumes
        for (let block_storage_volume of this.getOkitJson().getBlockStorageVolumes()) {
            if (block_storage_volume.compartment_id === id) {
                this.drawBlockStorageVolume(block_storage_volume.id, `${id}_li`);
            }
        }
        // Object Storage Buckets
        for (let object_storage_bucket of this.getOkitJson().getObjectStorageBuckets()) {
            if (object_storage_bucket.compartment_id === id) {
                this.drawObjectStorageBucket(object_storage_bucket.id, `${id}_li`);
            }
        }
        // Compartments
        for (let compartment of this.getOkitJson().getCompartments()) {
            if (compartment.compartment_id === id) {
                this.drawCompartment(compartment.id, `${id}_li`);
            }
        }
        // Virtual Cloud Networks
        for (let vcn of this.getOkitJson().getVirtualCloudNetworks()) {
            if (vcn.compartment_id === id) {
                this.drawVirtualCloudNetwork(vcn.id, `${id}_li`);
            }
        }
    }

    // Database Systems
    drawDatabaseSystem(id, parent_id) {
        console.info('Drawing Database System ' + id);
        this.addListItem(parent_id, id, 'database-system-tree-view', this.getOkitJson().getDatabaseSystem(id).display_name, false);
    }

    // Dynamic Routing Gateway
    drawDynamicRoutingGateway(id, parent_id) {
        console.info('Drawing Dynamic Routing Gateway ' + id);
        this.addListItem(parent_id, id, 'drg-tree-view', this.getOkitJson().getDynamicRoutingGateway(id).display_name, false);
    }

    // Fast Connect
    drawFastConnect(id, parent_id) {
        console.info('Drawing Fast Connect ' + id);
        this.addListItem(parent_id, id, 'fast-connect-tree-view', this.getOkitJson().getFastConnect(id).display_name, false);
    }

    // File Storage System
    drawFileStorageSystem(id, parent_id) {
        console.info('Drawing File Storage System ' + id);
        this.addListItem(parent_id, id, 'file-storage-tree-view', this.getOkitJson().getFileStorageSystem(id).display_name, false);
    }

    // Instance
    drawInstance(id, parent_id) {
        console.info('Drawing Instance ' + id);
        this.addListItem(parent_id, id, 'instance-tree-view', this.getOkitJson().getInstance(id).display_name, false);
    }

    // InternetGateway
    drawInternetGateway(id, parent_id) {
        console.info('Drawing Internet gateway ' + id);
        this.addListItem(parent_id, id, 'internet-gateway-tree-view', this.getOkitJson().getInternetGateway(id).display_name, false);
    }

    // Load Balancers
    drawLoadBalancer(id, parent_id) {
        console.info('Drawing Load Balancer ' + id);
        this.addListItem(parent_id, id, 'loadbalancer-tree-view', this.getOkitJson().getLoadBalancer(id).display_name, false);
    }

    // Local Peering Gateway
    drawLocalPeeringGateway(id, parent_id) {
        console.info('Drawing Local Peering Gateway ' + id);
        this.addListItem(parent_id, id, 'lpg-tree-view', this.getOkitJson().getLocalPeeringGateway(id).display_name, false);
    }

    // NAT Gateway
    drawNATGateway(id, parent_id) {
        console.info('Drawing NAT Gateway ' + id);
        this.addListItem(parent_id, id, 'nat-gateway-tree-view', this.getOkitJson().getNATGateway(id).display_name, false);
    }

    // Network Security Group
    drawNetworkSecurityGroup(id, parent_id) {
        console.info('Drawing Network Security Group ' + id);
        this.addListItem(parent_id, id, 'network-security-group-tree-view', this.getOkitJson().getNetworkSecurityGroup(id).display_name, false);
    }

    // Object Storage Bucket
    drawObjectStorageBucket(id, parent_id) {
        console.info('Drawing Object Storage Bucket ' + id);
        this.addListItem(parent_id, id, 'object-storage-tree-view', this.getOkitJson().getObjectStorageBucket(id).display_name, false);
    }

    // Route Table
    drawRouteTable(id, parent_id) {
        console.info('Drawing Route Table ' + id);
        this.addListItem(parent_id, id, 'route-table-tree-view', this.getOkitJson().getRouteTable(id).display_name, false);
    }

    // Security List
    drawSecurityList(id, parent_id) {
        console.info('Drawing Security List ' + id);
        this.addListItem(parent_id, id, 'security-list-tree-view', this.getOkitJson().getSecurityList(id).display_name, false);
    }

    // Service Gateway
    drawServiceGateway(id, parent_id) {
        console.info('Drawing Service Gateway ' + id);
        this.addListItem(parent_id, id, 'service-gateway-tree-view', this.getOkitJson().getServiceGateway(id).display_name, false);
    }

    // Subnets
    drawSubnet(id, parent_id) {
        console.info('Drawing Subnet ' + id);
        this.addListItem(parent_id, id, 'subnet-tree-view', this.getOkitJson().getSubnet(id).display_name, true);
        this.drawSubnetSubComponents(id);
    }

    drawSubnetSubComponents(id) {
        // Route Tables
        for (let route_table of this.getOkitJson().getRouteTables()) {
            if (route_table.id === this.getOkitJson().getSubnet(id).route_table_id) {
                this.drawRouteTable(route_table.id, `${id}_li`);
            }
        }
        // Security Lists
        for (let security_list of this.getOkitJson().getSecurityLists()) {
            if (this.getOkitJson().getSubnet(id).security_list_ids.includes(security_list.id)) {
                this.drawSecurityList(security_list.id, `${id}_li`);
            }
        }
        // Load Balancers
        for (let loadbalancer of this.getOkitJson().getloadBalancers()) {
            if (loadbalancer.subnet_id === id) {
                this.drawLoadBalancer(loadbalancer.id, `${id}_li`);
            }
        }
        // Instances
        for (let instance of this.getOkitJson().getInstances()) {
            if (instance.subnet_id === id) {
                this.drawInstance(instance.id, `${id}_li`);
            }
        }
        // File Storage Systems
        for (let file_storage_system of this.getOkitJson().getFileStorageSystems()) {
            if (file_storage_system.subnet_id === id) {
                this.drawFileStorageSystem(file_storage_system.id, `${id}_li`);
            }
        }
        // Database Systems
        for (let database_system of this.getOkitJson().getDatabaseSystems()) {
            if (database_system.subnet_id === id) {
                this.drawDatabaseSystem(database_system.id, `${id}_li`);
            }
        }
    }

    // Virtual Cloud Networks
    drawVirtualCloudNetwork(id, parent_id) {
        console.info('Drawing Virtual Cloud Network ' + id);
        this.addListItem(parent_id, id, 'vcn-tree-view', this.getOkitJson().getVirtualCloudNetwork(id).display_name, true);
        this.drawVirtualCloudNetworkSubComponents(id);
    }

    drawVirtualCloudNetworkSubComponents(id) {
        // Internet Gateways
        for (let internet_gateway of this.getOkitJson().getInternetGateways()) {
            if (internet_gateway.vcn_id === id) {
                this.drawInternetGateway(internet_gateway.id, `${id}_li`);
            }
        }
        // NAT Gateways
        for (let nat_gateway of this.getOkitJson().getNATGateways()) {
            if (nat_gateway.vcn_id === id) {
                this.drawNATGateway(nat_gateway.id, `${id}_li`);
            }
        }
        // Local Peering Gateways
        for (let local_peering_gateway of this.getOkitJson().getLocalPeeringGateways()) {
            if (local_peering_gateway.vcn_id === id) {
                this.drawLocalPeeringGateway(local_peering_gateway.id, `${id}_li`);
            }
        }
        // Dynamic Routing Gateways
        for (let dynamic_routing_gateway of this.getOkitJson().getDynamicRoutingGateways()) {
            if (dynamic_routing_gateway.vcn_id === id) {
                this.drawDynamicRoutingGateway(dynamic_routing_gateway.id, `${id}_li`);
            }
        }
        // Service Gateways
        for (let service_gateway of this.getOkitJson().getServiceGateways()) {
            if (service_gateway.vcn_id === id) {
                this.drawServiceGateway(service_gateway.id, `${id}_li`);
            }
        }
        // Route Tables
        for (let route_table of this.getOkitJson().getRouteTables()) {
            if (route_table.vcn_id === id) {
                this.drawRouteTable(route_table.id, `${id}_li`);
            }
        }
        // Security Lists
        for (let security_list of this.getOkitJson().getSecurityLists()) {
            if (security_list.vcn_id === id) {
                this.drawSecurityList(security_list.id, `${id}_li`);
            }
        }
        // Network Security Groups
        for (let network_security_group of this.getOkitJson().getNetworkSecurityGroups()) {
            if (network_security_group.vcn_id === id) {
                this.drawNetworkSecurityGroup(network_security_group.id, `${id}_li`);
            }
        }
        // Subnets
        for (let subnet of this.getOkitJson().getSubnets()) {
            if (subnet.vcn_id === id) {
                this.drawSubnet(subnet.id, `${id}_li`);
            }
        }
    }


}