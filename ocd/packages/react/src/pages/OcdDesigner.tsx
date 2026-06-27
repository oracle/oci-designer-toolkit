/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React, { useContext, useMemo, useRef, useState } from 'react'
import { palette } from '../data/OcdPalette'
import OcdPalette from '../components/OcdPalette'
import OcdProperties from '../components/OcdProperties'
import OcdCanvas from '../components/OcdCanvas'
import OcdCanvasLayers from '../components/OcdCanvasLayers'
import OcdCanvasPages from '../components/OcdCanvasPages'
import OcdDocument from '../components/OcdDocument'
import { importFromDrawio, importFromLandingZoneFiles, importFromTerraform, loadDesign } from '../components/Menu'
import { CanvasProps } from '../types/ReactComponentProperties'
import { ConsolePageProps, ConsoleToolbarProps } from '../types/Console'
import { DragData, newDragData } from '../types/DragData'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import { autoLayoutOptions } from '../data/OcdAutoLayoutOptions'
import { ActiveFileContext } from './OcdConsole'

type DesignerActionTone = 'primary' | 'standard'
type OcdDisplayPage = OcdConsoleConfig['config']['displayPage']
interface DesignerCommandCenterPosition {
    readonly x: number
    readonly y: number
}
interface DesignerCommandCenterBounds {
    readonly containerWidth: number
    readonly containerHeight: number
    readonly panelWidth: number
    readonly panelHeight: number
    readonly padding?: number
}
interface DesignerCommandCenterDrag {
    readonly startClientX: number
    readonly startClientY: number
    readonly startX: number
    readonly startY: number
    readonly containerWidth: number
    readonly containerHeight: number
    readonly panelWidth: number
    readonly panelHeight: number
}

interface OcdCanvasViewProps extends CanvasProps {
    setOcdConsoleConfig: React.Dispatch<any>
}

interface DesignerAction {
    readonly id: string
    readonly label: string
    readonly icon: string
    readonly title: string
    readonly tone?: DesignerActionTone
    readonly onClick: () => void
}

export const getDesignerCommandCenterMode = (coordsCount: number): 'empty' | 'compact' => coordsCount === 0 ? 'empty' : 'compact'

export type DesignerCommandCenterActionId =
    | 'landing-zone'
    | 'ai-architect'
    | 'terraform'
    | 'lz-json'
    | 'open'
    | 'drawio'
    | 'template'
    | 'discovery'
    | 'palette'

export interface DesignerCommandCenterActionMetadata {
    readonly id: DesignerCommandCenterActionId
    readonly label: string
    readonly icon: string
    readonly title: string
    readonly tone?: DesignerActionTone
}

export const getDesignerCommandCenterActionMetadata = (): DesignerCommandCenterActionMetadata[] => [
    {
        id: 'landing-zone',
        label: 'Build from Landing Zone',
        icon: 'LZ',
        title: 'Open Landing Zone Next-Gen',
        tone: 'primary',
    },
    {
        id: 'ai-architect',
        label: 'AI Architect',
        icon: 'AI',
        title: 'Open AI Architect',
        tone: 'primary',
    },
    {
        id: 'terraform',
        label: 'Import Terraform',
        icon: 'TF',
        title: 'Import Terraform into the Designer',
    },
    {
        id: 'lz-json',
        label: 'Import LZ JSON',
        icon: 'JS',
        title: 'Import generated Landing Zone JSON files',
    },
    {
        id: 'open',
        label: 'Open Design',
        icon: 'OP',
        title: 'Open an OCD design file',
    },
    {
        id: 'drawio',
        label: 'Import draw.io',
        icon: 'DI',
        title: 'Import an uncompressed draw.io diagram',
    },
    {
        id: 'template',
        label: 'Use Template',
        icon: 'TP',
        title: 'Open architecture templates',
    },
    {
        id: 'discovery',
        label: 'Discovery',
        icon: 'DS',
        title: 'Open OCI Discovery',
    },
    {
        id: 'palette',
        label: 'Add Manually',
        icon: 'AD',
        title: 'Show the resource palette',
    },
]

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

