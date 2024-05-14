/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment Javascript');

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

function resetCompartment() {
    $("#toolbar_view_select").val('designer');
    handleSwitchToCompartmentView();
    newModel();
    newCompartmentView();
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
    // if (okitSettings.region && okitSettings.region != '') $(jqId('oci_link')).attr('href', `https://console.${okitSettings.region}.oraclecloud.com`)
    if (okitSettings.region && okitSettings.region != '') $(jqId('oci_link')).attr('href', `https://cloud.oracle.com/?region=${okitSettings.region}`)
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
        resetCompartment();
        // okitJsonModel = new OkitJson(JSON.stringify(recovered_model));
        newModel(JSON.stringify(recovered_model));
        newCompartmentView();
        displayOkitJson();
        displayCompartmentView();
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
    resetCompartment();
    newDiagram();
    redrawSVGCanvas();
    hideRecoverMenuItem();
}
function newDiagram() {
    console.log('Creating New Diagram');
    const compartment = {
        read_only: true,
        display_name: 'Deployment Compartment',
        description: 'Represents the deployment location for the resources specified within the design.',
        definition: 'Logical Compartment that represents the deployment location for the resources specified within the design. This compartment will not be created during the build process.'
    }
    const data = {compartments: [compartment]}
    newModel(data);
    newCompartmentView();
    // okitJsonView.newCanvas();
    // okitJsonView.newCompartment();
    // // Set Top Compartment as deployment compartment
    // const resource = okitJsonModel.getCompartments()[0]
    // resource.read_only = true;
    // resource.display_name = 'Deployment Compartment';
    // resource.description = 'Represents the deployment location for the resources specified within the design.'
    // resource.definition = 'Logical Compartment that represents the deployment location for the resources specified within the design. This compartment will not be created during the build process.'
    console.info(okitJsonView);
}
function newCompartmentView() {
    // okitJsonView = new OkitCompartmentJsonView(okitJsonModel, 'canvas-div', palette_svg);
    okitJsonView = OkitCompartmentJsonView.newView(okitJsonModel, okitOciData, resource_icons);
    loadVariablesDatalist()
}
// function newModel() {
//     okitJsonModel = new OkitJson();
// }
// function newRegionsModel() {
//     regionOkitJson = new OkitRegionsJson();
// }
function setTitleDescription() {
    okitJsonModel ? $('#json_title').val(okitJsonModel.title) : $('#json_title').val('');
    okitJsonModel ? $('#json_description').val(okitJsonModel.documentation) : $('#json_description').val('');
    okitJsonModel ? $('#freeform_terraform').val(okitJsonModel.user_defined.terraform) : $('#freeform_terraform').val('');
    okitJsonModel ? setTargetPlatform() : $('#deployment_platform').val('oci');
}
function updateJsonTitle() {
    okitJsonModel.title = $('#json_title').val();
}
function updateJsonDescription() {
    okitJsonModel.documentation = $('#json_description').val();
}
function updateFreeformTerraform() {
    okitJsonModel.user_defined.terraform = $('#freeform_terraform').val();
}
function handleTargetPlatformSelect() {
    okitJsonModel.metadata.platform = $('#deployment_platform').val();
    updatePaletteForPlatform();
    const selected = $("#toolbar_view_select").val();
    if (selected === 'terraform') okitTerraformView.draw();
}
function setTargetPlatform() {
    $('#deployment_platform').val(okitJsonModel.metadata.platform);
    updatePaletteForPlatform();
}
function updatePaletteForPlatform() {
    console.info(`Selected Platform ${okitJsonModel.metadata.platform}`)
    // $('.okit-palette-icon-div').addClass('hidden');
    // $('.menu-item').addClass('hidden');
    // $('.okit-palette-icon-group').addClass('hidden');
    $('.okit-target').addClass('hidden');
    $('.okit-target-row').addClass('collapsed');
    $(`.${okitJsonModel.metadata.platform}`).removeClass('hidden');
    $(`.${okitJsonModel.metadata.platform}`).removeClass('collapsed');
}
function loadVariablesDatalist() {
    $('#variables_datalist').empty()
    const datalist = d3.select('#variables_datalist')
    if (okitJsonModel) okitJsonModel.variables_schema.variables.forEach((v) => datalist.append('option').attr('value', `var.${v.name}`))
}

/*
** Handle Clone (Switch off Read Only)
*/
function handleEnableCreate(event) {
    if (okitJsonModel) {
        Object.values(okitJsonModel).filter((v) => Array.isArray(v)).forEach((v) => v.forEach((r) => r.read_only = false));
        okitJsonModel.title = `${okitJsonModel.title} - Read/Write Copy`;
        okitJsonView = OkitCompartmentJsonView.newView(okitJsonModel, okitOciData, resource_icons);
        redrawSVGCanvas();
    }
}

/*
** Load Existing Json
 */
