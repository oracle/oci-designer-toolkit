import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LzAddonSourceHealth } from '@ocd/query'
import { OcdLogger } from '@ocd/core'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import {
    getOcdIntegrationSummary,
    ocdIntegrationCategories,
    ocdIntegrations,
    ocdIntegrationRuntimeLabels,
    ocdIntegrationStatusLabels,
    type OcdIntegrationCategory,
    type OcdIntegrationDefinition,
    type OcdIntegrationDisplayPage,
    type OcdIntegrationHealthCheck,
} from '../integrations/OcdIntegrationRegistry'
import { OciApiFacade } from '../facade/OciApiFacade'
import { LzUpdateStatus } from '../landingzone/OcdLzUpdateCheck'
import { describeLzAddonUpdateJob, runLandingZoneAddonUpdateJob } from '../landingzone/OcdLzUpdateJobClient'
import { useLzUpdateCheck } from '../landingzone/useLzUpdateCheck'
import { ConsolePageProps } from '../types/Console'

const logger = OcdLogger.scope('OcdIntegrations')

const categoryOrder: readonly OcdIntegrationCategory[] = ['architecture-source', 'terraform', 'discovery', 'ai', 'governance']
type ActionState = { kind: 'idle' | 'running' | 'success' | 'error'; message: string }
type ActionStateMap = Record<string, ActionState>
type BackendState = 'checking' | 'available' | 'unavailable'
type HealthState = 'checking' | 'healthy' | 'warning' | 'unavailable' | 'info'
type HealthBadge = { id: string; label: string; state: HealthState; message: string }

const actionKey = (integrationId: string, actionId: string): string => `${integrationId}:${actionId}`

const sourceStatusMessage = (status: LzUpdateStatus): { state: HealthState; message: string } => {
    if (status.unavailable) return { state: 'warning', message: 'Private or unreachable source.' }
    if (status.error) return { state: 'warning', message: status.error }
    if (status.updateAvailable) return { state: 'warning', message: `Update available: ${status.latestShort}` }
    if (status.latestShort) return { state: 'healthy', message: `Latest checked: ${status.latestShort}` }
    return { state: 'info', message: 'Source status is informational.' }
}

const addonHealthMessage = (
    health: LzAddonSourceHealth | undefined,
    status: LzUpdateStatus | undefined,
): { state: HealthState; message: string } => {
    if (status?.updateAvailable) return { state: 'warning', message: `Update available: ${status.latestShort}` }
    if (health?.state === 'missing') return { state: 'warning', message: 'Installable project add-on is not installed locally.' }
    if (health?.state === 'installed') {
        return status?.unavailable
            ? { state: 'warning', message: 'Installed locally; upstream status is private or unreachable.' }
            : { state: 'healthy', message: `Installed locally${health.localSubdir ? `: ${health.localSubdir}` : '.'}` }
    }
    if (status?.error || status?.unavailable) return sourceStatusMessage(status)
    if (health?.state === 'not-installable') return { state: 'info', message: 'Reference source; no local checkout required.' }
    if (status) return sourceStatusMessage(status)
    return { state: 'info', message: 'Source status is informational.' }
}

const buildHealthBadges = ({
    backendState,
    checks,
    integration,
    sourceHealth,
    sourceHealthLoading,
    sourceLoading,
    sourceStatuses,
}: {
    backendState: BackendState
    checks: readonly OcdIntegrationHealthCheck[]
    integration: OcdIntegrationDefinition
    sourceHealth: readonly LzAddonSourceHealth[]
    sourceHealthLoading: boolean
    sourceLoading: boolean
    sourceStatuses: readonly LzUpdateStatus[]
}): HealthBadge[] => checks.map((check) => {
    if (check.kind === 'backend') {
        if (backendState === 'checking') return { id: check.id, label: check.label, state: 'checking', message: 'Checking backend.' }
        if (backendState === 'available') return { id: check.id, label: check.label, state: 'healthy', message: 'Backend reachable.' }
        return {
            id: check.id,
            label: check.label,
            state: check.required ? 'unavailable' : 'warning',
            message: 'Start the desktop app or local OCD web server.',
        }
    }
    if (check.kind === 'source-status') {
        if (!integration.sourceKey) return { id: check.id, label: check.label, state: 'info', message: 'No tracked source.' }
        const health = sourceHealth.find((candidate) => candidate.sourceKey === integration.sourceKey)
        const status = sourceStatuses.find((candidate) => candidate.key === integration.sourceKey)
        if (!health && !status && (sourceHealthLoading || sourceLoading)) {
            return { id: check.id, label: check.label, state: 'checking', message: 'Checking source status.' }
        }
        if (!health && !status) return { id: check.id, label: check.label, state: 'info', message: 'Source not listed in update manifest.' }
        return { id: check.id, label: check.label, ...addonHealthMessage(health, status) }
    }
    if (check.kind === 'configuration') {
        return integration.status === 'needs-config'
            ? { id: check.id, label: check.label, state: check.required ? 'warning' : 'info', message: 'Configuration required before live use.' }
            : { id: check.id, label: check.label, state: 'healthy', message: 'Configuration path is available.' }
    }
    return { id: check.id, label: check.label, state: 'healthy', message: 'Runs locally without backend prerequisites.' }
})

