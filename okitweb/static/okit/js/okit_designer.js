console.log('Loaded Designer Javascript');
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
let OKITJsonObj = {"compartments": [{id: 'okit-comp-' + uuidv4(), name: 'Wizards'}]};
// Common okit id to name mapping
let okitIdsJsonObj = {};
// Query Request only set to a value when designer called from query
let okitQueryRequestJson = null;

/*
 * Define Common Functions
 */
function generateDefaultName(prefix, count) {
    return display_name_prefix + prefix + ('000' + count).slice(-3);
}

function displayOkitJson() {
    $('#okitjson').html(JSON.stringify(OKITJsonObj, null, 2));
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
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
    console.log('Creating New Diagram');
    OKITJsonObj = {};
    okitIdsJsonObj = {};
    clearSVG();
    //addCompartment();
    document.getElementById('file-add-menu-item').click();
}

function clearTabs() {
    $('#canvas-wrapper').empty();
    d3.select('#canvas-wrapper').append('div')
        .attr("id", "compartment-tabs")
        .attr("class", "tab");
}

function clearSVG() {
    console.log('Clearing Diagram');
    //$('#okitcanvas').empty();
    // Tabs
    clearTabs();
    // Loop through Clear Artifact Routines
    for (let clear_function of asset_clear_functions) {
        console.log('Calling ' + clear_function);
        window[clear_function]();
    }
    /*
    // Compartments
    clearCompartmentVariables();
    // Virtual Cloud Network
    clearVirtualCloudNetworkVariables();
    // Internet Gateway
    clearInternetGatewayVariables();
    // Route Table
    clearRouteTableVariables();
    // Security List
    clearSecurityListVariables();
    // Subnet
    clearSubnetVariables();
    // Load Balancer
    clearLoadBalancerVariables();
    // Instance
    clearInstanceVariables();
    // Block Storage Volume
    clearBlockStorageVolumeVariables();
     */
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
    console.log('Loaded: ' + fileString);
    OKITJsonObj = JSON.parse(fileString);
    displayOkitJson();
    drawSVGforJson();
}

function errorHandler(evt) {
    console.log('Error: ' + evt.target.error.name);
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
    saveJson(JSON.stringify(OKITJsonObj, null, 2), "okit.json");
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
    if (!OKITJsonObj.hasOwnProperty('open_compartment_index')) {
        OKITJsonObj['open_compartment_index'] = 0;
    }
    let okitcanvas = document.getElementById(OKITJsonObj.compartments[OKITJsonObj['open_compartment_index']]['id'] + '-canvas-svg');
    let name = OKITJsonObj.compartments[OKITJsonObj['open_compartment_index']]['name'];
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

function showQueryProgress() {
    let element = document.getElementById("query-progress");
    element.classList.toggle("hidden");
    element.style.top =  d3.event.clientY + 'px';
    element.style.left = d3.event.clientX + 'px';
}

function hideQueryProgressIfComplete() {
    let cnt = $('#query-progress input:checkbox:not(:checked)').length
    console.log('>>>>>>> Unhecked Count : ' + cnt);
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
    for (let i=0; i < OKITJsonObj['compartments'].length; i++) {
        if (OKITJsonObj['compartments'][i]['id'] == compartment_id) {
            OKITJsonObj['open_compartment_index'] = i;
            break;
        }
    }
    displayOkitJson();
}


const ro = new ResizeObserver(entries => {
    //for (let entry of entries) {
    //    entry.target.style.borderRadius = Math.max(0, 250 - entry.contentRect.width) + 'px';
    //}
    redrawSVGCanvas();
});

$(document).ready(function(){
    /*
    ** Add handler functionality
     */
    console.log('Adding Designer Handlers');

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
    document.getElementById('file-add-menu-item').addEventListener('click', handleAdd, false);

    document.getElementById('file-redraw-menu-item').addEventListener('click', handleRedraw, false);

    // Export Menu

    document.getElementById('file-export-svg-menu-item').addEventListener('click', handleExportToSVG, false);

    document.getElementById('file-export-rm-menu-item').addEventListener('click', handleExportToResourceManager, false);

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
        console.log('<<<<<<<<<<<<<New Page>>>>>>>>>>>>>')
        newDiagram();
    } else {
        setBusyIcon();
        clearSVG();
        $('#query-progress').removeClass('hidden');
        queryCompartmentAjax();
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
    //ro.observe(document.querySelector('#canvas-wrapper'));

});