function handleLoad(evt) {
    hideNavMenu();
    resetCompartment();
    /*
    ** Add Load File Handling
     */
    $('#files').off('change').on('change', handleFileSelect);
    $('#files').attr('accept', '.json');
    $('#files').prop('accept', 'application/json');
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
    // okitJsonModel = null
    newModel()
    hideRegionTabBar();
    clearRegionTabBar();
    // Obtain the read file data
    let fileString = evt.target.result;
    let fileJson = JSON.parse(fileString);
    console.info(fileJson);
    if (fileJson.hasOwnProperty('compartments')) {
        console.info('>> Single Region File')
        // newModel(fileString)
        // newCompartmentView();
        loadModelFromJson(fileString)
    } else {
        console.info('>> Multi Region File.')
        showRegionTabBar();
        for (let region in fileJson) {
            console.info('>>>> Add Tab For ' + region);
            addRegionTab(region);
            regionOkitJson[region] = new OkitJson(JSON.stringify(fileJson[region]));
            if (okitJsonModel === null) {
                // okitJsonModel = regionOkitJson[region];
                newModel(regionOkitJson[region]);
                newCompartmentView();
                $(jqId(regionTabName(region))).trigger("click");
            }
        }
    }
    displayOkitJson();
    displayCompartmentView();
    displayTreeView();
    hideRecoverMenuItem();
}
function errorHandler(evt) {
    console.info('Error: ' + evt.target.error.name);
}
/*
** Load Model From JSON
*/
function loadModelFromJson(model) {
    // console.debug('loadModelFromJson:', model)
    if (model) {
        newModel(model)
        newCompartmentView();
        displayOkitJson();
        displayCompartmentView();
        displayTreeView();
    }
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
** Save Model As 
 */
const ajaxCallFailed = ((xhr, status, error) => {
    console.error('Status : '+ status)
    console.error('Error : '+ error)
})
function displaySaveAsDialog(title, callback, root_dir='templates/user', placeholder='<Directory Path>/<Filename>.json', ext='.json', generate=false, model=undefined) {
    $(jqId('modal_dialog_title')).text(title);
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    // Add Save Options
    const table = d3.select(d3Id('modal_dialog_body')).append('div').append('div')
        .attr('class', 'table okit-table okit-modal-dialog-table');
    const tbody = table.append('div').attr('class', 'tbody');
    let tr = tbody.append('div').attr('class', 'tr')
    let td = tr.append('div').attr('class', 'td')
    td.text('Save To')
    td = tr.append('div').attr('class', 'td')
    // Template Directory
    const templates_select = td.append('select')
        .attr('id', 'user_template_select')
        .attr('size', '10')
        .on('click', () => {
            let name = $('#user_template_select').val().replace(root_dir, '')
            if (!name.endsWith(ext)) name = `${name}/${okitJsonModel.title.split(' ').join('_').toLowerCase()}${ext}`
            $('#template_file_name').val(name)
            $('#terraform_dir').val(name.replace(/\.[^/.]+$/, ''))
            if (model) {
                model.metadata.file.name = $('#template_file_name').val()
                model.metadata.file.terraform_dir = $('#terraform_dir').val()
            }
        })
    $.ajax({
        cache: false,
        type: 'get',
        url: `templates/load`,
        dataType: 'text', // Response Type
        contentType: 'application/json', // Sent Message Type
        data: {
            root_dir: root_dir
        }, // Arguments
        success: function(resp) {
            hierarchy = JSON.parse(resp)
            console.info(hierarchy)
            const add_dir = (select, depth, dir) => {
                dir.files.forEach(file => select.append('option').attr('style', `padding-left: ${depth * 1}em`).attr('value', `${dir.path}/${file.json}`).text(file.json))
                dir.dirs.forEach((d) => {
                    select.append('option').attr('style', `padding-left: ${depth * 1}em; font-weight: bolder`).attr('value', `${d.path}`).text(d.name)
                    add_dir(select, (depth + 1), d)
                })
            }
            add_dir(templates_select, 1, hierarchy)
        },
        error: function(xhr, status, error) {
            console.error('Status : '+ status)
            console.error('Error : '+ error)
        }
    });
    // Template name
    td.append('input')
        .attr('class', 'okit-input')
        .attr('id', 'template_file_name')
        .attr('name', 'template_file_name')
        .attr('type', 'text')
        .attr('placeholder', placeholder)
        .on('keydown', (e) => {
            if (d3.event.keyCode == 220) {
                d3.event.preventDefault()
            } else if (d3.event.keyCode == 32) {
                d3.event.preventDefault()
            }
        })
        .on('blur', () => {
            const file_name = $('#template_file_name').val().replaceAll(' ', '_').replaceAll('\\', '/')
            const terraform_dir = file_name.replace(/\.[^/.]+$/, '')
            $('#template_file_name').val(file_name)
            if (model) model.metadata.file.name = file_name
            if ($('#terraform_dir').val().trim() === '') {
                $('#terraform_dir').val(terraform_dir)
                if (model) model.metadata.file.terraform_dir = terraform_dir
            }
        });
    // Generate On Save
    tr = tbody.append('div').attr('class', `tr ${generate ? '' : 'collapsed'}`)
    td = tr.append('div').attr('class', 'td')
    td.append('input')
        .attr('id', 'generate_terraform_on_save')
        .attr('name', 'generate_terraform_on_save')
        .attr('type', 'checkbox')
        .on('change', () => {
            $('#terraform_dir').prop('readonly', !$('#generate_terraform_on_save').is(':checked'))
            if (model) model.metadata.file.generate_terraform = $('#generate_terraform_on_save').is(':checked')
            const file_name = $('#template_file_name').val().replaceAll(' ', '_').replaceAll('\\', '/')
            const terraform_dir = file_name.replace(/\.[^/.]+$/, '')
            if ($('#terraform_dir').val().trim() === '') {
                $('#terraform_dir').val(terraform_dir)
                if (model) model.metadata.file.terraform_dir = terraform_dir
            }
        })
    td.append('label')
        .attr('for', 'generate_terraform_on_save')
        .text('Generate Terraform');

    // Terraform Directory
    td = tr.append('div').attr('class', 'td')
    td.append('input')
        .attr('class', 'okit-input')
        .attr('id', 'terraform_dir')
        .attr('name', 'terraform_dir')
        .attr('type', 'text')
        .attr('readonly', true)
        .attr('placeholder', '<Directory Path>')
        .on('keydown', (e) => {
            if (d3.event.keyCode == 220) {
                d3.event.preventDefault()
            } else if (d3.event.keyCode == 32) {
                d3.event.preventDefault()
            }
        })
        .on('blur', () => {
            const terraform_dir = $('#terraform_dir').val().replaceAll(' ', '_').replaceAll('\\', '/')
            $('#terraform_dir').val(terraform_dir)
            if (model) model.metadata.file.terraform_dir = terraform_dir
        })
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_btn')
        .attr('type', 'button')
        .text('Save')
        .on('click', () => {
            const data = {
                generate: $('#generate_terraform_on_save').is(':checked'),
                root_dir: root_dir,
                template_file: $('#template_file_name').val(),
                terraform_dir: generate ? $('#terraform_dir').val() : $('#template_file_name').val().replace(/\.[^/.]+$/, '')
            }
            callback(data)
        });
    if (model) {
        $('#template_file_name').val(model.metadata.file.name)
        $('#terraform_dir').val(model.metadata.file.terraform_dir)
        $('#generate_terraform_on_save').prop('checked', model.metadata.file.generate_terraform)
        $('#terraform_dir').prop('readonly', !model.metadata.file.generate_terraform)
    }
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
function handleSaveAsTemplate(e) {
    const root_dir = 'templates/user'
    displaySaveAsDialog('Save as Template', () => {
        okitJsonModel.updated = getCurrentDateTime();
        const templateModel = okitJsonModel.clone()
        templateModel.metadata.file = templateModel.newFileData()
        $.ajax({
            type: 'post',
            url: 'template/save',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify({root_dir: root_dir, template_file: $('#template_file_name').val(), okit_json: templateModel}),
            success: function(resp) {
                console.info('Response : ' + resp);
                loadTemplatePanel();
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
    }, root_dir)
}
const loadTemplatePanel = () => {
    const id = 'templates_panel'
    $.ajax({
        cache: false,
        type: 'get',
        url: `panel/templates`,
        dataType: 'text', // Response Type
        contentType: 'application/json', // Sent Message Type
        data: {target: pca_mode ? 'pca-x9' : oci_mode ? 'oci' : ''},
        success: function(resp) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(resp, "text/html");
            const new_panel = doc.getElementById(id);
            const current_panel = document.getElementById(id);
            const template_panel = document.getElementById('designer_left_column')
            // Check if menu section already exists
            const hidden = $(`#${id}`).hasClass('hidden')
            $(`#${id}`).addClass('hidden')
            current_panel !== null ? current_panel.replaceWith(new_panel) : template_panel.appendChild(new_panel);
            if (!hidden) $(`#${id}`).removeClass('hidden')
        },
        error: function(xhr, status, error) {
            console.error('Status : '+ status)
            console.error('Error : '+ error)
        }
    });
}
/*
** Save Model to Git
 */
function handleSaveToGit(e) {
    const root_dir = 'git'
    displaySaveAsDialog('Save to Git', saveToGit, root_dir, '<Directory Path>/<Filename>.json', '.json', true, okitJsonModel)
}
const saveToGit = (data={}) => {
    okitJsonModel.updated = getCurrentDateTime();
    data.okit_json = okitJsonModel
    data.git = true
    $.ajax({
        type: 'post',
        url: 'template/save',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).done((resp) => {
        loadGitPanel()
        // Generate Terraform
        delete data.okit_json
        if (data.generate) saveAsTerraform(data)
    }).fail((xhr, status, error) => {
        ajaxCallFailed(xhr, status, error)
    }).always(() => {$(jqId('modal_dialog_wrapper')).addClass('hidden')})
}
const loadGitPanel = () => {
    const id = 'git_panel'
    $.ajax({
        cache: false,
        type: 'get',
        url: `panel/git`,
        dataType: 'text', // Response Type
        contentType: 'application/json', // Sent Message Type
    }).done((resp) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(resp, "text/html");
        const new_panel = doc.getElementById(id);
        const current_panel = document.getElementById(id);
        const template_panel = document.getElementById('designer_left_column')
        // Check if menu section already exists
        const hidden = $(`#${id}`).hasClass('hidden')
        $(`#${id}`).addClass('hidden')
        current_panel !== null ? current_panel.replaceWith(new_panel) : template_panel.appendChild(new_panel);
        if (!hidden) $(`#${id}`).removeClass('hidden')
    }).fail((xhr, status, error) => {ajaxCallFailed(xhr, status, error)})
}
/*
** Save Model to Container
 */
function handleSaveToContainer(e) {
    const root_dir = 'local'
    displaySaveAsDialog('Save to Container', saveToContainer, root_dir, '<Directory Path>/<Filename>.json', '.json', true, okitJsonModel)
}
const saveToContainer = (data={}) => {
    okitJsonModel.updated = getCurrentDateTime();
    data.okit_json = okitJsonModel
    $.ajax({
        type: 'post',
        url: 'template/save',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).done((resp) => {
        loadFileSystemPanel()
        // Generate Terraform
        delete data.okit_json
        if (data.generate) saveAsTerraform(data)
    }).fail((xhr, status, error) => {
        ajaxCallFailed(xhr, status, error)
    }).always(() => {$(jqId('modal_dialog_wrapper')).addClass('hidden')})
}
const loadFileSystemPanel = () => {
    const id = 'local_panel'
    $.ajax({
        cache: false,
        type: 'get',
        url: `panel/local`,
        dataType: 'text', // Response Type
        contentType: 'application/json', // Sent Message Type
    }).done((resp) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(resp, "text/html");
        const new_panel = doc.getElementById(id);
        const current_panel = document.getElementById(id);
        const template_panel = document.getElementById('designer_left_column')
        // Check if menu section already exists
        const hidden = $(`#${id}`).hasClass('hidden')
        $(`#${id}`).addClass('hidden')
        current_panel !== null ? current_panel.replaceWith(new_panel) : template_panel.appendChild(new_panel);
        if (!hidden) $(`#${id}`).removeClass('hidden')
    }).fail((xhr, status, error) => {
        ajaxCallFailed(xhr, status, error)
    })
}
/*
** Save Model as Terraform
 */
function handleSaveAsTerraform(e) {
    const root_dir = 'local'
    const placeholder = '<Directory Path>'
    const ext = ''
    displaySaveAsDialog('Save as Terraform', saveAsTerraform, root_dir, placeholder, ext)
}

const saveAsTerraform = (data={}) => {
    console.info('saveAsTerraform Data:', data)
    okitJsonModel.updated = getCurrentDateTime();
    data.design = JSON.stringify(okitJsonModel)
    data.destination = 'file'
    data.directory = data.terraform_dir
    okitJsonModel.validate((results) => {
        if (results.valid) {
            $.ajax({
                cache: false,
                type: 'get',
                url: 'export/terraform',
                dataType: 'text',
                contentType: 'application/json',
                data: data
            }).done((resp) => {
                console.info(`Terraform generated and saved to ${data.terraform_dir}`)
            }).fail((xhr, status, error) => {
                ajaxCallFailed(xhr, status, error)
            }).always(() => {$(jqId('modal_dialog_wrapper')).addClass('hidden')})
        } else {
            validationFailedNotification();
        }        
    })
}
/*
** Save Model as Markdown
 */
function handleSaveAsMarkdown(e) {
    const root_dir = 'local'
    const placeholder = '<Directory Path>/<Filename>.md'
    const ext = '.md'
    displaySaveAsDialog('Save as Markdown', () => {
        okitJsonModel.updated = getCurrentDateTime();
        okitJsonModel.validate((results) => {
            if (results.valid) {
                $.ajax({
                    type: 'get',
                    url: 'export/terraform',
                    dataType: 'text',
                    contentType: 'application/json',
                    data: {
                        root_dir: root_dir, 
                        directory: $('#template_file_name').val(),
                        destination: 'terraform',
                        design: JSON.stringify(okitJsonModel)
                    },
                    success: function(resp) {
                        console.info('handleSaveAsTerraform Response : ' + resp);
                        console.info(JSON.parse(resp));
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
            } else {
                validationFailedNotification();
            }        
        })
    }, root_dir, placeholder, ext)
}
/*
** Save Model As Template
 */
/*
** Redraw / Redisplay the existing Json
 */
function handleRedraw(evt) {
    hideNavMenu();
    redrawSVGCanvas();
    redrawTerraformView()
    return false;
}
function redrawSVGCanvas(recalculate=false) {
    if (recalculate) {resetRecalculateFlag();}
    displayCompartmentView();
    // displayOkitJson();
}
function redrawTerraformView() {
    if (okitTerraformView) okitTerraformView.draw()
}
/*
** Toolbar Handlers
 */
const slideLeftPanel = (id) => {
    $(`.okit-left-side-panel:not(#${id})`).addClass('hidden')
    $(`#${id}`).toggleClass('hidden')
    $(`.okit-left-side-panel:not(.hidden)`).length === 0 ? $('#designer_left_column').addClass('okit-slide-hide-left') : $('#designer_left_column').removeClass('okit-slide-hide-left')
}
const slideRightPanel = (id) => {
    if (id) {
        $(`.okit-right-side-panel:not(#${id})`).addClass('okit-slide-hide-right')
        $(`#${id}`).toggleClass('okit-slide-hide-right')
    } else {
        $(`.okit-right-side-panel`).addClass('okit-slide-hide-right')
    }
}
/* 
** Settings
 */
function handleSettings(evt) {
    // $('#settings_panel').toggleClass('okit-slide-hide-right')
    slideRightPanel('settings_panel')
    okitSettings.buildPanel('settings_panel', true);
    return false;
}
/*
** Validate Model
 */
function handleValidate(evt) {
    // $('#validation_panel').toggleClass('okit-slide-hide-right')
    slideRightPanel('validation_panel')
    okitJsonModel.validate(displayValidationResults);
    // hideNavMenu();
    // $('#toggle_validation_button').removeClass('okit-bar-panel-displayed');
    // $('#toggle_validation_button').click();
    return false;
}
/*
** Estimate Cost
 */
handleEstimateCost = () => {$("#toolbar_view_select").val('bom');handleViewSelect()}
function handleEstimateCost1(evt) {
    // $('#cost_estimate_panel').toggleClass('okit-slide-hide-right')
    slideRightPanel('cost_estimate_panel')
    $(jqId(COST_ESTIMATE_PANEL)).empty();
    $(jqId(COST_ESTIMATE_PANEL)).text('Estimating...');
    okitJsonModel.estimateCost(displayPricingResults);
    // hideNavMenu();
    // $('#toggle_cost_estimate_button').removeClass('okit-bar-panel-displayed');
    // $('#toggle_cost_estimate_button').click();
    return false;
}
/*
** Display Properties
 */
function handleOpenProperties(evt) {
    // $('#properties_panel').toggleClass('okit-slide-hide-right')
    slideRightPanel('properties_panel')
    // hideNavMenu();
    // $('#toggle_properties_button').removeClass('okit-bar-panel-displayed');
    // $('#toggle_properties_button').click();
    return false;
}
/* 
** Documentation
 */
function handleDocumentation(evt) {
    // $('#documentation_panel').toggleClass('okit-slide-hide-right')
    slideRightPanel('documentation_panel')
    return false;
}
/*
** Free Form Terraform
 */
function handleFreeformTerraform(evt) {
    loadGlobalTags()
    slideRightPanel('terraform_panel')
    return false;
}
/*
** Global Tags
 */
function handleGlobalTags(evt) {
    slideRightPanel('global_tags_panel')
    return false;
}
function loadGlobalTags() {
    $('#global_freeform_tags_tbody').empty()
    $('#global_defined_tags_tbody').empty()
    if (okitJsonModel.freeform_tags) {
        const tbody = d3.select('#global_freeform_tags_tbody')
        for (const [key, value] of Object.entries(okitJsonModel.freeform_tags)) {
            let tr = tbody.append('div').attr('class', 'tr')
            tr.append('div').attr('class', 'td').append('label').text(key)
            tr.append('div').attr('class', 'td').append('label').text(value)
            tr.append('div').attr('class', 'td delete-tag action-button-background delete').on('click', () => {
                delete okitJsonModel.freeform_tags[key];
                loadGlobalTags()
                d3.event.stopPropagation()
            })
        }
    }
    if (okitJsonModel.defined_tags) {
        const tbody = d3.select('#global_defined_tags_tbody')
        for (const [namespace, tags] of Object.entries(okitJsonModel.defined_tags)) {
            for (const [key, value] of Object.entries(tags)) {
                let tr = tbody.append('div').attr('class', 'tr')
                tr.append('div').attr('class', 'td').append('label').text(namespace)
                tr.append('div').attr('class', 'td').append('label').text(key)
                tr.append('div').attr('class', 'td').append('label').text(value)
                tr.append('div').attr('class', 'td  delete-tag action-button-background delete').on('click', () => {
                    delete okitJsonModel.defined_tags[namespace][key];
                    if (Object.keys(okitJsonModel.defined_tags[namespace]).length === 0) {delete okitJsonModel.defined_tags[namespace];}
                    loadGlobalTags()
                    d3.event.stopPropagation()
                })
            }
        }
    }
}
function handleAddGlobalFreeformTag() {
    console.info('Adding Global Freeform Tag')
    $('#data_entry_panel_title').text('Add Freeform Tag')
    $('#data_entry_panel_body').empty()
    $('#data_entry_panel_footer').empty()
    // Add input elements
    const body = d3.select('#data_entry_panel_body')
    let div = body.append('div').attr('class', 'okit-data-entry-text-property')
    div.append('div').append('label').text('Key')
    div.append('div').append('input').attr('type', 'text').attr('id', 'gdep_tag_key').attr('placeholder', 'Tag Key (No white space)')
    div = body.append('div').attr('class', 'okit-data-entry-text-property')
    div.append('div').append('label').text('Value')
    div.append('div').append('input').attr('type', 'text').attr('id', 'gdep_tag_value').attr('placeholder', 'Tag Value')
    // Add Footer button
    const footer = d3.select('#data_entry_panel_footer')
    footer.append('div').append('button').attr('type', 'button').text('Add Tag').on('click', () => {
        const key = $('#gdep_tag_key').val().replace(/\s+/g, '_')
        const val = $('#gdep_tag_value').val()
        if (key.length > 0 && val.length > 0) okitJsonModel.freeform_tags[key] = val
        loadGlobalTags()
        $('#data_entry_panel').addClass('okit-slide-hide-right')
    })
    // Display Panel
    $('#data_entry_panel').removeClass('okit-slide-hide-right')
}
function handleAddGlobalDefinedTag() {
    console.info('Adding Global Defined Tag')
    $('#data_entry_panel_title').text('Add Defined Tag')
    $('#data_entry_panel_body').empty()
    $('#data_entry_panel_footer').empty()
    // Add input elements
    const body = d3.select('#data_entry_panel_body')
    let div = body.append('div').attr('class', 'okit-data-entry-text-property')
    div.append('div').append('label').text('Namespace')
    div.append('div').append('input').attr('type', 'text').attr('id', 'gdep_tag_namespace').attr('placeholder', 'Tag Namespace (No white space)').attr('list', 'global_tag_namespaces')
    const global_tag_namespaces = div.append('datalist').attr('id', 'global_tag_namespaces')
    if (okitJsonModel.defined_tags) Object.keys(okitJsonModel.defined_tags).forEach((namespace) => global_tag_namespaces.append('option').attr('value', namespace))
    div = body.append('div').attr('class', 'okit-data-entry-text-property')
    div.append('div').append('label').text('Key')
    div.append('div').append('input').attr('type', 'text').attr('id', 'gdep_tag_key').attr('placeholder', 'Tag Key (No white space)')
    div = body.append('div').attr('class', 'okit-data-entry-text-property')
    div.append('div').append('label').text('Value')
    div.append('div').append('input').attr('type', 'text').attr('id', 'gdep_tag_value').attr('placeholder', 'Tag Value')
    // Add Footer button
    const footer = d3.select('#data_entry_panel_footer')
    footer.append('div').append('button').attr('type', 'button').text('Add Tag').on('click', () => {
        const namespace = $('#gdep_tag_namespace').val().replace(/\s+/g, '_')
        const key = $('#gdep_tag_key').val().replace(/\s+/g, '_')
        const val = $('#gdep_tag_value').val()
        if (namespace.length > 0 && key.length > 0 && val.length > 0) okitJsonModel.defined_tags[namespace] ? okitJsonModel.defined_tags[namespace][key] = val : okitJsonModel.defined_tags[namespace] = {key: val}
        loadGlobalTags()
        $('#data_entry_panel').addClass('okit-slide-hide-right')
    })
    // Display Panel
    $('#data_entry_panel').removeClass('okit-slide-hide-right')
}
/*
** Cancel Data Entry
*/
function handleCancelDataEntry() {
    $('#data_entry_panel').addClass('okit-slide-hide-right')
}
/*
** Three Dots Menu
 */
function handleThreeDotsMenu(evt) {
    // slideRightPanel('threedots_menu_panel')
    $(`#threedots_menu_panel`).toggleClass('okit-slide-hide-right')
    return false;
}
/*
** Load Model From Template
 */
function loadTemplate(template_url) {
    hideNavMenu();
    resetCompartment();
    $.ajax({
        cache: false,
        type: 'get',
        url: 'template/load',
        dataType: 'text', // Response Type
        contentType: 'application/json', // Sent Message Type
        data: {
            template_file: template_url
        }, // Query Arguments
        success: function(resp) {
            // okitJsonModel = new OkitJson(resp);
            newModel(resp)
            newCompartmentView();
            displayOkitJson();
            displayCompartmentView();
            displayTreeView();
            slideLeftPanel('icons_palette')
            // Display Documentation
            slideRightPanel('documentation_panel')
        },
        error: function(xhr, status, error) {
            console.error('Status : '+ status);
            console.error('Error  : '+ error);
        }
    });
}
/*
** Import Model From Template
 */
function importTemplate(template_url, event) {
    console.info('Import Template Event', event)
    console.info('<<<<<< NEED TO RESOLVE TOP LEVEL SVG REPRESENTATION >>>>>>')
    return
    // event = event | window.event
    event.preventDefault()
    event.stopPropagation()
    const right_coll_offset = $('#designer_right_column').offset()
    const position = {top: event.pageY - right_coll_offset.top - 10, left: event.pageX - 10};
    console.info('Context Position', position, right_coll_offset)
    $(jqId("context-menu")).empty();
    $(jqId("context-menu")).css(position);
    const contextmenu = d3.select(d3Id("context-menu"));
    contextmenu.on('mouseenter', function () {
            $(jqId("context-menu")).removeClass("hidden");
        })
        .on('mouseleave', function () {
            $(jqId("context-menu")).addClass("hidden");
        });
    const ul = contextmenu.append('ul').attr('class', 'okit-context-menu-list');
    ul.append('li').append('a')
                    .attr('class', 'parent-item')
                    .attr('href', 'javascript:void(0)')
                    .text('Import')
                    .on('click', () => {
                        $.ajax({
                            cache: false,
                            type: 'get',
                            url: 'template/load',
                            dataType: 'text', // Response Type
                            contentType: 'application/json', // Sent Message Type
                            data: JSON.stringify({template_file: template_url}),
                            success: function(resp) {
                                okitJsonModel.load(JSON.parse(resp))
                                okitJsonView.load()
                                displayOkitJson();
                                displayCompartmentView();
                                displayTreeView();
                            },
                            error: function(xhr, status, error) {
                                console.error('Status : '+ status);
                                console.error('Error  : '+ error);
                            }
                        });
                        $(jqId("context-menu")).addClass("hidden");
                    });
    $(jqId("context-menu")).removeClass("hidden");

}
/*
** Query OCI
 */
function displayQueryDialog(title='Query OCI', btn_text='Query', callback=undefined, loadCompartments=loadOCICompartments, oci=true) {
    $(jqId('modal_dialog_title')).text(title);
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
    let tr = tbody.append('div').attr('id', 'config_profile_row')
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
                loadHeaderConfigDropDown()
                // Clear Existing Compartments
                okitOciData.setCompartments([]);
                loadCompartments();
                // loadOCICompartments();
                loadRegions(selectQueryLastUsedRegion);
            });
    for (let section of okitOciConfig.getSections()) {
        profile_select.append('option')
            .attr('value', section)
            .text(section);
    }
    if (okitOciConfig.sections.length === 1 && okitOciConfig.sections[0] === 'InstancePrincipal') $('#config_profile_row').addClass('collapsed')
    // Region Ids
    tr = tbody.append('div')
        .attr('class', 'tr');
    if (btn_text === 'Query' && oci) {
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
                    okitSettings.query_regions = $(jqId('query_region_id')).val();
                    okitSettings.save();
                })
                .append('option')
                    .attr('value', 'Retrieving')
                    .text('Retrieving..........');
    } else {
        tr.append('div')
            .attr('class', 'td')
            .text('Region');
        tr.append('div')
            .attr('class', 'td')
            .append('select')
                .attr('id', 'query_region_id')
                .on('change', () => {
                    console.info('Region Select ' + $(jqId('query_region_id')).val());
                    okitSettings.query_regions = $(jqId('query_region_id')).val();
                    okitSettings.save();
                })
                .append('option')
                    .attr('value', 'Retrieving')
                    .text('Retrieving..........');
    }
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
                    // loadOCICompartments();
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
        .attr('checked', 'checked')
        .attr('type', 'checkbox');
    td.append('label')
        .attr('for', 'fast_discovery')
        .text('Fast Discovery');
    if (developer_mode) $(jqId('fast_discovery_row')).removeClass('collapsed');
    // $(jqId('fast_discovery_row')).removeClass('collapsed');
    // Submit Button
    let submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text(btn_text)
        .on('click', callback);
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
function handleQueryOCI(e) {
    hideNavMenu();
    $("#toolbar_view_select").val('designer');
    handleSwitchToCompartmentView();
    // Display Dialog
    displayQueryDialog('Query OCI', 'Query', () => {showQueryOCIResults()});
    // Set Query Config Profile
    // console.info('Profile : ' + okitSettings.profile);
    // if (!okitSettings.profile) {
    //     okitSettings.profile = 'DEFAULT';
    // }
    // console.info('Profile : ' + okitSettings.profile);
    okitSettings.home_region_key = '';
    okitSettings.home_region = '';
    ociRegions = [];
    // Load Previous Profile
    // $(jqId('config_profile')).val(okitSettings.profile);
    $(jqId('config_profile')).val($(`#console_header_config_select`).val());
    // Load Compartment Select
    loadOCICompartments();
    // Load Region Select
    loadRegions(selectQueryLastUsedRegion);
}
function handleImportFromOCI(e) {
    hideNavMenu();
    $("#toolbar_view_select").val('designer');
    handleSwitchToCompartmentView();
    // Display Dialog
    displayQueryDialog('Import From OCI', 'Introspect', () => {showImportOCIResults()});
    // Set Query Config Profile
    // console.info('Profile : ' + okitSettings.profile);
    // if (!okitSettings.profile) {
    //     okitSettings.profile = 'DEFAULT';
    // }
    // console.info('Profile : ' + okitSettings.profile);
    okitSettings.home_region_key = '';
    okitSettings.home_region = '';
    ociRegions = [];
    // Load Previous Profile
    // $(jqId('config_profile')).val(okitSettings.profile);
    $(jqId('config_profile')).val($(`#console_header_config_select`).val());
    // Load Compartment Select
    loadOCICompartments();
    // Load Region Select
    loadRegions(selectQueryLastUsedRegion);
}
// TODO: Delete
function loadCompartmentsDeprecated() {
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
            cache: false,
            type: 'get',
            url: 'oci/compartment',
            dataType: 'text',
            contentType: 'application/json',
            // data: JSON.stringify({config_profile: $(jqId('config_profile')).val()}),
            data: {
                config_profile: $(jqId('config_profile')).val()
            }, // Arguments
            success: function (resp) {
                let jsonBody = JSON.parse(resp)
                okitOciData.setCompartments(jsonBody);
                $(jqId('query_compartment_id')).empty();
                let compartment_select = d3.select(d3Id('query_compartment_id'));
                for (let compartment of jsonBody) {
                    // console.info(compartment['display_name']);
                    // console.info(compartment['canonical_name']);
                    compartment_select.append('option')
                        .attr('value', compartment['id'])
                        .text(compartment['canonical_name']);
                    if (okitSettings.home_region_key === '') {
                        okitSettings.home_region_key = compartment.home_region_key;
                    }
                }
                selectQueryLastUsedCompartment();
                loadRegions(selectQueryLastUsedRegion);
            },
            error: function (xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
            }
        });
    }
}
function loadOCICompartments() {
    // Clear Select
    let select = $(jqId('query_compartment_id'));
    $(select).empty();
    select.append($('<option>').attr('value', 'Retrieving').text('Retrieving..........'));
    if (okitOciData.getCompartments().length > 0) {
        loadQueryCompartmentsSelect()
    } else {
        const profile = $(jqId('config_profile')).val()
        const section = okitOciConfig.getSection(profile)
        const config = section && section.session ? okitSessionOciConfigs.configs[profile] : {}
        $.ajax({
            cache: false,
            type: 'get',
            url: `oci/compartments/${profile}`,
            dataType: 'text',
            contentType: 'application/json',
            data: {
                config_profile: profile,
                config: JSON.stringify(config),
            } // Arguments
        }).done((resp) => {
            const compartments = JSON.parse(resp)
            okitOciData.setCompartments(compartments)
            loadQueryCompartmentsSelect()
            // loadRegions(selectQueryLastUsedRegion);
        }).fail((xhr, status, error) => {
            console.error('Status : ' + status);
            console.error('Error  : ' + error);
        }).always(() => {})
    }
}
function loadQueryCompartmentsSelect() {
    // Clear Select
    let select = $(jqId('query_compartment_id'));
    $(select).empty();
    if (okitOciData.getCompartments().length > 0) {
        let compartment_select = d3.select(d3Id('query_compartment_id'));
        for (let compartment of okitOciData.getCompartments()) {
                // console.info(compartment['display_name']);
                // console.info(compartment['canonical_name']);
                compartment_select.append('option')
                .attr('value', compartment['id'])
                .text(compartment['canonical_name']);
                if (okitSettings.home_region_key === '') {
                    okitSettings.home_region_key = compartment.home_region_key;
                }
            }
        selectQueryLastUsedCompartment();
     } else {
         console.warn('No Compartments Found')
     }
}
function loadRegions(callback) {
    // Clear Select
    let select = $(jqId('query_region_id'));
    $(select).empty();
    let region_select = d3.select(d3Id('query_region_id'));
    for(let region of okitRegions.getRegions() ){
        region_select.append('option')
            .attr('value', region['name'])
            .text(region['display_name']);
    }
    callback()
    // selectQueryLastUsedRegion();
}
function selectQueryHomeRegion() {
    if (okitSettings.home_region_key !== '') {
        for (let region of ociRegions.getRegions()) {
            if (okitSettings.home_region_key === region.key) {
                $(jqId('query_region_id')).val(region.name);
                break;
            }
        }
    }
}
function selectQueryLastUsedRegion() {
    if (okitSettings.query_regions && okitSettings.query_regions !== '') {
        $(jqId('query_region_id')).val(okitSettings.query_regions);
        $(jqId('query_region_id')).change();
    } else {
        $(jqId('query_region_id')).val(okitRegions.getHomeRegion().id);
        $(jqId('query_region_id')).change();
    }
}
function selectRMLastUsedRegion() {
    if (okitSettings.resource_manager_region && okitSettings.resource_manager_region !== '') {
        $(jqId('query_region_id')).val(okitSettings.resource_manager_region);
        $(jqId('query_region_id')).change();
    } else {
        $(jqId('query_region_id')).val(okitRegions.getHomeRegion().id);
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
function showQueryOCIResults() {
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
    newCompartmentView();
    okitJsonView.newCanvas();
    console.info('Regions Ids : ' + regions);
    // newRegionsModel();
    if (regions.length > 0) {
        $(jqId('modal_loading_wrapper')).removeClass('hidden');
        // okitOCIQuery = new OkitOCIQuery(regions, okitSettings.fast_discovery);
        okitOCIQuery = new OkitOCIQuery(regions, request.fast_discovery);
        // Add Tabs
        $(jqId('region_progress')).empty();
        if (regions.length > 1) {
            for (const [i, region] of regions.entries()) {
                addRegionTab(region);
                addRegionTabProgress(region);
                addRegionProgressCheckbox(region);
            }
            $(jqId('file-save-regional-menu-item-li')).removeClass('hidden');
            $(jqId(regionTabName(regions[0]))).trigger("click");
        }
        okitOCIQuery.query(request, function(region) {
            console.info('Complete ' + region);
            // okitJsonModel = regionOkitJson[region];
            newModel(regionOkitJson[region]);
            newCompartmentView();
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
function showImportOCIResults() {
    console.info('Generating Import Oci Results');
    let regions = [$(jqId('query_region_id')).val()];
    let request = {};
    request.compartment_id = $(jqId('query_compartment_id')).val();
    request.compartment_name = $(`${jqId('query_compartment_id')} option:selected`).text();
    request.config_profile = $(jqId('config_profile')).val();
    request.sub_compartments = $(jqId('include_sub_compartments')).is(':checked');
    request.fast_discovery = $(jqId('fast_discovery')).is(':checked');
    request.region = '';
    console.info('Regions Ids : ' + regions);
    // newRegionsModel();
    if (regions.length > 0) {
        $(jqId('modal_loading_wrapper')).removeClass('hidden');
        okitOCIQuery = new OkitOCIQuery(regions, request.fast_discovery);
        // Add Tabs
        $(jqId('region_progress')).empty();
        okitOCIQuery.query(request, function(region) {
            console.info('Complete ' + region);
            $(jqId('modal_loading_wrapper')).addClass('hidden');
            slideLeftPanel('oci_import_panel');
            const importView = new OkitOciImportView(regionOkitJson[region], okitJsonModel)
            importView.draw()
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
function loadPCACompartments() {
    // Clear Select
    let select = $(jqId('query_compartment_id'));
    $(select).empty();
    select.append($('<option>').attr('value', 'Retrieving').text('Retrieving..........'));
    if (okitOciData.getCompartments().length > 0) {
        loadQueryCompartmentsSelect()
    } else {
        const profile = $(jqId('config_profile')).val()
        $.ajax({
            cache: false,
            type: 'get',
            url: `pca/compartments/${profile}`,
            dataType: 'text',
            contentType: 'application/json',
            data: {
                config_profile: $(jqId('config_profile')).val()
            } // Arguments
        }).done((resp) => {
            const compartments = JSON.parse(resp)
            okitOciData.setCompartments(compartments)
            loadQueryCompartmentsSelect()
            // loadRegions(selectQueryLastUsedRegion);
        }).fail((xhr, status, error) => {
            console.error('Status : ' + status);
            console.error('Error  : ' + error);
        }).always(() => {})
    }
}
/*
** Query C3
*/
function handleQueryC3(e) {
    hideNavMenu();
    $("#toolbar_view_select").val('designer');
    handleSwitchToCompartmentView();
    // Display Dialog
    displayQueryDialog('Query C3', 'Query', () => {queryPCA(showQueryPCAResults)}, loadPCACompartments, false);
    // Set Query Config Profile
    okitSettings.home_region_key = '';
    okitSettings.home_region = '';
    ociRegions = [];
    // Load Previous Profile
    $(jqId('config_profile')).val($(`#console_header_config_select`).val());
    // Load Compartment Select
    loadPCACompartments();
    // Load Region Select
    loadRegions(selectQueryLastUsedRegion);
}
function handleImportFromC3(e) {
    hideNavMenu();
    $("#toolbar_view_select").val('designer');
    handleSwitchToCompartmentView();
    // Display Dialog
    displayQueryDialog('Import From C3', 'Introspect', () => {queryPCA(showImportResults)}, loadPCACompartments, false);
    // Set Query Config Profile
    okitSettings.home_region_key = '';
    okitSettings.home_region = '';
    ociRegions = [];
    // Load Previous Profile
    $(jqId('config_profile')).val($(`#console_header_config_select`).val());
    // Load Compartment Select
    loadPCACompartments();
    // Load Region Select
    loadRegions(selectQueryLastUsedRegion);
}
/*
** Query PCA-X9
*/
function handleQueryPCA(e) {
    hideNavMenu();
    $("#toolbar_view_select").val('designer');
    handleSwitchToCompartmentView();
    // Display Dialog
    displayQueryDialog('Query PCA-X9', 'Query', () => {queryPCA(showQueryPCAResults)}, loadPCACompartments, false);
    // Set Query Config Profile
    okitSettings.home_region_key = '';
    okitSettings.home_region = '';
    ociRegions = [];
    // Load Previous Profile
    $(jqId('config_profile')).val($(`#console_header_config_select`).val());
    // Load Compartment Select
    loadPCACompartments();
    // Load Region Select
    loadRegions(selectQueryLastUsedRegion);
}
function handleImportFromPCA(e) {
    hideNavMenu();
    $("#toolbar_view_select").val('designer');
    handleSwitchToCompartmentView();
    // Display Dialog
    displayQueryDialog('Import From PCA', 'Introspect', () => {queryPCA(showImportResults)}, loadPCACompartments, false);
    // Set Query Config Profile
    okitSettings.home_region_key = '';
    okitSettings.home_region = '';
    ociRegions = [];
    // Load Previous Profile
    $(jqId('config_profile')).val($(`#console_header_config_select`).val());
    // Load Compartment Select
    loadPCACompartments();
    // Load Region Select
    loadRegions(selectQueryLastUsedRegion);
}
function queryPCA(callback=undefined) {
    console.info('Querying PCA-X9');
    const regions = $(jqId('query_region_id')).val();
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
    newCompartmentView();
    okitJsonView.newCanvas();
    console.info('Regions Ids : ' + regions);
    console.info(`Request : ${request}`);
    // newRegionsModel();
    if (regions.length > 0) {
        $(jqId('modal_loading_wrapper')).removeClass('hidden');
        okitPCAQuery = new OkitPCAQuery(regions, request.fast_discovery);
        $(jqId('region_progress')).empty();
        okitPCAQuery.query(request, callback, function (region) {
            $(jqId(regionCheckboxName(region))).prop('checked', true);
            removeRegionTabProgress(region);
        }, () => $(jqId('modal_loading_wrapper')).addClass('hidden'));
    } else {
        console.info('Region Not Selected.');
    }
    $(jqId('modal_dialog_wrapper')).addClass('hidden');
    hideRecoverMenuItem();
}
function showQueryPCAResults(region) {
    $(jqId('modal_loading_wrapper')).addClass('hidden');
    console.info('Show PCA Query Results');
    console.info('Complete ' + region);
    console.info(regionOkitJson[region])
    // okitJsonModel = regionOkitJson[region];
    newModel(regionOkitJson[region]);
    newCompartmentView();
    redrawSVGCanvas(region);
    displayTreeView();
}
function showImportResults(region) {
    $(jqId('modal_loading_wrapper')).addClass('hidden');
    console.info('Show PCA Import Results');
    console.info('Complete ' + region);
    slideLeftPanel('oci_import_panel');
    const importView = new OkitOciImportView(regionOkitJson[region], okitJsonModel)
    importView.draw()
    hideRecoverMenuItem();
}
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
    const name = okitJsonModel.compartments[0]['name'].replaceAll(' ', '');
    // let filename = name + '.svg';
    // if (okitSettings.is_timestamp_files) {
    //     filename = name + getTimestamp() + '.svg';
    // }
    const filename = `${name}${okitSettings.is_timestamp_files ? getTimestamp() : ''}.svg`
    saveSvg(okitcanvas, filename);
}
function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    // Add Theme Styles
    Object.values(document.styleSheets).forEach((sheet) => {
        if (sheet.href && sheet.href.includes('theme.css')) {
            // Object.values(sheet.cssRules).forEach((rule) => console.info(rule.cssText))
            const style = document.createElement('style')
            style.setAttribute("type", "text/css")
            style.innerText = Object.values(sheet.cssRules).reduce((r, c) => `${r}${c.cssText} `, '')
            console.info(style)
            svgEl.insertBefore(style, svgEl.children[1])
        }
    })
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
            // okitJsonModel = regionOkitJson[region];
            newModel(regionOkitJson[region]);
            newCompartmentView();
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
    // $(jqId(JSON_MODEL_PANEL)).html('<pre><code>' + JSON.stringify(okitJsonModel, null, 2) + '</code></pre>');
    // $(jqId(JSON_VIEW_PANEL)).html('<pre><code>' + JSON.stringify(okitJsonView, null, 2) + '</code></pre>');
    // $(jqId(JSON_REGION_PANEL)).html('<pre><code>' + JSON.stringify(regionOkitJson, null, 2) + '</code></pre>');
}
/*
** Draw Canvas
 */
function displayCompartmentView() {
    okitJsonView.draw();
    // redrawViews()
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
    const okitValidationPanel = new OkitValidationPanel(results)
}
function displayValidationResultsDeprecated(results) {
    console.info('Displaying Validation Results', results);
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
            okitJsonView.getResource(error.id).loadProperties()
            handleOpenProperties();
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
            okitJsonView.getResource(warning.id).loadProperties()
            handleOpenProperties();
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
            okitJsonView.getResource(warning.id).loadProperties()
            handleOpenProperties();
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

function handleRefreshDropdownData(event) {
    hideNavMenu();
    event = event || window.event;
    event.stopPropagation()
    okitRegions.clearLocalStorage()
    // okitOciData.clearLocalStorage()
    okitOciData.clear()
    okitRegions.load(okitSettings.profile)
    okitOciData.load(okitSettings.profile, okitSettings.region)
}
