/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "../model/OcdDesign";
import { OcdUtils } from "../utils/OcdUtils";

class OcdExporter {
    design: OcdDesign
    constructor() {
        this.design = OcdDesign.newDesign()
    }

    export = (design: OcdDesign): string => ''

    toTitleCase = (str: string) => OcdUtils.toTitleCase(str)
    toCamelCase = (str: string) => OcdUtils.toCamelCase(str)
    toUnderscoreCase = (str: string) => OcdUtils.toUnderscoreCase(str)
}

export default OcdExporter
export { OcdExporter }
