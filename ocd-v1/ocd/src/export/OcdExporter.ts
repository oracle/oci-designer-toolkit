/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "../model/OcdDesign";
import { OcdUtils } from "../utils/OcdUtils";

export interface OutputData extends Record<string, string[]> {}

class OcdExporter {
    design: OcdDesign
    constructor() {
        this.design = OcdDesign.newDesign()
    }

    export = (design: OcdDesign): string | OutputData => ''

    toTitleCase = (str: string) => OcdUtils.toTitleCase(str)
    toCamelCase = (str: string) => OcdUtils.toCamelCase(str)
    toUnderscoreCase = (str: string) => OcdUtils.toUnderscoreCase(str)
}

export default OcdExporter
export { OcdExporter }
