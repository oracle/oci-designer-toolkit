/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Mount Target View Javascript');

/*
** Define Mount Target View Class
*/
class MountTargetView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.mount_targets) json_view.mount_targets = [];
        super(artefact, json_view);
        this.export_idx = 0;
    }
    get parent_id() {return this.artefact.subnet_id;}
    get parent() {return this.getJsonView().getSubnet(this.parent_id);}
    get vcn_id() {return this.artefact.subnet_id ? this.getJsonView().getSubnet(this.artefact.subnet_id).vcn_id : '';}
    // ---- Connectors
    get top_bottom_connectors_preferred() {return false;}
    /*
    ** SVG Processing
    */
    checkExports() {
        const self = this
        const file_systems = this.getJsonView().getFileSystems().filter((fs) => fs.artefact.availability_domain === self.artefact.availability_domain).map((fs) => fs.id)
        this.artefact.exports = this.artefact.exports.filter((e) => file_systems.includes(e.file_system_id))
    }
    // Draw Connections
    drawConnections() {
        const self = this
        // console.info('Drawing Mount Target Connections')
        // Check if there are any missing following query
        // this.checkExports();
        this.artefact.exports.forEach((e) => this.removeConnection(this.id, e.file_system_id))
        this.artefact.exports.forEach((e) => this.drawConnection(this.id, e.file_system_id))
    }

    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new MountTargetProperties(this.artefact)
    }

    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/mount_target.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return MountTarget.getArtifactReference();
    }
    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropMountTargetView = function(target) {
    let view_artefact = this.newMountTarget();
    if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
        const subnet_ad = this.getSubnet(target.id).availability_domain
        view_artefact.getArtefact().availability_domain = subnet_ad != '0' ? subnet_ad : 1;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newMountTarget = function(obj) {
    this.getMountTargets().push(obj ? new MountTargetView(obj, this) : new MountTargetView(this.okitjson.newMountTarget(), this));
    return this.getMountTargets()[this.getMountTargets().length - 1];
}
OkitJsonView.prototype.getMountTargets = function() {
    if (!this.mount_targets) {
        this.mount_targets = [];
    }
    return this.mount_targets;
}
OkitJsonView.prototype.getMountTarget = function(id='') {
    for (let artefact of this.getMountTargets()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadMountTargets = function(mount_targets) {
    for (const artefact of mount_targets) {
        this.getMountTargets().push(new MountTargetView(new MountTarget(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveMountTarget = function(id) {
    // Build Dialog
    const self = this;
    let mount_target = this.getMountTarget(id);
    $(jqId('modal_dialog_title')).text('Move ' + mount_target.display_name);
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
        .attr('id', 'move_mount_target_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_mount_target_subnet_id');
    $(jqId("move_mount_target_subnet_id")).val(mount_target.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (mount_target.artefact.subnet_id !== $(jqId("move_mount_target_subnet_id")).val()) {
                self.getSubnet(mount_target.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_mount_target_subnet_id")).val()).recalculate_dimensions = true;
                mount_target.artefact.subnet_id = $(jqId("move_mount_target_subnet_id")).val();
                mount_target.artefact.compartment_id = self.getSubnet(mount_target.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteMountTarget = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getMountTargets().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadMountTargetsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const mount_target_select = $(jqId(select_id));
    if (empty_option) {
        mount_target_select.append($('<option>').attr('value', '').text(''));
    }
    for (let mount_target of this.getMountTargets()) {
        mount_target_select.append($('<option>').attr('value', mount_target.id).text(mount_target.display_name));
    }
}
OkitJsonView.prototype.loadMountTargetsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let mount_target of this.getMountTargets()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(mount_target.id))
            .attr('value', mount_target.id);
        div.append('label')
            .attr('for', safeId(mount_target.id))
            .text(mount_target.display_name);
    }
}