export const clampDesignerCommandCenterPosition = (
    position: DesignerCommandCenterPosition,
    bounds: DesignerCommandCenterBounds,
): DesignerCommandCenterPosition => {
    const padding = bounds.padding ?? 8
    const maxX = Math.max(padding, bounds.containerWidth - bounds.panelWidth - padding)
    const maxY = Math.max(padding, bounds.containerHeight - bounds.panelHeight - padding)
    return {
        x: clamp(position.x, padding, maxX),
        y: clamp(position.y, padding, maxY),
    }
}

const OcdDesignerCommandCenter = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const { setActiveFile } = useContext(ActiveFileContext)
    const panelRef = useRef<HTMLElement | null>(null)
    const dragState = useRef<DesignerCommandCenterDrag | null>(null)
    const [position, setPosition] = useState<DesignerCommandCenterPosition | null>(null)
    const [collapsed, setCollapsed] = useState(false)
    const [dragging, setDragging] = useState(false)
    const resourceCount = ocdDocument.getResources().length
    const resourceCountLabel = `${resourceCount} ${resourceCount === 1 ? 'resource' : 'resources'}`
    const coordsCount = ocdDocument.getActivePage().coords.length
    const mode = getDesignerCommandCenterMode(coordsCount)
    const emptyCanvas = mode === 'empty'
    const openPage = (displayPage: OcdDisplayPage) => {
        const consoleConfig = OcdConsoleConfig.clone(ocdConsoleConfig)
        consoleConfig.config.displayPage = displayPage
        setOcdConsoleConfig(consoleConfig)
    }
    const openTemplateGallery = () => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.dialog.templateGallery = true
        setOcdDocument(clone)
    }
    const showResourcePalette = () => {
        const consoleConfig = OcdConsoleConfig.clone(ocdConsoleConfig)
        consoleConfig.config.showPalette = true
        setOcdConsoleConfig(consoleConfig)
    }
    const actions = useMemo<DesignerAction[]>(() => {
        const handlers: Record<DesignerCommandCenterActionId, () => void> = {
            'landing-zone': () => openPage('landingzone'),
            'ai-architect': () => openPage('agent'),
            terraform: () => { void importFromTerraform(setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile) },
            'lz-json': () => { void importFromLandingZoneFiles(setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig) },
            open: () => { void loadDesign('', setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile) },
            drawio: () => { void importFromDrawio(setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig) },
            template: openTemplateGallery,
            discovery: () => openPage('discovery'),
            palette: showResourcePalette,
        }
        return getDesignerCommandCenterActionMetadata().map((action) => ({
            ...action,
            onClick: handlers[action.id],
        }))
    }, [ocdConsoleConfig, ocdDocument, setActiveFile, setOcdConsoleConfig, setOcdDocument])
    const visibleActions = emptyCanvas ? actions : actions.filter((action) => action.id !== 'palette')
    const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return
        const panel = panelRef.current
        const container = panel?.parentElement
        if (!panel || !container) return
        const panelRect = panel.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        dragState.current = {
            startClientX: event.clientX,
            startClientY: event.clientY,
            startX: panelRect.left - containerRect.left,
            startY: panelRect.top - containerRect.top,
            containerWidth: container.clientWidth,
            containerHeight: container.clientHeight,
            panelWidth: panelRect.width,
            panelHeight: panelRect.height,
        }
        event.currentTarget.setPointerCapture(event.pointerId)
        setDragging(true)
    }
    const drag = (event: React.PointerEvent<HTMLDivElement>) => {
        const state = dragState.current
        if (!state) return
        setPosition(clampDesignerCommandCenterPosition({
            x: state.startX + event.clientX - state.startClientX,
            y: state.startY + event.clientY - state.startClientY,
        }, state))
    }
    const stopDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current) return
        dragState.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
        setDragging(false)
    }
    const resetPosition = () => {
        dragState.current = null
        setPosition(null)
        setDragging(false)
    }
    const className = [
        'ocd-architecture-command-center',
        `ocd-architecture-command-center-${mode}`,
        position ? 'ocd-architecture-command-center-floating' : '',
        collapsed ? 'ocd-architecture-command-center-collapsed' : '',
        dragging ? 'ocd-architecture-command-center-dragging' : '',
    ].filter(Boolean).join(' ')
    const style = position
        ? { left: `${position.x}px`, top: `${position.y}px`, right: 'auto', transform: 'none' }
        : undefined
    return (
        <section ref={panelRef} className={className} style={style} aria-label='Architecture command center'>
            <div className='ocd-architecture-command-header'>
                <div
                    className='ocd-architecture-command-copy'
                    title='Drag shortcuts'
                    onPointerDown={startDrag}
                    onPointerMove={drag}
                    onPointerUp={stopDrag}
                    onPointerCancel={stopDrag}
                >
                    <strong>{emptyCanvas ? 'Start architecture' : 'Architecture shortcuts'}</strong>
                    <span>{resourceCountLabel}</span>
                </div>
                <div className='ocd-architecture-command-window-controls'>
                    {position && (
                        <button
                            type='button'
                            className='ocd-architecture-command-window-button'
                            title='Reset shortcut position'
                            aria-label='Reset shortcut position'
                            onClick={resetPosition}
                        >
                            R
                        </button>
                    )}
                    <button
                        type='button'
                        className='ocd-architecture-command-window-button'
                        title={collapsed ? 'Expand shortcuts' : 'Collapse shortcuts'}
                        aria-label={collapsed ? 'Expand shortcuts' : 'Collapse shortcuts'}
                        onClick={() => setCollapsed((current) => !current)}
                    >
                        {collapsed ? '+' : '-'}
                    </button>
                </div>
            </div>
            {!collapsed && (
                <div className='ocd-architecture-command-actions'>
                    {visibleActions.map((action) => (
                        <button
                            key={action.id}
                            type='button'
                            className={`ocd-architecture-command-action ${action.tone === 'primary' ? 'primary' : ''}`}
                            title={action.title}
                            onClick={action.onClick}
                        >
                            <span className='ocd-architecture-command-icon' aria-hidden>{action.icon}</span>
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </section>
    )
}

const OcdCanvasView = ({ dragData, setDragData, ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: OcdCanvasViewProps): JSX.Element => {
    return (
        <div className='ocd-designer-view'>
            <OcdCanvasLayers 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
            <OcdDesignerCommandCenter
                ocdConsoleConfig={ocdConsoleConfig}
                setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)}
                ocdDocument={ocdDocument}
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)}
                />
            <OcdCanvas 
                dragData={dragData} 
                setDragData={(dragData: DragData) => setDragData(dragData)}
                ocdConsoleConfig={ocdConsoleConfig}
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
            <OcdCanvasPages 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
        </div>
    )
}

export const OcdDesigner = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const [dragData, setDragData] = useState(newDragData())
    const [selectedResource, setSelectedResource] = useState({})
    const className = `ocd-designer ${ocdConsoleConfig.config.showPalette && !ocdConsoleConfig.config.showProperties ? 'ocd-designer-left-panel-only' : !ocdConsoleConfig.config.showPalette && ocdConsoleConfig.config.showProperties ? 'ocd-designer-right-panel-only' : !ocdConsoleConfig.config.showPalette && !ocdConsoleConfig.config.showProperties ? 'ocd-designer-no-side-panels' : ''}`
    return (
        <div className={className}>
            {ocdConsoleConfig.config.showPalette && <OcdPalette 
                ocdConsoleConfig={ocdConsoleConfig}
                setDragData={(dragData: DragData) => setDragData(dragData)} 
                ocdDocument={ocdDocument} 
                />}
            <OcdCanvasView 
                dragData={dragData} 
                setDragData={(dragData: DragData) => setDragData(dragData)} 
                ocdConsoleConfig={ocdConsoleConfig}
                setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)}
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
            {ocdConsoleConfig.config.showProperties && <OcdProperties 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />}
        </div>
    )
}

