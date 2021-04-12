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

class Database extends OkitResource {
    static get def() {return `
	<g>
        <path fill="#312D2A" d="M151.6,99.9V62.1h-37.8v14.2h-13.8V62.1H85.5V47.6H100V9.8H62.2v37.8h14.2v14.6H62.3v14.2H47.2V62.1H9.4
        v37.8h14.5v14.7H9.6v37.8h37.8v-37.8H32.9V99.9h14.3V85.3h15.1v14.6h14.2V136h37.3v16.4h37.8v-37.8h-14.4V99.9H151.6z M71.2,18.8H91
        v19.8H71.2V18.8z M38.4,143.4H18.6v-19.8h19.8V143.4z M38.2,90.9H18.4V71.1h19.8V90.9z M122.8,71.1h19.8v19.8h-19.8V71.1z
        M71.3,71.1h19.8v19.8H71.3V71.1z M142.6,143.4h-19.8v-19.8h19.8V143.4z M128.2,114.6h-14.4V127H85.5V99.9h14.6V85.3h13.8v14.6h14.4
        V114.6z"/>
	</g>
    `}
   
    // Function Getters
    get parent_id() {return this.view.all_resources.find(resource => resource.id === this.subnet_id && resource.compartment_id === this.compartment_id) ? this.subnet_id : this.compartment_id}
}

export default Database
export { Database }
