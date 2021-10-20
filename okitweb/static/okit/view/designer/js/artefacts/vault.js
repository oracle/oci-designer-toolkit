/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Vault View Javascript');

/*
** Define Vault View Class
*/
class VaultView extends OkitArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.vaults) json_view.vaults = [];
        super(artefact, json_view);
    }
    // TODO: Return Artefact Parent id e.g. vcn_id for a Internet Gateway
    get parent_id() {return this.artefact.vcn_id;}
    // TODO: Return Artefact Parent Object e.g. VirtualCloudNetwork for a Internet Gateway
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}
    // TODO: If the Resource is within a Subnet but the subnet_iss is not at the top level then raise it with the following functions if not required delete them.
    // Direct Subnet Access
    get subnet_id() {return this.artefact.primary_mount_target.subnet_id;}
    set subnet_id(id) {this.artefact.primary_mount_target.subnet_id = id;}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/vault.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/vault.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return Vault.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [VirtualCloudNetwork.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropVaultView = function(target) {
    let view_artefact = this.newVault();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newVault = function(obj) {
    this.getVaults().push(obj ? new VaultView(obj, this) : new VaultView(this.okitjson.newVault(), this));
    return this.getVaults()[this.getVaults().length - 1];
}
OkitJsonView.prototype.getVaults = function() {
    if (!this.vaults) {
        this.vaults = [];
    }
    return this.vaults;
}
OkitJsonView.prototype.getVault = function(id='') {
    for (let artefact of this.getVaults()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadVaults = function(vaults) {
    for (const artefact of vaults) {
        this.getVaults().push(new VaultView(new Vault(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveVault = function(id) {
    // Build Dialog
    const self = this;
    let vault = this.getVault(id);
    $(jqId('modal_dialog_title')).text('Move ' + vault.display_name);
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
        .attr('id', 'move_vault_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_vault_subnet_id');
    $(jqId("move_vault_subnet_id")).val(vault.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (vault.artefact.subnet_id !== $(jqId("move_vault_subnet_id")).val()) {
                self.getSubnet(vault.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_vault_subnet_id")).val()).recalculate_dimensions = true;
                vault.artefact.subnet_id = $(jqId("move_vault_subnet_id")).val();
                vault.artefact.compartment_id = self.getSubnet(vault.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteVault = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.vaults.push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadVaultsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const vault_select = $(jqId(select_id));
    if (empty_option) {
        vault_select.append($('<option>').attr('value', '').text(''));
    }
    for (let vault of this.getVaults()) {
        vault_select.append($('<option>').attr('value', vault.id).text(vault.display_name));
    }
}
OkitJsonView.prototype.loadVaultsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let vault of this.getVaults()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(vault.id))
            .attr('value', vault.id);
        div.append('label')
            .attr('for', safeId(vault.id))
            .text(vault.display_name);
    }
}