const OcdDesignerViewConfigEditor = ({ ocdConsoleConfig, setOcdConsoleConfig }: any): JSX.Element => {
    const [dropdown, setDropdown] = useState(false)
    // const onMouseEnter = () => {setDropdown(true)}
    // const onMouseLeave = () => {setDropdown(false)}
    // const closeDropdown = () => {setDropdown(!dropdown)}
    const toggleDropdown = () => {setDropdown(!dropdown)}
    const cbRef = useRef<HTMLInputElement>(null)
    const detailedResourceOnChange = () => {
        ocdConsoleConfig.config.detailedResource = !ocdConsoleConfig.config.detailedResource
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const verboseProviderPaletteOnChange = () => {
        ocdConsoleConfig.config.verboseProviderPalette = !ocdConsoleConfig.config.verboseProviderPalette
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const highlightCompartmentResourcesOnChange = () => {
        ocdConsoleConfig.config.highlightCompartmentResources = !ocdConsoleConfig.config.highlightCompartmentResources
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const showProviderPaletteOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) ocdConsoleConfig.config.visibleProviderPalettes.push(e.target.id)
        else ocdConsoleConfig.config.visibleProviderPalettes = ocdConsoleConfig.config.visibleProviderPalettes.filter((p: string) => p !== e.target.id)
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onDefaultAutoLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        ocdConsoleConfig.config.defaultAutoArrangeStyle = e.target.value
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
        setDropdown(!dropdown)
    }
    const selectClicked = (e: React.MouseEvent<HTMLSelectElement>) => {
        e.stopPropagation()
    }
    if (ocdConsoleConfig.config.visibleProviderPalettes === undefined) ocdConsoleConfig.config.visibleProviderPalettes = ['OCI']
    return (
        <div className='ocd-console-toolbar-dropdown ocd-console-toolbar-dropdown-theme ocd-toolbar-separator-right'>
            <ul>
                <li className='ocd-console-toolbar-dropdown-item' onClick={toggleDropdown} aria-hidden>
                    <div className='left-palette ocd-console-toolbar-icon'></div>
                    <ul className={`${dropdown ? 'show' : 'hidden'}`}>
                        <li className='ocd-dropdown-menu-item'><div><label><input id='verboseProviderPalette' type='checkbox' onChange={verboseProviderPaletteOnChange} ref={cbRef} checked={ocdConsoleConfig.config.verboseProviderPalette}/>Verbose Palette</label></div></li>
                        <li className='ocd-dropdown-menu-item'><div>--------------------------------</div></li>
                        {palette.providers.map((provider) => {return <li className='ocd-dropdown-menu-item' key={provider.title} ><div><label><input id={provider.title} type='checkbox' onChange={showProviderPaletteOnChange} ref={cbRef} checked={ocdConsoleConfig.config.visibleProviderPalettes.includes(provider.title)}/>Show {provider.title} Palette</label></div></li>})}
                        <li className='ocd-dropdown-menu-item'><div>--------------------------------</div></li>
                        <li className='ocd-dropdown-menu-item'><div><label><input id='detailedResource' type='checkbox' onChange={detailedResourceOnChange} ref={cbRef} checked={ocdConsoleConfig.config.detailedResource}/>Resource Details</label></div></li>
                        <li className='ocd-dropdown-menu-item'><div><label><input id='highlightCompartmentResources' type='checkbox' onChange={highlightCompartmentResourcesOnChange} ref={cbRef} checked={ocdConsoleConfig.config.highlightCompartmentResources}/>Highlight Compartment Resources</label></div></li>
                        <li className='ocd-dropdown-menu-item'><div>--------------------------------</div></li>
                        <li className='ocd-dropdown-menu-item'><div>Set Default Auto Layout</div></li>
                        <li className='ocd-dropdown-menu-item'><div><select value={ocdConsoleConfig.config.defaultAutoArrangeStyle} onChange={onDefaultAutoLayoutChange} onClick={selectClicked}>{Object.entries(autoLayoutOptions).filter(([k, v]) => k !== 'default').map(([k, v]) => {return <option value={k} key={k}>{v}</option>})}</select></div></li>
                        <li className='ocd-dropdown-menu-item'><div>--------------------------------</div></li>
                    </ul>
                </li>
            </ul>
        </div>
    )
}

const OcdDesignerViewZoomControls = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsoleToolbarProps): JSX.Element => {
    const [zoomTo, setZoomTo] = useState('100')
    const onZoomOutClick = () => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.zoomOut()
        setOcdDocument(clone)
    }
    const onZoom121Click = () => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.resetPanZoom()
        setOcdDocument(clone)
    }
    const onZoomInClick = () => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.zoomIn()
        setOcdDocument(clone)
    }
    const onZoomToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.zoomTo(Number(e.target.value))
        setZoomTo(e.target.value)
        setOcdDocument(clone)
    }
    return (
        <div className='ocd-designer-toolbar-zoom-controls'>
            <div>
                <select className={'ocd-toolbar-separator-right'} value={zoomTo} onChange={onZoomToChange}>
                    <option value={25}>25%</option>
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                    <option value={125}>125%</option>
                    <option value={150}>150%</option>
                    <option value={200}>200%</option>
                    <option value={250}>250%</option>
                    <option value={300}>300%</option>
                </select>
            </div>
            <div className={`zoom-out ocd-console-toolbar-icon`} onClick={onZoomOutClick} aria-hidden></div>
            {/* <div className={`zoom-121 ocd-console-toolbar-icon`} onClick={onZoom121Click} aria-hidden></div> */}
            <div className={`zoom-in ocd-console-toolbar-icon`}  onClick={onZoomInClick} aria-hidden></div>
        </div>
    )
}

