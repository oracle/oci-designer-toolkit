/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Node Pool View Javascript');

/*
** Define Node Pool View Class
*/
class NodePoolView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.node_pools) json_view.node_pools = [];
        super(artefact, json_view);
    }
    // TODO: Change as appropriate
    get parent_id() {return this.artefact.cluster_id;}
    get parent() {return this.getJsonView().getOkeCluster(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new NodePoolProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return NodePool.getArtifactReference();
    }
    static getDropTargets() {
        return [OkeCluster.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropNodePoolView = function(target) {
    let view_artefact = this.newNodePool();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.cluster_id = target.id;
        view_artefact.artefact.compartment_id = target.compartment_id;
        view_artefact.artefact.setDefaultShape()
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newNodePool = function(obj) {
    this.getNodePools().push(obj ? new NodePoolView(obj, this) : new NodePoolView(this.okitjson.newNodePool(), this));
    return this.getNodePools()[this.getNodePools().length - 1];
}
OkitJsonView.prototype.getNodePools = function() {
    if (!this.node_pools) this.node_pools = [];
    return this.node_pools;
}
OkitJsonView.prototype.getNodePool = function(id='') {
    return this.getNodePools().find(r => r.id === id)
}
OkitJsonView.prototype.loadNodePools = function(node_pools) {
    for (const artefact of node_pools) {
        this.getNodePools().push(new NodePoolView(new NodePool(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveNodePool = function(id) {
    // Build Dialog
    const self = this;
    let node_pool = this.getNodePool(id);
    $(jqId('modal_dialog_title')).text('Move ' + node_pool.display_name);
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    const table = d3.select(d3Id('modal_dialog_body')).append('div')
        .attr('class', 'table okit-table');
    const tbody = table.append('div')
        .attr('class', 'tbody');
    // Subnet
    let tr = tbody.append('div')
        .attr('class', 'tr');
    tr.append('div')
        .attr('class', 'td')
        .text('Subnet');
    tr.append('div')
        .attr('class', 'td')
        .append('select')
        .attr('id', 'move_node_pool_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_node_pool_subnet_id');
    $(jqId("move_node_pool_subnet_id")).val(node_pool.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (node_pool.artefact.subnet_id !== $(jqId("move_node_pool_subnet_id")).val()) {
                self.getSubnet(node_pool.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_node_pool_subnet_id")).val()).recalculate_dimensions = true;
                node_pool.artefact.subnet_id = $(jqId("move_node_pool_subnet_id")).val();
                node_pool.artefact.compartment_id = self.getSubnet(node_pool.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteNodePool = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getNodePools().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadNodePoolsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const node_pool_select = $(jqId(select_id));
    if (empty_option) {
        node_pool_select.append($('<option>').attr('value', '').text(''));
    }
    for (let node_pool of this.getNodePools()) {
        node_pool_select.append($('<option>').attr('value', node_pool.id).text(node_pool.display_name));
    }
}
OkitJsonView.prototype.loadNodePoolsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let node_pool of this.getNodePools()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(node_pool.id))
            .attr('value', node_pool.id);
        div.append('label')
            .attr('for', safeId(node_pool.id))
            .text(node_pool.display_name);
    }
}
