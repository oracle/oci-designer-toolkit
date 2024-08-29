/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT OCI Pricing Javascript');

class OkitOciProductPricing {
    static currencies = {
        GBP: {name: 'British Pound', symbol: '£', locale: 'en-GB'},
        USD: {name: 'US Dollar', symbol: '$', locale: 'en-US'},
        EUR: {name: 'Euro', symbol: '€', locale: ''},
        AUD: {name: 'Australian Dollar', symbol: 'A$', locale: ''},
        CAD: {name: 'Canadian Dollar', symbol: 'CA$', locale: ''},
        NZD: {name: 'New Zealand Dollar', symbol: 'NZ$', locale: ''},
        SEK: {name: 'Swedish Krona', symbol: 'SEK ', locale: ''},
        NOK: {name: 'Norwegian Krone', symbol: 'NOK ', locale: ''},
        AED: {name: 'UAE Dirham', symbol: 'AED', locale: ''},
        ARS: {name: 'Argentine Peso', symbol: 'ARS', locale: ''},
        BDT: {name: 'Bangladeshi Taka', symbol: 'BDT', locale: ''},
        BGN: {name: 'Bulgarian Lev', symbol: 'BGN', locale: ''},
        BHD: {name: 'Bahraini Dinar', symbol: 'BHD', locale: ''},
        BRL: {name: 'Brazilian Real', symbol: 'BRL', locale: ''},
        CHF: {name: 'Swiss Franc', symbol: 'CHF', locale: ''},
        CLP: {name: 'Chilean Peso', symbol: 'CLP', locale: ''},
        CNY: {name: 'Chinese Yuan', symbol: 'CNY', locale: ''},
        COP: {name: 'Colombian Peso', symbol: 'COP', locale: ''},
        CRC: {name: 'Costa Rican Colón', symbol: 'CRC', locale: ''},
        CZK: {name: 'Česká Koruna', symbol: 'CZK', locale: ''},
        DKK: {name: 'Danish Krone', symbol: 'DKK', locale: ''},
        EGP: {name: 'Egyptian Pound', symbol: 'EGP', locale: ''},
        HKD: {name: 'Hong Kong Dollar', symbol: 'HKD', locale: ''},
        HRK: {name: 'Croatian Kuna', symbol: 'HRK', locale: ''},
        HUF: {name: 'Hungarian Forint', symbol: 'HUF', locale: ''},
        IDR: {name: 'Indonesian Rupiah', symbol: 'IDR', locale: ''},
        ILS: {name: 'Israeli New Shekel', symbol: 'ILS', locale: ''},
        INR: {name: 'Indian Rupee', symbol: 'INR', locale: ''},
        ISK: {name: 'Icelandic Króna', symbol: 'ISK', locale: ''},
        JPY: {name: 'Japanese Yen', symbol: 'JPY', locale: ''},
        KRW: {name: 'South Korean Won', symbol: 'KRW', locale: ''},
        KWD: {name: 'Kuwaiti Dinar', symbol: 'KWD', locale: ''},
        MXN: {name: 'Mexican Peso', symbol: 'MXN', locale: ''},
        MYR: {name: 'Malaysian Ringgit', symbol: 'MYR', locale: ''},
        PEN: {name: 'Peruvian Sol', symbol: 'PEN', locale: ''},
        PHP: {name: 'Philippine Peso', symbol: 'PHP', locale: ''},
        PKR: {name: 'Pakistani Rupee', symbol: 'PKR', locale: ''},
        PLN: {name: 'Polish Zloty', symbol: 'PLN ', locale: ''},
        QAR: {name: 'Qatari Rial', symbol: 'QAR', locale: ''},
        RON: {name: 'Romanian Leu', symbol: 'RON', locale: ''},
        RSD: {name: 'Serbian Dinar', symbol: 'RSD', locale: ''},
        RUB: {name: 'Russian Ruble', symbol: 'RUB', locale: ''},
        SAR: {name: 'Saudi Riyal', symbol: 'SAR', locale: ''},
        SGD: {name: 'Singapore Dollar', symbol: 'SGD', locale: ''},
        TRY: {name: 'Turkish Lira', symbol: 'TRY', locale: ''},
        TWD: {name: 'New Taiwan Dollar', symbol: 'TWD', locale: ''},
        VND: {name: 'Vietnamese Dong', symbol: 'VND', locale: ''},
        ZAR: {name: 'South African Rand', symbol: 'ZAR', locale: ''},
    }
    // static formatPrice = (price=0, currency='GBP') => `${OkitOciProductPricing.currencies[currency].symbol} ${(Math.round((price + Number.EPSILON) * 100)/100).toFixed(2)}`
    static formatPrice = (price=0, currency='GBP') => `${(Math.round((price + Number.EPSILON) * 100)/100).toLocaleString('en-GB', {style: 'currency', currency: currency, currencyDisplay: 'symbol'})}`
    static getBoMFunctionName = (base_name) => `get${base_name}BoM`
    static getPriceFunctionName = (base_name) => `get${base_name}Price`

