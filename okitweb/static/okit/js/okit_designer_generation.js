/*
** Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Generation Javascript');

/*
** Generate Button handlers
 */

function openInNewTab(url) {
    let win = window.open(url, '_blank');
    win.focus();
}

function handleGenerateTerraform(e) {
    hideNavMenu();
    $.ajax({
        type: 'post',
        url: 'generate/terraform',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(okitJson),
        success: function(resp) {
            console.info('Response : ' + resp);
            window.location = 'generate/terraform';
            //openInNewTab('generate/terraform');
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

function handleGenerateAnsible(e) {
    hideNavMenu();
    $.ajax({
        type: 'post',
        url: 'generate/ansible',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(okitJson),
        success: function(resp) {
            console.info('REST Response : ' + resp);
            window.location = 'generate/ansible';
            //openInNewTab('generate/ansible');
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
    let request_json = JSON.clone(okitJson);
    request_json.config_profile = okitSettings.profile;
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
            //window.location = 'generate/terraform';
            //openInNewTab('generate/terraform');
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
            unsetBusyIcon();
            alert('Compartment ' + okitJson.compartments[0].name + ' does not exist.');
        }
    });
}

