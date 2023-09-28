/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "@ocd/model";
import { OcdUtils } from "@ocd/core";

export interface OutputData extends Record<string, string[]> {}

class OcdExporter {
    design: OcdDesign
    constructor() {
        this.design = OcdDesign.newDesign()
    }

    getOciResources() {return Object.values(this.design.model.oci.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])}
    getResources() {return this.getOciResources()}

    export = (design: OcdDesign): string | OutputData => ''

    toTitleCase = (str: string) => OcdUtils.toTitleCase(str)
    toCamelCase = (str: string) => OcdUtils.toCamelCase(str)
    toUnderscoreCase = (str: string) => OcdUtils.toUnderscoreCase(str)
}

export default OcdExporter
export { OcdExporter }
