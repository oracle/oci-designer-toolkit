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

class InstancePool extends OkitResource {
    static get def() {return `
    <g>
        <path fill="#312D2A" d="M81.3,124.2c-43.2,0-53.7-11.8-54.8-13.1l-0.9-1.1V93.3h8v13.5c3.1,2.4,15.1,9.4,47.6,9.4
        c27.9,0,42.6-7.1,47.1-9.8V93.7h8v16.8l-1.5,1.2C134.2,112.2,118.5,124.2,81.3,124.2z M123.5,65.7v28.7H84.4h-6.6H38.7V65.7h20.8V44
        h45.7v21.7H123.5z M66.4,65.7h11.4h6.6h13.8V51H66.4V65.7z M77.4,72.7H59.4H45.7v14.7h31.7V72.7z M116.5,72.7h-11.4H84.8v14.7h31.7
        V72.7z M109,83.9c2.1,0,3.7-1.7,3.7-3.7c0-2.1-1.7-3.7-3.7-3.7c-2.1,0-3.7,1.7-3.7,3.7C105.3,82.2,106.9,83.9,109,83.9z M69.8,83.9
        c2.1,0,3.7-1.7,3.7-3.7c0-2.1-1.7-3.7-3.7-3.7s-3.7,1.7-3.7,3.7C66.1,82.2,67.8,83.9,69.8,83.9z M90.6,62.1c2.1,0,3.7-1.7,3.7-3.7
        s-1.7-3.7-3.7-3.7c-2.1,0-3.7,1.7-3.7,3.7S88.6,62.1,90.6,62.1z M152.8,9.2H9v143.6h143.8V9.2z M18,18.2h125.8v125.6H18V18.2z"/>
    </g>
    `}
    
    // Function Getters
    get parent_id() {return this.view.all_resources.find(resource => resource.id === this.subnet_id && resource.compartment_id === this.compartment_id) ? this.subnet_id : this.compartment_id}
    // -- Direct Subnet Access
    get primary_vnic() {return this.json.vnics[0]}
    get subnet_id() {return this.json.primary_vnic.subnet_id;}
    set subnet_id(id) {this.json.primary_vnic.subnet_id = id;}
}

export default InstancePool
export { InstancePool }
