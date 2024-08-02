/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Instance Pool View Javascript');

/*
** Define Instance Pool View Class
*/
class InstancePoolView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.instance_pools) json_view.instance_pools = [];
        super(artefact, json_view);
    }
    // TODO: Change as appropriate
    get parent_id() {return this.artefact.compartment_id;}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new InstancePoolProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return InstancePool.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropInstancePoolView = function(target) {
    let view_artefact = this.newInstancePool();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newInstancePool = function(obj) {
    this.getInstancePools().push(obj ? new InstancePoolView(obj, this) : new InstancePoolView(this.okitjson.newInstancePool(), this));
    return this.getInstancePools()[this.getInstancePools().length - 1];
}
OkitJsonView.prototype.getInstancePools = function() {
    if (!this.instance_pools) this.instance_pools = [];
    return this.instance_pools;
}
OkitJsonView.prototype.getInstancePool = function(id='') {
    return this.getInstancePools().find(r => r.id === id)
}
OkitJsonView.prototype.loadInstancePools = function(instance_pools) {
    for (const artefact of instance_pools) {
        this.getInstancePools().push(new InstancePoolView(new InstancePool(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveInstancePool = function(id) {
    // Build Dialog
    const self = this;
    let instance_pool = this.getInstancePool(id);
    $(jqId('modal_dialog_title')).text('Move ' + instance_pool.display_name);
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
        .attr('id', 'move_instance_pool_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_instance_pool_subnet_id');
    $(jqId("move_instance_pool_subnet_id")).val(instance_pool.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (instance_pool.artefact.subnet_id !== $(jqId("move_instance_pool_subnet_id")).val()) {
                self.getSubnet(instance_pool.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_instance_pool_subnet_id")).val()).recalculate_dimensions = true;
                instance_pool.artefact.subnet_id = $(jqId("move_instance_pool_subnet_id")).val();
                instance_pool.artefact.compartment_id = self.getSubnet(instance_pool.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteInstancePool = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getInstancePools().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadInstancePoolsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const instance_pool_select = $(jqId(select_id));
    if (empty_option) {
        instance_pool_select.append($('<option>').attr('value', '').text(''));
    }
    for (let instance_pool of this.getInstancePools()) {
        instance_pool_select.append($('<option>').attr('value', instance_pool.id).text(instance_pool.display_name));
    }
}
OkitJsonView.prototype.loadInstancePoolsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let instance_pool of this.getInstancePools()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(instance_pool.id))
            .attr('value', instance_pool.id);
        div.append('label')
            .attr('for', safeId(instance_pool.id))
            .text(instance_pool.display_name);
    }
}
