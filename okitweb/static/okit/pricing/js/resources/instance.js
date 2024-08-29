/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Instance Pricing Javascript');

/*
** Define Instance Pricing Class
 */
class InstanceOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
        this.balanced_performance = 10
    }

    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.instance.shape[resource.shape]
        let price_per_month = 0
        if (skus) {
            price_per_month += skus.gpu  ? this.getGpuCost(skus.gpu, resource) : 0
            price_per_month += skus.ocpu  ? this.getOcpuCost(skus.ocpu, resource) : 0
            price_per_month += skus.memory  ? this.getMemoryCost(skus.memory, resource) : 0
            price_per_month += skus.disk  ? this.getDiskCost(skus.disk, resource) : this.getBootVolumeCost(resource)
            price_per_month += resource.source_details.os.toLowerCase() === 'windows' ? this.getOsCost(resource) : 0
        }
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        resource = resource ? resource : this.resource
        console.debug('Instance BoM: Resource', resource)
        const skus = this.sku_map.instance.shape[resource.shape]
        console.debug('Instance BoM: Skus', skus)
        let bom = {
            skus: [], 
            price_per_month: this.getPrice(resource)
        }
        if (skus) {
            if (skus.gpu) {bom.skus.push(this.getGpuBoMEntry(skus.ocpu, resource))}
            if (skus.ocpu) {bom.skus.push(this.getOcpuBoMEntry(skus.ocpu, resource))}
            if (skus.memory) {bom.skus.push(this.getMemoryBoMEntry(skus.memory, resource))}
            if (skus.disk) {bom.skus.push(this.getDiskBoMEntry(skus.disk, resource))} else {bom.skus= [...bom.skus, ...this.getBootVolumeBoMEntry(resource)]}
            if (resource.source_details.os.toLowerCase() === 'windows') {bom.skus.push(this.getOsBoMEntry(resource))}
        }
        return bom
    }

    /*
    ** Pricing Functions
    */
    getGpuCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        const sku_prices = this.getSkuCost(sku)
        const units = shape.gpus * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getOcpuCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        // const list_price = this.getSkuCost(sku)
        // const price_per_month = list_price * +resource.shape_config.ocpus * this.monthly_utilization
        // return price_per_month
        const sku_prices = this.getSkuCost(sku)
        // const units = +resource.shape_config.ocpus * this.monthly_utilization
        const units = (shape.is_flexible ? +resource.shape_config.ocpus : shape.ocpus) * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getMemoryCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        // const list_price = this.getSkuCost(sku)
        // const price_per_month = list_price * +resource.shape_config.memory_in_gbs * this.monthly_utilization
        // return price_per_month
        const sku_prices = this.getSkuCost(sku)
        // const units = +resource.shape_config.memory_in_gbs * this.monthly_utilization
        const units = (shape.is_flexible ? +resource.shape_config.memory_in_gbs : shape.memory_in_gbs) * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getDiskCost(sku, resource) {
        resource = resource ? resource : this.resource
        const shape = this.getShapeDetails(resource.shape)
        // const list_price = this.getSkuCost(sku)
        // const price_per_month = list_price * +shape.local_disks_total_size_in_gbs * this.monthly_utilization
        // return price_per_month
        const sku_prices = this.getSkuCost(sku)
        const units = +shape.local_disks_total_size_in_gbs * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    getBootVolumeCost(resource) {
        resource = resource ? resource : this.resource
        const bsv = new BlockStorageVolume({size_in_gbs: +resource.source_details.boot_volume_size_in_gbs, vpus_per_gb: this.balanced_performance}, new OkitJson())
        const bsv_pricing = new BlockStorageVolumeOciPricing(bsv, this.pricing)
        return bsv_pricing.getPrice(bsv)
    }

    getOsCost(resource) {
        const sku = this.sku_map.instance.os[resource.source_details.os.toLowerCase()]
        // const list_price = this.getSkuCost(sku)
        // const price_per_month = sku ? list_price * this.monthly_utilization * +resource.shape_config.ocpus : 0
        // return price_per_month
        const sku_prices = this.getSkuCost(sku)
        const units = this.monthly_utilization * +resource.shape_config.ocpus
        return sku ? this.getMonthlyCost(sku_prices, units) : 0
    }

    /*
    ** BoM functions
    */
    getGpuBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.instance.shape[resource.shape].gpu
        // console.debug('Instance BoM: Gpu Sku', sku)
        const shape = this.getShapeDetails(resource.shape)
        // console.debug('Instance BoM: Gpu Shape', shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        // bom_entry.units = +resource.shape_config.ocpus // OCPUs
        bom_entry.units = shape.gpus // OCPUs
        bom_entry.price_per_month = this.getGpuCost(sku, resource)
        // console.debug('Instance BoM: Gpu Entry', bom_entry)
        return bom_entry
    }

    getOcpuBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.instance.shape[resource.shape].ocpu
        // console.debug('Instance BoM: Sku', sku)
        const shape = this.getShapeDetails(resource.shape)
        // console.debug('Instance BoM: Shape', shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        // bom_entry.units = +resource.shape_config.ocpus // OCPUs
        bom_entry.units = shape.is_flexible ? +resource.shape_config.ocpus : shape.ocpus // OCPUs
        bom_entry.price_per_month = this.getOcpuCost(sku, resource)
        // console.debug('Instance BoM: Entry', bom_entry)
        return bom_entry
    }

    getMemoryBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.instance.shape[resource.shape].ocpu
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/ Month
        // bom_entry.units = +resource.shape_config.memory_in_gbs // Memory in Gbs
        bom_entry.units = shape.is_flexible ? +resource.shape_config.memory_in_gbs : shape.memory_in_gbs // Memory in Gbs
        bom_entry.price_per_month = this.getMemoryCost(sku, resource)
        return bom_entry
    }

    getDiskBoMEntry(sku, resource) {
        resource = resource ? resource : this.resource
        sku = sku ? sku : this.sku_map.instance.shape[resource.shape].ocpu
        const shape = this.getShapeDetails(resource.shape)
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/ Month
        bom_entry.units = +shape.local_disks_total_size_in_gbs/1000 // Disk in Tbs
        bom_entry.price_per_month = this.getDiskCost(sku, resource)
        return bom_entry
    }

    getBootVolumeBoMEntry(resource) {
        const bsv = new BlockStorageVolume({size_in_gbs: +resource.source_details.boot_volume_size_in_gbs, vpus_per_gb: this.balanced_performance}, new OkitJson())
        const bsv_pricing = new BlockStorageVolumeOciPricing(bsv, this.pricing)
        return bsv_pricing.getBoM(bsv).skus
    }

    getOsBoMEntry(resource) {
        const sku = this.sku_map.instance.os[resource.source_details.os.toLowerCase()]
        const bom_entry = this.newSkuEntry(sku)
        if (sku) {
            bom_entry.quantity = 1
            bom_entry.utilization = +this.monthly_utilization // Hrs/ Month
            bom_entry.units = +resource.shape_config.ocpus // OCPUs
            bom_entry.price_per_month = this.getOsCost(resource)
        }
        return bom_entry
    }

    /*
    ** Shape information
    */
    getShapeDetails = (shape) => okitOciData.getInstanceShape(shape) ? okitOciData.getInstanceShape(shape) : this.getEmptyShape()

    getEmptyShape = () => {return {is_flexible: false, ocpus: 0, memory_in_gbs: 0, local_disks_total_size_in_gbs: 0}}
}

OkitOciProductPricing.prototype.getInstancePrice = function(resource, pricing) {
    pricing = pricing ? pricing : this
    const pricing_resource = new InstanceOciPricing(resource, pricing)
    return pricing_resource.getPrice(resource)
}

OkitOciProductPricing.prototype.getInstanceBoM = function(resource, pricing) {
    pricing = pricing ? pricing : this
    const pricing_resource = new InstanceOciPricing(resource, pricing)
    return pricing_resource.getBoM(resource)
}

