'use babel'
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

import { readFileSync } from 'fs'

class OkitData {
    constructor(data) {
        const today = new Date();
        const date = `${today.getFullYear()}-${(today.getMonth() + 1)}-${today.getDate()}`;
        const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
        this.okit = {
            okit_version: '0.20.0',
            okit_schema_version: '0.1.0',
            title: 'OKIT - The OCI Designer / Visualiser',
            description: '',
            created: `${date} ${time}`,
            updated: '',
            region: {
                cross_region: {
                    resources: {},
                    coords: {},
                    connectors: {},
                    svg: {}
                },
                undefined: {
                    resources: {},
                    coords: {},
                    connectors: {},
                    svg: {}
                }
            }
        }  
        if (data && typeof data === 'string') this.loadString(data)
        else if (data && data instanceof Object) this.loadJson(data)
        // else console.info('OKIT Data Has not been specified.')
    }

    loadString(str) {
        this.loadJson(JSON.parse(str))
    }

    loadJson(data) {
        this.okit = data
    }

    toString() {
        return JSON.stringify(this.okit, null, 2)
    }

    getDrawHierarchy() {

    }
}

export { OkitData }
