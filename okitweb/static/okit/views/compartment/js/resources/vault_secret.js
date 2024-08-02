/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Vault Secret View Javascript');

/*
** Define Vault Secret View Class
*/
class VaultSecretView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.vault_secrets) json_view.vault_secrets = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.vault_id;}
    get parent() {return this.getJsonView().getVault(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new VaultSecretProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return VaultSecret.getArtifactReference();
    }
    static getDropTargets() {
        return [Vault.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropVaultSecretView = function(target) {
    let view_artefact = this.newVaultSecret();
    if (target.type === Vault.getArtifactReference()) {
        view_artefact.artefact.vault_id = target.id;
        view_artefact.artefact.compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    this.okitjson.variables_schema.variables.push({
        group: 'Undefined',
        name: view_artefact.artefact.secret_content.content.substring(4),
        default: '',
        description: ''
    })
    return view_artefact;
}
OkitJsonView.prototype.newVaultSecret = function(obj) {
    this.getVaultSecrets().push(obj ? new VaultSecretView(obj, this) : new VaultSecretView(this.okitjson.newVaultSecret(), this));
    return this.getVaultSecrets()[this.getVaultSecrets().length - 1];
}
OkitJsonView.prototype.getVaultSecrets = function() {
    if (!this.vault_secrets) this.vault_secrets = [];
    return this.vault_secrets;
}
OkitJsonView.prototype.getVaultSecret = function(id='') {
    return this.getVaultSecrets().find(r => r.id === id)
}
OkitJsonView.prototype.loadVaultSecrets = function(vault_secrets) {
    for (const artefact of vault_secrets) {
        this.getVaultSecrets().push(new VaultSecretView(new VaultSecret(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveVaultSecret = function(id) {
    // Build Dialog
    const self = this;
    let vault_secret = this.getVaultSecret(id);
    $(jqId('modal_dialog_title')).text('Move ' + vault_secret.display_name);
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
        .attr('id', 'move_vault_secret_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_vault_secret_subnet_id');
    $(jqId("move_vault_secret_subnet_id")).val(vault_secret.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (vault_secret.artefact.subnet_id !== $(jqId("move_vault_secret_subnet_id")).val()) {
                self.getSubnet(vault_secret.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_vault_secret_subnet_id")).val()).recalculate_dimensions = true;
                vault_secret.artefact.subnet_id = $(jqId("move_vault_secret_subnet_id")).val();
                vault_secret.artefact.compartment_id = self.getSubnet(vault_secret.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteVaultSecret = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getVaultSecrets().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadVaultSecretsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const vault_secret_select = $(jqId(select_id));
    if (empty_option) {
        vault_secret_select.append($('<option>').attr('value', '').text(''));
    }
    for (let vault_secret of this.getVaultSecrets()) {
        vault_secret_select.append($('<option>').attr('value', vault_secret.id).text(vault_secret.display_name));
    }
}
OkitJsonView.prototype.loadVaultSecretsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let vault_secret of this.getVaultSecrets()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(vault_secret.id))
            .attr('value', vault_secret.id);
        div.append('label')
            .attr('for', safeId(vault_secret.id))
            .text(vault_secret.display_name);
    }
}
