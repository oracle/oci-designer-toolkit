/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded File System View Javascript');

/*
** Define File System View Class
*/
class FileSystemView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.file_systems) json_view.file_systems = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new FileSystemProperties(this.artefact)
    }
    // loadProperties() {
    //     const self = this;
    //     $(jqId(PROPERTIES_PANEL)).load("propertysheets/file_system.html", () => {loadPropertiesSheet(self.artefact);});
    // }
    // /*
    // ** Load and display Value Proposition
    // */
    // loadValueProposition() {
    //     $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/file_system.html");
    // }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return FileSystem.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropFileSystemView = function(target) {
    let view_artefact = this.newFileSystem();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newFileSystem = function(obj) {
    this.getFileSystems().push(obj ? new FileSystemView(obj, this) : new FileSystemView(this.okitjson.newFileSystem(), this));
    return this.getFileSystems()[this.getFileSystems().length - 1];
}
OkitJsonView.prototype.getFileSystems = function() {
    if (!this.file_systems) {
        this.file_systems = [];
    }
    return this.file_systems;
}
OkitJsonView.prototype.getFileSystem = function(id='') {
    for (let artefact of this.getFileSystems()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadFileSystems = function(file_systems) {
    for (const artefact of file_systems) {
        this.getFileSystems().push(new FileSystemView(new FileSystem(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveFileSystem = function(id) {
    // Build Dialog
    const self = this;
    let file_system = this.getFileSystem(id);
    $(jqId('modal_dialog_title')).text('Move ' + file_system.display_name);
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
        .attr('id', 'move_file_system_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_file_system_subnet_id');
    $(jqId("move_file_system_subnet_id")).val(file_system.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (file_system.artefact.subnet_id !== $(jqId("move_file_system_subnet_id")).val()) {
                self.getSubnet(file_system.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_file_system_subnet_id")).val()).recalculate_dimensions = true;
                file_system.artefact.subnet_id = $(jqId("move_file_system_subnet_id")).val();
                file_system.artefact.compartment_id = self.getSubnet(file_system.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteFileSystem = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getFileSystems().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadFileSystemsSelect = function(select_id, ad, empty_option=false) {
    $(jqId(select_id)).empty();
    const file_system_select = $(jqId(select_id));
    if (empty_option) {
        file_system_select.append($('<option>').attr('value', '').text(''));
    }
    for (let file_system of this.getFileSystems().filter((fs) => fs.availability_domain.toString() === ad.toString())) {
        file_system_select.append($('<option>').attr('value', file_system.id).text(file_system.display_name));
    }
}
OkitJsonView.prototype.loadFileSystemsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let file_system of this.getFileSystems()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(file_system.id))
            .attr('value', file_system.id);
        div.append('label')
            .attr('for', safeId(file_system.id))
            .text(file_system.display_name);
    }
}
