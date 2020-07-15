/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT View Javascript');

// TODO: Implement View Classes
class OkitJsonView {
    constructor(okitjson=null) {
        if (okitjson === null || okitjson === undefined) {
            this.okitjson = new OkitJson();
        } else if (typeof okitjson === 'string') {
            this.okitjson = JSON.parse(okitjson);
        } else if (okitjson instanceof Object) {
            this.okitjson = okitjson;
        } else {
            this.okitjson = new OkitJson();
        }
    }

    get small_grid_size() {return 8;}
    get grid_size() {return this.small_grid_size * 10;}
    get stroke_colours() {
        return {
            red: "#F80000",
            bark: "#312D2A",
            gray: "#5f5f5f",
            blue: "#0066cc",
            orange: "#ff6600",
            purple: "#400080",
            icon_colour_01: "#F80000",
            icon_colour_02: "#5f5f5f",
            icon_colour_03: "#ff6600",
        };
    }
    get svg_highlight_colour() {return "#00cc00";}

    load() {}

    draw() {}

    getOkitJson() {
        return this.okitjson;
    }

    /*
    ** Artefact Processing
     */

    // Autonomous Database
    newAutonomousDatabase() {
        return new AutonomousDatabaseView(this.okitjson.newAutonomousDatabase());
    }
    getAutonomousDatabase() {}
    deleteAutonomousDatabase() {}

    // Block Storage
    newBlockStorageVolume() {
        return new BlockStorageVolumeView(this.okitjson.newBlockStorageVolume());
    }
    getBlockStorageVolume() {}
    deleteBlockStorageVolume() {}

    // Compartment
    newCompartment() {
        return new CompartmentView(this.okitjson.newCompartment());
    }
    getCompartment() {}
    deleteCompartment() {}

    // Container
    newContainer() {}
    getContainer() {}
    deleteContainer() {}

    // Database System
    newDatabaseSystem() {
        return new DatabaseSystemView(this.okitjson.newDatabaseSystem());
    }
    getDatabaseSystem() {}
    deleteDatabaseSystem() {}

    // Dynamic Routing Gateway
    newDynamicRoutingGateway() {
        return new DynamicRoutingGatewayView(this.okitjson.newDynamicRoutingGateway());
    }
    getDynamicRoutingGateway() {}
    deleteDynamicRoutingGateway() {}

    // Fast Connect
    newFastConnect() {
        return new FastConnectView(this.okitjson.newFastConnect());
    }
    getFastConnect() {}
    deleteFastConnect() {}

    // File Storage System
    newFileStorageSystem() {
        return new FileStorageSystemView(this.okitjson.newFileStorageSystem());
    }
    getFileStorageSystem() {}
    deleteFileStorageSystem() {}

    // Instance
    newInstance() {
        return new InstanceView(this.okitjson.newInstance());
    }
    getInstance() {}
    deleteInstance() {}

    // Internet Gateway
    newInternetGateway() {
        return new InternetGatewayView(this.okitjson.newInternetGateway());
    }
    getInternetGateway() {}
    deleteInternetGateway() {}

    // Load Balancer
    newLoadBalancer() {
        return new LoadBalancerView(this.okitjson.newLoadBalancer());
    }
    getLoadBalancer() {}
    deleteLoadBalancer() {}

    // Local Peering Gateway
    newLocalPeeringGateway() {
        return new LocalPeeringGatewayView(this.okitjson.newLocalPeeringGateway());
    }
    getLocalPeeringGateway() {}
    deleteLocalPeeringGateway() {}

    // NAT Gateway
    newNATGateway() {
        return new NATGatewayView(this.okitjson.newNATGateway());
    }
    getNATGateway() {}
    deleteNATGateway() {}

    // Network Security Group
    newNetworkSecurityGroup() {
        return new NetworkSecurityGroupView(this.okitjson.newNetworkSecurityGroup());
    }
    getNetworkSecurityGroup() {}
    deleteNetworkSecurityGroup() {}

