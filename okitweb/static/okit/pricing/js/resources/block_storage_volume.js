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

    get performance_sku() {return 'B91962'} // Performance
    get capacity_sku() {return 'B91961'} // Capacity

    getPrice(resource) {
        resource = resource ? resource : this.resource
        const price_per_month = this.getPerformanceCost(resource) + this.getCapacityCost(resource)
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        resource = resource ? resource : this.resource
        const bom = {
            skus: [this.getPerformanceBoMEntry(resource), this.getCapacityBoMEntry(resource)], 
            price_per_month: this.getPrice(resource)
        }
        return bom
    }

    getPerformanceBoMEntry(resource) {
        const bom_entry = this.newSkuEntry(this.performance_sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +resource.vpus_per_gb // VPUS / GB
        bom_entry.units = +resource.size_in_gbs
        bom_entry.price_per_month = this.getPerformanceCost(resource)
        return bom_entry
    }

    getCapacityBoMEntry(resource) {
        const bom_entry = this.newSkuEntry(this.capacity_sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.size_in_gbs
        bom_entry.price_per_month = this.getCapacityCost(resource)
        return bom_entry
    }

    getPerformanceCost(resource) {
        const list_price = this.getSkuCost(this.performance_sku)
        const price_per_month = list_price * +resource.vpus_per_gb * +resource.size_in_gbs
        return price_per_month
    }

    getCapacityCost(resource) {
        const list_price = this.getSkuCost(this.capacity_sku)
        const price_per_month = list_price * +resource.size_in_gbs
        return price_per_month
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

