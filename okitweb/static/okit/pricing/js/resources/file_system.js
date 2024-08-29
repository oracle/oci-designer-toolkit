/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded FileSystem Pricing Javascript');

/*
** Define FileSystem Pricing Class
 */
class FileSystemOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.file_system
        const price_per_month = this.getUsageCost(skus.usage, resource)
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.file_system
        const bom = {skus: [this.getUsageBoMEntry(skus.usage, resource)], price_per_month: this.getPrice(resource)}
        return bom
    }

    /*
    ** Pricing Functions
    */
    getUsageCost(sku, resource) {
        // const list_price = this.getSkuCost(sku)
        // const price_per_month = list_price * +resource.estimated_capacity_per_month_gbs
        // return price_per_month
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.estimated_capacity_per_month_gbs
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM Functions
    */
    getUsageBoMEntry(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.estimated_capacity_per_month_gbs
        bom_entry.price_per_month = this.getUsageCost(sku, resource)
        return bom_entry
    }
}

OkitOciProductPricing.prototype.getFileSystemPrice = function(resource) {
    const pricing_resource = new FileSystemOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getFileSystemBoM = function(resource) {
    const pricing_resource = new FileSystemOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
