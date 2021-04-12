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

import { OkitResource } from '../okit_resource.js'

class LocalPeeringGateway extends OkitResource {
    static get def() {return `
    <g>
        <path fill="#ff6600" d="M81,19.2c-34.1,0-61.8,27.7-61.8,61.8s27.7,61.8,61.8,61.8s61.8-27.7,61.8-61.8S115.1,19.2,81,19.2z
            M81,133.8c-27.7,0-50.5-21.5-52.6-48.7h23.9v8.6l21-11.6l-21-11.5v7.1h-24C30.1,50.1,53,28.2,81,28.2c28.1,0,51.1,22,52.7,49.7
            h-23.8v-7.8l-21,11.6l21,11.5v-7.8h23.7C131.4,112.4,108.7,133.8,81,133.8z"/>
        <polygon fill="#ff6600" points="84.2,60.7 92.1,60.7 80.5,39.8 69,60.7 76.8,60.7 76.8,102 68.9,102 80.5,122.9 92,102 84.2,102"/>
    </g>
    `}
    
    // Function Getters
    get parent_id() {return this.view.all_resources.find(resource => resource.id === this.vcn_id && resource.compartment_id === this.compartment_id) ? this.vcn_id : this.compartment_id}
    // -- Connections
    get connections() {return this.view.all_resources.filter(resource => this.peer_id === resource.id)}
}

export default LocalPeeringGateway
export { LocalPeeringGateway }
