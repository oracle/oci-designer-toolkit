console.log('Loaded Properties Javascript');

/*
** Property Sheet Load function
 */

function handlePropertiesDragEnd(e) {
    console.log('Properties Drag End');
}

var asset_propereties_width = 0;
function handlePropertiesMouseDown(e) {
    console.log('Properties Mouse Down : ' + e.target.clientWidth);
    asset_propereties_width = e.target.clientWidth;
}

function handlePropertiesMouseUp(e) {
    console.log('Properties Mouse Up : ' + e.target.clientWidth);
    if (asset_propereties_width != e.target.clientWidth) {
        redrawSVGCanvas();
    }
}

