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
    const resourceJSXMethod = `${OcdUtils.toTitleCase('Oci')}${OcdUtils.toTitleCase(selected)}`
    // @ts-ignore 
    const ResourceTabularContents = ociTabularResources[resourceJSXMethod] ? ociTabularResources[resourceJSXMethod] : OciDefault
    console.debug('OcdTabular: JMXMethod', resourceJSXMethod, ResourceTabularContents, ociTabularResources)
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
                {Object.keys(ociResources).map((k: string) => {
                    return <div className={`ocd-designer-canvas-layer ${k === selected ? 'ocd-layer-selected' : ''}`} key={k}><label id={k} onClick={onClick}>{`${OcdUtils.toTitle(k)} (${ociResources[k].length})`}</label></div>
                })}
            </div>
            <div id='selected_resource_tab' className='ocd-selected-tabular-content'>
                <ResourceTabularContents ocdDocument={ocdDocument} ociResources={ociResources} selected={selected}/>
                {/* <div id='ocd_resource_grid' className='table ocd-tabular-content'>
                    <div className='thead ocd-tabular-list-header'><div className='tr'><div className='th'>{ociResources[selected].length}</div><div className='th'>Name</div><div className='th'>Compartment</div></div></div>
                    <div className='tbody ocd-tabular-list-body'>
                    {ociResources[selected].map((r: OciResource, i: number) => {
                        return <div className='tr'><div className='td'>{i + 1}</div><div className='td'>{r.displayName}</div><div className='td'>{ocdDocument.getResource(r.compartmentId) ? ocdDocument.getResource(r.compartmentId).displayName : ''}</div></div>
                    })}
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default OcdTabular