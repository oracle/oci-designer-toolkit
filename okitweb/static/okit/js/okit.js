/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
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
    constructor(loaded_callback) {
        this.results = [];
        this.loaded_callback = loaded_callback;
        this.validate();
        this.load();
    }

    load() {
        let me = this;
        $.getJSON('config/sections', function(resp) {
            $.extend(true, me, resp);
            if (me.loaded_callback) me.loaded_callback();
            console.info(me)
        });
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
    key = "OkitDropdownCache";
    constructor(profile) {
        this.compartments = [];
        this.dropdown_data = {}
        this.load(profile);
    }

    clearLocalStorage() {localStorage.removeItem(this.key)}

    storeLocal(profile) {
        console.info(`Storing Local Dropdown data for ${profile}`);
        const local_data = localStorage.getItem(this.key)
        let cache = {}
        if (local_data) cache = JSON.parse(local_data)
        if (profile) cache[profile] = this.dropdown_data
        localStorage.setItem(this.key, JSON.stringify(cache))
    }

    loadLocal(profile) {
        const local_data = localStorage.getItem(this.key)
        console.info(`Loading Local Dropdown data for ${profile}`);
        let cache = {}
        if (local_data) cache = JSON.parse(local_data)
        if (profile && cache[profile]) {
            console.info(`Found Local Dropdown Data for ${profile}`);
            this.dropdown_data = cache[profile]
            return true;
        } else {
            return false;
        }
    }

    load(profile) {
        console.info('Loading Dropdown data for', profile);
        this.compartments = [];
        const self = this;
        if (!this.loadLocal(profile)) {
            const start = new Date().getTime()
            $.getJSON(`dropdown/data/${String(profile)}`, (resp) => {
                const end = new Date().getTime()
                console.info('Load Dropdown Data took', end - start, 'ms')
                // $.extend(true, self, resp);
                self.dropdown_data = resp;
                self.storeLocal(profile);
                if (resp.shipped && profile !== undefined) {
                    self.refresh(profile);
                }
            });
        }
    }

    refresh(profile) {
        console.info('Refreshing Dropdown data for', profile);
        this.query(profile, false)
    }

    save(profile) {
        console.info('Saving Dropdown data for', profile);
        this.storeLocal(profile);
        $.ajax({
            type: 'post',
            url: `dropdown/data/${String(profile)}`,
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(this.dropdown_data),
            success: function(resp) {},
            error: function(xhr, status, error) {
                console.warn('Status : '+ status);
                console.warn('Error  : '+ error);
            }
        });
    }

    cloneForSave(profile) {
        let clone = JSON.clone(this);
        clone.compartments = [];
        return clone;
    }

    query(profile, save=false) {
        console.info('Querying Dropdown data for', profile);
        const self = this;
        const start = new Date().getTime()
        $.getJSON(`oci/dropdown/${profile}`, (resp) => {
            // $.extend(true, self, resp);
            self.dropdown_data = resp;
            const end = new Date().getTime()
            console.info('Queried Dropdown Data for', profile, 'took', end - start, 'ms')
            if (save) this.save(profile)
            else this.storeLocal(profile)
            });
    }

    /*
    ** Get functions to retrieve drop-down data.
     */

    getCpeDeviceShapes() {
        return this.dropdown_data.cpe_device_shapes;
    }
    getCpeDeviceShape(id) {
        for (let shape of this.getCpeDeviceShapes()) {
            if (shape.id === id) {
                shape.display_name = `${shape.cpe_device_info.vendor} ${shape.cpe_device_info.platform_software_version}`;
                return shape;
            }
        }
    }

    getDBSystemShapes(family='') {
        if (family === '') {
            return this.dropdown_data.db_system_shapes;
        } else {
            return this.dropdown_data.db_system_shapes.filter(function(dss) {return dss.shape_family === family;});
        }
    }

    getDBSystemShape(shape) {
        console.log('Get DB Shape ' + shape);
        return this.dropdown_data.db_system_shapes.filter(function(dss) {return dss.shape === shape;})[0];
    }

    getDBVersions() {
        return this.dropdown_data.db_versions;
    }

    getInstanceShapes(type='') {
        if (type === '') {
            return this.dropdown_data.shapes;
        } else {
            return this.dropdown_data.shapes.filter(function(s) {return s.shape.startsWith(type);});
        }
    }

    getInstanceShape(shape) {
        return this.dropdown_data.getInstanceShapes().find(s => s.shape === shape);
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
        return this.dropdown_data.kubernetes_versions;
    }

    getLoadBalaancerShapes() {
        return this.dropdown_data.loadbalancer_shapes;
    }

    getMySQLConfigurations(shape_name='') {
        if (shape_name === '') {
            return this.dropdown_data.mysql_configurations;
        } else {
            return this.dropdown_data.mysql_configurations.filter(function(dss) {return dss.shape_name === shape_name;});
        }
    }
    getMySQLConfiguration(id) {
        for (let shape of this.getMySQLConfigurations()) {
            if (shape.id === id) {
                return shape;
            }
        }
    }

    getMySQLShapes() {
        return this.dropdown_data.mysql_shapes;
    }

    getMySQLVersions(family='') {
        return this.dropdown_data.mysql_versions[0].versions;
    }

    getRegions() {
        return this.dropdown_data.regions;
    }

    getCompartments() {
        return this.compartments;
    }

    setCompartments(compartments) {
        this.compartments = compartments;
    }
}

