/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded View Layout Javascript');

function hideAllViewDivs() {
    $("#canvas-div").addClass('hidden');
    $("#tabular-div").addClass('hidden');
    $("#network-div").addClass('hidden');
    $("#security-div").addClass('hidden');
    $("#relationship-div").addClass('hidden');
}

function handleSwitchToCompartmentView(e) {
    //okitJsonView = new OkitDesignerJsonView(okitJsonModel);
    okitJsonView.update();
    hideAllViewDivs();
    $("#canvas-div").removeClass('hidden');
}

function handleSwitchToTabularView(e) {
    hideAllViewDivs();
    $("#tabular-div").removeClass('hidden');
    okitTabularView = new OkitTabularJsonView(okitJsonModel, okitOciData);
    okitTabularView.draw();
}

function handleSwitchToNetworkView(e) {
    hideAllViewDivs();
    $("#network-div").removeClass('hidden');
}

function handleSwitchToSecurityView(e) {
    hideAllViewDivs();
    $("#security-div").removeClass('hidden');
}

function handleSwitchToRelationshipView(e) {
    hideAllViewDivs();
    $("#relationship-div").removeClass('hidden');
    okitRelationshipView = new OkitRelationshipJsonView(okitJsonModel, okitOciData, resource_icons);
    okitRelationshipView.draw();
}
