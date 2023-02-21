/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OciResource } from "../OciResource"
import { models } from "oci-identity"

export interface OciCompartment extends OciResource, models.Compartment {}

export namespace OciCompartment {
    export function newResource(): OciCompartment {
        return {
            ...OciResource.newResource('compartment'),
            resourceType: 'Compartment',
            name: 'OCD Compartment',
            description: 'OCD Created Compartment',
            lifecycleState: models.Compartment.LifecycleState.UnknownValue,
            timeCreated: new Date()
        }
    }
}

export class OciCompartmentClient {
    static new(): OciCompartment {
        return OciCompartment.newResource()
    }

    static newOci() {}
}

export default OciCompartmentClient
