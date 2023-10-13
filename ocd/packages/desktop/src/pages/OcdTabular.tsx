/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from "react"
import { ConsolePageProps } from "../types/Console"
import { OcdUtils } from "@ocd/core"
import { OciResource } from "@ocd/model"

const OcdTabular = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const [selected, setSelected] = useState('compartment')
    const ociResources = ocdDocument.getOciResourcesObject()
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
                <div id='ocd_resource_grid' className='table ocd-tabular-content'>
                    <div className='thead ocd-tabular-list-header'><div className='tr'><div className='th'>{ociResources[selected].length}</div><div className='th'>Name</div><div className='th'>Compartment</div></div></div>
                    <div className='tbody ocd-tabular-list-body'>
                    {ociResources[selected].map((r: OciResource, i: number) => {
                        return <div className='tr'><div className='td'>{i + 1}</div><div className='td'>{r.displayName}</div><div className='td'>{r.compartmentId ? ocdDocument.getResource(r.compartmentId).displayName : ''}</div></div>
                        // return <OcdTabularResourceRow
                        // index={i + 1}
                        // ociResource={r}
                        // />
                    })}
                    </div>
                </div>
            </div>
        </div>
    )
}

const OcdTabularResourceRow = ({ index, ociResource }: {index: number, ociResource: OciResource}): JSX.Element => {
    return (
        <div className='ocd-tabular-list-row'><div>{index}</div><div>{ociResource.displayName}</div></div>
    )
}

export default OcdTabular