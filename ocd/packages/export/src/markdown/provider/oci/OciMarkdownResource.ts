/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdMarkdownResource from '../../OcdMarkdownResource'
import { OciModelResources as Model, OciResource } from '@ocd/model'

export class OciMarkdownResource extends OcdMarkdownResource {
    ociCommonGeneration = (resource: OciResource): string => {
        return `#### ${resource.displayName}

${this.ocdCommonGeneration(resource)}
`
    }
}

export default OciMarkdownResource
