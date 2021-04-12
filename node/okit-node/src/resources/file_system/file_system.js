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

class FileSystem extends OkitResource {
    static get def() {return `
	<g>
        <path fill="#312D2A" d="M153.1,152.5H9.4V26.8h143.8V152.5z M18.4,143.5h125.8V35.8H18.4V143.5z M152.6,9.1H8.9v9h143.8V9.1z
        M112,124.1H36.8V70.9h0.1V59.1h33.9l6.9,11.7H112V124.1z M44.3,116.6h60.2V78.4H73.4l-6.9-11.7H44.4v11.7h-0.1V116.6z M124.7,59H79
        l4,7h34.7v58.4h7V59z"/>
	</g>
    `}
    
    // Function Getters
    get parent_id() {return this.view.all_resources.find(resource => resource.id === this.subnet_id && resource.compartment_id === this.compartment_id) ? this.subnet_id : this.compartment_id}
    // -- Direct Subnet Access
    get primary_mount_target() {return this.json.mount_targets[0]}
    get subnet_id() {return this.json.primary_mount_target.subnet_id}
    set subnet_id(id) {this.json.primary_mount_target.subnet_id = id}
}

export default FileSystem
export { FileSystem }
