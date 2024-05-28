/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

// import palette from '../json/palette.json'
import { palette } from '../data/OcdPalette'
import { PaletteGroup, PaletteResource } from '@ocd/model'
import { DragData, Point } from '../types/DragData'
import { PaletteProps } from '../types/ReactComponentProperties'

const OcdProviderPalette = ({ ocdConsoleConfig, setDragData, ocdDocument }: PaletteProps): JSX.Element => {
    return (
        <div className='ocd-designer-palette'>
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

const OcdProviderPaletteProviders = ({ provider, ocdConsoleConfig, setDragData }: any): JSX.Element => {
    const open = provider.groups.length > 0
    // const open = provider.groups.length > 0 ? 'open' : ''
    return (
        <div className='ocd-designer-palette-provider'>
            <details id={provider.title} open={open}>
                <summary><div className={provider.class}><span>{provider.title}</span></div></summary>
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
                <summary><div className={group.class}><span>{group.title}</span></div></summary>
                <div className={`${ocdConsoleConfig.config.verboseProviderPalette ? 'ocd-designer-palette-group-verbose-grid' : 'ocd-designer-palette-group-grid'}`}>
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

export default OcdProviderPalette
