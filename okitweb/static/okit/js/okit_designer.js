/*
** Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
** The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]
*/
console.info('Loaded Designer Javascript');
/*
 * Define the OKT Designer Constant that will be used across the subsequent Javascript
 */

/*
 * Define designer working variables
 */
// OKIT Json
let okitJson = new OkitJson();
let regionOkitJson = {};
// Canvas
let activeCanvas = null;
let activeRegion = null;
// Query Request only set to a value when designer called from query
let okitQueryRequestJson = null;

function saveOkitSettings(settings) {
    console.info('Saving OKIT Settings To Cookie.');
    if (settings === undefined) {
        settings = JSON.stringify(okitSettings);
    }
    setCookie('okit-settings', settings);
}

function readOkitSettings() {
    let cookie_value = getCookie('okit-settings');
    if (cookie_value == '') {
        console.info('OKIT Settings Cookie Was Not Found.');
        let settings = {
            is_default_security_list: true,
            is_default_route_table: true,
            is_timestamp_files: false,
            profile: 'DEFAULT',
            is_always_free: false,
        };
        cookie_value = JSON.stringify(settings);
        saveOkitSettings(cookie_value);
    } else {
        console.info('OKIT Settings Cookie Found.');
    }
    return JSON.parse(cookie_value);
}

// Automation details
let okitSettings = readOkitSettings();
let ociRegions = [];

/*
 * Define Common Functions
 */
function generateDefaultName(prefix, count) {
    return display_name_prefix + prefix + ('000' + count).slice(-3);
}

function displayOkitJson() {
    console.info('>>> Region Count ' + Object.keys(regionOkitJson).length);
    if (Object.keys(regionOkitJson).length > 0) {
        $('#okitjson').html(JSON.stringify(regionOkitJson, null, 2));
    } else {
        $('#okitjson').html(JSON.stringify(okitJson, null, 2));
    }
    //console.info(JSON.stringify(okitJson, null, 2));
}

function generateConnectorId(sourceid, destinationid) {
    return sourceid + '-' + destinationid;
}

/*
** New File functionality
 */

function newDiagram() {
    console.groupCollapsed('Creating New Diagram');
    okitJson = new OkitJson();
    newCanvas();
    okitJson.newCompartment();
    console.groupEnd();
}

/*
** Load file
 */

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
    drawSVGforJson();
}

function errorHandler(evt) {
    console.info('Error: ' + evt.target.error.name);
}

function handleFileSelect(evt) {
    let files = evt.target.files; // FileList object
    getAsJson(files[0]);
}

function handleLoadClick(evt) {
    hideNavMenu();
    let fileinput = document.getElementById("files");
    fileinput.click();
}

/*
** Load Templates
 */
function loadTemplate(template_url) {
    hideNavMenu();
    $.ajax({
        type: 'get',
        url: template_url,
        dataType: 'text',
        contentType: 'application/json',
        success: function(resp) {
            okitJson = new OkitJson(resp);
            //okitJson.load(JSON.parse(resp));
            displayOkitJson();
            drawSVGforJson();
        },
        error: function(xhr, status, error) {
            console.error('Status : '+ status);
            console.error('Error  : '+ error);
        }
    });
}

/*
** Reload / Redraw functionality
 */

function handleRedraw(evt) {
    redrawSVGCanvas();
    return false;
}

function handleResize(evt) {
    redrawSVGCanvas();
    return false;
}

function redrawSVGCanvas(region='') {
    console.info('>>>>>>>>> Redrawing Canvas (Region : ' + region +')');
    console.info('>>>>>>>>> Active Region            : ' + activeRegion);
    hideNavMenu();
    if (region === '' || region === activeRegion) {
        drawSVGforJson();
    }
}

/*
** Save file
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
    let a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click();
}

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
    saveSvg(okitcanvas, name + '.svg');
}

function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    let svgData = svgEl.outerHTML;
    let preface = '<?xml version="1.0" standalone="no"?>\r\n';
    let svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    let svgUrl = URL.createObjectURL(svgBlob);
    let downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    redrawSVGCanvas();
}

/*
** Query OCI
 */

