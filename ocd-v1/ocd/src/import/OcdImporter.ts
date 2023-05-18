/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "../model/OcdDesign";
import { OcdUtils } from "../utils/OcdUtils";

class OcdImporter {
    design: OcdDesign
    constructor() {
        this.design = OcdDesign.newDesign()
    }

    import = (source: string): OcdDesign => this.design
    parse = (source: string) : OcdDesign => this.import(source)

    toTitleCase = (str: string) => OcdUtils.toTitleCase(str)
    toCamelCase = (str: string) => OcdUtils.toCamelCase(str)
}

export default OcdImporter
export { OcdImporter }
