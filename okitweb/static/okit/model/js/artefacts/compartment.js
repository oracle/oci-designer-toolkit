/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Compartment Javascript');

/*
** Define Compartment Artifact Class
 */
class Compartment extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = null;
        this.name = this.generateDefaultName(okitjson.compartments.length + 1);
        this.display_name = this.name;
        this.description = this.name;
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert();
        // Check if Root
        if (this.id === this.compartment_id) {this.compartment_id = null;}
    }

    /*
    ** Clone Functionality
     */
    clone() {
        return new Compartment(JSON.clone(this), this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        console.log('Deleting Children of ' + this.getArtifactReference() + ' : ' + this.display_name);
        // Remove Compartments
        this.getOkitJson().compartments = this.getOkitJson().compartments.filter(function(child) {
            if (child.compartment_id === this.id && child.id !== this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Virtual Cloud Networks
        this.getOkitJson().virtual_cloud_networks = this.getOkitJson().virtual_cloud_networks.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Block Storage Volumes
        this.getOkitJson().block_storage_volumes = this.getOkitJson().block_storage_volumes.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Object Storage Buckets
        this.getOkitJson().object_storage_buckets = this.getOkitJson().object_storage_buckets.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Autonomous Databases
        this.getOkitJson().autonomous_databases = this.getOkitJson().autonomous_databases.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        console.log();
        // Dynamic Routing Gateways
        this.getOkitJson().dynamic_routing_gateways = this.getOkitJson().dynamic_routing_gateways.filter(function(child) {
            if (child.compartment_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'comp';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Compartment';
    }

}
