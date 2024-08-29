/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded ValidationPanel Javascript');

/*
** Define ValidationPanel Class
*/
class OkitValidationPanel extends OkitPanel {
    constructor(results, parent_id='validation_panel') {
        super()
        this.results = results
        this.parent_id = parent_id
        console.info('Results', results)
        this.build()
        this.load(results)
    }

    build() {
        this.validation_results_div = d3.create('div')
                                        .attr('id', `validation_results_div`)
                                        .attr('class', 'okit-validation-results')
        this.title = this.validation_results_div.append('div')
                                        .attr('class', `panel-heading`)
                                        .append('h3')
        this.results = this.validation_results_div.append('div')
                                        .attr('id', `results_panel`)
                                        .attr('class', 'validation-results-panel')
        this.error_details = this.createDetailsSection('Errors', `errors_details`)
        this.append(this.validation_results_div, this.error_details.details)
        this.warning_details = this.createDetailsSection('Warnings', `warnings_details`)
        this.append(this.validation_results_div, this.warning_details.details)
        this.info_details = this.createDetailsSection('Information', `infos_details`)
        this.append(this.validation_results_div, this.info_details.details)
        // Attach
        const parent = d3.select(`#${this.parent_id}`)
        parent.selectAll('*').remove()
        this.append(parent, this.validation_results_div)
    }

    load(results) {
        results = results ? results : this.results
        // Clear Existing
        this.error_details.div.selectAll('*').remove()
        this.warning_details.div.selectAll('*').remove()
        this.info_details.div.selectAll('*').remove()
        if (results) {
            this.title.text(results.valid ? 'Validation Successful' : 'Validation Failed')
            results.results.errors.forEach((r) => this.displayResult(r, 'okit-validation-error', this.error_details.div))
            results.results.warnings.forEach((r) => this.displayResult(r, 'okit-validation-warning', this.warning_details.div))
            results.results.info.forEach((r) => this.displayResult(r, 'okit-validation-info', this.info_details.div))
            this.error_details.summary.text(`Errors (${results.results.errors.length})`)
            this.warning_details.summary.text(`Warnings (${results.results.warnings.length})`)
            this.info_details.summary.text(`Information (${results.results.info.length})`)
            this.error_details.details.property('open', results.results.errors.length > 0)
            this.warning_details.details.property('open', results.results.warnings.length > 0)
            this.info_details.details.property('open', results.results.info.length > 0)
        }
    }

    displayResult(result, result_class, parent) {
        const svg = d3.select(d3Id(result.id))
        // const fill = svg.attr('fill')
        const result_wrapper_div = parent.append('div').attr('class', `okit-validation-result`)
                                            .on('mouseover', () => {svg.classed(`${result_class}-highlight`, true)})
                                            .on('mouseout', () => svg.classed(`${result_class}-highlight`, false))
                                            .on('click', () => {okitJsonView.getResource(result.id).loadProperties();handleOpenProperties()})
        const result_div = result_wrapper_div.append('div').attr('class', `${result_class}`)
        const resource_class = result.type.toLowerCase().replaceAll(' ', '-')
        const result_title = result_div.append('div').attr('class', `okit-validation-result-title ${resource_class}`).text(`${result.type} / ${result.artefact}`)
        const result_message = result_div.append('div').attr('class', `okit-validation-message`).text(result.message)
    }

    append = (parent, child) => parent.append(() => child.node())
}
