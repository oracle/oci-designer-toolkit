                                            /*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OcdResource } from "@ocd/model";
import { TerraformJson } from "@ocd/parser"
import { OcdResourceBuilder } from "./OcdResourceBuilder.js";

export class OcdProviderImporter {
    resourceBuilder: OcdResourceBuilder
    design: OcdDesign
    provider: string
    resourceIdMap: Map<string, string> = new Map()
    localsMap: Map<string, string> = new Map()
    constructor(provider: string, resourceBuilder: OcdResourceBuilder) {
        this.design  = OcdDesign.newDesign()
        this.provider = provider
        this.resourceBuilder = resourceBuilder
    }

    import(terraformJsonString: string): OcdDesign {
        // console.debug('OcdProviderImporter: Importing', terraformJsonString)
        const teraformJson: TerraformJson = JSON.parse(terraformJsonString)
        const resource = this.providerFilter(teraformJson.resource, `${this.provider}_`)
        const locals = teraformJson.locals
        const variables = teraformJson.variable
        this.parseResources(resource)
        this.parseLocals(locals)
        this.parseVariables(variables)
        this.convertResources()
        return this.design
    }

    providerFilter = (resource: Record<string, any>, provider: string) => Object.entries(resource).filter(([k, v]) => k.startsWith(provider)).reduce((a, [k, v]) => {return {...a, [k]: v}}, {})

    parseResources = (resource: Record<string, any>) => {
        // console.debug('OcdProviderImporter: parseResources: Parsing', resource)
        // @ts-ignore
        const providerResources = this.design.model[this.provider].resources
        Object.entries(resource).forEach(([k, v]) => {
            const  providerResource = this.resourceBuilder.resourceMap.get(k)
            if (providerResource !== undefined) {
                if (!providerResources.hasOwnProperty(providerResource)) providerResources[providerResource] = []
                Object.entries(v).forEach(([resourceName, resourceData]) => {
                    const ocdResource: OcdResource | null = this.resourceBuilder.generate(k, resourceName, resourceData as Record<string, any>)
                    if (ocdResource !== null) {
                        this.resourceIdMap.set(`${k}.${resourceName}`, ocdResource.id)
                        providerResources[providerResource].push(ocdResource)
                    }
                })
            }
        })
        console.debug('OcdProviderImporter: parseResources: resourceIdMap', JSON.stringify(Object.fromEntries(this.resourceIdMap), null, 2))
    }

    convertResources() {
        const allResources = OcdDesign.getResources(this.design)
        allResources.forEach((r) => {
            this.convertResource(r)
        })
    }

    convertResource = (resource: Record<string, any>) => {
        Object.entries(resource).forEach(([k, v]) => {
            if (Array.isArray(v)) {
                let newArray: string[] = []
                if (typeof v[0] === 'string') {
                    newArray = v.map((e) => {
                        if (this.isReference(e)) return this.getReferenceId(e)
                        else if (this.isLocal(e)) return this.localsMap.get(e.split('.')[1]) 
                        else return e
                    })
                    resource[k] = newArray
                }
            } else if (typeof v === 'string') {
                // Check if Reference
                if (this.isReference(v)) {
                    // Get Id
                    const id = this.getReferenceId(v)
                    if (id !== undefined) resource[k] = id
                } else if (this.isLocal(v)) {
                    resource[k] = this.localsMap.get(v.split('.')[1])
                }
            } else if (typeof v === 'object') {
                console.debug('OcdProviderImporter: convertResource: Object type', k, v)
                const newValue = this.convertResource(v)
                console.debug('OcdProviderImporter: convertResource: New Value', newValue)
            }
        })
        return resource
    }

    isLocal = (value: string) => value.startsWith('local.')
    isReference = (value: string) => this.resourceBuilder.resourceMap.has(value.split('.')[0])
    getReferenceId = (value: string): string | undefined => this.resourceIdMap.get(value.split('.').slice(0, 2).join('.'))

    parseLocals = (locals: Record<string, any>) => {
        Object.entries(locals).forEach(([k, v]) => {
            if (this.isReference(v)) {
                const id = this.getReferenceId(v)
                this.localsMap.set(k, id ?? v)
            } else {
                this.localsMap.set(k, v)
            }
        })
    }

    parseVariables = (variables: Record<string, any>) => {
        // @ts-ignore
        const providerVariables = this.design.model[this.provider].vars
        Object.entries(variables).forEach(([k, v]) => {
            const variable = OcdDesign.newVariable()
            variable.name = k
            variable.default = v.default
            variable.description = v.description
            providerVariables.push(variable)
        })
    }
}
