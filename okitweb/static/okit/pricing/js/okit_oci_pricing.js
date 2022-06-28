/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT OCI Pricing Javascript');

class OkitOciProductPricing {
    constructor() {
        this.currency = 'USD'
        this.bom = {}
        this.cost_estimate = {}
        this.load()
    }
    oci_products_url = 'https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/'

    getSkuDisplayName= (sku) => this.products.filter((p) => p.partNumber === sku).reduce((a, p) => p.displayName.split(' - ').slice(1, -1).join(' - '), '')
    getSkuMetricDisplayName = (sku) => this.products.filter((p) => p.partNumber === sku).reduce((a, p) => p.metricDisplayName, '')

    load(model) {
        console.info('>>>>>> Loading Price <<<<<<<')
        const oci_products = $.getJSON(this.oci_products_url, {cache: false})
        const products = $.getJSON('pricing/products', {cache: false})
        // const prices = $.getJSON('pricing/prices', {cache: false})
        const sku_map = $.getJSON('pricing/sku_map', {cache: false})
        Promise.allSettled([oci_products, products, sku_map]).then(results => {
            this.products = results[0].status === 'fulfilled' ? results[0].value : results[1].value
            this.sku_map = results[2].value
            // this.productsToCategories(this.products)
            console.debug(this)
        })

        // $.getJSON(this.oci_products_url, {cache: false}).done((results) => console.info('>>>>>> Product Pricing:', results)).fail((xhr, status, error) => {ajaxCallFailed(xhr, status, error)})
    }

    productsToCategories(products) {
        this.categories = {}
        this.sku2name = {}
        this.name2sku = {}
        if (products.items) {
            products.items.forEach((item) => {
                this.sku2name[item.partNumber] = item.displayName
                this.name2sku[item.displayName] = item.partNumber
                if (!this.categories[item.serviceCategoryDisplayName]) this.categories[item.serviceCategoryDisplayName] = {sku2name: {}, name2sku: {}}
                this.categories[item.serviceCategoryDisplayName].sku2name[item.partNumber] = item.shortDisplayName
                this.categories[item.serviceCategoryDisplayName].name2sku[item.shortDisplayName] = item.partNumber
            })
        }
    }

