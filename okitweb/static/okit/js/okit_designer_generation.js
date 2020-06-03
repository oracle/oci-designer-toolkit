/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Generation Javascript');

/*
** Generate Button handlers
 */

function saveZip(url, filename="") {
    let a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.click();
}

function handleGenerateTerraform(e) {
    hideNavMenu();
    let requestJson = JSON.parse(JSON.stringify(okitJson));
    requestJson.use_variables = okitSettings.is_variables;
    $.ajax({
        type: 'post',
        url: 'generate/terraform',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(requestJson),
        success: function(resp) {
            console.info('Response : ' + resp);
            //window.location = 'generate/terraform';
            saveZip('generate/terraform');
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

function handleGenerateAnsible(e) {
    hideNavMenu();
    let requestJson = JSON.parse(JSON.stringify(okitJson));
    requestJson.use_variables = okitSettings.is_variables;
    $.ajax({
        type: 'post',
        url: 'generate/ansible',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(requestJson),
        success: function(resp) {
            console.info('REST Response : ' + resp);
            saveZip('generate/ansible');
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

function handleGenerateTerraform11(e) {
    hideNavMenu();
    $.ajax({
        type: 'post',
        url: 'generate/terraform11',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(okitJson),
        success: function(resp) {
            console.info('Response : ' + resp);
            window.location = 'generate/terraform11';
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

function handleExportToResourceManager(e) {
    hideNavMenu();
    // Display Dialog
    displayResourceManagerDialog();
    // Set Config Profile
    console.info('Profile : ' + okitSettings.profile);
    if (!okitSettings.profile) {
        okitSettings.profile = 'DEFAULT';
    }
    console.info('Profile : ' + okitSettings.profile);
    okitSettings.home_region_key = '';
    okitSettings.home_region = '';
    ociRegions = [];
    $(jqId('config_profile')).val(okitSettings.profile);
    // Load Compartment Select
    loadCompartments();
    // Load Region Select
    loadRegions();
}

function displayResourceManagerDialog() {
    $(jqId('modal_dialog_title')).text('Export To Resource Manager');
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    let query_form = d3.select(d3Id('modal_dialog_body')).append('div').append('form')
        .attr('id', 'query_oci_form')
        .attr('action', window.location.href)
        .attr('method', 'post');
    let table = query_form.append('div')
        .attr('class', 'table okit-table');
    let tbody = table.append('div')
        .attr('class', 'tbody');
    // Profile
    let tr = tbody.append('div')
        .attr('class', 'tr');
    tr.append('div')
        .attr('class', 'td')
        .text('Connection Profile');
    let profile_select = tr.append('div')
        .attr('class', 'td')
        .append('select')
        .attr('id', 'config_profile')
        .on('change', () => {
            console.info('Profile Select '+$(jqId('config_profile')).val());
            loadCompartments();
            loadRegions();
        });
    for (let section of okitOciConfig.sections) {
        profile_select.append('option')
            .attr('value', section)
            .text(section);
    }
    // Compartment Id
    tr = tbody.append('div')
        .attr('class', 'tr');
    tr.append('div')
        .attr('class', 'td')
        .text('Compartment');
    tr.append('div')
        .attr('class', 'td')
        .append('select')
        .attr('id', 'query_compartment_id')
        .append('option')
        .attr('value', 'Retrieving')
        .text('Retrieving..........');
    // Region Ids
    tr = tbody.append('div')
        .attr('class', 'tr');
    tr.append('div')
        .attr('class', 'td')
        .text('Region');
    tr.append('div')
        .attr('class', 'td')
        .append('select')
        .attr('id', 'query_region_id')
        .append('option')
        .attr('value', 'Retrieving')
        .text('Retrieving..........');
    // Plan / Apply
    tr = tbody.append('div')
        .attr('class', 'tr');
    tr.append('div')
        .attr('class', 'td')
        .text('');
    let td = tr.append('div')
        .attr('class', 'td');
    // Plan
    let div = td.append('div')
        .attr('class', 'okit-horizontal-radio');
    div.append('input')
        .attr('type','radio')
        .attr('id', 'rm_plan')
        .attr('name', 'plan_apply_toggle')
        .attr('value', 'PLAN')
        .attr('checked', 'checked');
    div.append('label')
        .attr('for', 'rm_plan')
        .text('Plan');
    // Apply
    div.append('input')
        .attr('type','radio')
        .attr('id', 'rm_apply')
        .attr('name', 'plan_apply_toggle')
        .attr('value', 'APPLY');
    div.append('label')
        .attr('for', 'rm_apply')
        .text('Apply');
    // Submit Button
    let submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Create Stack')
        .on('click', function () {
            exportToResourceManager();
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
function exportToResourceManager() {
    let request_json = JSON.clone(okitJson);
    request_json.location = {
        config_profile: $(jqId('config_profile')).val(),
        compartment_id: $(jqId('query_compartment_id')).val(),
        region: $(jqId('query_region_id')).val(),
        plan_or_apply: $('input[name=plan_apply_toggle]:checked').val()
    };
    hideNavMenu();
    setBusyIcon();
    $.ajax({
        type: 'post',
        url: 'export/resourcemanager',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            console.info('Response : ' + resp);
            unsetBusyIcon();
            alert('Created Stack ' + resp);
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
            unsetBusyIcon();
            alert(`Export to Resource Manager Failed (${error})`);
        }
    });
    $(jqId('modal_dialog_wrapper')).addClass('hidden');
}


