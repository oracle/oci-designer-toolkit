/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
/*
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
** Generated : 28/02/2023 17:29:49
**
*/

import { OciResource } from "../OciResource"

export interface OciDrgRouteDistributionStatement extends OciResource {
    action: string
    drgRouteDistributionId: string
    priority: number
    matchCriteria?: OciMatchCriteria
}


export interface OciMatchCriteria {
    attachmentType?: string
    drgAttachmentId?: string
    matchType?: string
}


export namespace OciDrgRouteDistributionStatement {
    export function newResource(): OciDrgRouteDistributionStatement {
        return {
            ...OciResource.newResource('drg_route_distribution_statement'),
            action: '',
            drgRouteDistributionId: '',
            priority: 0,
            matchCriteria: OciDrgRouteDistributionStatement.newOciMatchCriteria()
        }
    }
    
    export function newOciMatchCriteria(): OciMatchCriteria {
        return {
            attachmentType: '',
            drgAttachmentId: '',
            matchType: ''
        }
    }

}

export class OciDrgRouteDistributionStatementClient {
    static new(): OciDrgRouteDistributionStatement {
        return OciDrgRouteDistributionStatement.newResource()
    }
}

export default OciDrgRouteDistributionStatementClient
