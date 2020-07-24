/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT OCI Query Javascript');

class OkitOCIQuery {
    constructor(model, view, regions = []) {
        this.model = model;
        this.view = view;
        this.regions = regions;
        this.queryCount = 0;
    }

    static newQuery(model, view) {
        return new OkitOCIQuery(model, view);
    }

    query(request = null) {
        if (request && request !== null) {
            this.queryRootCompartment(request);
        }
    }

    queryAutonomousDatabases() {}

    queryBlockStorageVolumes() {}

    queryRootCompartment(request, refresh) {
        console.info('------------- Root Compartment Query --------------------');
        let me = this;
        this.queryCount = 0;
        $.ajax({
            type: 'get',
            url: 'oci/artefacts/Compartment',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                response_json.compartment_id = null;
                regionOkitJson[request.region].load({compartments: [response_json]})
                console.info(me.getArtifactReference() + ' Query : ' + response_json.name);
                let sub_query_request = JSON.clone(request);
                sub_query_request.compartment_id = id;
                me.querySubComponents(sub_query_request, response_json.id);
                if (request.refresh) {me.view.draw();}
                this.queryCount--;
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
                $('#' + compartment_query_cb).prop('checked', true);
                this.queryCount--;
            }
        });
    }
    queryCompartments() {
        console.info('------------- Compartments Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        let me = this;
        queryCount++;
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
                    console.info(me.getArtifactReference() + 's Query : ' + artefact.display_name);
                    me.querySubComponents(request, region, artefact.id);
                }
                if (request.refresh) {me.view.draw();}
                queryCount--;
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
                $('#' + compartment_query_cb).prop('checked', true);
                queryCount--;
            }
        });
    }
    queryCompartmentSubComponents(request) {}

    queryDatabaseSystems() {}

    queryDynamicRoutingGateways() {}

    queryFastConnects() {}

    queryInstances() {}

    queryInternetGateways() {}

    queryLoadBalanacers() {}

    queryLocalPeeringGateways() {}

    queryNATGateways() {}

    queryNetworkSecurityGroups() {}

    queryObjectStorageBuckets() {}

    queryRouteTables() {}

    querySecurityLists() {}

    querySubnets() {}
    querySubnetSubComponents() {}

    queryVirtualCloudNetworks() {}
    queryVirtualCLoudNetworkSubComponents() {}

}

