/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdCacheData } from '../../../../../OcdCache'
import { OcdDocument } from '../../../../../OcdDocument'
import { OciModelResources as Model } from '@ocd/model'

export namespace OciVcnProxy {
    export function proxyHandler(ocdDocument: OcdDocument, ocdCache: OcdCacheData)  {
        const proxyHandler = {
            //@ts-ignore
            get(obj, prop) {
                if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                  return new Proxy(obj[prop], proxyHandler)
                } else {
                  return obj[prop];
                }
            }
        }
        return proxyHandler
    }
    export function proxyResource(ocdDocument: OcdDocument, resource: Model.OciVcn, ocdCache: OcdCacheData) {
        const pH = proxyHandler(ocdDocument, ocdCache)
        const proxyResource = new Proxy<Model.OciVcn>(resource, pH)
        return proxyResource
    }
}
