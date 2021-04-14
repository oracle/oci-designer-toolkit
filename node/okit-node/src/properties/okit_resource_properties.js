/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

class OkitResourceProperties {
    static model = {}
    handler = {
        get: function(obj, prop) {
            if (typeof obj[prop] === 'object') {
                this.updateHierarchy(obj, prop)
                return new Proxy(obj[prop], this.handler)
            }
            return obj[prop]
        },
        set: function(obj, prop, value) {
            const id = this.hierarchy.length > 0 ? `${this.hierarchy.join('.')}.${prop}` : prop
            console.info('Property:', prop, value, 'Id:', id)
            obj[prop] = value
            if (this.document) {
                const element = this.document.getElementById(id)
                if (!element) console.warn('Element', id, 'was not found')
                else if (element.type === 'checkbox' | element.type === 'radio') element.checked = value
                else element.setAttribute('value', value)
            }
            return true
        },
        hierarchy: [],
        updateHierarchy: function(obj, prop) {
            if (this.hierarchy.slice(-1)[0] !== prop) this.hierarchy.push(prop)
        }
    }    
    constructor(json={}, document=undefined) {
        this.document = document
        this.resource = new Proxy(json, this.handler)
    }
}

export { OkitResourceProperties }
