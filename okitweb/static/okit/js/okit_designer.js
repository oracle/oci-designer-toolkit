/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Javascript');

/*
 * Define designer working variables
 */
const ROOT_CANVAS_ID = 'canvas';
const PROPERTIES_PANEL = 'properties_panel';
const DESCRIPTION_PANEL = 'description_panel';
const SETTINGS_PANEL = 'settings_panel';
const JSON_MODEL_PANEL = 'json_model_panel';
const JSON_VIEW_PANEL = 'json_view_panel';
const JSON_REGION_PANEL = 'json_region_panel';
const VALUE_PROPOSITION_PANEL = 'value_proposition_panel';
const COST_ESTIMATE_PANEL = 'cost_estimate_panel';
const VALIDATION_PANEL = 'validation_panel';
const HTML5_CANVAS_PANEL  = 'html5_canvas_panel';
// OKIT Json
let regionOkitJson = {};
// Canvas
let activeCanvas = null;
let activeRegion = null;
// Query Request only set to a value when designer called from query
let okitQueryRequestJson = null;
// Dragbar
let dragging_right_drag_bar = false;
let right_drag_bar_start_x = 0;

// Automation details
let ociRegions = [];

function resetDesigner() {
    $("#console_header_view_select").val('designer');
    handleSwitchToCompartmentView();
    newModel();
    newDesignerView();
    regionOkitJson = {};
    clearRegionTabBar();
    hideRegionTabBar();
    $(jqId(PROPERTIES_PANEL)).load('propertysheets/empty.html');
    displayOkitJson();
    $(jqId('file-save-regional-menu-item-li')).addClass('hidden');
}
/*
** Set OCI Link
 */
