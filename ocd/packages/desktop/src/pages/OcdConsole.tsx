/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { OcdDesigner, OcdDesignerLeftToolbar, OcdDesignerRightToolbar } from './OcdDesigner'
import { OcdDocument } from '../components/OcdDocument'
import OcdConsoleMenuBar from '../components/OcdConsoleMenuBar'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import { ConsoleHeaderProps, ConsolePageProps, ConsoleToolbarProps, OcdSelectedResource } from '../types/Console'
import OcdBom from './OcdBom'
import OcdMarkdown from './OcdMarkdown'
import OcdTabular from './OcdTabular'
import OcdTerraform from './OcdTerraform'
import OcdVariables from './OcdVariables'
import { OcdQueryDialog } from '../components/dialogs/OcdQueryDialog'
import { OcdConfigFacade } from '../facade/OcdConfigFacade'
import OcdDocumentation from './OcdDocumentation'
import { OcdCacheData } from '../components/OcdCache'
import { OcdCacheFacade } from '../facade/OcdCacheFacade'
import { loadDesign } from '../components/Menu'
import { OcdResource, OcdValidationResult, OcdValidator } from '@ocd/model'
import OcdValidation from './OcdValidation'
import { buildDetails } from '../data/OcdBuildDetails'
import OcdHelp from './OcdHelp'
import OcdCommonTags from './OcdCommonTags'
import { OcdReferenceDataQueryDialog } from '../components/dialogs/OcdReferenceDataQueryDialog'
import { OcdActiveFileContext, OcdCacheContext, OcdConsoleConfigContext, OcdDocumentContext, OcdSelectedResourceContext } from './OcdConsoleContext'

// Import css as text
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
// import svgThemeCss from '!!css-loader?{"sourceMap":false,"exportType":"string"}!../css/oci-theme.css'

export const ThemeContext = createContext<string>('')
export const ActiveFileContext = createContext<OcdActiveFileContext>({activeFile: {name: '', modified: false}, setActiveFile: () => {}})
export const ConsoleConfigContext = createContext<OcdConsoleConfigContext>({ocdConsoleConfig: OcdConsoleConfig.new(), setOcdConsoleConfig: () => {}})
export const CacheContext = createContext<OcdCacheContext>({ocdCache: OcdCacheData.new(), setOcdCache: () => {}})
export const DocumentContext = createContext<OcdDocumentContext>({ocdDocument: OcdDocument.new(), setOcdDocument: () => {}})
export const SelectedResourceContext = createContext<OcdSelectedResourceContext>({selectedResource: OcdDocument.newSelectedResource(), setSelectedResource: () => {}})

