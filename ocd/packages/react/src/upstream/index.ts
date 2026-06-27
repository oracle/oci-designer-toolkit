/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

export type { UpstreamStatus, ResourceHint, UpstreamCheckOptions } from './OcdUpstreamCheck'
export {
    UPSTREAM_REPO,
    OCTO_BASELINE_REF,
    OCTO_BASELINE_RESOURCE_COUNT,
    checkUpstream,
    getUpstreamLastCheckedAt,
    invalidateUpstreamCache,
} from './OcdUpstreamCheck'
export type { UseUpstreamFeatureCheck } from './useUpstreamFeatureCheck'
export { useUpstreamFeatureCheck } from './useUpstreamFeatureCheck'
