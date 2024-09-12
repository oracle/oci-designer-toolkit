/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdMarkdownResource from '../../OcdMarkdownResource'
import { GcpModelResources as Model, GcpResource } from '@ocd/model'

export class GcpMarkdownResource extends OcdMarkdownResource {
    gcpCommonGeneration = (resource: GcpResource): string => {
        return `#### ${resource.displayName}

${this.ocdCommonGeneration(resource)}
`
    }
}

export default GcpMarkdownResource
