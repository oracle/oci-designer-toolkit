/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Javascript');
/*
** Add Clone to JSON package
 */
if (typeof JSON.clone !== "function") {
    JSON.clone = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };
}

let selectedArtefact = null;

/*
** Define OKIT Artifact Classes
 */
class OkitOCIConfig {
    constructor() {
        this.load();
    }

    load() {
        let me = this;
        $.getJSON('config/sections', function(resp) {$.extend(true, me, resp);console.info('Sections Response '+resp);});
        console.info(this);
    }
}

class OkitOCIData {
    constructor() {
        this.load();
    }

    load() {
        let me = this;
        $.getJSON('dropdown/data', function(resp) {$.extend(true, me, resp); console.info(me); me.query();});
    }

    save() {
        $.ajax({
            type: 'post',
            url: 'dropdown/data',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(this),
            success: function(resp) {
                console.info('OKIT Dropdown Data Saved');
            },
            error: function(xhr, status, error) {
                console.warn('Status : '+ status)
                console.warn('Error : '+ error)
            }
        });
    }

    query() {
        let me = this;
        $.getJSON('oci/dropdown', function(resp) {$.extend(true, me, resp); me.save(); console.info(me);});
    }

    /*
    ** Get functions to retrieve drop-down data.
     */

    getDBSystemShapes(family='') {
        if (family === '') {
            return this.db_system_shapes;
        } else {
            return this.db_system_shapes.filter(function(dss) {return dss.shape_family === family;});
        }
    }

    getDBSystemShape(shape) {
        console.log('Get DB Shape ' + shape);
        return this.db_system_shapes.filter(function(dss) {return dss.shape === shape;})[0];
    }

    getDBVersions() {
        return this.db_versions;
    }

    getInstanceShapes(type='') {
        if (type === '') {
            return this.shapes;
        } else {
            return this.shapes.filter(function(s) {return s.shape.startsWith(type);});
        }
    }

    getInstanceOS(shape='') {
        let oss = [];
        if (shape === '') {
            for (let image of this.images) {
                oss.push(image.operating_system);
            }
        } else {
            for (image of this.images) {
                if (image.shapes.includes(shape)) {
                    oss.push(image.operating_system);
                }
            }
        }
        console.info('>>>>>>> Instance OS : ' + oss);
        return [...new Set(oss)].sort();
    }

    getInstanceOSVersions(os='') {
        let versions = [];
        let os_images = this.images.filter(i => i.operating_system === os);
        console.info(`${os} Versions ${os_images}`)
        for (let image of os_images) {
            versions.push(image.operating_system_version);
        }
        return [...new Set(versions)].sort((a, b) => b - a);
    }
}

class OkitSettings {
    constructor() {
        this.is_default_security_list = false;
        this.is_default_route_table = false;
        this.is_timestamp_files = false;
        this.profile = 'DEFAULT';
        this.is_always_free = false;
        this.is_optional_expanded = true;
        this.is_display_grid = false;
        this.is_variables = true;
        this.icons_only = true;
        this.last_used_region = '';
        this.last_used_compartment = '';
        this.hide_attached = true;
        this.load();
    }

    getCookieName() {
        return 'okit-settings';
    }

    load() {
        let cookie_string = readCookie('okit-settings');
        if (cookie_string && cookie_string != '') {
            let cookie_json = JSON.parse(cookie_string);
            $.extend(this, cookie_json);
        } else {
            createCookie(this.getCookieName(), JSON.stringify(this));
        }
    }

    save() {
        createCookie(this.getCookieName(), JSON.stringify(this));
        console.info(this);
        redrawSVGCanvas();
    }

    erase() {
        eraseCookie(this.getCookieName());
    }

    edit() {
        let me = this;
        console.info('Settings:');
        console.info(this);
        // Display Save As Dialog
        $(jqId('modal_dialog_title')).text('Preferences');
        $(jqId('modal_dialog_body')).empty();
        $(jqId('modal_dialog_footer')).empty();
        // Build Body
        this.buildPanel('modal_dialog_body');
        // Footer
        d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
            .attr('id', 'save_as_button')
            .attr('type', 'button')
            .text('Save')
            .on('click', function () {
                me.is_display_grid = $(jqId('is_display_grid')).is(':checked');
                me.is_default_route_table = $(jqId('is_default_route_table')).is(':checked');
                me.is_default_security_list = $(jqId('is_default_security_list')).is(':checked');
                me.is_always_free = $(jqId('is_always_free')).is(':checked');
                me.is_timestamp_files = $(jqId('is_timestamp_files')).is(':checked');
                me.is_optional_expanded = $(jqId('is_optional_expanded')).is(':checked');
                me.is_variables = $(jqId('is_variables')).is(':checked');
                me.hide_attached = $(jqId('hide_attached')).is(':checked');
                me.profile = $(jqId('profile')).val();
                me.save();
                $(jqId('modal_dialog_wrapper')).addClass('hidden');
            });
        $(jqId('modal_dialog_wrapper')).removeClass('hidden');
    }

