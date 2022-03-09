/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Model Javascript');

/*
** Representation of overall OKIT Model Data Structure
 */
class OkitJson {
    /*
    ** Create
     */
    constructor(okit_json_string = '') {
        const now = getCurrentDateTime();
        this.title = "OKIT OCI Visualiser Json";
        this.description = `# Description\n__Created ${getCurrentDateTime()}__\n\n--------------------------------------\n\n`;
        // this.created = getCurrentDateTime();
        // this.updated = this.created;
        // this.okit_version = okitVersion;
        // this.okit_model_id = `okit-model-${uuidv4()}`;
        this.metadata = {
            resource_count: 0,
            platform: pca_mode ? 'pca' : 'oci',
            created: now,
            updated: now,
            okit_version: okitVersion,
            okit_model_id: `okit-model-${uuidv4()}`
        }
        this.user_defined = {terraform: ''};
        this.freeform_tags = {};
        this.defined_tags = {};

        if (okit_json_string !== undefined && okit_json_string.length > 0) {
            this.load(JSON.parse(okit_json_string));
        }
    }

    get deployment_platforms() {return ['oci', 'pca', 'freetier']}
    get created() {return this.metadata.created}
    get updated() {return this.metadata.updated}
    get okit_version() {return this.metadata.okit_version}
    get okit_model_id() {return this.metadata.okit_model_id}

    getResourceLists() {
        return Object.entries(this).reduce((r, [k, v]) => {
                if (Array.isArray(v)) r[k] = v
                return r
            }, {})
    }
    getResource(id='') {
        const resource = Object.values(this).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter((r) => r.id === id)[0]
        console.info('Resource', resource)
        return resource
    }

    /*
    ** Load Simple Json Structure and build Object Based JSON
     */
    load(okit_json) {
        console.log('Load OKIT Json');
        // Title & Description
        if (okit_json.title) {this.title = okit_json.title;}
        if (okit_json.description) {this.description = okit_json.description;}
        if (okit_json.user_defined && okit_json.user_defined.terraform) {this.user_defined.terraform = okit_json.user_defined.terraform}
        if (okit_json.freeform_tags) {this.freeform_tags = okit_json.freeform_tags}
        if (okit_json.defined_tags) {this.defined_tags = okit_json.defined_tags}
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
            if (vcn.default_route_table_id && this.getRouteTable(vcn.default_route_table_id)) this.getRouteTable(vcn.default_route_table_id).default = true;
            if (vcn.default_security_list_id && this.getSecurityList(vcn.default_security_list_id)) this.getSecurityList(vcn.default_security_list_id).default = true;
            if (vcn.default_dhcp_options_id && this.getDhcpOption(vcn.default_dhcp_options_id)) this.getDhcpOption(vcn.default_dhcp_options_id).default = true;
        });
        // Check for root compartment
        this.checkCompartmentIds();
    }
    checkCompartmentIds() {
        const compartment_ids = this.compartments ? this.compartments.map((c) => c.id) : []
        let root_ids = this.compartments ? this.compartments.filter((c) => c.compartment_id === null) : []
        if (root_ids.length === 0) {
            this.compartments = [new Compartment({display_name: 'Deployment Compartment'}, this), ...this.compartments]
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
        this.getOkitJson = function() {return okitjson};
        // Add Id
        this.id = this.okit_id;
        // All Artefacts will have compartment id, display name & description
        this.compartment_id = '';
        this.display_name = this.generateDefaultName(okitjson.metadata.resource_count += 1);
        this.definition = '';
        this.okit_reference = `okit-${uuidv4()}`;
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
        Object.defineProperty(this, 'documentation', {get: function() {return this.definition;}, set: function(documentation) {this.definition = documentation;}, enumerable: true });
    }

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
    filter(filter) {
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
    }

    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        //alert('Get Artifact Reference function "getArtifactReference()" has not been implemented.');
        return this.constructor.getArtifactReference();
    }

    artefactToElement(name) {
        return name.toLowerCase().split(' ').join('_') + 's';
    }


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

    deleteChildren() {
        this.children.forEach((r) => r.delete())
        // Filter keeps resource no released to this resource
        this.filter(this.not_child_filter)
    }

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
        const today = new Date();
        const pad = (n) => ("0" + n).slice(-2)
        return `${this.getNamePrefix()}-${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}-${pad(today.getHours())}${pad(today.getMinutes())}${pad(today.getSeconds())}`;
        // return this.getNamePrefix() + ('000' + count).slice(-3);
    }

    getNamePrefix() {
        return okitSettings ? okitSettings.name_prefix : 'okit';
    }

    getAvailabilityDomainNumber(availability_domain) {
        console.info(`getAvailabilityDomainNumber(${availability_domain}) ${typeof availability_domain} ${typeof availability_domain.toString()}`)
        return availability_domain.toString().slice(-1)
        // if (availability_domain) {
        //     return +availability_domain.slice(-1);
        // } else {
        //     return +availability_domain;
        // }
    }

    generateResourceName() {return `Okit_${this.getArtifactReference().split(' ').join('_')}_${Date.now()}`}

    generateResourceNameFromDisplayName(name) {return titleCase(name).split(' ').join('').replaceAll('-','_')}

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        alert('Get Artifact Reference function "getArtifactReference()" has not been implemented.');
        return;
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

/*
** Model Representation of OCI Regions
 */
class OkitRegionsJson {
    /*
    ** Create
     */
    constructor() {
        this['us-sanjose-1'] = new OkitJson();
        this['us-phoenix-1'] = new OkitJson();
        this['us-ashburn-1'] = new OkitJson();
        this['uk-london-1'] = new OkitJson();
        this['sa-saopaulo-1'] = new OkitJson();
        this['me-jeddah-1'] = new OkitJson();
        this['eu-zurich-1'] = new OkitJson();
        this['eu-frankfurt-1'] = new OkitJson();
        this['eu-amsterdam-1'] = new OkitJson();
        this['ca-toronto-1'] = new OkitJson();
        this['ca-montreal-1'] = new OkitJson();
        this['ap-tokyo-1'] = new OkitJson();
        this['ap-sydney-1'] = new OkitJson();
        this['ap-seoul-1'] = new OkitJson();
        this['ap-osaka-1'] = new OkitJson();
        this['ap-mumbai-1'] = new OkitJson();
        this['ap-melbourne-1'] = new OkitJson();
        this['ap-hyderabad-1'] = new OkitJson();
        this['ap-chuncheon-1'] = new OkitJson();
    }
}

let okitJsonModel
