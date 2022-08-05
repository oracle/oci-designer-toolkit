/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded BlockStorageVolume Pricing Javascript');

/*
** Define BlockStorageVolume Pricing Class
 */
class BlockStorageVolumeOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
    }
}

OkitOciProductPricing.prototype.getBlockStorageVolumePrice = function(resource) {
    const resource_name = resource.getArtifactReference()
    const boot_vol_perf_sku = 'B91962' // Performance
    const boot_vol_cap_sku = 'B91961' // Capacity
    const boot_vol_perf_entry = this.getBoMSkuEntry(boot_vol_perf_sku)
    const boot_vol_cap_entry = this.getBoMSkuEntry(boot_vol_cap_sku)
    const skus = [boot_vol_perf_sku, boot_vol_cap_sku]
    const bom = {skus: skus, price_per_month: 0}
    let price_per_month = 0
    // Process Boot Volume Performance Information
    price_per_month = boot_vol_perf_entry.list_price * +resource.vpus_per_gb * +resource.size_in_gbs
    this.updateCostEstimate(resource_name, price_per_month)
    bom.price_per_month += price_per_month
    boot_vol_perf_entry.quantity += 1
    boot_vol_perf_entry.utilization += +resource.vpus_per_gb // VPUS / GB
    boot_vol_perf_entry.units += +resource.size_in_gbs // Convert to Number
    boot_vol_perf_entry.price_per_month += price_per_month
    // Process Boot Volume Capacity Information
    price_per_month = boot_vol_perf_entry.list_price * +resource.size_in_gbs
    this.updateCostEstimate(resource_name, price_per_month)
    bom.price_per_month += price_per_month
    boot_vol_cap_entry.quantity += 1
    boot_vol_cap_entry.utilization = 1
    boot_vol_cap_entry.units += +resource.size_in_gbs // Convert to Number
    boot_vol_cap_entry.price_per_month += price_per_month
    return bom
}

