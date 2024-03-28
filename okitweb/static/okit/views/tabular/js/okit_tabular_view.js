/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Tabular View Javascript');

class OkitTabularJsonView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'tabular-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
        this.oci_data = oci_data;
        this.parent_id = parent_id;
        this.loadPropertyMap();
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'tabular-div') {
        return new OkitTabularJsonView(model, oci_data, resource_icons, parent_id)
    }

    loadPropertyMap() {
        this.resource_property_map = {
            common: {
                'Name': {property: 'display_name'},
                'Compartment': {property: 'compartment_id', lookup: 'model.getCompartment'}
            },
            tags: {
                'Defined Tags': {property: 'defined_tags'},
                'Freeform Tags': {property: 'freeform_tags'}
            },
            compartments: {
                'Description': {property: 'description'}
            },
            autonomous_databases: {
                'Subnet': {property: 'subnet_id', lookup: 'model.getSubnet'},
                'DB Name': {property: 'db_name'},
                'Storage Size (Tbs)': {property: 'data_storage_size_in_tbs'},
                'CPU Count': {property: 'cpu_core_count'},
                'Workload': {property: 'db_workload'},
                'Auto Scaling': {property: 'is_auto_scaling_enabled'},
                'License Model': {property: 'license_model'},
                'Security Groups': {property: 'nsg_ids', lookup: 'model.getNetworkSecurityGroup'},
            },
            block_storage_volumes: {
                'Availability Domain': {property: 'availability_domain'},
                'Size in Gbs ({total} Gbs)': {property: 'size_in_gbs', type: 'number', sum: true},
                'Backup Policy': {property: 'backup_policy'},
                'VPUS/Gb': {property: 'vpus_per_gb'},
                'Attached Instances': {property: 'id', lookup: 'model.getInstanceByBlockVolumeId'},
            },
            customer_premise_equipments: {
                'IP Address': {property: 'ip_address'},
                'Customer Device': {property: 'cpe_device_shape_id', lookup: 'data.getCpeDeviceShape'},
            },
            database_systems: {
                'Availability Domain': {property: 'availability_domain'},
                'Database Edition': {property: 'database_edition'},
                'DB Name': {property: 'db_home.database.db_name'},
                'Workload': {property: 'db_home.database.db_workload'},
                'Version': {property: 'db_home.db_version'},
                'Hostname': {property: 'hostname'},
                'Cluster': {property: 'cluster_name'},
                'Shape': {property: 'shape'},
                'Subnet': {property: 'subnet_id', lookup: 'model.getSubnet'},
                'License Model': {property: 'license_model'},
                'Security Groups': {property: 'nsg_ids', lookup: 'model.getNetworkSecurityGroup'},
            },
            dynamic_routing_gateways: {
                'Virtual Cloud Network': {property: 'vcn_id', lookup: 'model.getVirtualCloudNetwork'},
            },
            fast_connects: {},
            file_storage_systems: {
                'Availability Domain': {property: 'availability_domain'},
            },
            groups: {
                'User Count': {property: 'user_count'},
                'Users': {property: 'user_ids', lookup: 'model.getUser'},
            },
            instances: {
                'Shape': {property: 'shape'},
                'Memory ({total} Gbs)': {property: 'memory_in_gbs', type: 'number', sum: true},
                '{total} OCPUs': {property: 'ocpus', type: 'number', sum: true},
                'Subnet': {property: 'subnet_id', lookup: 'model.getSubnet'},
                'Public IP': {property: 'public_ip'},
                'Block Volumes': {property: 'block_storage_volume_ids', lookup: 'model.getBlockStorageVolume'},
                'Status': {property: 'lifecycle_state'},
                'Fault Domain': {property: 'fault_domain'},
                // 'Assign Public IP': {property: 'assign_public_ip'}
            },
            instance_pools: {},
            internet_gateways: {
                'Virtual Cloud Network': {property: 'vcn_id', lookup: 'model.getVirtualCloudNetwork'},
                'Enable': {property: 'enabled'},
            },
            ipsec_connections: {
                'Customer Premise Equipment': {property: 'cpe_id', lookup: 'model.getCustomerPremiseEquipment'},
                'Dynamic Routing Gateway': {property: 'drg_id', lookup: 'model.getDynamicRoutingGateway'},
            },
            load_balancers: {
                'Private': {property: 'is_private'},
                'Shape': {property: 'shape'},
                'Protocol': {property: 'protocol'},
                'Port': {property: 'port'},
                'Policy': {property: 'backend_policy'},
                'Backends': {property: 'instance_ids', lookup: 'model.getInstance'},
            },
            local_peering_gateways: {
                'Virtual Cloud Network': {property: 'vcn_id', lookup: 'model.getVirtualCloudNetwork'},
                'Route Table': {property: 'route_table_id', lookup: 'model.getRouteTable'},
                'Peer': {property: 'peer_id', lookup: 'model.getLocalPeeringGateway'},
            },
            mysql_database_systems: {
                'Availability Domain': {property: 'availability_domain'},
                'Hostname': {property: 'hostname_label'},
                'Version': {property: 'mysql_version'},
                'Configuration': {property: 'configuration_id', lookup: 'data.getMySQLConfiguration'},
                'Shape': {property: 'shape_name'},
                'Port': {property: 'port'},
                'Port X': {property: 'port_x'},
                'Subnet': {property: 'subnet_id', lookup: 'model.getSubnet'},
                'Description': {property: 'description'},
            },
            nat_gateways: {
                'Virtual Cloud Network': {property: 'vcn_id', lookup: 'model.getVirtualCloudNetwork'},
                'Block Traffic': {property: 'block_traffic'},
            },
            network_security_groups: {
                'Virtual Cloud Network': {property: 'vcn_id', lookup: 'model.getVirtualCloudNetwork'},
            },
            object_storage_buckets: {
                'Namespace': {property: 'namespace'},
                'Storage Tier': {property: 'storage_tier'},
                'Public Access': {property: 'public_access_type'},
            },
            oke_clusters: {
                'Virtual Cloud Network': {property: 'vcn_id', lookup: 'model.getVirtualCloudNetwork'},
                'Dashboard': {property: 'options.add_ons.is_kubernetes_dashboard_enabled'},
                'Tiller': {property: 'options.add_ons.is_tiller_enabled'},
                'Security': {property: 'options.admission_controller_options.is_pod_security_policy_enabled'},
                'Pod CIDR': {property: 'options.kubernetes_network_config.pods_cidr'},
                'Service CIDR': {property: 'options.kubernetes_network_config.services_cidr'},
            },
            remote_peering_connections: {
                'Dynamic Routing Gateway': {property: 'drg_id', lookup: 'model.getDynamicRoutingGateway'},
                'Peer': {property: 'peer_id', lookup: 'model.getRemotePeeringConnection'},
                'Peer Region': {property: 'peer_region_name'},
            },
            route_tables: {
                'Virtual Cloud Network': {property: 'vcn_id', lookup: 'model.getVirtualCloudNetwork'},
            },
            security_lists: {
                'Virtual Cloud Network': {property: 'vcn_id', lookup: 'model.getVirtualCloudNetwork'},
            },
            service_gateways: {
                'Virtual Cloud Network': {property: 'vcn_id', lookup: 'model.getVirtualCloudNetwork'},
                'Route Table': {property: 'route_table_id', lookup: 'model.getRouteTable'},
            },
            subnets: {
                'Availability Domain': {property: 'availability_domain'},
                'Virtual Cloud Network': {property: 'vcn_id', lookup: 'model.getVirtualCloudNetwork'},
                'CIDR Block': {property: 'cidr_block'},
                'DNS Label': {property: 'dns_label'},
                'Private': {property: 'prohibit_public_ip_on_vnic'},
                'Route Table': {property: 'route_table_id', lookup: 'model.getRouteTable'},
                'Security Lists': {property: 'security_list_ids', lookup: 'model.getSecurityList'},
            },
            virtual_cloud_networks: {
                'CIDR Block': {property: 'cidr_block'},
                'DNS Label': {property: 'dns_label'},
            }
        };
    }

    property_map = (resource_type) => {return {...this.resource_property_map['common'], ...this.resource_property_map[resource_type], ...this.resource_property_map['tags']}}

    draw(for_export=false) {
        this.newCanvas()
    }

    newCanvas(width=100, height=100, for_export=false) {
        let canvas_div = d3.select(d3Id(this.parent_id));
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // Toolbar
        const toolbar = canvas_div.append('div')
            .attr('class', 'okit-toolbar')
            .attr('id', 'tabular_view_toolbar')
        const export_excel = toolbar.append('div')
            .attr('class', 'excel okit-toolbar-button')
            .attr('title', 'Export to Excel')
            .on('click', () => {
                const wb = new TabularWorkbook(this.model, this.data, this.resource_property_map)
                const uri = 'data:Application/octet-stream,' + encodeURIComponent(wb.exportToXls())
                const name = 'okit.xls'
                triggerDownload(uri, name)
            })
        // Add Tab Bar
        const tabbar = canvas_div.append('div')
            .attr('class', 'okit-tab-bar')
            .attr('id', 'tabular_view_tab_bar');
        // Add Tab Contents
        const tab_content = canvas_div.append('div')
            .attr('class', 'tabular-tab-contents')
            .attr('id', 'tabular_view_tab_contents')
        // Loop through Model elements and create and create a tab for each
        Object.entries(this.getOkitJson().getResourceLists()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([key, value]) => {if (value.length) this.addTab(tabbar, key);})
    }

    addTab(tabbar, resource_type) {
        const self = this;
        tabbar.append('button')
            .attr('class', 'okit-tab')
            .attr('id', this.generateTabId(resource_type))
            .attr('type', 'button')
            .text(this.generateTabName(resource_type))
            .on('click', function () {
                $('#tabular_view_tab_bar > button').removeClass("okit-tab-active");
                $(jqId(self.generateTabId(resource_type))).addClass("okit-tab-active");
                self.loadTabContent(resource_type);
                slideRightPanel()                
            });
        $('#tabular_view_tab_bar button:first-child').trigger("click");
    }

    generateTabId(name) {
        return `${name}_tab`;
    }

    generateTabName(name) {
        console.info(`Generating Tab name from ${name}`)
        return titleCase(name.replaceAll('_', ' '));
    }

    loadTabContent(resource_type) {
        // Merge Property Maps
        // const property_map = {...this.resource_property_map['common'], ...this.resource_property_map[resource_type], ...this.resource_property_map['tags']}
        const property_map = this.property_map(resource_type)
        const contents_div = d3.select(d3Id('tabular_view_tab_contents'));
        // Empty existing Canvas
        contents_div.selectAll('*').remove();
        // Build Table
        const table = contents_div.append('div').attr('class', 'table okit-table');
        // Add Header
        this.addTableHeader(table, property_map, resource_type);
        // Add Body
        this.addTableBody(table, property_map, resource_type);
    }

    addTableHeader(table, property_map, resource_type) {
        // Table Header
        const thead = table.append('div').attr('class', 'thead');
        const tr = thead.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'th').text(this.okitjson[resource_type].length);
        Object.entries(property_map).forEach(([key, value]) => {
            if (value.sum) {
                tr.append('div').attr('class', 'th').text(key.replace('{total}', this.getColumnTotal(resource_type, value.property)));
            } else {
                tr.append('div').attr('class', 'th').text(key);
            }
        });
    }

    getColumnTotal(resource_type, property) {
        return this.okitjson[resource_type].reduce((accumulator, resource) => accumulator + resource[property], 0)
    }

    addTableBody(table, property_map, resource_type) {
        const self = this;
        // Table Body
        const tbody = table.append('div').attr('class', 'tbody okit-tbody-alternating-colours');
        let first = true;
        let cnt = 1;
        for (let resource of this.okitjson[resource_type]) {
            // Compartment View Object
            const view_resource = this.getViewResource(resource.getArtifactReference(), resource.id);
            const tr = tbody.append('div').attr('class', 'tr okit-tr-first-column-count').on('click', function() {
                // view_resource.loadSlidePanels()
                // Highlight selected row
                $('#tabular_view_tab_contents .tabular-row-selected').removeClass('tabular-row-selected')
                $(this).addClass('tabular-row-selected')
            });
            self.addContextMenu(tr, resource_type, view_resource);
            // if (first) {first = false; view_resource.loadSlidePanels();}
            tr.append('div').attr('class', 'td').text(cnt);
            cnt += 1;
            Object.entries(property_map).forEach(([key, value]) => {
                let cell_data = '';
                if (value.lookup) {
                    if (Array.isArray(resource[value.property])) {
                        const array_data = resource[value.property].map(id => self.lookupResource(value.lookup, id).display_name);
                        cell_data = array_data.join(', ');
                    } else {
                        const lookup = self.lookupResource(value.lookup, resource[value.property]);
                        if (lookup && Array.isArray(lookup)) {
                            cell_data = lookup.map(l => l.display_name).join(', ');
                        } else if (lookup) {
                            cell_data = lookup.display_name;
                        } else {
                            cell_data = '';
                        }
                    }
                } else {
                    cell_data = this.getValue(resource, value.property);
                }
                tr.append('div').attr('class', 'td').append('pre').text(cell_data);
            });
        }
    }

    addContextMenu(tr, resource_type, resource) {
        const self = this;
        tr.on("contextmenu", function () {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            const canvas_position = $(jqId("canvas-div")).offset();
            const position = {top: d3.event.pageY - canvas_position.top, left: d3.event.pageX - 5};
            $(jqId("context-menu")).empty();
            $(jqId("context-menu")).css(position);
            const contextmenu = d3.select(d3Id("context-menu"));
            contextmenu.on('mouseenter', function () {
                $(jqId("context-menu")).removeClass("hidden");
            })
                .on('mouseleave', function () {
                    $(jqId("context-menu")).addClass("hidden");
                });

            contextmenu.append('label')
                .attr('class', 'okit-context-menu-title')
                .text(resource.display_name)
            const ul = contextmenu.append('ul')
                .attr('class', 'okit-context-menu-list');
            // Move Up
            ul.append('li').append('a')
                .attr('class', 'parent-item')
                .attr('href', 'javascript:void(0)')
                .text('Move Up')
                .on('click', function () {
                    self.move(resource_type, resource, -1);
                    $(jqId("context-menu")).addClass("hidden");
                });
            // Move Down
            ul.append('li').append('a')
                .attr('class', 'parent-item')
                .attr('href', 'javascript:void(0)')
                .text('Move Down')
                .on('click', function () {
                    self.move(resource_type, resource, 1);
                    $(jqId("context-menu")).addClass("hidden");
                });
            // Delete
            ul.append('li').append('a')
                .attr('class', 'parent-item')
                .attr('href', 'javascript:void(0)')
                .text('Delete')
                .on('click', function () {
                    resource.delete();
                    self.loadTabContent(resource_type);
                    $(jqId("context-menu")).addClass("hidden");
                });
            // Show
            $(jqId("context-menu")).removeClass("hidden");
        });
    }

    move(resource_type, resource, direction) {
        const resource_list = this.okitjson[resource_type];
        const idx = resource_list.findIndex(r => r.id === resource.id);
        if ((idx > 0 && direction === -1) || (idx < resource_list.length -1 && direction === 1)) {
            const res = resource_list[idx];
            resource_list[idx] = resource_list[idx + direction];
            resource_list[idx + direction] = res;
        }
        this.loadTabContent(resource_type);
    }

    lookupResource(lookup, id) {
        const sections = lookup.split('.');
        const obj = sections[0];
        const getFunction = sections[1];
        const resource = this[obj][getFunction](id);
        console.info('Resoource Lookup', obj, getFunction, resource)
        return resource ? resource : {display_name: 'Unknown'}
    }

    getViewResource(type, id) {
        // const getFunction = `get${type.split(' ').join('')}`;
        const getFunction = this.getFunction(type);
        return okitJsonView[getFunction](id);
    }

    getValue(resource, key) {
        const keys = key.split('.');
        if (keys.length > 1) {
            return this.getValue(resource[keys[0]], keys.slice(1).join('.'));
        } else {
            // return typeof resource[key] === 'object' ? JSON.stringify(resource[key]) : resource[key];
            return typeof resource[key] === 'object' ? JSON.stringify(resource[key], null, 4) : resource[key];
        }
    }

}

