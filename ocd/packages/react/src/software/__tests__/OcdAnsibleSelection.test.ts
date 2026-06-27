/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { ANSIBLE_USERDEFINED_KEY, getAnsibleSelection, writeAnsibleSelection } from '../OcdAnsibleSelection'

describe('getAnsibleSelection', () => {
    it('returns [] for a design with no persisted selection', () => {
        expect(getAnsibleSelection(undefined)).toEqual([])
        expect(getAnsibleSelection({})).toEqual([])
        expect(getAnsibleSelection({ userDefined: {} })).toEqual([])
    })

    it('reads back a persisted selection', () => {
        const design = { userDefined: { [ANSIBLE_USERDEFINED_KEY]: { packageIds: ['docker', 'nginx'] } } }
        expect(getAnsibleSelection(design)).toEqual(['docker', 'nginx'])
    })

    it('defends against malformed payloads', () => {
        expect(getAnsibleSelection({ userDefined: { ansible: { packageIds: 'docker' } } })).toEqual([])
        expect(getAnsibleSelection({ userDefined: { ansible: { packageIds: ['docker', 7, '', 'docker', 'nginx'] } } })).toEqual(['docker', 'nginx'])
    })
})

describe('writeAnsibleSelection', () => {
    it('round-trips through getAnsibleSelection', () => {
        const design: { userDefined?: Record<string, unknown> } = {}
        writeAnsibleSelection(design, ['docker', 'redis'])
        expect(getAnsibleSelection(design)).toEqual(['docker', 'redis'])
    })

    it('de-dupes and drops empties/non-strings while preserving order', () => {
        const design: { userDefined?: Record<string, unknown> } = {}
        writeAnsibleSelection(design, ['redis', 'redis', '', 'docker'] as string[])
        expect(getAnsibleSelection(design)).toEqual(['redis', 'docker'])
    })

    it('preserves other userDefined keys', () => {
        const design = { userDefined: { lzOrigin: true } as Record<string, unknown> }
        writeAnsibleSelection(design, ['docker'])
        expect(design.userDefined.lzOrigin).toBe(true)
        expect(getAnsibleSelection(design)).toEqual(['docker'])
    })

    it('clears the selection when given an empty list', () => {
        const design = { userDefined: { [ANSIBLE_USERDEFINED_KEY]: { packageIds: ['docker'] } } as Record<string, unknown> }
        writeAnsibleSelection(design, [])
        expect(getAnsibleSelection(design)).toEqual([])
    })
})
