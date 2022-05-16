/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
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
    // const selected = $("#console_header_view_select").val();
    const selected = $("#toolbar_view_select").val();
    if (selected === 'designer') handleSwitchToCompartmentView(e)
    else if (selected === 'tabular') handleSwitchToTabularView(e)
    else if (selected === 'relationship') handleSwitchToRelationshipView(e)
    else if (selected === 'json') handleSwitchToTextJsonView(e)
    else if (selected === 'cache') handleSwitchToTextCacheView(e)
    else if (selected === 'identity') handleSwitchToIdentityView(e)
    else if (selected === 'terraform') handleSwitchTerraformView(e)
    else console.warn('Unknown View', selected)
}

function hideAllViewDivs() {
    $("#center-panels > div").each((i, e) => $(e).addClass('hidden'))
    $("#zoom_controls > div").each((i, e) => $(e).addClass('hidden'))
    slideRightPanel()
}

function handleSwitchToCompartmentView(e) {
    //okitJsonView = new OkitDesignerJsonView(okitJsonModel);
    okitJsonView.update();
    hideAllViewDivs();
    $("#canvas-div").removeClass('hidden');
    showSideBars();
    $("#zoom_controls > div").each((i, e) => $(e).removeClass('hidden'))
}

function handleSwitchToTabularView(e) {
    hideAllViewDivs();
    $("#tabular-div").removeClass('hidden');
    hideSideBars();
    // okitTabularView = new OkitTabularJsonView(okitJsonModel, okitOciData);
    okitTabularView = OkitTabularJsonView.newView(okitJsonModel, okitOciData, resource_icons);
    okitTabularView.draw();
}

function handleSwitchToIdentityView(e) {
    hideAllViewDivs();
    $("#identity-div").removeClass('hidden');
    hideSideBars();
    // okitIdentityView = new OkitIdentityView(okitJsonModel, okitOciData);
    okitIdentityView = OkitIdentityView.newView(okitJsonModel, okitOciData, resource_icons);
    okitIdentityView.draw();
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
    // okitRelationshipView = new OkitRelationshipJsonView(okitJsonModel, okitOciData, resource_icons);
    okitRelationshipView = OkitRelationshipJsonView.newView(okitJsonModel, okitOciData, resource_icons);
    okitRelationshipView.draw();
}

function handleSwitchToTextJsonView(e) {
    hideAllViewDivs();
    $("#json-text-div").removeClass('hidden');
    hideSideBars();
    // okitTextJsonView = new OkitTextJsonView(okitJsonModel, okitOciData, resource_icons);
    okitTextJsonView = OkitTextJsonView.newView(okitJsonModel, okitOciData, resource_icons);
    okitTextJsonView.draw();
}

function handleSwitchToTextCacheView(e) {
    hideAllViewDivs();
    $("#json-text-div").removeClass('hidden');
    hideSideBars();
    okitCacheJsonView = new OkitCacheJsonView(okitOciData.getCache(), okitOciData, resource_icons);
    okitCacheJsonView.draw();
}

function handleSwitchTerraformView(e) {
    hideAllViewDivs();
    $("#terraform-div").removeClass('hidden');
    hideSideBars();
    // okitTerraformView = new OkitTerraformView(okitJsonModel, okitOciData, resource_icons);
    okitTerraformView = OkitTerraformView.newView(okitJsonModel, okitOciData, resource_icons);
    okitTerraformView.draw();
}