okitViewClasses.push(OkitTabularJsonView);

let okitTabularView = null;

class TabularWorkbook extends OkitWorkbook {
    constructor(model={}, data={}, elements={}) {
        super()
        Object.defineProperty(this, 'model', {get: () => {return model}})
        Object.defineProperty(this, 'data', {get: () => {return data}})
        Object.defineProperty(this, 'elements', {get: () => {return elements}})
        this.build()
    }

    build(model, elements) {
        model = model || this.model || {}
        elements = elements || this.elements || {}
        Object.entries(model.getResourceLists()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([key, value]) => {if (value.length) this.worksheets.push(new TabularWorksheet(this.generateSheetName(key), value, {...elements['common'], ...elements[key], ...elements['tags']}, this));})
    }

    generateSheetName(name) {return titleCase(name.replaceAll('_', ' '))}

    lookupResource(lookup, id) {
        const sections = lookup.split('.');
        const obj = sections[0];
        const getFunction = sections[1];
        const resource = this[obj][getFunction](id);
        return resource ? resource : {display_name: 'Unknown'}
    }
}

class TabularWorksheet extends OkitWorksheet {
    constructor(name, resources, elements, workbook) {
        super(name)
        Object.defineProperty(this, 'workbook', {get: () => {return workbook}})
        Object.defineProperty(this, 'resources', {get: () => {return resources}})
        Object.defineProperty(this, 'elements', {get: () => {return elements}})
        this.build()
    }

