/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { useContext, useEffect, useState } from "react"
import { ConsolePageProps } from "../types/Console"
import { OcdDocument } from "../components/OcdDocument"
import { OcdDesignFacade } from "../facade/OcdDesignFacade"
import { ActiveFileContext, ConsoleConfigContext } from "./OcdConsole"
import { OcdConsoleConfig } from "../components/OcdConsoleConfiguration"

interface OcdLibraryDesign {
    title: string
    description: string
    okitFile: string
    svgFile: string
    dataUri: string
}

export interface OcdLibrary extends Record<string, OcdLibraryDesign[]> {
    oci: OcdLibraryDesign[]
    azure: OcdLibraryDesign[]
    google: OcdLibraryDesign[]
    aws: OcdLibraryDesign[]
    pca: OcdLibraryDesign[]
    c3: OcdLibraryDesign[]
}

const emptyLibrary: OcdLibrary = {
    oci: [],
    azure: [],
    google: [],
    aws: [],
    pca: [],
    c3: [],
}

interface LibraryDesignProps {
    section: string
    architecture: OcdLibraryDesign
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
}

const OcdLibraryDesign = ({section, architecture, ocdDocument, setOcdDocument}: LibraryDesignProps): JSX.Element => {
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const {ocdConsoleConfig, setOcdConsoleConfig} = useContext(ConsoleConfigContext)
    const style: React.CSSProperties = {backgroundImage: `url("${architecture.dataUri}")`, userSelect: 'none'}
    const [designStyle, setDesignStyle] = useState<React.CSSProperties>(style)
    const [descriptionStyle, setDescriptionStyle] = useState<React.CSSProperties>({})
    const onDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        // Fetch the .okit file
        if (activeFile.modified) {
            OcdDesignFacade.discardConfirmation().then((discard) => {
                if (discard) {
                    loadDesign(section, architecture.okitFile, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
                }
            }).catch((resp) => {console.warn('Discard Failed with', resp)})
        } else {
            loadDesign(section, architecture.okitFile, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
            // OcdDesignFacade.loadLibraryDesign(section, architecture.okitFile).then((results) => {
            //     const ocdDocument = OcdDocument.new()
            //     ocdDocument.design = results.design
            //     setOcdDocument(ocdDocument)
            //     setActiveFile({name: results.filename, modified: false})
            //     ocdConsoleConfig.config.displayPage = 'designer'
            //     setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
            // })
        }
    }
    const onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDesignStyle({...style, backgroundSize: "contain", backgroundPosition: "bottom center"})
        setDescriptionStyle({opacity: 0.2})
        // setDesignStyle({...style, backgroundSize: "var(--library-design-width)"})
    }
    const onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDesignStyle(style)
        setDescriptionStyle({})
    }
    return (
        <div className='ocd-library-design' style={designStyle} onDoubleClick={onDoubleClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div className='ocd-library-design-title'><span>{architecture.title}</span></div>
            <div className='ocd-library-design-description' style={descriptionStyle}><span>{architecture.description}</span></div>
        </div>
    )
}

export const loadDesign = (section: string, filename: string, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, setActiveFile: Function) => {
    OcdDesignFacade.loadLibraryDesign(section, filename).then((results) => {
        const ocdDocument = OcdDocument.new()
        ocdDocument.design = results.design
        setOcdDocument(ocdDocument)
        setActiveFile({name: results.filename, modified: false})
        ocdConsoleConfig.config.displayPage = 'designer'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    })
}

interface LibraryContentsProps {
    section: string
    library: OcdLibraryDesign[]
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
}

const OcdLibraryContents = ({section, library, ocdDocument, setOcdDocument}: LibraryContentsProps): JSX.Element => {
    return (
        <div className='ocd-library-content'>
            {library.map((l: OcdLibraryDesign) => {
                return <OcdLibraryDesign section={section} architecture={l} ocdDocument={ocdDocument} setOcdDocument={setOcdDocument} key={`${l.title.split(' ').join('-')}-library-contents`}/>
            })}
        </div>
    )
}

export const OcdLibrary = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const [selected, setSelected] = useState('oci')
    const [tabs, setTabs] = useState(['Loading..........'])
    const [library, setLibrary] = useState<OcdLibrary>(emptyLibrary)
    const [selectedLibrary, setSelectedLibrary] = useState<OcdLibraryDesign[]>(emptyLibrary.oci)
    const onClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        // @ts-ignore
        const selectedTab: string = e.target.id
        setSelected(selectedTab)
        setSelectedLibrary(library[selectedTab])
    }
    useEffect(() => {
        OcdDesignFacade.loadLibraryIndex().then((results) => {
            console.debug('OcdLibrary: Loaded Library Index', results)
            console.debug('OcdLibrary: Loaded Library Index', results[selected])
            console.debug('OcdLibrary: Loaded Library Index', Object.keys(results))
            setTabs(Object.keys(results))
            setLibrary(results)
            setSelectedLibrary(results[selected])
        }).catch((resp) => {
            console.warn('OcdLibrary: Load Library Index Failed with', resp)
            setTabs(['Failed To Read Library Index'])
        })
    }, []) // Empty Array to only run on initial render

    return (
        <div className='ocd-library-view'>
            <div id='ocd_resources_bar' className='ocd-designer-canvas-layers'>
                {tabs.map((k: string) => {
                    return <div className={`ocd-designer-canvas-layer ${k === selected ? 'ocd-layer-selected' : ''}`} key={k}><label id={k} onClick={onClick} aria-hidden>{`${k}`}</label></div>
                })}
            </div>
            <div id='selected_resource_tab' className='ocd-selected-tabular-content'>
                <OcdLibraryContents section={selected} library={selectedLibrary} ocdDocument={ocdDocument} setOcdDocument={setOcdDocument} key={`${selected}-library-contents`}/>
            </div>
        </div>
    )
}

export default OcdLibrary