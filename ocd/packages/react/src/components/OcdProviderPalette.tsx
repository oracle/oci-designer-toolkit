/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

// import palette from '../json/palette.json'
import { useEffect } from 'react'
import { palette } from '../data/OcdPalette'
import { PaletteResource } from '@ocd/model'
import { DragData, Point } from '../types/DragData'
import { PaletteProps } from '../types/ReactComponentProperties'
import { normalizePaletteSearch, paletteSearchMatches } from './OcdPaletteSearch'
import { CustomStencilManifest, hydrateStencilCss, manifestToPaletteProvider } from '../stencils/OcdStencilRegistry'

type OcdPaletteGroup = {
    title: string
    class: string
    resources: PaletteResource[]
}

// Build the runtime 'custom' palette providers (0 or 1) from the imported
// stencil manifests stored on the design. Search-filtered like the static
// providers. Wrapped by the caller in try/catch so a bad manifest never breaks
// the static palette.
const buildCustomProviders = (ocdDocument: PaletteProps['ocdDocument'], query: string): any[] => {
    const customStencils = ocdDocument?.design?.userDefined?.customStencils as Record<string, CustomStencilManifest> | undefined
    if (!customStencils || Object.keys(customStencils).length === 0) return []
    const provider = manifestToPaletteProvider(Object.values(customStencils))
    const groups = provider.groups
        .map((group) => {
            const groupMatches = paletteSearchMatches(query, provider.title, provider.provider, group.title)
            const resources = groupMatches
                ? group.resources
                : group.resources.filter((resource) => paletteSearchMatches(query, provider.title, provider.provider, group.title, resource.title, resource.class))
            return { ...group, resources }
        })
        .filter((group) => group.resources.length > 0)
    return groups.length > 0 ? [{ ...provider, groups }] : []
}

const OcdProviderPalette = ({ ocdConsoleConfig, setDragData, searchTerm, ocdDocument }: PaletteProps): JSX.Element => {
    const query = normalizePaletteSearch(searchTerm)
    // Inject runtime icon CSS for imported stencils once per design change so the
    // tiles (and dropped canvas icons) render. Idempotent + DOM-guarded.
    useEffect(() => {
        try {
            if (ocdDocument?.design) hydrateStencilCss(ocdDocument.design)
        } catch { /* never let a bad stencil break the palette */ }
    }, [ocdDocument?.design?.userDefined?.customStencils])
    const staticProviders = palette.providers
        .filter((p) => ocdConsoleConfig.config.visibleProviderPalettes.includes(p.title))
        .map((provider) => {
            const groups = provider.groups
                .map((group: OcdPaletteGroup) => {
                    const groupMatches = paletteSearchMatches(query, provider.title, provider.provider, group.title)
                    const resources = groupMatches
                        ? group.resources
                        : group.resources.filter((resource: PaletteResource) => paletteSearchMatches(query, provider.title, provider.provider, group.title, resource.title, resource.class))
                    return { ...group, resources }
                })
                .filter((group: OcdPaletteGroup) => group.resources.length > 0)
            return { ...provider, groups }
        })
        .filter((provider) => provider.groups.length > 0)
    let customProviders: any[] = []
    try {
        customProviders = buildCustomProviders(ocdDocument, query)
    } catch { customProviders = [] }
    const visibleProviders = [...staticProviders, ...customProviders]
    return (
        <div className='ocd-designer-palette'>
            {visibleProviders.map((provider) => {
                return <OcdProviderPaletteProviders 
                            provider={provider} 
                            ocdConsoleConfig={ocdConsoleConfig}
                            setDragData={(dragData:any) => setDragData(dragData)} 
                            key={provider.title}
                            />
                        })}
            {visibleProviders.length === 0 && <div className='ocd-palette-empty'>No matching resources</div>}
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
                    {provider.groups.map((group: OcdPaletteGroup) => {
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
                        const dragResource = { ...resource, provider }
                        return <OcdProviderPaletteResource 
                                    resource={resource}
                                    ocdConsoleConfig={ocdConsoleConfig}
                                    dragObject={dragResource}
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