function setOCILink() {
    $.ajax({
        type: 'get',
        url: `config/region/${okitSettings.profile}`,
        dataType: 'text',
        contentType: 'application/json',
        success: function(resp) {
            //console.info('Response : ' + resp);
            let jsonBody = JSON.parse(resp)
            let oci_href = `https://console.${jsonBody.name}.oraclecloud.com`;
            console.info('OCI Console url :' + oci_href);
            $(jqId('oci_link')).attr('href', oci_href);
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}
/*
** Navigation Menu handlers
 */
function displayPreferencesDialog() {}
function handlePreferences(evt) {
    okitSettings.edit();
}
/*
** Recover from AutoSave
 */
let recovered_model = undefined;
function handleRecover(evt) {
    if (recovered_model) {
        resetDesigner();
        okitJsonModel = new OkitJson(JSON.stringify(recovered_model));
        newDesignerView();
        displayOkitJson();
        displayDesignerView();
        displayTreeView();
    }
    hideRecoverMenuItem();
}
function hideRecoverMenuItem() {
    $(jqId('file_recover_menu_item_li')).addClass('hidden');
}
/*
** New Canvas
 */
function handleNew(evt) {
    hideNavMenu();
    resetDesigner();
    newDiagram();
    redrawSVGCanvas();
    hideRecoverMenuItem();
}
function newDiagram() {
    console.log('Creating New Diagram');
    newModel();
    newDesignerView();
    okitJsonView.newCanvas();
    okitJsonView.newCompartment();
    // Set Top Compartment as deployment compartment
    const resource = okitJsonModel.getCompartments()[0]
    resource.read_only = true;
    resource.display_name = 'Deployment Compartment';
    resource.description = 'Represents the deployment location for the resources specified within the design.'
    resource.definition = 'Logical Compartment that represents the deployment location for the resources specified within the design. This compartment will not be created during the build process.'
    console.info(okitJsonView);
    console.log();
}
function newDesignerView() {
    okitJsonView = new OkitDesignerJsonView(okitJsonModel, 'canvas-div', palette_svg);
}
function newModel() {
    okitJsonModel = new OkitJson();
}
function newRegionsModel() {
    regionOkitJson = new OkitRegions();
}
function setTitleDescription() {
    okitJsonModel ? $('#json_title').val(okitJsonModel.title) : $('#json_title').val('');
    okitJsonModel ? $('#json_description').val(okitJsonModel.description) : $('#json_description').val('');
}
function updateJsonTitle() {
    okitJsonModel.title = $('#json_title').val();
}
function updateJsonDescription() {
    okitJsonModel.description = $('#json_description').val();
}

/*
** Load Existing Json
 */
function handleLoad(evt) {
    hideNavMenu();
    resetDesigner();
    /*
    ** Add Load File Handling
     */
    $('#files').off('change').on('change', handleFileSelect);
    // Click Files Element
    let fileinput = document.getElementById("files");
    fileinput.click();
}
function handleFileSelect(evt) {
    let files = evt.target.files; // FileList object
    getAsJson(files[0]);
}
function getAsJson(readFile) {
    let reader = new FileReader();
    reader.onload = loaded;
    reader.onerror = errorHandler;
    reader.readAsText(readFile);
}
function loaded(evt) {
    // Clear Existing Region
    regionOkitJson = {};
    okitJsonModel = null
    hideRegionTabBar();
    clearRegionTabBar();
    // Obtain the read file data
    let fileString = evt.target.result;
    let fileJson = JSON.parse(fileString);
    console.info(fileJson);
    if (fileJson.hasOwnProperty('compartments')) {
        console.info('>> Single Region File')
        okitJsonModel = new OkitJson(fileString);
        newDesignerView();
    } else {
        console.info('>> Multi Region File.')
        showRegionTabBar();
        for (let region in fileJson) {
            console.info('>>>> Add Tab For ' + region);
            addRegionTab(region);
            regionOkitJson[region] = new OkitJson(JSON.stringify(fileJson[region]));
            if (okitJsonModel === null) {
                okitJsonModel = regionOkitJson[region];
                newDesignerView();
                $(jqId(regionTabName(region))).trigger("click");
            }
        }
    }
    displayOkitJson();
    displayDesignerView();
    displayTreeView();
    hideRecoverMenuItem();
}
function errorHandler(evt) {
    console.info('Error: ' + evt.target.error.name);
}
/*
** Save Model as Json
 */
function handleSave(evt) {
    hideNavMenu();
    let filename = "okit.json";
    if (okitSettings.is_timestamp_files) {
        filename = 'okit-' + getTimestamp() + '.json'
    }
    console.info('>> Saving Single Region File');
    okitJsonModel.updated = getCurrentDateTime();
    saveJson(JSON.stringify(okitJsonModel, null, 2), filename);
}
function handleSaveRegional(evt) {
    hideNavMenu();
    let filename = "okit-regional.json";
    if (okitSettings.is_timestamp_files) {
        filename = 'okit-regional-' + getTimestamp() + '.json'
    }
    console.info('>> Saving Multi Region File');
    saveJson(JSON.stringify(regionOkitJson, null, 2), filename);
}
function saveJson(text, filename){
    let uri = 'data:text/plain;charset=utf-u,'+encodeURIComponent(text);
    triggerDownload(uri, filename);
    okitAutoSave.removeAutoSave();
    hideRecoverMenuItem();
}
/*
** Save Model As Template
 */
function displayGitSaveDialog(title, callback, show_dir=true, show_filename=true) {
    $(jqId('modal_dialog_title')).text(title);
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    let table = d3.select(d3Id('modal_dialog_body')).append('div').append('div')
        .attr('id', 'load_from_git')
        .attr('class', 'table okit-table okit-modal-dialog-table');
    let tbody = table.append('div').attr('class', 'tbody');

    tr = tbody.append('div').attr('class', 'tr').attr('id', 'export_box_repo');
    tr.append('div').attr('class', 'td').text('Repository:');
    tr.append('div').attr('class', 'td').append('select')
        .attr('id', 'git_repository')
        .append('option')
        .attr('value', 'select')
        .text('Select');

    let git_repository_filename_select = d3.select(d3Id('git_repository'));

    for (let git_setting of okitGitConfig.gitsections) {
        git_repository_filename_select.append('option').attr('value', git_setting['url']+'*'+git_setting['branch']).text(git_setting['label']);
    }
    if (show_dir) {
        tr = tbody.append('div').attr('class', 'tr').attr('id', 'export_box_directory');
        tr.append('div').attr('class', 'td').text('Directory Name:');
        tr.append('div').attr('class', 'td').append('input')
            .attr('class', 'okit-input')
            .attr('style', 'text-transform: lowercase')
            .attr('id', 'git_repository_directory')
            .attr('type', 'text');
    }
    $('#git_repository_directory').val(toFilename(okitJsonModel.title));
    if (show_filename) {
        tr = tbody.append('div').attr('class', 'tr').attr('id', 'export_box_filename');
        tr.append('div').attr('class', 'td').text('File Name:');
        tr.append('div').attr('class', 'td').append('input')
            .attr('class', 'okit-input')
            .attr('style', 'text-transform: lowercase')
            .attr('id', 'git_repository_filename')
            .attr('type', 'text');
    }
    $('#git_repository_filename').val(`${toFilename(okitJsonModel.title)}.json`);
    tr = tbody.append('div').attr('class', 'tr').attr('id', 'export_box_commitmsg');
    tr.append('div').attr('class', 'td').text('Commit Message:');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'git_repository_commitmsg')
        .attr('type', 'text');

    // Submit
    /*
    let save_button = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'export_terraform_option_id')
        .attr('type', 'button')
        .text('Save');
    save_button.on("click", callback);

     */

    // Submit Button
    let submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Save')
        .on('click', callback);
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
function handleSaveAs(evt) {
    // Display Save As Dialog
    $(jqId('modal_dialog_title')).text('Save As Template');
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    let table = d3.select(d3Id('modal_dialog_body')).append('div').append('div')
        .attr('id', 'save_as_template_table')
        .attr('class', 'table okit-table okit-modal-dialog-table');
    let tbody = table.append('div').attr('class', 'tbody');
    // Title
    let tr = tbody.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Title');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'template_title')
        .attr('name', 'template_title')
        .attr('type', 'text');
    // Description
    tr = tbody.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Description');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'template_description')
        .attr('name', 'template_description')
        .attr('type', 'text');
    // Type
    /* TODO: Reinstate when sub template types are implemented
    tr = tbody.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Type');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'template_type')
        .attr('name', 'template_type')
        .attr('type', 'text');
    */
    // Save
    let save_button = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'save_as_button')
        .attr('type', 'button')
        .text('Save');
    save_button.on("click", handleSaveAsTemplate);
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
function handleSaveAsTemplate(e) {
    //okitJsonModel.title = $(jqId('template_title')).val();
    //okitJsonModel.description = $(jqId('template_description')).val();
    //okitJsonModel.template_type = $(jqId('template_type')).val();
    okitJsonModel.template_type = 'User';
    okitJsonModel.updated = getCurrentDateTime();
    $.ajax({
        type: 'post',
        url: 'saveas/template',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(okitJsonModel),
        success: function(resp) {
            console.info('Response : ' + resp);
            reloadTemplateMenu('user');
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        },
        complete: function() {
            // Hide modal dialog
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
        }
    });
}
function reloadTemplateMenu(section) {
    const id = `${section}_template_menu_group`;
    $.ajax({
        type: 'get',
        url: `templates/${section}`,
        dataType: 'text', // Response Type
        contentType: 'application/json', // Sent Message Type
        success: function(resp) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(resp, "text/html");
            const new_menu = doc.getElementById(id);
            const current_menu = document.getElementById(id);
            const template_menu = document.getElementById('templates_menu')
            // Check if menu section already exists
            current_menu !== null ? current_menu.replaceWith(new_menu) : template_menu.appendChild(new_menu);
            addMenuDropdownMouseOver(`#${id}`);   
        },
        error: function(xhr, status, error) {
            console.error('Status : '+ status)
            console.error('Error : '+ error)
        }
    });
}
function handleSaveToGit(e) {
    displayGitSaveDialog('Save To Git', () =>
    {
        let request_json = JSON.clone(okitJsonModel);
        request_json.git_repository = $(jqId('git_repository')).val();
        request_json.git_repository_directory = $(jqId('git_repository_directory')).val();
        request_json.git_repository_filename = $(jqId('git_repository_filename')).val();
        request_json.git_repository_commitmsg = $(jqId('git_repository_commitmsg')).val();
        request_json.template_type = 'Git';
        request_json.updated = getCurrentDateTime();
        hideNavMenu();
        setBusyIcon();
        $(jqId('modal_dialog_progress')).removeClass('hidden');
        $(jqId('submit_query_btn')).text('.........Processing');
        $(jqId('submit_query_btn')).attr('disabled', 'disabled');
        $.ajax({
            type: 'post',
            url: 'saveas/git',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request_json),
            success: function (resp) {
                console.info('Response : ' + resp);
            },
            error: function (xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
            },
            complete: function () {
                unsetBusyIcon();
                $(jqId('modal_dialog_wrapper')).addClass('hidden');
                $(jqId('modal_dialog_progress')).addClass('hidden');
            }
        });
    }, true, true);
}
/*
** Redraw / Redisplay the existing Json
 */
function handleRedraw(evt) {
    hideNavMenu();
    redrawSVGCanvas();
    return false;
}
function redrawSVGCanvas(recalculate=false) {
    if (recalculate) {resetRecalculateFlag();}
    displayDesignerView();
    displayOkitJson();
}
/*
** Validate Model
 */
function handleValidate(evt) {
    hideNavMenu();
    $('#toggle_validation_button').removeClass('okit-bar-panel-displayed');
    $('#toggle_validation_button').click();
    return false;
}
/*
** Load Model From Template
 */
function loadTemplate(template_url) {
    hideNavMenu();
    resetDesigner();
    $.ajax({
        type: 'get',
        url: template_url,
        dataType: 'text',
        contentType: 'application/json',
        success: function(resp) {
            okitJsonModel = new OkitJson(resp);
            newDesignerView();
            displayOkitJson();
            displayDesignerView();
            displayTreeView();
        },
        error: function(xhr, status, error) {
            console.error('Status : '+ status);
            console.error('Error  : '+ error);
        }
    });
}
/*
** Query OCI
 */
function displayQueryDialog() {
    $(jqId('modal_dialog_title')).text('Query OCI');
    // if (okitSettings.fast_discovery) {
    //     $(jqId('modal_dialog_title')).text('OCI Introspection (Fast Discovery)');
    // //    document.getElementById('sub_compartments_row').classList.add('collapsed');
    // }
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
                console.info('Profile Select ' + $(jqId('config_profile')).val());
                okitSettings.profile = $(jqId('config_profile')).val();
                okitSettings.save();
                // Clear Existing Compartments
                okitOciData.setCompartments([]);
                loadCompartments();
                loadRegions();
            });
    for (let section of okitOciConfig.sections) {
        profile_select.append('option')
            .attr('value', section)
            .text(section);
    }
    // Region Ids
    tr = tbody.append('div')
        .attr('class', 'tr');
    tr.append('div')
        .attr('class', 'td')
        .text('Region(s)');
    tr.append('div')
        .attr('class', 'td')
        .append('select')
            .attr('id', 'query_region_id')
            .attr('multiple', 'multiple')
            .attr('size', 10)
            .on('change', () => {
                console.info('Region Select ' + $(jqId('query_region_id')).val());
                okitSettings.last_used_region = $(jqId('query_region_id')).val();
                okitSettings.save();
            })
            .append('option')
                .attr('value', 'Retrieving')
                .text('Retrieving..........');
    // Compartment Id
    tr = tbody.append('div')
        .attr('class', 'tr');
    tr.append('div')
        .attr('class', 'td')
        .text('Compartment')
        .append('img')
                .attr('class', 'okit-refresh-button')
                .attr('src', '/static/svg/refresh.svg')
                .attr('alt', "Refresh")
                .on('click', () => {
                    // Clear Existing Compartments
                    okitOciData.setCompartments([]);
                    loadCompartments();
                });
    tr.append('div')
        .attr('class', 'td')
        .append('select')
            .attr('id', 'query_compartment_id')
            .on('change', () => {
                console.info('Compartment Select ' + $(jqId('query_compartment_id')).val());
                okitSettings.last_used_compartment = $(jqId('query_compartment_id')).val();
                okitSettings.save();
            })
            .append('option')
                .attr('value', 'Retrieving')
                .text('Retrieving..........');
    // Sub-Compartment
    tr = tbody.append('div')
        .attr('id', 'sub_compartments_row')
        .attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('');
    let td = tr.append('div').attr('class', 'td');
    td.append('input')
        .attr('id', 'include_sub_compartments')
        .attr('name', 'include_sub_compartments')
        .attr('type', 'checkbox');
    td.append('label')
        .attr('for', 'include_sub_compartments')
        .text('Include Sub Compartments');
    // Fast Discovery
    tr = tbody.append('div')
        .attr('id', 'fast_discovery_row')
        .attr('class', 'tr collapsed');
    tr.append('div').attr('class', 'td').text('');
    td = tr.append('div').attr('class', 'td');
    td.append('input')
        .attr('id', 'fast_discovery')
        .attr('name', 'fast_discovery')
        .attr('type', 'checkbox');
    td.append('label')
        .attr('for', 'fast_discovery')
        .text('Fast Discovery');
    // if (developer_mode) $(jqId('fast_discovery_row')).removeClass('collapsed');
    $(jqId('fast_discovery_row')).removeClass('collapsed');
    // Submit Button
    let submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Query')
        .on('click', function () {
            showQueryResults();
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
function handleQueryOci(e) {
    hideNavMenu();
    $("#console_header_view_select").val('designer');
    handleSwitchToCompartmentView();
    // Display Dialog
    displayQueryDialog();
    // Set Query Config Profile
    console.info('Profile : ' + okitSettings.profile);
    if (!okitSettings.profile) {
        okitSettings.profile = 'DEFAULT';
    }
    console.info('Profile : ' + okitSettings.profile);
    okitSettings.home_region_key = '';
    okitSettings.home_region = '';
    ociRegions = [];
    // Load Previous Profile
    $(jqId('config_profile')).val(okitSettings.profile);
    // Load Compartment Select
    loadCompartments();
    // Load Region Select
    loadRegions();
}
function loadCompartments() {
    // Clear Select
    let select = $(jqId('query_compartment_id'));
    $(select).empty();
    if (okitOciData.getCompartments().length > 0) {
        let compartment_select = d3.select(d3Id('query_compartment_id'));
        for (let compartment of okitOciData.getCompartments()) {
            compartment_select.append('option')
                .attr('value', compartment['id'])
                .text(compartment['canonical_name']);
        }
        selectQueryLastUsedCompartment();
     } else {
        select.append($('<option>').attr('value', 'Retrieving').text('Retrieving..........'));
        // Get Compartments
        $.ajax({
            type: 'get',
            url: 'oci/compartment',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify({config_profile: $(jqId('config_profile')).val()}),
            success: function (resp) {
                let jsonBody = JSON.parse(resp)
                okitOciData.setCompartments(jsonBody);
                $(jqId('query_compartment_id')).empty();
                let compartment_select = d3.select(d3Id('query_compartment_id'));
                for (let compartment of jsonBody) {
                    console.info(compartment['display_name']);
                    console.info(compartment['canonical_name']);
                    compartment_select.append('option')
                        .attr('value', compartment['id'])
                        .text(compartment['canonical_name']);
                    if (okitSettings.home_region_key === '') {
                        okitSettings.home_region_key = compartment.home_region_key;
                    }
                }
                selectQueryLastUsedCompartment();
            },
            error: function (xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
            }
        });
    }
}
function loadRegions() {
    // Clear Select
    let select = $(jqId('query_region_id'));
    $(select).empty();
    let region_select = d3.select(d3Id('query_region_id'));
    for(let region of okitOciData.getRegions() ){
        region_select.append('option')
            .attr('value', region['name'])
            .text(region['display_name']);
    }
    selectQueryLastUsedRegion();
}
// TODO: Delete
function loadRegions1() {
    // Clear Select
    let select = $(jqId('query_region_id'));
    $(select).empty();
    select.append($('<option>').attr('value', 'Retrieving').text('Retrieving..........'));
    // Get Regions
    $.ajax({
        type: 'get',
        url: 'oci/region',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify({config_profile: $(jqId('config_profile')).val()}),
        success: function(resp) {
            //console.info('Response : ' + resp);
            let jsonBody = JSON.parse(resp)
            $(jqId('query_region_id')).empty();
            let region_select = d3.select(d3Id('query_region_id'));
            ociRegions = jsonBody;
            for(let region of jsonBody ){
                //console.info(region['display_name']);
                //console.info(region['name']);
                region_select.append('option')
                    .attr('value', region['name'])
                    .text(region['display_name']);
            }
            selectQueryLastUsedRegion();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}
function selectQueryHomeRegion() {
    if (okitSettings.home_region_key !== '') {
        for (let region of ociRegions) {
            if (okitSettings.home_region_key === region.key) {
                $(jqId('query_region_id')).val(region.name);
                break;
            }
        }
    }
}
function selectQueryLastUsedRegion() {
    if (okitSettings.last_used_region !== '') {
       $(jqId('query_region_id')).val(okitSettings.last_used_region);
        $(jqId('query_region_id')).change();
    }
}
function selectQueryLastUsedCompartment() {
    if (okitSettings.last_used_compartment !== '') {
        $(jqId('query_compartment_id')).val(okitSettings.last_used_compartment);
        $(jqId('query_compartment_id')).change();
    }
}
let queryCount = 0;
function showQueryResults() {
    console.info('Generating Query Results');
    let regions = $(jqId('query_region_id')).val();
    let request = {};
    request.compartment_id = $(jqId('query_compartment_id')).val();
    request.compartment_name = $(`${jqId('query_compartment_id')} option:selected`).text();
    request.config_profile = $(jqId('config_profile')).val();
    request.sub_compartments = $(jqId('include_sub_compartments')).is(':checked');
    request.fast_discovery = $(jqId('fast_discovery')).is(':checked');
    request.region = '';
    clearRegionTabBar();
    showRegionTabBar();
    newModel();
    newDesignerView();
    okitJsonView.newCanvas();
    console.info('Regions Ids : ' + regions);
    newRegionsModel();
    if (regions.length > 0) {
        $(jqId('modal_loading_wrapper')).removeClass('hidden');
        // okitOCIQuery = new OkitOCIQuery(regions, okitSettings.fast_discovery);
        okitOCIQuery = new OkitOCIQuery(regions, request.fast_discovery);
        // Add Tabs
        $(jqId('region_progress')).empty();
        for (const [i, region] of regions.entries()) {
            addRegionTab(region);
            addRegionTabProgress(region);
            addRegionProgressCheckbox(region);
        }
        $(jqId('file-save-regional-menu-item-li')).removeClass('hidden');
        $(jqId(regionTabName(regions[0]))).trigger("click");
        okitOCIQuery.query(request, function(region) {
            console.info('Complete ' + region);
            okitJsonModel = regionOkitJson[region];
            newDesignerView();
            redrawSVGCanvas(region);
            displayTreeView();
            $(jqId('modal_loading_wrapper')).addClass('hidden');
        }, function (region) {
            $(jqId(regionCheckboxName(region))).prop('checked', true);
            removeRegionTabProgress(region);
        });
    } else {
        console.info('Region Not Selected.');
    }
    $(jqId('modal_dialog_wrapper')).addClass('hidden');
    hideRecoverMenuItem();
}
/*
$(document).ajaxStop(function() {
    console.info('All Ajax Functions Stopped');
    //$(jqId('modal_loading_wrapper')).addClass('hidden');
    okitJsonView ? console.info(okitJsonView) : console.info('okitJsonView not defined');
    okitJsonModel ? console.info(okitJsonModel) : console.info('okitJsonModel not defined');
    //displayTreeView();
    okitOCIQuery ? console.info(okitOCIQuery) : console.info('okitOCIQuery not defined');
});
 */
/*
** Export the Model as various formats
 */
/*
** Export SVG
 */
function setExportDisplay() {
    const top_level_compartment = okitJsonView.top_level_compartment;
    // Draw top level compartment with minimum rectangle size
    top_level_compartment.export = true;
    top_level_compartment.recalculate_dimensions = true;
    okitJsonView.draw(true);
    const dimensions = top_level_compartment.dimensions;
    top_level_compartment.export = false;
    top_level_compartment.recalculate_dimensions = true;
    return dimensions;
}
function handleExportToSVG(evt) {
    hideNavMenu();
    setExportDisplay();
    const okitcanvas = document.getElementById("canvas-svg");
    const name = okitJsonModel.compartments[0]['name'];
    let filename = name + '.svg';
    if (okitSettings.is_timestamp_files) {
        filename = name + getTimestamp() + '.svg';
    }
    saveSvg(okitcanvas, filename);
}
function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    let svgData = svgEl.outerHTML;
    let preface = '<?xml version="1.0" standalone="no"?>\r\n';
    let svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    let svgUrl = URL.createObjectURL(svgBlob);
    triggerDownload(svgUrl, name)
    redrawSVGCanvas();
}
/*
** Export PNG
 */
function handleExportToPNG(evt) {
    hideNavMenu();
    saveAsImage('png');
}
/*
** Export JPG
 */
function handleExportToJPG(evt) {
    hideNavMenu();
    saveAsImage('jpeg');
}
function saveAsImage(type='jpeg') {
    console.info("Saving As " + type);
    const dimensions = setExportDisplay();
    let svg = d3.select(d3Id("canvas-svg")).node();
    let serializer = new XMLSerializer();
    let svgStr = serializer.serializeToString(svg);
    let filename = "okit";
    //let canvas = document.getElementById("canvas");
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    let img = document.createElement("img");
    img.style = 'position: absolute; top: 0; left: 0';
    document.body.appendChild(img);

    if (okitSettings.is_timestamp_files) {
        filename = 'okit-' + getTimestamp();
    }

    img.onload = function () {
        const image = new Image();
        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        image.crossOrigin = 'anonymous';
        image.onload = function () {
            context.drawImage(image,0,0);
            triggerDownload(canvas.toDataURL("image/" + type), filename + "." + type);
            document.body.removeChild(img);
            redrawSVGCanvas();
        }
        image.src = img.src;
    }

    img.src = 'data:image/svg+xml;base64,' + window.btoa(svgStr);
}
/*
** Resource Manager
 */

/*
** Region Tab Bar Functions
 */
function clearRegionTabBar() {
    $(jqId('region_tab_bar')).empty();
}
function showRegionTabBar() {
    $(jqId('region_tab_bar')).removeClass('hidden');
}
function hideRegionTabBar() {
    $(jqId('region_tab_bar')).addClass('hidden');
}
function addRegionTab(region) {
    d3.select(d3Id('region_tab_bar')).append('button')
        .attr('class', 'okit-tab')
        .attr('id', regionTabName(region))
        .attr('type', 'button')
        .text(region)
        .on('click', function () {
            $('#region_tab_bar > button').removeClass("okit-tab-active");
            $(jqId(regionTabName(region))).addClass("okit-tab-active");
            activeRegion = region;
            okitJsonModel = regionOkitJson[region];
            newDesignerView();
            redrawSVGCanvas();
        });
}
function addRegionTabProgress(region) {
    $(jqId(regionTabName(region))).addClass('okit-tab-progress');
}
function removeRegionTabProgress(region) {
    $(jqId(regionTabName(region))).removeClass('okit-tab-progress');
}
function regionTabName(region) {
    return region + '_tab';
}
function addRegionProgressCheckbox(region) {
    let td = d3.select(d3Id('region_progress')).append('div').attr('class', 'tr')
        .append('div').attr('class', 'td');
    td.append('input')
        .attr('id', regionCheckboxName(region))
        .attr('type', 'checkbox');
    td.append('label')
        .text(region);
}
function regionCheckboxName(region) {
    return region + '_checkbox';
}

/*
** Properties Tabbar
*/
function handlePropertiesTabClick(id) {
    $('#properties_tab_bar > button').removeClass("okit-tab-active");
    $(jqId(id)).addClass("okit-tab-active");
    $('#resource_properties > div.okit-tab-contents').addClass("hidden");
    $(jqId(id.replace('_tab', '_contents'))).removeClass("hidden");
}

/*
** OKIT Canvas Functions
 */
/*
** Json / Source Code
 */
function displayOkitJson() {
    $(jqId(JSON_MODEL_PANEL)).html('<pre><code>' + JSON.stringify(okitJsonModel, null, 2) + '</code></pre>');
    $(jqId(JSON_VIEW_PANEL)).html('<pre><code>' + JSON.stringify(okitJsonView, null, 2) + '</code></pre>');
    $(jqId(JSON_REGION_PANEL)).html('<pre><code>' + JSON.stringify(regionOkitJson, null, 2) + '</code></pre>');
}
/*
** Draw Canvas
 */
function displayDesignerView() {
    okitJsonView.draw();
    setTitleDescription();
}
function resetRecalculateFlag() {
    for (let resource of [...okitJsonView.getCompartments(), ...okitJsonView.getVirtualCloudNetworks(),
        ...okitJsonView.getSubnets()]) {
        resource.recalculate_dimensions = true;
    }
}
/*
** Slidebar handlers
 */
// Tree View
function displayTreeView() {
    if ($('#toggle_explorer_button').hasClass('okit-bar-panel-displayed')) {
        let okit_tree = new OkitJsonTreeView(okitJsonModel, 'explorer_panel');
        okit_tree.draw();
    }
}
// Left Panels
function slideLeftPanelsOffScreen() {
    $('#designer_left_column > div').addClass('hidden');
    $('#console_left_bar > label').removeClass('okit-bar-panel-displayed');
}
function checkLeftColumn() {
    // Check to see if Right Column needs to be hidden
    let isHidden = $(jqId('designer_left_column')).hasClass('okit-slide-hide-left');
    if ($('#designer_left_column > div:not(.hidden)').length === 0) {
        $(jqId('designer_left_column')).addClass('okit-slide-hide-left');
        if (!isHidden) {
            setTimeout(redrawSVGCanvas, 260);
        }
    } else {
        $(jqId('designer_left_column')).removeClass('okit-slide-hide-left');
        if (isHidden) {
            setTimeout(redrawSVGCanvas, 260);
        }
    }
}
// Right Panels
function slideRightPanelsOffScreen() {
    $('#designer_right_column > div').addClass('hidden');
    $('#console_right_bar > label').removeClass('okit-bar-panel-displayed');
}
function checkRightColumn() {
    // Check to see if Right Column needs to be hidden
    let isHidden = $(jqId('designer_right_column')).hasClass('okit-slide-hide-right');
    if ($('#designer_right_column > div:not(.hidden)').length === 0) {
        $(jqId('designer_right_column')).addClass('okit-slide-hide-right');
        if (!isHidden) {
            setTimeout(redrawSVGCanvas, 260);
        }
    } else {
        $(jqId('designer_right_column')).removeClass('okit-slide-hide-right');
        if (isHidden) {
            setTimeout(redrawSVGCanvas, 260);
        }
    }
}
function setCenterColumnWidth() {
    let leftAdjust = 0;
    let rightAdjust = 0;
    if ($(jqId('designer_left_column')).hasClass('okit-slide-show')) {
        leftAdjust = $(jqId('designer_left_column')).width();
    }
    if ($(jqId('designer_right_column')).hasClass('okit-slide-show')) {
        rightAdjust = $(jqId('designer_right_column')).width();
    }
    let mainWidth = $('.main').width();
    let centerWidth = mainWidth - leftAdjust - rightAdjust;
    console.info('Main Width : ' + mainWidth);
    console.info('Left Adjustment : ' + leftAdjust);
    console.info('Right Adjustment : ' + rightAdjust);
    console.info('Center Width : ' + centerWidth);
    $(jqId('designer_center_column')).css('min-width', 'calc(100% - ' + (leftAdjust + rightAdjust) + 'px)');
}
/*
** Model Validation
 */
function displayValidationResults(results) {
    console.info('Displaying Validation Results');
    if (results.valid) {
        $(jqId('validation_status')).text('Validation Successful');
    } else {
        $(jqId('validation_status')).text('Validation Failed');
    }
    // Process Errors
    let tbody = d3.select(d3Id('validation_errors_tbody'));
    $(jqId('validation_errors_tbody')).empty();
    let tr = null;
    for (let error of results.results.errors) {
        tr = tbody.append('div')
            .attr('class', 'tr');
        tr.append('div')
            .attr('class', 'td')
            .text(error.type);
        tr.append('div')
            .attr('class', 'td')
            .text(error.artefact);
        tr.append('div')
            .attr('class', 'td')
            .text(error.message);
        // Highlight
        let fill = d3.select(d3Id(error.id)).attr('fill');
        tr.on('mouseover', () => {
            d3.select(d3Id(error.id)).attr('fill', validate_error_colour);
        });
        tr.on('mouseout', () => {
            d3.select(d3Id(error.id)).attr('fill', fill);
        });
        tr.on('click', () => {
            error_properties.push(error.element);
            d3.select(d3Id(error.id + '-svg')).on("click")();
            $('#toggle_properties_button').click();
        });
    }
    $(jqId('validation_errors_summary')).text(`Errors (${results.results.errors.length})`)
    // Process Warnings
    tbody = d3.select(d3Id('validation_warnings_tbody'));
    $(jqId('validation_warnings_tbody')).empty();
    for (let warning of results.results.warnings) {
        tr = tbody.append('div')
            .attr('class', 'tr');
        tr.append('div')
            .attr('class', 'td')
            .text(warning.type);
        tr.append('div')
            .attr('class', 'td')
            .text(warning.artefact);
        tr.append('div')
            .attr('class', 'td')
            .text(warning.message);
        // Highlight
        let fill = d3.select(d3Id(warning.id)).attr('fill');
        tr.on('mouseover', () => {
            d3.select(d3Id(warning.id)).attr('fill', validate_warning_colour);
        });
        tr.on('mouseout', () => {
            d3.select(d3Id(warning.id)).attr('fill', fill);
        });
        tr.on('click', () => {
            warning_properties.push(warning.element);
            d3.select(d3Id(warning.id + '-svg')).on("click")();
            $('#toggle_properties_button').click();
        });
    }
    $(jqId('validation_warnings_summary')).text(`Warnings (${results.results.warnings.length})`)
    // Process Information
    tbody = d3.select(d3Id('validation_info_tbody'));
    $(jqId('validation_info_tbody')).empty();
    for (let warning of results.results.info) {
        tr = tbody.append('div')
            .attr('class', 'tr');
        tr.append('div')
            .attr('class', 'td')
            .text(warning.type);
        tr.append('div')
            .attr('class', 'td')
            .text(warning.artefact);
        tr.append('div')
            .attr('class', 'td')
            .text(warning.message);
        // Highlight
        let fill = d3.select(d3Id(warning.id)).attr('fill');
        tr.on('mouseover', () => {
            d3.select(d3Id(warning.id)).attr('fill', validate_warning_colour);
        });
        tr.on('mouseout', () => {
            d3.select(d3Id(warning.id)).attr('fill', fill);
        });
        tr.on('click', () => {
            warning_properties.push(warning.element);
            d3.select(d3Id(warning.id + '-svg')).on("click")();
            $('#toggle_properties_button').click();
        });
    }
    $(jqId('validation_info_summary')).text(`Information (${results.results.info.length})`)
}
/*
** Model Pricing
 */
function displayPricingResults(pricing) {
    console.info('Displaying Pricing Results');
    const results = pricing.filter(result => result.RESOURCENAME !== 'updated' && result.RESOURCENAME !== 'okit_version')
    $(jqId(COST_ESTIMATE_PANEL)).empty();
    let summary = results.pop();

    d3.select(d3Id("cost_estimate_panel")).append('p')
        .attr('class', 'okit-cost-small-print')
        .text("The values displayed are purely for estimation purposes only and are generated from our public pricing pages. For accurate costing you will need to consult your OCI Account Manager.");

    let download_button = d3.select(d3Id('cost_estimate_panel')).append('p')
        .append('div').append('button')
        .attr('id', 'download_button')
        .attr('type', 'button')
        .text('Download BoM');
    download_button.on("click", handleDownloadBoM);

    // Hidden form is required to download the retrieved file from python
    let hidden_form = d3.select(d3Id('cost_estimate_panel')).append('form')
        .attr('id', 'hidden_form')
        .attr('action', 'pricing/downloadbom')
        .attr("target", "_blank")
        .attr('method', 'POST');

    hidden_form.append("input")
        .attr("type", "hidden")
        .attr("name", "hdnJson")
        .attr("id", "hdnJson")

    // d3.select(d3Id('cost_estimate_panel')).append('p').append('a')
    //     .attr('href', 'pricing/downloadbom').text('Export BoM');


    tabulateHorizontal("cost_estimate_panel", results,
        [{
            "label": "RESOURCENAME",
            "align": "left",
            "width": "50%"
        },
            {
                "label": "PAYG",
                "align": "right",
                "width": "25%"
            },
            {
                "label": "ANNUAL_FLEX",
                "align": "right",
                "width": "25%"
            }
        ]);
    d3.select(d3Id("cost_estimate_panel")).append('p').text("SUMMARY").style('font-weight', 'bold');
    tabulateVertical("cost_estimate_panel", summary,
        [{
            "label": "PAYG",
            "align": "right",
            "labelWidth": "50%",
            "dataWidth": "50%"
        },
            {
                "label": "ANNUAL_FLEX",
                "align": "right",
                "labelWidth": "50%",
                "dataWidth": "50%"
            },
            {
                "label": "YEARLY_PAYG",
                "align": "right",
                "labelWidth": "50%",
                "dataWidth": "50%"
            },
            {
                "label": "YEARLY_ANNUAL_FLEX",
                "align": "right",
                "labelWidth": "50%",
                "dataWidth": "50%"
            }
        ]);
}
function tabulateVertical(element, data, columns) {
    let table = d3.select(d3Id(element)).append('div')
        .attr('class', 'table okit-table');

    let tbody = table.append('div')
        .attr('class', 'tbody');

    for (let key in data) {
        for (i in columns) {
            if (columns[i].label == key) {
                let formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                });
                row = tbody.append("div").attr('class', 'tr');
                row.append("div")
                    .attr('class', 'th')
                    .style('text-align', "left")
                    .style("width", columns[i].labelWidth)
                    .text(titleCase(replaceAll(key, '_', ' ')));
                row.append("div")
                    .attr('class', 'td')
                    .style('text-align', columns[i].align)
                    .style("width", columns[i].dataWidth)
                    .text(formatter.format(data[key]));
                break;
            }
        }
    }
}
function tabulateHorizontal(element, data, columns) {
    let table = d3.select(d3Id(element)).append('div')
        .attr('class', 'table okit-table');

    let thead = table.append('div').attr('class', 'thead');
    let tbody = table.append('div').attr('class', 'tbody');

    // append the header row
    thead.append('div')
        .attr('class', 'tr')
        .selectAll('div')
        .data(columns).enter()
        .append('div')
        .attr('class', 'th')
        .text(function (column) {
            return titleCase(replaceAll(column.label, '_', ' '));
        })
        .style("text-align", function (column) {
            return column.align;
        })
        .style("width", function (column) {
            return column.width;
        });

    // create a row for each object in the data
    let rows = tbody.selectAll('div')
        .data(data)
        .enter()
        .append('div')
        .attr('class', 'tr')

    // create a cell in each row for each column
    let cells = rows.selectAll('div')
        .data(function (row) {
            return columns.map(function (column) {
                if (typeof row[column.label] == 'number') {
                    let formatter = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    });
                    return {
                        column: column.label,
                        value: formatter.format(row[column.label]),
                        align: 'right'
                    };
                } else
                    return {
                        column: column.label,
                        value: titleCase(replaceAll(row[column.label], '_', ' ')),
                        align: 'left'
                    };
            });
        })
        .enter()
        .append('div')
        .attr('class', 'td')
        .text(function (d) {
            return d.value;
        })
        .style("white-space", "nowrap")
        // .style("flex-wrap", "nowrap")
        .style("text-align", function (d) {
            return d.align;
        });
    return table;
}
function handleDownloadBoM(event) {
    document.getElementById("hdnJson").value = JSON.stringify(okitJsonModel);
    document.getElementById("hidden_form").submit();
}
function handleLoadFromGIT(evt) {
    // Load from GIT
    $(jqId('modal_dialog_title')).text('Load From GIT');
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    let table = d3.select(d3Id('modal_dialog_body')).append('div').append('div')
        .attr('id', 'load_from_git')
        .attr('class', 'table okit-table okit-modal-dialog-table');
    let tbody = table.append('div').attr('class', 'tbody');
    // Git Repository
    let tr = tbody.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Git Repository URL:');
    tr.append('div').attr('class', 'td').append('select')
        .attr('id', 'git_repository')
        .on('change', () => {
                console.info('selected git name ' + $(jqId('git_repository')).val());
                handleLoadFromGITExec();
            })
        .append('option')
        .attr('value', 'select')
        .text('Select');

    //$(jqId('git_repository')).empty();
    let git_repository_filename_select = d3.select(d3Id('git_repository'));

    for (let git_setting of okitGitConfig.gitsections) {
        git_repository_filename_select.append('option').attr('value', git_setting['url']+'*'+git_setting['branch']).text(git_setting['label']);
    }

    // Load Files - GitFilename
    tr = tbody.append('div') .attr('class', 'tr');
    tr.append('div') .attr('class', 'td') .text('Select GIT File Name');
    tr.append('div') .attr('class', 'td') .append('select')
        .attr('id', 'git_repository_filename')
        .append('option')
        .attr('value', 'Retrieving')
        .text('Retrieving..........');



    // Save
    let save_button = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'load_from_git_button')
        .attr('type', 'button')
        .text('Submit');
    save_button.on("click", handleLoaddesignFromGITExec);
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}

