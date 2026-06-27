import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OciModelResources } from '@ocd/model'
import { ConsolePageProps } from '../types/Console'
import { discoverySampleSnapshot } from '../discovery/OcdDiscoverySampleData'
import { summarizeDiscoveryInventory, summarizeUtilization } from '../discovery/OcdDiscoveryAnalytics'
import {
    buildArchitecturePlanFromDiscoverySnapshot,
    buildDiscoveryArchitecturePrompt,
    mapCompartmentsToDiscoverySnapshot,
    mapDiscoveryServicesToOciTargets,
    mapOciDesignToDiscoverySnapshot,
} from '../discovery/OcdDiscoveryMappers'
import OcdDiscoveryAnalyticsView from '../discovery/ui/OcdDiscoveryAnalyticsView'
import OcdDiscoveryInventoryView from '../discovery/ui/OcdDiscoveryInventoryView'
import OcdDiscoveryLzMappingView from '../discovery/ui/OcdDiscoveryLzMappingView'
import OcdDiscoveryTopologyView from '../discovery/ui/OcdDiscoveryTopologyView'
import {
    buildDiscoveryFreshnessBadge,
    buildDiscoveryRequestKey,
    buildDiscoverySummaryBadges,
    canRunLiveDiscovery,
    DiscoveryBackendState,
    evaluateDiscoveryFreshness,
    getDiscoveryRegionPlaceholder,
    shouldApplyDiscoveryResponse,
} from '../discovery/OcdDiscoveryState'
import { formatOciBackendError, isBackendUnavailableError, OciApiFacade } from '../facade/OciApiFacade'
import { OciDiscoverySnapshot, OciRegionOption } from '../facade/OcdBackend'
import { OcdDocument } from '../components/OcdDocument'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import { buildDesignFromArchitecturePlan } from '../architecture-agent/OcdArchitectureAgent'

type DiscoveryTab = 'inventory' | 'topology' | 'analytics' | 'lz-mapping'

const discoveryTabs: Array<{ id: DiscoveryTab, label: string }> = [
    { id: 'inventory', label: 'Inventory' },
    { id: 'topology', label: 'Topology' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'lz-mapping', label: 'LZ Mapping' }
]

const formatUsd = (value: number): string => `USD ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} / month`

const formatResourceCount = (result: OciDiscoverySnapshot | undefined): number =>
    Object.values(result?.resourceSummary ?? {}).reduce((total, count) => total + count, 0)

