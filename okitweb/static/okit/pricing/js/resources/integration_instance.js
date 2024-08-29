/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded IntegrationInstance Pricing Javascript');

/*
** Define IntegrationInstance Pricing Class
 */
class IntegrationInstanceOciPricing extends OkitOciPricingResource {
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
        const bom = {skus: [], price_per_month: this.getPrice(resource)}
        return bom
    }
}

OkitOciProductPricing.prototype.getIntegrationInstancePrice = function(resource) {
    const pricing_resource = new IntegrationInstanceOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getIntegrationInstanceBoM = function(resource) {
    const pricing_resource = new IntegrationInstanceOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
