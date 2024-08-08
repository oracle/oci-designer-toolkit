/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded ExadataCloudInfrastructure Pricing Javascript');

/*
** Define ExadataCloudInfrastructure Pricing Class
 */
class ExadataCloudInfrastructureOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.exadata_cloud_infrastructure.shape[resource.shape]
        let price_per_month = this.getBaseCost(skus.base, resource)
        price_per_month += resource.cluster.license_model === 'BRING_YOUR_OWN_LICENSE' ? this.getByolCost(skus.ocpu.byol, resource) : this.getByolCost(skus.ocpu.included, resource)
        if (skus.server) {
            price_per_month += this.getDatabaseServerCost(skus.server.database, resource) + this.getStorageServerCost(skus.server.storage, resource)
        }
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.exadata_cloud_infrastructure.shape[resource.shape]
        let bom = {
            skus: [this.getBaseBoMEntry(skus.base, resource)], 
            price_per_month: this.getPrice(resource)
        }
        if (resource.cluster.license_model === 'BRING_YOUR_OWN_LICENSE') bom.skus.push(this.getByolBoMEntry(skus.ocpu.byol, resource))
        if (resource.cluster.license_model === 'LICENSE_INCLUDED') bom.skus.push(this.getIncludedBoMEntry(skus.ocpu.included, resource))
        if (skus.server) {
            const database = this.getDatabaseBoMEntry(skus.server.database, resource)
            const storage = this.getStorageBoMEntry(skus.server.storage, resource)
            if (database.quantity > 0) bom.skus.push(database)
            if (storage.quantity > 0) bom.skus.push(storage)
        }
        return bom
    }

    /*
    ** Pricing Functions
    */
    getBaseCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const sku_prices = this.getSkuCost(sku)
        const units = this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }
    getIncludedCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.cluster.cpu_core_count * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }
    getByolCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.cluster.cpu_core_count * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }
    getDatabaseServerCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const sku_prices = this.getSkuCost(sku)
        const units = (+resource.compute_count - shape.minimum_node_count) * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }
    getStorageServerCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const sku_prices = this.getSkuCost(sku)
        const units = (+resource.storage_count - 3) * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM functions
    */
    getBaseBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1
        bom_entry.price_per_month = this.getBaseCost(sku, resource)
        return bom_entry
    }
    getIncludedBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = +resource.cluster.cpu_core_count
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1
        bom_entry.price_per_month = this.getIncludedCost(sku, resource)
        return bom_entry
    }
    getByolBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = +resource.cluster.cpu_core_count
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1
        bom_entry.price_per_month = this.getByolCost(sku, resource)
        return bom_entry
    }
    getDatabaseBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = +resource.compute_count - shape.minimum_node_count
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1
        bom_entry.price_per_month = this.getDatabaseServerCost(sku, resource)
        return bom_entry
    }
    getStorageBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = +resource.storage_count - 3
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1
        bom_entry.price_per_month = this.getStorageServerCost(sku, resource)
        return bom_entry
    }

    /*
    ** Shape information
    */
    getShapeDetails = (shape) => okitOciData.getDBSystemShape(shape)
}

OkitOciProductPricing.prototype.getExadataCloudInfrastructurePrice = function(resource) {
    const pricing_resource = new ExadataCloudInfrastructureOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getExadataCloudInfrastructureBoM = function(resource) {
    const pricing_resource = new ExadataCloudInfrastructureOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
