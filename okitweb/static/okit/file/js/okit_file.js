/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT File Javascript');

class OkitFile {
    constructor(okitjson) {
        this.okitjson = okitjson ? okitjson : this.newOkitJson()
    }
    get model() {return this.okitjson.model}
    get views() {return this.okitjson.views}
    get metadata() {return this.okitjson.metadata}

    newOkitJson() {
        return {
            metadata: this.newMetaData(),
            model: this.newModel(),
            views: this.newViews()
        }
    }
    newMetaData() {
        const now = getCurrentDateTime()
        return {
            title: "OKIT OCI Visualiser Json",
            documentation: `# Description\n__Created ${getCurrentDateTime()}__\n\n--------------------------------------\n\n`,
            created: now,
            updated: now,
            okit_version: okitVersion,
            okit_schema_version: '0.2.0',
            file: {
                name: '',
                generate_terraform: false,
                terraform_dir: ''
            }
        }
    }
    newModel() {
        return {
            oci: this.newOciModel()
        }
    }
    newOciModel() {
        return {
            tags: {
                freeform: {},
                defined: {}
            },
            variables: [],
            region: {
                undefined: {
                    resources: {}
                }
            }
        }
    }
    newViews() {return []}

    getResources() {return Object.values(this.okitjson.model.oci.region.undefined.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])}
    getResource(id='') {return this.getResources().find((r) => r.id === id)}
}

class OkitModel {
}

class OkitView {
    constructor(okitjson, oci_data, resource_icons, parent_id) {
        this.okitjson = okitjson
        this.oci_data = oci_data
        this.resource_icons = resource_icons
        this.parent_id = parent_id
        if (!this.view) this.addThisView() 
    }
    get model() {return this.okitjson ? this.okitjson.model.oci : {}}
    get data() {return this.oci_data}
    get icons() {return this.resource_icons}
    get view() {return this.okitjson.views.find((v) => v.view === this.constructor.name)}

}
