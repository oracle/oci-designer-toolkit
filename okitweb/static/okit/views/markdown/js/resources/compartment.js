/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment Markdown Javascript');

/*
** Define Compartment Markdown Resource Class
*/
class CompartmentMarkdown extends OkitMarkdownResource {
    constructor(resource=null, json_view) {
        super(resource, json_view)
    }
}

OkitMarkdownView.prototype.newCompartment = function(resource) {
    this.getCompartments().push(new CompartmentMarkdown(resource ? resource : this.okitjson.newCompartment(), this))
}

OkitMarkdownView.prototype.getCompartments = function() {
    if (!this.getSections()['Containers']) this.getSections()['Containers'] = {}
    if (!this.getSections()['Containers'].compartments) this.getSections()['Containers'].compartments = []
    return this.getSections()['Containers'].compartments
}
