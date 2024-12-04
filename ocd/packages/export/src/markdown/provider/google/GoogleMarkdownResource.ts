/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdMarkdownResource from '../../OcdMarkdownResource.js'
import { GoogleModelResources as Model, GoogleResource } from '@ocd/model'

export class GoogleMarkdownResource extends OcdMarkdownResource {
    googleCommonGeneration = (resource: GoogleResource): string => {
        return `#### ${resource.displayName}

${this.ocdCommonGeneration(resource)}
`
    }
}

export default GoogleMarkdownResource
