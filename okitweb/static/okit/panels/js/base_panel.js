/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OkitPanel Javascript');

/*
** Define OkitPanel Class
*/
class OkitPanel {
    createDetailsSection(label='', id='', idx='', callback=undefined, data={}, open=true) {
        const details = d3.create('details').attr('class', 'okit-details').on('toggle', callback)
        if (open) details.attr('open', open)
        const summary = details.append('summary').attr('class', 'summary-background').append('label').text(label)
        const div = details.append('div').attr('class', 'okit-details-body')
        return {details: details, summary: summary, div: div}
    }
}
