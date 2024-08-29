/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Model Javascript');

/*
** Representation of overall OKIT Model Data Structure
 */
class OkitJson {
    /*
    ** Create
     */
    constructor(okitjson) {
        const now = getCurrentDateTime();
        this.title = "OKIT OCI Visualiser Json";
        this.documentation = `# Description\n__Created ${getCurrentDateTime()}__\n\n--------------------------------------\n\n`;
        this.metadata = {
            resource_count: 0,
            platform: pca_mode ? 'pca' : c3_mode ? 'c3' : 'oci',
            created: now,
            updated: now,
            okit_version: okitVersion,
            okit_model_id: `okit-model-${uuidv4()}`,
            file: this.newFileData()
        }
        this.user_defined = {terraform: ''};
        this.freeform_tags = {};
        this.defined_tags = {};
        this.variables_schema = this.newVariableSchema()

        if (okitjson !== undefined && typeof okitjson === 'string' && okitjson.length > 0) {
            console.info('Load String')
            this.load(JSON.parse(okitjson));
        }  else if (okitjson !== undefined && okitjson instanceof Object) {
            console.info('Load Object')
            this.load(okitjson);
        }
    }

    get deployment_platforms() {return ['oci', 'pca', 'c3', 'freetier']}
    get created() {return this.metadata.created}
    get updated() {return this.metadata.updated}
    get okit_version() {return this.metadata.okit_version}
    get okit_model_id() {return this.metadata.okit_model_id}
    get all_instances() {return [...this.getInstances(), ...this.getAnalyticsInstances()]}

