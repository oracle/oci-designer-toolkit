/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
/*
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
** Generated : 01/03/2023 17:21:08
**
*/

import { OciResource } from "../OciResource"

export interface OciBucket extends OciResource {
    accessType?: string
    approximateCount?: string
    approximateSize?: string
    autoTiering?: string
    bucketId?: string
    isReadOnly?: boolean
    kmsKeyId?: string
    metadata?: {[key: string]: string}
    namespace: string
    objectEventsEnabled?: boolean
    replicationEnabled?: boolean
    storageTier?: string
    versioning?: string
    retentionRules?: OciRetentionRules[]
}


export interface OciRetentionRules {
    retentionRuleId?: string
    timeModified?: string
    timeRuleLocked?: string
    duration?: OciDuration
}

export interface OciDuration {
    timeAmount: string
    timeUnit: string
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
            isReadOnly: false,
            kmsKeyId: '',
            metadata: {},
            namespace: '',
            objectEventsEnabled: false,
            replicationEnabled: false,
            storageTier: '',
            versioning: '',
            retentionRules: []
        }
    }
    
    export function newOciRetentionRules(): OciRetentionRules {
        return {
            retentionRuleId: '',
            timeModified: '',
            timeRuleLocked: '',
            duration: OciBucket.newOciDuration()
        }
    }

    export function newOciDuration(): OciDuration {
        return {
            timeAmount: '',
            timeUnit: ''
        }
    }

}

export class OciBucketClient {
    static new(): OciBucket {
        return OciBucket.newResource()
    }
}

export default OciBucketClient
