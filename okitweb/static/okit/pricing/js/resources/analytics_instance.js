/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded AnalyticsInstance Pricing Javascript');

/*
** Define AnalyticsInstance Pricing Class
 */
class AnalyticsInstanceOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
    }

    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.analytics_instance
        const price_per_month = this.getOcpuCost(skus.ocpu, resource)
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.analytics_instance
        const bom = {skus: [this.getOcpuBoMEntry(skus.ocpu, resource)], price_per_month: this.getPrice(resource)}
        return bom
    }

    /*
    ** Pricing Functions
    */
    getOcpuCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.pricing_estimates.estimated_ocpu_per_hour * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM Functions
    */
    getOcpuBoMEntry(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = +resource.pricing_estimates.estimated_ocpu_per_hour
        bom_entry.price_per_month = this.getOcpuCost(sku, resource)
        return bom_entry
    }
}

OkitOciProductPricing.prototype.getAnalyticsInstancePrice = function(resource) {
    const pricing_resource = new AnalyticsInstanceOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getAnalyticsInstanceBoM = function(resource) {
    const pricing_resource = new AnalyticsInstanceOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
