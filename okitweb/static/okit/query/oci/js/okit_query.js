/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT OCI Query Javascript');

class OkitOCIQuery {
    constructor(okit_view, regions = [], region_model = {}) {
        this.okit_view = okit_view;
        this.regions = regions;
        this.region_model = region_model;
        this.region_query_count = {};
    }

    query(request = null) {
        if (request && request !== null) {
            for (const [i, region] of this.regions.entries()) {
                console.info(`${i} - Processing Selected Region : ${region}`);
                let region_request = JSON.clone(request);
                region_request.region = region;
                region_request.refresh = false;
                if (i === 0) {
                    region_request.refresh = true;
                    this.region_model[region] = this.okit_view.getOkitJson();
                } else {
                    this.region_model[region] = new OkitJson();
                }
                this.queryRootCompartment(region_request);
            }
        }
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
                //me.region_model[request.region].load({autonomous_databases: response_json});
                me.okit_view.loadAutonomousDatabases(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({block_storage_volumes: response_json});
                me.okit_view.loadBlockStorageVolumes(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
            }
        });
    }

    queryRootCompartment(request, refresh) {
        console.info('------------- Root Compartment Query --------------------');
        let me = this;
        this.region_query_count[request.region] = 0;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/Compartment',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                response_json.compartment_id = null;
                //me.region_model[request.region].load({compartments: [response_json]})
                me.okit_view.loadCompartments([response_json]);
                console.info(response_json.name);
                let sub_query_request = JSON.clone(request);
                sub_query_request.compartment_id = response_json.id;
                me.queryCompartmentSubComponents(sub_query_request);
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({compartments: response_json});
                me.okit_view.loadCompartments(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                    let sub_query_request = JSON.clone(request);
                    sub_query_request.compartment_id = artefact.id;
                    me.queryCompartmentSubComponents(sub_query_request);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
                me.region_query_count[request.region]--;
            }
        });
    }
    queryCompartmentSubComponents(request) {
        this.queryCompartments(request);
        this.queryVirtualCloudNetworks(request);
        this.queryBlockStorageVolumes(request);
        this.queryDynamicRoutingGateways(request);
        this.queryAutonomousDatabases(request);
        this.queryObjectStorageBuckets(request);
        this.queryFastConnects(request);
        this.queryInstances(request);
        this.queryDatabaseSystems(request);
        this.queryFileStorageSystems(request);
    }

    queryDatabaseSystems(request) {
        console.info('------------- Autonomous Database Query --------------------');
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
                //me.region_model[request.region].load({database_systems: response_json});
                me.okit_view.loadDatabaseSystems(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({dynamic_routing_gateways: response_json});
                me.okit_view.loadDynamicRoutingGateways(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
            }
        });
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
                //me.region_model[request.region].load({fast_connects: response_json});
                me.okit_view.loadFastConnects(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({file_storage_systems: response_json});
                me.okit_view.loadFileStorageSystems(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({instances: response_json});
                me.okit_view.loadInstances(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function (xhr, status, error) {
                console.warn('Status : ' + status);
                console.warn('Error : ' + error);
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({internet_gateways: response_json});
                me.okit_view.loadInternetGateways(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({load_balancers: response_json});
                me.okit_view.loadLoadBalancers(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function (xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({local_peering_gateways: response_json});
                me.okit_view.loadLocalPeeringGateways(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({nat_gateways: response_json});
                me.okit_view.loadNATGateways(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({network_security_groups: response_json});
                me.okit_view.loadNetworkSecurityGroups(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({object_storage_buckets: response_json});
                me.okit_view.loadObjectStorageBuckets(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({route_tables: response_json});
                me.okit_view.loadRouteTables(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({security_lists: response_json});
                me.okit_view.loadSecurityLists(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({service_gateways: response_json});
                me.okit_view.loadServiceGateways(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({subnets: response_json});
                me.okit_view.loadSubnets(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                    let sub_query_request = JSON.clone(request);
                    sub_query_request.subnet_id = artefact.id;
                    me.querySubnetSubComponents(sub_query_request);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function (xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                me.region_query_count[request.region]--;
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
                //me.region_model[request.region].load({virtual_cloud_networks: response_json});
                me.okit_view.loadVirtualCloudNetworks(response_json);
                for (let artefact of response_json) {
                    console.info(artefact.display_name);
                    let sub_query_request = JSON.clone(request);
                    sub_query_request.vcn_id = artefact.id;
                    me.queryVirtualCLoudNetworkSubComponents(sub_query_request);
                }
                if (request.refresh) {me.okit_view.draw();}
                me.region_query_count[request.region]--;
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error  : ' + error)
                me.region_query_count[request.region]--;
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

}

