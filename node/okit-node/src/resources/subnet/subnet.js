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

class Subnet extends OkitContainerResource {
    static get def() {return `
	<g>
        <path fill="#312D2A" d="M132.8,85.1v-9H85.5V65.5h10.8V34.8H65.6v30.7h10.9v10.6H28v9h22.5v11.4H39.2v30.7h30.7V96.5H59.6V85.1h41.9
            v11.4H90.6v30.7h30.7V96.5h-10.8V85.1H132.8z M74.6,43.8h12.7v12.7H74.6V43.8z M60.9,118.2H48.2v-12.7h12.7V118.2z M112.3,118.2
            H99.6v-12.7h12.7V118.2z"/>
	</g>
    `}

    // -- Child Positioning
    top_edge_children = [resources.RouteTable.name, resources.SecurityList.name]
    top_children = [resources.LoadBalancer.name]
    bottom_children = [resources.Instance.name, resources.InstancePool.name, resources.Database.name, resources.AutonomousDatabase.name, resources.MysqlDbSystem.name]
    left_children = [resources.FileSystem.name]
     
    // Function Getters
    get parent_id() {return this.json.vcn_id}
    get type_text() {return this.prohibit_public_ip_on_vnic ? `Private ${this.constructor.name}` : `Public ${this.constructor.name}`;}
    get info_text() {return this.cidr_block;}
}

export default Subnet
export { Subnet }