const OcdDiscovery = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const [activeTab, setActiveTab] = useState<DiscoveryTab>('inventory')
    const [profiles, setProfiles] = useState<string[]>([])
    const [regions, setRegions] = useState<OciRegionOption[]>([])
    const [compartments, setCompartments] = useState<OciModelResources.OciCompartment[]>([])
    const [selectedProfile, setSelectedProfile] = useState('DEFAULT')
    const [selectedRegion, setSelectedRegion] = useState('')
    const [selectedCompartmentIds, setSelectedCompartmentIds] = useState<string[]>([])
    const [snapshotResult, setSnapshotResult] = useState<OciDiscoverySnapshot | undefined>(undefined)
    const [snapshot, setSnapshot] = useState(discoverySampleSnapshot)
    const [status, setStatus] = useState('Sample discovery data loaded')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [backendState, setBackendState] = useState<DiscoveryBackendState>('checking')
    const lastAutoDiscoveryKey = useRef('')
    const activeDiscoveryRequestKey = useRef('')
    const activeProfileContextKey = useRef('')
    const lastSuccessfulDiscoveryKey = useRef('')
    const summary = useMemo(() => summarizeDiscoveryInventory(snapshot), [snapshot])
    const utilization = useMemo(() => summarizeUtilization(snapshot), [snapshot])
    const targets = useMemo(() => mapDiscoveryServicesToOciTargets(snapshot), [snapshot])
    const liveDiscoveryEnabled = canRunLiveDiscovery({ backendState, selectedRegion, regionsCount: regions.length })
    const liveControlsDisabled = backendState !== 'available'
    const discoveryRequestKey = useMemo(
        () => buildDiscoveryRequestKey(selectedProfile, selectedRegion, selectedCompartmentIds),
        [selectedProfile, selectedRegion, selectedCompartmentIds]
    )
    const discoveryFreshness = useMemo(() => evaluateDiscoveryFreshness({
        backendState,
        currentRequestKey: discoveryRequestKey,
        lastSuccessfulRequestKey: lastSuccessfulDiscoveryKey.current,
        loading,
        selectedCompartmentCount: selectedCompartmentIds.length,
        snapshotSource: snapshot.source,
    }), [backendState, discoveryRequestKey, loading, selectedCompartmentIds.length, snapshot.source])
    const summaryBadges = useMemo(() => {
        const freshnessBadge = buildDiscoveryFreshnessBadge(discoveryFreshness)
        const badges = buildDiscoverySummaryBadges(snapshot, summary, formatUsd(utilization.monthlyCostUsd))
        return freshnessBadge ? [...badges, freshnessBadge] : badges
    }, [discoveryFreshness, snapshot, summary, utilization.monthlyCostUsd])

    const invalidateActiveDiscoveryRequest = useCallback(() => {
        activeDiscoveryRequestKey.current = ''
    }, [])

    const applyContextSnapshot = useCallback((
        nextCompartments: OciModelResources.OciCompartment[] = compartments,
        nextSelectedCompartmentIds: string[] = selectedCompartmentIds,
    ) => {
        const contextSnapshot = mapCompartmentsToDiscoverySnapshot(nextCompartments, nextSelectedCompartmentIds)
        setSnapshot(contextSnapshot)
        setSnapshotResult(undefined)
    }, [compartments, selectedCompartmentIds])

    const runLiveDiscovery = useCallback((mode: 'manual' | 'auto' = 'manual') => {
        if (!liveDiscoveryEnabled) {
            setError('Live OCI discovery is unavailable for the current profile and region.')
            setStatus(snapshot.source === 'sample' ? 'Sample discovery data remains active' : 'Selected live context remains active')
            return
        }
        if (selectedCompartmentIds.length === 0) {
            applyContextSnapshot()
            setStatus('Select at least one compartment to query live OCI inventory')
            return
        }
        const requestKey = discoveryRequestKey
        lastAutoDiscoveryKey.current = requestKey
        activeDiscoveryRequestKey.current = requestKey
        setLoading(true)
        setError('')
        setStatus(mode === 'auto' ? 'Refreshing live OCI discovery from selected compartments' : 'Running live OCI discovery')
        OciApiFacade.queryDiscoverySnapshot(selectedProfile, selectedRegion, selectedCompartmentIds).then((result) => {
            if (!shouldApplyDiscoveryResponse({
                activeRequestKey: activeDiscoveryRequestKey.current,
                responseRequestKey: requestKey,
            })) return
            lastSuccessfulDiscoveryKey.current = requestKey
            setSnapshotResult(result)
            if (result.design) {
                setSnapshot(mapOciDesignToDiscoverySnapshot(result.design, { generatedAt: result.generatedAt }))
            } else {
                setSnapshot(mapCompartmentsToDiscoverySnapshot(compartments, selectedCompartmentIds, {
                    id: `oci-compartment-discovery-${result.generatedAt ?? new Date().toISOString()}`,
                    generatedAt: result.generatedAt ?? new Date().toISOString(),
                }))
            }
            setStatus(result.design ? `Live discovery loaded ${formatResourceCount(result)} OCI resources` : `Loaded ${compartments.length} compartments; select compartments and run again to build a design snapshot`)
        }).catch((reason) => {
            if (!shouldApplyDiscoveryResponse({
                activeRequestKey: activeDiscoveryRequestKey.current,
                responseRequestKey: requestKey,
            })) return
            setError(formatOciBackendError(reason))
            setStatus(snapshot.source === 'sample' ? 'Live OCI discovery failed; sample data remains available' : 'Live OCI discovery failed; selected live context remains available')
        }).finally(() => {
            if (!shouldApplyDiscoveryResponse({
                activeRequestKey: activeDiscoveryRequestKey.current,
                responseRequestKey: requestKey,
            })) return
            setLoading(false)
        })
    }, [
        applyContextSnapshot,
        compartments,
        liveDiscoveryEnabled,
        selectedCompartmentIds,
        selectedProfile,
        selectedRegion,
        discoveryRequestKey,
        snapshot.source,
    ])

    const loadProfileContext = (profile: string) => {
        activeProfileContextKey.current = profile
        setError('')
        setStatus(`Loading OCI context for profile ${profile}`)
        Promise.all([
            OciApiFacade.listRegions(profile),
            OciApiFacade.listTenancyCompartments(profile),
        ]).then(([nextRegions, nextCompartments]) => {
            if (!shouldApplyDiscoveryResponse({
                activeRequestKey: activeProfileContextKey.current,
                responseRequestKey: profile,
            })) return
            const homeRegion = nextRegions.find((region) => region.isHomeRegion)
            setRegions(nextRegions)
            setCompartments(nextCompartments)
            setSelectedRegion(homeRegion?.id ?? nextRegions[0]?.id ?? '')
            setSelectedCompartmentIds(nextCompartments[0]?.id ? [nextCompartments[0].id] : [])
            setSnapshot(mapCompartmentsToDiscoverySnapshot(nextCompartments, nextCompartments[0]?.id ? [nextCompartments[0].id] : []))
            setBackendState('available')
            setStatus(`Loaded ${nextCompartments.length} compartments for ${profile}`)
        }).catch((reason) => {
            if (!shouldApplyDiscoveryResponse({
                activeRequestKey: activeProfileContextKey.current,
                responseRequestKey: profile,
            })) return
            const backendUnavailable = isBackendUnavailableError(reason)
            setError(backendUnavailable ? '' : formatOciBackendError(reason))
            setStatus(backendUnavailable ? 'Sample dataset active; live backend unavailable' : 'Live OCI discovery unavailable; sample data remains loaded')
            setBackendState('unavailable')
            setRegions([])
            setCompartments([])
            setSelectedRegion('')
            setSelectedCompartmentIds([])
        })
    }

    useEffect(() => {
        OciApiFacade.loadOCIConfigProfileNames().then((nextProfiles) => {
            const nextProfile = nextProfiles[0] ?? 'DEFAULT'
            setProfiles(nextProfiles)
            setSelectedProfile(nextProfile)
            loadProfileContext(nextProfile)
        }).catch((reason) => {
            const backendUnavailable = isBackendUnavailableError(reason)
            setError(backendUnavailable ? '' : formatOciBackendError(reason))
            setStatus(backendUnavailable ? 'Sample dataset active; live backend unavailable' : 'Live OCI discovery unavailable; sample data remains loaded')
            setBackendState('unavailable')
            setRegions([])
            setCompartments([])
            setSelectedRegion('')
            setSelectedCompartmentIds([])
        })
    }, [])

    const onProfileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextProfile = event.target.value
        invalidateActiveDiscoveryRequest()
        setSelectedProfile(nextProfile)
        setSnapshotResult(undefined)
        loadProfileContext(nextProfile)
    }

    const onRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        invalidateActiveDiscoveryRequest()
        setSelectedRegion(event.target.value)
        applyContextSnapshot()
        setStatus('Region changed; live discovery will refresh selected compartments')
    }

    const onCompartmentToggle = (id: string, checked: boolean) => {
        invalidateActiveDiscoveryRequest()
        setSelectedCompartmentIds((current) => {
            const next = checked ? [...new Set([...current, id])] : current.filter((value) => value !== id)
            applyContextSnapshot(compartments, next)
            setStatus(next.length > 0 ? 'Compartment selection changed; live discovery will refresh' : 'Select at least one compartment to query live OCI inventory')
            return next
        })
    }

    useEffect(() => {
        if (!liveDiscoveryEnabled || loading || selectedCompartmentIds.length === 0) return
        if (lastAutoDiscoveryKey.current === discoveryRequestKey) return
        const timer = window.setTimeout(() => {
            lastAutoDiscoveryKey.current = discoveryRequestKey
            runLiveDiscovery('auto')
        }, 650)
        return () => window.clearTimeout(timer)
    }, [discoveryRequestKey, liveDiscoveryEnabled, loading, runLiveDiscovery, selectedCompartmentIds.length])

    const onCreateArchitecture = () => {
        const document = OcdDocument.clone(ocdDocument)
        document.design = snapshotResult?.design ?? buildDesignFromArchitecturePlan(buildArchitecturePlanFromDiscoverySnapshot(snapshot))
        document.design.userDefined.discovery = {
            source: snapshot.source,
            generatedAt: snapshot.generatedAt,
            prompt: buildDiscoveryArchitecturePrompt(snapshot),
        }
        document.autoLayout(document.getActivePage().id, true, ocdConsoleConfig.config.defaultAutoArrangeStyle ?? 'dynamic-columns')
        setOcdDocument(document)
        const nextConfig = OcdConsoleConfig.clone(ocdConsoleConfig)
        nextConfig.config.displayPage = 'designer'
        setOcdConsoleConfig(nextConfig)
    }

    const onSendToAgent = () => {
        const document = OcdDocument.clone(ocdDocument)
        document.design.userDefined.discoveryAgentPrompt = buildDiscoveryArchitecturePrompt(snapshot)
        document.design.userDefined.discoverySnapshotSummary = {
            source: snapshot.source,
            generatedAt: snapshot.generatedAt,
            applications: snapshot.applications.length,
            assets: snapshot.assets.length,
            services: snapshot.services.length,
            ociResources: snapshot.ociResources?.length ?? 0,
        }
        setOcdDocument(document)
        const nextConfig = OcdConsoleConfig.clone(ocdConsoleConfig)
        nextConfig.config.displayPage = 'agent'
        setOcdConsoleConfig(nextConfig)
    }

    return (
        <div className='ocd-discovery-page'>
            <header className='ocd-discovery-header'>
                <div>
                    <h1>OCI Discovery Workbench</h1>
                    <div className='ocd-discovery-kpis' aria-label='Discovery summary'>
                        {summaryBadges.map((badge) => (
                            <span className={badge.tone ? `ocd-discovery-kpi-${badge.tone}` : undefined} key={badge.id}>{badge.label}</span>
                        ))}
                    </div>
                </div>
                <div className='ocd-discovery-actions'>
                    <button disabled={loading || !liveDiscoveryEnabled} onClick={() => runLiveDiscovery('manual')} type='button'>Run Live Discovery</button>
                    <button onClick={onCreateArchitecture} type='button'>Create Architecture</button>
                    <button onClick={onSendToAgent} type='button'>Send to Agent</button>
                </div>
            </header>
            <section className='ocd-discovery-section' aria-label='Live discovery controls'>
                <div className='ocd-discovery-controls'>
                    <label>
                        Profile
                        <select disabled={liveControlsDisabled || profiles.length === 0} onChange={onProfileChange} value={selectedProfile}>
                            {(profiles.length > 0 ? profiles : [selectedProfile]).map((profile) => <option key={profile} value={profile}>{profile}</option>)}
                        </select>
                    </label>
                    <label>
                        Region
                        <select disabled={liveControlsDisabled || regions.length === 0} onChange={onRegionChange} value={selectedRegion}>
                            {regions.length > 0
                                ? regions.map((region) => <option key={region.id} value={region.id}>{region.displayName}</option>)
                                : <option value=''>{getDiscoveryRegionPlaceholder(backendState)}</option>}
                        </select>
                    </label>
                    <div className='ocd-discovery-compartment-list' aria-label='Discovery compartments'>
                        {compartments.length === 0 && <span className='ocd-discovery-empty-state'>{backendState === 'available' ? 'No compartments loaded' : 'Sample dataset active'}</span>}
                        {compartments.slice(0, 12).map((compartment) => (
                            <label key={compartment.id}>
                                <input
                                    checked={selectedCompartmentIds.includes(compartment.id)}
                                    disabled={liveControlsDisabled}
                                    onChange={(event) => onCompartmentToggle(compartment.id, event.target.checked)}
                                    type='checkbox'
                                />
                                {compartment.displayName || compartment.name}
                            </label>
                        ))}
                    </div>
                </div>
                <div className='ocd-discovery-status'>
                    <span>{status}</span>
                    {error && <span className='ocd-resource-manager-error'>{error}</span>}
                </div>
            </section>
            <nav className='ocd-discovery-tabs' aria-label='Discovery workbench views' role='tablist'>
                {discoveryTabs.map((tab) => (
                    <button
                        aria-controls={`ocd-discovery-panel-${tab.id}`}
                        aria-selected={activeTab === tab.id}
                        className={activeTab === tab.id ? 'active' : ''}
                        id={`ocd-discovery-tab-${tab.id}`}
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        role='tab'
                        type='button'
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            <div
                aria-labelledby={`ocd-discovery-tab-${activeTab}`}
                id={`ocd-discovery-panel-${activeTab}`}
                role='tabpanel'
            >
                {activeTab === 'inventory' && <OcdDiscoveryInventoryView snapshot={snapshot} />}
                {activeTab === 'topology' && <OcdDiscoveryTopologyView snapshot={snapshot} />}
                {activeTab === 'analytics' && <OcdDiscoveryAnalyticsView snapshot={snapshot} />}
                {activeTab === 'lz-mapping' && (
                    <OcdDiscoveryLzMappingView
                        backendAvailable={backendState === 'available'}
                        selectedCompartmentId={selectedCompartmentIds[0] ?? ''}
                        selectedProfile={selectedProfile}
                        selectedRegion={selectedRegion}
                        snapshot={snapshot}
                        targets={targets}
                    />
                )}
            </div>
        </div>
    )
}

export default OcdDiscovery
