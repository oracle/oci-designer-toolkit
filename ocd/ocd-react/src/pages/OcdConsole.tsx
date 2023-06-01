/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React, { useEffect, useRef, useState } from 'react'
import OcdDesigner from './OcdDesigner'
import OcdDocument from '../components/OcdDocument'
import OcdConsoleMenuBar from '../components/OcdConsoleMenuBar'
import OcdConsoleConfig from '../components/OcdConsoleConfiguration'
import { ConsolePageProps } from '../types/Console'
import OcdBom from './OcdBom'
import OcdMarkdown from './OcdMarkdown'
import OcdTabular from './OcdTabular'
import OcdTerraform from './OcdTerraform'
import OcdVariables from './OcdVariables'
// import { OcdPropertiesPanel, OcdPropertiesToolbarButton } from '../properties/OcdPropertiesPanel'

const OcdConsole = (): JSX.Element => {
    const [ocdDocument, setOcdDocument] = useState(OcdDocument.new())
    const [ocdConsoleConfig, setOcdConsoleConfig] = useState(OcdConsoleConfig.new())
    useEffect(() => {setOcdDocument(ocdDocument)}, [ocdDocument])
    return (
        <div className='ocd-console'>
            <OcdConsoleHeader ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}/>
            <OcdConsoleToolbar ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} />
            <OcdConsoleBody ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} />
            <OcdConsoleFooter ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} />
        </div>
    )
}

const OcdConsoleTitleBar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        ocdDocument.design.metadata.title = e.target.value.trim()
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-console-title-bar'>
            <input type='text' value={ocdDocument.design.metadata.title} onChange={onChange}></input>
        </div>
    )
}

const OcdConsoleHeader = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    return (
        <div className='ocd-console-header ocd-console-header-theme'>
            <div className='ocd-image ocd-logo'></div>
            <div className='ocd-title-and-menu'>
                <OcdConsoleTitleBar ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig:any) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)}/>
                <OcdConsoleMenuBar ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig:any) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)}/>
            </div>
        </div>
    )
}

const OcdConsoleConfigEditor = ({ ocdConsoleConfig, setOcdConsoleConfig }: any): JSX.Element => {
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
    // const showModelPaletteOnChange = () => {
    //     ocdConsoleConfig.config.showModelPalette = !ocdConsoleConfig.config.showModelPalette
    //     setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    // }
    return (
        <div className='ocd-console-toolbar-dropdown'>
            <ul>
                <li className='ocd-console-toolbar-dropdown-item' onClick={toggleDropdown}>
                    <div className='left-palette ocd-console-toolbar-icon'></div>
                    <ul className={`${dropdown ? 'show' : 'hidden'}`}>
                        <li className='ocd-dropdown-menu-item'><div><input id='detailedResource' type='checkbox' onChange={detailedResourceOnChange} ref={cbRef} checked={ocdConsoleConfig.config.detailedResource}/>Resource Details</div></li>
                        <li className='ocd-dropdown-menu-item'><div><input id='verboseProviderPalette' type='checkbox' onChange={verboseProviderPaletteOnChange} ref={cbRef} checked={ocdConsoleConfig.config.verboseProviderPalette}/>Verbose Palette</div></li>
                        {/* <li className='ocd-dropdown-menu-item'><div><input id='showModelPalette' type='checkbox' onChange={showModelPaletteOnChange} ref={cbRef} checked={ocdConsoleConfig.config.showModelPalette}/>Model Palette</div></li> */}
                    </ul>
                </li>
            </ul>
        </div>
    )
}

const OcdConsoleToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const onValidateClick = () => {
        console.info('Validate Clicked')
        console.info(ocdConsoleConfig)
        console.info(setOcdConsoleConfig)
        console.info(ocdDocument.design)
        console.info(setOcdDocument)
    }
    const onEstimateClick = () => {
        console.info('Estimate Clicked')
    }
    return (
        <div className='ocd-console-toolbar ocd-console-toolbar-theme'>
            <div className='ocd-toolbar-left'>
                <div>
                    {/* <div className='left-palette ocd-console-toolbar-icon' onClick={onLeftPaletteClick} ref={leftPaletteRef}></div> */}
                    <OcdConsoleConfigEditor 
                        ocdConsoleConfig={ocdConsoleConfig} 
                        setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                        />
                </div>
            </div>
            <div className='ocd-toolbar-right'>
                <div>
                    <div className='validate ocd-console-toolbar-icon' onClick={onValidateClick}></div>
                    {/* <OcdPropertiesToolbarButton ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} /> */}
                    <div className='cost-estimate ocd-console-toolbar-icon' onClick={onEstimateClick}></div>
                </div>
            </div>
        </div>
    )
}

const OcdConsoleBody = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const DisplayPage = ocdConsoleConfig.config.displayPage === 'bom' ? OcdBom : 
                        ocdConsoleConfig.config.displayPage === 'designer' ? OcdDesigner : 
                        ocdConsoleConfig.config.displayPage === 'markdown' ? OcdMarkdown : 
                        ocdConsoleConfig.config.displayPage === 'tabular' ? OcdTabular : 
                        ocdConsoleConfig.config.displayPage === 'terraform' ? OcdTerraform : 
                        ocdConsoleConfig.config.displayPage === 'variables' ? OcdVariables : 
                        OcdDesigner
    return (
        <div className='ocd-console-body'>
            {/* <OcdDesigner ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig:any) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} /> */}
            <DisplayPage 
                ocdConsoleConfig={ocdConsoleConfig} 
                setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} 
                key={`${ocdConsoleConfig.config.displayPage}-page`}
                />
            {/* <OcdPropertiesPanel ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={(ocdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} ocdDocument={ocdDocument} setOcdDocument={(ocdDocument) => setOcdDocument(ocdDocument)} ocdResource={resource} /> */}
        </div>
    )
}

const OcdConsoleFooter = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    return (
        <div className='ocd-console-footer ocd-console-footer-theme'></div>
    )
}

export default OcdConsole