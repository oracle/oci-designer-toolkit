/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded DatabaseSystem Pricing Javascript');

/*
** Define DatabaseSystem Pricing Class
 */
class DatabaseSystemOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.database_system
        let price_per_month = this.getOcpuCost(skus[resource.database_edition.toLowerCase()], resource)
        price_per_month += resource.license_model === 'BRING_YOUR_OWN_LICENSE' ? this.getByolCost(skus.byol, resource) : 0
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.database_system
        let bom = {
            skus: [this.getOcpuBoMEntry(skus[resource.database_edition.toLowerCase()], resource)], 
            price_per_month: this.getPrice(resource)
        }
        if (resource.license_model === 'BRING_YOUR_OWN_LICENSE') bom.skus.push(this.getByolBoMEntry(skus.byol, resource))
        return bom
    }

    /*
    ** Pricing Functions
    */
    getOcpuCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const sku_prices = this.getSkuCost(sku)
        const units = +shape.available_core_count * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getByolCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const sku_prices = this.getSkuCost(sku)
        const units = +shape.available_core_count * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM functions
    */
    getOcpuBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = +shape.available_core_count // OCPUs
        bom_entry.price_per_month = this.getOcpuCost(sku, resource)
        return bom_entry
    }

    getByolBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1
        bom_entry.price_per_month = this.getByolCost(sku, resource)
        return bom_entry
    }

    /*
    ** Shape information
    */
    getShapeDetails = (shape) => okitOciData.getDBSystemShape(shape)
}

OkitOciProductPricing.prototype.getDatabaseSystemPrice = function(resource) {
    const pricing_resource = new DatabaseSystemOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getDatabaseSystemBoM = function(resource) {
    const pricing_resource = new DatabaseSystemOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
