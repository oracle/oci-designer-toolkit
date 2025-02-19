/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from "react"
import { ConsolePageProps } from "../types/Console"
import { OcdUtils, ociNoneVisualResources } from "@ocd/core"
import { OciDefault } from "../components/tabular/provider/oci/OciTabularContents"
import * as ociTabularResources from '../components/tabular/provider/oci/resources'
import { OcdDesignFacade } from "../facade/OcdDesignFacade"

const OcdTabular = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const [selected, setSelected] = useState('compartment')
    const ociResources = ocdDocument.getOciResourcesObject()
    const resourceJSXMethod = `${OcdUtils.toTitleCase('Oci')}${OcdUtils.toTitleCase(selected.split('_').join(' ')).split(' ').join('')}`
    // @ts-ignore 
    const ResourceTabularContents = ociTabularResources[resourceJSXMethod] ? ociTabularResources[resourceJSXMethod] : OciDefault
    console.debug('OcdTabular: JMXMethod', resourceJSXMethod)
    console.debug('OcdTabular: ResourceTabularContents', ResourceTabularContents)
    console.debug('OcdTabular: ociTabularResources', ociTabularResources)
    console.debug('OcdTabular: ociResources', ociResources)
    console.debug('OcdTabular: ociResources Keys', Object.keys(ociResources))
    if (Object.keys(ociResources).length === 1 && selected !== 'compartment') {
        // ResourceTabularContents = OciDefault
        setSelected('compartment')
    }
    const onClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        // @ts-ignore
        const selectedTab = e.target.id
        setSelected(selectedTab)
    }
    return (
        <div className='ocd-tabular-view'>
            <div id='ocd_resources_bar' className='ocd-designer-canvas-layers'>
                {Object.keys(ociResources).filter((k: string) => !ociNoneVisualResources.includes(k)).sort(OcdUtils.simpleSort).map((k: string) => {
                    return <div className={`ocd-designer-canvas-layer ${k === selected ? 'ocd-layer-selected' : ''}`} key={k}><label id={k} onClick={onClick} aria-hidden>{`${OcdUtils.toTitle(k)} (${ociResources[k].length})`}</label></div>
                })}
            </div>
            <div id='selected_resource_tab' className='ocd-selected-tabular-content'>
                <ResourceTabularContents ocdDocument={ocdDocument} ociResources={ociResources} selected={selected} key={`${selected}-tabular-contents`}/>
            </div>
        </div>
    )
}

export interface ExcelResource {
    sheetName: string
    resourceName: string
    displayColumns: string[]
}

export const OcdTabularLeftToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    // const {ocdConsoleConfig, setOcdConsoleConfig} = useContext(ConsoleConfigContext)
    const onClickExcel = () => {
        console.debug('OcdTabular: Export to Excel')
        const design = JSON.parse(JSON.stringify(ocdDocument.design)) // Resolve cloning issue when design changed
        const displayColumns = ocdConsoleConfig.config.displayColumns || {}
        console.debug('OcdTabular: Export to Excel - design', design)
        console.debug('OcdTabular: Export to Excel - displayColumns', displayColumns)
        OcdDesignFacade.exportToExcel(design, `design.xlsx`).then((results) => {
            console.debug('Exported to Excel')
        }).catch((error) => {
            console.warn('Export To Excel Failed with', error)
            alert(error)
        })
    }
    return (
        <div className='ocd-designer-toolbar'>
            <div className='ocd-console-toolbar-icon excel' title='Export to Excel' onClick={onClickExcel} aria-hidden></div>
        </div>
    )
}

export const OcdTabularRightToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    return (
        <div className='ocd-designer-toolbar'></div>
    )
}

export default OcdTabular