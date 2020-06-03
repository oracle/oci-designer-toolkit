/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Console Javascript');

const okitVersion = '0.6.0';
const okitReleaseDate = '3rd June 2020';

function hideNavMenu() {
    $(jqId('navigation_menu')).removeClass('okit-navigation-menu-show');
}

function checkForUpdate() {
    $.getJSON('https://raw.githubusercontent.com/oracle/oci-designer-toolkit/master/okitweb/static/okit/json/release.json', function(resp) {
        console.info(resp);
        if (resp.release > okitVersion) {
            console.info('OKIT Update Available');
            $(jqId('okit_update')).text(`Update: OKIT ${resp.release} Available for Download`);
            $(jqId('okit_update')).attr(`href`, `https://github.com/oracle/oci-designer-toolkit/tree/${resp.tag}`);
        }
    });
}

$(document).ready(function() {
    /*
    ** Add handler functionality
     */
    console.info('Adding Console Handlers');

    $(jqId('navigation_menu_button')).mouseover(function(e) {
        e.preventDefault();
        $(jqId('navigation_menu')).addClass('okit-navigation-menu-show');
    });

    $(jqId('navigation_menu_button')).mouseleave(function(e) {
        e.preventDefault();
        $(jqId('navigation_menu')).removeClass('okit-navigation-menu-show');
    });

    $(jqId('navigation_menu_list')).mouseover(function(e) {
        e.preventDefault();
        $(jqId('navigation_menu')).addClass('okit-navigation-menu-show');
    });

    $(jqId('navigation_menu_list')).mouseleave(function(e) {
        e.preventDefault();
        $(jqId('navigation_menu')).removeClass('okit-navigation-menu-show');
    });

    $(jqId('okit_version')).text('Version: ' + okitVersion + '  (' + okitReleaseDate + ')');

    $('li.dropdown').on('mouseover', function() {
        console.info(`>>>>>>> Over ${this.id}`);
        let menu_pos = $(this).position();
        let width = $(this).outerWidth();
        console.info(`>>>>>>> Position y: ${menu_pos.top} x: ${menu_pos.left} w: ${width}`);
        let $slideout = $('> .dropdown-content', $(this));
        // TODO: Implement as part of Slide Out Menu fix
        $slideout.css('position', 'absolute');
        $slideout.css('top', menu_pos.top);
        $slideout.css('left', menu_pos.left + width);
    });

    checkForUpdate();

});
