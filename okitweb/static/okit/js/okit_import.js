/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Import Javascript');

// Terraform HCL Json
function handleImportFromHCLJson(e) {
    hideNavMenu();
    /*
    ** Add Load File Handling
     */
    $('#files').off('change').on('change', handleHclJsonImportSelect);
    // Click Files Element
    let fileinput = document.getElementById("files");
    fileinput.click();
}
function handleHclJsonImportSelect(evt) {
    let files = evt.target.files; // FileList object
    getHclJson(files[0]);
}
function getHclJson(readFile) {
    let reader = new FileReader();
    reader.onload = hclJsonLoad;
    reader.onerror = errorHandler;
    reader.readAsText(readFile);
}
function hclJsonLoad(evt) {
    // Clear Existing Region
    regionOkitJson = {};
    okitJsonModel = null
    hideRegionTabBar();
    clearRegionTabBar();
    // Obtain the read file data
    let fileString = evt.target.result;
    let fileJson = JSON.parse(fileString);
    console.info(fileJson);
    $.ajax({
        type: 'get',
        url: 'parse/hcljson',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(fileJson),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            okitJsonModel = new OkitJson(JSON.stringify(response_json.okit_json));
            newDesignerView();
            displayOkitJson();
            displayDesignerView();
            displayTreeView();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        },
        complete: function() {
            console.info('Parsing Complete');
        }
    });
}
// Oracle Cost Estimator Json
function handleImportFromCCEJson(e) {
    hideNavMenu();
    /*
    ** Add Load File Handling
     */
    $('#files').off('change').on('change', handleCceJsonImportSelect);
    // Click Files Element
    let fileinput = document.getElementById("files");
    fileinput.click();
}
function handleCceJsonImportSelect(evt) {
    let files = evt.target.files; // FileList object
    getCceJson(files[0]);
}
function getCceJson(readFile) {
    let reader = new FileReader();
    reader.onload = cceJsonLoad;
    reader.onerror = errorHandler;
    reader.readAsText(readFile);
}
function cceJsonLoad(evt) {
    // Clear Existing Region
    regionOkitJson = {};
    okitJsonModel = null
    hideRegionTabBar();
    clearRegionTabBar();
    // Obtain the read file data
    let fileString = evt.target.result;
    let fileJson = JSON.parse(fileString);
    console.info(fileJson);
    $.ajax({
        type: 'get',
        url: 'parse/ccejson',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(fileJson),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            console.info(response_json);
            okitJsonModel = new OkitJson(JSON.stringify(response_json.okit_json));
            newDesignerView();
            displayOkitJson();
            displayDesignerView();
            displayTreeView();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        },
        complete: function() {
            console.info('Parsing Complete');
        }
    });
}
