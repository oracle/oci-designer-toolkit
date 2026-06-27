/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { OcdDesigner, OcdDesignerLeftToolbar, OcdDesignerRightToolbar } from './OcdDesigner'
import { OcdDocument } from '../components/OcdDocument'
import OcdConsoleMenuBar from '../components/OcdConsoleMenuBar'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import OcdErrorBoundary from '../components/OcdErrorBoundary'
import { ConsolePageProps, ConsoleToolbarProps, OcdSelectedResource } from '../types/Console'
// Lazy-loaded pages: every page below is mutually exclusive with the Designer
// (the default landing surface, which stays eager so first paint is fast) and
// is only reachable via the DisplayPage switch, which already renders inside
// <OcdErrorBoundary> + <React.Suspense>. Code-splitting them keeps heavyweight
// dependencies (React Flow + jsonnet-WASM, exceljs, the Terraform/Markdown
// exporters, the SVG CSS data, the user guide, the cost catalogues) out of the
// initial entry chunk — each loads on first navigation to its page.
const OcdBom = React.lazy(() => import('./OcdBom'))
const OcdLandingZone = React.lazy(() => import('./OcdLandingZone'))
const OcdSoftware = React.lazy(() => import('./OcdSoftware'))
const OcdDiscovery = React.lazy(() => import('./OcdDiscovery'))
const OcdClassicParity = React.lazy(() => import('./OcdClassicParity'))
const OcdArchitectureAgent = React.lazy(() => import('./OcdArchitectureAgent'))
const OcdIntegrations = React.lazy(() => import('./OcdIntegrations'))
const OcdMarkdown = React.lazy(() => import('./OcdMarkdown'))
const OcdMarkdownLeftToolbar = React.lazy(() => import('./OcdMarkdown').then((m) => ({ default: m.OcdMarkdownLeftToolbar })))
const OcdTabular = React.lazy(() => import('./OcdTabular'))
const OcdTabularLeftToolbar = React.lazy(() => import('./OcdTabular').then((m) => ({ default: m.OcdTabularLeftToolbar })))
const OcdTerraform = React.lazy(() => import('./OcdTerraform'))
const OcdTerraformLeftToolbar = React.lazy(() => import('./OcdTerraform').then((m) => ({ default: m.OcdTerraformLeftToolbar })))
const OcdVariables = React.lazy(() => import('./OcdVariables'))
const OcdLibrary = React.lazy(() => import('./OcdLibrary'))
import { OcdQueryDialog } from '../components/dialogs/OcdQueryDialog'
import { OcdConfigFacade } from '../facade/OcdConfigFacade'
const OcdDocumentation = React.lazy(() => import('./OcdDocumentation'))
import { loadDesign } from '../components/Menu'
import { OcdValidationResult, OcdValidator } from '@ocd/model'
import { OcdLogger } from '@ocd/core'
const OcdValidation = React.lazy(() => import('./OcdValidation'))
const OcdGovernancePanel = React.lazy(() => import('../governance/OcdGovernancePanel'))
import { evaluateGovernance, applyRemediation, type GovernanceFinding } from '../governance/OcdGovernanceChecks'
import { evaluateReachability } from '../analysis/OcdReachability'
const OcdLzPlanPage = React.lazy(() => import('./OcdLzPlanPage'))
import OcdTemplateGallery from '../landingzone/templates/OcdTemplateGallery'
import { findTemplate } from '../landingzone/templates/OcdArchitectureTemplates'
import { buildDetails } from '../data/OcdBuildDetails'
const OcdHelp = React.lazy(() => import('./OcdHelp'))
import OcdCommonTags from './OcdCommonTags'
import { OcdReferenceDataQueryDialog } from '../components/dialogs/OcdReferenceDataQueryDialog'
import { OcdActiveFileContext, OcdConsoleConfigContext, OcdDialogContext, OcdDocumentContext, OcdDragResourceContext, OcdSelectedResourceContext } from './OcdConsoleContext'
// import { OcdActiveFileContext, OcdCacheContext, OcdConsoleConfigContext, OcdDialogContext, OcdDocumentContext, OcdDragResourceContext, OcdSelectedResourceContext } from './OcdConsoleContext'
import { OcdExportToResourceManagerDialog } from '../components/dialogs/OcdExportToResourceManagerDialog'
import { OcdResourceManagerRecentPlansDrawer, useResourceManagerRecentPlanCount } from '../resource-manager/OcdResourceManagerRecentPlansDrawer'
import { ocdThemes } from '../data/OcdThemes'
import { canReconcile, isReconcileEnabled, reconcileOnEdit, LZ_RECONCILE_ENABLED_KEY } from '../landingzone/OcdLzReconcile'
import { reconcileLzScaffold, addRealmAdFdFrames } from '../landingzone/OcdLzScaffold'
import { applyObservabilityOverlay, LZ_OBSERVABILITY_ENABLED_KEY } from '../landingzone/OcdLzObservability'
import { applyOkeNativeOverlay, LZ_OKE_NATIVE_ENABLED_KEY } from '../landingzone/OcdLzOke'
import { applyIamBlueprintOverlay, LZ_IAM_BLUEPRINT_ENABLED_KEY } from '../landingzone/OcdLzIamBlueprint'
import { applyCrossTenancyHubSpokeOverlay, LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY } from '../landingzone/OcdLzCrossTenancyHubSpoke'
import { isLzOriginDesign } from '../landingzone/OcdLzPlacement'
// Context Providers
import { CacheProvider, useCache, useCacheDispatch } from '../contexts/OcdCacheContext'
import { defaultTheme, ThemeProvider, useThemeDispatch } from '../contexts/OcdThemeContext'
import { ConsoleConfigProvider } from '../contexts/OcdConsoleConfigContext'

