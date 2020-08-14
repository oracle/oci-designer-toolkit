/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer Instance Pool View Javascript');

/*
** Define Compartment View Artifact Class
 */
class InstancePoolView extends OkitDesignerArtefactView {
    constructor(artefact = null, json_view) {
        super(artefact, json_view);
    }
}
