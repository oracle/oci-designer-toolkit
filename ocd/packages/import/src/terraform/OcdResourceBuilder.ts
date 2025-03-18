/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResource } from "@ocd/model"
import { TerraformJson } from "@ocd/parser"

export class OcdResourceBuilder {
    resourceMap: Record<string, string>
    constructor() {
        this.resourceMap = {}
    }
    generate(terraformResource: string, resourceName: string, resourceData: Record<string, string>): OcdResource | null {
        return null
    }
}