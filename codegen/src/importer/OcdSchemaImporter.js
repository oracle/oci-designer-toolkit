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
}

export default OcdSchemaImporter
export { OcdSchemaImporter }
