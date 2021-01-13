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
/*
** Add Clean function to JSON to remove null & undefined elements
 */
if (typeof JSON.clean !== "function") {
    JSON.clean = obj => {
        if (Array.isArray(obj)) {
            return obj
                .map(v => (v && v instanceof Object) ? JSON.clean(v) : v)
                .filter(v => !(v == null));
        } else {
            return Object.entries(obj)
                .map(([k, v]) => [k, v && v instanceof Object ? JSON.clean(v) : v])
                .reduce((a, [k, v]) => (v == null ? a : (a[k]=v, a)), {});
        }
    }
}

let selectedArtefact = null;

/*
** Define OKIT Artifact Classes
 */
class OkitOCIConfig {
    constructor() {
        this.results = [];
        this.validate();
        this.load();
    }

    load() {
        let me = this;
        $.getJSON('config/sections', function(resp) {$.extend(true, me, resp);});
    }

    validate() {
        let me = this;
        $.getJSON('config/validate', function(resp) {
            me.results = resp.results;
            if (me.results.length > 0) {
                $('#config_link').removeClass('hidden');
            }
        });
    }
}

class OkitGITConfig {
    constructor() {
        this.load();
    }

    load() {
        let me = this;
        $.getJSON('config/appsettings', function(resp) {$.extend(true, me, resp);});
    }
}

class OkitOCIData {
    constructor() {
        this.compartments = [];
        this.load();
    }

    load() {
        let me = this;
        $.getJSON('dropdown/data', function(resp) {$.extend(true, me, resp); me.query();});
    }

    save() {
        $.ajax({
            type: 'post',
            url: 'dropdown/data',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(this.cloneForSave()),
            success: function(resp) {},
            error: function(xhr, status, error) {
                console.warn('Status : '+ status);
                console.warn('Error  : '+ error);
            }
        });
    }

    cloneForSave() {
        let clone = JSON.clone(this);
        if (developer_mode) {
            clone.compartments = [];
        }
        return clone;
    }

    query() {
        let me = this;
        $.getJSON('oci/dropdown', function(resp) {$.extend(true, me, resp); me.save();});
    }

    /*
    ** Get functions to retrieve drop-down data.
     */

