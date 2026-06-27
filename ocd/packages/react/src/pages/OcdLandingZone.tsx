/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Landing Zone Next Gen (LZNG) wizard page. A modern, self-styled, 5-step product
** shell rendered inside the OCD console body:
**
**   - dark OCI header bar with layout toggles (LzngHeader)
**   - editable title + Save draft / Debug / Sources / Download .drawio /
**     Download JSON / Reset actions
**   - clickable 5-step stepper (LzngStepper)
**   - two-column body: left = step content (Back/Continue footer), right = a
**     live React-Flow Network Diagram built directly from config — NO jsonnet
**     run per step. The full generated IAM diagram is shown only on the Review
**     step (LzngIamDiagram).
**   - a Debug slide-over drawer (LzngDebugDrawer) showing config.jsonnet
**
** The page is theme-independent: all styling lives in css/ocd-lzng.css scoped
** under `.ocd-lzng` (the outer div here), with the Oracle Redwood tokens defined
** in that scope. It does NOT depend on the redwood-ng console theme.
**
** Phase 2 wires every step to the Operating Entities config schema:
**   1 Foundation        -> region/realm + environments + security_targets
**   2 Hub Network       -> hub.kind + hub.network.vcn
**   3 Projects          -> environments.<env>.shared_project_network + projects
**   4 Platform Templates-> environments.<env>.platforms.<name>.extension
**   5 Review            -> generate iam/network/... JSON, IAM compartment diagram,
**                          per-file + tar downloads, read-only config.jsonnet
**
** Download JSON runs the jsonnet OE generation and gracefully reports the
** setup-lz notice if the OE sources are absent.
*/

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ConsolePageProps } from '../types/Console'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import { OcdDocument } from '../components/OcdDocument'
import { WizardProvider, useWizard, consumeWizardSeed } from '../landingzone/OcdLzWizardContext'
import { downloadTar, downloadTextFile } from '../landingzone/OcdLzDownloads'
import { GeneratedFile, generateLandingZone } from '../landingzone/OcdLzGenerator'
import { buildOcdDesignFromLz } from '../landingzone/OcdLzToModel'
import { reconcileLzScaffold } from '../landingzone/OcdLzScaffold'
import { LZ_SCAFFOLD_ENABLED_KEY } from '../landingzone/OcdLzReconcile'
import { applyObservabilityOverlay, LZ_OBSERVABILITY_ENABLED_KEY } from '../landingzone/OcdLzObservability'
import { applyOkeNativeOverlay, LZ_OKE_NATIVE_ENABLED_KEY } from '../landingzone/OcdLzOke'
import { applyCrossTenancyHubSpokeOverlay, LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY } from '../landingzone/OcdLzCrossTenancyHubSpoke'
import {
    DEFAULT_CONFIG,
    LandingZoneConfig,
    isStepValid,
    normalizeConfig,
    serializeLandingZoneConfig,
    upgradeConfig,
    validateConfig,
} from '../landingzone/OcdLzConfig'
import { LzngHeader, LzngLayout } from '../landingzone/ui/LzngHeader'
import { LZNG_STEPS, LzngStepper } from '../landingzone/ui/LzngStepper'
import { LzngFoundationStep } from '../landingzone/ui/LzngFoundationStep'
import { LzngHubStep } from '../landingzone/ui/LzngHubStep'
import { LzngProjectsStep } from '../landingzone/ui/LzngProjectsStep'
import { LzngTemplatesStep } from '../landingzone/ui/LzngTemplatesStep'
import { LzngReviewStep } from '../landingzone/ui/LzngReviewStep'
import { LzngNetworkDiagram } from '../landingzone/ui/LzngNetworkDiagram'
import { LzngPreviewDiagram, LzngPreviewFocus } from '../landingzone/ui/LzngPreviewDiagram'
import { LzngStepFooter } from '../landingzone/ui/LzngStepFooter'
import { LzngDebugDrawer } from '../landingzone/ui/LzngDebugDrawer'
import { buildDiagramModel } from '../landingzone/ui/LzngDiagramModel'
import { buildDrawioXml } from '../landingzone/ui/LzngDrawioExport'
import { LzngUpdateBanner } from '../landingzone/ui/LzngUpdateBanner'
import { LzngEngineBanner } from '../landingzone/ui/LzngEngineBanner'
import { probeJsonnetEngine } from '../landingzone/OcdJsonnetWasm'
import { LzngSourcesPanel } from '../landingzone/ui/LzngSourcesPanel'
import { useLzUpdateCheck } from '../landingzone/useLzUpdateCheck'
import { useUpstreamFeatureCheck } from '../upstream/useUpstreamFeatureCheck'
import { OciApiFacade } from '../facade/OciApiFacade'

