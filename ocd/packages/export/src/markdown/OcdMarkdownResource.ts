/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdUtils } from "@ocd/core"
import { OcdResource } from "@ocd/model"

export class OcdMarkdownResource {
    heading = ['#', '##', '###', '####', '#####']
    ocdCommonGeneration = (resource: OcdResource): string => {
        return `${resource.documentation}`
    }
    generateTextAttribute = (name: string, value: string | undefined, required: boolean, level=0): string => {
        return `| ${name} | ${value} |`
    }
    generateBooleanAttribute = (name: string, value: string | undefined, required: boolean, level=0): string => {
        return `| ${name} | ${value ? '&check;' : '&cross;'}`
    }
    generateNumberAttribute = (name: string, value: string | undefined, required: boolean, level=0): string => {
        return `| ${name} | ${value} |`
    }

}

export default OcdMarkdownResource
