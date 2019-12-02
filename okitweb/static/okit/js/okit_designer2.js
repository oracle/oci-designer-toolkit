console.info('Loaded Designer Javascript');
/*
 * Define the OKT Designer Constant that will be used across the subsequent Javascript
 */

/*
 * Define designer working variables
 */
// OKIT Json
let okitJson = new OkitJson();
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
            is_timestamp_files: false
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


/*
 * Define Common Functions
 */
function generateDefaultName(prefix, count) {
    return display_name_prefix + prefix + ('000' + count).slice(-3);
}

function displayOkitJson() {
    $('#okitjson').html(JSON.stringify(okitJson, null, 2));
    //console.info(JSON.stringify(okitJson, null, 2));
}

function generateConnectorId(sourceid, destinationid) {
    return sourceid + '-' + destinationid;
}

/*
** New File functionality
 */

function handleNew(evt) {
    // newDiagram();
    window.location = 'designer';
}

function newDiagram() {
    console.groupCollapsed('Creating New Diagram');
    okitJson = new OkitJson();
    newCanvas();
    okitJson.newCompartment();
    console.groupEnd();
}

function clearTabs() {
    $('#canvas-wrapper').empty();
    d3.select('#canvas-wrapper').append('div')
        .attr("id", "compartment-tabs")
        .attr("class", "tab");
}

function clearDiagram() {
    console.groupCollapsed('Clearing Diagram');
    // Clear Artifact
    clearArtifactData();
    // Clear Canvas
    clearCanvas();
    console.groupEnd();
}

function clearArtifactData() {
    console.groupCollapsed('Clearing Artifact Data');
    for (let clear_function of asset_clear_functions) {
        console.info('Calling ' + clear_function);
        window[clear_function]();
    }
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
    // Obtain the read file data
    let fileString = evt.target.result;
    okitJson = new OkitJson(fileString);
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

function redrawSVGCanvas() {
    hideNavMenu();
    drawSVGforJson();
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
    saveJson(JSON.stringify(okitJson, null, 2), filename);
}

function saveJson(text, filename){
    let a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click()
}

/*
** Add Compartment file
 */

function handleAdd(evt) {
    hideNavMenu();
    addCompartment();
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
** Query OCI Ajax Calls to allow async svg build
 */
function showQueryResults() {
    console.info('Generating Query Results');
    okitJson = new OkitJson();
    newCanvas();
    setBusyIcon();
    $('#query-progress').removeClass('hidden');
    queryCompartmentAjax();
}

function showQueryProgress() {
    let element = document.getElementById("query-progress");
    element.classList.toggle("hidden");
    element.style.top =  d3.event.clientY + 'px';
    element.style.left = d3.event.clientX + 'px';
}

function hideQueryProgressIfComplete() {
    let cnt = $('#query-progress input:checkbox:not(:checked)').length
    console.info('>>>>>>> Unhecked Count : ' + cnt);
    if (cnt == 0) {
        unsetBusyIcon();
        $('#query-progress').toggleClass('hidden');
    }
}

function openCompartment(compartment_id) {
    // Clear All
    $('.tabcontent').hide();
    $('.tablinks').removeClass('active');
    // Add to selected
    $('#' + compartment_id + '-tab-button').addClass('active');
    $('#' + compartment_id + '-tab-content').show();
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
        loadProperties(okitSettings);
        addPropertiesEventListeners(okitSettings, [], true);
    });
}


const ro = new ResizeObserver(entries => {
    redrawSVGCanvas();
});

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
    ** Drag start for all pallet fragmentd
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
    //window.addEventListener("resize", handleResize, false);

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

    if (okitQueryRequestJson == null) {
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
    ro.observe(document.querySelector('#canvas-wrapper'));

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
            console.groupEnd();
        }
    });

});

