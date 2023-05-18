/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

class OcdSchemaImporter {
    ocd_schema
    constructor() {
        this.ocd_schema = {}
    }

    convert(source_schema) {console.info(source_schema)}

    toTitleCase = (str) => str.replace(/\b\w+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();}).replaceAll('-', '_').replace(/\W+/g, ' ')
    toCamelCase = (str) => `${this.toTitleCase(str.split('_').join(' ')).split(' ').map((e, i) => i === 0 ? e.toLowerCase() : e).join('')}`
}

export default OcdSchemaImporter
export { OcdSchemaImporter }
