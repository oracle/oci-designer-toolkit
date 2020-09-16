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
        //this.target = target;
        //this.okit_json = okit_json;
        Object.defineProperty(this, 'target', { get: function() {return target;} });
        Object.defineProperty(this, 'okit_json', { get: function() {return okit_json;} });
        console.info(this.target);
        console.info(this.okit_json);
    }

    get fragment_title() {return this.target.title;}
    get fragment_url() {return '/static/okit/fragments/json/' + this.fragment_title.toLowerCase().split(' ').join('_') + '.json';}
    get target_id() {return this.target.id;}
    get target_type() {return this.target.type;}

    updateIds() {
        console.log('Updating Ids');
        // Regenerate all Ids so the fragment can be dropped multiple times
        let id_map = {};
        this.updatePrimaryIds(this, id_map);
        this.updateIdAssociations(this, id_map);
        console.log();
    }

    updatePrimaryIds(fragment_json, id_map) {
        let me = this;
        if (Array.isArray(fragment_json) && fragment_json.length > 0 && typeof fragment_json[0] === 'object') {
            fragment_json.forEach(function(e) {return me.updatePrimaryIds(e, id_map);});
        } else if (typeof fragment_json === 'object' && fragment_json !== null) {
            for (let [key, val] of Object.entries(fragment_json)) {
                if (key === 'id') {
                    id_map[val] = `okit.${val.split('.')[1]}.${uuidv4()}`;
                    fragment_json[key] = id_map[val];
                } else if (!Array.isArray(val) && typeof val === 'object' && val !== null) {
                    this.updatePrimaryIds(val, id_map);
                } else if (Array.isArray(val)) {
                    val.forEach(function(e) {return me.updatePrimaryIds(e, id_map);});
                }
            }
        }
    }

    updateIdAssociations(fragment_json, id_map) {
        let me = this;
        if (Array.isArray(fragment_json) && fragment_json.length > 0 && typeof fragment_json[0] === 'object') {
            fragment_json.forEach(function(e) {return me.updateIdAssociations(e, id_map);});
        } else if (typeof fragment_json === 'object' && fragment_json !== null) {
            for (let [key, val] of Object.entries(fragment_json)) {
                if (key.endsWith('_id') || key.endsWith('_ids')) {
                    if (Array.isArray(val)) {
                        fragment_json[key] = val.map(function (e) {
                            return id_map[e] ? id_map[e] : e;
                        });
                    } else if (typeof val === 'string') {
                        fragment_json[key] = id_map[val] ? id_map[val] : fragment_json[key];
                    }
                } else if (!Array.isArray(val) && typeof val === 'object' && val !== null) {
                    this.updateIdAssociations(val, id_map);
                } else if (Array.isArray(val)) {
                    val.forEach(function(e) {return me.updateIdAssociations(e, id_map);});
                }
            }
        } else {
            console.info(`Unknown Type : ${typeof fragment_json}`);
        }
    }

}