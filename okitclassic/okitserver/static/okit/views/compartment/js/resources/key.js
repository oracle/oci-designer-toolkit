/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Key View Javascript');

/*
** Define Key View Class
*/
class KeyView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.keys) json_view.keys = [];
        super(artefact, json_view);
    }
    // TODO: Change as appropriate
    get parent_id() {return this.artefact.vault_id;}
    get parent() {return this.getJsonView().getVault(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new KeyProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return Key.getArtifactReference();
    }
    static getDropTargets() {
        return [Vault.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropKeyView = function(target) {
    let view_artefact = this.newKey();
    if (target.type === Vault.getArtifactReference()) {
        view_artefact.artefact.vault_id = target.id;
        view_artefact.artefact.compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newKey = function(obj) {
    this.getKeys().push(obj ? new KeyView(obj, this) : new KeyView(this.okitjson.newKey(), this));
    return this.getKeys()[this.getKeys().length - 1];
}
OkitJsonView.prototype.getKeys = function() {
    if (!this.keys) {
        this.keys = [];
    }
    return this.keys;
}
OkitJsonView.prototype.getKey = function(id='') {
    for (let artefact of this.getKeys()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadKeys = function(keys) {
    for (const artefact of keys) {
        this.getKeys().push(new KeyView(new Key(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveKey = function(id) {
    // Build Dialog
    const self = this;
    let key = this.getKey(id);
    $(jqId('modal_dialog_title')).text('Move ' + key.display_name);
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
        .attr('id', 'move_key_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_key_subnet_id');
    $(jqId("move_key_subnet_id")).val(key.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (key.artefact.subnet_id !== $(jqId("move_key_subnet_id")).val()) {
                self.getSubnet(key.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_key_subnet_id")).val()).recalculate_dimensions = true;
                key.artefact.subnet_id = $(jqId("move_key_subnet_id")).val();
                key.artefact.compartment_id = self.getSubnet(key.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteKey = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getKeys().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadKeysSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const key_select = $(jqId(select_id));
    if (empty_option) {
        key_select.append($('<option>').attr('value', '').text(''));
    }
    for (let key of this.getKeys()) {
        key_select.append($('<option>').attr('value', key.id).text(key.display_name));
    }
}
OkitJsonView.prototype.loadKeysMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let key of this.getKeys()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(key.id))
            .attr('value', key.id);
        div.append('label')
            .attr('for', safeId(key.id))
            .text(key.display_name);
    }
}
