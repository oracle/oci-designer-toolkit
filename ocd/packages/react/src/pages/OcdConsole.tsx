/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { OcdDesigner, OcdDesignerLeftToolbar, OcdDesignerRightToolbar } from './OcdDesigner'
import { OcdDocument } from '../components/OcdDocument'
import OcdConsoleMenuBar from '../components/OcdConsoleMenuBar'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import { ConsoleHeaderProps, ConsolePageProps, ConsoleToolbarProps, OcdSelectedResource } from '../types/Console'
import OcdBom from './OcdBom'
import OcdMarkdown, { OcdMarkdownLeftToolbar } from './OcdMarkdown'
import OcdTabular, { OcdTabularLeftToolbar } from './OcdTabular'
import OcdTerraform, { OcdTerraformLeftToolbar } from './OcdTerraform'
import OcdVariables from './OcdVariables'
import OcdLibrary from './OcdLibrary'
import { OcdQueryDialog } from '../components/dialogs/OcdQueryDialog'
import { OcdConfigFacade } from '../facade/OcdConfigFacade'
import OcdDocumentation from './OcdDocumentation'
import { OcdCacheData } from '../components/OcdCache'
import { OcdCacheFacade } from '../facade/OcdCacheFacade'
import { loadDesign } from '../components/Menu'
import { OcdValidationResult, OcdValidator } from '@ocd/model'
import OcdValidation from './OcdValidation'
import { buildDetails } from '../data/OcdBuildDetails'
import OcdHelp from './OcdHelp'
import OcdCommonTags from './OcdCommonTags'
import { OcdReferenceDataQueryDialog } from '../components/dialogs/OcdReferenceDataQueryDialog'
import { OcdActiveFileContext, OcdCacheContext, OcdConsoleConfigContext, OcdDialogContext, OcdDocumentContext, OcdDragResourceContext, OcdSelectedResourceContext } from './OcdConsoleContext'
import { OcdExportToResourceManagerDialog } from '../components/dialogs/OcdExportToResourceManagerDialog'

export const ThemeContext = createContext<string>('')
export const ActiveFileContext = createContext<OcdActiveFileContext>({activeFile: {name: '', modified: false}, setActiveFile: () => {}})
export const ConsoleConfigContext = createContext<OcdConsoleConfigContext>({ocdConsoleConfig: OcdConsoleConfig.new(), setOcdConsoleConfig: () => {}})
export const CacheContext = createContext<OcdCacheContext>({ocdCache: OcdCacheData.new(), setOcdCache: () => {}})
export const DocumentContext = createContext<OcdDocumentContext>({ocdDocument: OcdDocument.new(), setOcdDocument: () => {}})
export const SelectedResourceContext = createContext<OcdSelectedResourceContext>({selectedResource: OcdDocument.newSelectedResource(), setSelectedResource: () => {}})
export const DragResourceContext = createContext<OcdDragResourceContext>({dragResource: OcdDocument.newDragResource(), setDragResource: () => {}})
export const DialogContext = createContext<OcdDialogContext>({displayDialog: '', setDisplayDialog: () => {}})

