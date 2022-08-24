/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded DatabaseSystem Pricing Javascript');

/*
** Define DatabaseSystem Pricing Class
 */
class DatabaseSystemOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const price_per_month = 0
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const bom = {skus: [], price_per_month: 0}
        return bom
    }
}

OkitOciProductPricing.prototype.getDatabaseSystemPrice = function(resource) {
    const pricing_resource = new DatabaseSystemOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getDatabaseSystemBoM = function(resource) {
    const pricing_resource = new DatabaseSystemOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
