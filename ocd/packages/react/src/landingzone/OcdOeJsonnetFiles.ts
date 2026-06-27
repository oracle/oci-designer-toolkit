/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** TypeScript port of the LZNG `oeJsonnetFiles.js` service.
**
** Builds the in-memory files map handed to the go-jsonnet WASM memory importer.
** The importer resolves relative imports against the importing file's directory,
** so every source is registered under BOTH an absolute `/gen/<rel>` key and a
** gen-relative `<rel>` key. `constants.libsonnet` gets the `addOc19RealmConstants`
** overlay so OC19 (EU Sovereign) realm constants are derived from OC1.
**
** Sources are loaded from the GENERATED string map (OcdLandingZoneJsonnetSources)
** rather than import.meta.glob, so they survive the @ocd/react library re-bundle.
*/

import { OE_JSONNET_SOURCES } from './oe/OcdLandingZoneJsonnetSources'

export function addOc19RealmConstants(source: string): string {
    if (source.includes('oc19:')) return source

    return `local base = ${source};
base {
  oc19: base.oc1 {
    security_zone_policy_ocids: {
      [key]: [
        std.strReplace(ocid, '.oc1..', '.oc19..')
        for ocid in base.oc1.security_zone_policy_ocids[key]
      ]
      for key in std.objectFields(base.oc1.security_zone_policy_ocids)
    },
  },
}
`
}

/** True when the OE jsonnet sources have been installed locally (via `npm run setup-lz`). */
export function hasOperatingEntitiesSources(): boolean {
    return Object.keys(OE_JSONNET_SOURCES).length > 0
}

export function getOperatingEntitiesJsonnetFiles(): Record<string, string> {
    if (!hasOperatingEntitiesSources()) {
        throw new Error(
            'OCI Operating Entities sources are not installed. Run `npm run setup-lz` to fetch the public ' +
            'oci-landing-zone-operating-entities sources locally, then reload the Landing Zone Wizard.'
        )
    }
    const files: Record<string, string> = {}
    for (const [relative, source] of Object.entries(OE_JSONNET_SOURCES)) {
        const rooted = `/gen/${relative}`
        const content = rooted === '/gen/constants.libsonnet' ? addOc19RealmConstants(source) : source
        files[rooted] = content
        files[relative] = content
    }
    return files
}
