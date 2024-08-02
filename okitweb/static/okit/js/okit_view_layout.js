/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded View Layout Javascript');

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
    else if (selected === 'freeform') handleSwitchFreeFormView(e)
    else if (selected === 'bom') handleSwitchBoMView(e)
    else if (selected === 'cache') handleSwitchToTextCacheView(e)
    else if (selected === 'identity') handleSwitchToIdentityView(e)
    else if (selected === 'json') handleSwitchToTextJsonView(e)
    else if (selected === 'markdown') handleSwitchMarkdownView(e)
    else if (selected === 'relationship') handleSwitchToRelationshipView(e)
    else if (selected === 'tabular') handleSwitchToTabularView(e)
    else if (selected === 'terraform') handleSwitchTerraformView(e)
    else if (selected === 'variables') handleSwitchVariablesView(e)
    else console.warn('Unknown View', selected)
}

function hideAllViewDivs() {
    $("#center-panels > div").each((i, e) => $(e).addClass('hidden'))
    $("#zoom_controls > div").each((i, e) => $(e).addClass('hidden'))
    slideRightPanel()
}

function handleSwitchToCompartmentView(e) {
    // okitJsonView = new OkitCompartmentJsonView(okitJsonModel, okitOciData, resource_icons);
    // Clear the SVG info in the Markdown Panel
    d3.select(d3Id('markdown-div')).selectAll('*').remove()
    okitJsonView.update();
    hideAllViewDivs();
    $("#canvas-div").removeClass('hidden');
    showSideBars();
    $("#zoom_controls > div").each((i, e) => $(e).removeClass('hidden'))
    loadVariablesDatalist()
}

function handleSwitchFreeFormView(e) {
    hideAllViewDivs();
    $("#freeform-div").removeClass('hidden');
    hideSideBars();
    const okitFile = new OkitFile()
    console.info('File', okitFile)
    Object.entries(okitJsonModel).forEach(([k,v]) => {
        if (Array.isArray(v)) okitFile.model.oci.region.undefined.resources[k] = v
    })
    okitFreeformView = OkitFreeformView.newView(okitFile, okitOciData, resource_icons);
    okitFreeformView.draw();
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

function handleSwitchBoMView(e) {
    hideAllViewDivs();
    $("#bom-div").removeClass('hidden');
    hideSideBars();
    okitBoMView = OkitBoMView.newView(okitJsonModel, okitOciData, resource_icons);
    okitBoMView.draw();
}

function handleSwitchMarkdownView(e) {
    hideAllViewDivs();
    $("#markdown-div").removeClass('hidden');
    hideSideBars();
    okitMarkdownView = OkitMarkdownView.newView(okitJsonModel, okitOciData, resource_icons);
    okitMarkdownView.draw();
}

function handleSwitchVariablesView(e) {
    hideAllViewDivs();
    $("#variables-div").removeClass('hidden');
    hideSideBars();
    okitVariablesView = OkitVariablesView.newView(okitJsonModel, okitOciData, resource_icons);
    okitVariablesView.draw();
}
