/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded NosqlDatabase Pricing Javascript');

/*
** Define NosqlDatabase Pricing Class
 */
class NosqlDatabaseOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.nosql_database
        let price_per_month = this.getStorageCost(skus.storage, resource)
        price_per_month += resource.table_limits.capacity_mode === 'ON_DEMAND' ? this.getOnDemandReadCost(skus.ondemand.read, resource) : this.getProvisionedReadCost(skus.provisioned.read, resource) 
        price_per_month += resource.table_limits.capacity_mode === 'ON_DEMAND' ? this.getOnDemandWriteCost(skus.ondemand.write, resource) : this.getProvisionedWriteCost(skus.provisioned.write, resource) 
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.nosql_database
        let bom = {skus: [this.getStorageBoM(skus.storage, resource)], price_per_month: this.getPrice(resource)}
        if (resource.table_limits.capacity_mode === 'ON_DEMAND') {
            bom.skus.push(this.getOnDemandReadBoM(skus.ondemand.read, resource))
            bom.skus.push(this.getOnDemandWriteBoM(skus.ondemand.write, resource))
        } else {
            bom.skus.push(this.getProvisionedReadBoM(skus.provisioned.read, resource))
            bom.skus.push(this.getProvisionedWriteBoM(skus.provisioned.write, resource))
        }
        return bom
    }

    /*
    ** Pricing Functions
    */
    getStorageCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.table_limits.max_storage_in_gbs
        return this.getMonthlyCost(sku_prices, units)
    }

    getProvisionedReadCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.table_limits.max_read_units
        return this.getMonthlyCost(sku_prices, units)
    }

    getProvisionedWriteCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.table_limits.max_write_units
        return this.getMonthlyCost(sku_prices, units)
    }

    getOnDemandReadCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.pricing_estimates.estimated_on_demand_reads_per_month
        return this.getMonthlyCost(sku_prices, units)
    }

    getOnDemandWriteCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.pricing_estimates.estimated_on_demand_writes_per_month
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM functions
    */
    getStorageBoM(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.table_limits.max_storage_in_gbs
        bom_entry.price_per_month = this.getStorageCost(sku, resource)
        return bom_entry
    }

    getProvisionedReadBoM(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.table_limits.max_read_units
        bom_entry.price_per_month = this.getProvisionedReadCost(sku, resource)
        return bom_entry
    }

    getProvisionedWriteBoM(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.table_limits.max_write_units
        bom_entry.price_per_month = this.getProvisionedWriteCost(sku, resource)
        return bom_entry
    }

    getOnDemandReadBoM(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.pricing_estimates.estimated_on_demand_reads_per_month
        bom_entry.price_per_month = this.getOnDemandReadCost(sku, resource)
        return bom_entry
    }

    getOnDemandWriteBoM(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.pricing_estimates.estimated_on_demand_writes_per_month
        bom_entry.price_per_month = this.getOnDemandWriteCost(sku, resource)
        return bom_entry
    }
}

OkitOciProductPricing.prototype.getNosqlDatabasePrice = function(resource) {
    const pricing_resource = new NosqlDatabaseOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getNosqlDatabaseBoM = function(resource) {
    const pricing_resource = new NosqlDatabaseOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
