/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded MysqlDatabaseSystem Pricing Javascript');

/*
** Define MysqlDatabaseSystem Pricing Class
 */
class MysqlDatabaseSystemOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.mysql_database_system.shape[resource.shape_name]
        let price_per_month = 0
        if (skus) {
            price_per_month += skus.ocpu  ? this.getOcpuCost(skus.ocpu, resource) : 0
            price_per_month += skus.memory  ? this.getMemoryCost(skus.memory, resource) : 0
            price_per_month += skus.database  ? this.getHeatwaveDatabaseCost(skus.database, resource) : 0
            price_per_month += skus.node  ? this.getHeatwaveNodeCost(skus.node, resource) : 0
            price_per_month += skus.storage  ? this.getStorageCost(skus.storage, resource) : 0
            // price_per_month += skus.backup  ? this.getBackupCost(skus.backup, resource) : 0
        }
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.mysql_database_system.shape[resource.shape_name]
        let bom = {skus: [], price_per_month: this.getPrice(resource)}
        if (skus) {
            if (skus.ocpu) {bom.skus.push(this.getOcpuBoMEntry(skus.ocpu, resource))}
            if (skus.memory) {bom.skus.push(this.getMemoryBoMEntry(skus.memory, resource))}
            if (skus.database) {bom.skus.push(this.getHeatwaveDatabaseBoMEntry(skus.database, resource))}
            if (skus.node) {bom.skus.push(this.getHeatwaveNodeBoMEntry(skus.node, resource))}
            if (skus.storage) {bom.skus.push(this.getStorageBoMEntry(skus.storage, resource))}
            // if (skus.backup) {bom.skus.push(this.getBackupBoMEntry(skus.storage, backup))}
        }
        return bom
    }

    /*
    ** Pricing Functions
    */
    getOcpuCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape_name)
        const sku_prices = this.getSkuCost(sku)
        const units = +shape.cpu_core_count * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getMemoryCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape_name)
        const sku_prices = this.getSkuCost(sku)
        const units = +shape.memory_size_in_gbs * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getStorageCost(sku, resource) {
        resource = resource ? resource : this.resource
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.data_storage_size_in_gb
        return this.getMonthlyCost(sku_prices, units)
    }

    getBackupCost(sku, resource) {
        resource = resource ? resource : this.resource
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.backup_data_storage_size_in_gb
        return this.getMonthlyCost(sku_prices, units)
    }

    getHeatwaveDatabaseCost(sku, resource) {
        resource = resource ? resource : this.resource
        const sku_prices = this.getSkuCost(sku)
        const units = +this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getHeatwaveNodeCost(sku, resource) {
        resource = resource ? resource : this.resource
        const sku_prices = this.getSkuCost(sku)
        const units = +resource.heatwave_cluster.cluster_size * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM functions
    */
    getOcpuBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.mysql_database_system.shape[resource.shape_name].ocpu
        const shape = this.getShapeDetails(resource.shape_name)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = +shape.cpu_core_count // OCPUs
        bom_entry.price_per_month = this.getOcpuCost(sku, resource)
        return bom_entry
    }

    getMemoryBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.mysql_database_system.shape[resource.shape_name].memory
        const shape = this.getShapeDetails(resource.shape_name)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/ Month
        bom_entry.units = +shape.memory_size_in_gbs // Memory in Gbs
        bom_entry.price_per_month = this.getMemoryCost(sku, resource)
        return bom_entry
    }

    getStorageBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.mysql_database_system.shape[resource.shape_name].storage
        const shape = this.getShapeDetails(resource.shape_name)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.data_storage_size_in_gb // Storage in Gbs
        bom_entry.price_per_month = this.getStorageCost(sku, resource)
        return bom_entry
    }

    getBackupBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.mysql_database_system.shape[resource.shape_name].backup
        const shape = this.getShapeDetails(resource.shape_name)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = 1
        bom_entry.units = +resource.backup_data_storage_size_in_gb // Storage in Gbs
        bom_entry.price_per_month = this.getBackupCost(sku, resource)
        return bom_entry
    }

    getHeatwaveDatabaseBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.mysql_database_system.shape[resource.shape_name].database
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1
        bom_entry.price_per_month = this.getHeatwaveDatabaseCost(sku, resource)
        return bom_entry
    }

    getHeatwaveNodeBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.mysql_database_system.shape[resource.shape_name].node
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = +resource.heatwave_cluster.cluster_size
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1
        bom_entry.price_per_month = this.getHeatwaveNodeCost(sku, resource)
        return bom_entry
    }

   /*
    ** Shape information
    */
    getShapeDetails = (shape) => okitOciData.getMySQLShape(shape)
}

OkitOciProductPricing.prototype.getMysqlDatabaseSystemPrice = function(resource) {
    const pricing_resource = new MysqlDatabaseSystemOciPricing(resource, this)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getMysqlDatabaseSystemBoM = function(resource) {
    const pricing_resource = new MysqlDatabaseSystemOciPricing(resource, this)
    return pricing_resource.getBoM(resource)
}