    // Object Storage Bucket
    newObjectStorageBucket() {
        return new ObjectStorageBucketView(this.okitjson.newObjectStorageBucket());
    }
    getObjectStorageBucket() {}
    deleteObjectStorageBucket() {}

    // Route Table
    newRouteTable() {
        return new RouteTableView(this.okitjson.newRouteTable());
    }
    getRouteTable() {}
    deleteRouteTable() {}

    // Security List
    newSecurityList() {
        return new SecurityListView(this.okitjson.newSecurityList());
    }
    getSecurityList() {}
    deleteSecurityList() {}

    // Service Gateway
    newServiceGateway() {
        return new ServiceGatewayView(this.okitjson.newServiceGateway());
    }
    getServiceGateway() {}
    deleteServiceGateway() {}

    // Subnet
    newSubnet() {
        return new SubnetView(this.okitjson.newSubnet());
    }
    getSubnet() {}
    deleteSubnet() {}

    // Virtual Cloud Network
    newVirtualCloudNetwork() {
        return new VirtualCloudNetworkView(this.okitjson.newVirtualCloudNetwork());
    }
    getVirtualCloudNetwork() {}
    deleteVirtualCloudNetwork() {}

    // Virtual Network Interface
    newVirtualNetworkInterface() {
        return new VirtualNetworkInterface(this.okitjson.newVirtualNetworkInterface());
    }
    getVirtualNetworkInterface() {}
    deleteVirtualNetworkInterface() {}

}

class OkitArtefactView {
    constructor(artefact=null, json_view) {
        this.artefact = artefact;
        this.json_view = json_view;
    }

    get icon_width() {return 45;}
    get icon_height() {return 45;}
    get icon_dimensions() {return {width: this.icon_width, height: this.icon_height};}
    get collapsed_dimensions() {return this.icon_dimensions;}
    get minimum_dimensions() {return this.icon_dimensions;}
    get dimensions() {return this.minimum_dimensions;}

    getParent() {return null;}

    getParentId() {return this.parent_id;}


    getJsonView() {
        return this.json_view;
    }

    getArtefact() {
        return this.artefact;
    }

    newSvgDefinition() {
        let definition = {};
        definition['artifact'] = this.getArtefact();
        definition['data_type'] = this.getArtefact().getArtifactReference();
        definition['name'] = {show: false, text: this.getArtefact()['display_name']};
        definition['label'] = {show: false, text: this.getArtefact().getArtifactReference()};
        definition['info'] = {show: false, text: this.getArtefact().getArtifactReference()};
        definition['svg'] = {x: 0, y: 0, width: this.icon_width, height: this.icon_height};
        definition['rect'] = {x: 0, y: 0,
            width: this.icon_width, height: this.icon_height,
            width_adjust: 0, height_adjust: 0,
            stroke: {colour: '#F80000', dash: 5},
            fill: 'white', style: 'fill-opacity: .25;'};
        definition['icon'] = {show: true, x_translation: 0, y_translation: 0};
        definition['title_keys'] = [];

        return definition
    }

    getSvgDefinition() {
        alert('Get Svg Definition function "getSvgDefinition()" has not been implemented.');
        return;
    }

