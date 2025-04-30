/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OkeCluster Pricing Javascript');

/*
** Define OkeCluster Pricing Class
 */
class OkeClusterOciPricing extends OkitOciPricingResource {
    constructor(resource, pricing) {
        super(resource, pricing)
        this.monthly_utilization = 744
    }
    
    getPrice(resource) {
        resource = resource ? resource : this.resource
        const skus = this.sku_map.oke_cluster
        let price_per_month = this.getTypeCost(skus.type[resource.type], resource)
        if (resource.node_pool_type === 'Virtual') price_per_month += this.getNodePoolTypeCost(skus.virtual_node, resource)
        console.info('Price', resource, price_per_month)
        return price_per_month
    }

    getBoM(resource) {
        const resource_name = resource.getArtifactReference()
        const skus = this.sku_map.oke_cluster
        const bom = {skus: [this.getTypeBoMEntry(skus.type[resource.type], resource)], price_per_month: this.getPrice(resource)}
        if (resource.node_pool_type === 'Virtual') bom.skus.push(this.getNodePoolTypeBoMEntry(skus.virtual_node, resource))
        return bom
    }

    /*
    ** Pricing Functions
    */
    getTypeCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const units = 1 * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }
    getNodePoolTypeCost(sku, resource) {
        const sku_prices = this.getSkuCost(sku)
        const node_pools = resource.getOkitJson().node_pools
        const nodes = node_pools ? node_pools.filter(np => np.cluster_id === resource.id).reduce((a, c) => a + c.node_config_details.size, 0) : 1
        const units = nodes * this.monthly_utilization
        return this.getMonthlyCost(sku_prices, units)
    }

    /*
    ** BoM Functions
    */
    getTypeBoMEntry(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = 1
        bom_entry.price_per_month = this.getTypeCost(sku, resource)
        return bom_entry
    }
    getNodePoolTypeBoMEntry(sku, resource) {
        const bom_entry = this.newSkuEntry(sku)
        const node_pools = resource.getOkitJson().node_pools
        const nodes = node_pools ? node_pools.filter(np => np.cluster_id === resource.id).reduce((a, c) => a + c.node_config_details.size, 0) : 1
        bom_entry.quantity = 1
        bom_entry.utilization = +this.monthly_utilization // Hrs/Month
        bom_entry.units = nodes
        bom_entry.price_per_month = this.getNodePoolTypeCost(sku, resource)
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
