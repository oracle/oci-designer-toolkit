/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { addOc19RealmConstants, getOperatingEntitiesJsonnetFiles } from '../OcdOeJsonnetFiles'
import { OE_JSONNET_SOURCE_COUNT } from '../oe/OcdLandingZoneJsonnetSources'

describe('OcdOeJsonnetFiles', () => {
    it('loads required Operating Entities generator files', () => {
        const files = getOperatingEntitiesJsonnetFiles()

        expect(files['/gen/landing_zone_multi.jsonnet']).toContain('function(config)')
        expect(files['/gen/landing_zone.libsonnet']).toContain('function(raw_config)')
        expect(files['/gen/config.libsonnet']).toContain('normalize(config)')
        expect(files['landing_zone_multi.jsonnet']).toContain('function(config)')
        expect(files['landing_zone.libsonnet']).toContain('function(raw_config)')
        expect(files['config.libsonnet']).toContain('normalize(config)')
        expect(files['/gen/lib/collections.libsonnet']).toContain('all(values)')
        expect(files['lib/collections.libsonnet']).toContain('all(values)')
    })

    it('exposes a usable oc19 (EU Sovereign) realm in the generated constants', () => {
        // The vendored upstream constants.libsonnet now ships native oc19 realm
        // constants (real sovereign OCIDs from the oci-sovereign-landing-zone addon),
        // so the synthetic strReplace overlay is intentionally skipped — the guard in
        // addOc19RealmConstants short-circuits when the source already defines `oc19:`.
        // Assert the real invariant the wizard depends on rather than the (now
        // obsolete) overlay text: the generated constants expose an oc19 realm whose
        // security-zone policy OCIDs are resolved for the sovereign realm.
        const files = getOperatingEntitiesJsonnetFiles()

        expect(files['/gen/constants.libsonnet']).toContain('oc19:')
        expect(files['/gen/constants.libsonnet']).toContain("security_zone_policy_ocids('oc19')")
    })

    it('synthesises oc19 realm constants when the source only defines oc1', () => {
        // Fallback path (upstream sources predating native oc19): addOc19RealmConstants
        // derives oc19 from oc1 by rewriting the realm domain in the policy OCIDs.
        // Synthetic policy id — no `ocid1.` prefix (public-fork redaction); it still
        // carries the `.oc1..` realm domain the overlay rewrites to `.oc19..`.
        const oc1Only = "{ oc1: { security_zone_policy_ocids: { shared_network: ['sample.oc1..aaaa'] } } }"
        const overlaid = addOc19RealmConstants(oc1Only)

        expect(overlaid).toContain('oc19: base.oc1')
        expect(overlaid).toContain("std.strReplace(ocid, '.oc1..', '.oc19..')")
        // Idempotent: a source already carrying oc19 is returned unchanged.
        expect(addOc19RealmConstants('{ oc19: {} }')).toBe('{ oc19: {} }')
    })

    it('bundles 152 logical sources under both /gen and gen-relative keys', () => {
        const files = getOperatingEntitiesJsonnetFiles()
        expect(OE_JSONNET_SOURCE_COUNT).toBe(152)
        // Each logical source is registered under two keys.
        expect(Object.keys(files).length).toBe(OE_JSONNET_SOURCE_COUNT * 2)
    })
})
