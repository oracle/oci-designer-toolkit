/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OkeCluster Pricing Javascript');

/*
** Define OkeCluster Pricing Class
 */
class OkeClusterOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.oke_cluster
        const price_per_month = this.getTypeCost(skus.type[resource.type], resource)
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.oke_cluster
        const bom = {skus: [this.getTypeBoMEntry(skus.usage, resource)], price_per_month: this.getPrice(resource)}
        return bom
    }

    /*
    ** Pricing Functions
    */
    getTypeCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = 1
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM Functions
    */
    getTypeBoMEntry(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = 1
        bom_entry.price_per_month = this.getTypeCost(sku, resource)
        return bom_entry
    }
}

OkitOciProductPricing.prototype.getOkeClusterPrice = function(resource) {
    const pricing_resource = new OkeClusterOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getOkeClusterBoM = function(resource) {
    const pricing_resource = new OkeClusterOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
