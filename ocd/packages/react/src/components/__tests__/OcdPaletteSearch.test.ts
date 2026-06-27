/*
** Copyright (c) 2026, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, expect, it } from 'vitest'
import { normalizePaletteSearch, paletteSearchMatches } from '../OcdPaletteSearch'

describe('OcdPaletteSearch', () => {
    it('normalizes queries before matching palette data', () => {
        expect(normalizePaletteSearch('  OKE Cluster  ')).toBe('oke cluster')
    })

    it('treats an empty query as a match', () => {
        expect(paletteSearchMatches('', 'Object Storage')).toBe(true)
        expect(paletteSearchMatches('   ', 'Object Storage')).toBe(true)
    })

    it('matches against any resource search field', () => {
        expect(paletteSearchMatches('bucket', 'Storage', 'oci-object-storage-bucket')).toBe(true)
        expect(paletteSearchMatches('OKE', 'Containers', 'OKE Cluster')).toBe(true)
    })

    it('rejects resources that do not include the query', () => {
        expect(paletteSearchMatches('vault', 'Networking', 'VCN', 'Subnet')).toBe(false)
    })
})
