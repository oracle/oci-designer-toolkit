/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Read-only OCI discovery handlers for the local web backend.
**
** These mirror the Electron main-process IPC handlers (see
** packages/desktop/src/main.ts: ociConfig:* / ociQuery:*) so the browser build can
** perform import-from-OCI / Reference Data Query when this localhost service is running.
** All credential reading and OCI SDK calls happen server-side; profile secrets are never
** placed in the HTTP responses.
*/

import {
    cancelLandingZoneAddonUpdateJob,
    createJob,
    createStack,
    errorMessage,
    generateArchitecturePlanFromImageWithGenAi,
    generateArchitecturePlanWithGenAi,
    getLandingZoneAddonUpdateJob,
    getResourceManagerPlanReview,
    listLandingZoneAddonHealth,
    listRegions,
    listStacks,
    listTenancyCompartments,
    loadOciConfigProfile,
    loadOciConfigProfiles,
    OciQuery,
    queryDiscoverySnapshot,
    queryDropdown,
    queryTenancy as backendQueryTenancy,
    startLandingZoneAddonUpdateJob,
    updateLandingZoneAddon,
    updateStack,
} from "@ocd/query"

export {
    cancelLandingZoneAddonUpdateJob,
    createJob,
    createStack,
    errorMessage,
    generateArchitecturePlanFromImageWithGenAi,
    generateArchitecturePlanWithGenAi,
    getLandingZoneAddonUpdateJob,
    getResourceManagerPlanReview,
    listLandingZoneAddonHealth,
    listRegions,
    listStacks,
    listTenancyCompartments,
    queryDiscoverySnapshot,
    queryDropdown,
    startLandingZoneAddonUpdateJob,
    updateLandingZoneAddon,
    updateStack,
}

export interface QueryTenancyRequest {
    profile: string
    region: string
    compartmentIds: string[]
    // Optional correlation id threaded from the HTTP boundary (X-Request-Id). When present
    // it is passed down to the query layer so its log lines correlate with the request.
    requestId?: string
}

/*
** Tenancy discovery for the web backend. Backward-compatible: when no requestId is supplied
** the call delegates to the shared @ocd/query queryTenancy (unchanged behaviour). When the
** HTTP layer threads the request id through, we drive the OciQuery instance directly so the
** correlation id reaches OciQuery.queryTenancy and scopes its logger. requestId is an opaque
** token, never an OCID/secret, and no design JSON is logged.
*/
export const queryTenancy = (request: QueryTenancyRequest): Promise<unknown> => {
    const { profile, region, compartmentIds, requestId } = request
    if (!requestId) return backendQueryTenancy({ profile, region, compartmentIds })
    const query = new OciQuery(profile, region)
    return query.withTimeout(query.queryTenancy(compartmentIds, { requestId }), 'queryTenancy')
}

export interface QueryDropdownRequest {
    profile: string
    region: string
}

export interface QueryDiscoverySnapshotRequest {
    profile: string
    region: string
    compartmentIds?: string[]
}

/*
** Read the profile names defined in ~/.oci/config. Never returns credential values.
** Throws a descriptive error when no config / no profiles are found so the caller can
** surface a clear JSON error to the browser instead of a stack trace.
*/
export const loadProfileNames = loadOciConfigProfiles

/*
** Return the non-sensitive key/value pairs for a single profile. Credential-bearing
** keys (key file paths, fingerprints, passphrases, token files) are removed.
*/
export const loadProfile = loadOciConfigProfile
