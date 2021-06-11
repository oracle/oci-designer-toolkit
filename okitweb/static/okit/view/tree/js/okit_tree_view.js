/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Tree View Javascript');

class OkitJsonTreeView extends OkitJsonView {
    design_prefix = 'dt'
    resource_prefix = 'rt'
    compartment_prefix = 'ct'
    network_prefix = 'nt'
    ad_prefix = 'at'
    containers = ['compartment', 'subnet', 'virtual_cloud_network']
    container_key_map = {
        compartment: 'compartment_id',
        subnet: 'subnet_id',
        virtual_cloud_network: 'vcn_id'
    }

    constructor(okitjson = null, parent_id = 'canvas-div') {
        super(okitjson);
        this.parent_id = parent_id;
    }
    get root() {return 'root_ul';}
    get compartment_root() {return 'compartment_root';}
    get compartment_root_ul() {return this.compartment_root + '_ul';}
    get ad_root() {return 'availability_domain_root';}
    get ad_root_ul() {return this.ad_root + '_ul';}
    get ad_root_div() {return this.ad_root + '_div';}
    get network_root() {return 'network_root';}
    get network_root_ul() {return this.network_root + '_ul';}

    draw() {
        $(jqId(this.parent_id)).empty();
        this.addGroupOptions()
        this.addDesignTreeDiv()
        this.addResourceTreeDiv()
        this.addCompartmentTreeDiv()
        this.addAdTreeDiv()
        this.addNetworkTreeDiv()
    }

    addGroupOptions() {
        const self = this
        const parent = d3.select(d3Id(this.parent_id));
        const radio_div = parent.append('div').attr('class', 'okit-explorer-radios')
        const design_div = radio_div.append('div')
        const resources_div = radio_div.append('div')
        const compartment_div = radio_div.append('div')
        const ad_div = radio_div.append('div')
        const network_div = radio_div.append('div')
        // // Design Radio
        // design_div.append('input')
        //     .attr('type', 'radio')
        //     .attr('id', 'design_radio')
        //     .attr('name', 'explore_view_radios')
        //     .on('click', () => {
        //         $(`#${self.parent_id}`).find('div.tree-view').addClass('hidden')
        //         $('#design_tree_div').removeClass('hidden')
        //     });
        // design_div.append('label')
        //     .attr('for', 'design_radio')
        //     .text('Design')
        // Resource Radio
        resources_div.append('input')
            .attr('type', 'radio')
            .attr('id', 'resources_radio')
            .attr('name', 'explore_view_radios')
            .attr('checked', 'checked')
            .on('click', () => {
                $(`#${self.parent_id}`).find('div.tree-view').addClass('hidden')
                $('#resources_tree_div').removeClass('hidden')
            });
        resources_div.append('label')
            .attr('for', 'resources_radio')
            .text('Resources')
        // Compartment Radio
        compartment_div.append('input')
            .attr('type', 'radio')
            .attr('id', 'compartment_radio')
            .attr('name', 'explore_view_radios')
            .on('click', () => {
                $(`#${self.parent_id}`).find('div.tree-view').addClass('hidden')
                $('#compartment_tree_div').removeClass('hidden')
            });
        compartment_div.append('label')
            .attr('for', 'compartment_radio')
            .text('Compartment')
        // Availability Domain Radio
        ad_div.append('input')
            .attr('type', 'radio')
            .attr('id', 'ad_radio')
            .attr('name', 'explore_view_radios')
            .on('click', () => {
                $(`#${self.parent_id}`).find('div.tree-view').addClass('hidden')
                $('#ad_tree_div').removeClass('hidden')
            });
        ad_div.append('label')
            .attr('for', 'ad_radio')
            .text('Availability Domain')
        // Network Radio
        network_div.append('input')
            .attr('type', 'radio')
            .attr('id', 'network_radio')
            .attr('name', 'explore_view_radios')
            .on('click', () => {
                $(`#${self.parent_id}`).find('div.tree-view').addClass('hidden')
                $('#network_tree_div').removeClass('hidden')
            });
        network_div.append('label')
            .attr('for', 'network_radio')
            .text('Network')
    }

    addDesignTreeDiv() {
        const parent = d3.select(d3Id(this.parent_id));
        const tree_div = parent.append('div')
            .attr('id', 'design_tree_div')
            .attr('class', 'okit-explorer-tree tree-view hidden')
        const root_ul = tree_div.append('ul')
            .attr('id', 'design_root_ul')
            .attr('class', '')
        this.getOkitJson().getCompartments().filter((comp) => comp.compartment_id === undefined || comp.compartment_id === null || comp.compartment_id === 'canvas').forEach((comp, idx) => {
            const ul = this.addCollapsibleTreeElement(root_ul, `${idx}_${comp.id}_root`, 'compartment-tree-view', comp.display_name, this.design_prefix);
            this.addDesignTreeChildren(ul, comp.id, comp.id, this.design_prefix)
        })
    }

