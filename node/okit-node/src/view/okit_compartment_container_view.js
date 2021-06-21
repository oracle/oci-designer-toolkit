'use babel'
/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import * as okit_resources from '../resources/resources.js'
import { OkitView } from './okit_view.js'

class OkitCompartmentContainerView extends OkitView {

    autoLayout() {
        // Reset Coordinates
        this.newCoords()
        // Find Container Resources
        const containers = this.all_resources.filter(r => r instanceof OkitContainerResource)
        const simple = this.all_resources.filter(r => !(r instanceof OkitContainerResource) && r instanceof OkitResource)
        // Process Simple Resource first to calculate Width & Height
        simple.forEach(resource => this.coords[resource.id] = resource.dimensions)
    }
}

export default OkitCompartmentContainerView
export { OkitCompartmentContainerView }
