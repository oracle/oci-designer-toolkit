/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT OCI Query Javascript');

class OkitOCIQuery {
    constructor(regions = [], fast_discovery=false) {
        this.regions = regions;
        this.region_query_count = {};
        this.complete_callback = undefined;
        this.active_region = '';
        this.fast_discovery = fast_discovery;
    }

    query(request = null, complete_callback, region_complete_callback) {
        this.complete_callback = complete_callback;
        this.region_complete_callback = region_complete_callback;
        if (request) {
            for (const [i, region] of this.regions.entries()) {
                console.info(`${i} - Processing Selected Region : ${region}`);
                let region_request = JSON.clone(request);
                region_request.region = region;
                region_request.refresh = false;
                if (i === 0) {
                    region_request.refresh = true;
                    this.active_region = region;
                }
                regionOkitJson[region] = new OkitJson();
                this.fast_discovery ? this.queryAllResources(region_request) : this.queryRootCompartment(region_request);
            }
        }
    }

    queryAllResources(request) {
        console.info('------------- All Resources Query --------------------');
        let me = this;
        this.region_query_count[request.region] = 1;
        $.ajax({
            type: 'get',
            url: 'oci/query',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                console.log(resp)
                const response_json = JSON.parse(resp);
                const title = request.sub_compartments ? `Queried Compartment ${request.compartment_name} and Sub-Compartments` : `Queried Compartment ${request.compartment_name}`;
                const description = `${title} in Region ${request.region}`;
                regionOkitJson[request.region].load(response_json)
                regionOkitJson[request.region].title = title;
                regionOkitJson[request.region].description = description;
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
                const empty_compartment = {compartment_id: null, display_name: request.compartment_name, name: request.compartment_name};
                regionOkitJson[request.region].load({compartments: [empty_compartment]})
                regionOkitJson[request.region].title = 'Query Failed';
                regionOkitJson[request.region].description = error;
                if (error === 'UNAUTHORIZED') {
                    const response = JSON.parse(xhr.responseText);
                    console.error(response);
                    regionOkitJson[request.region].description = `${response.error.code}: ${response.error.message}`;
                }
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    isComplete() {
        if (this.complete_callback) {
            // Check if Region is complete
            for (let key of Object.keys(this.region_query_count)) {
                if (this.region_query_count[key] === 0) {
                    this.region_complete_callback(key);
                }
            }
            // Check if all Regions complete
            for (let key of Object.keys(this.region_query_count)) {
                if (this.region_query_count[key] > 0) {
                    return;
                }
            }
            this.setReadOnly();
            this.complete_callback(this.active_region);
        }
    }

    setReadOnly() {
        Object.entries(regionOkitJson).forEach(([r, j]) => {
            Object.entries(j).forEach(([k, v]) => {
                if (Array.isArray(v)) {
                    v.forEach((r) => r.read_only = true);
                }
            });
        });
    }

    queryAutonomousDatabases(request) {
        console.info('------------- Autonomous Database Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/AutonomousDatabase',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({autonomous_databases: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryBlockStorageVolumes(request) {
        console.info('------------- Block Storage Volume Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/BlockStorageVolume',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({block_storage_volumes: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryRootCompartment(request, refresh) {
        console.info('------------- Root Compartment Query --------------------');
        let me = this;
        this.region_query_count[request.region] = 1;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/Compartment',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                let title = request.sub_compartments ? `Queried Compartment ${response_json.name} and Sub-Compartments` : `Queried Compartment ${response_json.name}`;
                let description = `${title} in Region ${request.region}`;
                response_json.compartment_id = null;
                regionOkitJson[request.region].load({compartments: [response_json]})
                regionOkitJson[request.region].title = title;
                regionOkitJson[request.region].description = description;
                let sub_query_request = JSON.clone(request);
                sub_query_request.compartment_id = response_json.id;
                me.queryCompartmentSubComponents(sub_query_request);
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
                const empty_compartment = {compartment_id: null, display_name: request.compartment_name, name: request.compartment_name};
                regionOkitJson[request.region].load({compartments: [empty_compartment]})
                regionOkitJson[request.region].title = 'Query Failed';
                regionOkitJson[request.region].description = error;
                if (error === 'UNAUTHORIZED') {
                    const response = JSON.parse(xhr.responseText);
                    console.error(response);
                    regionOkitJson[request.region].description = `${response.error.code}: ${response.error.message}`;
                }
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }
    queryCompartments(request) {
        console.info('------------- Compartments Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/Compartments',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({compartments: response_json});
                for (let artefact of response_json) {
                    let sub_query_request = JSON.clone(request);
                    sub_query_request.compartment_id = artefact.id;
                    me.queryCompartmentSubComponents(sub_query_request);
                }
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }
    queryCompartmentSubComponents(request) {
        if (request.sub_compartments) {
            this.queryCompartments(request);
        }
        this.queryVirtualCloudNetworks(request);
        this.queryBlockStorageVolumes(request);
        this.queryCustomerPremiseEquipments(request);
        // this.queryDbNodes(request);
        this.queryDynamicRoutingGateways(request);
        this.queryVmClusters(request);
        this.queryExadataInfrastructures(request);
        this.queryAutonomousDatabases(request);
        this.queryObjectStorageBuckets(request);
        this.queryFastConnects(request);
        this.queryInstances(request);
        this.queryInstancePools(request);
        this.queryIPSecConnections(request);
        this.queryRemotePeeringConnections(request);
        this.queryDatabaseSystems(request);
        this.queryMySQLDatabaseSystems(request);
        this.queryFileStorageSystems(request);
        this.queryOkeClusters(request);
    }

    queryCustomerPremiseEquipments(request) {
        console.info('------------- Autonomous Customer Premise Equipment Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/CustomerPremiseEquipment',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({customer_premise_equipments: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryDatabases(request) {
        console.info('------------- Database Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/Database',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({databases: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryDatabaseSystems(request) {
        console.info('------------- Database Systems Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/DatabaseSystem',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({database_systems: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryDbHomes(request) {
        console.info('------------- Db Homes Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let self = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/DbHome',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({db_homes: response_json});
                for (let artefact of response_json) {
                    let sub_query_request = JSON.clone(request);
                    sub_query_request.db_home_id = artefact.id;
                    self.queryDbHomeSubComponents(sub_query_request);
                }
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                self.region_query_count[request.region]-- && self.isComplete();
            }
        });
    }
    queryDbHomeSubComponents(request) {
        // this.queryDbNodes(request);
        this.queryDatabases(request);
    }

    queryDbNodes(request) {
        console.info('------------- Db Nodes Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/DbNode',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({db_nodes: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryDynamicRoutingGateways(request) {
        console.info('------------- Dynamic Routing Gateway Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/DynamicRoutingGateway',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({dynamic_routing_gateways: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryExadataInfrastructures(request) {
        console.info('------------- Exadata Infrastructure Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let self = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/ExadataInfrastructure',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({exadata_infrastructures: response_json});
                for (let artefact of response_json) {
                    let sub_query_request = JSON.clone(request);
                    sub_query_request.exadata_infrastructure_id = artefact.id;
                    self.queryExadataInfrastructureSubComponents(sub_query_request);
                }
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                self.region_query_count[request.region]-- && self.isComplete();
            }
        });
    }
    queryExadataInfrastructureSubComponents(request) {
        // this.queryVmClusters(request);
        this.queryVmClusterNetworks(request);
    }

    queryFastConnects(request) {
        console.info('------------- Fast Connect Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/FastConnect',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({fast_connects: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryFileStorageSystems(request) {
        console.info('------------- queryFileStorageSystemAjax --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/FileStorageSystem',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({file_storage_systems: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryInstances(request) {
        console.info('------------- Instance Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        console.info('------------- Subnet      : ' + request.subnet_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/Instance',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({instances: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function (xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryInstancePools(request) {
        console.info('------------- Instance Pool Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        console.info('------------- Subnet      : ' + request.subnet_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/InstancePool',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({instance_pools: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function (xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryInternetGateways(request) {
        console.info('------------- Internet Gateway Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/InternetGateway',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({internet_gateways: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryIPSecConnections(request) {
        console.info('------------- Autonomous IPSec Connection Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/IPSecConnection',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({ipsec_connections: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryLoadBalancers(request) {
        console.info('------------- Load Balancer Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        console.info('------------- Subnet      : ' + request.subnet_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/LoadBalancer',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({load_balancers: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function (xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryLocalPeeringGateways(request) {
        console.info('------------- Local Peering Gateway Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/LocalPeeringGateway',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({local_peering_gateways: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryMySQLDatabaseSystems(request) {
        console.info('------------- Autonomous Database Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/MySQLDatabaseSystem',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({mysql_database_systems: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryNATGateways(request) {
        console.info('------------- NAT Gateway Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/NATGateway',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({nat_gateways: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryNetworkSecurityGroups(request) {
        console.info('------------- Network Security Group Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/NetworkSecurityGroup',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({network_security_groups: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryObjectStorageBuckets(request) {
        console.info('------------- Object Storage Bucket Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/ObjectStorageBucket',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({object_storage_buckets: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryOkeClusters(request) {
        console.info('------------- OKE Cluster Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/OkeCluster',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({oke_clusters: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryRemotePeeringConnections(request) {
        console.info('------------- Autonomous RemotePeering Connection Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/RemotePeeringConnection',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({remote_peering_connections: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryRouteTables(request) {
        console.info('------------- Route Table Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/RouteTable',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({route_tables: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    querySecurityLists(request) {
        console.info('------------- Security List Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/SecurityList',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({security_lists: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    queryServiceGateways(request) {
        console.info('------------- Service Gateway Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/ServiceGateway',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({service_gateways: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }

    querySubnets(request) {
        console.info('------------- Subnet Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/Subnet',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({subnets: response_json});
                for (let artefact of response_json) {
                    let sub_query_request = JSON.clone(request);
                    sub_query_request.subnet_id = artefact.id;
                    me.querySubnetSubComponents(sub_query_request);
                }
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function (xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }
    querySubnetSubComponents(request) {
        this.queryLoadBalancers(request);
    }

    queryVirtualCloudNetworks(request) {
        console.info('------------- Virtual Cloud Network Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        let me = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/VirtualCloudNetwork',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({virtual_cloud_networks: response_json});
                for (let artefact of response_json) {
                    let sub_query_request = JSON.clone(request);
                    sub_query_request.vcn_id = artefact.id;
                    me.queryVirtualCLoudNetworkSubComponents(sub_query_request);
                }
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                me.region_query_count[request.region]-- && me.isComplete();
            }
        });
    }
    queryVirtualCLoudNetworkSubComponents(request) {
        this.queryInternetGateways(request);
        this.queryNATGateways(request);
        this.queryNetworkSecurityGroups(request);
        this.queryServiceGateways(request);
        this.queryLocalPeeringGateways(request);
        this.queryRouteTables(request);
        this.querySecurityLists(request);
        this.querySubnets(request);
    }

    queryVmClusterNetworks(request) {
        console.info('------------- Vm Cluster Network Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let self = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/VmClusterNetwork',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({vm_cluster_networks: response_json});
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                self.region_query_count[request.region]-- && self.isComplete();
            }
        });
    }

    queryVmClusters(request) {
        console.info('------------- Vm Cluster Query --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        let self = this;
        this.region_query_count[request.region]++;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/VmCluster',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[request.region].load({vm_clusters: response_json});
                for (let artefact of response_json) {
                    let sub_query_request = JSON.clone(request);
                    sub_query_request.vm_cluster_id = artefact.id;
                    self.queryVmClusterSubComponents(sub_query_request);
                }
                if (request.refresh) {okitJsonView.draw();}
            },
            error: function(xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error  : ' + error);
            },
            complete: function () {
                self.region_query_count[request.region]-- && self.isComplete();
            }
        });
    }
    queryVmClusterSubComponents(request) {
        this.queryDbNodes(request);
        this.queryDbHomes(request);
    }

}

let okitOCIQuery = undefined;
