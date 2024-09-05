/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/


import { v4 as uuidv4 } from 'uuid'
// import { OcdUtils } from '@ocd/core'
import { OcdResource } from "../../OcdResource"
// import * as Resources from './resources'
// import { OcdResources } from '../../OcdDesign'

export interface GcpResource extends OcdResource {
    location: string
    parentId: string
    displayName?: string
}


export namespace GcpResource {
    export function uuid(prefix: string) {return `okit.${prefix}.${uuidv4()}`}
}