const OcdIntegrationCard = ({
    integration,
    actionStates,
    healthBadges,
    openPage,
    updateSource,
}: {
    integration: OcdIntegrationDefinition
    actionStates: ActionStateMap
    healthBadges: readonly HealthBadge[]
    openPage: (displayPage: OcdIntegrationDisplayPage) => void
    updateSource: (integration: OcdIntegrationDefinition, actionId: string) => void
}): JSX.Element => (
    <article className={`ocd-integration-card ocd-integration-card-${integration.status}`}>
        <div className='ocd-integration-card-header'>
            <div>
                <span className='ocd-integration-vendor'>{integration.vendor}</span>
                <h3>{integration.name}</h3>
            </div>
            <span className='ocd-integration-status'>{ocdIntegrationStatusLabels[integration.status]}</span>
        </div>
        <p>{integration.summary}</p>
        <div className='ocd-integration-meta'>
            <span>{ocdIntegrationCategories[integration.category]}</span>
            <span>{ocdIntegrationRuntimeLabels[integration.runtime]}</span>
        </div>
        <div className='ocd-integration-capabilities'>
            {integration.capabilities.map((capability) => <span key={capability}>{capability}</span>)}
        </div>
        <div className='ocd-integration-health' aria-label={`${integration.name} readiness`}>
            {healthBadges.map((badge) => (
                <span
                    className={`ocd-integration-health-badge ocd-integration-health-${badge.state}`}
                    key={badge.id}
                    title={badge.message}
                >
                    {badge.label}
                </span>
            ))}
        </div>
        <div className='ocd-integration-actions'>
            {integration.actions.map((action) => {
                const state = actionStates[actionKey(integration.id, action.id)]
                if (action.kind === 'update-source') {
                    return (
                        <button
                            className='ocd-integration-action-secondary'
                            disabled={state?.kind === 'running' || !integration.sourceKey}
                            key={action.id}
                            onClick={() => updateSource(integration, action.id)}
                            type='button'
                        >
                            {state?.kind === 'running' ? 'Updating...' : action.label}
                        </button>
                    )
                }
                const displayPage = action.displayPage
                if (displayPage) {
                    return (
                        <button key={action.id} type='button' onClick={() => openPage(displayPage)}>
                            {action.label}
                        </button>
                    )
                }
                return action.href ? <a key={action.id} href={action.href} target='_blank' rel='noreferrer'>{action.label}</a> : null
            })}
        </div>
        {integration.actions.map((action) => {
            const state = actionStates[actionKey(integration.id, action.id)]
            return state && state.kind !== 'idle'
                ? <p className={`ocd-integration-action-message ocd-integration-action-message-${state.kind}`} key={`${action.id}-message`}>{state.message}</p>
                : null
        })}
    </article>
)