export const ActiveFileContext = createContext<OcdActiveFileContext>({activeFile: {name: '', modified: false}, setActiveFile: () => {}})
export const ConsoleConfigContext = createContext<OcdConsoleConfigContext>({ocdConsoleConfig: OcdConsoleConfig.new(), setOcdConsoleConfig: () => {}})
// export const CacheContext = createContext<OcdCacheContext>({ocdCache: OcdCacheData.new(), setOcdCache: () => {}})
export const DocumentContext = createContext<OcdDocumentContext>({ocdDocument: OcdDocument.new(), setOcdDocument: () => {}})
export const SelectedResourceContext = createContext<OcdSelectedResourceContext>({selectedResource: OcdDocument.newSelectedResource(), setSelectedResource: () => {}})
export const DragResourceContext = createContext<OcdDragResourceContext>({dragResource: OcdDocument.newDragResource(), setDragResource: () => {}})
export const DialogContext = createContext<OcdDialogContext>({displayDialog: '', setDisplayDialog: () => {}})

const logger = OcdLogger.scope('OcdConsole')

export const OcdConsole = (): JSX.Element => {
    // State Variables
    const [ocdDocument, setOcdDocumentState] = useState(OcdDocument.new())
    const [ocdConsoleConfig, setOcdConsoleConfig] = useState(OcdConsoleConfig.new())
    // const [ocdCache, setOcdCache] = useState(OcdCacheData.new())
    const [activeFile, setActiveFile] = useState({name: '', modified: false})
    const [selectedResource, setSelectedResource] = useState({} as OcdSelectedResource)
    // Reconcile-on-edit funnel: every edit flows through setOcdDocument. When both
    // the wizard 'Realm/AD/FD scaffold' tick and the designer 'LZ live reconcile'
    // tick are on, re-apply the idempotent scaffold. reconcileOnEdit returns the
    // SAME design reference when not applicable (non-LZ, ticks off) or when nothing
    // changed, so this never loops and is a no-op for ordinary designs.
    const setOcdDocument = (document: OcdDocument): void => {
        const reconciled = reconcileOnEdit(document.design)
        if (reconciled !== document.design) document.design = reconciled
        setOcdDocumentState(document)
    }
    // Context
    // Memo Hooks
    const activeFileContext = useMemo(() => ({activeFile, setActiveFile}), [activeFile])
    // const cacheContext = useMemo(() => ({ocdCache, setOcdCache}), [ocdCache])
    const consoleConfigContext = useMemo(() => ({ocdConsoleConfig, setOcdConsoleConfig}), [ocdConsoleConfig])
    const documentContext = useMemo(() => ({ocdDocument, setOcdDocument}), [ocdDocument])
    const selectedResourceContext = useMemo(() => ({selectedResource, setSelectedResource}), [selectedResource])
    // Effect Hooks
    // Check if OKIT-Ocd opened because of Double Click on file on OS
    useEffect(() => {
        // @ts-ignore
        if (window.ocdAPI) window.ocdAPI.onOpenFile((event, filePath) => { // Running as an Electron App
            logger.debug('onOpenFile', filePath)
            loadDesign(filePath, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
        })
    }, []) // Empty Array to only run on initial render
    // Load the Console Config Information
    useEffect(() => {
        OcdConfigFacade.loadConsoleConfig().then((results) => {
            logger.debug('Loaded Console Config')
            const consoleConfig = new OcdConsoleConfig(results)
            setOcdConsoleConfig(consoleConfig)
            // setTheme({
            //     type: 'set',
            //     theme: consoleConfig.config.theme || defaultTheme
            // })
        }).catch((response) => {
            logger.debug('Load Console Config failed; saving default config', response)
            OcdConfigFacade.saveConsoleConfig(ocdConsoleConfig.config).then((results) => {}).catch((error) => logger.warn('Save default Console Config failed', error))
        })
    }, []) // Empty Array to only run on initial render
    const setAndSaveOcdConsoleConfig = (consoleConfig: OcdConsoleConfig) => {
        OcdConfigFacade.saveConsoleConfig(consoleConfig.config).then((results) => {}).catch((error) => logger.warn('Save Console Config failed', error))
        setOcdConsoleConfig(consoleConfig)
    }
    return (
        <ConsoleConfigContext.Provider value={consoleConfigContext}>
            <ActiveFileContext.Provider value={activeFileContext}>
                <DocumentContext.Provider value={documentContext}>
                    <SelectedResourceContext.Provider value={selectedResourceContext}>
                        <ConsoleConfigProvider>
                            <CacheProvider>
                                <ThemeProvider>
                                    <div className={`ocd-console ocd-console-${ocdConsoleConfig.config.theme}-theme`}>
                                        <OcdConsoleHeader setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setAndSaveOcdConsoleConfig(ocdConsoleConfig)} />
                                        <OcdConsoleToolbar ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setAndSaveOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} />
                                        <OcdConsoleBody ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setAndSaveOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} />
                                        <OcdConsoleFooter />
                                    </div>
                                </ThemeProvider>
                            </CacheProvider>
                        </ConsoleConfigProvider>
                    </SelectedResourceContext.Provider>
                </DocumentContext.Provider>
            </ActiveFileContext.Provider>
        </ConsoleConfigContext.Provider>
    )
}

