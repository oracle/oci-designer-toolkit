/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Policy View Javascript');

/*
** Define Policy View Class
*/
class PolicyView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.policys) json_view.policys = [];
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
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/policy.html", () => {
            loadPropertiesSheet(self.artefact);
            // Statements
            self.loadStatements();
            // Add Handler to Add Button
            $(jqId('add_statements')).on('click', () => {self.addStatement();});
        });
    }
    loadStatements() {
        // Empty Existing Statements
        $(jqId('statements_body')).empty();
        // Loads
        let cnt = 1;
        for (let statement of this.statements) {
            this.addStatementHtml(statement, cnt);
            cnt += 1;
        }        
    }
    addStatement() {
        this.statements.push('');
        this.loadStatements();
    }
    deleteStatement(cnt) {
        this.statements.splice(cnt, 1);
        this.loadStatements();
    }
    updateStatement(cnt, statement) {
        this.statements[cnt] = statement;
        this.loadStatements();
    }
    addStatementHtml(statement, cnt) {
        const self = this;
        const tbody = d3.select('#statements_body');
        const tr = tbody.append('div').attr('class', 'tr');
        // Add Statement
        tr.append('div').attr('class', 'td').append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", "statement" + cnt)
            .attr("name", "statement")
            .attr("placeholder", "Allow group <group_name> to <verb> <resource-type> in compartment <compartment_name>:<compartment_name>")
            .attr("value", statement)
            .on("change", function() {
                console.info('Changing Statement', this.value);
                self.updateStatement(cnt - 1, this.value);
                // statement = this.value;
                // displayOkitJson();
            });
        // Add Delete Button
        tr.append('div').attr('class', 'td').append('button')
            .attr("type", "button")
            .attr("class", "okit-delete-button")
            .text("X")
            .on('click', function() {
                self.deleteStatement(cnt - 1);
                self.loadStatements();
                // displayOkitJson();
            });
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/policy.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return Policy.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropPolicyView = function(target) {
    let view_artefact = this.newPolicy();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newPolicy = function(obj) {
    this.getPolicys().push(obj ? new PolicyView(obj, this) : new PolicyView(this.okitjson.newPolicy(), this));
    return this.getPolicys()[this.getPolicys().length - 1];
}
OkitJsonView.prototype.getPolicys = function() {
    if (!this.policys) {
        this.policys = [];
    }
    return this.policys;
}
OkitJsonView.prototype.getPolicy = function(id='') {
    for (let artefact of this.getPolicys()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadPolicys = function(policys) {
    for (const artefact of policys) {
        this.getPolicys().push(new PolicyView(new Policy(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.movePolicy = function(id) {
    // Build Dialog
    const self = this;
    let policy = this.getPolicy(id);
    $(jqId('modal_dialog_title')).text('Move ' + policy.display_name);
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
        .attr('id', 'move_policy_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_policy_subnet_id');
    $(jqId("move_policy_subnet_id")).val(policy.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (policy.artefact.subnet_id !== $(jqId("move_policy_subnet_id")).val()) {
                self.getSubnet(policy.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_policy_subnet_id")).val()).recalculate_dimensions = true;
                policy.artefact.subnet_id = $(jqId("move_policy_subnet_id")).val();
                policy.artefact.compartment_id = self.getSubnet(policy.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pastePolicy = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getPolicys().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadPolicysSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const policy_select = $(jqId(select_id));
    if (empty_option) {
        policy_select.append($('<option>').attr('value', '').text(''));
    }
    for (let policy of this.getPolicys()) {
        policy_select.append($('<option>').attr('value', policy.id).text(policy.display_name));
    }
}
OkitJsonView.prototype.loadPolicysMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let policy of this.getPolicys()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(policy.id))
            .attr('value', policy.id);
        div.append('label')
            .attr('for', safeId(policy.id))
            .text(policy.display_name);
    }
}