    generateBoM(model, currency='USD') {
        this.currency = currency
        this.bom = {}
        this.cost_estimate = {}
        if (model && this.sku_map) {
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
        console.debug('BoM:', this.bom)
        return {bom: this.bom, estimate: this.cost_estimate}
    }

    newBoMSkuEntry(sku) {
        const products = this.products.items.filter((p) => p.partNumber === sku)
        console.info(`Products for ${sku}`, products)
        const bom_entry = {
            // 'description': products.length > 0 ? products[0].displayName.replace(`${sku} - `, '') : '',
            'description': products.length > 0 ? products[0].displayName : '',
            'metric': products.length > 0 ? products[0].metricName : '',
            'quantity': 0,
            'utilization': 0,
            'units': 0,
            'list_price': this.getSkuCost(sku),
            'price_per_month': 0
        }
        console.info('BoM Entry', bom_entry)
        return bom_entry
    }

    // newBoMSkuEntry(sku) {
    //     const products = this.products.items.filter((p) => p.partNumber === sku)
    //     console.info(`Products for ${sku}`, products)
    //     const bom_entry = {
    //         // 'description': products.length > 0 ? products[0].displayName.replace(`${sku} - `, '') : '',
    //         'description': products.length > 0 ? `${products[0].serviceCategoryDisplayName} - ${products[0].shortDisplayName}` : '',
    //         'metric': products.length > 0 ? products[0].metricDisplayName : '',
    //         'quantity': 0,
    //         'utilization': 0,
    //         'units': 0,
    //         'list_price': this.getSkuCost(sku),
    //         'price_per_month': 0
    //     }
    //     console.info('BoM Entry', bom_entry)
    //     return bom_entry
    // }

    getBoMSkuEntry(sku) {
        if (!this.bom[sku]) this.bom[sku] = this.newBoMSkuEntry(sku)
        return this.bom[sku]
    }

    updateCostEstimate(resource, price=0) {
        if (!this.cost_estimate[resource]) this.cost_estimate[resource] = 0
        this.cost_estimate[resource] += price
    }

    getSkuCost(sku, model="PAY_AS_YOU_GO", currency_code=undefined) {
        currency_code = currency_code ? currency_code : this.currency
        console.info('Sku:', sku, 'Model:', model, 'Currency:', currency_code)
        const price = this.products.items.filter(p => p.partNumber === sku)[0].currencyCodeLocalizations.filter(c => c.currencyCode === currency_code)[0].prices.filter(p => p.model === model)[0].value
        // const items = this.products.items.filter(p => p.partNumber === sku)
        // console.info('>>> Item', items)
        // const currencies = items[0].currencyCodeLocalizations.filter(c => c.currencyCode === currency_code)
        // console.info('>>> Currency', currencies)
        // const prices = currencies[0].prices.filter(p => p.model === model)
        // console.info('>>> Price', prices)
        // const price = prices[0].value
        return price
    }

    // getSkuCostPriceFile(sku, model="PAY_AS_YOU_GO", currency) {
    //     const price = this.prices.items[sku][currency ? currency : this.currency]
    //     return price
    // }

    getBlockStorageVolumeSkus(resource) {
        const resource_name = resource.getArtifactReference()
        const boot_vol_perf_sku = 'B91962' // Performance
        const boot_vol_cap_sku = 'B91961' // Capacity
        const boot_vol_perf_entry = this.getBoMSkuEntry(boot_vol_perf_sku)
        const boot_vol_cap_entry = this.getBoMSkuEntry(boot_vol_cap_sku)
        const skus = [boot_vol_perf_sku, boot_vol_cap_sku]
        let price_per_month = 0
        // Process Boot Volume Performance Information
        price_per_month = boot_vol_perf_entry.list_price * +resource.vpus_per_gb * +resource.size_in_gbs
        this.updateCostEstimate(resource_name, price_per_month)
        boot_vol_perf_entry.quantity += 1
        boot_vol_perf_entry.utilization += +resource.vpus_per_gb // VPUS / GB
        boot_vol_perf_entry.units += +resource.size_in_gbs // Convert to Number
        boot_vol_perf_entry.price_per_month += price_per_month
        // Process Boot Volume Capacity Information
        price_per_month = boot_vol_perf_entry.list_price * +resource.size_in_gbs
        this.updateCostEstimate(resource_name, price_per_month)
        boot_vol_cap_entry.quantity += 1
        boot_vol_cap_entry.utilization = 1
        boot_vol_cap_entry.units += +resource.size_in_gbs // Convert to Number
        boot_vol_cap_entry.price_per_month += price_per_month
        return skus
    }

    getInstanceSkus(resource) {
        const resource_name = resource.getArtifactReference()
        const shape_sku = this.sku_map.instance.shape[resource.shape]
        const boot_vol_perf_sku = 'B91962' // Performance
        const boot_vol_cap_sku = 'B91961' // Capacity
        const os_sku = this.sku_map.os[resource.source_details.os.toLowerCase()]
        const skus = [shape_sku, boot_vol_perf_sku, boot_vol_cap_sku]
        const shape_entry = this.getBoMSkuEntry(shape_sku)
        const boot_vol_perf_entry = this.getBoMSkuEntry(boot_vol_perf_sku)
        const boot_vol_cap_entry = this.getBoMSkuEntry(boot_vol_cap_sku)
        const monthly_utilization = 744
        let price_per_month = 0
        // Process Shape Information
        price_per_month = shape_entry.list_price * +resource.shape_config.ocpus * monthly_utilization
        this.updateCostEstimate(resource_name, price_per_month)
        shape_entry.quantity += 1
        shape_entry.utilization = monthly_utilization // Hrs/ Month
        shape_entry.units += resource.shape_config.ocpus // OCPUs
        shape_entry.price_per_month += price_per_month
        // Process Boot Volume Performance Information
        price_per_month = boot_vol_perf_entry.list_price * +resource.source_details.boot_volume_size_in_gbs * 10
        this.updateCostEstimate(resource_name, price_per_month)
        boot_vol_perf_entry.quantity += 1
        boot_vol_perf_entry.utilization += 10 // VPUS / GB
        boot_vol_perf_entry.units += +resource.source_details.boot_volume_size_in_gbs // Convert to Number
        boot_vol_perf_entry.price_per_month += price_per_month
        // Process Boot Volume Capacity Information
        price_per_month = boot_vol_cap_entry.list_price * +resource.source_details.boot_volume_size_in_gbs
        this.updateCostEstimate(resource_name, price_per_month)
        boot_vol_cap_entry.quantity += 1
        boot_vol_cap_entry.utilization = 1
        boot_vol_cap_entry.units += +resource.source_details.boot_volume_size_in_gbs // Convert to Number
        boot_vol_cap_entry.price_per_month += price_per_month
        if (os_sku) {
            skus.push(os_sku)
            const os_entry = this.getBoMSkuEntry(os_sku)
            price_per_month = os_entry.list_price * monthly_utilization
            this.updateCostEstimate(resource_name, price_per_month)
            os_entry.quantity += 1
            os_entry.utilization = monthly_utilization // Hrs/ Month
            os_entry.units += 1
            os_entry.price_per_month += price_per_month
        }
        return skus
    }

    // TODO: Delete
    getInstanceSkusDeprecated(resource) {
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
        const name2sku = {...this.name2sku["Compute"], ...this.name2sku["Compute Bare Metal"]}
        const type_str = parts_map[shape_parts[0]]
        const skus = [
            this.sku_map.instance.shape[resource.shape], // Standard Shape based SKU
            'B91962' // Boot Volume SKU
        ]
        if (this.sku_map.os[resource.source_details.os.toLowerCase()]) skus.push(this.sku_map.os[resource.source_details.os.toLowerCase()])
        this.getBoMSkuEntry(this.sku_map.instance.shape[resource.shape])
        return skus
    }
}

let okitOciProductPricing = null
