/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import * as AutoGenerated from "./generated/OciServiceGateway.js"

export class OciServiceGateway extends AutoGenerated.OciServiceGateway {
    retrieveServiceGatewayServiceId = (): string => {
        const content = `
locals {
    ${this.terraformResourceName}_serviceGatewayService_id = ${!this.resource.services || this.resource.services.length === 0 || this.resource.services[0].serviceId === 'All' ? 'local.all_services_id' : 'local.objectstorage_services_id'}
    ${!this.resource.services ? '' : this.resource.services.map((s, i) => s.serviceId === 'All' ? `${this.terraformResourceName}_${i}_serviceGatewayService_id = local.all_services_id` : `${this.terraformResourceName}_${i}_serviceGatewayService_id = local.objectstorage_services_id`).join('\n')}
}
`
        return content
    }
}

export default OciServiceGateway