function handleLoadFromGITExec(e) {
    okitJsonModel.git_repository = $(jqId('git_repository')).val();
    okitJsonModel.git_repository_filename = $(jqId('git_repository_filename')).val();
    $.ajax({
        type: 'post',
        url: 'loadfromgit',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(okitJsonModel),
        success: function (resp) {
            console.info('Response : ' + resp);
            response = JSON.parse(resp)
            $(jqId('git_repository_filename')).empty();
            let git_repository_filename_select = d3.select(d3Id('git_repository_filename'));
            for (file of response['fileslist']) {
                filename = file.split("/").splice(-1)
                filelabel = filename.toString().replace(/.json|.JSON/, '')
                git_repository_filename_select.append('option').attr('value', file).text(filelabel);
            }
        },
        error: function (xhr, status, error) {
            console.error('Status : ' + status)
            console.error('Error : ' + error)
            // Hide modal dialog
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
        }
    });

}

function handleLoaddesignFromGITExec(e) {
    okitJsonModel.git_repository = $(jqId('git_repository')).val();
    okitJsonModel.git_repository_filename = $(jqId('git_repository_filename')).val();
    if (okitJsonModel.git_repository_filename != 'Retrieving' && okitJsonModel.git_repository_filename != "") {
        loadTemplate(okitJsonModel.git_repository_filename)
        $(jqId('modal_dialog_wrapper')).addClass('hidden');
    }
}