export const OcdConsole = (): JSX.Element => {
    // State Variables
    const [ocdDocument, setOcdDocument] = useState(OcdDocument.new())
    const [ocdConsoleConfig, setOcdConsoleConfig] = useState(OcdConsoleConfig.new())
    const [ocdCache, setOcdCache] = useState(OcdCacheData.new())
    const [activeFile, setActiveFile] = useState({name: '', modified: false})
    const [selectedResource, setSelectedResource] = useState({} as OcdSelectedResource)
    // Memo Hooks
    const activeFileContext = useMemo(() => ({activeFile, setActiveFile}), [activeFile])
    const cacheContext = useMemo(() => ({ocdCache, setOcdCache}), [ocdCache])
    const consoleConfigContext = useMemo(() => ({ocdConsoleConfig, setOcdConsoleConfig}), [ocdConsoleConfig])
    const documentContext = useMemo(() => ({ocdDocument, setOcdDocument}), [ocdDocument])
    const selectedResourceContext = useMemo(() => ({selectedResource, setSelectedResource}), [selectedResource])
    // Effect Hooks
    // Check if OKIT-Ocd opened because of Double Click on file on OS
    useEffect(() => {
        // @ts-ignore
        if (window.ocdAPI) window.ocdAPI.onOpenFile((event, filePath) => { // Running as an Electron App
            console.debug('OcdConsole: onOpenFile', filePath)
            loadDesign(filePath, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
        })
    }, []) // Empty Array to only run on initial render
    // Load the Console Config Information
    useEffect(() => {
        OcdConfigFacade.loadConsoleConfig().then((results) => {
            console.debug('OcdConsole: Load Console Config', results)
            const consoleConfig = new OcdConsoleConfig(results)
            setOcdConsoleConfig(consoleConfig)
        }).catch((response) => {
            console.debug('OcdConsole: Load Console Config', response)
            OcdConfigFacade.saveConsoleConfig(ocdConsoleConfig.config).then((results) => {}).catch((response) => console.debug('OcdConsole:', response))
            // OcdConfigFacade.saveConsoleConfig(ocdConsoleConfig.config).then((results) => {console.debug('OcdConsole: Saved Console Config')}).catch((response) => console.debug('OcdConsole:', response))
        })
    }, []) // Empty Array to only run on initial render
    // Load the Dropdown Resource Cache
    useEffect(() => {
        ocdCache.loadCache().then((results) => {
            console.debug('OcdConsole: useEffect: loadCache:', ocdCache)
        })
    }, []) // Empty Array to only run on initial render
    const setAndSaveOcdConsoleConfig = (consoleConfig: OcdConsoleConfig) => {
        OcdConfigFacade.saveConsoleConfig(consoleConfig.config).then((results) => {}).catch((response) => console.debug('OcdConsole:', response))
        // OcdConfigFacade.saveConsoleConfig(consoleConfig.config).then((results) => {console.debug('OcdConsole: Saved Config')}).catch((response) => console.debug('OcdConsole:', response))
        setOcdConsoleConfig(consoleConfig)
    }
    const setAndSaveOcdCache = (cacheData: OcdCacheData) => {
        OcdCacheFacade.saveCache(cacheData.cache).then((results) => {}).catch((response) => console.debug('OcdConsole:', response))
        // OcdCacheFacade.saveCache(cacheData.cache).then((results) => {console.debug('OcdConsole: Saved Cache')}).catch((response) => console.debug('OcdConsole:', response))
        setOcdCache(cacheData)
    }
    console.debug('OcdConsole: Console Config', ocdConsoleConfig)
    console.debug('OcdConsole: Dropdown Cache', ocdCache)
    return (
        <ConsoleConfigContext.Provider value={consoleConfigContext}>
            <ActiveFileContext.Provider value={activeFileContext}>
                <CacheContext.Provider value={cacheContext}>
                    <DocumentContext.Provider value={documentContext}>
                        <SelectedResourceContext.Provider value={selectedResourceContext}>
                            <div className='ocd-console'>
                                <OcdConsoleHeader ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setAndSaveOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} />
                                <OcdConsoleToolbar ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setAndSaveOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} />
                                <OcdConsoleBody ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setAndSaveOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} />
                                <OcdConsoleFooter ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setAndSaveOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} />
                            </div>
                        </SelectedResourceContext.Provider>
                    </DocumentContext.Provider>
                </CacheContext.Provider>
            </ActiveFileContext.Provider>
        </ConsoleConfigContext.Provider>
    )
}

const OcdConsoleTitleBar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const [title, setTitle] = useState(ocdDocument.design.metadata.title)
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        ocdDocument.design.metadata.title = e.target.value
        setTitle(ocdDocument.design.metadata.title)
        // setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        console.debug('OcdConsole: OcdConsoleTitleBar: onPaste:', e.clipboardData)
        ocdDocument.design.metadata.title = e.clipboardData.getData('Text')
        setTitle(ocdDocument.design.metadata.title)
    }
    useEffect(() => setTitle(ocdDocument.design.metadata.title), [ocdDocument])
    return (
        <div className='ocd-console-title-bar'>
            <input id='ocd_document_title' type='text' value={title} onChange={onChange}></input>
        </div>
    )
}

const OcdConsoleHeader = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsoleHeaderProps): JSX.Element => {
    return (
        <div className='ocd-console-header ocd-console-header-theme'>
            <div className='ocd-image ocd-logo'></div>
            <div className='ocd-title-and-menu'>
                <OcdConsoleTitleBar ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig:any) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} />
                <OcdConsoleMenuBar ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig:any) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} />
            </div>
        </div>
    )
}

