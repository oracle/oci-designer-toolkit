/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDocument } from '../../../../../OcdDocument'
import { OcdResource } from '@ocd/model'

export namespace OciVnicAttachmentProxy {
    export function proxyHandler(ocdDocument: OcdDocument)  {
        const proxyHandler = {
            //@ts-ignore
            get(obj, prop) {
                if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                  return new Proxy(obj[prop], proxyHandler)
                } else {
                  return obj[prop];
                }
            },
        }
        return proxyHandler
    }
    export function proxyResource(ocdDocument: OcdDocument, resource: OcdResource) {
        const pH = proxyHandler(ocdDocument)
        const proxyResource = new Proxy(resource, pH)
        return proxyResource
    }
}