    constructor() {
        this.currency = 'GBP'
        this.bom = {}
        this.cost_estimate = {}
        this.sku_map = {instance: {shape: {}}, os: {}}
        this.load()
    }
    oci_products_url = 'https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/'

    getSkuDisplayName = (sku) => this.products.filter((p) => p.partNumber === sku).reduce((a, p) => p.displayName.split(' - ').slice(1, -1).join(' - '), '')
    getSkuMetricDisplayName = (sku) => this.products.filter((p) => p.partNumber === sku).reduce((a, p) => p.metricDisplayName, '')

    load(model) {
        console.info('>>>>>> Loading Price <<<<<<<')
        const oci_products = $.getJSON(this.oci_products_url, {cache: false})
        const products = $.getJSON('pricing/products', {cache: false})
        const shapes = $.getJSON('pricing/shapes', {cache: false})
        // const prices = $.getJSON('pricing/prices', {cache: false})
        const sku_map = $.getJSON('pricing/sku_map', {cache: false})
        Promise.allSettled([oci_products, products, sku_map, shapes]).then(results => {
            this.products = results[0].status === 'fulfilled' ? results[0].value : results[1].value
            this.sku_map = results[2].value
            // if (results[3].status === 'fulfilled'){
            //     let shape_sku_map = {}
            //     results[3].value.items.forEach((item) => {
            //         let shape_skus = {} 
            //         item.products.forEach((p) => shape_skus[p.type.value] = p.partNumber)
            //         shape_sku_map[item.name] = shape_skus
            //     })
            //     this.sku_map.instance.shape = shape_sku_map
            // }
            console.debug(this)
        })

        // $.getJSON(this.oci_products_url, {cache: false}).done((results) => console.info('>>>>>> Product Pricing:', results)).fail((xhr, status, error) => {ajaxCallFailed(xhr, status, error)})
    }

