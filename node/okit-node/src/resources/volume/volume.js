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

class Volume extends OkitResource {
    static get def() {return `
    <g>
        <path fill="#312D2A" d="M153.1,152.5H9.4V26.8h143.8V152.5z M18.4,143.5h125.8V35.8H18.4V143.5z M152.6,9.1H8.9v9h143.8V9.1z
         M78,87.6H46.4V56H78V87.6z M53.4,80.6H71V63H53.4V80.6z M115.6,87.6H84V56h31.6V87.6z M91,80.6h17.6V63H91V80.6z M78.4,124.7H46.9
        V93.2h31.6V124.7z M53.9,117.7h17.6v-17.6H53.9V117.7z M116,124.7H84.5V93.2H116V124.7z M91.5,117.7H109v-17.6H91.5V117.7z"/>
    </g>
    `}
    
    // Function Getters
    // get parent_id() {return this.view.all_resources.find(resource => resource.id === this.subnet_id && resource.compartment_id === this.compartment_id) ? this.subnet_id : this.compartment_id}
}

export default Volume
export { Volume }
