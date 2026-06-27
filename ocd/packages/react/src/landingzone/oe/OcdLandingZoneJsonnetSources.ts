/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** STUB — committed intentionally empty.
**
** The OCI Operating Entities (OE) jsonnet sources are NOT committed to this
** repository: they are vendored upstream content (oci-landing-zones/
** oci-landing-zone-operating-entities) that embeds public OCI reference OCIDs
** (CIS security-zone recipe policies, the usage-report tenancy). To keep this
** repository free of any OCIDs, names, or environment-specific identifiers, the
** populated map is generated LOCALLY and is git-ignored.
**
** To enable the Landing Zone Wizard on your machine:
**
**   npm run setup-lz
**
** That fetches the public OE sources at the pinned upstream commit and
** regenerates this file locally (the local copy is protected from accidental
** commits via git skip-worktree). Until then, the wizard prompts you to run setup.
**
** Upstream pin: oci-landing-zone-operating-entities @ 917f56214282b2d301d95dbce799e79fb0cd94d0 (UPL-1.0)
*/

/** Operating Entities jsonnet sources, keyed by gen-relative path. Empty until `npm run setup-lz`. */
export const OE_JSONNET_SOURCES: Record<string, string> = {}

/** Number of logical OE source files bundled. 0 in the committed stub. */
export const OE_JSONNET_SOURCE_COUNT = 0
