/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded LoadBalancer Pricing Javascript');

/*
** Define LoadBalancer Pricing Class
 */
class LoadBalancerOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.load_balancer
        const price_per_month = this.getBaseCost(skus.base, resource) + this.getBandwidthCost(skus.bandwidth, resource)
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.load_balancer
        const bom = {
            skus: [this.getBaseBoMEntry(skus.base, resource), this.getBandwidthBoMEntry(skus.bandwidth, resource)], 
            price_per_month: this.getPrice(resource)}
        return bom
    }

    /*
    ** Pricing Functions
    */
    getBaseCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = 2 * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getBandwidthCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = +this.getMbps(resource) * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM Functions
    */
    getBaseBoMEntry(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1
        bom_entry.price_per_month = this.getBaseCost(sku, resource)
        return bom_entry
    }

    getBandwidthBoMEntry(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = +this.getMbps(resource)
        bom_entry.price_per_month = this.getBandwidthCost(sku, resource)
        return bom_entry
    }

    getMbps(resource) {
        console.info('Mbps', resource.shape, resource.shape.split('Mbps'))
        return resource.shape === 'flexible' ? +resource.shape_details.maximum_bandwidth_in_mbps : + resource.shape.split('Mbps')[0]
    }
}

OkitOciProductPricing.prototype.getLoadBalancerPrice = function(resource) {
    const pricing_resource = new LoadBalancerOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getLoadBalancerBoM = function(resource) {
    const pricing_resource = new LoadBalancerOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
