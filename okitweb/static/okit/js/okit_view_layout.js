/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded View Layout Javascript');

function hideSideBars() {
    $("#console_left_bar").addClass('okit-slide-hide-left')
    $("#designer_left_column").addClass('okit-slide-hide-left')
    $("#designer_right_column").addClass('okit-slide-hide-right')
    $("#console_right_bar").children().removeClass('okit-bar-panel-displayed')
}

function showSideBars() {
    $("#console_left_bar").removeClass('okit-slide-hide-left')
    $("#designer_left_column").removeClass('okit-slide-hide-left')
}

function handleViewSelect(e) {
    const selected = $("#console_header_view_select").val();
    if (selected === 'designer') handleSwitchToCompartmentView(e)
    else if (selected === 'tabular') handleSwitchToTabularView(e)
    else if (selected === 'relationship') handleSwitchToRelationshipView(e)
    else if (selected === 'json') handleSwitchToTextJsonView(e)
    else console.warn('Unknown View', selected)
}

function hideAllViewDivs() {
    $("#canvas-div").addClass('hidden');
    $("#tabular-div").addClass('hidden');
    $("#network-div").addClass('hidden');
    $("#security-div").addClass('hidden');
    $("#relationship-div").addClass('hidden');
    $("#json-text-div").addClass('hidden');
}

function handleSwitchToCompartmentView(e) {
    //okitJsonView = new OkitDesignerJsonView(okitJsonModel);
    okitJsonView.update();
    hideAllViewDivs();
    $("#canvas-div").removeClass('hidden');
    showSideBars();
}

function handleSwitchToTabularView(e) {
    hideAllViewDivs();
    $("#tabular-div").removeClass('hidden');
    hideSideBars();
    okitTabularView = new OkitTabularJsonView(okitJsonModel, okitOciData);
    okitTabularView.draw();
}

function handleSwitchToNetworkView(e) {
    hideAllViewDivs();
    $("#network-div").removeClass('hidden');
    hideSideBars();
}

function handleSwitchToSecurityView(e) {
    hideAllViewDivs();
    $("#security-div").removeClass('hidden');
    hideSideBars();
}

function handleSwitchToRelationshipView(e) {
    hideAllViewDivs();
    $("#relationship-div").removeClass('hidden');
    hideSideBars();
    okitRelationshipView = new OkitRelationshipJsonView(okitJsonModel, okitOciData, resource_icons);
    okitRelationshipView.draw();
}

function handleSwitchToTextJsonView(e) {
    hideAllViewDivs();
    $("#json-text-div").removeClass('hidden');
    hideSideBars();
    okitTextJsonView = new OkitTextJsonView(okitJsonModel, okitOciData, resource_icons);
    okitTextJsonView.draw();
}
