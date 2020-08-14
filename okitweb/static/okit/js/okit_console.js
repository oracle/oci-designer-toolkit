/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Console Javascript');

const okitVersion = '0.10.0';
const okitReleaseDate = '26th August 2020';
// Validation
const validate_error_colour = "#ff4d4d";
const validate_warning_colour = "#ffd633";

function hideNavMenu() {
    $(jqId('navigation_menu')).removeClass('okit-navigation-menu-show');
}

function checkForUpdate() {
    $.getJSON('https://raw.githubusercontent.com/oracle/oci-designer-toolkit/master/okitweb/static/okit/json/release.json', function(resp) {
        console.info(resp);
        const release = resp.release.split('.');
        const version = okitVersion.split('.');
        if ((Number(release[0]) > Number(version[0])) ||
            (Number(release[0]) === Number(version[0]) && Number(release[1]) > Number(version[1])) ||
            (Number(release[0]) === Number(version[0]) && Number(release[1]) === Number(version[01]) && Number(release[2]) > Number(version[2]))
        ) {
            console.info('OKIT Update Available');
            $(jqId('okit_update')).text(`Update: OKIT ${resp.release} Available for Download`);
            $(jqId('okit_update')).attr(`href`, `https://github.com/oracle/oci-designer-toolkit/tree/${resp.tag}`);
        }
    });
}

function showConfigErrors() {
    let msg = okitOciConfig.results.join('\n');
    alert(msg);
}

$(document).ready(function() {
    /*
    ** Add handler functionality
     */
    console.info('Adding Console Handlers');

    $(jqId('navigation_menu_button')).click(function(e) {
        e.preventDefault();
        $(jqId('navigation_menu')).toggleClass('okit-navigation-menu-show');
    });

    $(jqId('navigation_menu')).click(function(e) {
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
