/*
** Add handler functionality
 */

/*
** Drag start for all pallet icons
 */
var palatteicons = document.querySelectorAll('#palatte .palatteicon');
[].forEach.call(palatteicons, function (palatteicon) {
    palatteicon.addEventListener('dragstart', handleDragStart, false);
});

//var okitcanvas = document.querySelector('#okitcanvas');
/*
** Handle drop functionality for canvas
 */
var okitcanvas = document.getElementById('okitcanvas');
okitcanvas.addEventListener('dragenter', handleDragEnter, false)
okitcanvas.addEventListener('dragover', handleDragOver, false);
okitcanvas.addEventListener('dragleave', handleDragLeave, false);
okitcanvas.addEventListener('drop', handleDrop, false);
okitcanvas.addEventListener('dragend', handleDragEnd, false);

/*
** Define Connector Drag & Drop functions point manipulation code.
 */
var okitcanvasSVGPoint = okitcanvas.createSVGPoint();
var okitcanvasScreenCTM = okitcanvas.getScreenCTM();
var connectorStartElement = null;
var connectorStartXLeft = 0;
var connectorStartYTop = 0;

/*
** Add button handlers
 */
document.getElementById('files').addEventListener('change', handleFileSelect, false);

document.getElementById('newdiagram').addEventListener('click', handleNew, false);

document.getElementById('savejson').addEventListener('click', handleSave, false);

document.getElementById('generateterraform').addEventListener('click', handleGenerateTerraform, false);

document.getElementById('generateansible').addEventListener('click', handleGenerateAnsible, false);

document.getElementById('queryoci').addEventListener('click', handleQuery, false);

/*
** Set Empty Properties Sheet
 */

$("#properties").load("propertysheets/empty.html");

/*
** Clean and start new diagram
 */

newDiagram();