    generateBoM(model, currency='GBP') {
        this.currency = currency
        this.bom = {}
        this.cost_estimate = {}
        if (model.metadata.platform !== 'oci') return {bom: this.bom, estimate: this.cost_estimate}
        if (model && this.sku_map) {
            Object.entries(model).filter(([k, v]) => Array.isArray(v)).forEach(([resource_name, resource_list]) => resource_list.forEach((resource) => {
                // console.debug('Generate BoM: Processing Resource', resource_name)
                // Get Skus
                const get_sku_function = OkitOciProductPricing.getBoMFunctionName(titleCase(resource_name.replaceAll('_', ' ')).replaceAll(' ', '').slice(0, -1))
                // console.debug('Generate BoM: Get Sku Function:', get_sku_function)
                if (this[get_sku_function]) {
                    const bom_details = this[get_sku_function](resource, this)
                    // console.debug('Generate BoM: Details:', bom_details)
                    bom_details.skus.filter(sb => sb.sku && sb.sku !== '').forEach((sku_bom) => {
                        const bom_entry = this.getBoMSkuEntry(sku_bom.sku)
                        bom_entry.quantity += sku_bom.quantity
                        bom_entry.utilization += sku_bom.utilization
                        bom_entry.units += sku_bom.units
                        bom_entry.price_per_month += sku_bom.price_per_month
                    })
                    this.updateCostEstimate(resource.getArtifactReference(), bom_details.price_per_month)
                } else {
                    console.debug(`Generate BoM >> Unable to get SKU for ${titleCase(resource_name.replaceAll('_', ' ')).slice(0, -1)} - ${resource.display_name}`)
                }
            }))
        }
        console.debug('Generate BoM: BoM', this.bom)
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
            'list_price': this.getListPrice(sku),
            'price_per_month': 0
        }
        console.info('BoM Entry', bom_entry)
        return bom_entry
    }

    getListPrice(sku) {
        const sku_prices = this.getSkuCost(sku)
        let price_string = `${OkitOciProductPricing.currencies[this.currency].symbol}${sku_prices[0].value.toFixed(5)}`
        if (sku_prices && sku_prices.length === 1) price_string = `${OkitOciProductPricing.currencies[this.currency].symbol}${sku_prices[0].value.toFixed(5)}`
        else if (sku_prices && sku_prices.length > 1) price_string = sku_prices.sort((a, b) => a.rangeMin - b.rangeMin).map(p => `${p.rangeMin}-${p.rangeMax}: ${OkitOciProductPricing.currencies[this.currency].symbol}${p.value.toFixed(5)}`).join('\n')
        return price_string
    }

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
        try {
            return this.products.items.filter(p => p.partNumber === sku)[0].currencyCodeLocalizations.filter(c => c.currencyCode === currency_code)[0].prices.filter(p => p.model === model)
            // return this.products.items.filter(p => p.partNumber === sku)[0].currencyCodeLocalizations.filter(c => c.currencyCode === currency_code)[0].prices.filter(p => p.model === model)[0].value
        } catch (e) {
            console.debug(e)
            return [{model: model, value: 0}]
        }
    }

    getMonthlyCost(sku_prices, units) {
        let monthly_cost = 0
        if (sku_prices && sku_prices.length === 1) monthly_cost = sku_prices[0].value * units
        else if (sku_prices && sku_prices.length > 1) {
            sku_prices.sort((a, b) => a.rangeMin - b.rangeMin).forEach((p) => {
                const range = p.rangeMax - p.rangeMin
                if (range <= units) {
                    monthly_cost += p.value * range
                    units -= range
                } else if (units <= range) {
                    monthly_cost += p.value * units
                    units = 0
                }
            })
        }
        return monthly_cost
    }
}

class OkitOciPricingResource {
    constructor(resource, pricing) {
        this.resource = resource
        this.pricing = pricing
    }

    get sku_map() {return this.pricing.sku_map}

    newSkuEntry(sku='') {return {sku: sku, quantity:0, utilization: 0, units: 0, price_per_month: 0}}
    getPrice(resource) {return 0}
    getBoM(resource) {return {skus: [], price_per_month: this.getPrice(resource)}}
    updateCostEstimate = (resource, price=0) => this.pricing.updateCostEstimate(resource, price)
    getSkuCost = (sku, model="PAY_AS_YOU_GO", currency_code=undefined) => this.pricing.getSkuCost(sku, model, currency_code)
    getMonthlyCost = (sku_prices, units) => this.pricing.getMonthlyCost(sku_prices, units)
    // getMonthlyCost(sku_prices, units) {
    //     let monthly_cost = 0
    //     if (sku_prices && sku_prices.length === 1) monthly_cost = sku_prices[0].value * units
    //     else if (sku_prices && sku_prices.length > 1) {
    //         sku_prices.sort((a, b) => a.rangeMin - b.rangeMin).forEach((p) => {
    //             const range = p.rangeMax - p.rangeMin
    //             if (range <= units) {
    //                 monthly_cost += p.value * range
    //                 units -= range
    //             } else if (units <= range) {
    //                 monthly_cost += p.value * units
    //                 units = 0
    //             }
    //         })
    //     }
    //     return monthly_cost
    // }
}

let okitOciProductPricing = null
