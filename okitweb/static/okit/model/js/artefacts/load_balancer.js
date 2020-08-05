/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Load Balancer Javascript');

/*
** Define Load Balancer Class
 */
class LoadBalancer extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.load_balancers.length + 1);
        this.compartment_id = '';
        this.subnet_ids = [];
        this.is_private = false;
        this.shape = '100Mbps';
        this.protocol = 'HTTP';
        this.port = '80';
        this.instance_ids = [];
        this.ip_mode = '';
        this.network_security_group_ids = [];
        this.backend_policy = 'ROUND_ROBIN';
        this.health_checker = {url_path: '/'}
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Expose subnet_id for the first Mount target at the top level
        Object.defineProperty(this, 'subnet_id', { get: function() {return this.subnet_ids[0];}, enumerable: false });
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        if (this.shape_name !== undefined) {this.shape = this.shape_name; delete this.shape_name;}
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new LoadBalancer(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {}

    getNamePrefix() {
        return super.getNamePrefix() + 'lb';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Load Balancer';
    }

}
