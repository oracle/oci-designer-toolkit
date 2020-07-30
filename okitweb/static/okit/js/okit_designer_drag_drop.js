/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Drag & Drop Javascript');

/*
** Define Connector Drag & Drop functions point manipulation code.
 */
let connectorStartElement = null;
let connectorStartXLeft = 0;
let connectorStartYTop = 0;
let connectorContainerSVGPoint = null;
let connectorContainerScreenCTM = null;

/*
** Define Dynamic Add/Update function
 */

let asset_add_functions = {};
let asset_update_functions = {};
let asset_delete_functions = {};
let asset_query_functions = {};
let asset_clear_functions = [];

function updateAssetTarget(title, source_type, source_id, target_id) {
    window[asset_update_functions[title]](source_type, source_id, target_id);
    okitJsonView.draw();
}

function deleteAssetFromSVG(artefact, id) {
    console.info('deleteAssetFromSVG - Artifact       : ' + artefact);
    console.info('deleteAssetFromSVG - Id             : ' + id);
    let deleteFunction = 'delete' + artefact.split(' ').join('');
    console.info('Delete Function : ' + deleteFunction);
    okitJsonView[deleteFunction](id);
    // Hide Context Menu
    $("#context-menu").addClass("hidden");
}

/*
** Drag & Drop Handlers
 */

/*
** Define palette Drag & Drop functions
 */

let palette_drag_artefact = null;

function dragStart(evt, artefact) {
    evt.dataTransfer.effectAllowed = 'copy';
    let palette_artefact_data = {artefact: artefact.getArtifactReference(), title: artefact.getArtifactReference()};
    let data_string = JSON.stringify(palette_artefact_data);
    evt.dataTransfer.setData('text/plain', data_string);
    palette_drag_artefact = artefact;
}

function dragFragmentStart(evt, artefact, title) {
    evt.dataTransfer.effectAllowed = 'copy';
    let palette_artefact_data = {artefact: artefact.getArtifactReference(), title: title};
    let data_string = JSON.stringify(palette_artefact_data);
    evt.dataTransfer.setData('text/plain', data_string);
    palette_drag_artefact = artefact;
}

function dragEnter(evt) {
    evt = evt || d3.event;
    dragEnterOverLeave(evt);
}

function dragOver(evt) {
    evt = evt || d3.event;
    if (evt.preventDefault) {
        evt.preventDefault(); // Necessary. Allows us to drop.
    }
    dragEnterOverLeave(evt);
}

function dragLeave(evt) {
    evt = evt || d3.event;
}

function dragEnterOverLeave(evt) {
    evt = evt || d3.event;
    let type = evt.target.getAttribute('data-type');
    if (palette_drag_artefact !== undefined && palette_drag_artefact.getDropTargets().indexOf(type) >= 0) {
        evt.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
    } else {
        evt.dataTransfer.effectAllowed = "none";
        evt.dataTransfer.dropEffect = "none";
    }
}

function dragDrop(evt) {
    evt = evt || d3.event;
    if (evt.stopPropagation) {
        evt.stopPropagation(); // Stops some browsers from redirecting.
    }
    if (evt.preventDefault) {
        evt.preventDefault(); // Necessary. Allows us to drop.
    }
    let palette_artefact_data = JSON.parse(evt.dataTransfer.getData('text/plain'));
    let target = {
        id: evt.target.id,
        type: evt.target.getAttribute('data-type'),
        compartment_id: evt.target.getAttribute('data-compartment-id'),
        title: palette_artefact_data.title
    };
    let artefact = palette_drag_artefact;
    // Add the Artifact to the OKIT Json / Canvas
    let dropFunction = 'drop' + artefact.name;
    console.info('Drop Function : ' + dropFunction);
    let result = okitJsonView[dropFunction](target);
    if (result) {
        console.debug(JSON.stringify(result, null, 2));
    }
    okitJsonView.draw();
    // Clear Drag class
    this.classList.remove('over');  // this / e.target is previous target element.
    palette_drag_artefact = null;
    return false;
}

function dragEnd(evt) {
    evt = evt || d3.event;
    console.info('>>>>>>> Drag End ' + evt);
}


/*
** SVG Psudo Drag & Drop
 */

function handleConnectorDrag(e) {
    if (connectorStartElement) {
        let mousePos = getMousePosition(d3.event);
        d3.select("#Connector")
            .attr("x2", mousePos.x)
            .attr("y2", mousePos.y);
    }
}

const left_click = 1;
const middle_click = 2;
const right_click = 3;

