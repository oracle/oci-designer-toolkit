/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OciResource } from "../OciResource"
import { models } from "oci-core"

export interface OciInstance extends OciResource, models.Instance {}

export namespace OciInstance {
    export function newResource(): OciInstance {
        return {
            ...OciResource.newResource('instance'),
            resourceType: 'Instance',
            availabilityDomain: '',
            lifecycleState: models.Instance.LifecycleState.UnknownValue,
            shape: '',
            timeCreated: new Date()
        }
    }
}

export class OciInstanceClient {
    static new(): OciInstance {
        console.info('>> New Instance')
        return OciInstance.newResource()
    }

    static newOci() {}
}

export default OciInstanceClient
