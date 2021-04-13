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

class Vcn extends OkitContainerResource {
    static get def() {return `
    <g>
        <path fill="#312D2A" d="M153.5,68.2c0-10.5-8.5-19-19-19c-3.9,0-7.5,1.2-10.5,3.2L98.7,33.9c0.3-1.4,0.5-2.8,0.5-4.3
        c0-10.5-8.5-19-19-19s-19,8.5-19,19c0,1.7,0.2,3.3,0.7,4.9L37.7,52.1c-2.9-1.8-6.4-2.9-10-2.9c-10.5,0-19,8.5-19,19
        c0,10,7.7,18.1,17.5,18.9l9.2,28.2c-4.8,3.5-8,9.1-8,15.4c0,10.5,8.5,19,19,19c7.9,0,14.8-4.9,17.6-11.9h34.3
        c2.8,6.9,9.6,11.9,17.6,11.9c10.5,0,19-8.5,19-19c0-6.7-3.5-12.5-8.7-15.9l9-27.7C145.3,86.8,153.5,78.4,153.5,68.2z M134.5,59.2
        c5,0,9,4,9,9s-4,9-9,9s-9-4-9-9S129.6,59.2,134.5,59.2z M118.4,58.2c-1.8,2.9-2.9,6.3-2.9,10c0,0.6,0,1.2,0.1,1.8L96.7,76
        c-2.6-4.5-6.9-7.8-12-9.1V48.1c4.2-1,7.9-3.5,10.5-6.8L118.4,58.2z M60.8,118.4l11.9-15.6c2.3,1,4.8,1.5,7.5,1.5
        c3.2,0,6.2-0.8,8.8-2.2l12.4,16.2c-2.7,3.1-4.3,7.1-4.5,11.5H65.3C65.1,125.5,63.4,121.5,60.8,118.4z M80.2,76.4c5,0,9,4,9,9
        s-4,9-9,9c-5,0-9-4-9-9S75.2,76.4,80.2,76.4z M80.2,20.6c5,0,9,4,9,9s-4,9-9,9c-5,0-9-4-9-9S75.2,20.6,80.2,20.6z M76.7,48.3v18.4
        c-5.3,1-9.9,4.2-12.6,8.7l-17.4-6.1c0-0.4,0.1-0.8,0.1-1.2c0-3.9-1.2-7.4-3.1-10.4l22-16C68.3,45.1,72.2,47.5,76.7,48.3z M18.7,68.2
        c0-5,4-9,9-9s9,4,9,9s-4,9-9,9S18.7,73.1,18.7,68.2z M34.2,86c4.4-1.6,8.1-4.8,10.3-8.9L61.3,83c-0.1,0.8-0.2,1.6-0.2,2.4
        c0,4.9,1.9,9.4,5,12.8l-11.8,15.4c-2.5-1.2-5.2-1.8-8.1-1.8c-1.3,0-2.5,0.1-3.7,0.4L34.2,86z M46.3,139.8c-5,0-9-4-9-9s4-9,9-9
        s9,4,9,9S51.3,139.8,46.3,139.8z M115.8,139.8c-5,0-9-4-9-9s4-9,9-9s9,4,9,9S120.8,139.8,115.8,139.8z M115.8,111.7
        c-2.9,0-5.6,0.7-8.1,1.8L95.1,97.1c2.5-3.2,4-7.3,4-11.7c0-0.6,0-1.2-0.1-1.7l18.9-6.1c2.1,3.6,5.3,6.5,9.2,8.2l-8.5,26.3
        C117.8,111.8,116.8,111.7,115.8,111.7z"/>
    </g>
    `}
    
    // -- Child Positioning
    top_edge_children = [resources.InternetGateway.name, resources.NatGateway.name, ]
    top_children = [resources.RouteTable.name, resources.SecurityList.name, resources.NetworkSecurityGroup.name]
    container_children = [resources.Subnet.name]
    left_children = [resources.Cluster.name]
    right_edge_children = [resources.ServiceGateway.name, resources.Drg.name, resources.LocalPeeringGateway.name]


   // Function Getters
   get info_text() {return this.cidr_block;}
}

export default Vcn
export { Vcn }
