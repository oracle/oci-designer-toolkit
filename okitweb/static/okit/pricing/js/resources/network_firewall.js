/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded NetworkFirewall Pricing Javascript');

/*
** Define NetworkFirewall Pricing Class
 */
class NetworkFirewallOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.network_firewall
        let price_per_month = 0
        price_per_month += skus.instance ? this.getInstanceCost(skus.instance, resource) : 0
        price_per_month += skus.data ? this.getDataCost(skus.data, resource) : 0
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.network_firewall
        let bom = {skus: [], price_per_month: this.getPrice(resource)}
        if (skus.instance) {bom.skus.push(this.getInstanceBoMEntry(skus.instance, resource))}
        if (skus.data) {bom.skus.push(this.getDataBoMEntry(skus.data, resource))}
        return bom
    }

    /*
    ** Pricing Functions
    */
    getInstanceCost(sku, resource) {
        resource = resource ? resource : this.resource
        const sku_prices = this.getSkuCost(sku)
        const units = +this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getDataCost(sku, resource) {
        resource = resource ? resource : this.resource
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.pricing_estimates.estimated_gb_data_processed
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM functions
    */
    getInstanceBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1 // Instances
        bom_entry.price_per_month = this.getInstanceCost(sku, resource)
        return bom_entry
    }

    getDataBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.pricing_estimates.estimated_gb_data_processed
        bom_entry.price_per_month = this.getDataCost(sku, resource)
        return bom_entry
    }

    /*
    ** Shape information
    */
    getShapeDetails = (shape) => okitOciData.getDBSystemShape(shape)
}

OkitOciProductPricing.prototype.getNetworkFirewallPrice = function(resource) {
    const pricing_resource = new NetworkFirewallOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getNetworkFirewallBoM = function(resource) {
    const pricing_resource = new NetworkFirewallOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