    buildPanel(panel_name='', autosave=false) {
        if (panel_name && panel_name !== '') {
            $(jqId(panel_name)).empty();
            let me = this;
            // Build Table
            let table = d3.select(d3Id(panel_name)).append('div').append('div')
                .attr('id', 'preferences_table')
                .attr('class', 'table okit-table okit-modal-dialog-table');
            let tbody = table.append('div').attr('class', 'tbody');
            let tr = tbody.append('div').attr('class', 'tr');
            // Display Grid
            tr.append('div').attr('class', 'td').text('');
            let td = tr.append('div').attr('class', 'td');
            td.append('input')
                .attr('id', 'is_display_grid')
                .attr('name', 'is_display_grid')
                .attr('type', 'checkbox')
                .property('checked', this.is_display_grid)
                .on('change', function () {
                    if (autosave) {
                        me.is_display_grid = $('#is_display_grid').is(':checked');
                        me.save();
                    }
                });
            td.append('label')
                .attr('for', 'is_display_grid')
                .text('Display Grid');
            // Default route Table
            tr = tbody.append('div').attr('class', 'tr');
            tr.append('div').attr('class', 'td').text('');
            td = tr.append('div').attr('class', 'td');
            td.append('input')
                .attr('id', 'is_default_route_table')
                .attr('name', 'is_default_route_table')
                .attr('type', 'checkbox')
                .property('checked', this.is_default_route_table)
                .on('change', function () {
                    if (autosave) {
                        me.is_default_route_table = $('#is_default_route_table').is(':checked');
                        me.save();
                    }
                });
            td.append('label')
                .attr('for', 'is_default_route_table')
                .text('Default Route Table');
            // Default Security List
            tr = tbody.append('div').attr('class', 'tr');
            tr.append('div').attr('class', 'td').text('');
            td = tr.append('div').attr('class', 'td');
            td.append('input')
                .attr('id', 'is_default_security_list')
                .attr('name', 'is_default_security_list')
                .attr('type', 'checkbox')
                .property('checked', this.is_default_security_list)
                .on('change', function () {
                    if (autosave) {
                        me.is_default_security_list = $('#is_default_security_list').is(':checked');
                        me.save();
                    }
                });
            td.append('label')
                .attr('for', 'is_default_security_list')
                .text('Default Security List');
            // Timestamp File
            tr = tbody.append('div').attr('class', 'tr');
            tr.append('div').attr('class', 'td').text('');
            td = tr.append('div').attr('class', 'td');
            td.append('input')
                .attr('id', 'is_timestamp_files')
                .attr('name', 'is_timestamp_files')
                .attr('type', 'checkbox')
                .property('checked', this.is_timestamp_files)
                .on('change', function () {
                    if (autosave) {
                        me.is_timestamp_files = $('#is_timestamp_files').is(':checked');
                        me.save();
                    }
                });
            td.append('label')
                .attr('for', 'is_timestamp_files')
                .text('Timestamp File Names');
            // Auto Expand Optional
            tr = tbody.append('div').attr('class', 'tr');
            tr.append('div').attr('class', 'td').text('');
            td = tr.append('div').attr('class', 'td');
            td.append('input')
                .attr('id', 'is_optional_expanded')
                .attr('name', 'is_optional_expanded')
                .attr('type', 'checkbox')
                .property('checked', this.is_optional_expanded)
                .on('change', function () {
                    if (autosave) {
                        me.is_optional_expanded = $('#is_optional_expanded').is(':checked');
                        me.save();
                    }
                });
            td.append('label')
                .attr('for', 'is_optional_expanded')
                .text('Auto Expanded Advanced');
            // Generate Variables File
            tr = tbody.append('div').attr('class', 'tr');
            tr.append('div').attr('class', 'td').text('');
            td = tr.append('div').attr('class', 'td');
            td.append('input')
                .attr('id', 'is_variables')
                .attr('name', 'is_variables')
                .attr('type', 'checkbox')
                .property('checked', this.is_variables)
                .on('change', function () {
                    if (autosave) {
                        me.is_variables = $('#is_variables').is(':checked');
                        me.save();
                    }
                });
            td.append('label')
                .attr('for', 'is_variables')
                .text('Use Variables in Generate');
            // Hide Attached Artefacts
            tr = tbody.append('div').attr('class', 'tr');
            tr.append('div').attr('class', 'td').text('');
            td = tr.append('div').attr('class', 'td');
            td.append('input')
                .attr('id', 'hide_attached')
                .attr('name', 'hide_attached')
                .attr('type', 'checkbox')
                .property('checked', this.hide_attached)
                .on('change', function () {
                    if (autosave) {
                        me.hide_attached = $('#hide_attached').is(':checked');
                        me.save();
                    }
                });
            td.append('label')
                .attr('for', 'hide_attached')
                .text('Hide Attached Artefacts');
            /*
            // Config Profile
            tr = tbody.append('div').attr('class', 'tr');
            tr.append('div').attr('class', 'td').text('Default Connection Profile');
            let profile_select = tr.append('div')
                .attr('class', 'td')
                .append('select')
                .attr('id', 'profile')
                .on('change', function () {
                    if (autosave) {
                        me.profile = $(this).val();
                        me.save();
                    }
                });
            for (let section of okitOciConfig.sections) {
                profile_select.append('option')
                    .attr('value', section)
                    .text(section);
            }
            $(jqId('profile')).val(this.profile);
            */
        }
    }

}
