console.info('Loaded Designer Javascript');
/*
 * Define the OKT Designer Constant that will be used across the subsequent Javascript
 */

/*
 * Define designer working variables
 */
// OKIT Json
let okitJson = {"compartments": [{id: 'okit-comp-' + uuidv4(), name: 'Wizards'}]};
// Common okit id to name mapping
let okitIdsJsonObj = {};
// Query Request only set to a value when designer called from query
let okitQueryRequestJson = null;

/*
 * Variable Initialisation
 */
function initialiseJson() {
    okitJson = {
        title: "OKIT OCI Visualiser Json",
        description: "OKIT Generic OCI Json which can be used to generate ansible, terraform, .......",
        compartments: [],
        autonomous_databases: [],
        block_storage_volumes: [],
        dynamic_routing_gateways: [],
        instances: [],
        internet_gateways: [],
        load_balancers: [],
        nat_gateways: [],
        service_gateways: [],
        route_tables: [],
        security_lists: [],
        subnets: [],
        virtual_cloud_networks: [],
        canvas : initialiseCanvasJson()
    }
}

function initialiseCanvasJson() {
    let canvasJson = {
        compartments: {},
        subnets: {},
        virtual_cloud_networks: {}
    };

    return canvasJson
}

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
    initialiseJson();
    clearArtifactData();
    newCanvas();
    addCompartment();
    //document.getElementById('file-add-menu-item').click();
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

function clearCoreData() {
    initialiseJson();
    okitIdsJsonObj = {};
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
    console.info('Loaded: ' + fileString);
    okitJson = JSON.parse(fileString);
    if (!okitJson.hasOwnProperty('canvas')) {
        okitJson['canvas'] = initialiseCanvasJson();
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
            okitJson = JSON.parse(resp);
            if (!okitJson.hasOwnProperty('canvas')) {
                okitJson['canvas'] = initialiseCanvasJson();
            }
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
    saveJson(JSON.stringify(okitJson, null, 2), "okit.json");
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
    // let okitcanvas = document.getElementById(okitJson.compartments[okitJson['open_compartment_index']]['id'] + '-canvas-svg');
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
    clearArtifactData();
    initialiseJson();
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


const ro = new ResizeObserver(entries => {
    redrawSVGCanvas();
});

let dragging_drag_bar = false;

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

    document.getElementById('generate-resource-manager-menu-item').addEventListener('click', handleGenerateTerraform11, false);

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

    $('input[type=radio][name=source-properties]').change(function() {
        if (this.value == 'source') {
        }
        else if (this.value == 'properties') {
        }
        $("#json-display").slideToggle();
        $("#json-display").removeClass('hidden');
        $("#properties").slideToggle();
    });

    $("#json-display").slideToggle();

    // Only observe the canvas
    ro.observe(document.querySelector('#canvas-wrapper'));

    // Add Drag Bar Functionality
    $('#dragbar').mousedown(function(e) {
        e.preventDefault();

        dragging_drag_bar = true;
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
        if (dragging_drag_bar) {
            let palette_width = $('#icon-palette').width();
            let web_disigner_panel_width = $('#web-designer-panel').width();
            let properties_width = web_disigner_panel_width - e.pageX;
            console.groupCollapsed('Drag Bar Up');
            console.info('Ghost Drag Bar X Position ' + e.pageX);
            console.info('Web Designer Panel Width ' + web_disigner_panel_width);
            console.info('Palette Width ' + palette_width);
            console.info('Properties Width ' + properties_width);
            $('#asset-properties').css("min-width", properties_width);
            $('#ghostbar').remove();
            $(document).unbind('mousemove');
            dragging_drag_bar = false;
            console.groupEnd();
        }
    });

});