    getResourceLists() {
        return Object.entries(this).reduce((r, [k, v]) => {
                if (Array.isArray(v)) r[k] = v
                return r
            }, {})
    }
    getResources() {return Object.values(this).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])}
    getResource(id='') {return this.getResources().find((r) => r.id === id)}

    newFileData() {
        return {
            name: '',
            generate_terraform: false,
            terraform_dir: ''
        }
    }

    newVariableSchema() {
        return {
            groups: [this.newVariableGroup('Undefined')],
            variables: []
        }
    }

    newVariableGroup(name='') {
        return {
            name: name,
            default: '',
            description: ''
        }
    }

    newVariable(name='', group='Undefined') {
        return {
            group: group,
            name: name,
            default: '',
            description: ''
        }
    }


    clone() {
        return new OkitJson(JSON.stringify(this))
    }

    /*
    ** Load Simple Json Structure and build Object Based JSON
     */
    load(okit_json) {
        console.info('Load OKIT Json');
        // Convert data if required
        this.convert(okit_json)
        // Title & Description
        if (okit_json.title) {this.title = okit_json.title;}
        if (okit_json.description) {this.documentation = okit_json.description;}
        if (okit_json.documentation) {this.documentation = okit_json.documentation;}
        if (okit_json.user_defined && okit_json.user_defined.terraform) {this.user_defined.terraform = okit_json.user_defined.terraform}
        if (okit_json.freeform_tags) {this.freeform_tags = okit_json.freeform_tags}
        if (okit_json.defined_tags) {this.defined_tags = okit_json.defined_tags}
        if (okit_json.variables_schema) {this.variables_schema = okit_json.variables_schema}
        if (okit_json.metadata) {this.metadata = {...this.metadata, ...okit_json.metadata}}
        // Update from older versions of file
        if (okit_json.created) {this.metadata.created = okit_json.created}
        if (okit_json.updated) {this.metadata.updated = okit_json.updated}
        if (okit_json.okit_version) {this.metadata.okit_version = okit_json.okit_version}
        if (okit_json.okit_model_id) {this.metadata.okit_model_id = okit_json.okit_model_id}
        // Turn Off Default Security List / Route Table Processing
        const okitSettingsClone = JSON.clone(okitSettings);
        okitSettings.is_default_route_table   = false;
        okitSettings.is_default_security_list = false;
        okitSettings.is_default_dhcp_options = false;
        okitSettings.is_vcn_defaults = false;
        // Load
        for (const [key, value] of Object.entries(okit_json)) {
            if (Array.isArray(value)) {
                const func_name = titleCase(key.split('_').join(' ')).split(' ').join('');
                const get_function = `get${func_name}`;
                const new_function = `new${func_name.slice(0, -1)}`;
                // console.warn('Functions:', get_function, new_function);
                for (const resource of okit_json[key]) {this[new_function](resource);}
                // Increment resource count by number of resources added
                this.metadata.resource_count += this[key] ? this[key].length : 0;
            }
        }
        // Reset Default Security List / Route Table Processing
        okitSettings.is_default_route_table   = okitSettingsClone.is_default_route_table;
        okitSettings.is_default_security_list = okitSettingsClone.is_default_security_list;
        okitSettings.is_default_dhcp_options = okitSettingsClone.is_default_dhcp_options;
        okitSettings.is_vcn_defaults = okitSettingsClone.is_vcn_defaults;
        // Check for VCN Defaults
        this.getVirtualCloudNetworks().forEach((vcn) => {
            if (vcn.default_route_table_id && this.getRouteTable(vcn.default_route_table_id)) {this.getRouteTable(vcn.default_route_table_id).default = true; delete vcn.default_route_table_id}
            if (vcn.default_security_list_id && this.getSecurityList(vcn.default_security_list_id)) {this.getSecurityList(vcn.default_security_list_id).default = true; delete vcn.default_security_list_id}
            if (vcn.default_dhcp_options_id && this.getDhcpOption(vcn.default_dhcp_options_id)) {this.getDhcpOption(vcn.default_dhcp_options_id).default = true; delete vcn.default_dhcp_options_id}
        });
        // Check for root compartment
        this.checkCompartmentIds();
        // if (okitOciProductPricing) okitOciProductPricing.generateBoM(this)
        this.generateBoM()
    }
    generateBoM() {
        if (this.metadata.platform === 'oci') {
            console.info('OCI Platform Generating BoM')
            if (okitOciProductPricing) okitOciProductPricing.generateBoM(this)
        } else {
            console.info(`${this.metadata.platform.toLocaleUpperCase()} Platform not supported for BoM`)
        }
    }
    checkCompartmentIds() {
        const compartment_ids = this.compartments ? this.compartments.map((c) => c.id) : []
        let root_ids = this.compartments ? this.compartments.filter((c) => c.compartment_id === null) : []
        if (root_ids.length === 0) {
            this.compartments = this.compartments ? [new Compartment({display_name: 'Deployment Compartment'}, this), ...this.compartments] : [new Compartment({display_name: 'Deployment Compartment'}, this)]
            root_ids = this.compartments ? this.compartments.filter((c) => c.compartment_id === null) : []
        }
        const root_id = root_ids[0].id
        // Assign Resources to root compartment if their compartment id is not in the design
        for (const [key, value] of Object.entries(this)) {
            if (Array.isArray(value)) {
                value.filter((v) => v.id !== root_id && !compartment_ids.includes(v.compartment_id)).forEach((r) => r.compartment_id = root_id)
            }
        }
    }
    convert(model) {
        // Split old for file_storage_system into new split version
        if (model) {
            if (model.file_storage_systems) {
                model.file_systems = model.file_systems ? model.file_systems : []
                model.mount_targets = model.mount_targets ? model.mount_targets : []
                model.file_storage_systems.forEach((resource, idx) => {
                    const file_system = new FileSystem({
                        id: resource.id,
                        compartment_id: resource.compartment_id,
                        availability_domain: resource.availability_domain,
                        display_name: resource.display_name,
                        definition: resource.definition,
                        freeform_tags: resource.freeform_tags,
                        defined_tags: resource.defined_tags,
                        resource_name: resource.resource_name ? resource.resource_name : '',
                    }, this)
                    const rmt = resource.mount_targets[0]
                    const mount_target = new MountTarget({
                        compartment_id: resource.compartment_id,
                        subnet_id: rmt.subnet_id,
                        display_name: rmt.display_name,
                        hostname_label: rmt.hostname_label,
                        nsg_ids: rmt.nsg_ids,
                        max_fs_stat_bytes: rmt.export_set.max_fs_stat_bytes,
                        max_fs_stat_files: rmt.export_set.max_fs_stat_files,
                        resource_name: rmt.resource_name ? rmt.resource_name : `${file_system.resource_name}MountTarget`,
                    }, this)
                    resource.exports.forEach((r_exp, i) => {
                        const mt_exp = mount_target.newExport()
                        mt_exp.path = r_exp.path
                        mt_exp.file_system_id = file_system.id
                        mt_exp.options.source = r_exp.export_options.source
                        mt_exp.options.access = r_exp.export_options.access
                        mt_exp.options.anonymous_gid = r_exp.export_options.anonymous_gid
                        mt_exp.options.anonymous_uid = r_exp.export_options.anonymous_uid
                        mt_exp.options.identity_squash = r_exp.export_options.identity_squash
                        mt_exp.options.require_privileged_source_port = r_exp.export_options.require_privileged_source_port
                        mt_exp.resource_name = `${mount_target.resource_name}Export`
                        mount_target.exports.push(mt_exp)
                    })
                    model.file_systems.push(this.classToJson(file_system))
                    model.mount_targets.push(this.classToJson(mount_target))
                })
                delete model.file_storage_systems
            }
        }
        return model
    }
    classToJson = (obj) => JSON.parse(JSON.stringify(obj))

    /*
    ** Clear Model 
    */
    clear() {
        // Clear
        this.title = "OKIT OCI Visualiser Json";
        this.description = `# Description\n__Created ${getCurrentDateTime()}__\n\n--------------------------------------\n\n`;
        this.created = getCurrentDateTime();
        this.updated = this.created;
        this.meta_data = {
            resource_count: 0,
            platform: 'oci',
            created: getCurrentDateTime(),
            updated: this.created,
            okit_version: okitVersion,
            okit_model_id: `okit-model-${uuidv4()}`
            }
        this.user_defined = {terraform: ''};
        this.freeform_tags = {};
        this.defined_tags = {};
        for (const [key, value] of Object.entries(this)) {
            if (Array.isArray(value)) {this[key] = []}
        }
    }

    /*
    ** Artifact Processing
     */

    // All Instance Resources
    getAllInstanceTypes() {
        return [...this.getInstances(), ...this.getAnalyticsInstances()]
    }

    // Fragment
    newFragment(target) {
        console.info('New Fragment');
        return new Fragment(target, this);
    }

    /*
    ** Export Functions
     */
    // Terraform
    exportTerraform(callback=null) {}
    // Ansible
    exportAnsible(callback=null) {}
    // Resource Manager
    exportResourceManager(callback=null) {}

    /*
    ** Data Validation
     */
    validate(successCallback = null, errorCallback = null) {
        $.ajax({
            type: 'post',
            url: 'validate',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(this),
            success: function(resp) {
                console.info('Validation Response : ' + resp);
                if (successCallback && successCallback !== null) successCallback(JSON.parse(resp));
            },
            error: function(xhr, status, error) {
                console.warn('Status : '+ status)
                console.warn('Error  : '+ error)
                if (errorCallback && errorCallback !== null) errorCallback(error);
            }
        });
    }

    /*
    ** Calculate price
     */
    estimateCost(callback=null) {
        $.ajax({
            type: 'post',
            url: 'pricing/estimate',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(this),
            success: function(resp) {
                //console.info('Estimator Response : ' + resp);
                if (callback && callback !== null) callback(JSON.parse(resp));
            },
            error: function(xhr, status, error) {
                console.warn('Status : '+ status)
                console.warn('Error  : '+ error)
            }
        });
    }

}

