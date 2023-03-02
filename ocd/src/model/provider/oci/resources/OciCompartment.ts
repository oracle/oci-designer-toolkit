/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
/*
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
** Generated : 01/03/2023 17:21:08
**
*/

import { OciResource } from "../OciResource"

export interface OciCompartment extends OciResource {
    description: string
    enableDelete?: boolean
}



export namespace OciCompartment {
    export function newResource(): OciCompartment {
        return {
            ...OciResource.newResource('compartment'),
            description: '',
            enableDelete: false
        }
    }
    
}

export class OciCompartmentClient {
    static new(): OciCompartment {
        return OciCompartment.newResource()
    }
}

export default OciCompartmentClient
