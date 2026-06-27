import { DiscoverySnapshot } from './OcdDiscoveryTypes'

export type DiscoveryBackendState = 'checking' | 'available' | 'unavailable'

export interface DiscoverySummaryBadge {
    id: string
    label: string
    tone?: 'source' | 'warning'
}

export interface DiscoverySummaryInput {
    applications: number
    computeAssets: number
    dependencies: number
}

export interface DiscoveryLiveControlsState {
    backendState: DiscoveryBackendState
    selectedRegion: string
    regionsCount: number
}

export type DiscoveryFreshnessState = 'sample' | 'unavailable' | 'context' | 'refreshing' | 'current' | 'stale'

export interface DiscoveryFreshnessInput {
    backendState: DiscoveryBackendState
    currentRequestKey: string
    lastSuccessfulRequestKey: string
    loading: boolean
    selectedCompartmentCount: number
    snapshotSource: DiscoverySnapshot['source']
}

export interface DiscoveryResponseBoundary {
    activeRequestKey: string
    responseRequestKey: string
}

const sourceLabels: Record<DiscoverySnapshot['source'], string> = {
    imported: 'Imported dataset',
    'oci-query': 'Live OCI dataset',
    sample: 'Sample dataset',
}

export const getDiscoverySourceLabel = (source: DiscoverySnapshot['source']): string => sourceLabels[source]

export const countMappedOciResources = (snapshot: DiscoverySnapshot): number => snapshot.ociResources?.length ?? 0

export const buildDiscoverySummaryBadges = (
    snapshot: DiscoverySnapshot,
    summary: DiscoverySummaryInput,
    monthlyCostLabel: string,
): DiscoverySummaryBadge[] => {
    const baseBadges: DiscoverySummaryBadge[] = [
        { id: 'source', label: getDiscoverySourceLabel(snapshot.source), tone: snapshot.source === 'sample' ? 'warning' : 'source' },
        { id: 'applications', label: `${summary.applications} apps` },
        { id: 'assets', label: `${summary.computeAssets} assets` },
        { id: 'services', label: `${snapshot.services.length} services` },
        { id: 'dependencies', label: `${summary.dependencies} dependencies` },
        { id: 'cost', label: monthlyCostLabel },
    ]
    const mappedResources = countMappedOciResources(snapshot)
    return mappedResources > 0
        ? [...baseBadges, { id: 'oci-resources', label: `${mappedResources} OCI resources`, tone: 'source' }]
        : baseBadges
}

export const evaluateDiscoveryFreshness = ({
    backendState,
    currentRequestKey,
    lastSuccessfulRequestKey,
    loading,
    selectedCompartmentCount,
    snapshotSource,
}: DiscoveryFreshnessInput): DiscoveryFreshnessState => {
    if (backendState === 'unavailable') return 'unavailable'
    if (snapshotSource === 'sample') return 'sample'
    if (loading) return 'refreshing'
    if (selectedCompartmentCount === 0 || lastSuccessfulRequestKey.trim() === '') return 'context'
    return currentRequestKey === lastSuccessfulRequestKey ? 'current' : 'stale'
}

export const buildDiscoveryFreshnessBadge = (freshness: DiscoveryFreshnessState): DiscoverySummaryBadge | undefined => {
    if (freshness === 'sample') return undefined
    const badges: Record<Exclude<DiscoveryFreshnessState, 'sample'>, DiscoverySummaryBadge> = {
        unavailable: { id: 'freshness', label: 'Live backend unavailable', tone: 'warning' },
        context: { id: 'freshness', label: 'Context only', tone: 'warning' },
        refreshing: { id: 'freshness', label: 'Refreshing live inventory', tone: 'source' },
        current: { id: 'freshness', label: 'Live current', tone: 'source' },
        stale: { id: 'freshness', label: 'Drift pending refresh', tone: 'warning' },
    }
    return badges[freshness]
}

export const shouldApplyDiscoveryResponse = ({ activeRequestKey, responseRequestKey }: DiscoveryResponseBoundary): boolean =>
    activeRequestKey.trim() !== '' && activeRequestKey === responseRequestKey

export const buildDiscoveryRequestKey = (
    profile: string,
    region: string,
    compartmentIds: readonly string[],
): string => [
    profile.trim(),
    region.trim(),
    [...new Set(compartmentIds.map((id) => id.trim()).filter(Boolean))].sort().join(','),
].join('|')

export const canRunLiveDiscovery = (state: DiscoveryLiveControlsState): boolean =>
    state.backendState === 'available' && state.selectedRegion.trim().length > 0 && state.regionsCount > 0

export const getDiscoveryRegionPlaceholder = (backendState: DiscoveryBackendState): string => {
    if (backendState === 'checking') return 'Loading regions'
    if (backendState === 'unavailable') return 'Live backend unavailable'
    return 'No regions available'
}
