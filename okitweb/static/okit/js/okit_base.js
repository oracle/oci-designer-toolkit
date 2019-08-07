/*
** Add handler functionality
 */

document.getElementById('nav-menu-button').addEventListener('click', handleNavMenuClick, false);

function handleNavMenuClick(evt) {
    console.log('Navigation Menu Clicked');
    var element = document.getElementById("console-nav-menu-panel");
    element.classList.toggle("nav-menu-panel-show");
}

function hideNavMenu() {
    var element = document.getElementById("console-nav-menu-panel");
    element.classList.remove("nav-menu-panel-show");
}