const OcdConsoleTitleBar = (): JSX.Element => {
    // Reads the document directly from context: OcdConsole would otherwise drill
    // ocdDocument/setOcdDocument here, and the title-bar never used the console
    // config props at all. setOcdDocument from context is the same reconcile
    // wrapper OcdConsole drills (documentContext memo), so behaviour is identical.
    const { ocdDocument, setOcdDocument } = useContext(DocumentContext)
    const [title, setTitle] = useState(ocdDocument.design.metadata.title)
    // The <input> stays responsive via local `title` state (immediate), while the
    // document-identity change is propagated through setOcdDocument on a debounce
    // so we honour the OcdDocument fresh-identity contract (Batch 4) without
    // cloning the whole design on every keystroke. Mutating design.metadata.title
    // in-place and skipping setOcdDocument (the previous behaviour) silently
    // diverged the title from the document state machine.
    const titlePropagateTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const propagateTitle = (value: string) => {
        ocdDocument.design.metadata.title = value
        setTitle(value)
        if (titlePropagateTimer.current) clearTimeout(titlePropagateTimer.current)
        titlePropagateTimer.current = setTimeout(() => setOcdDocument(OcdDocument.clone(ocdDocument)), 300)
    }
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => propagateTitle(e.target.value)
    const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => propagateTitle(e.clipboardData.getData('Text'))
    useEffect(() => setTitle(ocdDocument.design.metadata.title), [ocdDocument])
    useEffect(() => () => { if (titlePropagateTimer.current) clearTimeout(titlePropagateTimer.current) }, [])
    return (
        <div className='ocd-console-title-bar'>
            <input id='ocd_document_title' type='text' value={title} onChange={onChange}></input>
        </div>
    )
}

const OcdConsoleHeader = ({ setOcdConsoleConfig }: { setOcdConsoleConfig: React.Dispatch<any> }): JSX.Element => {
    // ocdConsoleConfig / ocdDocument / setOcdDocument are read from context (the
    // same values OcdConsole would drill). setOcdConsoleConfig stays a prop: the
    // ConsoleConfigContext value holds the RAW state setter, whereas the menu bar
    // needs the persist-to-disk wrapper (setAndSaveOcdConsoleConfig) that OcdConsole
    // owns. The title bar now sources its own document from context.
    const { ocdConsoleConfig } = useContext(ConsoleConfigContext)
    const { ocdDocument, setOcdDocument } = useContext(DocumentContext)
    return (
        <div className='ocd-console-header ocd-console-header-theme'>
            <div className='ocd-image ocd-logo'></div>
            <div className='ocd-title-and-menu'>
                <OcdConsoleTitleBar />
                <OcdConsoleMenuBar ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig:any) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} />
            </div>
        </div>
    )
}

