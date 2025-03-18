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
    constructor(provider: string, resourceBuilder: OcdResourceBuilder) {
        this.design  = OcdDesign.newDesign()
        this.provider = provider
        this.resourceBuilder = resourceBuilder
    }

    import(terraformJsonString: string): OcdDesign {
        // console.debug('OcdProviderImporter: Importing', terraformJsonString)
        const teraformJson: TerraformJson = JSON.parse(terraformJsonString)
        const resource = this.providerFilter(teraformJson.resource, `${this.provider}_`)
        // console.debug('OcdProviderImporter: Reduced', resource)
        this.parseResources(resource)
        return this.design
    }

    providerFilter = (resource: Record<string, any>, provider: string) => Object.entries(resource).filter(([k, v]) => k.startsWith(provider)).reduce((a, [k, v]) => {return {...a, [k]: v}}, {})

    parseResources = (resource: Record<string, any>) => {
        console.debug('OcdProviderImporter: parseResources: Parsing', resource)
        // @ts-ignore
        const providerResources = this.design.model[this.provider].resources
        Object.entries(resource).forEach(([k, v]) => {
            // console.debug('OcdProviderImporter: parseResources: processing', k)
            const  providerResource = this.resourceBuilder.resourceMap[k]
            if (providerResource !== undefined) {
                if (!providerResources.hasOwnProperty(providerResource)) providerResources[providerResource] = []
                Object.entries(v).forEach(([resourceName, resourceData]) => {
                    const ocdResource: OcdResource | null = this.resourceBuilder.generate(k, resourceName, resourceData as Record<string, any>)
                    // console.debug('OcdProviderImporter: parseResources: ocdResource', JSON.stringify(ocdResource, null, 2))
                    if (ocdResource !== null) providerResources[providerResource].push(ocdResource)
                })
            }
        })
        console.debug('OcdProviderImporter: parseResources: design', JSON.stringify(this.design, null, 2))
    }

    convertResource = () => {}

    parseLocals = (locals: Record<string, any>) => {}

    parseVariables = (variables: Record<string, any>) => {}
}
