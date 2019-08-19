console.log('Loaded Designer Javascript');

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
    ** Handle drop functionality for canvas
     */
    let okitcanvas = document.getElementById('okitcanvas');
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
    document.getElementById('file-export-menu-item').addEventListener('click', handleExport, false);

    document.getElementById('file-redraw-menu-item').addEventListener('click', handleRedraw, false);

    // Query Menu

    // Generate Menu
    document.getElementById('generate-terraform-menu-item').addEventListener('click', handleGenerateTerraform, false);

    document.getElementById('generate-ansible-menu-item').addEventListener('click', handleGenerateAnsible, false);

    // Set Redraw when window resized
    window.addEventListener("resize", handleResize, false);

    /*
    ** Set Empty Properties Sheet
     */

    $("#properties").load("propertysheets/empty.html");

    // Set Properties drag events
    //let asset_properties = document.getElementById('asset-properties');
    //asset_properties.addEventListener('dragend', handlePropertiesDragEnd, false);
    //asset_properties.addEventListener('mousedown', handlePropertiesMouseDown, false);
    //asset_properties.addEventListener('mouseup', handlePropertiesMouseUp, false);

    /*
    ** Clean and start new diagram
     */

    newDiagram();

    // Remove Busy Icon if set
    unsetBusyIcon();

    /*
    $("#show-code").click(function(){
        $("#json-display").slideToggle();
        $("#json-display").removeClass('hidden');
        $("#properties").slideToggle();
    });
    */

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

