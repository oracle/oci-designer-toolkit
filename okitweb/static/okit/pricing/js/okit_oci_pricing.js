/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT OCI Pricing Javascript');

class OkitOciProductPricing {
    constructor() {
        this.load()
    }

    getSkuDisplayName = (sku) => this.products.filter((p) => p.partNumber === sku).reduce((a, p) => p.displayName.split(' - ').slice(1, -1).join(' - '), '')
    getSkuMetricDisplayName = (sku) => this.products.filter((p) => p.partNumber === sku).reduce((a, p) => p.metricDisplayName, '')

    load() {
        const products = $.getJSON('pricing/products', {cache: false})
        const prices = $.getJSON('pricing/prices', {cache: false})
        const sku_map = $.getJSON('pricing/sku_map', {cache: false})
        Promise.all([products, prices, sku_map]).then(results => {
            this.products = results[0]
            this.prices = results[1]
            this.sku_map = results[2]
            this.productsToCategories(results[0])
            console.info(this)
        })
    }

    productsToCategories(products) {
        this.categories = {}
        this.sku_map = {}
        this.name_map = {}
        if (products.items) {
            products.items.forEach((item) => {
                this.sku_map[item.partNumber] = item.displayName
                this.name_map[item.displayName] = item.partNumber
                if (!this.categories[item.serviceCategoryDisplayName]) this.categories[item.serviceCategoryDisplayName] = {sku_map: {}, name_map: {}}
                this.categories[item.serviceCategoryDisplayName].sku_map[item.partNumber] = item.shortDisplayName
                this.categories[item.serviceCategoryDisplayName].name_map[item.shortDisplayName] = item.partNumber
            })
        }
    }

    generateBoM(model) {
        let bom = {}
        if (model) {
            Object.entries(model).filter(([k, v]) => Array.isArray(v)).forEach(([resource_name, resource_list]) => resource_list.forEach((resource) => {
                console.info('Processing Resource', resource_name)
                // Get Skus
                const get_sku_function = `get${titleCase(resource_name.replaceAll('_', ' ')).replaceAll(' ', '').slice(0, -1)}Skus`
                console.info('Get Sku Function:', get_sku_function)
                if (this[get_sku_function]) {
                    const sku = this[get_sku_function](resource)
                } else {
                    console.info(`>> Unable to get SKU for ${titleCase(resource_name.replaceAll('_', ' ')).slice(0, -1)} - ${resource.display_name}`)
                }
            }))
        }
    }

    getSkuCost(sku, model="PAY_AS_YOU_GO", currency=undefined) {
        part_data = this.prices.items[sku][currency ? currency : 'USD']
    }

    getInstanceSkus(resource) {
        const shape = resource.shape
        const shape_parts = shape.split('.')
        const parts_map = {
            'VM': 'Virtual Machine',
            'BM': 'Bare Metal',
            'Standard1': 'Standard - X5',
            'Standard2': 'Standard - X7',
            'DenseIO1': 'Dense I/O',
            'DenseIO2': 'Dense I/O',
        }
        const name_map = {...this.name_map["Compute"], ...this.name_map["Compute Bare Metal"]}
        const type_str = parts_map[shape_parts[0]]
        const skus = [
            this.sku_map.instance[resource.shape], // Standard Shape based SKU
            'B91962' // Boot Volume SKU
        ]
        if (this.sku_map.os[resource.source_details.os.toLowerCase()]) skus.push(this.sku_map.os[resource.source_details.os.toLowerCase()])
        return skus
    }
}