const SETUP_NOTICE = 'Run `npm run setup-lz` to enable Landing Zone generation.'
const DEFAULT_TITLE = 'Untitled Landing Zone'

function slugify(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'landing-zone'
}

function friendlyError(message: string): string {
    return /bundled|setup-lz|not installed|not found|undefined/i.test(message) ? SETUP_NOTICE : message
}

interface WizardBodyProps {
    onExit: () => void
    onOpenInDesigner: (title: string, files: GeneratedFile[], config: LandingZoneConfig, scaffoldEnabled: boolean, observabilityEnabled: boolean, okeNativeEnabled: boolean, crossTenancyEnabled: boolean) => void
}

function WizardBody({ onExit, onOpenInDesigner }: WizardBodyProps): JSX.Element {
    const { data, reset, setField } = useWizard()
    const [config, setConfig] = useState<LandingZoneConfig>(() => upgradeConfig(data.config ?? data.step1))
    const [scaffoldEnabled, setScaffoldEnabled] = useState<boolean>(() => Boolean(data.scaffoldEnabled))
    const [observabilityEnabled, setObservabilityEnabled] = useState<boolean>(() => Boolean(data.observabilityEnabled))
    const [okeNativeEnabled, setOkeNativeEnabled] = useState<boolean>(() => Boolean(data.okeNativeEnabled))
    const [crossTenancyEnabled, setCrossTenancyEnabled] = useState<boolean>(() => Boolean(data.crossTenancyEnabled))
    const [title, setTitle] = useState<string>(() => (typeof data.title === 'string' && data.title ? data.title : DEFAULT_TITLE))
    const [editingTitle, setEditingTitle] = useState(false)
    const [layout, setLayout] = useState<LzngLayout>('split')
    const [activeStep, setActiveStep] = useState(0)
    const [diagramCollapsed, setDiagramCollapsed] = useState(false)
    const [notice, setNotice] = useState<{ kind: 'info' | 'error'; text: string } | null>(null)
    const [busy, setBusy] = useState(false)
    const [githubToken, setGithubToken] = useState('')
    const [sourcePinnedRefs, setSourcePinnedRefs] = useState<Record<string, string>>({})
    const { statuses, loading: updatesLoading, anyUpdate, refresh: refreshUpdates } = useLzUpdateCheck(undefined, {
        githubToken,
        pinnedRefs: sourcePinnedRefs,
    })
    const { status: upstreamStatus, hasNewFeatures: hasNewUpstreamFeatures } = useUpstreamFeatureCheck()
    const [bannerDismissed, setBannerDismissed] = useState(false)
    const [showSources, setShowSources] = useState(false)
    const [showDebug, setShowDebug] = useState(false)
    const [engineError, setEngineError] = useState<string | null>(null)
    const [engineBannerDismissed, setEngineBannerDismissed] = useState(false)
    const refreshBackendSourcePins = useCallback(async () => {
        try {
            const health = await OciApiFacade.listLandingZoneAddonHealth()
            setSourcePinnedRefs(Object.fromEntries(health
                .filter((source) => source.pinnedRef)
                .map((source) => [source.sourceKey, source.pinnedRef])))
        } catch {
            setSourcePinnedRefs({})
        }
    }, [])

    // Mount-time jsonnet engine health probe: if libjsonnet.wasm cannot be
    // loaded/instantiated, surface a dismissible banner instead of letting the
    // page fail silently on first generate/preview.
    useEffect(() => {
        let cancelled = false
        probeJsonnetEngine()
            .then((probe) => {
                if (!cancelled && !probe.available) setEngineError(probe.error ?? 'Unknown WASM load failure.')
            })
            .catch((err: unknown) => {
                // probeJsonnetEngine never rejects by contract; belt-and-braces.
                if (!cancelled) setEngineError(err instanceof Error ? err.message : String(err))
            })
        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        void refreshBackendSourcePins()
    }, [refreshBackendSourcePins])

    const validation = useMemo(() => validateConfig(config), [config])
    const serializedConfig = useMemo(
        () => (validation.errors.length === 0 ? serializeLandingZoneConfig(config) : validation.errors.join('\n')),
        [config, validation],
    )
    const stepCanContinue = useMemo(() => isStepValid(activeStep, config), [activeStep, config])

    function saveDraft(): void {
        // The context auto-persists on every setField, but Save draft is an
        // explicit, user-visible action: re-commit config + title and confirm.
        setField('config', config)
        setField('title', title)
        setField('scaffoldEnabled', scaffoldEnabled)
        setField('observabilityEnabled', observabilityEnabled)
        setField('okeNativeEnabled', okeNativeEnabled)
        setField('crossTenancyEnabled', crossTenancyEnabled)
        setNotice({ kind: 'info', text: 'Draft saved.' })
    }

    function toggleScaffold(): void {
        const next = !scaffoldEnabled
        setScaffoldEnabled(next)
        // Persist immediately so the tick survives draft saves / reloads.
        setField('scaffoldEnabled', next)
    }

    function toggleObservability(): void {
        const next = !observabilityEnabled
        setObservabilityEnabled(next)
        setField('observabilityEnabled', next)
    }

    function toggleOkeNative(): void {
        const next = !okeNativeEnabled
        setOkeNativeEnabled(next)
        setField('okeNativeEnabled', next)
    }

    function toggleCrossTenancy(): void {
        const next = !crossTenancyEnabled
        setCrossTenancyEnabled(next)
        setField('crossTenancyEnabled', next)
    }

    function commitConfig(next: LandingZoneConfig): void {
        const normalized = normalizeConfig(next)
        setConfig(normalized)
        setField('config', normalized)
        setNotice(null)
    }

    function commitTitle(next: string): void {
        const value = next.trim() || DEFAULT_TITLE
        setTitle(value)
        setField('title', value)
        setEditingTitle(false)
    }

    function resetWizard(): void {
        if (!window.confirm('Reset the wizard back to defaults?')) return
        reset()
        setConfig(normalizeConfig(DEFAULT_CONFIG))
        setScaffoldEnabled(false)
        setObservabilityEnabled(false)
        setOkeNativeEnabled(false)
        setTitle(DEFAULT_TITLE)
        setActiveStep(0)
        setNotice(null)
    }

    async function downloadJson(): Promise<void> {
        if (validation.errors.length > 0) {
            setNotice({ kind: 'error', text: validation.errors.join(' ') })
            return
        }
        setBusy(true)
        setNotice(null)
        try {
            const generated = await generateLandingZone(validation.value)
            setField('config', validation.value)
            downloadTar(`${slugify(title)}-landing-zone.tar`, [
                { name: 'config.jsonnet', content: generated.configJsonnet },
                ...generated.files,
            ])
            downloadTextFile(`${slugify(title)}-config.json`, JSON.stringify(validation.value, null, 2) + '\n')
            setNotice({ kind: 'info', text: `Generated ${generated.files.length} Operating Entities JSON file(s).` })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            setNotice({ kind: 'error', text: friendlyError(message) })
        } finally {
            setBusy(false)
        }
    }

    function downloadDrawio(): void {
        const model = buildDiagramModel(config)
        downloadTextFile(`${slugify(title)}.drawio`, buildDrawioXml(model))
    }

    const isReview = activeStep === LZNG_STEPS.length - 1
    // The Review step renders the full generated IAM diagram in its own (left)
    // column, so the structural preview panel only applies to steps 1-4.
    // On Review, always render the left column (it carries the full generated
    // diagram + downloads), regardless of the split/list/diagram layout toggle.
    const showLeft = isReview || layout === 'split' || layout === 'list'
    const showRight = (layout === 'split' || layout === 'diagram') && !isReview

    // The structural compartment preview annotates a different subset per step
    // (Foundation → canonical structure, Hub → network compartment, Projects →
    // project compartments, Templates → platform compartments). Steps beyond
    // Templates (i.e. Review) fall back to 'foundation' but Review never renders
    // the right column anyway (showRight is false there).
    const PREVIEW_FOCUS: LzngPreviewFocus[] = ['foundation', 'hub', 'projects', 'templates']
    const previewFocus: LzngPreviewFocus = PREVIEW_FOCUS[activeStep] ?? 'foundation'

    function goToStep(index: number): void {
        setActiveStep(Math.max(0, Math.min(LZNG_STEPS.length - 1, index)))
        setNotice(null)
    }

    function renderLeft(): JSX.Element {
        switch (activeStep) {
            case 0:
                return <LzngFoundationStep config={config} onChange={commitConfig} />
            case 1:
                return <LzngHubStep config={config} onChange={commitConfig} />
            case 2:
                return <LzngProjectsStep config={config} onChange={commitConfig} />
            case 3:
                return <LzngTemplatesStep config={config} onChange={commitConfig} />
            case 4:
            default:
                return (
                    <LzngReviewStep
                        config={config}
                        title={title}
                        onError={(message) => setNotice({ kind: 'error', text: friendlyError(message) })}
                        onOpenInDesigner={(files) => onOpenInDesigner(title, files, config, scaffoldEnabled, observabilityEnabled, okeNativeEnabled, crossTenancyEnabled)}
                    />
                )
        }
    }

    return (
        <div className='ocd-lzng' data-testid='lzng-wizard'>
            <LzngHeader layout={layout} onLayoutChange={setLayout} onExit={onExit} />

            {engineError !== null && !engineBannerDismissed && (
                <LzngEngineBanner error={engineError} onDismiss={() => setEngineBannerDismissed(true)} />
            )}

            {(anyUpdate || hasNewUpstreamFeatures) && !bannerDismissed && (
                <LzngUpdateBanner
                    statuses={statuses}
                    onDismiss={() => setBannerDismissed(true)}
                    onOpenPanel={() => setShowSources(true)}
                    onRefresh={() => refreshUpdates(true)}
                    upstreamStatus={upstreamStatus}
                    hasNewUpstreamFeatures={hasNewUpstreamFeatures}
                />
            )}

            <div className='ocd-lzng-scroll'>
                <div className='ocd-lzng-titlerow'>
                    <div>
                        {editingTitle ? (
                            <input
                                aria-label='Landing zone name'
                                className='ocd-lzng-title-input'
                                autoFocus
                                defaultValue={title}
                                onBlur={(event) => commitTitle(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') commitTitle((event.target as HTMLInputElement).value)
                                    if (event.key === 'Escape') setEditingTitle(false)
                                }}
                            />
                        ) : (
                            <button type='button' className='ocd-lzng-title' onClick={() => setEditingTitle(true)}>
                                {title}
                            </button>
                        )}
                        <p className='ocd-lzng-subtitle'>
                            Step {activeStep + 1} of {LZNG_STEPS.length} — {LZNG_STEPS[activeStep].label}. The preview and JSON build up as you go.
                        </p>
                    </div>
                    <div className='ocd-lzng-titlerow-actions'>
                        <label className='ocd-lzng-scaffold-toggle' title='When ticked, opening in the Designer builds a Realm > Region > AD > FD scaffold and keeps it in sync (idempotent reconcile).'>
                            <input
                                type='checkbox'
                                checked={scaffoldEnabled}
                                onChange={toggleScaffold}
                            />
                            <span>Realm/AD/FD scaffold</span>
                        </label>
                        <label className='ocd-lzng-scaffold-toggle' title='When ticked, opening in the Designer adds a Database Observability topology (DBM + OPSI private endpoints, Database Insight, Management Agent).'>
                            <input
                                type='checkbox'
                                checked={observabilityEnabled}
                                onChange={toggleObservability}
                            />
                            <span>DB Observability</span>
                        </label>
                        <label className='ocd-lzng-scaffold-toggle' title='When ticked, opening in the Designer adds an OKE-native topology (VCN-native CNI pod subnet, enhanced cluster, Workload Identity dynamic group + policy, NSG, Vault + Key).'>
                            <input
                                type='checkbox'
                                checked={okeNativeEnabled}
                                onChange={toggleOkeNative}
                            />
                            <span>OKE Native</span>
                        </label>
                        <label className='ocd-lzng-scaffold-toggle' title='When ticked, opening in the Designer adds a best-practice cross-tenancy hub-spoke topology (per-tenancy DRG + Remote Peering Connection naming the peer tenancy, non-overlapping CIDRs, DRG attachments) — for connecting two OCI tenancies.'>
                            <input
                                type='checkbox'
                                checked={crossTenancyEnabled}
                                onChange={toggleCrossTenancy}
                            />
                            <span>Cross-Tenancy</span>
                        </label>
                        <span className='ocd-lzng-action-sep' aria-hidden />
                        <button type='button' className='ocd-lzng-btn ocd-lzng-btn-primary' onClick={saveDraft}>
                            Save draft
                        </button>
                        <button
                            type='button'
                            className='ocd-lzng-btn'
                            aria-pressed={showDebug}
                            onClick={() => setShowDebug(true)}
                        >
                            Debug
                        </button>
                        <span className='ocd-lzng-action-sep' aria-hidden />
                        <button
                            type='button'
                            className='ocd-lzng-btn'
                            aria-pressed={showSources}
                            onClick={() => setShowSources((value) => !value)}
                        >
                            Sources &amp; Updates{anyUpdate ? ' •' : ''}
                        </button>
                        <button type='button' className='ocd-lzng-btn' onClick={downloadDrawio}>Download .drawio</button>
                        <button type='button' className='ocd-lzng-btn' disabled={busy} onClick={downloadJson}>
                            {busy ? 'Generating…' : 'Download JSON'}
                        </button>
                        <button type='button' className='ocd-lzng-btn' onClick={resetWizard}>Reset</button>
                    </div>
                </div>

                <LzngStepper activeIndex={activeStep} onSelect={goToStep} />

                {showSources && (
                    <LzngSourcesPanel
                        statuses={statuses}
                        loading={updatesLoading}
                        onRefresh={() => refreshUpdates(true)}
                        githubTokenConfigured={githubToken.trim() !== ''}
                        githubToken={githubToken}
                        onGithubTokenChange={(token) => {
                            setGithubToken(token)
                        }}
                        onSourceUpdated={(sourceKey, pinnedRef) => {
                            if (pinnedRef) {
                                setSourcePinnedRefs((current) => ({ ...current, [sourceKey]: pinnedRef }))
                            }
                            void refreshBackendSourcePins()
                        }}
                        onClose={() => setShowSources(false)}
                    />
                )}

                <div className='ocd-lzng-body' data-layout={layout}>
                    {showLeft && (
                        <div className='ocd-lzng-col-left'>
                            {renderLeft()}

                            {notice && (
                                <div className={`ocd-lzng-notice${notice.kind === 'info' ? ' ocd-lzng-notice-info' : ''}`}>
                                    {notice.text === SETUP_NOTICE ? (
                                        <span>Run <code>npm run setup-lz</code> to enable Landing Zone generation.</span>
                                    ) : (
                                        notice.text
                                    )}
                                </div>
                            )}

                            <LzngStepFooter
                                isFirst={activeStep === 0}
                                isLast={isReview}
                                canContinue={stepCanContinue}
                                onBack={() => goToStep(activeStep - 1)}
                                onContinue={() => goToStep(activeStep + 1)}
                            />
                        </div>
                    )}

                    {showRight && (
                        <div className='ocd-lzng-col-right'>
                            {layout === 'split' && diagramCollapsed ? (
                                <button
                                    type='button'
                                    className='ocd-lzng-diagram-rail'
                                    title='Show network diagram'
                                    aria-label='Show network diagram'
                                    onClick={() => setDiagramCollapsed(false)}
                                >
                                    <span className='ocd-lzng-diagram-rail-chevron' aria-hidden>‹</span>
                                    <span className='ocd-lzng-diagram-rail-label'>Network Diagram</span>
                                </button>
                            ) : (
                                <>
                                    <section className='ocd-lzng-card ocd-lzng-diagram-card'>
                                        <div className='ocd-lzng-card-head'>
                                            <h2 className='ocd-lzng-card-title'>Compartment Structure</h2>
                                            {layout === 'split' && (
                                                <button
                                                    type='button'
                                                    className='ocd-lzng-btn'
                                                    title='Collapse to the side'
                                                    onClick={() => setDiagramCollapsed(true)}
                                                >
                                                    Collapse ›
                                                </button>
                                            )}
                                        </div>
                                        <div className='ocd-lzng-prev-canvas'>
                                            <LzngPreviewDiagram config={config} focus={previewFocus} />
                                        </div>
                                    </section>
                                    <section className='ocd-lzng-card ocd-lzng-diagram-card'>
                                        <div className='ocd-lzng-card-head'>
                                            <h2 className='ocd-lzng-card-title'>Network Diagram</h2>
                                        </div>
                                        <div className='ocd-lzng-diagram-canvas'>
                                            <LzngNetworkDiagram config={config} />
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <LzngDebugDrawer open={showDebug} content={serializedConfig} onClose={() => setShowDebug(false)} />
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OcdLandingZone = ({ ocdDocument, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig }: ConsolePageProps): JSX.Element => {
    const switchToDesigner = (): void => {
        ocdConsoleConfig.config.displayPage = 'designer'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }

    const onExit = () => switchToDesigner()

    // Translate the generated OE files into an editable OCD design, set it as the
    // active document, and switch the console to the Designer page. The wizard
    // config is persisted into the design (design.userDefined.lzConfig) so the
    // idempotent scaffold reconcile has a source of truth that survives saves.
    const onOpenInDesigner = (title: string, files: GeneratedFile[], config: LandingZoneConfig, scaffoldEnabled: boolean, observabilityEnabled: boolean, okeNativeEnabled: boolean, crossTenancyEnabled: boolean): void => {
        const { design, topCompartmentIds } = buildOcdDesignFromLz(files, title, config)
        // Record the wizard ticks on the design so the designer-side toggles and
        // idempotent overlays know they apply.
        design.userDefined[LZ_SCAFFOLD_ENABLED_KEY] = scaffoldEnabled
        design.userDefined[LZ_OBSERVABILITY_ENABLED_KEY] = observabilityEnabled
        design.userDefined[LZ_OKE_NATIVE_ENABLED_KEY] = okeNativeEnabled
        design.userDefined[LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY] = crossTenancyEnabled
        const document = OcdDocument.new()
        document.design = design
        // Add one layer per top-level compartment (first selected), mirroring the
        // Terraform import flow.
        const layerIds = topCompartmentIds.length > 0 ? topCompartmentIds : [design.model.oci.resources.compartment?.[0]?.id].filter(Boolean)
        layerIds.forEach((id: string, index: number) => document.addLayer(id, index === 0))
        // Apply the resource-adding overlays BEFORE autoLayout so the resources
        // they introduce (DBM/OPSI, OKE) get laid out on the canvas. Each is a
        // pure, idempotent no-op when its tick is off.
        if (observabilityEnabled) {
            document.design = applyObservabilityOverlay(document.design)
        }
        if (okeNativeEnabled) {
            document.design = applyOkeNativeOverlay(document.design)
        }
        if (crossTenancyEnabled) {
            document.design = applyCrossTenancyHubSpokeOverlay(document.design)
        }
        document.autoLayout(document.getActivePage().id, true, ocdConsoleConfig.config.defaultAutoArrangeStyle)
        // The Realm > Region > AD > FD scaffold manages its own nested container
        // coords, so it runs AFTER autoLayout. Idempotent no-op when off.
        if (scaffoldEnabled) {
            document.design = reconcileLzScaffold(document.design)
        }
        setOcdDocument(document)
        switchToDesigner()
    }

    // Consume any one-shot seed staged by "Edit Landing Zone in Wizard" exactly
    // once per page mount. When present it rehydrates the wizard from a saved
    // LZ-origin design's config; when absent the wizard opens as today (draft).
    const seed = useMemo(() => consumeWizardSeed(), [])

    return (
        <WizardProvider seed={seed}>
            <WizardBody onExit={onExit} onOpenInDesigner={onOpenInDesigner} />
        </WizardProvider>
    )
}

export default OcdLandingZone
