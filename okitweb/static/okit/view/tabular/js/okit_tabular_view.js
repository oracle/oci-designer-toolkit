/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Designer View Javascript');

class OkitTabularJsonView extends OkitJsonView {
    static resource_property_map = {
        common: {
            'Compartment': {property: 'compartment_id', lookup: 'compartments'},
            'Name': {property: 'display_name'}
        },
        compartments: {
            'Description': {property: 'description'}
        },
        autonomous_databases: {
            'Subnet': {property: 'subnet_id', lookup: 'subnets'},
            'DB Name': {property: 'db_name'},
            'Storage Size (Tbs)': {property: 'data_storage_size_in_tbs'},
            'CPU Count': {property: 'cpu_core_count'},
            'Workload': {property: 'db_workload'},
            'Auto Scaling': {property: 'is_auto_scaling_enabled'},
            'License Model': {property: 'license_model'},
            'Security Groups': {property: 'nsg_ids', lookup: 'network_security_groups'},
        },
        block_storage_volumes: {
            'Availability Domain': {property: 'availability_domain'},
            'Size in Gbs': {property: 'size_in_gbs'},
            'Backup Policy': {property: 'backup_policy'},
            'VPUS/Gb': {property: 'vpus_per_gb'},
        },
        customer_premise_equipments: {
            'IP Address': {property: 'ip_address'},
            'Customer Device': {property: 'cpe_device_shape_id', lookup: okitOciData.getCpeDeviceShape},
        },
        database_systems: {},
        dynamic_routing_gateways: {},
        fast_connects: {},
        file_storage_systems: {},
        instances: {
            'Subnet': {property: 'subnet_id', lookup: 'subnets'}
        },
        instance_pools: {},
        internet_gateways: {},
        ipsec_connections: {},
        load_balancers: {},
        local_peering_gateways: {},
        mysql_database_systems: {},
        nat_gateways: {},
        network_security_groups: {},
        object_storage_buckets: {},
        oke_clusters: {},
        remote_peering_connections: {},
        route_tables: {},
        security_lists: {},
        service_gateways: {},
        subnets: {
            'VCN': {property: 'vcn_id', lookup: 'virtual_cloud_networks'}
        },
        virtual_cloud_networks: {
            'CIDR Block': {property: 'cidr_block'},
            'DNS Label': {property: 'cidr_block'}
        }
    };

    constructor(okitjson=null, parent_id = 'tabular-div') {
        super(okitjson);
        this.parent_id = parent_id;
    }

    static newView(model, parent_id = 'tabular-div') {
        return new OkitTabularJsonView((model, parent_id))
    }

    draw(for_export=false) {
        this.newCanvas()
    }

    newCanvas(width=100, height=100, for_export=false) {
        let canvas_div = d3.select(d3Id(this.parent_id));
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // Add Tab Bar
        const tabbar = canvas_div.append('div')
            .attr('class', 'okit-tab-bar')
            .attr('id', 'tabular_view_tab_bar');
        // Add Tab Contents
        const tab_content = canvas_div.append('div')
            .attr('class', 'okit-tab-contents')
            .attr('id', 'tabular_view_tab_contents')
        // Loop through Model elements and create and create a tab for each
        Object.entries(this.okitjson).forEach(([key, value]) => {
            console.log(key + ' - ' + value) // key - value
            if (Array.isArray(value)) {
                this.addTab(tabbar, key)
            }
        })
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
            });
        $('#tabular_view_tab_bar button:first-child').trigger("click");
    }

    generateTabId(name) {
        return `${name}_tab`;
    }

    generateTabName(name) {
        return titleCase(name.replaceAll('_', ' '));
    }

    loadTabContent(resource_type) {
        // Merge Property Maps
        const property_map = {...OkitTabularJsonView.resource_property_map['common'], ...OkitTabularJsonView.resource_property_map[resource_type]}
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
        Object.entries(property_map).forEach(([key, value]) => {
            tr.append('div').attr('class', 'th').text(key);
        });
    }

    addTableBody(table, property_map, resource_type) {
        // Table Body
        const tbody = table.append('div').attr('class', 'tbody okit-tbody-alternating-colours');
        for (let resource of this.okitjson[resource_type]) {
            const tr = tbody.append('div').attr('class', 'tr');
            Object.entries(property_map).forEach(([key, value]) => {
                if (value.lookup) {
                    const lookup = this.okitjson.getResource(value.lookup, resource[value.property]);
                    if (lookup) {
                        tr.append('div').attr('class', 'td').text(lookup.display_name);
                    } else {
                        tr.append('div').attr('class', 'td').text('');
                    }
                } else {
                    tr.append('div').attr('class', 'td').text(resource[value.property]);
                }
            });
        }
    }

}

let okitTabularView = null;

$(document).ready(function() {
    okitTabularView = new OkitTabularJsonView();
});