/*
** Model representation of each artefact within OCI
 */
class OkitArtifact {
    /*
    ** Create
     */
    constructor (okitjson) {
        // this.getOkitJson = () => {return okitjson};
        // Add Id
        this.id = this.okit_id;
        // All Artefacts will have compartment id, display name & description
        this.compartment_id = '';
        this.display_name = this.generateDefaultName(okitjson.metadata.resource_count += 1);
        // this.definition = '';
        this.documentation = '';
        this.okit_reference = `okit-${uuidv4()}`;
        this.show_connections = false
        // Add default for common Tag variables
        this.freeform_tags = {};
        this.defined_tags = {};
        Object.defineProperty(this, 'okit_json', {
            get: function () {
                return okitjson;
            }
        });
        // Read Only flag to indicate that we should not create this Resource
        this.read_only = false;
        // Add Terraform Resource Name
        this.resource_name = this.generateResourceName();
        // Object.defineProperty(this, 'documentation', {get: function() {return this.definition;}, set: function(documentation) {this.definition = documentation;}, enumerable: true });
    }

    getOkitJson() {return this.okit_json}
    isOCI() {return this.getOkitJson() && this.getOkitJson().metadata.platform === 'oci'}
    isFreetier() {return this.getOkitJson() && this.getOkitJson().metadata.platform === 'freetier'}
    isPCA() {return this.getOkitJson() && this.getOkitJson().metadata.platform === 'pca'}
    isC3() {return this.getOkitJson() && this.getOkitJson().metadata.platform === 'c3'}

