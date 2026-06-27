/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/**
 * Unit tests for the property-field write-back helpers extracted from
 * OcdPropertyTypes.tsx during the factory refactor. These exercise the exact
 * model write-back semantics the property components rely on (text/number/
 * boolean/lookup commit a value into resource[key] and flag the file modified)
 * plus the subtle list display/stored codecs that previously differed between
 * the string-list and number-list components.
 *
 * Environment: `node` (no DOM) — these are pure functions, so no jsdom needed.
 */

import { describe, it, expect } from 'vitest'
import { writeBack, propertyCodecs } from '../usePropertyField'

describe('writeBack', () => {
    it('writes a text/lookup string value into the model and flags modified', () => {
        // Arrange
        const resource: Record<string, any> = { displayName: '' }
        const activeFile = { modified: false }

        // Act
        writeBack(resource, 'displayName', 'my-vcn', activeFile)

        // Assert
        expect(resource.displayName).toBe('my-vcn')
        expect(activeFile.modified).toBe(true)
    })

    it('stores a number field as the raw (un-coerced) value', () => {
        // The number property intentionally writes the raw input string, matching
        // the pre-refactor behaviour (no Number() coercion on commit).
        const resource: Record<string, any> = { count: 0 }
        const activeFile = { modified: false }

        writeBack(resource, 'count', '42', activeFile)

        expect(resource.count).toBe('42')
        expect(typeof resource.count).toBe('string')
    })

    it('writes a boolean checkbox value into the model', () => {
        const resource: Record<string, any> = { enabled: false }
        const activeFile = { modified: false }

        writeBack(resource, 'enabled', true, activeFile)

        expect(resource.enabled).toBe(true)
        expect(activeFile.modified).toBe(true)
    })

    it('does not clobber an already-modified file flag', () => {
        const resource: Record<string, any> = { displayName: 'a' }
        const activeFile = { modified: true }

        writeBack(resource, 'displayName', 'b', activeFile)

        expect(activeFile.modified).toBe(true)
    })
})

describe('propertyCodecs.stringList', () => {
    it('joins the stored array for display and tolerates an empty/undefined value', () => {
        expect(propertyCodecs.stringList.toDisplay(['a', 'b', 'c'])).toBe('a,b,c')
        expect(propertyCodecs.stringList.toDisplay(undefined)).toBe('')
        expect(propertyCodecs.stringList.toDisplay(null)).toBe('')
    })

    it('splits the display string and filters out empty entries on store', () => {
        expect(propertyCodecs.stringList.toStored('a,b,c')).toEqual(['a', 'b', 'c'])
        expect(propertyCodecs.stringList.toStored('a,,b,')).toEqual(['a', 'b'])
        expect(propertyCodecs.stringList.toStored('')).toEqual([])
    })
})

describe('propertyCodecs.numberList', () => {
    it('joins the stored array for display', () => {
        expect(propertyCodecs.numberList.toDisplay([1, 2, 3])).toBe('1,2,3')
    })

    it('splits the display string WITHOUT filtering empties (distinct from stringList)', () => {
        // The number-list field historically kept empty segments; this test fences
        // that difference so the two codecs do not get accidentally unified.
        expect(propertyCodecs.numberList.toStored('1,2,3')).toEqual(['1', '2', '3'])
        expect(propertyCodecs.numberList.toStored('1,,3')).toEqual(['1', '', '3'])
    })
})
