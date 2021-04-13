/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitContainerResource } from '../okit_resource.js'
import * as resources from '../resources.js'

class Compartment extends OkitContainerResource {
    static get def() {return `
	<g>
		<path fill="#312D2A" d="M81.8,44.7L71.3,22.3H9.1l0,117.1h144V44.7H81.8z M144,130.4h-126l0-99.1h47.5l10.5,22.4H144V130.4z"/>
		<polygon fill="none" stroke="#312D2A" stroke-width="7" stroke-miterlimit="10" points="117.7,87.2 104.7,110.8 130.8,110.8 	"/>
		<ellipse transform="matrix(0.9732 -0.2298 0.2298 0.9732 -20.5486 21.5425)" fill="none" stroke="#312D2A" stroke-width="7" stroke-miterlimit="10" cx="82.2" cy="99" rx="12" ry="12"/>
		<polygon fill="none" stroke="#312D2A" stroke-width="7" stroke-miterlimit="10" points="39.5,87.4 32.7,99.1 39.5,110.8 53,110.8 59.8,99.1 53,87.4"/>
		<polygon fill="#312D2A" points="40.1,68.8 49.1,68.8 49.1,59.5 58.8,59.5 58.8,50.5 49.1,50.5 49.1,41.2 40.1,41.2 40.1,50.5 30.3,50.5 30.3,59.5 40.1,59.5"/>
	</g>
    `}

    // -- Child Positioning
    top_children = [resources.Instance.name]
    container_children = [resources.Compartment.name, resources.Subnet.name, resources.Vcn.name]
    left_children = [resources.Volume.name]
    right_children = [resources.Drg.name, resources.AutonomousDatabase.name, resources.Bucket.name, resources.IpsecConnection.name, resources.RemotePeeringConnection.name]
    right_edge_children = [resources.Cpe.name]

   // Function Getters
}

export default Compartment
export { Compartment }
