/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Import Javascript');

function handleImportFromHCLJson(e) {
    hideNavMenu();
    /*
    ** Add Load File Handling
     */
    $('#files').off('change').on('change', handleFileImportSelect);
    // Click Files Element
    let fileinput = document.getElementById("files");
    fileinput.click();
}
function handleFileImportSelect(evt) {
    let files = evt.target.files; // FileList object
    getHclJson(files[0]);
}
function getHclJson(readFile) {
    let reader = new FileReader();
    reader.onload = hclLoaded;
    reader.onerror = errorHandler;
    reader.readAsText(readFile);
}
function hclLoaded(evt) {
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
