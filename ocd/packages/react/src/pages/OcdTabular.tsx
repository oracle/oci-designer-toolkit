/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from "react"
import { ConsolePageProps } from "../types/Console"
import { OcdUtils } from "@ocd/core"
import { OciResource } from "@ocd/model"
import { OciDefault } from "../components/tabular/provider/oci/OciTabularContents"
import * as ociTabularResources from '../components/tabular/provider/oci/resources'

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
                {Object.keys(ociResources).sort(OcdUtils.simpleSort).map((k: string) => {
                    return <div className={`ocd-designer-canvas-layer ${k === selected ? 'ocd-layer-selected' : ''}`} key={k}><label id={k} onClick={onClick}>{`${OcdUtils.toTitle(k)} (${ociResources[k].length})`}</label></div>
                })}
            </div>
            <div id='selected_resource_tab' className='ocd-selected-tabular-content'>
                <ResourceTabularContents ocdDocument={ocdDocument} ociResources={ociResources} selected={selected} key={`${selected}-tabular-contents`}/>
            </div>
        </div>
    )
}

export default OcdTabular