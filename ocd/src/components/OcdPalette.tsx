/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import palette from '../json/palette.json'
import { PaletteGroup, PaletteResource } from '../model/OcdPalette'
import { DragData, Point } from '../types/DragData'
import { PaletteProps } from '../types/ReactComponentProperties'
import { useState } from 'react'

const OcdPalette = ({ ocdConsoleConfig, setDragData, ocdDocument }: PaletteProps): JSX.Element => {
    const modelPalette = <OcdModelPalette ocdConsoleConfig={ocdConsoleConfig} setDragData={(dragData:any) => setDragData(dragData)} ocdDocument={ocdDocument}></OcdModelPalette>
    // eslint-disable-next-line
    const providerPalette = <OcdProviderPalette ocdConsoleConfig={ocdConsoleConfig} setDragData={(dragData:any) => setDragData(dragData)} ocdDocument={ocdDocument}></OcdProviderPalette>
    return (
        <div className='ocd-designer-palette'>
            {ocdConsoleConfig.config.showModelPalette && modelPalette}
            {palette.providers.map((provider) => {
                return <OcdProviderPaletteProviders 
                            provider={provider} 
                            ocdConsoleConfig={ocdConsoleConfig}
                            setDragData={(dragData:any) => setDragData(dragData)} 
                            key={provider.title}
                            />
                        })}
        </div>
    )
}

const OcdModelPalette = ({ ocdConsoleConfig, setDragData, ocdDocument }: PaletteProps): JSX.Element => {
    return (
        <div className='ocd-designer-palette-provider'>
            <details id='ocd-model-palette' open>
                <summary><div><label>Model</label></div></summary>
                <div className='ocd-model-palette'>
                    <ul>
                        {Object.entries(ocdDocument.design.model).map(([p, m]) => {
                            return <OcdModelPaletteProviders 
                                        provider={p} 
                                        model={m} 
                                        setDragData={(dragData:any) => setDragData(dragData)}
                                        key={`${p}-model-palette-providers`}
                                        />
                        })}
                    </ul>
                </div>
            </details>
        </div>
    )
}

const OcdProviderPalette = ({ ocdConsoleConfig, setDragData, ocdDocument }: PaletteProps): JSX.Element => {
    return (
        <div>
            {palette.providers.map((provider) => {
                return <OcdProviderPaletteProviders 
                            provider={provider} 
                            ocdConsoleConfig={ocdConsoleConfig}
                            setDragData={(dragData:any) => setDragData(dragData)} 
                            key={provider.title}
                            />
                        })}
        </div>
    )
}

const OcdModelPaletteProviders = ({ provider, model, setDragData }: any): JSX.Element => {
    const modelExcludeResources = ['compartment']
    const [collapsed, setCollapsed] = useState(false)
    const onClick = () => {setCollapsed(!collapsed)}
    return (
        <li className='collapsible-list-element'>
            <div className={collapsed ? 'tree-collapsed' : ''} onClick={onClick}><label>{provider}</label></div>
            <ul className={collapsed ? 'hidden' : ''}>
                {Object.entries(model.resources).filter(([k, v]) => !modelExcludeResources.includes(k)).sort((a, b) => a[0].localeCompare(b[0])).map(([k, resources]) => {
                    return <OcdModelPaletteResources 
                                provider={provider}
                                type={k} 
                                resources={resources} 
                                setDragData={(dragData:any) => setDragData(dragData)}
                                key={`${provider}-${k}-model-palette-resources`}
                                />
                })}
            </ul>
        </li>
    )
}

