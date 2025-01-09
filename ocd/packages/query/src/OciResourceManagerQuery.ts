/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { common, resourcemanager } from "oci-sdk"
import { OciResource } from "@ocd/model"
import { OcdUtils } from "@ocd/core"
import { OciCommonQuery } from './OciQueryCommon.js'

export class OciResourceManagerQuery extends OciCommonQuery {
    // Clients
    resourcemanagerClient: resourcemanager.ResourceManagerClient
    constructor(profile: string='DEFAULT', region?: string) {
        super(profile, region)
        console.debug('OciResourceManagerQuery: Region', region)
        this.resourcemanagerClient = new resourcemanager.ResourceManagerClient(this.authenticationConfiguration, this.clientConfiguration)
    }
}

export default OciResourceManagerQuery
// module.exports = { OciResourceManager }
