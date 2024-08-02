/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
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

    get performance_sku() {return 'B91962'} // Performance
    get capacity_sku() {return 'B91961'} // Capacity

    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.block_storage_volume
        const price_per_month = this.getPerformanceCost(skus.performance, resource) + this.getCapacityCost(skus.capacity, resource)
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.block_storage_volume
        const bom = {
            skus: [this.getPerformanceBoMEntry(skus.performance, resource), this.getCapacityBoMEntry(skus.capacity, resource)], 
            price_per_month: this.getPrice(resource)
        }
        return bom
    }

    /*
    ** Pricing Functions
    */
    getPerformanceCost(sku, resource) {
        // const list_price = this.getSkuCost(sku)
        // const price_per_month = list_price * +resource.vpus_per_gb * +resource.size_in_gbs
        // return price_per_month
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.vpus_per_gb * +resource.size_in_gbs
        return this.getMonthlyCost(sku_prices, units)
    }

    getCapacityCost(sku, resource) {
        // const list_price = this.getSkuCost(sku)
        // const price_per_month = list_price * +resource.size_in_gbs
        // return price_per_month
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.size_in_gbs
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM functions
    */
    getPerformanceBoMEntry(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +resource.vpus_per_gb // VPUS / GB
        bom_entry.units = +resource.size_in_gbs
        bom_entry.price_per_month = this.getPerformanceCost(sku, resource)
        return bom_entry
    }

    getCapacityBoMEntry(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.size_in_gbs
        bom_entry.price_per_month = this.getCapacityCost(sku, resource)
        return bom_entry
    }
}

OkitOciProductPricing.prototype.getBlockStorageVolumePrice = function(resource, pricing) {
    pricing = pricing ? pricing : this
    const pricing_resource = new BlockStorageVolumeOciPricing(resource, pricing)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getBlockStorageVolumeBoM = function(resource, pricing) {
    pricing = pricing ? pricing : this
    const pricing_resource = new BlockStorageVolumeOciPricing(resource, pricing)
    return pricing_resource.getBoM(resource)
}

