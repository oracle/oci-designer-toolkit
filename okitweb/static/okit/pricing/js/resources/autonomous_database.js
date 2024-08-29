/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded AutonomousDatabase Pricing Javascript');

/*
** Define AutonomousDatabase Pricing Class
 */
class AutonomousDatabaseOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.autonomous_database
        let price_per_month = resource.license_model === 'BRING_YOUR_OWN_LICENSE' ? this.getOcpuCost(skus.ocpu.byol) : this.getOcpuCost(skus.ocpu.included)
        price_per_month += this.getStorageCost(skus.storage)
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.autonomous_database
        let bom = {
            skus: [this.getStorageBoMEntry(skus.storage)], 
            price_per_month: this.getPrice(resource)
        }
        bom.skus.push(resource.license_model === 'BRING_YOUR_OWN_LICENSE' ? this.getOcpuBoMEntry(skus.ocpu.byol) : this.getOcpuBoMEntry(skus.ocpu.included))
        return bom
    }

    /*
    ** Pricing Functions
    */
    getOcpuCost(sku, resource) {
        resource = resource ? resource : this.resource
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.cpu_core_count * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getStorageCost(sku, resource) {
        resource = resource ? resource : this.resource
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.data_storage_size_in_tbs
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM functions
    */
    getOcpuBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = +resource.cpu_core_count // OCPUs
        bom_entry.price_per_month = this.getOcpuCost(sku, resource)
        return bom_entry
    }

    getStorageBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.data_storage_size_in_tbs // Storage in TBs
        bom_entry.price_per_month = this.getStorageCost(sku, resource)
        return bom_entry
    }
}

OkitOciProductPricing.prototype.getAutonomousDatabasePrice = function(resource) {
    const pricing_resource = new AutonomousDatabaseOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getAutonomousDatabaseBoM = function(resource) {
    const pricing_resource = new AutonomousDatabaseOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