    build(name, resources, elements, workbook) {
        name = name || this.name
        resources = resources || this.resources || []
        elements = elements || this.elements || {}
        workbook = workbook || this.workbook
        this.header = new OkitWorksheetRow()
        Object.keys(elements).forEach(k => this.header.cells.push(new TabularWorksheetCell(k)))
        resources.forEach(r => this.rows.push(new TabularWorksheetRow(r, elements, workbook)))
    }
}

class TabularWorksheetRow extends OkitWorksheetRow {
    constructor(resource, elements, workbook) {
        super()
        Object.defineProperty(this, 'workbook', {get: () => {return workbook}})
        Object.defineProperty(this, 'resource', {get: () => {return resource}})
        Object.defineProperty(this, 'elements', {get: () => {return elements}})
        this.build()
    }
    build(resource, elements, workbook) {
        resource = resource || this.resource || {}
        elements = elements || this.elements || {}
        workbook = workbook || this.workbook
        Object.values(elements).forEach(v => this.cells.push(new TabularWorksheetCell(this.getCellData(resource, v, workbook), v.type)))
    }

    getCellData(resource, value, workbook) {
        let cell_data = '';
        if (value.lookup) {
            if (Array.isArray(resource[value.property])) {
                const array_data = resource[value.property].map(id => workbook.lookupResource(value.lookup, id).display_name);
                cell_data = array_data.join(', ');
            } else {
                const lookup = workbook.lookupResource(value.lookup, resource[value.property]);
                if (lookup && Array.isArray(lookup)) {
                    cell_data = lookup.map(l => l.display_name).join(', ');
                } else if (lookup) {
                    cell_data = lookup.display_name;
                } else {
                    cell_data = '';
                }
            }
        } else {
            cell_data = this.getValue(resource, value.property);
        }
        return cell_data
    }

    getValue(resource, key) {
        const keys = key.split('.');
        if (keys.length > 1) {
            return this.getValue(resource[keys[0]], keys.slice(1).join('.'));
        } else {
            return typeof resource[key] === 'object' ? JSON.stringify(resource[key]) : resource[key];
        }
    }
}

class TabularWorksheetCell extends OkitWorksheetCell {
    constructor(data, type=undefined) {
        super(data, type)
    }
}
