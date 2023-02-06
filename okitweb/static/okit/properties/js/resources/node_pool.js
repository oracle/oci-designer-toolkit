/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Node Pool Properties Javascript');

/*
** Define Node Pool Properties Class
*/
class NodePoolProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Shape
        const node_shape = this.createInput('select', 'Shape', `${this.id}_node_shape`, '', (d, i, n) => {this.resource.node_shape = n[i].value; this.handleShapeChange(n[i].value)})
        this.shape = node_shape.input
        this.append(this.core_tbody, node_shape.row)
        // Kubernetes Version
        const kubernetes_version = this.createInput('select', 'Kubernetes Version', `${this.id}_kubernetes_version`, '', (d, i, n) => this.resource.kubernetes_version = n[i].value)
        this.kubernetes_version = kubernetes_version.input
        this.append(this.core_tbody, kubernetes_version.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadReferenceSelect(this.kubernetes_version, 'getKubernetesVersions', true)
        // Assign Values
    }

}
