/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Import Javascript');

// Terraform HCL Json
function handleImportFromHCLJson(e) {
    hideNavMenu();
    /*
    ** Add Load File Handling
     */
    $('#files').off('change').on('change', handleHclJsonImportSelect);
    $('#files').attr('accept', 'application/json');
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
    // okitJsonModel = null
    newModel()
    hideRegionTabBar();
    clearRegionTabBar();
    // Obtain the read file data
    let fileString = evt.target.result;
    let fileJson = JSON.parse(fileString);
    console.info(fileJson);
    $.ajax({
        cache: false,
        type: 'get',
        url: 'import/hcljson',
        dataType: 'text',
        contentType: 'application/json',
        data: {
            json: JSON.stringify(fileJson)
        },
        success: function(resp) {
            let response_json = JSON.parse(resp);
            // okitJsonModel = new OkitJson(JSON.stringify(response_json.okit_json));
            newModel(JSON.stringify(response_json.okit_json));
            newCompartmentView();
            displayOkitJson();
            displayCompartmentView();
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
// Terraform State File
function handleImportFromTFStateJson(e) {
    hideNavMenu();
    /*
    ** Add Load File Handling
     */
    $('#files').off('change').on('change', handleTFStateJsonImportSelect);
    $('#files').attr('accept', '.tfstate');
    // Click Files Element
    let fileinput = document.getElementById("files");
    fileinput.click();
}
function handleTFStateJsonImportSelect(evt) {
    let files = evt.target.files; // FileList object
    getTFStateJson(files[0]);
}
function getTFStateJson(readFile) {
    let reader = new FileReader();
    reader.onload = TFStateJsonLoad;
    reader.onerror = errorHandler;
    reader.readAsText(readFile);
}
function TFStateJsonLoad(evt) {
    // Clear Existing Region
    regionOkitJson = {};
    // okitJsonModel = null
    newModel()
    hideRegionTabBar();
    clearRegionTabBar();
    // Obtain the read file data
    let fileString = evt.target.result;
    let fileJson = JSON.parse(fileString);
    console.info(fileJson);
    $.ajax({
        cache: false,
        type: 'get',
        url: 'import/tfstate',
        dataType: 'text',
        contentType: 'application/json',
        data: {
            json: JSON.stringify(fileJson)
        }}).done((resp) => {
            const response_json = JSON.parse(resp);
            console.info(response_json.okit_json)
            // okitJsonModel = new OkitJson(JSON.stringify(response_json.okit_json));
            newModel(JSON.stringify(response_json.okit_json));
            newCompartmentView();
            displayOkitJson();
            displayCompartmentView();
            displayTreeView();
        }).fail((xhr, status, error) => {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }).always(() => {
            console.info('Parsing Complete');
        })
}
// Resource Manager Terraform Statefile
function handleImportFromRMTFStateJson(e) {
    hideNavMenu()
    const dialog = okitDialogs.get('ImportResourceManager')
    dialog.show()
}
// Oracle Cost Estimator Json
function handleImportFromCCEJson(e) {
    hideNavMenu();
    /*
    ** Add Load File Handling
     */
    $('#files').off('change').on('change', handleCceJsonImportSelect);
    $('#files').attr('accept', 'application/json');
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
    // okitJsonModel = null
    newModel()
    hideRegionTabBar();
    clearRegionTabBar();
    // Obtain the read file data
    let fileString = evt.target.result;
    let fileJson = JSON.parse(fileString);
    console.info(fileJson);
    $.ajax({
        cache: false,
        type: 'get',
        url: 'import/ccejson',
        dataType: 'text',
        contentType: 'application/json',
        data: {
            json: JSON.stringify(fileJson)
        },
        success: function(resp) {
            let response_json = JSON.parse(resp);
            console.info(response_json);
            // okitJsonModel = new OkitJson(JSON.stringify(response_json.okit_json));
            newModel(JSON.stringify(response_json.okit_json));
            newCompartmentView();
            displayOkitJson();
            displayCompartmentView();
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
// Oracle CD3 Xlsx
function handleImportFromCd3Xlsx(e) {
    hideNavMenu();
    /*
    ** Add Load File Handling
     */
    $('#files').off('change').on('change', handleCd3XlsxImportSelect);
    $('#files').attr('accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // Click Files Element
    let fileinput = document.getElementById("files");
    fileinput.click();
}
function handleCd3XlsxImportSelect(evt) {
    const files = evt.target.files; // FileList object
    let form_data = new FormData();
    form_data.append('file', files[0]);
    cd3XlsxLoad(form_data);
}
function getCd3Xlsx(readFile) {
    let reader = new FileReader();
    reader.onload = cd3XlsxLoad;
    reader.onerror = errorHandler;
    reader.readAsBinaryString(readFile);
}
function cd3XlsxLoad(form_data) {
    // Clear Existing Region
    regionOkitJson = {};
    // okitJsonModel = null
    newModel()
    hideRegionTabBar();
    clearRegionTabBar();
    console.info(form_data);
    $.ajax({
        type: 'post',
        url: 'import/cd3xlsx',
        dataType: 'text', // What's Returned
        contentType: false,
        processData: false,
        data: form_data,
        success: function(resp) {
            let response_json = JSON.parse(resp);
            console.info(response_json);
            // okitJsonModel = new OkitJson(JSON.stringify(response_json.okit_json));
            newModel(JSON.stringify(response_json.okit_json));
            newCompartmentView();
            displayOkitJson();
            displayCompartmentView();
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
