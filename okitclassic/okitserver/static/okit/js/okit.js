/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Javascript');
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
                .map(v => (v && v instanceof Object && !(v instanceof Function)) ? JSON.clean(v) : v)
                .filter(v => !(v == null));
        } else {
            return Object.entries(obj)
                .map(([k, v]) => [k, v && v instanceof Object && !(v instanceof Function) ? JSON.clean(v) : v])
                .reduce((a, [k, v]) => (v == null ? a : (a[k]=v, a)), {});
        }
    }
}

let selectedArtefact = null;

/*
** Define OKIT Artifact Classes
 */
class OkitSessionOCIConfigs {
    configs = {}
}

class OkitOCIConfig {
    constructor(loaded_callback) {
        this.results = {valid: true};
        this.loaded_callback = loaded_callback;
        // Initialise locals
        this.sections = []
        this.validated_sections = []
        this.section_regions = {}
        // this.validate();
        this.load();
    }

    get valid() {return this.results.valid}

    load() {
        // let me = this;
        // $.getJSON('config/sections', function(resp) {
        //     $.extend(true, me, resp);
        //     if (me.loaded_callback) me.loaded_callback();
        //     console.info(me)
        // });
        const config_sections = $.getJSON('config/sections', {cache: false})
        const config_regions = $.getJSON('config/section_regions', {cache: false})
        const validate_config = $.getJSON('config/validate', {cache: false})
        const validated_config_sections = $.getJSON('config/validated_sections', {cache: false})
        const session_profiles = Object.keys(okitSessionOciConfigs.configs).map((k) => {return {reason: '', section: k, valid: true, session: true}})
    
        return Promise.all([config_sections, validate_config, validated_config_sections, config_regions]).then(results => {
            this.sections = results[0].sections
            this.validation_results = results[1].results
            this.results = results[1].results
            this.validated_sections = [...session_profiles, ...results[2].sections]
            this.section_regions = results[3].regions
            console.debug('OkitOCIConfig: Sections', this.sections)
            console.debug('OkitOCIConfig: Validated Sections', this.validated_sections)
            if (!this.validation_results.valid) {
                $('#config_link').removeClass('hidden');
                $('#config_link_div').removeClass('collapsed');
            }
            if (this.loaded_callback) this.loaded_callback();
        })
    }

    getSections() {
        const session_profiles = Object.keys(okitSessionOciConfigs.configs)
        return [...session_profiles, ...this.sections]
    }

    getValidatedSections() {
        const session_profiles = Object.keys(okitSessionOciConfigs.configs).map((k) => {return {reason: '', section: k, valid: true, session: true}})
        return [...session_profiles, ...this.sections]
    }

    getSection(section) {
        return this.validated_sections.find((s) => s.section === section)
    }

    getRegion(section) {
        return this.section_regions[section]
    }

