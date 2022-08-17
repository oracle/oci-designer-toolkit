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
        this.balanced_performance = 10
    }

    get boot_vol_performance_sku() {return 'B91962'} // Performance
    get boot_vol_capacity_sku() {return 'B91961'} // Capacity
    // get monthly_utilization() {return 744}

    getPrice(resource) {
        resource = resource ? resource : this.resource
        const bsv = new BlockStorageVolume({size_in_gbs: +resource.source_details.boot_volume_size_in_gbs, vpus_per_gb: this.balanced_performance}, new OkitJson())
        const bsv_pricing = new BlockStorageVolumeOciPricing(bsv, this.pricing)
        const price_per_month = this.getShapeCost(resource) + this.getOsCost(resource) + bsv_pricing.getPrice(bsv)
        // const price_per_month = this.getShapeCost(resource) + this.getBootVolumePerformanceCost(resource) + this.getBootVolumeCapacityCost(resource) + this.getOsCost(resource)
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        resource = resource ? resource : this.resource
        const bsv = new BlockStorageVolume({size_in_gbs: +resource.source_details.boot_volume_size_in_gbs, vpus_per_gb: this.balanced_performance}, new OkitJson())
        const bsv_pricing = new BlockStorageVolumeOciPricing(bsv, this.pricing)
        const bom = {
            skus: [this.getShapeBoMEntry(resource), this.gethOsBoMEntry(resource), ...bsv_pricing.getBoM(bsv).skus], 
            // skus: [this.getShapeBoMEntry(resource), this.getBootVolumePerformanceBoMEntry(resource), this.getBootVolumeCapacityBoMEntry(resource), this.gethOsBoMEntry(resource)], 
            price_per_month: this.getPrice(resource)
        }
        return bom
    }

    getShapeBoMEntry(resource) {
        const sku = this.sku_map.instance.shape[resource.shape]
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/ Month
        bom_entry.units = +resource.shape_config.ocpus // OCPUs
        bom_entry.price_per_month = this.getShapeCost(resource)
        return bom_entry
    }

    // getBootVolumePerformanceBoMEntry(resource) {
    //     const sku = this.boot_vol_performance_sku // Performance
    //     const bom_entry = this.newSkuEntry(sku)
    //     bom_entry.quantity = 1
    //     bom_entry.utilization = 10 // VPUS / GB
    //     bom_entry.units = +resource.source_details.boot_volume_size_in_gbs
    //     bom_entry.price_per_month = this.getBootVolumePerformanceCost(resource)
    //     return bom_entry
    // }

    // getBootVolumeCapacityBoMEntry(resource) {
    //     const sku = this.boot_vol_capacity_sku // Capacity
    //     const bom_entry = this.newSkuEntry(sku)
    //     bom_entry.quantity = 1
    //     bom_entry.utilization = 1
    //     bom_entry.units = +resource.source_details.boot_volume_size_in_gbs
    //     bom_entry.price_per_month = this.getBootVolumeCapacityCost(resource)
    //     return bom_entry
    // }

    gethOsBoMEntry(resource) {
        const sku = this.sku_map.os[resource.source_details.os.toLowerCase()]
        const bom_entry = this.newSkuEntry(sku)
        if (sku) {
            bom_entry.quantity = 1
            bom_entry.utilization = +this.monthly_utilization // Hrs/ Month
            bom_entry.units = 1
            bom_entry.price_per_month = this.getOsCost(resource)
        }
        return bom_entry
    }

    getShapeCost(resource) {
        // Process Shape Information
        const sku = this.sku_map.instance.shape[resource.shape]
        const list_price = this.getSkuCost(sku)
        const price_per_month = list_price * +resource.shape_config.ocpus * this.monthly_utilization
        return price_per_month
    }

    getBootVolumePerformanceCost(resource) {
        // Process Boot Volume Performance Information
        const sku = this.boot_vol_performance_sku // Performance
        const list_price = this.getSkuCost(sku)
        const price_per_month = list_price * +resource.source_details.boot_volume_size_in_gbs * 10
        return price_per_month
    }

    getBootVolumeCapacityCost(resource) {
        // Process Boot Volume Performance Information
        const sku = this.boot_vol_capacity_sku // Capacity
        const list_price = this.getSkuCost(sku)
        const price_per_month = list_price * +resource.source_details.boot_volume_size_in_gbs
        return price_per_month
    }

    getOsCost(resource) {
        const sku = this.sku_map.os[resource.source_details.os.toLowerCase()]
        const list_price = this.getSkuCost(sku)
        const price_per_month = sku ? list_price * this.monthly_utilization : 0
        return price_per_month
    }
}

OkitOciProductPricing.prototype.getInstancePrice = function(resource, pricing) {
    pricing = pricing ? pricing : this
    const pricing_resource = new InstanceOciPricing(resource, pricing)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getInstanceBoM = function(resource, pricing) {
    pricing = pricing ? pricing : this
    const pricing_resource = new InstanceOciPricing(resource, pricing)
    return pricing_resource.getBoM(resource)
}

