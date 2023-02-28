/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
/*
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
** Generated : 28/02/2023 17:29:49
**
*/

import { OciResource } from "../OciResource"

export interface OciBucket extends OciResource {
    accessType?: string
    approximateCount?: string
    approximateSize?: string
    autoTiering?: string
    bucketId?: string
    createdBy?: string
    etag?: string
    isReadOnly?: boolean
    kmsKeyId?: string
    metadata?: {[key: string]: string}
    namespace: string
    objectEventsEnabled?: boolean
    objectLifecyclePolicyEtag?: string
    replicationEnabled?: boolean
    storageTier?: string
    versioning?: string
    retentionRules?: object[]
}



export namespace OciBucket {
    export function newResource(): OciBucket {
        return {
            ...OciResource.newResource('bucket'),
            accessType: '',
            approximateCount: '',
            approximateSize: '',
            autoTiering: '',
            bucketId: '',
            createdBy: '',
            etag: '',
            isReadOnly: false,
            kmsKeyId: '',
            metadata: {},
            namespace: '',
            objectEventsEnabled: false,
            objectLifecyclePolicyEtag: '',
            replicationEnabled: false,
            storageTier: '',
            versioning: '',
            retentionRules: []
        }
    }
    
}

export class OciBucketClient {
    static new(): OciBucket {
        return OciBucket.newResource()
    }
}

export default OciBucketClient