const OcdIntegrations = ({ ocdConsoleConfig, setOcdConsoleConfig }: ConsolePageProps): JSX.Element => {
    const [activeCategory, setActiveCategory] = useState<OcdIntegrationCategory | 'all'>('all')
    const [actionStates, setActionStates] = useState<ActionStateMap>({})
    const [backendState, setBackendState] = useState<BackendState>('checking')
    const [sourceHealth, setSourceHealth] = useState<readonly LzAddonSourceHealth[]>([])
    const [sourceHealthLoading, setSourceHealthLoading] = useState(false)
    const { statuses: sourceStatuses, loading: sourceLoading, refresh: refreshSourceStatuses } = useLzUpdateCheck()
    const summary = useMemo(() => getOcdIntegrationSummary(), [])
    const integrations = useMemo(
        () => activeCategory === 'all'
            ? [...ocdIntegrations]
            : ocdIntegrations.filter((integration) => integration.category === activeCategory),
        [activeCategory]
    )
    const healthByIntegrationId = useMemo(
        () => Object.fromEntries(ocdIntegrations.map((integration) => [
            integration.id,
            buildHealthBadges({
                backendState,
                checks: integration.healthChecks,
                integration,
                sourceHealth,
                sourceHealthLoading,
                sourceLoading,
                sourceStatuses,
            }),
        ])) as Record<string, HealthBadge[]>,
        [backendState, sourceHealth, sourceHealthLoading, sourceLoading, sourceStatuses],
    )
    const refreshSourceHealth = useCallback(() => {
        setSourceHealthLoading(true)
        return OciApiFacade.listLandingZoneAddonHealth()
            .then((health) => setSourceHealth(health))
            .catch((error) => {
                logger.warn('Landing Zone add-on health check failed; falling back to empty status', error)
                setSourceHealth([])
            })
            .finally(() => setSourceHealthLoading(false))
    }, [])
    useEffect(() => {
        let cancelled = false
        OciApiFacade.checkBackendAvailability()
            .then((available) => {
                if (!cancelled) setBackendState(available ? 'available' : 'unavailable')
            })
            .catch(() => {
                if (!cancelled) setBackendState('unavailable')
            })
        return () => {
            cancelled = true
        }
    }, [])
    useEffect(() => {
        if (backendState !== 'available') {
            setSourceHealth([])
            setSourceHealthLoading(false)
            return
        }
        refreshSourceHealth()
    }, [backendState, refreshSourceHealth])
    const openPage = (displayPage: OcdIntegrationDisplayPage) => {
        const nextConfig = OcdConsoleConfig.clone(ocdConsoleConfig)
        nextConfig.config.displayPage = displayPage
        setOcdConsoleConfig(nextConfig)
    }
    const setActionState = (integrationId: string, actionId: string, state: ActionState) => {
        setActionStates((current) => ({ ...current, [actionKey(integrationId, actionId)]: state }))
    }
    const updateSource = (integration: OcdIntegrationDefinition, actionId: string) => {
        if (!integration.sourceKey) {
            setActionState(integration.id, actionId, { kind: 'error', message: 'This integration does not declare an updateable source.' })
            return
        }
        setActionState(integration.id, actionId, { kind: 'running', message: 'Queued backend update job...' })
        runLandingZoneAddonUpdateJob(integration.sourceKey, undefined, (job) => {
            setActionState(integration.id, actionId, {
                kind: job.state === 'failed' || job.state === 'cancelled' ? 'error' : 'running',
                message: describeLzAddonUpdateJob(job),
            })
        })
            .then((result) => {
                if (result.state !== 'succeeded') throw new Error(result.error ?? describeLzAddonUpdateJob(result))
                setActionState(integration.id, actionId, {
                    kind: 'success',
                    message: `Updated with ${result.command}`,
                })
                refreshSourceStatuses(true)
                refreshSourceHealth()
            })
            .catch((error) => {
                setActionState(integration.id, actionId, {
                    kind: 'error',
                    message: error instanceof Error ? error.message : 'Source update failed.',
                })
            })
    }

    return (
        <div className='ocd-integrations-page'>
            <header className='ocd-integrations-header'>
                <div>
                    <span className='ocd-redwood-kicker'>Oracle Designer Toolkit</span>
                    <h1>Integration Hub</h1>
                    <p>Manage architecture sources, deployment bridges, discovery, and agent integrations from one modular workspace.</p>
                </div>
                <div className='ocd-integrations-summary' aria-label='Integration summary'>
                    <article>
                        <span>Total</span>
                        <strong>{summary.total}</strong>
                    </article>
                    <article>
                        <span>Configured</span>
                        <strong>{summary.configured}</strong>
                    </article>
                    <article>
                        <span>Need config</span>
                        <strong>{summary.needsConfig}</strong>
                    </article>
                    <article>
                        <span>Backend</span>
                        <strong>{summary.localBackend}</strong>
                    </article>
                </div>
            </header>
            <div className='ocd-integrations-tabs' aria-label='Integration categories'>
                <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')} type='button'>All</button>
                {categoryOrder.map((category) => (
                    <button
                        className={activeCategory === category ? 'active' : ''}
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        type='button'
                    >
                        {ocdIntegrationCategories[category]}
                    </button>
                ))}
            </div>
            <section className='ocd-integrations-grid' aria-label='Available integrations'>
                {integrations.map((integration) => (
                    <OcdIntegrationCard
                        actionStates={actionStates}
                        healthBadges={healthByIntegrationId[integration.id] ?? []}
                        integration={integration}
                        key={integration.id}
                        openPage={openPage}
                        updateSource={updateSource}
                    />
                ))}
            </section>
        </div>
    )
}

export default OcdIntegrations
