/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OciResource } from "../OciResource"
import { models } from "oci-core"

export interface OciInstance extends OciResource, models.Instance {}

export class OciInstanceClient {
    static new(): OciInstance {
        console.info('>> New Instance')
        return {
            region: '',
            compartmentId: '',
            id: OciResource.uuid('instance'),
            displayName: `OCD Instance`,
            availabilityDomain: '',
            lifecycleState: models.Instance.LifecycleState.UnknownValue,
            shape: '',
            timeCreated: new Date()
        }
    }

    static newOci() {}
}

export default OciInstanceClient