    get name() {return this.display_name;}
    set name(name) {this.display_name = name;}
    get okit_id() {return 'okit.' + this.constructor.name.toLowerCase() + '.' + uuidv4();}
    get resource_type() {return this.getArtifactReference();}
    get list_name() {return `${this.resource_type.toLowerCase().split(' ').join('_')}s`;}
    get json_model_list() {return this.okit_json[this.list_name];}
    set json_model_list(list) {this.okit_json[this.list_name] = list;}
    get children() {return Object.values(this.getOkitJson()).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter(this.child_filter)}
    /*
    ** Filters
     */
    not_child_filter = (r) => true
    child_filter = (r) => false

    /*
    ** Clone Functionality
     */
    clone() {
        const constructor = Object.getPrototypeOf(this).constructor
        const clone = new constructor(JSON.clone(this), this.getOkitJson())
        clone.resource_name = this.generateResourceName()
        return clone;
    }

    /*
    ** Clean - Remove null & undefined
     */
    clean(obj) {
        return JSON.clean(obj);
    }

    /*
    ** Merge Functionality
     */
    merge(update) {
        if (update.name !== undefined) {
            if (update.display_name === undefined || update.display_name === '') update.display_name = update.name;
            delete update.name;
        }
        if ((update.resource_name === undefined || update.resource_name === '') && update.display_name) update.resource_name = this.generateResourceNameFromDisplayName(update.display_name)
        $.extend(true, this, this.clean(update));
    }
    /*
    ** Filter Resources
    */
    filterResources(filter) {
        if (filter) {
            Object.entries(this.getOkitJson()).forEach(([k, v]) => {
                if (Array.isArray(v)) {this.getOkitJson()[k] = v.filter(filter)}
            })
        }
    }

