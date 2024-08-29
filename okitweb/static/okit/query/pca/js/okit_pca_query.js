/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT OCI Query Javascript');

class OkitPCAQuery {
    constructor(regions=[], fast_discovery=false) {
        this.regions = Array.isArray(regions) ? regions : [regions];
        this.region_query_count = {};
        this.complete_callback = undefined;
        this.active_region = '';
    }

    query(request=null, complete_callback, region_complete_callback, error_callback) {
        this.complete_callback = complete_callback;
        this.region_complete_callback = region_complete_callback;
        this.error_callback = error_callback
        if (request) {
            console.info(`Regions ${this.regions} - ${typeof this.regions}`)
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
                this.queryAllResources(region_request);
            }
        }
    }

    queryAllResources(request) {
        console.info('------------- All Resources Query --------------------');
        const self = this;
        this.region_query_count[request.region] = 1;
        $.ajax({
            cache: false,
            type: 'get',
            url: 'pca/query',
            dataType: 'text',
            contentType: 'application/json',
            data: request
        }).done((resp) => {
            const response_json = JSON.parse(resp);
            const title = request.sub_compartments ? `Queried Compartment ${request.compartment_name} and Sub-Compartments` : `Queried Compartment ${request.compartment_name}`;
            const description = `${title} in Region ${request.region}`;
            console.info('PCA Query Response:', response_json)
            regionOkitJson[request.region].load(response_json)
            regionOkitJson[request.region].title = title;
            regionOkitJson[request.region].description = description;
            regionOkitJson[request.region].metadata.platform = 'pca'
        }).fail((xhr, status, error) => {
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
        }).always(() => {
            self.region_query_count[request.region]-- && self.isComplete();
        })
    }

    isComplete() {
        if (this.complete_callback) {
            console.info(`Region Query Count ${this.region_query_count}`)
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
}

let okitPCAQuery = undefined;