const OcdConsole = (): JSX.Element => {
    // console.debug('OcdConsole: CSS', svgThemeCss)
    const [ocdDocument, setOcdDocument] = useState(OcdDocument.new())
    const [ocdConsoleConfig, setOcdConsoleConfig] = useState(OcdConsoleConfig.new())
    const [ocdCache, setOcdCache] = useState(OcdCacheData.new())
    const [activeFile, setActiveFile] = useState({name: '', modified: false})
    const [selectedResource, setSelectedResource] = useState({} as OcdSelectedResource)
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
    useEffect(() => {
        // @ts-ignore
        if (window.ocdAPI) window.ocdAPI.onOpenFile((event, filePath) => { // Running as an Electron App
            console.debug('OcdConsole: onOpenFile', filePath)
            loadDesign(filePath, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
        })
    }, []) // Empty Array to only run on initial render
    // useEffect(() => {
    //     OcdCacheFacade.loadCache().then((results) => {
    //         console.debug('OcdConsole: Load Cache', results)
    //         const cacheData = new OcdCacheData(results)
    //         setOcdCache(cacheData)
    //     }).catch((response) => {
    //         console.debug('OcdConsole:', response)
    //         OcdCacheFacade.saveCache(ocdCache.cache).then((results) => {console.debug('OcdConsole: Saved Cache')}).catch((response) => console.debug('OcdConsole:', response))
    //     })
    // }, []) // Empty Array to only run on initial render
    // useEffect(() => {
    //     if (ocdCache === undefined) {
    //         OcdCacheFacade.loadCache().then((results) => {
    //             console.debug('OcdConsole: Load Cache', results)
    //             const cacheData = new OcdCacheData(results)
    //             setOcdCache(cacheData)
    //         }).catch((response) => {
    //             console.debug('OcdConsole:', response)
    //             const cacheData = OcdCacheData.new()
    //             setOcdCache(cacheData)
    //             // OcdCacheFacade.saveCache(ocdCache.cache).then((results) => {console.debug('OcdConsole: Saved Cache')}).catch((response) => console.debug('OcdConsole:', response))
    //         })
    //     } else {
    //         OcdCacheFacade.saveCache(ocdCache.cache).then((results) => {console.debug('OcdConsole: Saved Cache')}).catch((response) => console.debug('OcdConsole:', response))
    //     }
    // }, [ocdCache]) // Empty Array to only run on initial render
    // const [ociConfig, setOciConfig] = useState('')
    // useEffect(() => {setOcdDocument(ocdDocument)}, [ocdDocument])
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
    return (
        <ConsoleConfigContext.Provider value={{ocdConsoleConfig, setOcdConsoleConfig}}>
            <ActiveFileContext.Provider value={{activeFile, setActiveFile}}>
                <CacheContext.Provider value={{ocdCache, setOcdCache}}>
                    <DocumentContext.Provider value={{ocdDocument, setOcdDocument}}>
                        <SelectedResourceContext.Provider value={{selectedResource, setSelectedResource}}>
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
    // const onMouseEnter = () => {setDropdown(true)}
    // const onMouseLeave = () => {setDropdown(false)}
    // const closeDropdown = () => {setDropdown(!dropdown)}
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
                <li className='ocd-console-toolbar-dropdown-item' onClick={toggleDropdown}>
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
    const hideZoomClassName = ocdConsoleConfig.config.displayPage === 'designer' ? '' : 'hidden'
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
                    {!hideZoomClassName && <OcdDesignerLeftToolbar 
                        ocdConsoleConfig={ocdConsoleConfig} 
                        setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                        ocdDocument={ocdDocument} 
                        setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                        />}
                </div>
            </div>
            <div className='ocd-toolbar-centre'>
                <div>
                </div>
            </div>
            <div className='ocd-toolbar-right'>
                <div>
                    {!hideZoomClassName && <OcdDesignerRightToolbar 
                        ocdConsoleConfig={ocdConsoleConfig} 
                        setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                        ocdDocument={ocdDocument} 
                        setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                        />}
                    <div className={validateClassName} title={validateTitle} onClick={onValidateClick}></div>
                    {/* <div className='cost-estimate ocd-console-toolbar-icon' onClick={onEstimateClick}></div> */}
                </div>
            </div>
        </div>
    )
}

const OcdConsoleBody = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const showQueryDialog = ocdDocument.query
    const showReferenceDataQueryDialog = ocdConsoleConfig.queryReferenceData
    const DisplayPage = ocdConsoleConfig.config.displayPage === 'bom' ? OcdBom : 
                        ocdConsoleConfig.config.displayPage === 'designer' ? OcdDesigner : 
                        ocdConsoleConfig.config.displayPage === 'documentation' ? OcdDocumentation : 
                        ocdConsoleConfig.config.displayPage === 'markdown' ? OcdMarkdown : 
                        ocdConsoleConfig.config.displayPage === 'tabular' ? OcdTabular : 
                        ocdConsoleConfig.config.displayPage === 'tags' ? OcdCommonTags : 
                        ocdConsoleConfig.config.displayPage === 'terraform' ? OcdTerraform : 
                        ocdConsoleConfig.config.displayPage === 'variables' ? OcdVariables : 
                        ocdConsoleConfig.config.displayPage === 'validation' ? OcdValidation : 
                        ocdConsoleConfig.config.displayPage === 'help' ? OcdHelp : 
                        OcdDesigner
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