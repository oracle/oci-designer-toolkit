/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Console Javascript');

const okitVersion = '0.23.1';
const okitReleaseDate = '21st June 2021';
// Validation
const validate_error_colour = "#ff4d4d";
const validate_warning_colour = "#ffd633";

function hideNavMenu() {
    $(jqId('navigation_menu')).removeClass('okit-navigation-menu-show');
}

function checkForUpdate() {
    $.getJSON('https://raw.githubusercontent.com/oracle/oci-designer-toolkit/master/okitweb/static/okit/json/release.json', function(resp) {
        const release = resp.release.split('.');
        const version = okitVersion.split('.');
        if ((Number(release[0]) > Number(version[0])) ||
            (Number(release[0]) === Number(version[0]) && Number(release[1]) > Number(version[1])) ||
            (Number(release[0]) === Number(version[0]) && Number(release[1]) === Number(version[1]) && Number(release[2]) > Number(version[2]))
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

function handleSlideOutMouseOver(elem) {
    console.warn(`SlideOutMouseOver ${elem.id}`);
}

function handleDropdownMenuMouseOver(event) {
    event = event || window.event;
    event.stopPropagation();
    const self = event.currentTarget ? event.currentTarget : event.target;
    const parentX = $(self).parent().position().left;
    const parentY = $(self).parent().position().top;
    const parentW = $(self).parent().innerWidth();
    const menuX = $(self).position().left;
    const menuY = $(self).position().top;
    const width = $(self).innerWidth();
    const scrollX = $('#navigation_menu').scrollLeft();
    const scrollY = $('#navigation_menu').scrollTop();
    const navX = $('#navigation_menu').offset().left;
    const navY = $('#navigation_menu').offset().top;
    const $slideout = $('> .dropdown-content', $(self));
    // console.info('=================================', self.id)
    // console.info('Parent', parentX, parentY, parentW)
    // console.info('Menu', menuX, menuY, width)
    // console.info('Scroll', scrollX, scrollY)
    // console.info('Nav', navX, navY)
    $slideout.css('position', 'absolute');
    $slideout.css('top', menuY + scrollY);
    $slideout.css('left', parentX + menuX + width);
}

function handleDropdownMenuMouseOverOld(event) {
    event = event || window.event;
    event.stopPropagation();
    const self = event.currentTarget ? event.currentTarget : event.target;
    const parentX = $(self).parent().position().left;
    const parentY = $(self).parent().position().top;
    const parentW = $(self).parent().innerWidth();
    const menuX = $(self).position().left;
    const menuY = $(self).position().top;
    const width = $(self).innerWidth();
    const scrollX = $('#navigation_menu').scrollLeft();
    const scrollY = $('#navigation_menu').scrollTop();
    const navX = $('#navigation_menu').offset().left;
    const navY = $('#navigation_menu').offset().top;
    const $slideout = $('> .dropdown-content', $(self));
    console.info('=================================', self.id)
    console.info('Parent', parentX, parentY, parentW)
    console.info('Menu', menuX, menuY, width)
    console.info('Scroll', scrollX, scrollY)
    console.info('Nav', navX, navY)
    $slideout.css('position', 'absolute');
    $slideout.css('top', menuY + scrollY);
    $slideout.css('left', parentX + menuX + width);
}

function loadHeaderConfigDropDown() {
    /*
    ** Populate Dropdown
    */
    const console_header_config_select = $('#console_header_config_select')
    console_header_config_select.empty()
    okitOciConfig.sections.forEach((section) => {console_header_config_select.append($('<option>').attr('value', section).text(section))})
    console_header_config_select.val(okitSettings.profile)
    const console_header_region_select = $('#console_header_region_select')
    console_header_region_select.empty()
    console_header_region_select.append($('<option>').attr('value', '').text('Retrieving....'))
    okitRegions.load(okitSettings.profile)
}

function handleConfigChanged(event) {
    event = event || window.event;
    event.stopPropagation()
    okitSettings.profile = $('#console_header_config_select').val()
    okitSettings.save()
    const console_header_region_select = $('#console_header_region_select')
    console_header_region_select.empty()
    console_header_region_select.append($('<option>').attr('value', '').text('Retrieving....'))
    okitRegions.load(okitSettings.profile)
    okitOciData.load(okitSettings.profile)
}

function loadHeaderRegionsDropDown() {
    /*
    ** Populate Dropdown
    */
    const console_header_region_select = $('#console_header_region_select')
    console_header_region_select.empty()
    okitRegions.regions.forEach((region) => {console_header_region_select.append($('<option>').attr('value', region.id).text(region.display_name))})
    if (!okitRegions.isRegionAvailable(okitSettings.region)) {
        okitSettings.region = okitRegions.getHomeRegion().id
        okitSettings.save()
    }
    console.info('Region:', okitSettings.region)
    console_header_region_select.val(okitSettings.region)
    setOCILink()
}

function handleRegionChanged(event) {
    event = event || window.event;
    event.stopPropagation()
    okitSettings.region = $('#console_header_region_select').val()
    okitSettings.save()
    setOCILink()
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

    checkForUpdate();

});