    /*
    ** Convert Functionality will be overridden to allow backwards compatibility
     */
    convert() {
        if (this.parent_id !== undefined) {delete this.parent_id;}
        // Check if built from a query
        if (this.availability_domain) {
            console.info('OkitArtifact convert() availability_domain', this.availability_domain, typeof(this.availability_domain))
        }
        if (this.availability_domain) {this.availability_domain = this.getAvailabilityDomainNumber(this.availability_domain);}
        // if (this.availability_domain && this.availability_domain.length > 1) {this.availability_domain = this.getAvailabilityDomainNumber(this.availability_domain);}
        // Switch Definition to Documentation
        if (this.definition !== undefined) {
            this.documentation = this.definition
            delete this.definition
        }
        Object.defineProperty(this, 'definition', {get: function() {return this.documentation;}, set: function(documentation) {this.documentation = documentation;}, enumerable: false });
    }

    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {return this.constructor.getArtifactReference();}

    artefactToElement(name) {
        return name.toLowerCase().split(' ').join('_') + 's';
    }

    /*
    ** Resource Associations
    */
    getAssociations() {
        const associations = (obj) => Object.entries(obj).reduce((n, [k, v]) => {
            if (k.endsWith('_ids') && Array.isArray(v)) {
                return [...n, ...v]
            } else if (v instanceof Object) {
                return [...n, ...associations(v)]
            } else if (k.endsWith('_id')) {
                return [...n, v]
            }
            return n
        }, [])
        return associations(this).filter((id) => id !== '')
    }
    getLinks() {return this.getAssociations()}


    /*
    ** Delete Processing
     */
    delete() {
        console.info('Delete (Default) ' + this.getArtifactReference() + ' : ' + this.id);
        // First Delete Children
        this.children.forEach((r) => r.delete())
        // Remove References
        this.deleteReferences()
        // Delete This Resource
        this.json_model_list = this.json_model_list.filter((e) => e.id != this.id)
    }

    deleteReferences() {}

    getChildren(artefact) {
        console.warn('Default empty getChildren()');
    }


    /*
    ** Define Allowable SVG Drop Targets
     */
    getDropTargets() {
        // Return list of Artifact names
        return this.constructor.getDropTargets();
    }


    /*
    ** Default name generation
     */
    generateDefaultName(count = 0) {
        // return this.getNamePrefix()
        // const today = new Date();
        // const pad = (n) => ("0" + n).slice(-2)
        // return `${this.getNamePrefix()}-${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}-${pad(today.getHours())}${pad(today.getMinutes())}${pad(today.getSeconds())}`;
        return this.getNamePrefix() + ('000' + count).slice(-3);
    }

    getNamePrefix() {
        return okitSettings ? okitSettings.name_prefix : 'okit';
    }

    getAvailabilityDomainNumber(availability_domain) {
        console.info(`getAvailabilityDomainNumber(${availability_domain}) ${typeof availability_domain} ${typeof availability_domain.toString()}`)
        return availability_domain.toString().slice(-1)
    }

    generateResourceName = () => `Okit_${this.getArtifactReference().split(' ').map((r) => r[0]).join('')}_${Date.now()}`
    generateResourceNameFromDisplayName = (name) => titleCase(name.split('_').join('-')).split(' ').join('').replaceAll('-','_')

    estimateCost = () => {
        if (!this.isOCI()) return ''
        // if (this.getOkitJson().metadata.platform === 'pca') return ''
        const get_price_function = OkitOciProductPricing.getPriceFunctionName(this.constructor.name)
        const pricing = okitOciProductPricing ? okitOciProductPricing : new OkitOciProductPricing()
        console.info(`>>>>>> Estimating Resource Cost: ${get_price_function}`)
        try {
            return OkitOciProductPricing.formatPrice(pricing[get_price_function](this, pricing), pricing.currency)
        } catch (e) {
            console.debug(e)
            return OkitOciProductPricing.formatPrice(0, pricing.currency)
        }
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return this.constructor.name.split(/(?=[A-Z])/).join(' ');
    }

    static getDropTargets() {
        console.warn('Get Drop Targets not implements');
        return [];
    }

    static getConnectTargets() {
        console.warn('Get Connect Targets not implements');
        return [];
    }

    static query(request={}, region='') {
        console.error('Query not implemented');
    }

}

let okitJsonModel
