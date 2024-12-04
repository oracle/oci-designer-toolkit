/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React, { useRef, useState } from 'react'
import { palette } from '../data/OcdPalette'
import OcdPalette from '../components/OcdPalette'
import OcdProperties from '../components/OcdProperties'
import OcdCanvas from '../components/OcdCanvas'
import OcdCanvasLayers from '../components/OcdCanvasLayers'
import OcdCanvasPages from '../components/OcdCanvasPages'
import OcdDocument from '../components/OcdDocument'
import { CanvasProps } from '../types/ReactComponentProperties'
import { ConsolePageProps, ConsoleToolbarProps } from '../types/Console'
import { DragData, newDragData } from '../types/DragData'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import { autoLayoutOptions } from '../data/OcdAutoLayoutOptions'

const OcdCanvasView = ({ dragData, setDragData, ocdConsoleConfig, ocdDocument, setOcdDocument }: CanvasProps): JSX.Element => {
    return (
        <div className='ocd-designer-view'>
            <OcdCanvasLayers 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
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