const OcdConsoleSettingsEditor = ({ ocdConsoleConfig, setOcdConsoleConfig }: any): JSX.Element => {
    const setOcdTheme = useThemeDispatch()
    const [dropdown, setDropdown] = useState(false)
    const toggleDropdown = () => {setDropdown(!dropdown)}
    const cbRef = useRef<HTMLInputElement>(null)
    const showPreviousViewOnStartOnChange = () => {
        ocdConsoleConfig.config.showPreviousViewOnStart = !ocdConsoleConfig.config.showPreviousViewOnStart
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const zoomOnWheelOnChange = () => {
        ocdConsoleConfig.config.zoomOnWheel = !ocdConsoleConfig.config.zoomOnWheel
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        ocdConsoleConfig.config.theme = e.target.value
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
        setDropdown(!dropdown)
        setOcdTheme({
                type: 'set',
                theme: e.target.value
            })
    }
    const selectClicked = (e: React.MouseEvent<HTMLSelectElement>) => {
        e.stopPropagation()
    }
    return (
        <div className='ocd-console-toolbar-dropdown ocd-console-toolbar-dropdown-theme ocd-toolbar-separator-right'>
            <ul>
                <li className='ocd-console-toolbar-dropdown-item' onClick={toggleDropdown} aria-hidden>
                    <div className='settings ocd-console-toolbar-icon'></div>
                    <ul className={`${dropdown ? 'show' : 'hidden'}`}>
                        <li className='ocd-dropdown-menu-item'><div><label><input id='showPreviousViewOnStart' type='checkbox' onChange={showPreviousViewOnStartOnChange} ref={cbRef} checked={ocdConsoleConfig.config.showPreviousViewOnStart}/>Show Previous View On Start</label></div></li>
                        <li className='ocd-dropdown-menu-item'><div>--------------------------------</div></li>
                        <li className='ocd-dropdown-menu-item'><div><label><input id='zoomOnWheel' type='checkbox' onChange={zoomOnWheelOnChange} ref={cbRef} checked={ocdConsoleConfig.config.zoomOnWheel}/>Allow Zoom Mouse Wheel</label></div></li>
                        <li className='ocd-dropdown-menu-item'><div>--------------------------------</div></li>
                        <li className='ocd-dropdown-menu-item'><div>Theme</div></li>
                        <li className='ocd-dropdown-menu-item'><div><select value={ocdConsoleConfig.config.theme} onChange={onThemeChange} onClick={selectClicked}>{Object.entries(ocdThemes).filter(([k, v]) => k !== 'default').map(([k, v]) => {return <option value={k} key={k}>{v}</option>})}</select></div></li>
                    </ul>
                </li>
            </ul>
        </div>
    )
}

const OcdConsoleToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsoleToolbarProps): JSX.Element => {
    const [bothCollapsed, setBothCollapsed] = useState(!ocdConsoleConfig.config.showPalette && !ocdConsoleConfig.config.showProperties)
    const [showRecentPlans, setShowRecentPlans] = useState(false)
    const recentPlanCount = useResourceManagerRecentPlanCount()
    const onValidateClick = () => {
        ocdConsoleConfig.config.displayPage = 'validation'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onGovernanceClick = () => {
        ocdConsoleConfig.config.displayPage = 'governance'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onPlanClick = () => {
        ocdConsoleConfig.config.displayPage = 'plan'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onEstimateClick = () => {
        ocdConsoleConfig.config.displayPage = 'bom'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onLandingZoneClick = () => {
        ocdConsoleConfig.config.displayPage = 'landingzone'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onDiscoveryClick = () => {
        ocdConsoleConfig.config.displayPage = 'discovery'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onClassicClick = () => {
        ocdConsoleConfig.config.displayPage = 'classic'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onAgentClick = () => {
        ocdConsoleConfig.config.displayPage = 'agent'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onIntegrationsClick = () => {
        ocdConsoleConfig.config.displayPage = 'integrations'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    // Designer 'LZ live reconcile' tick: records that edits should re-apply the
    // Realm/AD/FD scaffold. Only meaningful together with the wizard scaffold tick.
    const onReconcileToggle = () => {
        const document = OcdDocument.clone(ocdDocument)
        document.design.userDefined[LZ_RECONCILE_ENABLED_KEY] = !isReconcileEnabled(ocdDocument.design)
        setOcdDocument(document)
    }
    // One-shot: re-apply the scaffold now without enabling live mode (idempotent).
    const onReapplyScaffold = () => {
        const document = OcdDocument.clone(ocdDocument)
        document.design = reconcileLzScaffold(document.design)
        setOcdDocument(document)
    }
    // Add Realm > Region > AD > FD frames to ANY design (idempotent). Available
    // on the Designer page regardless of LZ origin.
    const onAddFramesClick = () => {
        const document = OcdDocument.clone(ocdDocument)
        document.design = addRealmAdFdFrames(document.design)
        setOcdDocument(document)
    }
    // Add the DB Observability add-on (DBM/OPSI private endpoints, Database
    // Insight, Management Agent) to an LZ-origin design from the Designer
    // (idempotent — re-applying is a no-op). Editable in the properties panel.
    const onApplyObservability = () => {
        const document = OcdDocument.clone(ocdDocument)
        document.design = applyObservabilityOverlay(document.design)
        document.design.userDefined[LZ_OBSERVABILITY_ENABLED_KEY] = true
        setOcdDocument(document)
    }
    // Add the OKE-native add-on (VCN-native subnets, enhanced cluster, node
    // pool, workload-identity dynamic group + policy, NSG, Vault + Key).
    const onApplyOke = () => {
        const document = OcdDocument.clone(ocdDocument)
        document.design = applyOkeNativeOverlay(document.design)
        document.design.userDefined[LZ_OKE_NATIVE_ENABLED_KEY] = true
        setOcdDocument(document)
    }
    // Add the Enterprise IAM blueprint (admin/network/security/dev/auditor groups,
    // least-privilege policy bundles scoped to the LZ compartments, and an
    // lz-governance tag namespace + cost-tracking tags) to an LZ-origin design.
    const onApplyIamBlueprint = () => {
        const document = OcdDocument.clone(ocdDocument)
        document.design = applyIamBlueprintOverlay(document.design)
        document.design.userDefined[LZ_IAM_BLUEPRINT_ENABLED_KEY] = true
        setOcdDocument(document)
    }
    // Add the best-practice cross-tenancy hub-spoke topology (per-tenancy DRG +
    // Remote Peering Connection naming the peer tenancy, non-overlapping CIDRs,
    // DRG attachments) for connecting two OCI tenancies.
    const onApplyCrossTenancy = () => {
        const document = OcdDocument.clone(ocdDocument)
        document.design.userDefined[LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY] = true
        document.design = applyCrossTenancyHubSpokeOverlay(document.design)
        setOcdDocument(document)
    }
    const onDesignerPage = ocdConsoleConfig.config.displayPage === 'designer'
    const isLzOrigin = isLzOriginDesign(ocdDocument.design)
    // Drag-to-connect mode toggle. When on, dropping a resource on another wires
    // their FK association instead of re-parenting.
    const connectMode = Boolean(ocdConsoleConfig.config.connectMode)
    const onConnectModeToggle = () => {
        ocdConsoleConfig.config.connectMode = !connectMode
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const showReconcile = canReconcile(ocdDocument.design)
    const reconcileOn = isReconcileEnabled(ocdDocument.design)
    // Widened so eager toolbars and the lazy-loaded page toolbars
    // (LazyExoticComponents) are both assignable.
    let PageLeftToolbar: React.ComponentType<ConsolePageProps> = OcdEmptyLeftRightToolbar
    let PageRightToolbar: React.ComponentType<ConsolePageProps> = OcdEmptyLeftRightToolbar
    switch (ocdConsoleConfig.config.displayPage) {
        case 'designer':
            PageLeftToolbar = OcdDesignerLeftToolbar
            PageRightToolbar = OcdDesignerRightToolbar
            break;
        case 'markdown':
            PageLeftToolbar = OcdMarkdownLeftToolbar
            break;
        case 'tabular':
            PageLeftToolbar = OcdTabularLeftToolbar
            break;
        case 'terraform':
            PageLeftToolbar = OcdTerraformLeftToolbar
            break;
    }
    // const hideZoomClassName = ocdConsoleConfig.config.displayPage === 'designer' ? '' : 'hidden'
    const validationResults = useMemo(() => OcdValidator.validate(ocdDocument.design), [ocdDocument.design])
    const hasErrors = validationResults.filter((v: OcdValidationResult) => v.type === 'error').length > 0
    const hasWarnings = validationResults.filter((v: OcdValidationResult) => v.type === 'warning').length > 0
    const validateClassName = `ocd-console-toolbar-icon ${hasErrors ? 'ocd-validation-error' : hasWarnings ? 'ocd-validation-warning' : 'ocd-validation-ok'}`
    const validateTitle = hasErrors ? 'Design has validation errors' : hasWarnings ? 'Design has validation warnings' : 'Design validated'
    return (
        <div className='ocd-console-toolbar ocd-console-toolbar-theme'>
            <div className='ocd-toolbar-left'>
                <div>
                    {/* <div className='left-palette ocd-console-toolbar-icon' onClick={onLeftPaletteClick} ref={leftPaletteRef}></div> */}
                    <OcdConsoleSettingsEditor 
                        ocdConsoleConfig={ocdConsoleConfig} 
                        setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                        />
                    {/* Suspense: the markdown/tabular/terraform toolbars live in their
                        lazy-loaded page modules; render nothing while the chunk loads. */}
                    <React.Suspense fallback={<></>}>
                        <PageLeftToolbar
                            ocdConsoleConfig={ocdConsoleConfig}
                            setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)}
                            ocdDocument={ocdDocument}
                            setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                            />
                    </React.Suspense>
                </div>
            </div>
            <div className='ocd-toolbar-centre'>
                <div>
                </div>
            </div>
            <div className='ocd-toolbar-right'>
                <div>
                    <React.Suspense fallback={<></>}>
                        <PageRightToolbar
                            ocdConsoleConfig={ocdConsoleConfig}
                            setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)}
                            ocdDocument={ocdDocument}
                            setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                            />
                    </React.Suspense>
                    <button className='ocd-lz-hero-cta' title='Open the Landing Zone Next-Gen Wizard' onClick={onLandingZoneClick}>
                        <span className='ocd-lz-hero-cta-icon' aria-hidden></span>
                        <span className='ocd-lz-hero-cta-label'>Landing Zone Next-Gen</span>
                    </button>
                    <button className='ocd-discovery-cta' title='Open OCI Discovery Workbench' onClick={onDiscoveryClick}>
                        <span className='ocd-discovery-cta-icon' aria-hidden></span>
                        <span className='ocd-discovery-cta-label'>Discovery</span>
                    </button>
                    <button className='ocd-classic-cta' title='Open OKIT Classic 0.70 parity map' onClick={onClassicClick}>
                        <span className='ocd-classic-cta-icon' aria-hidden></span>
                        <span className='ocd-classic-cta-label'>Classic 0.70</span>
                    </button>
                    <button className='ocd-agent-cta' title='Open Architecture Agent' onClick={onAgentClick}>
                        <span className='ocd-agent-cta-icon' aria-hidden></span>
                        <span className='ocd-agent-cta-label'>AI Architect</span>
                    </button>
                    <button className='ocd-integrations-cta' title='Open Integration Hub' onClick={onIntegrationsClick}>
                        <span className='ocd-integrations-cta-icon' aria-hidden></span>
                        <span className='ocd-integrations-cta-label'>Integrations</span>
                    </button>
                    <button className='ocd-rm-plans-cta' title='Open recent Resource Manager PLAN history' onClick={() => setShowRecentPlans(true)}>
                        <span className='ocd-rm-plans-cta-icon' aria-hidden></span>
                        <span className='ocd-rm-plans-cta-label'>Plans</span>
                        {recentPlanCount > 0 && <span className='ocd-rm-plans-cta-count'>{recentPlanCount}</span>}
                    </button>
                    <div className={validateClassName} title={validateTitle} onClick={onValidateClick} aria-hidden></div>
                    <div className='governance ocd-console-toolbar-icon' title='Governance &amp; Compliance posture' onClick={onGovernanceClick} aria-hidden></div>
                    <div className='ocd-lz-plan ocd-console-toolbar-icon' title='Landing Zone Plan / Diff (compare current design with imported LZ)' onClick={onPlanClick} aria-hidden></div>
                    {showReconcile && <label className={`ocd-lz-reconcile-toggle ${reconcileOn ? 'on' : ''}`} title='LZ live reconcile: when on (with the wizard scaffold tick), edits re-apply the Realm/AD/FD scaffold idempotently.'>
                        <input type='checkbox' checked={reconcileOn} onChange={onReconcileToggle} />
                        <span>LZ sync</span>
                    </label>}
                    {showReconcile && <div className='ocd-lz-reapply ocd-console-toolbar-icon' title='Re-apply the Realm/AD/FD scaffold now (idempotent)' onClick={onReapplyScaffold} aria-hidden></div>}
                    {onDesignerPage && <div className='ocd-add-frames ocd-console-toolbar-icon' title='Add Realm / Region / AD / FD frames to the canvas' onClick={onAddFramesClick} aria-hidden></div>}
                    {onDesignerPage && isLzOrigin && <div className='ocd-lz-observability ocd-console-toolbar-icon' title='Add DB Observability add-on (DBM/OPSI endpoints, Database Insight, Management Agent)' onClick={onApplyObservability} aria-hidden></div>}
                    {onDesignerPage && isLzOrigin && <div className='ocd-lz-oke ocd-console-toolbar-icon' title='Add OKE-native add-on (native subnets, enhanced cluster, node pool, workload identity, Vault)' onClick={onApplyOke} aria-hidden></div>}
                    {onDesignerPage && isLzOrigin && <div className='ocd-lz-iam ocd-console-toolbar-icon' title='Add Enterprise IAM blueprint (groups, least-privilege policies, governance tag namespace)' onClick={onApplyIamBlueprint} aria-hidden></div>}
                    {onDesignerPage && isLzOrigin && <div className='ocd-lz-crosstenancy ocd-console-toolbar-icon' title='Add Cross-Tenancy hub-spoke (per-tenancy DRG + Remote Peering Connection naming the peer tenancy, non-overlapping CIDRs) — connect two OCI tenancies' onClick={onApplyCrossTenancy} aria-hidden></div>}
                    {onDesignerPage && <div className={`ocd-connect-mode ocd-console-toolbar-icon ${connectMode ? 'on' : ''}`} title='Connect mode: drag one resource onto another to wire their association' onClick={onConnectModeToggle} aria-hidden></div>}
                    <div className='cost-estimate ocd-console-toolbar-icon' title='BoM and Cost Estimate' onClick={onEstimateClick} aria-hidden></div>
                </div>
            </div>
            <OcdResourceManagerRecentPlansDrawer
                onClose={() => setShowRecentPlans(false)}
                open={showRecentPlans}
            />
        </div>
    )
}

const OcdEmptyLeftRightToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {return (<></>)}

// Governance & compliance posture page: runs the pure governance rule set over
// the current design model and renders the findings (mirrors OcdValidation).
const OcdGovernance = ({ ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    // Governance posture + graph-based connectivity/reachability findings share
    // the same finding shape and panel; merge both into one list.
    const findings = [...evaluateGovernance(ocdDocument.design), ...evaluateReachability(ocdDocument.design)]
    // Apply a safe one-field remediation to the model and persist; the panel
    // re-renders and evaluateGovernance recomputes so the finding clears.
    const handleApplyFix = (finding: GovernanceFinding) => {
        const fixedDesign = applyRemediation(ocdDocument.design, finding)
        if (fixedDesign === ocdDocument.design) return // no-op for guidance-only findings
        const clone = OcdDocument.clone(ocdDocument)
        clone.design = fixedDesign
        setOcdDocument(clone)
    }
    return <OcdGovernancePanel findings={findings} design={ocdDocument.design} onApplyFix={handleApplyFix} />
}

const OcdConsoleBody = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const { setActiveFile } = useContext(ActiveFileContext)
    const showQueryDialog = ocdDocument.query
    const showReferenceDataQueryDialog = ocdConsoleConfig.queryReferenceData
    const showExportToResourceManagerDialog = ocdDocument.dialog.resourceManager
    const showTemplateGallery = ocdDocument.dialog.templateGallery
    // Seed the chosen architecture template into a fresh design, lay it out, and
    // drop the user on the Designer page (mirrors the LZ Open-in-Designer flow).
    const onTemplateSelect = (templateId: string) => {
        const template = findTemplate(templateId)
        if (!template) return
        const clone = OcdDocument.clone(ocdDocument)
        clone.design = template.build()
        clone.dialog.templateGallery = false
        clone.autoLayout(clone.getActivePage().id, true, ocdConsoleConfig.config.defaultAutoArrangeStyle ?? 'dynamic-columns')
        setOcdDocument(clone)
        setActiveFile({ name: `${template.title}.okit`, modified: true })
        ocdConsoleConfig.config.displayPage = 'designer'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onTemplateGalleryClose = () => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.dialog.templateGallery = false
        setOcdDocument(clone)
    }
    logger.debug('OcdConsoleBody: Dialogs: Query', showQueryDialog, 'ReferenceData', showReferenceDataQueryDialog, 'Resource Manager', showExportToResourceManagerDialog)
    // Widened so an eager page component and the lazy-loaded OcdLandingZone
    // (a LazyExoticComponent) are both assignable.
    let DisplayPage: React.ComponentType<ConsolePageProps> = OcdDesigner
    switch (ocdConsoleConfig.config.displayPage) {
        case 'bom':
            DisplayPage = OcdBom
            break;
        case 'designer':
            DisplayPage = OcdDesigner
            break;
        case 'classic':
            DisplayPage = OcdClassicParity
            break;
        case 'agent':
            DisplayPage = OcdArchitectureAgent
            break;
        case 'documentation':
            DisplayPage = OcdDocumentation
            break;
        case 'discovery':
            DisplayPage = OcdDiscovery
            break;
        case 'landingzone':
            DisplayPage = OcdLandingZone
            break;
        case 'software':
            DisplayPage = OcdSoftware
            break;
        case 'markdown':
            DisplayPage = OcdMarkdown
            break;
        case 'tabular':
            DisplayPage = OcdTabular
            break;
        case 'tags':
            DisplayPage = OcdCommonTags
            break;
        case 'terraform':
            DisplayPage = OcdTerraform
            break;
        case 'variables':
            DisplayPage = OcdVariables
            break;
        case 'validation':
            DisplayPage = OcdValidation
            break;
        case 'governance':
            DisplayPage = OcdGovernance
            break;
        case 'integrations':
            DisplayPage = OcdIntegrations
            break;
        case 'plan':
            DisplayPage = OcdLzPlanPage
            break;
        case 'help':
            DisplayPage = OcdHelp
            break;
        case 'library':
            DisplayPage = OcdLibrary
            break;
    }
    return (
        <div className='ocd-console-body ocd-console-body-theme'>
            {/* <OcdDesigner ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig:any) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} /> */}
            <OcdErrorBoundary>
                <React.Suspense fallback={<div className='ocd-console-loading' aria-busy='true'>Loading…</div>}>
                    <DisplayPage
                        ocdConsoleConfig={ocdConsoleConfig}
                        setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)}
                        ocdDocument={ocdDocument}
                        setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)}
                        key={`${ocdConsoleConfig.config.displayPage}-page`}
                        />
                </React.Suspense>
            </OcdErrorBoundary>
            {/* <OcdPropertiesPanel ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument) => setOcdDocument(ocdDocument)} ocdResource={resource} /> */}
            {showQueryDialog && <OcdQueryDialog 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} 
            />}
            {showReferenceDataQueryDialog && <OcdReferenceDataQueryDialog 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} 
            />}
            {showExportToResourceManagerDialog && <OcdExportToResourceManagerDialog
                ocdDocument={ocdDocument}
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)}
            />}
            {showTemplateGallery && <OcdTemplateGallery
                onSelect={onTemplateSelect}
                onClose={onTemplateGalleryClose}
            />}
        </div>
    )
}