    getCpeDeviceShapes() {
        return this.cpe_device_shapes;
    }

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
            for (let image of this.images) {
                if (image.shapes.includes(shape)) {
                    oss.push(image.operating_system);
                }
            }
        }
        return [...new Set(oss)].sort();
    }

    getInstanceOSVersions(os='') {
        let versions = [];
        let os_images = this.images.filter(i => i.operating_system === os);
        for (let image of os_images) {
            versions.push(image.operating_system_version);
        }
        return [...new Set(versions)].sort((a, b) => b - a);
    }

    getInstanceImages(os='', version='') {
        let images = [];
        let os_images = this.images.filter(i => i.operating_system === os);
        let version_images = os_images.filter(i => i.operating_system_version === version);
        for (let image of version_images) {
            images.push(image.display_name);
        }
        return [...new Set(images)].sort((a, b) => b - a);
    }

    getKubernetesVersions() {
        return this.kubernetes_versions;
    }

    getLoadBalaancerShapes() {
        return this.loadbalancer_shapes;
    }

    getMySQLConfigurations(shape_name='') {
        if (shape_name === '') {
            return this.mysql_configurations;
        } else {
            return this.mysql_configurations.filter(function(dss) {return dss.shape_name === shape_name;});
        }
    }

    getMySQLShapes() {
        return this.mysql_shapes;
    }

    getMySQLVersions(family='') {
        return this.mysql_versions[0].versions;
    }

    getRegions() {
        return this.regions;
    }

    getCompartments() {
        return this.compartments;
    }

    setCompartments(compartments) {
        this.compartments = compartments;
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
        this.is_variables = false;
        this.icons_only = true;
        this.last_used_region = '';
        this.last_used_compartment = '';
        this.hide_attached = true;
        this.highlight_association = true;
        this.show_label = 'none';
        this.tooltip_type = 'simple';
        this.name_prefix = 'okit-';
        this.auto_save = false;
        this.show_ocids = false;
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
        redrawSVGCanvas(true);
    }

    erase() {
        eraseCookie(this.getCookieName());
    }

    edit() {
        let me = this;
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
                me.show_label = $("input:radio[name='show_label']:checked").val();
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
            // Auto Save
            this.addAutoSave(tbody, autosave);
            // Display Grid
            this.addDisplayGrid(tbody, autosave);
            // Default Route Table
            this.addDefaultRouteTable(tbody, autosave)
            // Default Security List
            this.addDefaultSecurityList(tbody, autosave);
            // Timestamp File
            this.addTimestamp(tbody, autosave);
            // Auto Expand Optional
            this.addAutoExpandAdvanced(tbody, autosave);
            // Generate Variables File
            this.addUseVariables(tbody, autosave);
            // Hide Attached Artefacts
            this.addHideAttachedArtefacts(tbody, autosave);
            // Highlight Associations
            this.addHighlightAssociations(tbody, autosave);
            // Display OCIDs
            this.addShowOcids(tbody, autosave);
            // Display Label
            this.addDisplayLabel(tbody, autosave);
            // Tooltip Style
            this.addTooltipType(tbody, autosave);
            // Name Prefix
            this.addNamePrefix(tbody, autosave);
            // Config Profile
            //this.addConfigProfile(tbody, autosave);
        }
    }

    addAutoSave(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'auto_save')
            .attr('name', 'auto_save')
            .attr('type', 'checkbox')
            .property('checked', this.auto_save)
            .on('change', function () {
                if (autosave) {
                    self.auto_save = $('#auto_save').is(':checked');
                    self.save();
                }
                if ($('#auto_save').is(':checked')) {
                    if (okitAutoSave) {okitAutoSave.startAutoSave();}
                } else {
                    if (okitAutoSave) {okitAutoSave.stopAutoSave();}
                }
            });
        td.append('label')
            .attr('for', 'auto_save')
            .text('Auto Save');
    }

    addDisplayGrid(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'is_display_grid')
            .attr('name', 'is_display_grid')
            .attr('type', 'checkbox')
            .property('checked', this.is_display_grid)
            .on('change', function () {
                if (autosave) {
                    self.is_display_grid = $('#is_display_grid').is(':checked');
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'is_display_grid')
            .text('Display Grid');
    }

    addDefaultRouteTable(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'is_default_route_table')
            .attr('name', 'is_default_route_table')
            .attr('type', 'checkbox')
            .property('checked', this.is_default_route_table)
            .on('change', function () {
                if (autosave) {
                    self.is_default_route_table = $('#is_default_route_table').is(':checked');
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'is_default_route_table')
            .text('Default Route Table');
    }

    addDefaultSecurityList(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'is_default_security_list')
            .attr('name', 'is_default_security_list')
            .attr('type', 'checkbox')
            .property('checked', this.is_default_security_list)
            .on('change', function () {
                if (autosave) {
                    self.is_default_security_list = $('#is_default_security_list').is(':checked');
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'is_default_security_list')
            .text('Default Security List');
    }

    addTimestamp(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'is_timestamp_files')
            .attr('name', 'is_timestamp_files')
            .attr('type', 'checkbox')
            .property('checked', this.is_timestamp_files)
            .on('change', function () {
                if (autosave) {
                    self.is_timestamp_files = $('#is_timestamp_files').is(':checked');
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'is_timestamp_files')
            .text('Timestamp File Names');
    }

    addUseVariables(tbody, autosave) {
        // Generate Variables File
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'is_variables')
            .attr('name', 'is_variables')
            .attr('type', 'checkbox')
            .property('checked', this.is_variables)
            .on('change', function () {
                if (autosave) {
                    self.is_variables = $('#is_variables').is(':checked');
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'is_variables')
            .text('Use Variables in Generate');
    }

    addAutoExpandAdvanced(tbody, autosave) {
        // Auto Expand Optional
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'is_optional_expanded')
            .attr('name', 'is_optional_expanded')
            .attr('type', 'checkbox')
            .property('checked', this.is_optional_expanded)
            .on('change', function () {
                if (autosave) {
                    self.is_optional_expanded = $('#is_optional_expanded').is(':checked');
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'is_optional_expanded')
            .text('Auto Expanded Advanced');
    }

    addHideAttachedArtefacts(tbody, autosave) {
        // Hide Attached Artefacts
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'hide_attached')
            .attr('name', 'hide_attached')
            .attr('type', 'checkbox')
            .property('checked', this.hide_attached)
            .on('change', function () {
                if (autosave) {
                    self.hide_attached = $('#hide_attached').is(':checked');
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'hide_attached')
            .text('Hide Attached Artefacts');
    }

    addHighlightAssociations(tbody, autosave) {
        // Highlight Associations
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'highlight_association')
            .attr('name', 'highlight_association')
            .attr('type', 'checkbox')
            .property('checked', this.highlight_association)
            .on('change', function () {
                if (autosave) {
                    self.highlight_association = $('#highlight_association').is(':checked');
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'highlight_association')
            .text('Highlight Associations');
    }

    addShowOcids(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'show_ocids')
            .attr('name', 'show_ocids')
            .attr('type', 'checkbox')
            .property('checked', this.show_ocids)
            .on('change', function () {
                if (autosave) {
                    self.show_ocids = $('#show_ocids').is(':checked');
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'show_ocids')
            .text('Display OCIDs');
    }

    addDisplayLabel(tbody, autosave) {
        // Display Label
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('label')
            .text('Icon Label');
        // -- Display Name
        tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'name_label')
            .attr('name', 'show_label')
            .attr('type', 'radio')
            .attr('value', 'name')
            .on('change', function () {
                if (autosave) {
                    self.show_label = $("input:radio[name='show_label']:checked").val();
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'name_label')
            .text('Resource Name');
        // -- Resource Type
        tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'type_label')
            .attr('name', 'show_label')
            .attr('type', 'radio')
            .attr('value', 'type')
            .on('change', function () {
                if (autosave) {
                    self.show_label = $("input:radio[name='show_label']:checked").val();
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'type_label')
            .text('Resource Type');
        // -- Resource Type
        tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'none_label')
            .attr('name', 'show_label')
            .attr('type', 'radio')
            .attr('value', 'none')
            .on('change', function () {
                if (autosave) {
                    self.show_label = $("input:radio[name='show_label']:checked").val();
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'none_label')
            .text('None');
        // Set Show Label Value
        $("input:radio[name='show_label'][value=" + this.show_label + "]").prop('checked', true);
    }

    addTooltipType(tbody, autosave) {
        // Display Label
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('label')
            .text('Tooltip Style');
        // -- Display Name
        tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'simple_tooltip')
            .attr('name', 'tooltip_type')
            .attr('type', 'radio')
            .attr('value', 'simple')
            .on('change', function () {
                if (autosave) {
                    self.tooltip_type = $("input:radio[name='tooltip_type']:checked").val();
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'simple_tooltip')
            .text('Simple');
        // -- Resource Type
        tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'definition_tooltip')
            .attr('name', 'tooltip_type')
            .attr('type', 'radio')
            .attr('value', 'definition')
            .on('change', function () {
                if (autosave) {
                    self.tooltip_type = $("input:radio[name='tooltip_type']:checked").val();
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'definition_tooltip')
            .text('Documentation');
        // -- Resource Type
        tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'summary_tooltip')
            .attr('name', 'tooltip_type')
            .attr('type', 'radio')
            .attr('value', 'summary')
            .on('change', function () {
                if (autosave) {
                    self.tooltip_type = $("input:radio[name='tooltip_type']:checked").val();
                    self.save();
                }
            });
        td.append('label')
            .attr('for', 'summary_tooltip')
            .text('Summary');
        // Set Show Label Value
        $("input:radio[name='tooltip_type'][value=" + this.tooltip_type + "]").prop('checked', true);
    }

    addNamePrefix(tbody, autosave) {
        // Display Label
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('label')
            .text('Name Prefix');
        // -- Display Name
        tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'name_prefix')
            .attr('name', 'name_prefix')
            .attr('type', 'text')
            .attr('value', this.name_prefix)
            .on('input', function () {
                if (autosave) {
                    self.name_prefix = $("input:text[name='name_prefix']").val();
                    self.save();
                }
            });
    }

    addConfigProfile(tbody, autosave) {
        // Config Profile
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('Default Connection Profile');
        let profile_select = tr.append('div')
            .attr('class', 'td')
            .append('select')
            .attr('id', 'profile')
            .on('change', function () {
                if (autosave) {
                    self.profile = $(this).val();
                    self.save();
                }
            });
        for (let section of okitOciConfig.sections) {
            profile_select.append('option')
                .attr('value', section)
                .text(section);
        }
        $(jqId('profile')).val(this.profile);
    }

}

class OkitAutoSave {
    key = "okitJson";
    constructor(callback, interval = 60000) {
        this.autoInterval = undefined;
        this.callback = callback;
        this.interval = interval
    }

    startAutoSave() {
        this.stopAutoSave();
        this.autoInterval = setInterval(() => {
            localStorage.setItem(this.key, JSON.stringify(okitJsonModel));
            if (this.callback) {
                this.callback();
            }
        }, this.interval);
        localStorage.setItem(this.key, JSON.stringify(okitJsonModel));
    }

    stopAutoSave() {
        this.autoInterval ? clearInterval(this.autoInterval) : this.autoInterval = undefined;
        this.removeAutoSave();
    }

    getOkitJsonModel() {
        const okitJson = localStorage.getItem(this.key);
        return okitJson ? JSON.parse(okitJson) : undefined;
    }

    removeAutoSave() {
        localStorage.removeItem(this.key);
    }
}
