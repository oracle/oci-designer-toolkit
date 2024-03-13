/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdUtils } from "@ocd/core"
import { OcdResource } from "@ocd/model"

export class OcdMarkdownResource {
    heading = ['#####', '######', '######', '######', '######']
    ocdCommonGeneration = (resource: OcdResource): string => {
        return `${resource.documentation}`
    }
    generateCodeAttribute = (name: string, value: string | undefined, required: boolean, level=0): string => {
        return `| ${OcdUtils.toTitle(name)} | <pre>${value?.replaceAll('\n', '<br>').replaceAll('|', '&#124;')}</pre> |`
    }
    generateTextAttribute = (name: string, value: string | undefined, required: boolean, level=0): string => {
        return `| ${OcdUtils.toTitle(name)} | ${value} |`
    }
    generateBooleanAttribute = (name: string, value: string | undefined, required: boolean, level=0): string => {
        return `| ${OcdUtils.toTitle(name)} | ${value ? '&check;' : '&cross;'}`
    }
    generateNumberAttribute = (name: string, value: string | undefined, required: boolean, level=0): string => {
        return `| ${OcdUtils.toTitle(name)} | ${value} |`
    }
    generateReferenceAttribute = (name: string, value: string | undefined, required: boolean, level=0, element: string = 'id', allResource: OcdResource[] = []): string => {
        const resource = allResource.find((r) => r.id === value)
        const displayName = resource ? `[${resource.displayName}](#${resource.displayName.toLowerCase().replaceAll(' ', '-')})` : ''
        return `| ${OcdUtils.toTitle(name)} | ${displayName} |`
    }
    generateReferenceListAttribute = (name: string, value: string | string[] | undefined, required: boolean, level=0, allResource: OcdResource[] = []): string => {
        const ids = typeof value === 'string' ? value.split(',') : Array.isArray(value) ? value : []
        const refResources = ids.map((id) => allResource.find((r) => r.id === id)).filter((r) => r !== undefined)
        const displayNames = refResources.map((r) => `<li>${r ? `[${r.displayName}](#${r.displayName.toLowerCase().replaceAll(' ', '-')})` : ''}</li>`)
        return `| ${OcdUtils.toTitle(name)} | <ul style="list-style-type: none;padding: 0px;margin: 0px;">${displayNames.join('')}</ul> |`
    }
    generateStringListAttribute = (name: string, value: string | string[] | undefined, required: boolean, level=0): string => {
        const valuesArray = typeof value === 'string' ? value.split(',') : Array.isArray(value) ? value : []
        const displayValues = valuesArray.map((v) => `<li>${v}</li>`)
        return `| ${OcdUtils.toTitle(name)} | <ul style="list-style-type: none;padding: 0px;margin: 0px;">${displayValues.join('')}</ul> |`
    }
}

export default OcdMarkdownResource
