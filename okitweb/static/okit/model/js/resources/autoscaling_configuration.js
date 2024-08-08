/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Autoscaling Configuration Javascript');

/*
** Define Autoscaling Configuration Class
*/
class AutoscalingConfiguration extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.resource = {
            id: '',
            type: 'instancePool'
        }
        this.policies = [this.newThresholdPolicy()]
        this.is_enabled = true
        this.cool_down_in_seconds = 300
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Export resource as autoscaling_resource
        Object.defineProperty(this, 'auto_scaling_resources', {get: function() {return this.resource}, set: function(resource) {this.resource = resource}, enumerable: true });
        Object.defineProperty(this, 'instance_pool_id', {get: function() {return this.resource.id}, set: function(id) {this.resource.id = id}, enumerable: true });
        Object.defineProperty(this, 'policy_type', {get: function() {return this.policies[0].policy_type}, set: function(policy_type) {this.policies[0].policy_type = policy_type}, enumerable: true });
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'ac';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Autoscaling Configuration';
    }
    /*
    ** Threshold Get Functions
    */
   getThresholdScaleOutRule = () => this.policy_type === 'threshold' ? this.policies[0].rules.find(r => ['GT', 'GTE'].includes(r.metric.threshold.operator)) : this.newThreasholdScaleOutRule()
   getThresholdScaleInRule = () => this.policy_type === 'threshold' ? this.policies[0].rules.find(r => ['LT', 'LTE'].includes(r.metric.threshold.operator)) : this.newThreasholdScaleInRule()
   getThresholdPerformanceMetric = () => this.policy_type === 'threshold' ? this.policies[0].rules[0].metric.metric_type : 'CPU_UTILIZATION'
   getThresholdCapacity = () => this.policy_type === 'threshold' ? this.policies[0].capacity : this.newThreasholdCapacity()
    /*
    ** New Elements
    */
   newThresholdPolicy = () => {
        return {
            policy_type: 'threshold',
            display_name: `${this.display_name} Policy`,
            is_enabled: true,
            capacity: this.newThreasholdCapacity(),
            rules: [this.newThreasholdScaleOutRule(), this.newThreasholdScaleInRule()]
        }
   }
   newScheduledPolicy = () => {
        return {
            policy_type: 'scheduled',
            display_name: `${this.display_name} Policy`,
            is_enabled: true,
            capacity: this.newScheduledCapacity(),
            execution_schedule: {
                expresion: '0 0 0 0 0 0',
                timezone: 'UTC',
                type: 'cron'
            }
        }
   }
   newThreasholdCapacity = () => {
        return {
            initial: 1,
            min: 1,
            max: 1
        }
   }
   newScheduledCapacity = () => {
        return {
            initial: 1
        }
   }
   newThreasholdScaleOutRule = (metric_type='CPU_UTILIZATION') => {
        return {
            action: {
                type: 'CHANGE_BY_COUNT',
                value: 1
            },
            metric: {
                metric_type: metric_type,
                threshold: {
                    operator: 'GTE',
                    value: 50
                }
            }
        }
   }
   newThreasholdScaleInRule = (metric_type='CPU_UTILIZATION') => {
        return {
            action: {
                type: 'CHANGE_BY_COUNT',
                value: -1
            },
            metric: {
                metric_type: metric_type,
                threshold: {
                    operator: 'LT',
                    value: 40
                }
            }
        }
   }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newAutoscalingConfiguration = function(data) {
    this.getAutoscalingConfigurations().push(new AutoscalingConfiguration(data, this));
    return this.getAutoscalingConfigurations()[this.getAutoscalingConfigurations().length - 1];
}
OkitJson.prototype.getAutoscalingConfigurations = function() {
    if (!this.autoscaling_configurations) this.autoscaling_configurations = []
    return this.autoscaling_configurations;
}
OkitJson.prototype.getAutoscalingConfiguration = function(id='') {
    return this.getAutoscalingConfigurations().find(r => r.id === id)
}
OkitJson.prototype.deleteAutoscalingConfiguration = function(id) {
    this.autoscaling_configurations = this.autoscaling_configurations ? this.autoscaling_configurations.filter((r) => r.id !== id) : []
}

