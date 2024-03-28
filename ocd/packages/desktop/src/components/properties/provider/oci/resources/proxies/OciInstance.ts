/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdCacheData } from '../../../../../OcdCache'
import { OcdDocument } from '../../../../../OcdDocument'
import { OciModelResources as Model } from '@ocd/model'

export namespace OciInstanceProxy {
    export function proxyHandler(ocdDocument: OcdDocument, ocdCache: OcdCacheData)  {
        const proxyHandler = {
            //@ts-ignore
            get(obj, prop) {
                if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                  return new Proxy(obj[prop], proxyHandler)
                } else {
                  return obj[prop];
                }
            },
            //@ts-ignore
            set(obj, prop, value) {
                if (prop === 'shape') {
                    // If Shape is Flexible set the Memory & Ocpus to minimum values otherwise set to 0
                    const shape = ocdCache.getOciReferenceDataList('shapes').find((r: Record<string, any>) => r.id === value)
                    const images = ocdCache.getOciReferenceDataList('images').filter((r: Record<string, any>) => r.shapes.includes(value)).map((r: Record<string, any>) => r.id)
                    console.debug('OciInstance Proxy:', images)
                    // If Flexible set defaults for Memory & OCPU
                    if (shape !== undefined && shape.isFlexible) {
                        obj.shapeConfig.memoryInGbs = shape.memoryOptions.defaultPerOcpuInGBs
                        obj.shapeConfig.ocpus = 1
                    } else {
                        obj.shapeConfig.memoryInGbs = 0
                        obj.shapeConfig.ocpus = 0
                    }
                    // Check if Image is still valif and change if not
                    obj.sourceDetails.sourceId = images.includes(obj.sourceDetails.sourceId) ? obj.sourceDetails.sourceId : images[0]
                }
                obj[prop] = value
                return true
            }
        }
        return proxyHandler
    }
    export function proxyResource(ocdDocument: OcdDocument, resource: Model.OciInstance, ocdCache: OcdCacheData) {
        const pH = proxyHandler(ocdDocument, ocdCache)
        const proxyResource = new Proxy<Model.OciInstance>(resource, pH)
        return proxyResource
    }
}
