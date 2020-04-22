/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Console Javascript');

const okitVersion = '0.5.0';
const okitReleaseDate = '13th May 2020';

function hideNavMenu() {
    $(jqId('navigation_menu')).removeClass('okit-navigation-menu-show');
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

    $(jqId('navigation_menu')).mouseover(function(e) {
        e.preventDefault();
        $(jqId('navigation_menu')).addClass('okit-navigation-menu-show');
    });

    $(jqId('navigation_menu')).mouseleave(function(e) {
        e.preventDefault();
        $(jqId('navigation_menu')).removeClass('okit-navigation-menu-show');
    });

    $(jqId('okit_version')).text('Version: ' + okitVersion + '  (' + okitReleaseDate + ')');

    $('li.dropdown').on('mouseover', function() {
        console.info(`>>>>>>> Over ${this.id}`);
        let menu_pos = $(this).position();
        console.info(`>>>>>>> Position y: ${menu_pos.top} x: ${menu_pos.left}`);
        let $slideout = $('> .dropdown-content', $(this));
        // TODO: Implement as part of Slide Out Menu fix
        //$slideout.css('position', 'fixed');
        //$slideout.css('top', menu_pos.top);
        //$slideout.css('left', menu_pos.left + $(this).outerWidth() * 0.75);
    });

});
