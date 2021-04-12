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

class AutonomousDatabase extends OkitResource {
    static get def() {return `
    <g>
        <path fill="#312D2A" d="M149.8,65.6c-0.6,11.8-8.2,22.7-19.1,27c-0.7,0.3-1.3,0.5-2,0.7v-9.7c6.8-3.4,11.7-10.8,12.1-18.5
        c0.6-12.6-10.5-19.4-21-20.2l-3-0.3l-0.9-2.9c-0.6-1.7-6.1-16.8-24.4-12.1l-3,0.8l-1.8-2.6c-0.4-0.5-9.4-12.9-25.3-8.2l-0.4,0.1
        c-0.3,0.1-9.8,2.3-13.6,15.7l-0.9,3l-3.1,0.2c-0.7,0.1-18.8,1.7-22.4,21.9c-0.2,1.4-1.4,16.9,12,22.7v9.5c-0.6-0.2-1.1-0.3-1.6-0.5
        C13.5,86,10.8,68,11.9,59.4l0-0.2c3.4-19.6,18.1-27.2,27.6-29C45.1,14.9,56.9,11.5,58.9,11c15.6-4.5,27.5,3.1,33.2,9.3
        c19.5-3.6,28.3,9.9,31.2,15.9C137.4,38.5,150.6,48.9,149.8,65.6z M62.7,63.1c0-9.9-8.1-18-18-18s-18,8.1-18,18s8.1,18,18,18
        S62.7,73.1,62.7,63.1z M57.6,63.1c0,7.1-5.8,12.9-12.9,12.9s-12.9-5.8-12.9-12.9s5.8-12.9,12.9-12.9S57.6,56,57.6,63.1z M41.1,70.6
        l0.8-2.9h5.3l0.9,2.9h5.2l-6.3-17h-4.6l-6.3,17H41.1z M44.5,58.5l1.6,5.6h-3.2L44.5,58.5z M77.3,98.8H38.2v50h39.1V98.8z M46,106.6
        h23.5V141H46V106.6z M77,84.8H38.1v9H77V84.8z M123.2,98.8H84.1v50h39.1V98.8z M91.9,106.6h23.5V141H91.9V106.6z M122.9,84.8H84v9
        h38.9V84.8z"/>
    </g>
    `}
    
    // Function Getters
    get parent_id() {return this.view.all_resources.find(resource => resource.id === this.subnet_id && resource.compartment_id === this.compartment_id) ? this.subnet_id : this.compartment_id}
}

export default AutonomousDatabase
export { AutonomousDatabase }
