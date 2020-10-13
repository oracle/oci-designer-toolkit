/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Instance Pool Javascript');

/*
** Define Compartment Artifact Class
 */
class InstancePool extends OkitArtifact {
    /*
    ** Create
     */
    constructor(data = {}, okitjson = {}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = '';
        this.display_name = this.generateDefaultName(okitjson.instance_pools.length + 1);
        this.placement_configurations = [
            {
                availability_domain: '1',
                primary_subnet_id: '',
                fault_domains: [],
                secondary_vnic_subnets: []
            }
        ];
        this.size = 3;
        this.load_balancers = [];
        this.instance_configuration = {
            source: 'INSTANCE',
            instance_id: ''
        };
        this.auto_scaling = {
            policies: []
        }
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert();
    }

    /*
    ** Clone Functionality
     */
    clone() {
        return new InstancePool(this, this.getOkitJson());
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'inp';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Instance Pool';
    }

    /*
    ** Initialisation Functions
     */
    initialisePolicy() {
        const policy = {
            capacity: {
                initial: 2,
                max: 2,
                min: 1
            },
            policy_type: ''
        }
    }
}