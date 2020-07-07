/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Javascript');

/*
 * Define designer working variables
 */
const ROOT_CANVAS_ID = 'canvas';
const PROPERTIES_PANEL = 'properties_panel';
const SETTINGS_PANEL = 'settings_panel';
const JSON_PANEL = 'json_panel';
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
    okitJson = new OkitJson();
    regionOkitJson = {};
    clearRegionTabBar();
    hideRegionTabBar();
    $(jqId(PROPERTIES_PANEL)).load('propertysheets/empty.html');
    displayOkitJson();
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
** New Canvas
 */
function handleNew(evt) {
    hideNavMenu();
    resetDesigner();
    newDiagram();
    redrawSVGCanvas();
}
function newDiagram() {
    console.groupCollapsed('Creating New Diagram');
    okitJson = new OkitJson();
    newCanvas();
    okitJson.newCompartment();
    console.groupEnd();
}
/*
** Load Existing Json
 */
function handleLoad(evt) {
    hideNavMenu();
    resetDesigner();
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
    okitJson = null
    hideRegionTabBar();
    clearRegionTabBar();
    // Obtain the read file data
    let fileString = evt.target.result;
    let fileJson = JSON.parse(fileString);
    if (fileJson.hasOwnProperty('compartments')) {
        console.info('>> Single Region File')
        okitJson = new OkitJson(fileString);
    } else {
        console.info('>> Multi Region File.')
        showRegionTabBar();
        for (let region in fileJson) {
            console.info('>>>> Add Tab For ' + region);
            addRegionTab(region);
            regionOkitJson[region] = new OkitJson(JSON.stringify(fileJson[region]));
            if (okitJson === null) {
                okitJson = regionOkitJson[region];
                $(jqId(regionTabName(region))).trigger("click");
            }
        }
    }
    displayOkitJson();
    okitJson.draw();
    displayTreeView();
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
    if (Object.keys(regionOkitJson).length > 0) {
        console.info('>> Saving Multi Region File');
        saveJson(JSON.stringify(regionOkitJson, null, 2), filename);
    } else {
        console.info('>> Saving Single Region File');
        saveJson(JSON.stringify(okitJson, null, 2), filename);
    }
}
function saveJson(text, filename){
    let uri = 'data:text/plain;charset=utf-u,'+encodeURIComponent(text);
    triggerDownload(uri, filename);
}
/*
** Save Model As Template
 */
function handleSaveAs(evt) {
    // Display Save As Dialog
    $(jqId('modal_dialog_title')).text('Save As Template');
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    let table = d3.select(d3Id('modal_dialog_body')).append('div').append('div')
        .attr('id', 'save_as_template_table')
        .attr('class', 'table okit-table okit-modal-dialog-table');
    let tbody = table.append('div').attr('class', 'tbody');
    let tr = tbody.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Title');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'template_title')
        .attr('name', 'template_title')
        .attr('type', 'text');
    tr = tbody.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Description');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'template_description')
        .attr('name', 'template_description')
        .attr('type', 'text');
    tr = tbody.append('div').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Type');
    tr.append('div').attr('class', 'td').append('input')
        .attr('class', 'okit-input')
        .attr('id', 'template_type')
        .attr('name', 'template_type')
        .attr('type', 'text');
    let save_button = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'save_as_button')
        .attr('type', 'button')
        .text('Save');
    save_button.on("click", handleSaveAsTemplate);
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
function handleSaveAsTemplate(e) {
    okitJson.title = $(jqId('template_title')).val();
    okitJson.description = $(jqId('template_description')).val();
    okitJson.template_type = $(jqId('template_type')).val();
    $.ajax({
        type: 'post',
        url: 'saveas/template',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(okitJson),
        success: function(resp) {
            console.info('Response : ' + resp);
            // Hide modal dialog
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
            // Hide modal dialog
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
        }
    });
}
/*
** Redraw / Redisplay the existing Json
 */
