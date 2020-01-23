/*
** Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
** The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]
*/
/*
** Add handler functionality
 */

function handleNavMenuClick(evt) {
    //console.info('Navigation Menu Clicked');
    let element = document.getElementById("console-nav-menu-panel");
    element.classList.toggle("nav-menu-panel-show");
}

function handleNavMenuMouseEnter(evt) {
    //console.info('Mouse Enter');
    this.classList.add("nav-menu-panel-show");
}

function handleNavMenuMouseLeave(evt) {
    //console.info('Mouse Leave');
    this.classList.remove("nav-menu-panel-show");
}

function hideNavMenu() {
    let element = document.getElementById("console-nav-menu-panel");
    element.classList.remove("nav-menu-panel-show");
}

$(document).ready(function() {
    document.getElementById('nav-menu-button').addEventListener('click', handleNavMenuClick, false);
    document.getElementById('console-nav-menu-panel').addEventListener('mouseleave', handleNavMenuMouseLeave, false);
    document.getElementById('console-nav-menu-panel').addEventListener('mouseenter', handleNavMenuMouseEnter, false);
});

