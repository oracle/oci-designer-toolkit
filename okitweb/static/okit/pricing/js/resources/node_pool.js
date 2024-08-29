/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded NodePool Pricing Javascript');

/*
** Define NodePool Pricing Class
 */
class NodePoolOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
        this.balanced_performance = 10
    }

    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.instance.shape[resource.node_shape]
        let price_per_month = 0
        if (skus) {
            price_per_month += skus.ocpu  ? this.getOcpuCost(skus.ocpu, resource) : 0
            price_per_month += skus.memory  ? this.getMemoryCost(skus.memory, resource) : 0
            price_per_month += skus.disk  ? this.getDiskCost(skus.disk, resource) : this.getBootVolumeCost(resource)
        }
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.instance.shape[resource.node_shape]
        let bom = {
            skus: [], 
            price_per_month: this.getPrice(resource)
        }
        if (skus) {
            if (skus.ocpu) {bom.skus.push(this.getOcpuBoMEntry(skus.ocpu, resource))}
            if (skus.memory) {bom.skus.push(this.getMemoryBoMEntry(skus.memory, resource))}
            if (skus.disk) {bom.skus.push(this.getDiskBoMEntry(skus.disk, resource))} else {bom.skus = [...bom.skus, ...this.getBootVolumeBoMEntry(resource)]}
        }
        return bom
    }

    /*
    ** Pricing Functions
    */
    getOcpuCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.node_shape)
        const sku_prices = this.getSkuCost(sku)
        const quantity = resource.node_config_details.size
        const units = (shape.is_flexible ? +resource.node_shape_config.ocpus : shape.ocpus) * this.monthly_utilization * quantity
        return this.getMonthlyCost(sku_prices, units)
    }

    getMemoryCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.node_shape)
        const sku_prices = this.getSkuCost(sku)
        const quantity = resource.node_config_details.size
        const units = (shape.is_flexible ? +resource.node_shape_config.memory_in_gbs : shape.memory_in_gbs) * this.monthly_utilization * quantity
        return this.getMonthlyCost(sku_prices, units)
    }

    getDiskCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.node_shape)
        const sku_prices = this.getSkuCost(sku)
        const quantity = resource.node_config_details.size
        const units = +shape.local_disks_total_size_in_gbs * this.monthly_utilization * quantity
        return this.getMonthlyCost(sku_prices, units)
    }

    getBootVolumeCost(resource) {
        resource = resource ? resource : this.resource
        const quantity = resource.node_config_details.size
        const bsv = new BlockStorageVolume({size_in_gbs: +resource.node_source_details.boot_volume_size_in_gbs, vpus_per_gb: this.balanced_performance}, new OkitJson())
        const bsv_pricing = new BlockStorageVolumeOciPricing(bsv, this.pricing)
        return bsv_pricing.getPrice(bsv) * quantity
    }

    /*
    ** BoM functions
    */
    getOcpuBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.instance.shape[resource.node_shape].ocpu
        const shape = this.getShapeDetails(resource.node_shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = resource.node_config_details.size
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = shape.is_flexible ? +resource.node_shape_config.ocpus : shape.ocpus // OCPUs
        bom_entry.price_per_month = this.getOcpuCost(sku, resource)
        return bom_entry
    }

    getMemoryBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.instance.shape[resource.node_shape].ocpu
        const shape = this.getShapeDetails(resource.node_shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = resource.node_config_details.size
        bom_entry.utilization = +this.monthly_utilization // Hrs/ Month
        bom_entry.units = shape.is_flexible ? +resource.node_shape_config.memory_in_gbs : shape.memory_in_gbs // Memory in Gbs
        bom_entry.price_per_month = this.getMemoryCost(sku, resource)
        return bom_entry
    }

    getDiskBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.instance.shape[resource.node_shape].ocpu
        const shape = this.getShapeDetails(resource.node_shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = resource.node_config_details.size
        bom_entry.utilization = +this.monthly_utilization // Hrs/ Month
        bom_entry.units = +shape.local_disks_total_size_in_gbs/1000 // Disk in Tbs
        bom_entry.price_per_month = this.getDiskCost(sku, resource)
        return bom_entry
    }

    getBootVolumeBoMEntry(resource) {
        const quantity = resource.node_config_details.size
        const bsv = new BlockStorageVolume({size_in_gbs: +resource.node_source_details.boot_volume_size_in_gbs, vpus_per_gb: this.balanced_performance}, new OkitJson())
        const bsv_pricing = new BlockStorageVolumeOciPricing(bsv, this.pricing)
        const skus = bsv_pricing.getBoM(bsv).skus
        console.info('Skus', skus)
        skus.forEach(s => s.quantity = quantity)
        skus.forEach(s => s.price_per_month *= quantity)
        console.info('Skus', skus)
        return skus
    }

    /*
    ** Shape information
    */
    getShapeDetails = (shape) => okitOciData.getInstanceShape(shape)
}

OkitOciProductPricing.prototype.getNodePoolPrice = function(resource, pricing) {
    pricing = pricing ? pricing : this
    const pricing_resource = new NodePoolOciPricing(resource, pricing)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getNodePoolBoM = function(resource, pricing) {
    pricing = pricing ? pricing : this
    const pricing_resource = new NodePoolOciPricing(resource, pricing)
    return pricing_resource.getBoM(resource)
}

