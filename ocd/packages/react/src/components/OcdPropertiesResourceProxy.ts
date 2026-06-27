/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdResource } from '@ocd/model'
import { OcdUtils } from '@ocd/core'
import { OcdDocument } from './OcdDocument'
import { AwsResourceProperties } from './properties/provider/aws/AwsResourceProperties'
import { CustomResourceProperties } from './properties/provider/custom/CustomResourceProperties'
import * as azureResources from './properties/provider/azure/resources'
import * as googleResources from './properties/provider/google/resources'
import { OcdCacheData } from './OcdCache'
import { ResourceElementConfig, ResourceProperties } from './properties/OcdPropertyTypes'
import { ComponentType } from 'react'

type ModuleExports = Record<string, any>
type ResourcePropertiesComponent = ComponentType<ResourceProperties>

const ociResourceModules = import.meta.glob<ModuleExports>('./properties/provider/oci/resources/*.tsx')
const ociConfigModules = import.meta.glob<ModuleExports>('./properties/provider/oci/resources/configs/*.ts', { eager: true })
const ociProxyModules = import.meta.glob<ModuleExports>('./properties/provider/oci/resources/proxies/*.ts', { eager: true })

const namedExport = <T>(modules: Record<string, ModuleExports>, exportName: string): T | undefined => {
    for (const moduleExports of Object.values(modules)) {
        if (Object.hasOwn(moduleExports, exportName)) return moduleExports[exportName] as T
    }
    return undefined
}

export const getSelectedResourceProxy = (ocdDocument: OcdDocument, selectedModelResource: OcdResource, ocdCache: OcdCacheData) => {
    const provider = selectedModelResource ? selectedModelResource.provider : ''
    console.debug('OcdProperties: getSelectedResourceProxy:', selectedModelResource)
    switch (provider) {
        case 'azure':
            return getAzureResourceProxy(ocdDocument, selectedModelResource, ocdCache)
        case 'google':
            return getGoogleResourceProxy(ocdDocument, selectedModelResource, ocdCache)
        case 'oci':
            return getOciResourceProxy(ocdDocument, selectedModelResource, ocdCache)
        default:
            return selectedModelResource
    }
}

const getAzureResourceProxy = (ocdDocument: OcdDocument, selectedModelResource: OcdResource, ocdCache: OcdCacheData) => {
    const provider = selectedModelResource.provider
    const resourceType = selectedModelResource.resourceType
    const resourceProxyName = `${OcdUtils.toTitleCase(provider)}${resourceType}Proxy`
    console.debug(`> OcdProperies: OcdResourceProperties: Render(AzureProxy(${resourceProxyName}))`, selectedModelResource)
    //@ts-ignore
    return Object.hasOwn(azureResources, resourceProxyName) ? azureResources[resourceProxyName].proxyResource(ocdDocument, selectedModelResource, ocdCache) : selectedModelResource
}

const getGoogleResourceProxy = (ocdDocument: OcdDocument, selectedModelResource: OcdResource, ocdCache: OcdCacheData) => {
    const provider = selectedModelResource.provider
    const resourceType = selectedModelResource.resourceType
    const resourceProxyName = `${OcdUtils.toTitleCase(provider)}${resourceType}Proxy`
    console.debug(`> OcdProperies: OcdResourceProperties: Render(GoogleProxy(${resourceProxyName}))`, selectedModelResource)
    //@ts-ignore
    return Object.hasOwn(googleResources, resourceProxyName) ? googleResources[resourceProxyName].proxyResource(ocdDocument, selectedModelResource, ocdCache) : selectedModelResource
}

const getOciResourceProxy = (ocdDocument: OcdDocument, selectedModelResource: OcdResource, ocdCache: OcdCacheData) => {
    const provider = selectedModelResource.provider
    const resourceType = selectedModelResource.resourceType
    const resourceProxyName = `${OcdUtils.toTitleCase(provider)}${resourceType}Proxy`
    console.debug(`> OcdProperies: OcdResourceProperties: Render(Oci Proxy(${resourceProxyName}))`, selectedModelResource)
    const resourceProxy = namedExport<{ proxyResource: (ocdDocument: OcdDocument, selectedModelResource: OcdResource, ocdCache: OcdCacheData) => OcdResource }>(ociProxyModules, resourceProxyName)
    return resourceProxy ? resourceProxy.proxyResource(ocdDocument, selectedModelResource, ocdCache) : selectedModelResource
}

export const getOciResourceConfigs = (selectedModelResource: OcdResource): ResourceElementConfig[] => {
    const provider = selectedModelResource ? selectedModelResource.provider : ''
    const resourceType = selectedModelResource ? selectedModelResource.resourceType : ''
    if (provider !== 'oci') return []

    const resourceConfigsName = `${OcdUtils.toTitleCase(provider)}${resourceType}Configs`
    const resourceConfigs = namedExport<{ configs: () => ResourceElementConfig[] }>(ociConfigModules, resourceConfigsName)
    return resourceConfigs ? resourceConfigs.configs() : []
}

export const getResourceProperties = async (selectedModelResource: OcdResource): Promise<ResourcePropertiesComponent | undefined> => {
    const provider = selectedModelResource ? selectedModelResource.provider : ''
    const resourceType = selectedModelResource ? selectedModelResource.resourceType : ''
    const resourceJSXMethod = `${OcdUtils.toTitleCase(provider)}${resourceType}`
    console.debug(`> OcdProperies: OcdResourceProperties: Render(JMX(${resourceJSXMethod}))`)
    switch (provider) {
        case 'aws':
            // AWS has a single generic properties component (no codegen per-resource wrappers).
            return AwsResourceProperties
        case 'custom':
            // Runtime custom stencils render a schema-driven panel from their manifest.
            return CustomResourceProperties
        case 'azure':
            // @ts-ignore
            return azureResources[resourceJSXMethod]
        case 'google':
            // @ts-ignore
            return googleResources[resourceJSXMethod]
        case 'oci':
            {
                const modulePath = `./properties/provider/oci/resources/${resourceJSXMethod}.tsx`
                const loader = ociResourceModules[modulePath]
                if (!loader) return undefined
                const moduleExports = await loader()
                return moduleExports[resourceJSXMethod] as ResourcePropertiesComponent | undefined
            }
        default:
            return undefined
    }
}
