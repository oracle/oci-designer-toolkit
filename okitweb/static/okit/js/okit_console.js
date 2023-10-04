/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Console Javascript');


const okitVersion = '0.55.0';
const okitReleaseDate = '4th October 2023';
// const okitReleaseDate = 'Nightly';

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
            $(jqId('okit_update')).attr(`href`, `https://github.com/oracle/oci-designer-toolkit`);
        }
    });
}

function showConfigErrors() {
    let msg = okitOciConfig.results.errors.join('\n');
    alert(msg);
}

function showSessionConfigDialog() {
    const session_config = {
        session_config: true,
        user: '',
        fingerprint: '',
        tenancy: '',
        region: 'uk-london-1',
        key_content: ''
    }
    let profile_name = 'Session'
    $(jqId('modal_dialog_title')).text('Create Session Config');
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    // const warning = d3.select(d3Id('modal_dialog_body')).append('div').append('label').attr('class', 'okit-warning').text('Only use with HTTPS connections')
    const table = d3.select(d3Id('modal_dialog_body')).append('div').attr('class', 'table okit-table');
    const tbody = table.append('div').attr('class', 'tbody');
    // Name
    let tr = tbody.append('div').attr('id', 'name_row').attr('class', 'tr');
    const warning = tr.append('div').attr('class', 'okit-warning-div').append('label').attr('class', 'okit-warning-label').text('Only use with HTTPS connections')
    tr = tbody.append('div').attr('id', 'name_row').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Name');
    let td = tr.append('div').attr('class', 'td');
    td.append('input')
        .attr('class', 'okit-input')
        .attr('id', 'session_profile_name')
        .attr('name', 'session_profile_name')
        .attr('type', 'text')
        .attr('value', profile_name)
        .on('blur', () => {
            profile_name = $('#session_profile_name').val()
        })
    // Tenancy OCID
    tr = tbody.append('div').attr('id', 'name_row').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Tenancy OCID');
    td = tr.append('div').attr('class', 'td');
    td.append('input')
        .attr('class', 'okit-input')
        .attr('id', 'session_profile_tenancy_ocid')
        .attr('name', 'session_profile_tenancy_ocid')
        .attr('value', session_config.tenancy)
        .attr('type', 'text')
        .on('blur', () => {
            session_config.tenancy = $('#session_profile_tenancy_ocid').val()
        })
    // Home Region
    tr = tbody.append('div').attr('id', 'name_row').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Home Region');
    td = tr.append('div').attr('class', 'td');
    td.append('input')
        .attr('class', 'okit-input')
        .attr('id', 'session_profile_home_region')
        .attr('name', 'session_profile_home_region')
        .attr('value', session_config.region)
        .attr('type', 'text')
        .on('blur', () => {
            session_config.region = $('#session_profile_home_region').val()
        })
    // User OCID
    tr = tbody.append('div').attr('id', 'name_row').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('User OCID');
    td = tr.append('div').attr('class', 'td');
    td.append('input')
        .attr('class', 'okit-input')
        .attr('id', 'session_profile_user_ocid')
        .attr('name', 'session_profile_user_ocid')
        .attr('value', session_config.user)
        .attr('type', 'text')
        .on('blur', () => {
            session_config.user = $('#session_profile_user_ocid').val()
        })
    // Fingerprint
    tr = tbody.append('div').attr('id', 'name_row').attr('class', 'tr');
    tr.append('div').attr('class', 'td').text('Fingerprint');
    td = tr.append('div').attr('class', 'td');
    td.append('input')
        .attr('class', 'okit-input')
        .attr('id', 'session_profile_fingerprint')
        .attr('name', 'session_profile_fingerprint')
        .attr('value', session_config.fingerprint)
        .attr('type', 'text')
        .on('blur', () => {
            session_config.fingerprint = $('#session_profile_fingerprint').val()
        })
    // Private Key
    tr = tbody.append('div').attr('id', 'name_row').attr('class', 'tr');
    td = tr.append('div').attr('class', 'td');
    td.append('button')
        .attr('id', 'import_private_key')
        .attr('type', 'button')
        .text('Import Private Key')
        .on('click', () => {
            /*
            ** Add Load File Handling
            */
            $('#files').off('change').on('change', (e) => {
                const files = e.target.files; // FileList object
                let reader = new FileReader();
                reader.onload = (evt) => {
                    session_config.key_content = evt.target.result
                    $('#session_private_key').text(session_config.key_content)
                    console.debug('Session Config', session_config)
                };
                reader.onerror = (evt) => {console.info('Error: ' + evt.target.error.name);};
                reader.readAsText(files[0]);                            
            });
            $('#files').attr('accept', '.pem');
            $('#files').prop('accept', '.pem');
            // Click Files Element
            let fileinput = document.getElementById("files");
            fileinput.click();
        });
    td = tr.append('div').attr('class', 'td');
    td.append('pre').attr('id', 'session_private_key')
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_btn')
        .attr('type', 'button')
        .text('Save')
        .on('click', () => {
            if (session_config.user.trim() !== '' && session_config.tenancy.trim() !== '' && session_config.fingerprint.trim() !== '' && session_config.region.trim() !== '' && session_config.key_content.trim() !== '') {
                okitSessionOciConfigs.configs[profile_name] = session_config
                okitOciConfig.load()
                // Hide modal dialog
                $(jqId('modal_dialog_wrapper')).addClass('hidden');
            } else {
                alert('All Config Properties are required.')
            }
        });
    // Show
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
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
    const element = document.getElementById('navigation_menu')
    const scrollBarWidth = element.offsetWidth - element.clientWidth;
    console.info('Scroll Bar Width', scrollBarWidth)
    const $slideout = $('> .dropdown-content', $(self));
    // console.info('=================================', self.id)
    // console.info('Parent', parentX, parentY, parentW)
    // console.info('Menu', menuX, menuY, width)
    // console.info('Scroll', scrollX, scrollY)
    // console.info('Nav', navX, navY)
    $slideout.css('position', 'absolute');
    $slideout.css('top', menuY + scrollY);
    $slideout.css('left', parentX + menuX + width - scrollBarWidth - 5);
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
    // okitOciConfig.sections.forEach((section) => {console_header_config_select.append($('<option>').attr('value', section).attr('disabled', section === 'Error').text(section))})
    okitOciConfig.validated_sections.forEach((section) => {console_header_config_select.append($('<option>').attr('value', section.section).attr('disabled', !section.valid).attr('title', section.reason).text(section.section))})
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
    okitSettings.region = undefined
    okitSettings.save()
    const console_header_region_select = $('#console_header_region_select')
    console_header_region_select.empty()
    console_header_region_select.append($('<option>').attr('value', '').text('Retrieving....'))
    okitRegions.clearLocalStorage()
    okitRegions.load(okitSettings.profile)
    // okitOciData.load(okitSettings.profile, okitSettings.region)
    // setOCILink()
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
    console_header_region_select.val(okitSettings.region).change()
    // okitOciData.load(okitSettings.profile, okitSettings.region)
    // setOCILink()
}

function handleRegionChanged(event) {
    event = event || window.event;
    if (event) event.stopPropagation()
    okitSettings.region = $('#console_header_region_select').val()
    okitSettings.save()
    okitOciData.load(okitSettings.profile, okitSettings.region)
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
