/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT OCI Query Javascript');

class OkitOCIQuery {
    constructor(model, view, regions = {}) {
        this.model = model;
        this.view = view;
        this.regions = regions;
    }

    static newQuery(model, view) {
        return new OkitOCIQuery(model, view);
    }

    query(config = null) {
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
                response_json.parent_id = ROOT_CANVAS_ID;
                regionOkitJson[region].load({compartments: [response_json]});
                console.info(me.getArtifactReference() + ' Query : ' + response_json.name);
                me.querySubComponents(request, region, response_json.id);
                redrawSVGCanvas(region);
                $('#' + compartment_query_cb).prop('checked', true);
                this.queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.error('Status : ' + status);
                console.error('Error  : ' + error);
                $('#' + compartment_query_cb).prop('checked', true);
                this.queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }

    queryAutonomousDatabases() {}

    queryBlockStorageVolumes() {}

    queryCompartments() {}
    queryCompartmentSubComponents() {}

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

