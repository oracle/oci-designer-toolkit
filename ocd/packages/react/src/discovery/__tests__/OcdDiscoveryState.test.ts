import { describe, expect, it } from 'vitest'
import { discoverySampleSnapshot } from '../OcdDiscoverySampleData'
import {
    buildDiscoverySummaryBadges,
    buildDiscoveryFreshnessBadge,
    buildDiscoveryRequestKey,
    canRunLiveDiscovery,
    countMappedOciResources,
    evaluateDiscoveryFreshness,
    getDiscoveryRegionPlaceholder,
    getDiscoverySourceLabel,
    shouldApplyDiscoveryResponse,
} from '../OcdDiscoveryState'

describe('Discovery Workbench UI state helpers', () => {
    it('labels sample, live, and imported datasets clearly', () => {
        expect(getDiscoverySourceLabel('sample')).toBe('Sample dataset')
        expect(getDiscoverySourceLabel('oci-query')).toBe('Live OCI dataset')
        expect(getDiscoverySourceLabel('imported')).toBe('Imported dataset')
    })

    it('builds active-dataset badges without showing zero OCI resources for sample data', () => {
        const badges = buildDiscoverySummaryBadges(discoverySampleSnapshot, {
            applications: 3,
            computeAssets: 6,
            dependencies: 8,
        }, 'USD 6,020 / month')

        expect(badges.map((badge) => badge.id)).toEqual(['source', 'applications', 'assets', 'services', 'dependencies', 'cost'])
        expect(badges.map((badge) => badge.label)).toContain('9 services')
        expect(badges.map((badge) => badge.label)).not.toContain('0 OCI resources')
    })

    it('adds an OCI resource badge only when the active dataset has mapped OCI resources', () => {
        const liveSnapshot = {
            ...discoverySampleSnapshot,
            source: 'oci-query' as const,
            ociResources: [
                { resourceType: 'vcn', displayName: 'Hub VCN' },
                { resourceType: 'subnet', displayName: 'App Subnet' },
            ],
        }

        expect(countMappedOciResources(liveSnapshot)).toBe(2)
        expect(buildDiscoverySummaryBadges(liveSnapshot, {
            applications: 3,
            computeAssets: 6,
            dependencies: 8,
        }, 'USD 6,020 / month')).toContainEqual({
            id: 'oci-resources',
            label: '2 OCI resources',
            tone: 'source',
        })
    })

    it('disables live discovery until a backend and region are available', () => {
        expect(canRunLiveDiscovery({ backendState: 'checking', selectedRegion: '', regionsCount: 0 })).toBe(false)
        expect(canRunLiveDiscovery({ backendState: 'unavailable', selectedRegion: 'eu-frankfurt-1', regionsCount: 1 })).toBe(false)
        expect(canRunLiveDiscovery({ backendState: 'available', selectedRegion: '', regionsCount: 1 })).toBe(false)
        expect(canRunLiveDiscovery({ backendState: 'available', selectedRegion: 'eu-frankfurt-1', regionsCount: 1 })).toBe(true)
    })

    it('uses stable region placeholders for empty static and loading states', () => {
        expect(getDiscoveryRegionPlaceholder('checking')).toBe('Loading regions')
        expect(getDiscoveryRegionPlaceholder('unavailable')).toBe('Live backend unavailable')
        expect(getDiscoveryRegionPlaceholder('available')).toBe('No regions available')
    })

    it('evaluates live discovery freshness from the active request boundary', () => {
        expect(evaluateDiscoveryFreshness({
            backendState: 'available',
            currentRequestKey: 'profile|region|a',
            lastSuccessfulRequestKey: 'profile|region|a',
            loading: false,
            selectedCompartmentCount: 1,
            snapshotSource: 'oci-query',
        })).toBe('current')

        expect(evaluateDiscoveryFreshness({
            backendState: 'available',
            currentRequestKey: 'profile|region|b',
            lastSuccessfulRequestKey: 'profile|region|a',
            loading: false,
            selectedCompartmentCount: 1,
            snapshotSource: 'oci-query',
        })).toBe('stale')

        expect(evaluateDiscoveryFreshness({
            backendState: 'available',
            currentRequestKey: 'profile|region|a',
            lastSuccessfulRequestKey: 'profile|region|a',
            loading: true,
            selectedCompartmentCount: 1,
            snapshotSource: 'oci-query',
        })).toBe('refreshing')

        expect(evaluateDiscoveryFreshness({
            backendState: 'available',
            currentRequestKey: 'profile|region|a',
            lastSuccessfulRequestKey: '',
            loading: false,
            selectedCompartmentCount: 0,
            snapshotSource: 'oci-query',
        })).toBe('context')

        expect(evaluateDiscoveryFreshness({
            backendState: 'unavailable',
            currentRequestKey: '',
            lastSuccessfulRequestKey: '',
            loading: false,
            selectedCompartmentCount: 0,
            snapshotSource: 'sample',
        })).toBe('unavailable')
    })

    it('builds user-facing freshness badges only when they add signal beyond the source badge', () => {
        expect(buildDiscoveryFreshnessBadge('sample')).toBeUndefined()
        expect(buildDiscoveryFreshnessBadge('current')).toEqual({
            id: 'freshness',
            label: 'Live current',
            tone: 'source',
        })
        expect(buildDiscoveryFreshnessBadge('stale')).toEqual({
            id: 'freshness',
            label: 'Drift pending refresh',
            tone: 'warning',
        })
        expect(buildDiscoveryFreshnessBadge('refreshing')).toEqual({
            id: 'freshness',
            label: 'Refreshing live inventory',
            tone: 'source',
        })
    })

    it('rejects stale live discovery responses from older request boundaries', () => {
        expect(shouldApplyDiscoveryResponse({
            activeRequestKey: 'profile|region|new',
            responseRequestKey: 'profile|region|old',
        })).toBe(false)
        expect(shouldApplyDiscoveryResponse({
            activeRequestKey: 'profile|region|new',
            responseRequestKey: 'profile|region|new',
        })).toBe(true)
        expect(shouldApplyDiscoveryResponse({
            activeRequestKey: '',
            responseRequestKey: 'profile|region|new',
        })).toBe(false)
    })

    it('builds normalized discovery request keys without false drift from whitespace or compartment order', () => {
        expect(buildDiscoveryRequestKey(' DEFAULT ', ' eu-frankfurt-1 ', ['b', ' a ', '', 'b'])).toBe('DEFAULT|eu-frankfurt-1|a,b')
        expect(buildDiscoveryRequestKey('DEFAULT', 'eu-frankfurt-1', ['a', 'b'])).toBe('DEFAULT|eu-frankfurt-1|a,b')
    })
})
