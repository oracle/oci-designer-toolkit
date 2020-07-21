/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Model Javascript');

/*
** Representation of overall OKIT Model Data Structure
 */
class Fragment extends  OkitJson {
    /*
    ** Create
     */
    constructor(target={}, okit_json={}) {
        super();
        this.target = target;
        this.okit_json = okit_json;
        console.info(this.target);
        console.info(this.okit_json);
    }

    get fragment_title() {return this.target.title;}
    get fragment_url() {return '/static/okit/fragments/json/' + this.fragment_title.toLowerCase().split(' ').join('_') + '.json';}
    get target_id() {return this.target.id;}
    get target_type() {return this.target.type;}

    // TODO: Code update processing. First we need to change the way we get parent_id
    updateIds() {
        console.group('Updating Ids');
        // Regenerate all Ids so the fragment can be dropped multiple times
        //this.updateCompartmentIds(fragment_json);
        console.groupEnd();
    }

}