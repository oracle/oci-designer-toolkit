console.info('Loaded OKIT Javascript');
/*
** Define OKIT Artifact Classes
 */
class OkitSvg {
    constructor(x=0, y=0, height=0, width=0) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }
}

class OkitJson {

    constructor(okit_json_string = '') {
        this.title = "OKIT OCI Visualiser Json";
        this.description = "OKIT Generic OCI Json which can be used to generate ansible, terraform, .......";
        this.compartments = [];
        this.autonomous_databases = [];
        this.block_storage_volumes = [];
        this.dynamic_routing_gateways = [];
        this.file_storage_systems = [];
        this.instances = [];
        this.internet_gateways = [];
        this.load_balancers = [];
        this.nat_gateways = [];
        this.object_storage_buckets = [];
        this.route_tables = [];
        this.security_lists = [];
        this.service_gateways = [];
        this.subnets = [];
        this.virtual_cloud_networks = [];

        if (okit_json_string !== undefined && okit_json_string.length > 0) {
            this.load(JSON.parse(okit_json_string));
        }
    }

    load(okit_json) {
        console.groupCollapsed('Load OKT Json');
        // Compartments
        if (okit_json.hasOwnProperty('compartments')) {
            for (let compartment of okit_json['compartments']) {
                let comp = this.newCompartment(compartment);
                console.info(comp);
            }
        }
        // Virtual Cloud Networks
        if (okit_json.hasOwnProperty('virtual_cloud_networks')) {
            for (let virtual_cloud_network of okit_json['virtual_cloud_networks']) {
                let vcn = this.newVirtualCloudNetwork(virtual_cloud_network);
                console.info(vcn);
            }
        }
        console.groupEnd();
    }

    draw() {
        console.groupCollapsed('Drawing SVG Canvas');
        // Initialise SVG Coordinates
        for (let key in this) {
            console.info('Processing ' + key);
            if (Array.isArray(this[key])) {
                for (let element of this[key]) {
                    element.svg = new OkitSvg();
                }
            }
        }
        // Display Json
        displayOkitJson();
        // Clear existing
        clearDiagram();
        // Draw Compartments
        for (let compartment of this.compartments) {
            compartment.draw();
        }
        console.groupEnd();
    }

    // Compartments
    newCompartment(data = {}) {
        this['compartments'].push(new Compartment(data));
        return this['compartments'][this['compartments'].length - 1];
    }

    deleteCompartment(id) {
        for (let i = 0; i < this.compartments.length; i++) {
            if (this.compartments[i].id === id) {
                // Remove Children
                // Virtual Cloud networks
                for (let j = this.virtual_cloud_networks.length; j >= 0; j--) {
                    if (this.virtual_cloud_networks[j].compartment_id === id) {
                        this.deleteVirtualCloudNetwork(this.virtual_cloud_networks[j].id);
                    }
                }
                // Remove Compartment
                this.compartments[i].delete();
                this.compartments.splice(i, 1);
                break;
            }
        }
    }

    // Virtual Cloud Networks
    newVirtualCloudNetwork(data) {
        this['virtual_cloud_networks'].push(new VirtualCloudNetwork(data));
        return this['virtual_cloud_networks'][this['virtual_cloud_networks'].length - 1];
    }

    deleteVirtualCloudNetwork(id) {
        for (let i = 0; i < this.virtual_cloud_networks.length; i++) {
            if (this.virtual_cloud_networks[i].id === id) {
                // Remove Children
                // Remove Internet Gateways
                // Remove NAT Gateways
                // Remove Service Gateways
                // Remove Subnets
                // Remove Route Tables
                // Remove Security Lists
                this.virtual_cloud_networks[i].delete();
                this.virtual_cloud_networks.splice(i, 1);
                break;
            }
        }
    }
}

$(document).ready(function() {
    let oj = new OkitJson(JSON.stringify({"compartments": [{id: 'okit-comp-' + uuidv4(), name: 'Wizards'}]}));
    console.info(oj);
    console.info(JSON.stringify(oj, null, 2));
});
