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

class Cluster extends OkitResource {
    static get def() {return `
    <g>
        <path fill="#312D2A" d="M33.9,96.3c0,0.4,2.5,38.3,46.8,38.3c0,0,0.1,0,0.1,0c40.1,0,47.2-36.6,47.3-37l0.7-3.8l-2.5-0.8V60.5h-13.7
            V33H84.9h-7.8H49.3v27.6H35.8v31.6l-2.1,0.7L33.9,96.3z M43.4,99.1l33.8-11.2v37.6C51.3,124,44.9,106.6,43.4,99.1z M90.8,80.7
            l-10-3.5l-9.4,3.1V68.5h5.7h7.8h5.9V80.7z M84.1,125.5V87.9l34.1,11.7C115.7,107.3,107.4,124,84.1,125.5z M118.3,68.5v21.6
            l-19.6-6.7V68.5h13.9H118.3z M85.1,41h19.6v19.6h-5.9h-8h-5.7V41z M57.3,41h19.6v19.6h-5.5h-8.2h-5.9V41z M43.8,68.5h5.5h13.9V83
            l-19.4,6.4V68.5z M9,9.2v143.6h143.8V9.2H9z M143.8,143.9H18V18.2h125.8V143.9z"/>
    </g>
    `}
   
    // Function Getters 
    get parent_id() {return this.vcn_id}
    // -- Direct Subnet Access
    get is_pool() {return this.json.pools && this.json.pools.length > 0}
    get is_subnet() {return this.is_pool && this.json.pools[0].subnet_ids.length >0}
    get subnet_id() {return  this.is_subnet ? this.json.pools[0].subnet_ids[0] : undefined}
    set subnet_id(id) {if (this.is_subnet) this.json.pools[0].subnet_ids[0] = id}
}

export default Cluster
export { Cluster }