function handleRedraw(evt) {
    hideNavMenu();
    redrawSVGCanvas();
    return false;
}
function redrawSVGCanvas(region='') {
    console.info('>>>>>>>>> Redrawing Canvas (Region : ' + region +')');
    console.info('>>>>>>>>> Active Region            : ' + activeRegion);
    if (region === '' || region === activeRegion) {
        okitJson.draw();
    }
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
            okitJson = new OkitJson(resp);
            displayOkitJson();
            okitJson.draw();
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
        .text('Compartment');
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
    select.append($('<option>').attr('value', 'Retrieving').text('Retrieving..........'));
    // Get Compartments
    $.ajax({
        type: 'get',
        url: 'oci/compartment',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify({config_profile: $(jqId('config_profile')).val()}),
        success: function(resp) {
            //console.info('Response : ' + resp);
            let jsonBody = JSON.parse(resp)
            $(jqId('query_compartment_id')).empty();
            let compartment_select = d3.select(d3Id('query_compartment_id'));
            for(let compartment of jsonBody ){
                //console.info(compartment['display_name']);
                compartment_select.append('option')
                    .attr('value', compartment['id'])
                    .text(compartment['display_name']);
                if (okitSettings.home_region_key === '') {
                    okitSettings.home_region_key = compartment.home_region_key;
                }
            }
            selectQueryLastUsedCompartment();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}
function loadRegions() {
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
    console.group('Generating Query Results');
    let regions = $(jqId('query_region_id')).val();
    okitQueryRequestJson = {};
    okitQueryRequestJson.compartment_id = $(jqId('query_compartment_id')).val();
    okitQueryRequestJson.config_profile = $(jqId('config_profile')).val();
    okitQueryRequestJson.region = '';
    clearRegionTabBar();
    showRegionTabBar();
    okitJson = new OkitJson('', 'canvas-div');
    newCanvas();
    console.info('Regions Ids : ' + regions);
    regionOkitJson = {};
    if (regions.length > 0) {
        queryCount = 0;
        $(jqId('modal_loading_wrapper')).removeClass('hidden');
        for (let region of regions) {
            console.info('Processing Selected Region : ' + region);
            okitQueryRequestJson.region = region;
            addRegionTab(region);
            regionOkitJson[region] = new OkitJson();
            let request = JSON.clone(okitQueryRequestJson);
            request.region = region;
            Compartment.queryRoot(request, region);
        }
        $(jqId(regionTabName(regions[0]))).trigger("click");
    } else {
        console.info('Region Not Selected.');
    }
    $(jqId('modal_dialog_wrapper')).addClass('hidden');
    console.groupEnd();
}
// TODO: Delete
function hideQueryProgressIfComplete() {
    console.info(`>>>>>>>>>>>>> Query Count: ${queryCount}`);
}
$(document).ajaxStop(function() {
    console.info('All Ajax Functions Stopped');
    $(jqId('modal_loading_wrapper')).addClass('hidden');
    displayTreeView();
});
/*
** Export the Model as various formats
 */
/*
** Export SVG
 */
function handleExportToSVG(evt) {
    hideNavMenu();
    if (!okitJson.hasOwnProperty('open_compartment_index')) {
        okitJson['open_compartment_index'] = 0;
    }
    let okitcanvas = document.getElementById("canvas-svg");
    let name = okitJson.compartments[okitJson['open_compartment_index']]['name'];
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
    console.group("Saving As " + type);
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
        image.crossOrigin = 'anonymous';
        image.onload = function () {
            context.drawImage(image,0,0);
            triggerDownload(canvas.toDataURL("image/" + type), filename + "." + type);
            document.body.removeChild(img);
        }
        image.src = img.src;
    }

    img.src = 'data:image/svg+xml;base64,' + window.btoa(svgStr);
    console.groupEnd();
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
            okitJson = regionOkitJson[region];
            redrawSVGCanvas(region);
        });
}
function regionTabName(region) {
    return region + '_tab';
}

/*
** OKIT Canvas Functions
 */
/*
** Json / Source Code
 */
function displayOkitJson() {
    console.info('>>> Region Count ' + Object.keys(regionOkitJson).length);
    if (Object.keys(regionOkitJson).length > 0) {
        $(jqId(JSON_PANEL)).html('<pre><code>' + JSON.stringify(regionOkitJson, null, 2) + '</code></pre>');
    } else {
        $(jqId(JSON_PANEL)).html('<pre><code>' + JSON.stringify(okitJson, null, 2) + '</code></pre>');
    }
}
/*
** Slidebar handlers
 */
// Tree View
function displayTreeView() {
    if ($('#toggle_explorer_button').hasClass('okit-bar-panel-displayed')) {
        let okit_tree = new OkitJsonTreeView(okitJson, 'explorer_panel');
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
            error_propeties.push(error.element);
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
            warning_propeties.push(warning.element);
            d3.select(d3Id(warning.id + '-svg')).on("click")();
            $('#toggle_properties_button').click();
        });
    }
    $(jqId('validation_warnings_summary')).text(`Warnings (${results.results.warnings.length})`)
}
/*
** Model Pricing
 */
function displayPricingResults(results) {
    console.info('Displaying Pricing Results');
    $(jqId(COST_ESTIMATE_PANEL)).text(JSON.stringify(results));
}
