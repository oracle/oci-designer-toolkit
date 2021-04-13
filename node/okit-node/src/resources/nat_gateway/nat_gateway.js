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

class NatGateway extends OkitResource {
    static get def() {return `
    <g>
        <path fill="#312D2A" d="M140.3,90.1h-17.1V74.7L99.2,90.1H72.6V73.7H93V58.6l15.4-24.1H93V15.8h-9v18.7H68.6L84,58.4v6.3H63.6v25.4
        H52V74.7L21,94.5l31,20V99.1h32v15L68.6,138H84v9.1h9V138h15.4L93,113.9V99.1h6.3l23.9,15.4V99.1h17.1V90.1z M95.6,41.5l-7.1,11.1
        l-7.1-11.1H95.6z M45,101.7L34,94.5L45,87.5V101.7z M81.4,131l7.1-11.1l7.1,11.1H81.4z M116.2,101.7l-11.1-7.1l11.1-7.1V101.7z"/>
    </g>
    `}
    
    // Function Getters
    get parent_id() {return this.view.all_resources.find(resource => resource.id === this.vcn_id && resource.compartment_id === this.compartment_id) ? this.vcn_id : this.compartment_id}
}

export default NatGateway
export { NatGateway }