function handleConnectorDragStart() {
    console.info('Connector Drag Start');
    if (d3.event.which == left_click) {
        let thisid = d3.select(this).attr('id');
        console.info('This Id : ' + thisid);
        let source_type = d3.select(this).attr('data-type');
        if (asset_connect_targets.hasOwnProperty(source_type) && asset_connect_targets[source_type].length > 0) {
            // Set Start Element to know we are dragging
            connectorStartElement = this;
            let parent_id = d3.select(this).attr('data-parent-id');
            let parent_svg = document.getElementById(parent_id + "-svg");

            console.info('Connector Drag Start Parent Id : ' + parent_id);
            console.info('Connector Drag Start Id : ' + d3.select(this).attr('id'));
            console.info('Connector Drag Start data-connector-start-y : ' + d3.select(this).attr('data-connector-start-y'));
            console.info('Connector Drag Start data-connector-start-x : ' + d3.select(this).attr('data-connector-start-x'));

            // Define SVG position manipulation variables
            connectorContainerSVGPoint = parent_svg.createSVGPoint();
            connectorContainerScreenCTM = parent_svg.getScreenCTM();
            connectorContainerSVGPoint.x = d3.select(this).attr('data-connector-start-x');
            connectorContainerSVGPoint.y = d3.select(this).attr('data-connector-start-y');

            // Convert to SVG Relative positioning
            let svgrelative = connectorContainerSVGPoint.matrixTransform(connectorContainerScreenCTM.inverse());
            connectorStartXLeft = svgrelative.x;
            connectorStartYTop = svgrelative.y;

            // Start Drawing line
            svg = d3.select(d3Id(parent_id + "-svg"));
            svg.append('line')
                .attr("id", "Connector")
                .attr("x1", connectorStartXLeft)
                .attr("y1", connectorStartYTop)
                .attr("x2", connectorStartXLeft)
                .attr("y2", connectorStartYTop)
                .attr("stroke-width", "2")
                .attr("stroke-dasharray", "3, 3")
                .attr("stroke", "darkgray");
        } else {
            console.info('Not a drag source : ' + source_type);
            connectorStartElement = null;
            connectorStartXLeft = 0;
            connectorStartYTop = 0;
            d3.selectAll("#Connector").remove();
        }
        // Hide Context Menu
        $("#context-menu").addClass("hidden");
    }
}

// TODO: Delete
function handleConnectorDragEnter(e) {
    if (connectorStartElement) {
        //console.info('Connector Drag Enter : ' + e.target.id + ' - ' + e.target.getAttribute('data-type'));
    }
}

// TODO: Delete
function handleConnectorDragLeave(e) {
    if (connectorStartElement) {
        //console.info('Connector Drag Leave : ' + e.target.id + ' - ' + e.target.getAttribute('data-type'));
    }
}

// TODO: Delete
function handleConnectorDrop(e) {
    console.info('Connector Drop');
    let thisid = d3.select(this).attr('id');
    console.info('This Id : ' + thisid);
    if (connectorStartElement) {
        let sourceType = connectorStartElement.getAttribute('data-type');
        let destinationType = d3.select(this).attr('data-type');
        let parentid = d3.select(this).attr('data-parent-id');
        let sourceid = connectorStartElement.getAttribute('data-okit-id');
        let source_parent_id = connectorStartElement.getAttribute('data-parent-id');
        let id = d3.select(this).attr('data-okit-id');
        let connector_source_id = connectorStartElement.getAttribute('data-connector-id');
        let connector_destination_id = d3.select(this).attr('data-connector-id');

        console.info('Connector Source Type : ' + sourceType);
        console.info('Connector Destination Type : ' + destinationType);
        console.info('Connector Allowed : ' + JSON.stringify(asset_connect_targets));

        console.info('Connector Drag Start Id : ' + sourceid);
        console.info('Connector Drag Start Parent Id : ' + source_parent_id);
        console.info('Connector Drag End Id : ' + d3.select(this).attr('id'));
        console.info('Connector Drag End Parent Id : ' + parentid);
        console.info('Connector Drag End data-connector-end-y : ' + d3.select(this).attr('data-connector-end-y'));
        console.info('Connector Drag End data-connector-end-x : ' + d3.select(this).attr('data-connector-end-x'));
        console.info('Connector Source Id : ' + connector_source_id);
        console.info('Connector Destination Id : ' + connector_destination_id);

        // Check is Connection of
        if (asset_connect_targets[sourceType].indexOf(destinationType) >= 0) {
            updateAssetTarget(destinationType, sourceType, sourceid, id);
        }
    }

    connectorStartElement = null;
    connectorStartXLeft = 0;
    connectorStartYTop = 0;
    d3.selectAll("#Connector").remove();
}

function getMousePosition(evt) {
    if (evt.touches) { evt = evt.touches[0]; }
    return {
        x: (evt.clientX - connectorContainerScreenCTM.e) / connectorContainerScreenCTM.a,
        y: (evt.clientY - connectorContainerScreenCTM.f) / connectorContainerScreenCTM.d
    };
}

function handleContextMenu() {
    let thisid = d3.select(this).attr('id');
    let okit_id = d3.select(this).attr('data-okit-id');
    let artefact = d3.select(this).attr('data-type');
    console.info('Right Click on ' + thisid);
    d3.event.preventDefault();
    d3.event.stopPropagation();
    let element = document.getElementById("context-menu");
    element.classList.toggle("hidden");
    element.style.top =  d3.event.clientY + 'px';
    element.style.left = d3.event.clientX + 'px';
    $("#context-menu").find("*").off();
    $("#right-click-delete").on('click', function() {deleteAssetFromSVG(artefact, okit_id);});
}