const OcdModelPaletteResources = ({ provider, type, resources, setDragData }: any): JSX.Element => {
    const [collapsed, setCollapsed] = useState(false)
    const onClick = () => {setCollapsed(!collapsed)}
    const onDragStart = (dragData: any) => {setDragData(dragData)}
    const onDragEnd = () => {}
    return (
        <li className='collapsible-list-element'>
            <div className={collapsed ? 'tree-collapsed' : ''} onClick={onClick}><label>{type}</label></div>
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
    const classname = `${provider}-${type}`
    const containerResources = ['vcn', 'subnet']
    console.info('Classname:', classname)
    const onPaletteDragStart = (e: React.MouseEvent<HTMLElement>) => {
        // Get current Target Coordinates
        const currentTargetRect = e.currentTarget.getBoundingClientRect()
        // Now get Offset
        const offset: Point = {x: e.clientX - currentTargetRect.x, y: e.clientY - currentTargetRect.y}
        // Start Drag
        const dragResource: PaletteResource = {
                container: containerResources.includes(type),
                title: resource.displayName ? resource.displayName : resource.name,
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

const OcdProviderPaletteProviders = ({ provider, ocdConsoleConfig, setDragData }: any): JSX.Element => {
    const open = provider.groups.length > 0
    // const open = provider.groups.length > 0 ? 'open' : ''
    return (
        <div className='ocd-designer-palette-provider'>
            <details id={provider.title} open={open}>
                <summary><div className={provider.class}><label>{provider.title}</label></div></summary>
                <div>
                    {provider.groups.map((group: PaletteGroup) => {
                        return <OcdProviderPaletteGroup 
                                provider={provider.provider}
                                group={group} 
                                ocdConsoleConfig={ocdConsoleConfig}
                                setDragData={(dragData:any) => setDragData(dragData)}
                                key={`${provider.provider}-${group.title}`}
                                />
                            })}
                </div>
            </details>
        </div>
    )
}


const OcdProviderPaletteGroup = ({ provider, group, ocdConsoleConfig, setDragData }: any): JSX.Element => {
    const onDragStart = (dragData: any) => {setDragData(dragData)}
    const onDragEnd = () => {}
    const open = group.resources.length > 0
    // const open = group.resources.length > 0 ? 'open' : ''
    return (
        <div className='ocd-designer-palette-group'>
            <details id={group.title} open={open}>
                <summary><div className={group.class}><label>{group.title}</label></div></summary>
                <div className={`${ocdConsoleConfig.config.verboseProviderPalette ? 'ocd-designer-palette-verbose-resource' : 'ocd-designer-palette-group-grid'}`}>
                    {group.resources.map((resource: PaletteResource) => {
                        resource.provider = provider
                        return <OcdProviderPaletteResource 
                                    resource={resource}
                                    ocdConsoleConfig={ocdConsoleConfig}
                                    dragObject={resource} 
                                    onDragStart={(dragData:any) => onDragStart(dragData)}
                                    onDragEnd={() => onDragEnd()}
                                    key={`${provider}-${group.title}-${resource.title}`}
                                    />
                    })}
                </div>
            </details>
        </div>
    )
}

const OcdProviderPaletteResource = ({ resource, ocdConsoleConfig, dragObject, onDragStart, onDragEnd }: any): JSX.Element => {
    const class_name = `ocd-designer-palette-resource ${resource.class} draggable` 
    const resource_type = `${resource.title.replace(/\w\S*/g, (txt:string) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()).replaceAll(' ','')}`
    const onPaletteDragStart = (e: React.MouseEvent<HTMLElement>) => {
        // Get current Target Coordinates
        const currentTargetRect = e.currentTarget.getBoundingClientRect()
        // Now get Offset
        const offset: Point = {x: e.clientX - currentTargetRect.x, y: e.clientY - currentTargetRect.y}
        // Start Drag
        const dragData: DragData = { 
            dragObject: dragObject, 
            offset: offset, 
            existingResource: false,
            resourceType: resource_type 
        }
        console.info('Drag Data', dragData)
        onDragStart(dragData)
    }
    const onPaletteDragEnd = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        onDragEnd()
    }
    return (
        <div className={class_name} 
            draggable="true" 
            onDragStart={onPaletteDragStart} 
            onDragEnd={onPaletteDragEnd}
            title={resource.title}
            >
            {ocdConsoleConfig.config.verboseProviderPalette ? resource.title : ''}
        </div>
    )
}

export default OcdPalette