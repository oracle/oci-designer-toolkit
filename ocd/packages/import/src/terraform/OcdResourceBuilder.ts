/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResource } from "@ocd/model"

export class OcdResourceBuilder {
    resourceMap: Map<string, string>
    constructor() {
        this.resourceMap = new Map()
    }
    generate(terraformResource: string, resourceName: string, resourceData: Record<string, string>): OcdResource | null {
        return null
    }
}