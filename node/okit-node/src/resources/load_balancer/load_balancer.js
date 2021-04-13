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

class LoadBalancer extends OkitResource {
    static get def() {return `
	<g>
        <path fill="#312D2A" d="M122.5,112.8L92.6,84.7h36.2v6.6l18-9.9l-18-9.9v5.2H92.3l30.2-28.4l4.1,4.4l6.3-19.6L113,38.2l4,4.2
        L88,69.7V30.6H28.8v46.1H11.1v8h17.7v46.9H88V91.3l29,27.3l-4,4.2l19.9,5.1l-6.3-19.6L122.5,112.8z M79,122.5H37.8V84.7h22.7v6.6
        l18-9.9l-18-9.9v5.2H37.8V39.6H79V122.5z"/>
	</g>
    `}
   
    // Function Getters
    get parent_id() {return this.view.all_resources.find(resource => resource.id === this.subnet_id && resource.compartment_id === this.compartment_id) ? this.subnet_id : this.compartment_id}
    // -- Direct Subnet Access
    get subnet_id() {return this.json.subnet_ids[0];}
    set subnet_id(id) {this.json.subnet_ids[0] = id;}
    // -- Connections
    get connections() {return this.view.all_resources.filter(resource => this.instance_ids.includes(resource.id))}
}

export default LoadBalancer
export { LoadBalancer }
