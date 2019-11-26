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

class OkitSvgArtifact {
    /*
    ** Create
     */
    constructor (okitjson) {
        this.getOkitJson = function() {return okitjson};
    }


    /*
    ** Clone Functionality
     */
    clone() {
        alert('Clone function "clone()" has not been implemented.')
        return;
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        alert('Get Artifact Reference function "getArtifactReference()" has not been implemented.')
        return;
    }


    /*
    ** Delete Processing
     */
    delete() {
        console.groupCollapsed('Delete (Default) ' + this.getArtifactReference() + ' : ' + id);
        // Delete Child Artifacts
        this.deleteChildren();
        // Remove SVG Element
        d3.select("#" + this.id + "-svg").remove()
        console.groupEnd();
    }

    deleteChildren() {
        console.info('Default empty deleteChildren()');
    }


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing (Default) ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let svg = drawArtifact(this.getSvgDefinition());
        /*
        ** Add Properties Load Event to created svg. We require the definition of the local variable "me" so that it can
        ** be used in the function dur to the fact that using "this" in the function will refer to the function not the
        ** Artifact.
         */
        let me = this;
        svg.on("click", function() {
            me.loadProperties();
            d3.event.stopPropagation();
        });
        console.groupEnd();
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        alert('Get Svg Definition function "getSvgDefinition()" has not been implemented.')
        return;
    }

    // Return Artifact Dimentions
    getDimensions() {
        alert('Get Dimension function "getDimensions()" has not been implemented.')
        return;
    }

    getMinimumDimensions() {
        return {width: icon_width, height:icon_height};
    }

    newSVGDefinition(artifact, data_type) {
        let definition = {};
        definition['artifact'] = artifact;
        definition['data_type'] = data_type;
        definition['name'] = {show: false, text: artifact['display_name']};
        definition['label'] = {show: false, text: data_type};
        definition['info'] = {show: false, text: data_type};
        definition['svg'] = {x: 0, y: 0, width: icon_width, height: icon_height};
        definition['rect'] = {x: 0, y: 0,
            width: icon_width, height: icon_height,
            width_adjust: 0, height_adjust: 0,
            stroke: {colour: '#F80000', dash: 5},
            fill: 'white', style: 'fill-opacity: .25;'};
        definition['icon'] = {show: true, x_translation: 0, y_translation: 0};
        definition['title_keys'] = [];

        return definition
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        alert('Load Properties function "loadProperties()" has not been implemented.')
        return;
    }


    /*
    ** Child Offset Functions
     */
    getFirstChildOffset() {
        alert('Get First Child function "getFirstChildOffset()" has not been implemented.')
        return;
    }

    getFirstContainerChildOffset() {
        let offset = this.getFirstTopChildOffset();
        offset.dy += Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y);
        return offset;
    }

    getContainerChildOffset() {
        alert('Get First Container Child function "getContainerChildOffset()" has not been implemented.')
        return;
    }

    getFirstTopEdgeChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.padding.x * 2 + positional_adjustments.spacing.x * 2),
            dy: 0
        };
        return offset;
    }

    getTopEdgeChildOffset() {
        alert('Get First Top Edge Child function "getTopEdgeChildOffset()" has not been implemented.')
        return;
    }

    getBottomEdgeChildOffset() {
        alert('Get First Bottom Edge Child function "getBottomEdgeChildOffset()" has not been implemented.')
        return;
    }

    getLeftEdgeChildOffset() {
        alert('Get First Left Edge Child function "getLeftEdgeChildOffset()" has not been implemented.')
        return;
    }

    getRightEdgeChildOffset() {
        alert('Get First Right Edge Child function "getRightEdgeChildOffset()" has not been implemented.')
        return;
    }

    getFirstTopChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x),
            dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
        };
        return offset;
    }

    getTopChildOffset() {
        alert('Get First Top Child function "getTopEdgeChildOffset()" has not been implemented.')
        return;
    }

    getBottomChildOffset() {
        alert('Get First Bottom Child function "getBottomEdgeChildOffset()" has not been implemented.')
        return;
    }

    getLeftChildOffset() {
        alert('Get First Left Child function "getLeftEdgeChildOffset()" has not been implemented.')
        return;
    }

    getRightChildOffset() {
        alert('Get First Right Child function "getRightEdgeChildOffset()" has not been implemented.')
        return;
    }


    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        // Return list of Artifact names
        return [];
    }
}