const OcdConsoleFooter = (): JSX.Element => {
    // The footer only renders the active filename, cache picker and build details;
    // it never used the drilled console/document props, so they are dropped.
    const {activeFile} = useContext(ActiveFileContext)
    const filenameClass = `${activeFile.modified ? 'ocd-design-modified ocd-active-file-modified-icon' : ''}`
    return (
        <div className='ocd-console-footer ocd-console-footer-theme'>
            <div className='ocd-footer-left'>
                <div>
                    <div className={filenameClass} title='Design Modified'><span>{activeFile.name}</span></div>
                </div>
            </div>
            <div className='ocd-footer-centre'>
                <div><OcdCachePicker></OcdCachePicker></div>
                {/* <div><span>Reference Data Profile {ocdCache.cache.profile}</span></div> */}
            </div>
            <div className='ocd-footer-right'>
                <div>
                    <span>Version: {buildDetails.version} Build Date: {buildDetails.utc}</span>
                </div>
            </div>
        </div>
    )
}

const OcdCachePicker = (): JSX.Element => {
    // const {ocdCache, setOcdCache} = useContext(CacheContext)
    const ocdCache = useCache()
    const setOcdCache = useCacheDispatch()
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        ocdCache.cache.profile = e.target.value
        // setOcdCache(OcdCacheData.clone(ocdCache))
        setOcdCache({
            type: 'setRegion',
            cache: ocdCache,
            region: e.target.value
        })
    ocdCache.saveCache()
    }
    return (
        <div className='ocd-cache-picker'>
            <div><span>Reference Data Profile </span></div>
            <div>
                <select value={ocdCache.cache.profile} onChange={onChange}>
                    {Object.keys(ocdCache.cache.dropdownData).map((k) => <option value={k} key={k}>{k}</option>)}
                </select>
            </div>
        </div>
    )
}

export default OcdConsole
