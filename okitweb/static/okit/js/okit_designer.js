/*
** Add handler functionality
 */

/*
** Drag start for all pallet icons
 */
var palatteicons = document.querySelectorAll('#icon-palette .palatte-icon');
[].forEach.call(palatteicons, function (palatteicon) {
    palatteicon.addEventListener('dragstart', handleDragStart, false);
});

/*
** Handle drop functionality for canvas
 */
var okitcanvas = document.getElementById('okitcanvas');
okitcanvas.addEventListener('dragenter', handleDragEnter, false)
okitcanvas.addEventListener('dragover', handleDragOver, false);
okitcanvas.addEventListener('dragleave', handleDragLeave, false);
okitcanvas.addEventListener('drop', handleDrop, false);
okitcanvas.addEventListener('dragend', handleDragEnd, false);

// Set SVG Attributes
d3.select('#okitcanvas')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', '100%')
    .attr('height', '100%');

/*
** Define Connector Drag & Drop functions point manipulation code.
 */
var okitcanvasSVGPoint = okitcanvas.createSVGPoint();
var okitcanvasScreenCTM = okitcanvas.getScreenCTM();
var connectorStartElement = null;
var connectorStartXLeft = 0;
var connectorStartYTop = 0;
var connectorContainerSVGPoint = null;
var connectorContainerScreenCTM = null;

/*
** Add button handlers
 */
document.getElementById('files').addEventListener('change', handleFileSelect, false);

//document.getElementById('loaddiagram').addEventListener('click', handleLoadClick, false);

//document.getElementById('newdiagram').addEventListener('click', handleNew, false);

//document.getElementById('savejson').addEventListener('click', handleSave, false);

//document.getElementById('exportsvg').addEventListener('click', handleExport, false);

//document.getElementById('generateterraform').addEventListener('click', handleGenerateTerraform, false);

//document.getElementById('generateansible').addEventListener('click', handleGenerateAnsible, false);

//document.getElementById('queryoci').addEventListener('click', handleQueryOci, false);

/*
** Add Menu Item handlers
 */

// File Menu
//document.getElementById('file-new-menu-item').addEventListener('click', handleNew, false);

document.getElementById('file-load-menu-item').addEventListener('click', handleLoadClick, false);

document.getElementById('file-save-menu-item').addEventListener('click', handleSave, false);

document.getElementById('file-export-menu-item').addEventListener('click', handleExport, false);

// Query Menu
//document.getElementById('query-oci-menu-item').addEventListener('click', handleQueryOci, false);

// Generate Menu
document.getElementById('generate-terraform-menu-item').addEventListener('click', handleGenerateTerraform, false);

document.getElementById('generate-ansible-menu-item').addEventListener('click', handleGenerateAnsible, false);

/*
** Set Empty Properties Sheet
 */

$("#properties").load("propertysheets/empty.html");

/*
** Clean and start new diagram
 */

newDiagram();

// Remove Busy Icon if set
//unsetBusyIcon();