export const OcdDesignerLeftToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const onPanelLeftCollapseExpandClick = () => {
        ocdConsoleConfig.config.showPalette = !ocdConsoleConfig.config.showPalette
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const panelLeftClassName = `ocd-console-toolbar-icon ${ocdConsoleConfig.config.showPalette ? 'ocd-panel-collapse-left' : 'ocd-panel-expand-left'} ocd-toolbar-separator-right`
    const panelLeftTitle = ocdConsoleConfig.config.showPalette ? 'Collapse Palette' : 'Show Palette'
    return (
        <div className='ocd-designer-toolbar'>
            <OcdDesignerViewConfigEditor 
                ocdConsoleConfig={ocdConsoleConfig} 
                setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                />
            <div className={panelLeftClassName} title={panelLeftTitle} onClick={onPanelLeftCollapseExpandClick} aria-hidden></div>
            <OcdDesignerViewZoomControls 
                ocdConsoleConfig={ocdConsoleConfig} 
                setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
        </div>
    )
}

export const OcdDesignerRightToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const [bothCollapsed, setBothCollapsed] = useState(!ocdConsoleConfig.config.showPalette && !ocdConsoleConfig.config.showProperties)
    const onPanelRightCollapseExpandClick = () => {
        ocdConsoleConfig.config.showProperties = !ocdConsoleConfig.config.showProperties
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onPanelBothCollapseExpandClick = (state: boolean) => {
        ocdConsoleConfig.config.showProperties = state
        ocdConsoleConfig.config.showPalette = state
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
        setBothCollapsed(!state)
    }
    const panelRightClassName = `ocd-console-toolbar-icon ${ocdConsoleConfig.config.showProperties ? 'ocd-panel-collapse-right' : 'ocd-panel-expand-right'}`
    const panelRightTitle = ocdConsoleConfig.config.showProperties ? 'Collapse Properties' : 'Show Properties'
    const panelBothClassName = `ocd-console-toolbar-icon ${bothCollapsed ? 'ocd-panel-expand-both' : 'ocd-panel-collapse-both'}`
    const panelBothTitle = bothCollapsed ? 'Show side panels' : 'Hide side panels'
    return (
        <div className='ocd-designer-toolbar'>
            <div className={panelBothClassName} title={panelBothTitle} onClick={() => onPanelBothCollapseExpandClick(bothCollapsed)} aria-hidden></div>
            <div className={panelRightClassName} title={panelRightTitle} onClick={onPanelRightCollapseExpandClick} aria-hidden></div>
        </div>
    )
}

export default OcdDesigner