class OkitContainerArtifact extends OkitSvgArtifact {
    /*
    ** Create
     */
    constructor(okitjson = {}) {
        super(okitjson);
    }

    artifactToElement(name) {
        return name.toLowerCase().split(' ').join('_') + 's';
    }

    getDimensions(id_key='') {
        console.groupCollapsed('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = {width: 0, height: 0};
        let offset = {dx: 0, dy: 0};
        // Process Top Edge Artifacts
        offset = this.getFirstTopEdgeChildOffset();
        let top_edge_dimensions = {width: offset.dx, height: offset.dy};
        for (let group of this.getTopEdgeArtifacts()) {
            console.info('Processing Top Edge Artifacts ' + group + ' - ' + this.artifactToElement(group));
            for (let artifact of this.getOkitJson()[this.artifactToElement(group)]) {
                if (artifact[id_key] === this.id) {
                    let artifact_dimension = artifact.getDimensions();
                    top_edge_dimensions.width += artifact_dimension.width + positional_adjustments.spacing.x;
                }
            }
        }
        dimensions.width  = Math.max(dimensions.width, top_edge_dimensions.width);
        dimensions.height = Math.max(dimensions.height, top_edge_dimensions.height);
        // Process Bottom Edge Artifacts
        offset = this.getFirstTopEdgeChildOffset();
        let bottom_edge_dimensions = {width: offset.dx, height: offset.dy};
        for (let group of this.getBottomEdgeArtifacts()) {
            for (let artifact of this.getOkitJson()[this.artifactToElement(group)]) {
                if (artifact[id_key] === this.id) {
                    let artifact_dimension = artifact.getDimensions();
                    bottom_edge_dimensions.width += artifact_dimension.width + positional_adjustments.spacing.x;
                }
            }
        }
        dimensions.width  = Math.max(dimensions.width, bottom_edge_dimensions.width);
        dimensions.height = Math.max(dimensions.height, bottom_edge_dimensions.height);
        // Process Top Artifacts
        offset = this.getFirstTopChildOffset();
        let top_dimensions = {width: offset.dx, height: offset.dy};
        for (let group of this.getTopArtifacts()) {
            for (let artifact of this.getOkitJson()[this.artifactToElement(group)]) {
                if (artifact[id_key] === this.id) {
                    let artifact_dimension = artifact.getDimensions();
                    top_dimensions.width += artifact_dimension.width + positional_adjustments.spacing.x;
                    top_dimensions.height = Math.max(top_dimensions.height, artifact_dimension.height + positional_adjustments.spacing.y);
                }
            }
        }
        dimensions.width   = Math.max(dimensions.width, top_dimensions.width);
        dimensions.height += top_dimensions.height;
        // Process Container Artifacts
        offset = this.getFirstContainerChildOffset();
        let container_dimensions = {width: offset.dx, height: offset.dy};
        for (let group of this.getContainerArtifacts()) {
            for (let artifact of this.getOkitJson()[this.artifactToElement(group)]) {
                if (artifact[id_key] === this.id) {
                    let artifact_dimension = artifact.getDimensions();
                    container_dimensions.width   = Math.max(container_dimensions.width, offset.dx + artifact_dimension.width + positional_adjustments.spacing.x);
                    container_dimensions.height += Math.round(artifact_dimension.height + positional_adjustments.spacing.y);
                }
            }
        }
        dimensions.width   = Math.max(dimensions.width, container_dimensions.width);
        dimensions.height += container_dimensions.height;
        // Process Bottom Artifacts
        // Process Left Edge Artifacts
        // Process Right Edge Artifacts
        // Process Left Artifacts
        // Process Right Artifacts
        // Check size against minimum
        dimensions['width']  = Math.max(dimensions['width'],  this.getMinimumDimensions().width);
        dimensions['height'] = Math.max(dimensions['height'], this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.groupEnd();
        return dimensions;
    }


    /*
    ** Child Offset Functions
     */
    getChildOffset(child_type) {
        console.groupCollapsed('Getting Offset for ' + child_type);
        let offset = {dx: 0, dy: 0};
        if (this.getTopEdgeArtifacts().includes(child_type)) {
            offset = this.getTopEdgeChildOffset();
        } else if (this.getTopArtifacts().includes(child_type)) {
            offset = this.getTopChildOffset();
        } else if (this.getContainerArtifacts().includes(child_type)) {
            offset = this.getContainerChildOffset();
        }
        console.groupEnd();
        return offset
    }

    getContainerChildOffset() {
        let offset = this.getFirstContainerChildOffset();
        // Count how many top edge children and adjust.
        for (let child of this.getContainerArtifacts()) {
            //count += $('#' + this.id + '-svg').children("svg[data-type='" + child + "']").length;
            $('#' + this.id + '-svg').children('svg[data-type="' + child + '"]').each(
                function() {
                    console.info('Width  : ' + $(this).attr('width'));
                    console.info('Height : ' + $(this).attr('height'));
                    offset.dy += Math.round(Number($(this).attr('height')) + positional_adjustments.spacing.y);
                });
        }
        console.info('Offset : ' + JSON.stringify(offset));
        return offset;
    }

    getTopEdgeChildOffset() {
        let offset = this.getFirstTopEdgeChildOffset();
        // Count how many top edge children and adjust.
        let count = 0;
        for (let child of this.getTopEdgeArtifacts()) {
            count += $('#' + this.id + '-svg').children("svg[data-type='" + child + "']").length;
        }
        console.info('Top Edge Count : ' + count);
        // Increment x position based on count
        offset.dx += Math.round((icon_width * count) + (positional_adjustments.spacing.x * count));
        return offset;
    }

    getBottomEdgeChildOffset() {}

    getLeftEdgeChildOffset() {}

    getRightEdgeChildOffset() {}

    getTopChildOffset() {
        let offset = this.getFirstTopChildOffset();
        for (let child of this.getTopArtifacts()) {
            $('#' + this.id + '-svg').children("svg[data-type='" + child + "']").each(
                function() {
                    offset.dx += Math.round(icon_width + positional_adjustments.spacing.x);
                });
        }
        return offset;
    }

    getBottomChildOffset() {}

    getLeftChildOffset() {}

    getRightChildOffset() {}


    /*
    ** Child Type Functions
     */
    getTopEdgeArtifacts() {
        return [];
    }

    getBottomEdgeArtifacts() {
        return [];
    }

    getTopArtifacts() {
        return [];
    }

    getContainerArtifacts() {
        return [];
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
        this.web_application_firewalls = [];

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
        /*
        for (let key in this) {
            console.info('Processing ' + key);
            if (Array.isArray(this[key])) {
                for (let element of this[key]) {
                    element.svg = new OkitSvg();
                }
            }
        }
        */
        // Display Json
        displayOkitJson();
        // Clear existing
        clearDiagram();

        // Draw Compartments
        for (let compartment of this.compartments) {
            compartment.draw();
        }

        // Draw Compartment Sub Components
        // Virtual Cloud Networks
        for (let virtual_cloud_network of this.virtual_cloud_networks) {
            virtual_cloud_network.draw();
        }
        // Block Storage Volumes
        for (let block_storage_volume of this.block_storage_volumes) {
            block_storage_volume.draw();
        }
        // Object Storage Buckets
        for (let object_storage_bucket of this.object_storage_buckets) {
            object_storage_bucket.draw();
        }
        // Autonomous Databases
        for (let autonomous_database of this.autonomous_databases) {
            autonomous_database.draw();
        }

        // Draw Virtual Cloud Network Sub Components
        // Internet Gateways
        for (let internet_gateway of this.internet_gateways) {
            internet_gateway.draw();
        }
        // NAT Gateways
        for (let nat_gateway of this.nat_gateways) {
            nat_gateway.draw();
        }
        // Service Gateways
        for (let service_gateway of this.service_gateways) {
            service_gateway.draw();
        }
        // Dynamic Routing Gateways
        for (let dynamic_routing_gateway of this.dynamic_routing_gateways) {
            dynamic_routing_gateway.draw();
        }
        // Route Tables
        for (let route_table of this.route_tables) {
            route_table.draw();
        }
        // Security Lists
        for (let security_list of this.security_lists) {
            security_list.draw();
        }
        // Subnets
        for (let subnet of this.subnets) {
            subnet.draw();
        }

        // Draw Subnet Sub Components
        // File Storage System
        for (let file_storage_system of this.file_storage_systems) {
            file_storage_system.draw();
        }
        // Instances
        for (let instance of this.instances) {
            instance.draw();
        }
        // Load Balancers
        for (let load_balancer of this.load_balancers) {
            load_balancer.draw();
        }

        console.groupEnd();
    }

    test() {
        console.info('Test Call.........')
    }

    // Compartment
    newCompartment(data = {}, parent=null) {
        this['compartments'].push(new Compartment(data, this, parent));
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

    // Virtual Cloud Network
    newVirtualCloudNetwork(data, parent=null) {
        console.info('New Virtual Cloud Network');
        this['virtual_cloud_networks'].push(new VirtualCloudNetwork(data, this, parent));
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

    // Subnet
    newSubnet(data, parent=null) {
        console.info('New Subnet');
        this['subnets'].push(new Subnet(data, this, parent));
        return this['subnets'][this['subnets'].length - 1];
    }

    // Internet Gateway
    newInternetGateway(data, parent=null) {
        console.info('New Internet Gateway');
        this['internet_gateways'].push(new InternetGateway(data, this, parent));
        return this['internet_gateways'][this['internet_gateways'].length - 1];
    }

    // NAT Gateway
    newNATGateway(data, parent=null) {
        console.info('New NAT Gateway');
        this['nat_gateways'].push(new NATGateway(data, this, parent));
        return this['nat_gateways'][this['nat_gateways'].length - 1];
    }

    // Route Table
    newRouteTable(data, parent=null) {
        console.info('New Route Table');
        this.route_tables.push(new RouteTable(data, this, parent));
        return this.route_tables[this.route_tables.length - 1];
    }

    // Security List
    newSecurityList(data, parent=null) {
        console.info('New Security List');
        this.security_lists.push(new SecurityList(data, this, parent));
        return this.security_lists[this.security_lists.length - 1];
    }

    // Load Balancer
    newLoadBalancer(data, parent=null) {
        console.info('New Load Balancer');
        this.load_balancers.push(new LoadBalancer(data, this, parent));
        return this.load_balancers[this.load_balancers.length - 1];
    }

    // Instance
    newInstance(data, parent=null) {
        console.info('New Instance');
        this.instances.push(new Instance(data, this, parent));
        return this.instances[this.instances.length - 1];
    }
}

$(document).ready(function() {
    /*
    let oj = new OkitJson(JSON.stringify({"compartments": [{id: 'okit-comp-' + uuidv4(), name: 'Wizards'}]}));
    console.info(oj);
    console.info(JSON.stringify(oj, null, 2));
    for (let compartment of oj.compartments) {
        console.info('getOkitJson : ' + compartment.getOkitJson());
        console.info('getOkitJson String : ' + JSON.stringify(compartment.getOkitJson()));
        compartment.getOkitJson().test();
        compartment.getOkitJson()['instances'] = [{id: 'okit-instance'}];
    }
    console.info(oj);
    console.info(JSON.stringify(oj, null, 2));
    */
});