class OkitRegions {
    key = "OkitRegionCache"
    constructor(loaded_callback) {
        this.regions = []
        this.loaded_callback = loaded_callback;
        this.cache = {}
        this.selected_profile = undefined
    }

    clearLocalStorage() {localStorage.removeItem(this.key)}

    setLocalStorage(profile, regions) {
        const local_data = localStorage.getItem(this.key)
        let cache = {}
        if (local_data) cache = JSON.parse(local_data)
        if (profile) cache[profile] = regions.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
        localStorage.setItem(this.key, JSON.stringify(cache))
    }

    getLocalStorage(profile) {
        const local_data = localStorage.getItem(this.key)
        let regions = undefined
        if (local_data) {
            const cache = JSON.parse(local_data)
            regions = cache[profile]
        }
        return regions
    }

    storeLocal(profile) {
        console.info(`Storing Local Region data for ${profile}`);
        this.setLocalStorage(profile, this.regions)
    }

    storeLocal1(profile) {
        console.info(`Storing Local Region data for ${profile}`);
        const local_data = localStorage.getItem(this.key)
        let cache = {}
        if (local_data) cache = JSON.parse(local_data)
        if (profile) cache[profile] = this.regions
        localStorage.setItem(this.key, JSON.stringify(cache))
    }

    loadLocal1(profile) {
        const local_data = localStorage.getItem(this.key)
        console.info(`Loading Local Region data for ${profile}`);
        let cache = {}
        if (local_data) cache = JSON.parse(local_data)
        if (profile && cache[profile]) {
            console.info(`Found Local Region Data for ${profile}`);
            this.regions = cache[profile]
            return true;
        } else {
            return false;
        }
    }

    loadLocal(profile) {
        console.info(`Loading Local Region data for ${profile}`);
        const regions = this.getLocalStorage(profile)
        if (regions) {
            console.info(`Found Local Region Data for ${profile}`);
            this.regions = regions
            return true;
        } else {
            return false;
        }
    }

    load(profile) {
        console.info('Loading Region data for', profile);
        const self = this
        if (!this.loadLocal(profile)) {
            const start = new Date().getTime()
            $.getJSON(`oci/regions/${profile}`, (resp) => {
                const end = new Date().getTime()
                console.info('Load Regions took', end - start, 'ms')
                self.regions = resp
                self.storeLocal(profile);
                if (self.loaded_callback) self.loaded_callback();
            });
        } else if (self.loaded_callback) self.loaded_callback();
    }

    getRegions() {return this.regions}

    getHomeRegion() {return this.regions.filter((r) => r.is_home_region)[0]}

    isRegionAvailable(region_id) {return this.regions.map((r) => r.id).includes(region_id)}
}

class OkitSettings {
    constructor() {
        this.is_default_security_list = false;
        this.is_default_route_table = false;
        this.is_default_dhcp_options = false;
        this.is_vcn_defaults = true;
        this.is_timestamp_files = false;
        this.profile = 'DEFAULT';
        this.region = ''
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
        this.validate_markdown = true;
        this.fast_discovery = true;
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
        // redrawSVGCanvas(true);
    }

    saveAndRedraw() {
        this.save()
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
            // this.addDefaultRouteTable(tbody, autosave)
            // // Default Security List
            // this.addDefaultSecurityList(tbody, autosave);
            // // Default Dhcp Options
            // this.addDefaultDhcpOptions(tbody, autosave);
            // Default VCN RT / SL DO
            this.addVcnDefaults(tbody, autosave);
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
            // Validate Before Markdowns
            this.addValidateMarkdown(tbody, autosave);
            // Fast Discovery
            // this.addFastDiscovery(tbody, autosave);
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'is_default_security_list')
            .text('Default Security List');
    }

    addDefaultDhcpOptions(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'is_default_dhcp_options')
            .attr('name', 'is_default_dhcp_options')
            .attr('type', 'checkbox')
            .property('checked', this.is_default_dhcp_options)
            .on('change', function () {
                if (autosave) {
                    self.is_default_dhcp_options = $('#is_default_dhcp_options').is(':checked');
                    saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'is_default_dhcp_options')
            .text('Default Dhcp Options');
    }

    addVcnDefaults(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'is_vcn_defaults')
            .attr('name', 'is_vcn_defaults')
            .attr('type', 'checkbox')
            .property('checked', this.is_vcn_defaults)
            .on('change', function () {
                if (autosave) {
                    self.is_vcn_defaults = $('#is_vcn_defaults').is(':checked');
                    saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'is_vcn_defaults')
            .text('Default Vcn RT/SL/DO');
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'show_ocids')
            .text('Display OCIDs');
    }

    addValidateMarkdown(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'validate_markdown')
            .attr('name', 'validate_markdown')
            .attr('type', 'checkbox')
            .property('checked', this.validate_markdown)
            .on('change', function () {
                if (autosave) {
                    self.validate_markdown = $('#validate_markdown').is(':checked');
                    saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'validate_markdown')
            .text('Validate Before Markdown');
    }

    addFastDiscovery(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'fast_discovery')
            .attr('name', 'fast_discovery')
            .attr('type', 'checkbox')
            .property('checked', this.fast_discovery)
            .on('change', function () {
                if (autosave) {
                    self.fast_discovery = $('#fast_discovery').is(':checked');
                    saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'fast_discovery')
            .text('Fast Discovery');
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
                    saveAndRedraw();
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
