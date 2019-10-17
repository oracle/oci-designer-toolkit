console.info('Loaded Designer Javascript');
/*
 * Define the OKT Designer Constant that will be used across the subsequent Javascript
 */
// Asset name prefix
const display_name_prefix = 'okit-';
// Compartment
const compartment_artifact = 'Compartment';
const compartment_prefix = 'comp';
// Virtual Cloud Network
const virtual_cloud_network_artifact = 'Virtual Cloud Network';
const virtual_cloud_network_prefix = 'vcn';
// Internet Gateway
const internet_gateway_artifact = 'Internet Gateway';
const internet_gateway_prefix = 'ig';
// NAT Gateway
const nat_gateway_artifact = 'NAT Gateway';
const nat_gateway_prefix = 'ng';
// Dynamic Routing Gateway
const dynamic_routing_gateway_artifact = 'Dynamic Routing Gateway';
const dynamic_routing_gateway_prefix = 'dg';
// Route Table
const route_table_artifact = 'Route Table';
const route_table_prefix = 'rt';
// Security List
const security_list_artifact = 'Security List';
const security_list_prefix = 'sl';
// Subnet
const subnet_artifact = 'Subnet';
const subnet_prefix = 'sn';
// Instance
const instance_artifact = 'Instance';
const instance_prefix = 'in';
// Load Balancer
const load_balancer_artifact = 'Load Balancer';
const load_balancer_prefix = 'lb';
// Block Storage
const block_storage_volume_artifact = 'Block Storage Volume';
const block_storage_volume_prefix = 'bsv';

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
        compartments: [],
        block_storage_volumes: [],
        dynamic_routing_gateways: [],
        instances: [],
        internet_gateways: [],
        load_balancers: [],
        nat_gateways: [],
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
    okitJson = {};
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
    let okitcanvas = document.getElementById(okitJson.compartments[okitJson['open_compartment_index']]['id'] + '-canvas-svg');
    let name = okitJson.compartments[okitJson['open_compartment_index']]['name'];
    saveSvg(okitcanvas, name + '.svg');
}

function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
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
    clearCoreData();
    clearArtifactData();
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

});

