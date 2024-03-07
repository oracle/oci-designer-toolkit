/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from 'react'
import { PaletteResource } from '@ocd/model'
import { DragData, Point } from '../types/DragData'
import { PaletteProps } from '../types/ReactComponentProperties'
import { OcdUtils } from '@ocd/core'

const OcdModelPalette = ({ ocdConsoleConfig, setDragData, ocdDocument }: PaletteProps): JSX.Element => {
    return (
    <div className='ocd-model-palette'>
        {Object.entries(ocdDocument.design.model).map(([p, m]) => {
            return <OcdModelPaletteProviders 
                        provider={p} 
                        model={m} 
                        setDragData={(dragData:any) => setDragData(dragData)}
                        key={`${p}-model-palette-providers`}
                        />
        })}
    </div>
)
}

const OcdModelPaletteProviders = ({ provider, model, setDragData }: any): JSX.Element => {
    const open = true
    const modelExcludeResources = ['compartment']
    const hiddenResourceTypes = [
        'boot_volume_attachment',
        'load_balancer_backend',
        'network_load_balancer_backend',
        'network_security_group_security_rule',
        'vnic_attachment',
        'volume_attachment'
    ]
    return (
        <div className='ocd-designer-palette-provider'>
            <details id={provider.title} open={open}>
                <summary><div className={provider}><label>{provider.toUpperCase()}</label></div></summary>
                <div>
                    <ul>
                        {Object.entries(model.resources).filter(([k, v]) => !modelExcludeResources.includes(k)).sort((a, b) => a[0].localeCompare(b[0])).filter(([k, r]) => !hiddenResourceTypes.includes(k)).map(([k, resources]) => {
                            return <OcdModelPaletteResources 
                                        provider={provider}
                                        type={k} 
                                        resources={resources} 
                                        setDragData={(dragData:any) => setDragData(dragData)}
                                        key={`${provider}-${k}-model-palette-resources`}
                                        />
                        })}
                    </ul>
                </div>
            </details>
        </div>
    )
}

const OcdModelPaletteResources = ({ provider, type, resources, setDragData }: any): JSX.Element => {
    const [collapsed, setCollapsed] = useState(false)
    const onClick = () => {setCollapsed(!collapsed)}
    const onDragStart = (dragData: any) => {setDragData(dragData)}
    const onDragEnd = () => {}
    return (
        <li className='collapsible-list-element'>
            <div className={collapsed ? 'tree-collapsed' : ''} onClick={onClick}><label>{OcdUtils.toTitle(type)}</label></div>
            <ul className={collapsed ? 'hidden' : ''}>
                {resources.map((r: any) => {
                    return <OcdModelPaletteResource 
                                provider={provider} 
                                type={type} 
                                resource={r} 
                                onDragStart={(dragData:any) => onDragStart(dragData)}
                                onDragEnd={() => onDragEnd()}
                                key={r.id}
                                />
                })}
            </ul>
        </li>
    )
}

const OcdModelPaletteResource = ({ provider, type, resource, onDragStart, onDragEnd }: any): JSX.Element => {
    // const classname = `${provider}-${type}`
    const classname = OcdUtils.toCssClassName(provider, type)
    const containerResources = ['vcn', 'subnet', 'load_balancer']
    console.info('OcdModelPalette: Classname:', classname, type)
    const onPaletteDragStart = (e: React.MouseEvent<HTMLElement>) => {
        // Get current Target Coordinates
        const currentTargetRect = e.currentTarget.getBoundingClientRect()
        // Now get Offset
        const offset: Point = {x: e.clientX - currentTargetRect.x, y: e.clientY - currentTargetRect.y}
        // Start Drag
        const dragResource: PaletteResource = {
                container: containerResources.includes(type),
                title: resource.resourceTypeName,
                class: classname,
                provider: provider
        }
        const dragData: DragData = { 
            dragObject: dragResource, 
            offset: offset, 
            existingResource: true,
            resourceType: type,
            resource: resource 
        }
        console.info('Drag Data', dragData)
        onDragStart(dragData)
    }
    const onPaletteDragEnd = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        onDragEnd()
    }
    return (
        <li className={`simple-list-element`}>
            <div>
                <div className={`${classname} draggable`}
                    draggable="true" 
                    onDragStart={onPaletteDragStart} 
                    onDragEnd={onPaletteDragEnd}
                    >
                </div>
                <label>{resource.displayName ? resource.displayName : resource.name}</label>
            </div>
        </li>
    )
}

export default OcdModelPalette