const OcdConsoleSettingsEditor = ({ ocdConsoleConfig, setOcdConsoleConfig }: any): JSX.Element => {
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
    return (
        <div className='ocd-console-toolbar-dropdown ocd-console-toolbar-dropdown-theme ocd-toolbar-separator-right'>
            <ul>
                <li className='ocd-console-toolbar-dropdown-item' onClick={toggleDropdown} aria-hidden>
                    <div className='settings ocd-console-toolbar-icon'></div>
                    <ul className={`${dropdown ? 'show' : 'hidden'}`}>
                        <li className='ocd-dropdown-menu-item'><div><label><input id='showPreviousViewOnStart' type='checkbox' onChange={showPreviousViewOnStartOnChange} ref={cbRef} checked={ocdConsoleConfig.config.showPreviousViewOnStart}/>Show Previous View On Start</label></div></li>
                        <li className='ocd-dropdown-menu-item'><div>--------------------------------</div></li>
                        <li className='ocd-dropdown-menu-item'><div><label><input id='zoomOnWheel' type='checkbox' onChange={zoomOnWheelOnChange} ref={cbRef} checked={ocdConsoleConfig.config.zoomOnWheel}/>Allow Zoom Mouse Wheel</label></div></li>
                    </ul>
                </li>
            </ul>
        </div>
    )
}

const OcdConsoleToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsoleToolbarProps): JSX.Element => {
    const [bothCollapsed, setBothCollapsed] = useState(!ocdConsoleConfig.config.showPalette && !ocdConsoleConfig.config.showProperties)
    const onValidateClick = () => {
        ocdConsoleConfig.config.displayPage = 'validation'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }
    const onEstimateClick = () => {
        console.info('Estimate Clicked')
    }
    let PageLeftToolbar = OcdEmptyLeftRightToolbar
    let PageRightToolbar = OcdEmptyLeftRightToolbar
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
    const validationResults = OcdValidator.validate(ocdDocument.design)
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
                    <PageLeftToolbar 
                        ocdConsoleConfig={ocdConsoleConfig} 
                        setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                        ocdDocument={ocdDocument} 
                        setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                        />
                </div>
            </div>
            <div className='ocd-toolbar-centre'>
                <div>
                </div>
            </div>
            <div className='ocd-toolbar-right'>
                <div>
                    <PageRightToolbar 
                        ocdConsoleConfig={ocdConsoleConfig} 
                        setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                        ocdDocument={ocdDocument} 
                        setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                        />
                    <div className={validateClassName} title={validateTitle} onClick={onValidateClick} aria-hidden></div>
                    {/* <div className='cost-estimate ocd-console-toolbar-icon' onClick={onEstimateClick}></div> */}
                </div>
            </div>
        </div>
    )
}

const OcdEmptyLeftRightToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {return (<></>)}

const OcdConsoleBody = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const showQueryDialog = ocdDocument.query
    const showReferenceDataQueryDialog = ocdConsoleConfig.queryReferenceData
    const showExportToResourceManagerDialog = ocdDocument.dialog.resourceManager
    console.debug('OcdConsoleBody: Dialogs: Query', showQueryDialog, 'ReferenceData', showReferenceDataQueryDialog, 'Resource Manager', showExportToResourceManagerDialog)
    let DisplayPage = OcdDesigner
    switch (ocdConsoleConfig.config.displayPage) {
        case 'bom':
            DisplayPage = OcdBom
            break;
        case 'designer':
            DisplayPage = OcdDesigner
            break;
        case 'documentation':
            DisplayPage = OcdDocumentation
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
        case 'help':
            DisplayPage = OcdHelp
            break;
        case 'library':
            DisplayPage = OcdLibrary
            break;
    }
    // console.debug('OcdConsole: Show Query Dialog', showQueryDialog)
    return (
        <div className='ocd-console-body ocd-console-body-theme'>
            {/* <OcdDesigner ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig:any) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} /> */}
            <DisplayPage 
                ocdConsoleConfig={ocdConsoleConfig} 
                setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} 
                key={`${ocdConsoleConfig.config.displayPage}-page`}
                />
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
        </div>
    )
}

const OcdConsoleFooter = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const {ocdCache, setOcdCache} = useContext(CacheContext)
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
    const {ocdCache, setOcdCache} = useContext(CacheContext)
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        ocdCache.cache.profile = e.target.value
        setOcdCache(OcdCacheData.clone(ocdCache))
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