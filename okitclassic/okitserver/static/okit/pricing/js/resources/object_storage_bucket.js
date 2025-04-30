/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded ObjectStorageBucket Pricing Javascript');

/*
** Define ObjectStorageBucket Pricing Class
 */
class ObjectStorageBucketOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
    }

    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.object_storage_bucket.tier[resource.storage_tier]
        let price_per_month = 0
        price_per_month += skus.capacity  ? this.getCapacityCost(skus.capacity, resource) : 0
        price_per_month += skus.requests  ? this.getRequestsCost(skus.requests, resource) : 0
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.object_storage_bucket.tier[resource.storage_tier]
        let bom = {skus: [], price_per_month: this.getPrice(resource)}
        if (skus.capacity) {bom.skus.push(this.getCapacityBoMEntry(skus.capacity, resource))}
        if (skus.requests) {bom.skus.push(this.getRequestsBoMEntry(skus.requests, resource))}
        return bom
    }

    /*
    ** Pricing Functions
    */
    getCapacityCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.estimated_monthly_capacity_gbs
        return this.getMonthlyCost(sku_prices, units)
    }

    getRequestsCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.estimated_monthly_requests
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM functions
    */
    getCapacityBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.object_storage_bucket.tier[resource.storage_tier].capacity
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.estimated_monthly_capacity_gbs
        bom_entry.price_per_month = this.getCapacityCost(sku, resource)
        return bom_entry
    }
    getRequestsBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.object_storage_bucket.tier[resource.storage_tier].requests
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.estimated_monthly_requests
        bom_entry.price_per_month = this.getRequestsCost(sku, resource)
        return bom_entry
    }
}

OkitOciProductPricing.prototype.getObjectStorageBucketPrice = function(resource) {
    const pricing_resource = new ObjectStorageBucketOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getObjectStorageBucketBoM = function(resource) {
    const pricing_resource = new ObjectStorageBucketOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