function handleQueryAjax(e) {
    $.ajax({
        type: 'get',
        url: 'oci/compartment',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(okitJson),
        success: function(resp) {
            console.info('Response : ' + resp);
            let jsonBody = JSON.parse(resp)
            let len =  jsonBody.length;
            for(let i=0;i<len;i++ ){
                console.info(jsonBody[i]['display_name']);
            }
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

function handleQueryOci(e) {
    //window.location = 'oci/query/oci';

    // Hide Menu
    hideNavMenu();
    // Set Query Config Profile
    console.info('Profile : ' + okitSettings.profile);
    if (!okitSettings.profile) {
        okitSettings.profile = 'DEFAULT';
    }
    console.info('Profile : ' + okitSettings.profile);
    okitSettings.home_region_key = '';
    okitSettings.home_region = '';
    ociRegions = [];
    $('#config_profile').val(okitSettings.profile);
    // Get Compartments
    $.ajax({
        type: 'get',
        url: 'oci/compartment',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify({config_profile: okitSettings.profile}),
        success: function(resp) {
            console.info('Response : ' + resp);
            let jsonBody = JSON.parse(resp)
            $('#query-compartment-id').empty();
            let compartment_select = d3.select('#query-compartment-id');
            for(let compartment of jsonBody ){
                console.info(compartment['display_name']);
                compartment_select.append('option')
                    .attr('value', compartment['id'])
                    .text(compartment['display_name']);
                if (okitSettings.home_region_key === '') {
                    okitSettings.home_region_key = compartment.home_region_key;
                }
            }
            selectQueryHomeRegion();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
    // Get Regions
    $.ajax({
        type: 'get',
        url: 'oci/region',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify({config_profile: okitSettings.profile}),
        success: function(resp) {
            console.info('Response : ' + resp);
            let jsonBody = JSON.parse(resp)
            $('#query-region-id').empty();
            let region_select = d3.select('#query-region-id');
            ociRegions = jsonBody;
            for(let region of jsonBody ){
                console.info(region['display_name']);
                region_select.append('option')
                    .attr('value', region['name'])
                    .text(region['display_name']);
            }
            selectQueryHomeRegion();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
    // Show Query Box
    $('#query-oci').removeClass('hidden');
}

function selectQueryHomeRegion() {
    if (okitSettings.home_region_key !== '') {
        for (let region of ociRegions) {
            if (okitSettings.home_region_key === region.key) {
                $(jqId('query-region-id')).val(region.name);
                break;
            }
        }
    }
}

function handleCancelQuery(e) {
    // Hide Query Box
    $('#query-oci').addClass('hidden');
}

/*
** Query OCI Ajax Calls to allow async svg build
 */
function showQueryResults() {
    console.group('Generating Query Results');
    //newCanvasWrapper();
    //let tab_bar = addRegionTabBar();
    clearRegionTabBar();
    showRegionTabBar();
    okitJson = new OkitJson('', 'canvas-div');
    newCanvas();
    console.info('Regions Ids : ' + okitQueryRequestJson.regions);
    regionOkitJson = {};
    if (okitQueryRequestJson.regions.length > 0) {
        for (let region of okitQueryRequestJson.regions) {
            console.info('Processing Multiple Selected Region : ' + region);
            okitQueryRequestJson.region = region;
            addRegionTab(region);
            //addRegionTabContent(region);
            //okitJson = new OkitJson('', regionTabContentName(region));
            //regionOkitJson[region] = okitJson;
            regionOkitJson[region] = new OkitJson();
            setBusyIcon();
            $('#query-progress').removeClass('hidden');
            //queryCompartmentAjax(region);
            let request = JSON.clone(okitQueryRequestJson);
            request.region = region;
            Compartment.query(request, region);
        }
        $(jqId(regionTabName(okitQueryRequestJson.regions[0]))).trigger("click");
    } else if (okitQueryRequestJson.regions.length === 1) {
        let region = okitQueryRequestJson.regions[0];
        console.info('Processing Single Selected Region : ' + region);
        okitQueryRequestJson.region = region;
    } else {
        console.info('Region Not Selected Using Config Region.');
    }
    //setBusyIcon();
    //$('#query-progress').removeClass('hidden');
    //queryCompartmentAjax();
    console.groupEnd();
}

function addRegionTabBar() {
    return d3.select('#canvas-wrapper').append('div')
        .attr("id", "region-tab-bar")
        .attr("class", "tab-bar");
}

function clearRegionTabBar() {
    $('#region-tab-bar').empty();
}

function showRegionTabBar() {
    $('#region-tab-bar').removeClass('hidden');
}

function hideRegionTabBar() {
    $('#region-tab-bar').addClass('hidden');
}

function addRegionTab(region) {
    return d3.select(d3Id('region-tab-bar')).append('button')
        .attr("id", regionTabName(region))
        .attr("data-region-id", region)
        .on("click", function() {
            console.info('Clicked Tab ' + region);
            activeRegion = region;
            $('#region-tab-bar button').removeClass("active");
            $(jqId(regionTabName(region))).addClass("active");
            //$('#canvas-wrapper .tab-content').addClass("hidden");
            //$(jqId(regionTabContentName(region))).removeClass("hidden");
            okitJson = regionOkitJson[region];
            redrawSVGCanvas(region);
        })
        //.attr("class", "active")
        .text(region);
}

function addRegionTabContent(region='unknown') {
    return d3.select('#canvas-wrapper').append('div')
        .attr("id", regionTabContentName(region))
        .attr("class", "tab-content hidden");
}

function regionTabName(region) {
    return region + '-tab';
}

function regionTabContentName(region) {
    return region + '-tab-content';
}

function showQueryProgress() {
    let element = document.getElementById("query-progress");
    element.classList.toggle("hidden");
    element.style.top =  d3.event.clientY + 'px';
    element.style.left = d3.event.clientX + 'px';
}

function hideQueryProgressIfComplete() {
    let cnt = $('#query-progress input:checkbox:not(:checked)').length
    console.info('>>>>>>> Unchecked Count : ' + cnt);
    if (cnt == 0) {
        unsetBusyIcon();
        //$('#query-progress').toggleClass('hidden');
        $('#query-progress').addClass('hidden');
    }
}

function openCompartment(compartment_id) {
    // Clear All
    $('.tabcontent').hide();
    $('.tablinks').removeClass('active');
    // Add to selected
    $(jqId(compartment_id + '-tab-button')).addClass('active');
    $(jqId(compartment_id + '-tab-content')).show();
    // Set Open Compartment Index
    for (let i=0; i < okitJson['compartments'].length; i++) {
        if (okitJson['compartments'][i]['id'] == compartment_id) {
            okitJson['open_compartment_index'] = i;
            break;
        }
    }
    displayOkitJson();
}

function loadSettings() {
    $("#settings").load("propertysheets/settings.html", function() {
        console.info('Loading Settings');
        loadPropertiesSheet(okitSettings);
        addPropertiesEventListeners(okitSettings, [], true);
        $('#is_always_free').attr('checked', okitSettings.is_always_free);
    });
}

function handleFooterIsAlwaysFreeClick(cb) {
    okitSettings.is_always_free = $(cb).is(':checked');
    saveOkitSettings();
}


//const ro = new ResizeObserver(entries => {
//    redrawSVGCanvas();
//});

let dragging_palette_drag_bar = false;
let dragging_properties_drag_bar = false;

$(document).ready(function(){
    /*
    ** Add handler functionality
     */
    console.info('Adding Designer Handlers');

    /*
    ** Drag start for all pallet icons
     */
    let palatteicons = document.querySelectorAll('#icon-palette .palette-icon');
    [].forEach.call(palatteicons, function (palatteicon) {
        palatteicon.addEventListener('dragstart', handleDragStart, false);
    });
    /*
    ** Drag start for all pallet fragments
     */
    let fragmenticons = document.querySelectorAll('#icon-palette .fragment-icon');
    [].forEach.call(fragmenticons, function (fragmenticon) {
        fragmenticon.addEventListener('dragstart', handleFragmentDragStart, false);
    });

    /*
    ** Add button handlers
     */
    document.getElementById('files').addEventListener('change', handleFileSelect, false);

    /*
    ** Add Menu Item handlers
     */

    // File Menu

    document.getElementById('file-load-menu-item').addEventListener('click', handleLoadClick, false);

    document.getElementById('file-save-menu-item').addEventListener('click', handleSave, false);

    // Canvas Menu
    //document.getElementById('file-add-menu-item').addEventListener('click', handleAdd, false);

    document.getElementById('file-redraw-menu-item').addEventListener('click', handleRedraw, false);

    // Export Menu

    document.getElementById('file-export-svg-menu-item').addEventListener('click', handleExportToSVG, false);

    document.getElementById('file-export-rm-menu-item').addEventListener('click', handleExportToResourceManager, false);

    // Query Menu

    document.getElementById('query-oci-menu-item').addEventListener('click', handleQueryOci, false);

    // Generate Menu
    document.getElementById('generate-terraform-menu-item').addEventListener('click', handleGenerateTerraform, false);

    document.getElementById('generate-ansible-menu-item').addEventListener('click', handleGenerateAnsible, false);

    //document.getElementById('generate-resource-manager-menu-item').addEventListener('click', handleGenerateTerraform11, false);

    //document.getElementById('Example-tab-button').addEventListener('click', function() { openCompartment('Example'); }, false);

    // Set Redraw when window resized
    window.addEventListener("resize", handleResize, false);

    /*
    ** Set Empty Properties Sheet
     */

    $("#properties").load("propertysheets/empty.html");

    // Remove Busy Icon if set
    unsetBusyIcon();
    /*
    ** Clean and start new diagram
     */

    //let compartment_id = addCompartment();

    // Hide Region Tab Bar
    hideRegionTabBar();

    if (okitQueryRequestJson === null) {
        console.info('<<<<<<<<<<<<< New Canvas >>>>>>>>>>>>>');
        newDiagram();
    } else {
        console.info('<<<<<<<<<<<<< Query Results Canvas >>>>>>>>>>>>>');
        showQueryResults();
    }

    /*
    ** Load Settings
     */

    loadSettings();

    $('input[type=radio][name=source-properties]').change(function() {
        if (this.value == 'source') {
            $("#json-display").slideDown();
            $("#settings").slideUp();
            $("#properties").slideUp();
        }
        else if (this.value == 'properties') {
            $("#properties").slideDown();
            $("#settings").slideUp();
            $("#json-display").slideUp();
        }
        else if (this.value == 'settings') {
            $("#settings").slideDown();
            $("#json-display").slideUp();
            $("#properties").slideUp();
        }
        //$("#json-display").slideToggle();
        $("#settings").removeClass('hidden');
        $("#json-display").removeClass('hidden');
        $("#properties").removeClass('hidden');
        //$("#properties").slideToggle();
    });

    $("#json-display").slideToggle();
    $("#settings").slideToggle();

    // Only observe the canvas
    //ro.observe(document.querySelector('#canvas-wrapper'));

    // Add Drag Bar Functionality
    $('#properties-dragbar').mousedown(function(e) {
        e.preventDefault();

        dragging_properties_drag_bar = true;
        let web_designer_panel = $('#web-designer-panel');
        let ghostbar = $('<div>',
            {
                id: 'ghostbar',
                css: {
                    height: web_designer_panel.outerHeight(),
                    top: web_designer_panel.offset().top,
                    left: web_designer_panel.offset().left
                },
                class: 'vertical-ghost-bar'
            }).appendTo('body');

        $(document).mousemove(function(e) {
            ghostbar.css("left",e.pageX+2);
        });
    });

    $('#palette-dragbar').mousedown(function(e) {
        e.preventDefault();

        dragging_palette_drag_bar = true;
        let web_designer_panel = $('#web-designer-panel');
        let ghostbar = $('<div>',
            {
                id: 'ghostbar',
                css: {
                    height: web_designer_panel.outerHeight(),
                    top: web_designer_panel.offset().top,
                    left: web_designer_panel.offset().left
                },
                class: 'vertical-ghost-bar'
            }).appendTo('body');

        $(document).mousemove(function(e) {
            ghostbar.css("left",e.pageX+2);
        });
    });

    $(document).mouseup(function(e) {
        if (dragging_palette_drag_bar || dragging_properties_drag_bar) {
            console.groupCollapsed('Document MouseUp (Drag Bar Up)');
            let palette_width = $('#icon-palette').width();
            let web_designer_panel_width = $('#web-designer-panel').width();
            let properties_width = $('#asset-properties').width();
            console.info('Palette Width             : ' + palette_width);
            console.info('Web Designer Panel Width  : ' + web_designer_panel_width);
            console.info('Properties Width          : ' + properties_width);
            console.info('Ghost Drag Bar X Position : ' + e.pageX);
            if (dragging_palette_drag_bar) {
                palette_width = e.pageX;
            } else if (dragging_properties_drag_bar) {
                properties_width = web_designer_panel_width - e.pageX;
            }
            // Set Palette Bar Width
            console.info('Palette Width             : ' + palette_width);
            $('#icon-palette').css("min-width", palette_width);
            $('#icon-palette').css("width", palette_width);
            // Set Properties Width
            console.info('Properties Width          : ' + properties_width);
            $('#asset-properties').css("min-width", properties_width);
            $('#asset-properties').css("width", properties_width);
            // Remove Bar artifacts
            $('#ghostbar').remove();
            $(document).unbind('mousemove');
            dragging_palette_drag_bar = false;
            dragging_properties_drag_bar = false;
            redrawSVGCanvas();
            console.groupEnd();
        }
    });
    redrawSVGCanvas();

});