    addGrid(canvas_svg) {
        canvas_svg.append('rect')
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "url(#grid)");
    }

    draw() {
        console.group('Drawing (Default) ' + this.getArtifactReference() + ' : ' + this.getArtefact().id + ' [' + this.getParentId() + ']');
        // Get Definition from Sub class
        let definition = this.getSvgDefinition();
        /*
        ** Draw Artefact based of returned definition.
         */
        let id             = definition['artifact']['id'];
        let parent_id      = definition['artifact']['parent_id'];
        let parent_svg_id  = parent_id + "-svg";
        let compartment_id = definition['artifact']['compartment_id'];
        let def_id         = definition['data_type'].replace(/ /g, '') + 'Svg';
        console.info('Creating ' + definition['data_type'] + ' ' + definition['artifact']['display_name'])
        console.info('Id             : ' + id )
        console.info('Parent Id      : ' + parent_id)
        console.info('Parent SVG Id  : ' + parent_svg_id);
        console.info('Compartment Id : ' + compartment_id);
        let rect_x         = definition['rect']['x'];
        let rect_y         = definition['rect']['y'];
        let rect_width     = definition['svg']['width']  + definition['rect']['width_adjust'];
        let rect_height    = definition['svg']['height'] + definition['rect']['height_adjust'];
        if (definition['icon']['y_translation'] < 0) {
            rect_y = Math.abs(definition['icon']['y_translation']);
            rect_height -= rect_y * 2;
        }
        if (definition['icon']['x_translation'] < 0) {
            rect_x = Math.abs(definition['icon']['x_translation']);
            rect_width -= rect_x * 2;
        }
        // Check for Artifact Display Name and if it does not exist set it to Artifact Name
        if (!definition['artifact'].hasOwnProperty('display_name')) {
            definition['artifact']['display_name'] = definition['artifact']['name'];
        }
        // Get Parent SVG
        let parent_svg = d3.select(d3Id(parent_svg_id));
        // Wrapper SVG Element to define ViewBox etc
        let svg = parent_svg.append("svg")
            .attr("id", id + '-svg')
            .attr("data-type", definition['data_type'])
            .attr("x",         definition['svg']['x'])
            .attr("y",         definition['svg']['y'])
            .attr("width",     definition['svg']['width'])
            .attr("height",    definition['svg']['height'])
            .attr("viewBox", "0 0 " + definition['svg']['width'] + " " + definition['svg']['height'])
            .attr("preserveAspectRatio", "xMinYMax meet");

        let rect = svg.append("rect")
            .attr("id", id)
            .attr("x",            rect_x)
            .attr("y",            rect_y)
            .attr("rx",           corner_radius)
            .attr("ry",           corner_radius)
            .attr("width",        rect_width)
            .attr("height",       rect_height)
            .attr("fill",         definition['rect']['fill'])
            .attr("style",        definition['rect']['style'])
            .attr("stroke",       definition['rect']['stroke']['colour'])
            .attr("stroke-width", definition['rect']['stroke']['width'])
            .attr("stroke-dasharray",
                definition['rect']['stroke']['dash'] + ", " + definition['rect']['stroke']['dash']);

        let text_align_x = rect_x;
        let text_anchor = "start"
        if (definition['name']['align']) {
            if (definition['name']['align'] === 'center') {
                text_align_x = (Math.round(definition['svg']['width']-20) / 2)
                text_anchor = "middle"
            }
            else if (definition['name']['align'] === 'right') {
                text_align_x = definition['svg']['width']-20
                text_anchor = "end"
            }
        }
        if (definition['name']['show']) {
            let name_svg = svg.append('svg')
                .attr("x", "10")
                .attr("y", "0")
                .attr("width", container_artifact_label_width)
                .attr("height", definition['svg']['height'])
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + container_artifact_label_width + " " + definition['svg']['height']);
            let name = name_svg.append("text")
                .attr("class", "svg-text")
                .attr("id", id + '-display-name')
                .attr("x", text_align_x)
                .attr("y", "55")
                .attr("text-anchor", text_anchor)
                .attr("vector-effects", "non-scaling-size")
                .text(definition['name']['text']);
        }
        if (definition['label']['show']) {
            let label_svg = svg.append('svg')
                .attr("x", "10")
                .attr("y", "0")
                .attr("width", container_artifact_label_width)
                .attr("height", definition['svg']['height'])
                .attr("preserveAspectRatio", "xMinYMax meet")
                .attr("viewBox", "0 0 " + container_artifact_label_width + " " + definition['svg']['height']);
            let name = label_svg.append("text")
                .attr("class", "svg-text")
                .attr("id", id + '-label')
                .attr("x", rect_x)
                .attr("y", definition['svg']['height'] - Math.max(10, (rect_y * 2) - 10))
                .attr("fill", definition['rect']['stroke']['colour'])
                .attr("vector-effects", "non-scaling-size")
                .text(definition['label']['text']);
        }
        if (definition['info']['show']) {
            let info_svg = svg.append('svg')
                .attr("x", Math.round(definition['svg']['width'] - container_artifact_info_width))
                .attr("y", "0")
                .attr("width", container_artifact_info_width)
                .attr("height", definition['svg']['height'])
                .attr("preserveAspectRatio", "xMinYMax meet")
                .attr("viewBox", "0 0 " + container_artifact_info_width + " " + definition['svg']['height']);
            let name = info_svg.append("text")
                .attr("class", "svg-text")
                .attr("id", id + '-info')
                .attr("x", 0)
                .attr("y", definition['svg']['height'] - Math.max(10, (rect_y * 2) - 10))
                .attr("fill", definition['rect']['stroke']['colour'])
                .attr("vector-effects", "non-scaling-size")
                .text(definition['info']['text']);
        }

        let svg_transform = ""
        if (definition['svg']['align']) {
            if (definition['svg']['align'] === 'center') {
                svg_transform = "translate(" + (definition['svg']['width']/2 - icon_width/2) + " , 0)"
            } else if (definition['svg']['align'] === 'right') {
                svg_transform = "translate(" + (definition['svg']['width'] - icon_width - icon_spacing) + " , 0)"
            }
        }

        svg.append('g')
            .append("use")
            .attr("xlink:href","#" + def_id)
            .attr("transform", svg_transform);

        svg.append("title")
            .attr("id", id + '-title')
            .text(definition['data_type'] + ": " + definition['artifact']['display_name']);

        // Set common attributes on svg element and children
        svg.on("contextmenu", handleContextMenu)
            .on("dragenter",  dragEnter)
            .on("dragover",   dragOver)
            .on("dragleave",  dragLeave)
            .on("drop",       dragDrop)
            .on("dragend",    dragEnd)
            .attr("data-type",           definition['data_type'])
            .attr("data-okit-id",        id)
            .attr("data-parent-id",      parent_id)
            .attr("data-compartment-id", compartment_id)
            .selectAll("*")
            .attr("data-type",           definition['data_type'])
            .attr("data-okit-id",        id)
            .attr("data-parent-id",      parent_id)
            .attr("data-compartment-id", compartment_id);
        /*
        ** Add Properties Load Event to created svg. We require the definition of the local variable "me" so that it can
        ** be used in the function dur to the fact that using "this" in the function will refer to the function not the
        ** Artifact.
         */
        let me = this;
        svg.on("click", function() {
            me.loadProperties();
            $('.highlight:not(' + jqId(me.id) +')').removeClass('highlight');
            $(jqId(me.id)).toggleClass('highlight');
            $(jqId(me.id)).hasClass('highlight') ? selectedArtefact = me.id : selectedArtefact = null;
            me.loadValueProposition();
            d3.event.stopPropagation();
        });
        console.groupEnd();
        return svg;
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/empty.html");
    }


    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/oci.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        alert('Get Artifact Reference function "getArtifactReference()" has not been implemented.');
        return;
    }

    static getDropTargets() {
        console.warn('Get Drop Targets not implements');
        return [];
    }

    static getConnectTargets() {
        console.warn('Get Connect Targets not implements');
        return [];
    }

    /*
    ** Instance Versions of Static Functions
     */

    getArtifactReference() {
        return this.constructor.getArtifactReference();
    }

    getDropTargets() {
        // Return list of Artifact names
        return this.constructor.getDropTargets();
    }

    getConnectTargets() {
        return this.constructor.getgetConnectTargets();
    }

}

let okitJsonView = null;
