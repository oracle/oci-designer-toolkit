/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdCacheData } from '../../../../../OcdCache'
import { OcdDocument } from '../../../../../OcdDocument'
import { OciModelResources as Model } from '@ocd/model'

export namespace OciLoadBalancerBackendSetProxy {
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
                console.debug('OciLoadBalancerBackendSet: Proxy: Set', prop, value)
                if (prop === 'loadBalancerId') {
                    ocdDocument.getOciResourceList('load_balancer_backend').filter((r) => r.backendSetId === obj.id).forEach((r) => r.loadBalancerId = value)
                } else if (prop === 'displayName') {
                    ocdDocument.getOciResourceList('load_balancer_backend').filter((r) => r.backendSetId === obj.id).forEach((r) => r.backendsetName = value)
                }
                obj[prop] = value
                return true
            }
        }
        return proxyHandler
    }
    export function proxyResource(ocdDocument: OcdDocument, resource: Model.OciLoadBalancerBackendSet, ocdCache: OcdCacheData) {
        const pH = proxyHandler(ocdDocument, ocdCache)
        const proxyResource = new Proxy<Model.OciLoadBalancerBackendSet>(resource, pH)
        return proxyResource
    }
}
