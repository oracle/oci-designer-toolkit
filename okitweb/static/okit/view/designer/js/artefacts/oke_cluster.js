/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer OKE View Javascript');

/*
** Define Compartment View Artifact Class
 */
class OkeClusterView extends OkitDesignerArtefactView {
    constructor(artefact = null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.vcn_id;}
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}

    /*
    ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/oke_cluster.html", () => {
            let service_lb_subnet_select = d3.select(d3Id('service_lb_subnet_ids'));
            for (let subnet of me.artefact.getOkitJson().subnets) {
                let div = service_lb_subnet_select.append('div');
                div.append('input')
                    .attr('type', 'checkbox')
                    .attr('id', safeId(subnet.id))
                    .attr('value', subnet.id);
                div.append('label')
                    .attr('for', safeId(subnet.id))
                    .text(subnet.display_name);
            }
            // Load K8 versions
            me.loadKubernetesVersions();
            // Load Properties
            loadPropertiesSheet(me.artefact);
            // Node Pools
            me.loadNodePools();
            // Add Handler to Add Button
            $(jqId('add_node_pool')).on('click', () => {me.addNodePool();});
        });
    }

    loadNodePools() {
        // Empty Existing Pools
        $(jqId('node_pools_table_body')).empty();
        // Node Pools
        let pool_num = 1;
        for (let pool of this.pools) {
            this.addNodePoolHtml(pool, pool_num);
            pool_num += 1;
        }
    }

    addNodePoolHtml(pool, pool_num) {
        let me = this;
        // Get Pools Table
        let tb = d3.select('#node_pools_table_body');
        // Create Pools Row
        let tr = tb.append('div').attr('class', 'tr');
        // Create Pool details Table Cell
        let td = tr.append('div').attr('class', 'td')
            .attr("id", "pool_" + pool_num);
        let details = td.append('details').attr('class', 'okit-row-details')
            .attr('open', 'open');
        details.append('summary').text(`Node Pool ${pool_num}`);
        // Create Pools Menu Cell (Delete Button)
        td = tr.append('div').attr('class', 'td');
        td.append('button')
            .attr("type", "button")
            .attr("class", "okit-delete-button")
            .text("X")
            .on('click', function() {
                me.deleteNodePool(pool_num - 1);
                me.loadNodePools();
                //TODO: Replace with Call to View Display
                displayOkitJson();
            });
        // Build Pool Table within Details to all collapse
        let table = details.append('div').attr('class', 'table okit-table okit-properties-table')
            .attr("id", "pool_table_" + pool_num);
        tb = table.append('div').attr('class', 'tbody');
        // Size
        tr = tb.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('Size');
        tr.append('div').attr('class', 'td').append('input')
            .attr('type', 'text')
            .attr("class", "property-value")
            .attr("id", "description" +pool_num)
            .attr("name", "description")
            .attr("value", pool.node_config_details.size)
            .on("change", function() {
                pool.node_config_details.size = this.value;
                console.info('Changed size: ' + this.value);
            });
        // Placement Configuration
        tr = tb.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('Placement');
        td = tr.append('div').attr('class', 'td');
        let placement_table = td.append('div').attr('class', 'table okit-table');
        // -- Availability Domain 1
        this.addPlacementAD(1, placement_table, pool, pool_num);
        // -- Availability Domain 2
        this.addPlacementAD(2, placement_table, pool, pool_num);
        // -- Availability Domain 3
        this.addPlacementAD(3, placement_table, pool, pool_num);
        // Node Shape
        tr = tb.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('Shape');
        td = tr.append('div').attr('class', 'td');
        td.append('select')
            .attr("class", "property-value")
            .attr("id", "node_shape" + pool_num)
            .on("change", function() {
                pool.node_shape = this.options[this.selectedIndex].value;
                console.info('Changed Node Shape: ' + this.value);
                displayOkitJson();
            });
        let shape_select = $(jqId("node_shape" + pool_num));
        $(shape_select).empty();
        for (let shape of okitOciData.getInstanceShapes()) {
            shape_select.append($('<option>').attr('value', shape.shape).text(shape.shape));
        }
        $(shape_select).val(pool.node_shape);
        // Instance OS
        tr = tb.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('OS');
        td = tr.append('div').attr('class', 'td');
        td.append('select')
            .attr("class", "property-value")
            .attr("id", "os" + pool_num)
            .on("change", function() {
                pool.node_source_details.os = this.options[this.selectedIndex].value;
                console.info('Changed Node OS: ' + this.value);
                me.loadOSVersions($("#os" + pool_num).val(), pool_num);
                me.loadImages($("#os" + pool_num).val(), $("#os_version" + pool_num).val(), pool_num);
                displayOkitJson();
            });
        this.loadOSs(pool_num);
        if (pool.node_source_details.os !== '') {
            $("#os" + pool_num).val(pool.node_source_details.os);
        } else {
            $("#os" + pool_num).val($("#os" + pool_num + " option:first").val());
            pool.node_source_details.os = $("#os" + pool_num).val();
        }
        // Load OS Versions
        tr = tb.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('Version');
        td = tr.append('div').attr('class', 'td');
        td.append('select')
            .attr("class", "property-value")
            .attr("id", "os_version" + pool_num)
            .on("change", function() {
                pool.node_source_details.os_version = this.options[this.selectedIndex].value;
                console.info('Changed Node Version: ' + this.value);
                me.loadImages($("#os" + pool_num).val(), $("#os_version" + pool_num).val(), pool_num);
                displayOkitJson();
            });
        this.loadOSVersions($("#os" + pool_num).val(), pool_num);
        if (pool.node_source_details.os_version !== '') {
            $("#os_version" + pool_num).val(pool.node_source_details.os_version);
        } else {
            $("#os_version" + pool_num).val($("#os_version" + pool_num + " option:first").val());
            pool.node_source_details.os_version = $("#os_version" + pool_num).val();
        }
        // Load Images
        tr = tb.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('Image');
        td = tr.append('div').attr('class', 'td');
        td.append('select')
            .attr("class", "property-value")
            .attr("id", "image" + pool_num)
            .on("change", function() {
                pool.node_source_details.image = this.options[this.selectedIndex].value;
                console.info('Changed Node Image: ' + this.value);
                displayOkitJson();
            });
        this.loadImages($("#os" + pool_num).val(), $("#os_version" + pool_num).val(), pool_num);
        if (pool.node_source_details.image !== '') {
            $("#image" + pool_num).val(pool.node_source_details.image);
        } else {
            $("#image" + pool_num).val($("#image" + pool_num + " option:first").val());
            pool.node_source_details.image = $("#image" + pool_num).val();
        }
    }

    loadOSs(pool_num) {
        let os_select = $("#os" + pool_num);
        $(os_select).empty();
        for (let os of okitOciData.getInstanceOS()) {
            os_select.append($('<option>').attr('value', os).text(os));
        }
    }

    loadOSVersions(os, pool_num) {
        let version_select = $(jqId('os_version' + pool_num));
        $(version_select).empty();
        for (let version of okitOciData.getInstanceOSVersions(os)) {
            version_select.append($('<option>').attr('value', version).text(version));
        }
        $("#os_version" + pool_num).val($("#os_version" + pool_num + " option:first").val());
    }

    loadImages(os, version, pool_num) {
        let image_select = $(jqId('image' + pool_num));
        $(image_select).empty();
        for (let image of okitOciData.getInstanceImages(os, version)) {
            image_select.append($('<option>').attr('value', image).text(image));
        }
        $("#image" + pool_num).val($("#image" + pool_num + " option:first").val()       );
    }

    loadKubernetesVersions() {
        let kubernetes_version = $(jqId('kubernetes_version'));
        $(kubernetes_version).empty();
        for (let version of okitOciData.getKubernetesVersions()) {
            kubernetes_version.append($('<option>').attr('value', version.version).text(version.name));
        }
        $("#kubernetes_version").val($("#kubernetes_version option:first").val());
    }

    addPlacementAD(ad, table, pool, pool_num) {
        let tr = table.append('div').attr('class', 'tr');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('type', 'checkbox')
            .attr('id', `pool_${pool_num}_ad${ad}`)
            .on('change', () => {
                // Remove existing if it exists because checkbox is a toggle we will create on checked
                pool.node_config_details.placement_configs =
                    pool.node_config_details.placement_configs.filter((item) => Number(item.availability_domain) !== ad);
                if ($(`#pool_${pool_num}_ad${ad}`).prop('checked')) {
                    console.info('Checked');
                    pool.node_config_details.placement_configs.push({availability_domain: ad, subnet_id: ''});
                } else {
                    console.info('Unchecked');
                    $(`#pool_${pool_num}_ad${ad}_subnet_id`).val('');
                }
                console.info('Toggling : #pool_'+pool_num+'_ad'+ad+'_subnet_row');
                $(`#pool_${pool_num}_ad${ad}_subnet_row`).toggleClass('collapsed');
            });
        td.append('label')
            .attr('class', 'okit-property-value')
            .attr('for', `pool_${pool_num}_ad${ad}`)
            .text(`Availability Domain ${ad}`);
        tr = table.append('div')
            .attr('class', 'tr collapsed')
            .attr('id', `pool_${pool_num}_ad${ad}_subnet_row`);
        tr.append('select')
            .attr('class', 'okit-property-value okit-width-100 okit-bottom-margin')
            .attr('id', `pool_${pool_num}_ad${ad}_subnet_id`)
            .on('change', () => {
                console.info(pool.node_config_details.placement_configs);
                for (let placement of pool.node_config_details.placement_configs) {
                    if (placement.availability_domain === ad) {
                        placement.subnet_id = $(`#pool_${pool_num}_ad${ad}_subnet_id`).val();
                    }
                }
                displayOkitJson();
            });
        this.addSubnets(`pool_${pool_num}_ad${ad}_subnet_id`);
        // Check if AD selected
        for (let placement of pool.node_config_details.placement_configs) {
            if (Number(placement.availability_domain) === ad) {
                $(`#pool_${pool_num}_ad${ad}`).prop('checked', true);
                $(`#pool_${pool_num}_ad${ad}_subnet_id`).val(placement.subnet_id);
                $(`#pool_${pool_num}_ad${ad}_subnet_row`).toggleClass('collapsed');            }
        }
    }

    addSubnets(element) {
        let subnet_select = $(jqId(element));
        subnet_select.append($('<option>').attr('value', '').text(''));
        for (let subnet of this.getOkitJson().subnets) {
            let compartment = this.getOkitJson().getCompartment(this.getOkitJson().getSubnet(subnet.id).compartment_id);
            let vcn = this.getOkitJson().getVirtualCloudNetwork(this.getOkitJson().getSubnet(subnet.id).vcn_id);
            let display_name = `${compartment.display_name}/${vcn.display_name}/${subnet.display_name}`;
            subnet_select.append($('<option>').attr('value', subnet.id).text(display_name));
        }
    }

    addNodePool() {
        let pool = {
            name: this.display_name + '_pool1',
            node_config_details: {
                placement_configs: [{availability_domain: 1, subnet_id: ''}],
                size: 3
            },
            node_shape: 'VM.Standard.E2.1',
            subnet_ids: [],
            node_source_details: {os: 'Oracle Linux', os_version: '', image: '', boot_volume_size_in_gbs: '50', source_type: 'image'},
            ssh_public_key: ''
        }
        this.pools.push(pool);
        this.loadNodePools();
        displayOkitJson();
    }

    deleteNodePool(pool_num) {
        this.pools.splice(pool_num, 1);
        this.loadNodePools();
        //TODO: Replace with Call to View Display
        displayOkitJson();
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/oke_cluster.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return OkeCluster.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

}
