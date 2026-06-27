/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { findRegion, getDefaultRegionForRealm, getRegionsForRealm, REALM_OPTIONS } from '../OcdLzRegions'

describe('OcdLzRegions', () => {
    it('lists supported realms and their regions', () => {
        expect(REALM_OPTIONS.map((realm) => realm.id)).toEqual(['oc1', 'oc19'])
        expect(getRegionsForRealm('oc1').some((region) => region.id === 'eu-frankfurt-1')).toBe(true)
        expect(getRegionsForRealm('oc19')).toEqual([
            { id: 'eu-frankfurt-2', shortName: 'str' },
            { id: 'eu-madrid-2', shortName: 'vll' },
        ])
    })

    it('finds defaults and selected regions by realm', () => {
        expect(getDefaultRegionForRealm('oc1')).toEqual({ id: 'eu-frankfurt-1', shortName: 'fra' })
        expect(findRegion('oc19', 'eu-madrid-2')).toEqual({ id: 'eu-madrid-2', shortName: 'vll' })
        expect(findRegion('oc19', 'eu-frankfurt-1')).toBe(null)
    })
})