    addDesignTreeChildren(parent, parent_id, compartment_id, prefix) {
        const self = this
        Object.entries(this.getOkitJson().getResourceLists()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, v], idx) => {
            if (v.length > 0 && v.filter((r) => self.isResourceParent(r, parent_id, compartment_id)).length > 0) {
                v.filter((r) => self.isResourceParent(r, parent_id, compartment_id)).forEach((resource) => {
                    if (k.slice(0, -1) in this.container_key_map) {
                        const child_ul = this.addCollapsibleTreeElement(parent, resource.id, `${k.slice(0, -1).split('_').join('-')}-tree-view`, resource.display_name, prefix);
                        this.addDesignTreeChildren(child_ul, resource.id, compartment_id, prefix)
                    } else {
                        this.addSimpleTreeElement(parent, resource.id, `${k.slice(0, -1).split('_').join('-')}-tree-view`, resource.display_name, false, prefix)
                    }
                })
            }
        })
    }

    isResourceParent(r, parent_id, compartment_id) {
        return false
    }

    addResourceTreeDiv() {
        const parent = d3.select(d3Id(this.parent_id));
        const tree_div = parent.append('div')
            .attr('id', 'resources_tree_div')
            .attr('class', 'okit-explorer-tree tree-view')
        const root_ul = tree_div.append('ul')
            .attr('id', 'resources_root_ul')
            .attr('class', '')
        // Loop through sorted resource lists
        Object.entries(this.getOkitJson().getResourceLists()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, v]) => {
            if (v.length > 0) {
                const parent = this.addCollapsibleTreeElement(root_ul, `${this.resource_prefix}_${k}_root`, `${k.slice(0, -1).split('_').join('-')}-tree-view`, `${titleCase(k.split('_').join(' '))}`, `${this.resource_prefix}`);
                v.forEach((resource) => {this.addSimpleTreeElement(parent, resource.id, `${k.slice(0, -1).split('_').join('-')}-tree-view`, resource.display_name, false, `${this.resource_prefix}`)})
            }
        })
    }

    addCompartmentTreeDiv() {
        const parent = d3.select(d3Id(this.parent_id));
        const tree_div = parent.append('div')
            .attr('id', 'compartment_tree_div')
            .attr('class', 'okit-explorer-tree tree-view hidden')
        const root_ul = tree_div.append('ul')
            .attr('id', 'compartment_root_ul')
            .attr('class', '')
        this.getOkitJson().getCompartments().filter((comp) => comp.compartment_id === undefined || comp.compartment_id === null || comp.compartment_id === 'canvas').forEach((comp, idx) => {
            const ul = this.addCollapsibleTreeElement(root_ul, `${idx}_${comp.id}_root`, 'compartment-tree-view', comp.display_name, this.compartment_prefix);
            this.addCompartmentTreeChildren(ul, comp.id, this.compartment_prefix)
        })
    }

    addCompartmentTreeChildren(parent, parent_id, prefix) {
        Object.entries(this.getOkitJson().getResourceLists()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, v], idx) => {
            if (v.length > 0 && v.filter((r) => r.compartment_id === parent_id).length > 0) {
                const ul = this.addCollapsibleTreeElement(parent, `${idx}_${k}_root`, `${k.slice(0, -1).split('_').join('-')}-tree-view`, `${titleCase(k.split('_').join(' '))}`, prefix);
                v.filter((r) => r.compartment_id === parent_id).forEach((resource) => {
                    if (k.slice(0, -1) === 'compartment') {
                        const child_ul = this.addCollapsibleTreeElement(ul, resource.id, `${k.slice(0, -1).split('_').join('-')}-tree-view`, resource.display_name, prefix);
                        this.addCompartmentTreeChildren(child_ul, resource.id, prefix)
                    } else {
                        this.addSimpleTreeElement(ul, resource.id, `${k.slice(0, -1).split('_').join('-')}-tree-view`, resource.display_name, false, prefix)
                    }
                    // this.addSimpleTreeElement(ul, resource.id, `${k.slice(0, -1).split('_').join('-')}-tree-view`, resource.display_name, false, prefix)
                })
            }
        })
    }

    addAdTreeDiv() {
        const parent = d3.select(d3Id(this.parent_id));
        const tree_div = parent.append('div')
            .attr('id', 'ad_tree_div')
            .attr('class', 'okit-explorer-tree tree-view hidden')
        const root_ul = tree_div.append('ul')
            .attr('id', 'ad_root_ul')
            .attr('class', '')
        for (let i of [1, 2, 3]) {
            const ul = this.addCollapsibleTreeElement(root_ul, `${i}_root`, 'availability-domain-tree-view', `Availability Domain ${i}`, this.ad_prefix);
            Object.entries(this.getOkitJson().getResourceLists()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, v], idx) => {
                if (v.length > 0 && v[0].availability_domain !== undefined) {
                    const parent = this.addCollapsibleTreeElement(ul, `${i}_${k}_root`, `${k.slice(0, -1).split('_').join('-')}-tree-view`, `${titleCase(k.split('_').join(' '))}`, this.ad_prefix);
                    v.filter((r) => parseInt(r.availability_domain) === i || parseInt(r.availability_domain) === 0).forEach((resource) => {this.addSimpleTreeElement(parent, resource.id, `${k.slice(0, -1).split('_').join('-')}-tree-view`, resource.display_name, false, `${this.ad_prefix}_${i}`)})
                }
            })
        }
    }

    addNetworkTreeDiv() {
        const parent = d3.select(d3Id(this.parent_id));
        const tree_div = parent.append('div')
            .attr('id', 'network_tree_div')
            .attr('class', 'okit-explorer-tree tree-view hidden')
        const root_ul = tree_div.append('ul')
            .attr('id', 'network_root_ul')
            .attr('class', '')
        // for (let vcn of this.getOkitJson().getVirtualCloudNetworks()) {
        this.getOkitJson().getVirtualCloudNetworks().forEach((vcn, idx) => {
            const ul = this.addCollapsibleTreeElement(root_ul, `${idx}_${vcn.id}_root`, 'virtual-cloud-network-tree-view', vcn.display_name, this.network_prefix);
            this.addNetworkTreeChildren(ul, 'vcn_id', vcn.id, this.network_prefix)
        })
    }

    addNetworkTreeChildren(parent, parent_key, parent_id, prefix) {
        Object.entries(this.getOkitJson().getResourceLists()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, v], idx) => {
            if (v.length > 0 && v[0][parent_key] !== undefined && v.filter((r) => r[parent_key] === parent_id).length > 0) {
                const ul = this.addCollapsibleTreeElement(parent, `${idx}_${k}_root`, `${k.slice(0, -1).split('_').join('-')}-tree-view`, `${titleCase(k.split('_').join(' '))}`, prefix);
                v.filter((r) => r[parent_key] === parent_id).forEach((resource) => {
                    if (k.slice(0, -1) in this.container_key_map) {
                        const child_ul = this.addCollapsibleTreeElement(ul, resource.id, `${k.slice(0, -1).split('_').join('-')}-tree-view`, resource.display_name, prefix);
                        this.addNetworkTreeChildren(child_ul, this.container_key_map[k.slice(0, -1)], resource.id, prefix)
                    } else {
                        this.addSimpleTreeElement(ul, resource.id, `${k.slice(0, -1).split('_').join('-')}-tree-view`, resource.display_name, false, prefix)
                    }
                })
            }
        })
    }

    addCollapsibleTreeElement(parent, id, css_class, text, prefix='') {
        const li = parent.append('li')
            .attr('id', `${prefix}${id}_li`)
            .attr('class', `collapsible-view-element ${css_class}`);
        const div = li.append('div')
            .attr('id', `${prefix}${id}_div`)
            .on('click', () => {
                $(jqId(`${prefix}${id}_li ul`)).toggleClass('hidden');
                $(jqId(`${prefix}${id}_div`)).toggleClass('tree_closed');
            });
        const label = div.append('label')
            .attr('id', `${prefix}${id}_label`)
            .text(text)
            .on('mouseover', () => {$(jqId(id)).addClass('okit-explorer-view-highlight')})
            .on('mouseleave', () => {$(jqId(id)).removeClass('okit-explorer-view-highlight')});
        const ul = li.append('ul')
                .attr('id', `${prefix}${id}_ul`)
                .attr('class', '');
        return ul
    }

    addSimpleTreeElement(parent, id, css_class, text, prefix='') {
        const li = parent.append('li')
            .attr('id', `${prefix}${id}_li`)
            .attr('class', `simple-view-element ${css_class}`);
        const div = li.append('div')
            .attr('id', `${prefix}${id}_div`)
            .on('click', () => {
                $(jqId(`${prefix}${id}_li ul`)).toggleClass('hidden');
                $(jqId(`${prefix}${id}_div`)).toggleClass('tree_closed');
            });
        const label = div.append('label')
            .attr('id', `${prefix}${id}_label`)
            .text(text)
            .on('click', () => {d3.select(d3Id(id + '-svg')).on('click')()})
            .on('mouseover', () => {$(jqId(id)).addClass('okit-explorer-view-highlight')})
            .on('mouseleave', () => {$(jqId(id)).removeClass('okit-explorer-view-highlight')});
        return li
    }
}
