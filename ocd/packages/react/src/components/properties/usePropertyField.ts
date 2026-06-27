/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/**
 * Shared boilerplate for the ~15 near-identical property field components in
 * OcdPropertyTypes.tsx. Each component used to repeat the same useId / context /
 * useState / className / properties extraction and onChange/onBlur write-back.
 * That logic now lives here so the components become thin per-type declarations.
 *
 * Write-back semantics are intentionally preserved verbatim:
 *   - `commit` writes `resource[attribute.key]`, optionally clones the document
 *     (only the fields that previously cloned do so), and marks the file modified.
 *   - The per-field value codecs (`propertyCodecs`) keep the subtle list join/split
 *     differences (string-list filters empties, number-list does not).
 */

import { OcdUtils } from '@ocd/core'
import { useContext, useId, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { OcdDocument } from '../OcdDocument'
import { ActiveFileContext } from '../../pages/OcdConsole'
import type { ResourceProperty } from './OcdPropertyTypes'

const VISIBLE_CLASS_NAME = 'ocd-property-row ocd-simple-property-row'
const HIDDEN_CLASS_NAME = 'collapsed hidden'

export interface PropertyFieldOptions {
    // Transform the stored model value into the controlled input's display value
    // (e.g. join an array into a comma separated string).
    toDisplay?: (raw: any) => any
}

export interface PropertyField {
    id: string
    activeFile: any
    value: any
    setValue: Dispatch<SetStateAction<any>>
    properties: { [key: string]: any }
    className: string
    markModified: () => void
    cloneDocument: () => void
    commit: (storedValue: any, clone?: boolean) => void
}

/**
 * Pure write-back used by every property field: assign the value into the model
 * and flag the active file as modified. Extracted so the exact semantics can be
 * unit tested without a DOM.
 */
export const writeBack = (resource: any, key: string, value: any, activeFile: any): void => {
    resource[key] = value
    if (!activeFile.modified) activeFile.modified = true
}

/**
 * Per-field value codecs preserving the subtle display/stored conversions that
 * previously differed between the list components.
 */
export const propertyCodecs = {
    stringList: {
        toDisplay: (raw: any) => (raw ? raw.join(',') : ''),
        toStored: (v: string) => v.split(',').filter((s) => s !== ''),
    },
    numberList: {
        toDisplay: (raw: any) => raw.join(','),
        toStored: (v: string) => v.split(','),
    },
}

export const usePropertyField = (
    { ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty,
    opts: PropertyFieldOptions = {}
): PropertyField => {
    const id = useId()
    const { activeFile } = useContext(ActiveFileContext)
    const rawValue = resource[attribute.key]
    const [value, setValue] = useState(opts.toDisplay ? opts.toDisplay(rawValue) : rawValue)
    const properties = config && config.properties ? config.properties : {}
    if (rootResource.editLocked || rootResource.locked) properties.readOnly = true
    const visible = OcdUtils.isPropertyConditionTrue(attribute.conditional, attribute.condition, resource, resource)
    const className = visible ? VISIBLE_CLASS_NAME : HIDDEN_CLASS_NAME
    const markModified = () => {
        if (!activeFile.modified) activeFile.modified = true
    }
    const cloneDocument = () => setOcdDocument(OcdDocument.clone(ocdDocument))
    const commit = (storedValue: any, clone = false) => {
        writeBack(resource, attribute.key, storedValue, activeFile)
        if (clone) setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return { id, activeFile, value, setValue, properties, className, markModified, cloneDocument, commit }
}
