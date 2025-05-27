/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Autoscaling Configuration Properties Javascript');

/*
** Define Autoscaling Configuration Properties Class
*/
class AutoscalingConfigurationProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Instance Pool
        const instance_pool_id = this.createInput('select', 'Instance Pool', `${this.id}_instance_pool_id`, '', (d, i, n) => this.resource.auto_scaling_resources.id = n[i].value)
        this.instance_pool_id = instance_pool_id.input
        this.append(this.core_tbody, instance_pool_id.row)
        // Cool Down
        const cool_down_in_seconds_data = {min: 0}
        const cool_down_in_seconds = this.createInput('number', 'Cool Down In Seconds', `${this.id}_cool_down_in_seconds`, '', (d, i, n) => this.resource.cool_down_in_seconds = n[i].value, cool_down_in_seconds_data)
        this.cool_down_in_seconds = cool_down_in_seconds.input
        this.append(this.core_tbody, cool_down_in_seconds.row)
        // Policy Type
        const policy_type_data = {
            options: {
                threshold: 'Metric-based Autoscaling', 
                // scheduled: 'Schedule-based Autoscaling'
            }
        }
        const policy_type = this.createInput('select', 'Metric type', `${this.id}_policy_type`, '', (d, i, n) => {this.resource.policy_type = n[i].value; this.handlePolicyTypeChange(n[i].value)}, policy_type_data)
        this.policy_type = policy_type.input
        this.append(this.core_tbody, policy_type.row)
        // Threshold
        this.buildThresholdResources()        
        // Scheduled
        this.buildScheduledResources()
    }

    buildThresholdResources() {
        // Threshold
        const threshold = this.createDetailsSection('Threshold', `${this.id}_threshold_details`)
        this.append(this.properties_contents, threshold.details)
        this.threshold_details = threshold.details
        this.threshold_div = threshold.div
        const threshold_table = this.createTable('', `${this.id}_threshold`)
        this.threshold_tbody = threshold_table.tbody
        this.append(this.threshold_div, threshold_table.table)

        // Performance Metric
        const threshold_performance_metric_data = {
            options: {
                CPU_UTILIZATION: 'CPU Utilisation', 
                MEMORY_UTILIZATION: 'Memory Utilisation'
            }
        }
        const threshold_performance_metric = this.createInput('select', 'Performance Metric', `${this.id}_threshold_performance_metric`, '', (d, i, n) => {this.resource.threshold_performance_metric = n[i].value; this.handleThresholdMetricChange(n[i].value)}, threshold_performance_metric_data)
        this.threshold_performance_metric = threshold_performance_metric.input
        this.append(this.threshold_tbody, threshold_performance_metric.row)
        // Scale Out Rule
        const scale_out_rule = this.createDetailsSection('Scale-out Rule', `${this.id}_scale_out_rule_details`)
        this.append(this.threshold_div, scale_out_rule.details)
        this.scale_out_rule_div = scale_out_rule.div
        const scale_out_rule_table = this.createTable('', `${this.id}_scale_out_rule`)
        this.scale_out_rule_tbody = scale_out_rule_table.tbody
        this.append(this.scale_out_rule_div, scale_out_rule_table.table)
        // Operator
        const threshold_scale_out_operator_data = {
            options: {
                GT: 'Greater than (>)', 
                GTE: 'Greater than or equal to (>=)'
            }
        }
        const threshold_scale_out_operator = this.createInput('select', 'Performance Metric', `${this.id}_threshold_scale_out_operator`, '', (d, i, n) => {this.resource.getThresholdScaleOutRule().metric.threshold.operator = n[i].value}, threshold_scale_out_operator_data)
        this.threshold_scale_out_operator = threshold_scale_out_operator.input
        this.append(this.scale_out_rule_tbody, threshold_scale_out_operator.row)
        // Threshold Value
        const threshold_scale_out_value_data = {min: 1, max: 100}
        const threshold_scale_out_value = this.createInput('number', 'Threshold Percentage', `${this.id}_threshold_scale_out_value`, '', (d, i, n) => this.resource.getThresholdScaleOutRule().metric.threshold.value = n[i].value, threshold_scale_out_value_data)
        this.threshold_scale_out_value = threshold_scale_out_value.input
        this.append(this.scale_out_rule_tbody, threshold_scale_out_value.row)
        // Additional Instances
        const threshold_scale_out_instances_data = {min: 1}
        const threshold_scale_out_instances = this.createInput('number', 'Instances', `${this.id}_threshold_scale_out_instances`, '', (d, i, n) => this.resource.getThresholdScaleOutRule().action.value = n[i].value, threshold_scale_out_instances_data)
        this.threshold_scale_out_instances = threshold_scale_out_instances.input
        this.append(this.scale_out_rule_tbody, threshold_scale_out_instances.row)

        // Scale In Rule
        const scale_in_rule = this.createDetailsSection('Scale-in Rule', `${this.id}_scale_in_rule_details`)
        this.append(this.threshold_div, scale_in_rule.details)
        this.scale_in_rule_div = scale_in_rule.div
        const scale_in_rule_table = this.createTable('', `${this.id}_scale_in_rule`)
        this.scale_in_rule_tbody = scale_in_rule_table.tbody
        this.append(this.scale_in_rule_div, scale_in_rule_table.table)
        // Operator
        const threshold_scale_in_operator_data = {
            options: {
                LT: 'Less than (<)', 
                LTE: 'Less than or equal to (<=)'
            }
        }
        const threshold_scale_in_operator = this.createInput('select', 'Performance Metric', `${this.id}_threshold_scale_in_operator`, '', (d, i, n) => {this.resource.getThresholdScaleOutRule().metric.threshold.operator = n[i].value}, threshold_scale_in_operator_data)
        this.threshold_scale_in_operator = threshold_scale_in_operator.input
        this.append(this.scale_in_rule_tbody, threshold_scale_in_operator.row)
        // Threshold Value
        const threshold_scale_in_value_data = {min: 1, max: 100}
        const threshold_scale_in_value = this.createInput('number', 'Threshold Percentage', `${this.id}_threshold_scale_in_value`, '', (d, i, n) => this.resource.getThresholdScaleOutRule().metric.threshold.value = n[i].value, threshold_scale_in_value_data)
        this.threshold_scale_in_value = threshold_scale_in_value.input
        this.append(this.scale_in_rule_tbody, threshold_scale_in_value.row)
        // Additional Instances
        const threshold_scale_in_instances_data = {max: -1}
        const threshold_scale_in_instances = this.createInput('number', 'Instances', `${this.id}_threshold_scale_in_instances`, '', (d, i, n) => this.resource.getThresholdScaleOutRule().action.value = n[i].value, threshold_scale_in_instances_data)
        this.threshold_scale_in_instances = threshold_scale_in_instances.input
        this.append(this.scale_in_rule_tbody, threshold_scale_in_instances.row)

        // Scaling Limits
        const scaling_limits = this.createDetailsSection('Scaling Limits', `${this.id}_scaling_limits_details`)
        this.append(this.threshold_div, scaling_limits.details)
        this.scaling_limits_div = scaling_limits.div
        const scaling_limits_table = this.createTable('', `${this.id}_scaling_limits`)
        this.scaling_limits_tbody = scaling_limits_table.tbody
        this.append(this.scaling_limits_div, scaling_limits_table.table)
        // Minimum Instances
        const scaling_limits_min_instances_data = {min: 1}
        const scaling_limits_min_instances = this.createInput('number', 'Minimum Instances', `${this.id}_scaling_limits_min_instances`, '', (d, i, n) => this.resource.getThresholdCapacity().min = n[i].value, scaling_limits_min_instances_data)
        this.scaling_limits_min_instances = scaling_limits_min_instances.input
        this.append(this.scaling_limits_tbody, scaling_limits_min_instances.row)
        // Maximum Instances
        const scaling_limits_max_instances_data = {min: 1}
        const scaling_limits_max_instances = this.createInput('number', 'Maximum Instances', `${this.id}_scaling_limits_max_instances`, '', (d, i, n) => this.resource.getThresholdCapacity().max = n[i].value, scaling_limits_max_instances_data)
        this.scaling_limits_max_instances = scaling_limits_max_instances.input
        this.append(this.scaling_limits_tbody, scaling_limits_max_instances.row)
        // Initial Instances
        const scaling_limits_initial_instances_data = {min: 1}
        const scaling_limits_initial_instances = this.createInput('number', 'Initial Instances', `${this.id}_scaling_limits_initial_instances`, '', (d, i, n) => this.resource.getThresholdCapacity().initial = n[i].value, scaling_limits_initial_instances_data)
        this.scaling_limits_initial_instances = scaling_limits_initial_instances.input
        this.append(this.scaling_limits_tbody, scaling_limits_initial_instances.row)
    }

    buildScheduledResources() {
        // Scheduled
        const scheduled = this.createDetailsSection('Scheduled', `${this.id}_scheduled_details`)
        this.append(this.properties_contents, scheduled.details)
        this.scheduled_details = scheduled.details
        this.scheduled_div = scheduled.div
        const scheduled_table = this.createTable('', `${this.id}_scheduled`)
        this.scheduled_tbody = scheduled_table.tbody
        this.append(this.scheduled_div, scheduled_table.table)

    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        const pool_filter = (ip) => !this.resource.getOkitJson().getAutoscalingConfigurations().map(a => a.resource.id).includes(ip.id)
        this.loadSelect(this.instance_pool_id, 'instance_pool', true, pool_filter)
        // Assign Values
        this.instance_pool_id.property('value', this.resource.auto_scaling_resources.id)
        this.cool_down_in_seconds.property('value', this.resource.cool_down_in_seconds)
        this.policy_type.property('value', this.resource.policy_type)
        this.showHidePolicyTypeRows(this.resource.policy_type)
        if (this.resource.policy_type === 'threshold') this.loadThresholdResources()
        else this.loadScheduledResources()
    }

    loadThresholdResources() {
        // Performance Metric
        this.threshold_performance_metric.property('value', this.resource.getThresholdPerformanceMetric())
        // Scale Out
        const scale_out_rule = this.resource.getThresholdScaleOutRule()
        this.threshold_scale_out_operator.property('value', scale_out_rule.metric.threshold.operator)
        this.threshold_scale_out_value.property('value', scale_out_rule.metric.threshold.value)
        this.threshold_scale_out_instances.property('value', scale_out_rule.action.value)
        // Scale In
        const scale_in_rule = this.resource.getThresholdScaleInRule()
        this.threshold_scale_in_operator.property('value', scale_in_rule.metric.threshold.operator)
        this.threshold_scale_in_value.property('value', scale_in_rule.metric.threshold.value)
        this.threshold_scale_in_instances.property('value', scale_in_rule.action.value)
        // Scaling Limits
        const capacity = this.resource.getThresholdCapacity()
        this.scaling_limits_min_instances.property('value', capacity.min)
        this.scaling_limits_max_instances.property('value', capacity.max)
        this.scaling_limits_initial_instances.property('value', capacity.initial)
    }

    loadScheduledResources() {

    }

    handlePolicyTypeChange(policy_type) {
        policy_type = policy_type ? policy_type : this.resource.policy_type
        this.resource.policies = [policy_type === 'threshold' ? this.resource.newThresholdPolicy() : this.resource.newScheduledPolicy()]
        this.showHidePolicyTypeRows(policy_type)
        if (policy_type === 'threshold') this.loadThresholdResources()
        else this.loadScheduledResources()
    }

    handleThresholdMetricChange(metric_type) {
        this.resource.policies[0].rules.forEach(r => r.metric.metric_type = metric_type)
    }

    showHidePolicyTypeRows(policy_type) {
        policy_type = policy_type ? policy_type : this.resource.policy_type
        this.threshold_details.classed('collapsed', policy_type !== 'threshold')
        this.scheduled_details.classed('collapsed', policy_type !== 'scheduled')
    }
}
