/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OciResource } from "../OciResource"
import { models } from "oci-core"

export interface OciVcn extends OciResource, models.Vcn {}

export namespace OciVcn {
    export function newResource(): OciVcn {
        return {
            ...OciResource.newResource('vcn'),
            resourceType: 'Virtual Cloud Network',
            cidrBlock: '',
            cidrBlocks: [],
            lifecycleState: models.Vcn.LifecycleState.UnknownValue,
            timeCreated: new Date()
        }
    }
}

export class OciVcnClient {
    static new(): OciVcn {
        return OciVcn.newResource()
    }

    static newOci() {}
}

export default OciVcnClient