    validate() {
        const self = this;
        $.getJSON('config/validate', function(resp) {
            console.info('Config Validate ', resp)
            self.results = resp.results;
            if (!self.results.valid) {
                $('#config_link').removeClass('hidden');
                $('#config_link_div').removeClass('collapsed');
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

class OkitCache {
    key = 'OkitCache'
    day_milliseconds = 86400000;
    constructor() {
        this.cache = {}
        this.load()
    }

    clear = () => {
        localStorage.removeItem(this.key)
        $.ajax({type: 'post', url: 'cache', dataType: 'application/json', contentType: 'application/json', data: {}})
    }

    get = () => {
        $.getJSON('cache', {cache: false}).done((resp) => {
            console.info('Cache', resp)
            this.cache = resp
            localStorage.setItem(this.key, JSON.stringify(this.cache))
        })
    }

    load = () => {
        const local_data = localStorage.getItem(this.key)
        if (local_data) this.cache = JSON.parse(local_data)
        this.get()
    }
}

const okitCache = new OkitCache()

class OkitOCIData {
    key = "OkitDropdownCache";
    day_milliseconds = 86400000;
    constructor(profile, region='uk-london-1') {
        this.compartments = [];
        this.dropdown_data = {}
        this.load(profile, region);
    }

    clear() {
        this.clearLocalStorage()
        this.clearRemoteStorage()
    }
    clearLocalStorage() {localStorage.removeItem(this.key)}
    clearRemoteStorage() {$.ajax({type: 'DELETE', url: 'dropdown', async: false})}

    getCache() {
        const local_data = localStorage.getItem(this.key)
        return local_data ? JSON.parse(local_data) : {}
    }

    storeLocal(profile, region='') {
        console.info(`Storing Local Dropdown data for Profile: ${profile} Region: ${region}`);
        const local_data = localStorage.getItem(this.key)
        let cache = {}
        if (local_data) cache = JSON.parse(local_data)
        if (profile && !cache.hasOwnProperty(profile)) cache[profile] = {}
        if (profile) cache[profile][region] = this.dropdown_data
        localStorage.setItem(this.key, JSON.stringify(cache))
        console.info('Stored Local Storage', this.key, localStorage)
        // console.info(this.dropdown_data)
        // console.info('Platform Images', this.getPlatformImages())
        // console.info('Custom Images', this.getCustomImages())
        // console.info('Bare Metal Shares', this.getBareMetalInstanceShapes())
        // console.info('Virtual Machine Shares', this.getVirtualMachineInstanceShapes())
        // console.info('ARM Shares', this.getARMInstanceShapes())
        // console.info('AMD Shares', this.getAMDInstanceShapes())
        // console.info('Intel Shares', this.getIntelInstanceShapes())
    }

    loadLocal(profile, region='') {
        const local_data = localStorage.getItem(this.key)
        console.info(`Loading Local Dropdown data for Profile: ${profile} Region: ${region}`);
        let cache = {}
        if (local_data) cache = JSON.parse(local_data)
        if (profile && region && cache[profile] && cache[profile][region]) {
            // Add test for stale cache  && cache[profile].cache_date && ((Date.now() - cache[profile].cache_date) / this.day_milliseconds) <= 7
            console.info(`Found Local Dropdown Data for ${profile} ${region}`);
            this.dropdown_data = cache[profile][region]
            return true;
        } else {
            return false;
        }
    }

    load(profile, region='') {
        console.info('Loading Dropdown data for', profile);
        this.compartments = [];
        const self = this;
        if (!this.loadLocal(profile, region)) this.query(profile, region, true)
    }

    refresh(profile, region='') {
        console.info('Refreshing Dropdown data for', profile);
        this.query(profile, region)
    }

    save(profile, region='') {
        console.info(`Saving Dropdown data for Profile: ${profile} Region: ${region}`);
        this.storeLocal(profile, region);
        $.ajax({
            type: 'post',
            url: `dropdown/data/${String(profile)}/${String(region)}`,
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

    cloneForSave(profile, region='') {
        let clone = JSON.clone(this);
        clone.compartments = [];
        return clone;
    }

    query(profile, region='', save=false) {
        console.info('OkitOCIData: Querying OCI Dropdown data for', profile, region);
        const self = this;
        const start = new Date().getTime()
        const section = okitOciConfig.getSection(profile)
        const config = section && section.session ? okitSessionOciConfigs.configs[profile] : {}
        // Get Shipped
        return new Promise((resolve, reject) => {
            $.getJSON('dropdown', {cache: false}).done((resp) => {
                console.info('Retrieved Shipped Dropdown Data');
                self.dropdown_data = resp
                // Test if Profile is valid
                if (okitOciConfig && okitOciConfig.getSections().includes(profile)) {
                    // Test Region Subscription
                    $.getJSON('oci/subscription', {
                        profile: profile,
                        config: JSON.stringify(config),
                        cache: false
                    }).done((resp) => {
                        console.info('OkitOCIData: Querying Dropdown data for', profile, region);
                        // const response = resp
                        const end = new Date().getTime()
                        // const profile_region = okitOciConfig.getRegion(profile)
                        console.info('OkitOCIData: Querying Dropdown Region Subscription for', profile, 'took', end - start, 'ms')
                        // console.info('Region Subscriptions', typeof(response), response)
                        // We Know that this Profile is not a PCA-X9 so we can use the OCI Dropdowwn Query
                        // if (response.length === 1 && response[0].region_key !== profile_region) {
                        //     if (region === '') region = profile_region
                        //     console.info('OkitOCIData: Querying PCA Dropdown data for', profile, region);
                        //     $.getJSON('pca/dropdown', {
                        //         cache: false,
                        //         profile: profile,
                        //         region: region
                        //     }).done((resp) => {
                        //         self.dropdown_data = {...self.dropdown_data, ...resp};
                        //         delete self.dropdown_data.default
                        //         delete self.dropdown_data.shipped
                        //         self.dropdown_data.cache_date = Date.now()
                        //         const end = new Date().getTime()
                        //         console.info('PCA-X9 Queried Dropdown Data for', profile, 'took', end - start, 'ms')
                        //         console.info('PCA-X9 Data', resp)
                        //         // save ? this.save(profile, region) : this.storeLocal(profile, region)
                        //         this.save(profile, region)
                        //         this.storeLocal(profile, region)
                        //         resolve(this)
                        //     }).fail((xhr, status, error) => {
                        //         console.warn('Status : '+ status)
                        //         console.warn('Error : '+ error)
                        //         reject(error)
                        //     })
                        // } else {
                            console.info('OkitOCIData: Querying OCI Dropdown data for', profile, region);
                            $.getJSON('oci/dropdown', {
                                profile: profile,
                                region: region,
                                config: JSON.stringify(config),
                                cache: false
                            }).done((resp) => {
                                self.dropdown_data = {...self.dropdown_data, ...resp};
                                delete self.dropdown_data.default
                                delete self.dropdown_data.shipped
                                self.dropdown_data.cache_date = Date.now()
                                const end = new Date().getTime()
                                console.info('OCI Queried Dropdown Data for', profile, 'took', end - start, 'ms')
                                console.info('OCI Data', resp)
                                // save ? this.save(profile, region) : this.storeLocal(profile, region)
                                this.save(profile, region)
                                this.storeLocal(profile, region)
                                resolve(this)
                            }).fail((xhr, status, error) => {
                                console.warn('Status : '+ status)
                                console.warn('Error : '+ error)
                                reject(error)
                            })
                        // }
                    }).fail((xhr, status, error) => {
                        console.warn('Status : '+ status)
                        console.warn('Error : '+ error)
                        console.info('Querying PCA Dropdown data for', profile, region);
                        // Region Subscription does not appear to be support so we will drop back to PCA Dropdown Query
                        $.getJSON('pca/dropdown', {
                            cache: false,
                            profile: profile,
                            region: region
                        }).done((resp) => {
                            self.dropdown_data = {...self.dropdown_data, ...resp};
                            delete self.dropdown_data.default
                            delete self.dropdown_data.shipped
                            self.dropdown_data.cache_date = Date.now()
                            const end = new Date().getTime()
                            console.info('PCA-X9 Queried Dropdown Data for', profile, 'took', end - start, 'ms')
                            console.info('PCA-X9 Data', resp)
                            // save ? this.save(profile, region) : this.storeLocal(profile, region)
                            this.save(profile, region)
                            this.storeLocal(profile, region)
                            resolve(this)
                        }).fail((xhr, status, error) => {
                            console.warn('Status : '+ status)
                            console.warn('Error : '+ error)
                            reject(error)
                        })
                    })
                } else {
                    console.warn('OkitOciData: Profile "', profile, '" does not exist in OCI Config')
                    reject('OkitOciData: Profile', profile, 'does not exist in OCI Config')
                }
            })    
        })
    }

    deduplicate(list, property) {
        // return Array.isArray(list) ? [...new Set(list)] : list
        return Array.isArray(list) ? Object.values(Object.fromEntries(list.map(a => [a[property], a]))) : list
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

    getDBSystemShapes = (filter=() => true) => this.dropdown_data.db_system_shapes.filter(filter).sort((a, b) => a.name.localeCompare(b.name))
    getBareMetalDBSystemShapes = (filter=() => true) => this.getDBSystemShapes((ds) => ds.shape_family === 'SINGLENODE').filter(filter)
    getExaCCDBSystemShapes = (filter=() => true) => this.getDBSystemShapes((ds) => ds.shape_family === 'EXACC').filter(filter)
    getExadataDBSystemShapes = (filter=() => true) => this.getDBSystemShapes((ds) => ds.shape_family === 'EXADATA').filter(filter)
    getVirtualMachineDBSystemShapes = (filter=() => true) => this.getDBSystemShapes((ds) => ds.shape_family === 'VIRTUALMACHINE').filter(filter)
    getDBSystemShape = (shape) => this.getDBSystemShapes().find(s => s.shape === shape)
    // getDBSystemShape(shape) {
    //     return this.getDBSystemShapes().find(s => s.shape === shape);
    // }

    getDBVersions() {
        return this.dropdown_data.db_versions;
    }

    getDataScienceNotebookSessionShape = (filter=() => true) => this.dropdown_data.data_science_notebook_session_shapes.filter(filter)

    getInstanceShapes(type='') {
        console.info(`Getting Shapes for type = '${type}'`)
        if (type === '') {
            return this.dropdown_data.shapes;
        } else {
            return this.dropdown_data.shapes.filter(function(s) {return s.shape.startsWith(type);});
        }
    }

    getGIVersions = (shape) => this.dropdown_data.gi_versions[shape].map((v) => v.version)

    getAllInstanceShapes = (filter=() => true) => this.dropdown_data.shapes.filter(filter)
    getBareMetalInstanceShapes = () => this.dropdown_data.shapes.filter(s => s.shape.startsWith('BM.'))
    getVirtualMachineInstanceShapes = () => this.dropdown_data.shapes.filter(s => s.shape.startsWith('VM.'))
    getIntelInstanceShapes = () => this.dropdown_data.shapes.filter(s => s.shape.startsWith('VM.') && !s.shape.includes('.A') && !s.shape.includes('.E'))
    getARMInstanceShapes = () => this.dropdown_data.shapes.filter(s => s.shape.startsWith('VM.') && s.shape.includes('.A'))
    getAMDInstanceShapes = () => this.dropdown_data.shapes.filter(s => s.shape.startsWith('VM.') && s.shape.includes('.E'))

    getInstanceShape(shape) {
        return this.getInstanceShapes().find(s => s.shape === shape);
    }

    getInstanceOS(shape='') {
        let oss = [];
        if (shape === '') {
            for (let image of this.dropdown_data.images) {
                oss.push(image.operating_system);
            }
        } else {
            for (let image of this.dropdown_data.images) {
                if (image.shapes.includes(shape)) {
                    oss.push(image.operating_system);
                }
            }
        }
        return [...new Set(oss)].sort();
    }

    getImageOSs() {
        // let oss = []
        // for (let image of this.dropdown_data.images) {
        //     oss.push({compartment_id: image.compartment_id, id: image.operating_system, display_name: image.operating_system});
        // }
        const oss = this.dropdown_data.images.map(i => {return {compartment_id: i.compartment_id, id: i.operating_system, display_name: i.operating_system, platform: i.compartment_id === null}})
        const unique = oss.reduce((unique, o) => {
            if (!unique.some(obj => obj.platform === o.platform && obj.id === o.id)) {unique.push(o)}
            return unique
        }, [])
        console.info(oss)
        console.info(unique)
        return unique.sort();
    }

    getInstanceOSVersions(os='') {
        let versions = [];
        let os_images = this.dropdown_data.images.filter(i => i.operating_system === os);
        for (let image of os_images) {
            versions.push(image.operating_system_version);
        }
        return [...new Set(versions)].sort((a, b) => b - a);
    }

    getInstanceImages(os='', version='') {
        let images = [];
        let os_images = this.dropdown_data.images.filter(i => i.operating_system === os);
        let version_images = os_images.filter(i => i.operating_system_version === version);
        for (let image of version_images) {
            images.push(image.display_name);
        }
        return [...new Set(images)].sort((a, b) => b - a);
    }

    getPlatformImages(filter=() => true) {
        return this.dropdown_data.images.filter(i => !i.compartment_id || i.compartment_id === null).filter(filter)
    }
    getPlatformImageOSs() {
        return [...new Set(this.dropdown_data.images.filter(i => !i.compartment_id || i.compartment_id === null).map((i) => i.operating_system))].sort();
        // return [...new Set(this.dropdown_data.images.filter(i => !i.compartment_id || i.compartment_id === null).map((i) => i.operating_system))].sort((a, b) => b - a);
    }
    getPlatformImageOSVersions(filter=() => true) {
        filter = filter ? filter : () => true
        return [...new Set(this.dropdown_data.images.filter((i) => !i.compartment_id || i.compartment_id === null).filter(filter).map((i) => i.operating_system_version))].sort((a, b) => b - a);
    }

    getCustomImages(filter=() => true) {
        return this.dropdown_data.images.filter(i => i.compartment_id && i.compartment_id !== null).filter(filter)
    }
    getCustomImageOSs() {
        return [...new Set(this.dropdown_data.images.filter(i => i.compartment_id && i.compartment_id !== null).map((i) => i.operating_system))].sort();
        // return [...new Set(this.dropdown_data.images.filter(i => i.compartment_id && i.compartment_id !== null).map((i) => i.operating_system))].sort((a, b) => b - a);
    }
    getCustomImageOSVersions(filter=() => true) {
        filter = filter ? filter : () => true
        return [...new Set(this.dropdown_data.images.filter((i) => i.compartment_id && i.compartment_id !== null).filter(filter).map((i) => i.operating_system_version))].sort((a, b) => b - a);
    }

    getKubernetesVersions() {
        return this.dropdown_data.kubernetes_versions;
    }

    getLoadBalancerShapes() {
        return this.dropdown_data.loadbalancer_shapes;
    }

    // getMySQLConfigurations(shape_name='') {
    //     if (shape_name === '') {
    //         return this.dropdown_data.mysql_configurations;
    //     } else {
    //         return this.dropdown_data.mysql_configurations.filter(function(dss) {return dss.shape_name === shape_name;});
    //     }
    // }
    getMySQLConfigurations = (filter=() => true) => this.dropdown_data.mysql_configurations.filter(filter)
    getMySQLConfiguration = (id) => this.getMySQLConfigurations().find((c) => c.id === id)
    // getMySQLConfiguration(id) {
    //     for (let shape of this.getMySQLConfigurations()) {
    //         if (shape.id === id) {
    //             return shape;
    //         }
    //     }
    // }

    getPodShapes = (filter=() => true) => this.dropdown_data.pod_shapes.filter(filter)

    getVolumeBackupPolicies() {
        return this.dropdown_data.volume_backup_policy ? this.dropdown_data.volume_backup_policy : []
    } 

    getMySQLShapes = (filter=() => true) => this.dropdown_data.mysql_shapes.filter(filter)
    getMySQLShape = (shape) => this.getMySQLShapes().find(s => s.name === shape)

    getMySQLVersions(family='') {
        return this.dropdown_data.mysql_versions[0].versions;
    }

    getRegions() {
        return okitRegions.getRegions();
    }

    getCompartments() {
        return this.compartments;
    }

    setCompartments(compartments) {
        this.compartments = compartments;
    }
}

class OkitPCAData extends OkitOCIData {
    query(profile, region='', save=false) {
        console.info('OkitPCAData: Querying PCA Dropdown data for', profile, region);
        const self = this;
        const start = new Date().getTime()
        // Get Shipped
        return new Promise((resolve, reject) => {
            $.getJSON('dropdown', {cache: false}).done((resp) => {
                console.info('OkitPCAData: Retrieved Shipped Dropdown Data');
                self.dropdown_data = resp
                // Test if Profile is valid
                if (okitOciConfig && okitOciConfig.getSections().includes(profile)) {
                    $.getJSON('pca/dropdown', {
                        cache: false,
                        profile: profile,
                        region: region
                    }).done((resp) => {
                        self.dropdown_data = {...self.dropdown_data, ...resp};
                        delete self.dropdown_data.default
                        delete self.dropdown_data.shipped
                        self.dropdown_data.cache_date = Date.now()
                        const end = new Date().getTime()
                        console.info('OkitPCAData: PCA-X9 Queried Dropdown Data for', profile, 'took', end - start, 'ms')
                        console.info('OkitPCAData: PCA-X9 Data', resp)
                        // save ? this.save(profile, region) : this.storeLocal(profile, region)
                        this.save(profile, region)
                        this.storeLocal(profile, region)
                        resolve(this)
                    }).fail((xhr, status, error) => {
                        console.warn('Status : '+ status)
                        console.warn('Error : '+ error)
                        reject(error)
                    })
                } else {
                        console.warn('OkitPCAData: Profile "', profile, '" does not exist in OCI Config')
                        reject('OkitPCAData: Profile', profile, 'does not exist in OCI Config')
                }
            })    
        })
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

    /*
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
    */

    loadLocal(profile) {
        console.info(`Loading Local Region data for ${profile}`);
        const regions = this.getLocalStorage(profile)
        if (regions) {
            console.info(`Found Local Region Data for ${profile} ${regions}`);
            this.regions = regions
            return true;
        } else {
            return false;
        }
    }

    load(profile) {
        console.info('OkitRegions: Loading Region data for', profile, this.loaded_callback);
        this.regions = []
        if (!this.loadLocal(profile)) this.query(profile)
        else if (this.loaded_callback) this.loaded_callback()
    }

    query(profile) {
        console.info('OkitRegions: Loading Region data for', profile);
        const self = this
        const section = okitOciConfig.getSection(profile)
        const config = section && section.session ? okitSessionOciConfigs.configs[profile] : {}
        console.debug('OkitRegions: Config', config, 'Section', section)

        return new Promise((resolve, reject) => {
            if (okitOciConfig && okitOciConfig.getSections().includes(profile)) {
                const start = new Date().getTime()
                $.getJSON('oci/subscription', {
                    profile: profile,
                    config: JSON.stringify(config),
                    cache: false
                }).done((resp) => {
                    const response = resp
                    const end = new Date().getTime()
                    const profile_region = okitOciConfig.getRegion(profile)
                    console.info('Region Subscription for', profile, 'took', end - start, 'ms')
                    console.info('Region Subscriptions', typeof(response), Array.isArray(response), response)
                    // if (response.length === 1 && response[0].region_key !== profile_region) {
                    //     console.info('OkitRegions: Querying PCA data for', profile, profile_region);
                    //     $.getJSON(`pca/regions`, {
                    //         profile: profile,
                    //         cache: false
                    //     }).done((resp) => {
                    //         const end = new Date().getTime()
                    //         console.info('Load Regions took', end - start, 'ms')
                    //         self.regions = resp
                    //         self.storeLocal(profile);
                    //         if (self.loaded_callback) self.loaded_callback();
                    //         resolve(this)
                    //     }).fail((xhr, status, error) => {reject(error)})
                    // } else {
                        console.info('OkitRegions: Querying OCI data for', profile, profile_region);
                        self.regions = resp
                        // if (self.regions.length === 1 && self.regions[0].region_key !== profile_region) self.regions = [{is_home_region: true, region_key: profile_region, region_name: profile_region, status: 'READY'}]
                        self.storeLocal(profile);
                        if (self.loaded_callback) self.loaded_callback();
                        resolve(this)
                        // $.getJSON(`oci/regions/${profile}`, {
                        //     profile: profile,
                        //     config: JSON.stringify(config),
                        //     cache: false
                        // }).done((resp) => {
                        //     const end = new Date().getTime()
                        //     console.info('Load Regions took', end - start, 'ms')
                        //     console.info('Load Region', typeof(response), Array.isArray(response), response)
                        //     self.regions = resp
                        //     self.storeLocal(profile);
                        //     if (self.loaded_callback) self.loaded_callback();
                        //     resolve(this)
                        // }).fail((xhr, status, error) => {reject(error)})
                    // }
                    // $.getJSON(`oci/regions/${profile}`, {
                    //     profile: profile,
                    //     config: JSON.stringify(config),
                    //     cache: false
                    // }).done((resp) => {
                    //     const end = new Date().getTime()
                    //     console.info('Load Regions took', end - start, 'ms')
                    //     console.info('Load Region', typeof(response), response)
                    //     self.regions = resp
                    //     self.storeLocal(profile);
                    //     if (self.loaded_callback) self.loaded_callback();
                    //     resolve(this)
                    // }).fail((xhr, status, error) => {reject(error)})
                }).fail((xhr, status, error) => {
                    console.info(`Subscription Test Failed Connected to a PCA ${profile}`)
                    console.warn('Status : ' + status)
                    console.warn('Error : ' + error)
                    $.getJSON(`pca/regions`, {
                        profile: profile,
                        cache: false
                    }).done((resp) => {
                        const end = new Date().getTime()
                        console.info('Load Regions took', end - start, 'ms')
                        self.regions = resp
                        self.storeLocal(profile);
                        if (self.loaded_callback) self.loaded_callback();
                        resolve(this)
                    }).fail((xhr, status, error) => {reject(error)})
                })
            } else {
                console.warn('OkitOciData: Profile "', profile, '" does not exist in OCI Config')
                reject('OkitOciData: Profile', profile, 'does not exist in OCI Config')
            }

        })
    }

    getRegions() {return this.regions}

    getHomeRegion() {
        let home_region = this.regions.find((r) => r.is_home_region)
        if (!home_region) {
            home_region = {id: 'None', display_name: 'No Home Region found.'}
        }
        return home_region
    }

    isRegionAvailable(region_id) {return this.regions.map((r) => r.id).includes(region_id)}
}

class OkitPCARegions extends OkitRegions {
    query(profile) {
        console.info('OkitPCARegions: Loading Region data for', profile);
        const self = this
        const section = okitOciConfig.getSection(profile)
        const config = section && section.session ? okitSessionOciConfigs.configs[profile] : {}
        console.debug('OkitRegions: Config', config, 'Section', section)

        return new Promise((resolve, reject) => {
            if (okitOciConfig && okitOciConfig.getSections().includes(profile)) {
                const start = new Date().getTime()
                $.getJSON(`pca/regions`, {
                    profile: profile,
                    cache: false
                }).done((resp) => {
                    const end = new Date().getTime()
                    console.info('Load Regions took', end - start, 'ms')
                    self.regions = resp
                    self.storeLocal(profile);
                    if (self.loaded_callback) self.loaded_callback();
                    resolve(this)
                }).fail((xhr, status, error) => {reject(error)})
            } else {
                console.warn('OkitOciData: Profile "', profile, '" does not exist in OCI Config')
                reject('OkitOciData: Profile', profile, 'does not exist in OCI Config')
            }

        })
    }
}

class OkitSettings {
    constructor() {
        this.is_default_security_list = false;
        this.is_default_route_table = false;
        this.is_default_dhcp_options = false;
        this.is_vcn_defaults = true;
        this.is_timestamp_files = false;
        this.profile = 'DEFAULT';
        this.region = 'uk-london-1'
        this.is_always_free = false;
        this.is_optional_expanded = true;
        this.is_display_grid = false;
        this.is_variables = false;
        this.icons_only = true;
        this.last_used_region = '';
        this.last_used_compartment = '';
        this.hide_attached = true;
        this.show_all_connections = false;
        this.show_connections_on_mouseover = true;
        this.highlight_association = false;
        this.show_label = 'none';
        this.tooltip_type = 'simple';
        this.name_prefix = 'okit';
        this.auto_save = false;
        this.show_ocids = false;
        this.show_resource_name = false;
        this.validate_markdown = false;
        this.fast_discovery = true;
        this.show_state = false
        this.load();
        // Disable variables
        this.is_variables = false;
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
                // me.is_variables = $(jqId('is_variables')).is(':checked');
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
            this.addShowState(tbody, autosave)
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
            // this.addUseVariables(tbody, autosave);
            // Hide Attached Artefacts
            this.addHideAttachedArtefacts(tbody, autosave);
            // Highlight Associations
            this.addHighlightAssociations(tbody, autosave);
            // Show Connections on Mouse Over
            this.addShowConnectionsOnMouseover(tbody, autosave);
            // Show All Connections
            this.addShowAllConnections(tbody, autosave);
            // Display OCIDs
            this.addShowOcids(tbody, autosave);
            // Display Resource Name
            this.addShowResourceName(tbody, autosave);
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'is_display_grid')
            .text('Display Grid');
    }

    addShowState(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'show_state')
            .attr('name', 'show_state')
            .attr('type', 'checkbox')
            .property('checked', this.show_state)
            .on('change', function () {
                if (autosave) {
                    self.show_state = $('#show_state').is(':checked');
                    self.saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'show_state')
            .text('Show State');
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'highlight_association')
            .text('Highlight Associations');
    }

    addShowConnectionsOnMouseover(tbody, autosave) {
        // Highlight Associations
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'show_connections_on_mouseover')
            .attr('name', 'show_connections_on_mouseover')
            .attr('type', 'checkbox')
            .property('checked', this.show_connections_on_mouseover)
            .on('change', function () {
                if (autosave) {
                    self.show_connections_on_mouseover = $('#show_connections_on_mouseover').is(':checked');
                    self.saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'show_connections_on_mouseover')
            .text('Show Connections On Mouseover');
    }

    addShowAllConnections(tbody, autosave) {
        // Highlight Associations
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'show_all_connections')
            .attr('name', 'show_all_connections')
            .attr('type', 'checkbox')
            .property('checked', this.show_all_connections)
            .on('change', function () {
                if (autosave) {
                    self.show_all_connections = $('#show_all_connections').is(':checked');
                    self.saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'show_all_connections')
            .text('Show All Connections');
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
                    self.saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'show_ocids')
            .text('Display OCIDs');
    }

    addShowResourceName(tbody, autosave) {
        let self = this;
        let tr = tbody.append('div').attr('class', 'tr');
        tr.append('div').attr('class', 'td').text('');
        let td = tr.append('div').attr('class', 'td');
        td.append('input')
            .attr('id', 'show_resource_name')
            .attr('name', 'show_resource_name')
            .attr('type', 'checkbox')
            .property('checked', this.show_resource_name)
            .on('change', function () {
                if (autosave) {
                    self.show_resource_name = $('#show_resource_name').is(':checked');
                    self.saveAndRedraw();
                }
            });
        td.append('label')
            .attr('for', 'show_resource_name')
            .text('Display Resource Name');
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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
                    self.saveAndRedraw();
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

class OkitEditor {
    constructor(model, views, callbacks=[]) {
        this.filename = '';
        this.location = 'local';
        this.model = model;
        this.views = views;
        this.callbacks = callbacks;
    }

    new() {
        this.filename = '';
        this.location = 'local';
        if (this.model) this.model.clear();
        if (this.views) this.views.forEach((v) => v.clear())
    }

    draw() {
        if (this.views) this.views.forEach((v) => v.draw())
    }

    load(location) {}

    save() {
        if (this.filename.length !== 0) {

        } else {
            this.saveAs();
        }
    }

    saveAs(location) {
        const self = this;
    }

}

const okitEditor = new OkitEditor();
