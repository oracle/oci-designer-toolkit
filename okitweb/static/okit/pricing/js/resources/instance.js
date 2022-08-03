/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Instance Pricing Javascript');

/*
** Define Instance Pricing Class
 */
class InstanceOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
    }

    getPrice(resource) {
        resource = resource ? resource : this.resource
        const price_per_month = this.getShapeCost(resource) + this.getBootVolumePerformanceCost(resource) + this.getBootVolumeCapacityCost(resource) + this.getOsCost(resource)
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        resource = resource ? resource : this.resource
    }

    getShapeCost(resource) {
        // Process Shape Information
        const shape_sku = this.sku_map.instance.shape[resource.shape]
        const list_price = this.getSkuCost(shape_sku)
        const price_per_month = list_price * +resource.shape_config.ocpus * this.monthly_utilization
        return price_per_month
    }

    getBootVolumePerformanceCost(resource) {
        // Process Boot Volume Performance Information
        const boot_vol_perf_sku = 'B91962' // Performance
        const list_price = this.getSkuCost(boot_vol_perf_sku)
        const price_per_month = list_price * +resource.source_details.boot_volume_size_in_gbs * 10
        return price_per_month
    }

    getBootVolumeCapacityCost(resource) {
        // Process Boot Volume Performance Information
        const boot_vol_cap_sku = 'B91961' // Capacity
        const list_price = this.getSkuCost(boot_vol_cap_sku)
        const price_per_month = list_price * +resource.source_details.boot_volume_size_in_gbs
        return price_per_month
    }

    getOsCost(resource) {
        const os_sku = this.sku_map.os[resource.source_details.os.toLowerCase()]
        const list_price = this.getSkuCost(os_sku)
        const price_per_month = os_sku ? list_price * this.monthly_utilization : 0
        return price_per_month
    }
}

OkitOciProductPricing.prototype.getInstancePrice = function(resource) {
    const pricing_resource = new InstanceOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getInstanceBoM = function(resource) {
    const resource_name = resource.getArtifactReference()
    const shape_sku = this.sku_map.instance.shape[resource.shape]
    const boot_vol_perf_sku = 'B91962' // Performance
    const boot_vol_cap_sku = 'B91961' // Capacity
    const os_sku = this.sku_map.os[resource.source_details.os.toLowerCase()]
    const skus = [shape_sku, boot_vol_perf_sku, boot_vol_cap_sku]
    const bom = {skus: skus, price_per_month: 0}
    const shape_entry = this.getBoMSkuEntry(shape_sku)
    const boot_vol_perf_entry = this.getBoMSkuEntry(boot_vol_perf_sku)
    const boot_vol_cap_entry = this.getBoMSkuEntry(boot_vol_cap_sku)
    const monthly_utilization = 744
    let price_per_month = 0
    // Process Shape Information
    price_per_month = shape_entry.list_price * +resource.shape_config.ocpus * monthly_utilization
    this.updateCostEstimate(resource_name, price_per_month)
    bom.price_per_month += price_per_month
    shape_entry.quantity += 1
    shape_entry.utilization = monthly_utilization // Hrs/ Month
    shape_entry.units += resource.shape_config.ocpus // OCPUs
    shape_entry.price_per_month += price_per_month
    // Process Boot Volume Performance Information
    price_per_month = boot_vol_perf_entry.list_price * +resource.source_details.boot_volume_size_in_gbs * 10
    this.updateCostEstimate(resource_name, price_per_month)
    bom.price_per_month += price_per_month
    boot_vol_perf_entry.quantity += 1
    boot_vol_perf_entry.utilization += 10 // VPUS / GB
    boot_vol_perf_entry.units += +resource.source_details.boot_volume_size_in_gbs // Convert to Number
    boot_vol_perf_entry.price_per_month += price_per_month
    // Process Boot Volume Capacity Information
    price_per_month = boot_vol_cap_entry.list_price * +resource.source_details.boot_volume_size_in_gbs
    this.updateCostEstimate(resource_name, price_per_month)
    bom.price_per_month += price_per_month
    boot_vol_cap_entry.quantity += 1
    boot_vol_cap_entry.utilization = 1
    boot_vol_cap_entry.units += +resource.source_details.boot_volume_size_in_gbs // Convert to Number
    boot_vol_cap_entry.price_per_month += price_per_month
    if (os_sku) {
        skus.push(os_sku)
        const os_entry = this.getBoMSkuEntry(os_sku)
        price_per_month = os_entry.list_price * monthly_utilization
        this.updateCostEstimate(resource_name, price_per_month)
        bom.price_per_month += price_per_month
        os_entry.quantity += 1
        os_entry.utilization = monthly_utilization // Hrs/ Month
        os_entry.units += 1
        os_entry.price_per_month += price_per_month
    }
    return bom
}

