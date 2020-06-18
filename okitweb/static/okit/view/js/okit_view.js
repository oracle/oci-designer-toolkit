/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT View Javascript');

// TODO: Implement View Classes
class OkitJsonView {
    constructor(okitJson=null) {
        if (okitJson === null || okitJson === undefined) {
            this.okitJson = new OkitJson();
        } else if (typeof okitJson === 'string') {
            this.okitJson = JSON.parse(okitJson);
        } else if (okitJson instanceof Object) {
            this.okitJson = okitJson;
        } else {
            this.okitJson = new OkitJson();
        }
    }

    draw() {}

    /*
    ** Artefact Processing
     */
    // Autonomous Database

    // Block Storage

    // Compartment
    newCompartment() {}
    getCompartment() {}
    deleteCompartment() {}

    // Database System
}

class OkitArtefactView {
    constructor() {
    }
}
