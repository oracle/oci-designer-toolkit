/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Json View Javascript');

class OkitTextJsonView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'json-text-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'json-text-div') {
        return new OkitTextJsonView((model, oci_data, parent_id, resource_icons))
    }

    draw(for_export=false) {
        this.newCanvas()
    }

    newCanvas(width=800, height=800, for_export=false) {
        // Empty Existing
        let json_div = document.getElementById(this.parent_id)
        json_div.innerHTML = ''
        let root = this.createRoot(json_div)
        this.addObjectAttribute(root, this.model, '')
    }

    createRoot(parent) {
        let root = document.createElement('ul')
        root.setAttribute('id', 'json_view_root')
        root.setAttribute('class', 'json-view-root')
        parent.appendChild(root)
        return root
    }

    addObjectAttribute(parent, obj, key='') {
        let element = document.createElement('li')
        element.setAttribute('class', 'object')
        element.onclick = (event) => {
            event.stopPropagation()
            if(event.target !== event.currentTarget) return false
            const ul = element.getElementsByTagName('ul')[0]
            element.classList.toggle('element-collapsed')
            return false
        }
        parent.appendChild(element)
        let key_label = this.buildKey(key)
        key_label.onclick = (event) => {
            event.stopPropagation()
            const ul = element.getElementsByTagName('ul')[0]
            element.classList.toggle('element-collapsed')
            return false
        }
        element.appendChild(key_label)
        if (Object.keys(obj).length === 0) {
            element.setAttribute('class', 'object empty')
        } else {
            element.setAttribute('id', obj.id)
            element.setAttribute('class', 'object collapsible')
            // Process key/val
            let object_ul = document.createElement('ul')
            element.appendChild(object_ul)
            Object.entries(obj).forEach(([k, v]) => {
                if (v instanceof Function) console.info('Ignoring Function', k)
                else if (Array.isArray(v)) this.addArrayAttribute(object_ul, v, k)
                else if (v instanceof Object) this.addObjectAttribute(object_ul, v, k)
                else this.addSimpleAttribute(object_ul, v, k)
            })
        }
    }

    addArrayAttribute(parent, arr, key='') {
        let element = document.createElement('li')
        element.setAttribute('class', 'array')
        element.onclick = (event) => {
            event.stopPropagation()
            if(event.target !== event.currentTarget) return false
            const ul = element.getElementsByTagName('ul')[0]
            element.classList.toggle('element-collapsed')
            return false
        }
        parent.appendChild(element)
        let key_label = this.buildKey(key)
        key_label.onclick = (event) => {
            event.stopPropagation()
            const ul = element.getElementsByTagName('ul')[0]
            element.classList.toggle('element-collapsed')
            return false
        }
        element.appendChild(key_label)
        if (arr.length === 0) {
            element.setAttribute('class', 'array empty')
        } else {
            element.setAttribute('class', 'array collapsible')
            // Process key/val
            let object_ul = document.createElement('ul')
            element.appendChild(object_ul)
            arr.forEach((v) => {
                if (Array.isArray(v)) this.addArrayAttribute(object_ul, v)
                else if (v instanceof Object) this.addObjectAttribute(object_ul, v)
                else this.addSimpleAttribute(object_ul, v)
            })
        }
    }

    addSimpleAttribute(parent, val, key='') {
        let element = document.createElement('li')
        element.setAttribute('class', 'simple')
        parent.appendChild(element)
        if (key && key !== '') {
            element.appendChild(this.buildKey(key))
        }
        let label = document.createElement('label')
        label.setAttribute('class', typeof val)
        label.appendChild(document.createTextNode(val))
        element.appendChild(label)
    }

    addCloseBrace(parent, brace=')') {
        const close_li = document.createElement('li')
        const close_brace = document.createElement('span')
        close_brace.setAttribute('class', 'brace')
        close_brace.appendChild(document.createTextNode(`${brace}`))
        close_li.appendChild(close_brace)
        parent.appendChild(close_li)
    }

    buildKey(key) {
        // HTML Elements
        const div = document.createElement('div')
        const label = document.createElement('label')
        const span = document.createElement('span')
        const colon = document.createElement('span')
        // Create Element Name Label
        if (key !== '') {
            span.appendChild(document.createTextNode(`"${key}"`))
            span.setAttribute('class', 'key')
            colon.appendChild(document.createTextNode(':'))
            colon.setAttribute('class', 'colon')
            label.setAttribute('class', 'key')
            label.appendChild(span)
            label.appendChild(colon)
            label.setAttribute('class', 'key-displayed')
        }
        return label
        // div.appendChild(label)
        // return div
    }

}

okitViewClasses.push(OkitTextJsonView);

let okitTextJsonView = null;
