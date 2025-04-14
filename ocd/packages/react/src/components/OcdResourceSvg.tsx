/* eslint-disable react/style-prop-object */
/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { OcdDocument } from './OcdDocument'
import { OcdViewPage, OcdViewCoords, OcdViewLayer } from '@ocd/model'
import { ResourceRectProps, ResourceForeignObjectProps, ResourceSvgProps, ResourceSvgContextMenuProps, ResourceSvgGhostProps, OcdMouseEvents, ConnectorSvgProps } from '../types/ReactComponentProperties'
import { OcdContextMenu } from './OcdCanvas'
import { ActiveFileContext, SelectedResourceContext } from '../pages/OcdConsole'
import { OcdDragResource, OcdSelectedResource } from '../types/Console'

export const OcdSvgContextMenu = ({ contextMenu, setContextMenu, ocdDocument, setOcdDocument, resource }: ResourceSvgContextMenuProps): JSX.Element => {
    console.info('OcdResourceSvg: OcdSvgContextMenu')
    // const [resourceLayout, setResourceLayout] = useState('simple')
    const [resourceLayout, setResourceLayout] = useState(!resource.detailsStyle ? 'default' : resource.detailsStyle)
    const uuid = () => `gid-${uuidv4()}`
    const onMouseLeave = (e: React.MouseEvent<SVGElement>) => {
        console.debug('OcdResourceSvg: Context OnMouseLeave')
        setContextMenu({show: false, x: 0, y: 0})
    }
    const onClick = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
    }
    const onRemoveClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        const page = ocdDocument.getActivePage()
        ocdDocument.removeCoords(resource, page.id, resource.pgid)
        setContextMenu({show: false, x: 0, y: 0})
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onDeleteClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        ocdDocument.removeResource(resource.ocid)
        setContextMenu({show: false, x: 0, y: 0})
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onCloneClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        const page = ocdDocument.getActivePage()
        const cloneResource = ocdDocument.cloneResource(resource.ocid)
        if (cloneResource) {
            // Coords
            const cloneCoords = ocdDocument.cloneCoords(resource)
            cloneCoords.ocid = cloneResource.id
            ocdDocument.setCoordsRelativeToCanvas(cloneCoords)
            ocdDocument.addCoords(cloneCoords, page.id, cloneCoords.pgid)
        }
        setContextMenu({show: false, x: 0, y: 0})
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onToFrontClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        const page = ocdDocument.getActivePage()
        ocdDocument.toFront(resource, page.id)
        setOcdDocument(OcdDocument.clone(ocdDocument))            
    }
    const onToBackClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        const page = ocdDocument.getActivePage()
        ocdDocument.toBack(resource, page.id)
        setOcdDocument(OcdDocument.clone(ocdDocument))            
    }
    const onBringForwardClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        const page = ocdDocument.getActivePage()
        ocdDocument.bringForward(resource, page.id)
        setOcdDocument(OcdDocument.clone(ocdDocument))            
    }
    const onSendBackwardClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        const page = ocdDocument.getActivePage()
        ocdDocument.sendBackward(resource, page.id)
        setOcdDocument(OcdDocument.clone(ocdDocument))            
    }
    const onDetailsStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation()
        const newLayout = e.target.value === 'default' || e.target.value === 'simple' || e.target.value === 'detailed' ? e.target.value : 'default'
        setResourceLayout(newLayout)
        resource.detailsStyle = newLayout
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onShowParentConnectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation()
        resource.showParentConnection = e.currentTarget.checked
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onShowAssociationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation()
        resource.showConnections = e.currentTarget.checked
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <g 
        transform={`translate(${contextMenu.x}, ${contextMenu.y})`}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        >
            <foreignObject className='ocd-svg-context-menu' id='svg-context-menu'>
                <div
                // @ts-ignore 
                xmlns='http://www.w3.org/1999/xhtml'>
                    <ul className='ocd-context-menu'>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onRemoveClick}>Remove From Page</a></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onDeleteClick}>Delete From Model</a></li>
                        <li><hr/></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onCloneClick}>Clone</a></li>
                        <li><hr/></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onToFrontClick}>To Front</a></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onToBackClick}>To Back</a></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onBringForwardClick}>Bring Forward</a></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onSendBackwardClick}>Send Backward</a></li>
                        <li><hr/></li>
                        <li className='ocd-svg-context-menu-item'>
                            <div className='ocd-radio-buttons-vertical'>
                                <label><input type='radio' name='resource-details' value='default' checked={resourceLayout === 'default'} onChange={onDetailsStyleChange}></input>Default Resource Layout</label>
                                <label><input type='radio' name='resource-details' value='simple' checked={resourceLayout === 'simple'} onChange={onDetailsStyleChange}></input>Simple Resource Layout</label>
                                <label><input type='radio' name='resource-details' value='detailed' checked={resourceLayout === 'detailed'} onChange={onDetailsStyleChange}></input>Detailed Resource Layout</label>
                            </div>
                        </li>
                        <li><hr/></li>
                        <li className='ocd-svg-context-menu-item'><label><input type='checkbox' checked={resource.showParentConnection} onChange={onShowParentConnectionChange}></input>Show Parent Connection</label></li>
                        <li className='ocd-svg-context-menu-item'><label><input type='checkbox' checked={resource.showConnections} onChange={onShowAssociationsChange}></input>Show Associations</label></li>
                    </ul>
                </div>
            </foreignObject>
        </g>
    )
}

const OcdSimpleRect = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource, hidden, setOrigin }: ResourceRectProps): JSX.Element => {
    // console.debug('OcdResourceSvg: Simple Rect', resource, 'Layout Style', resource.detailsStyle)
    const id = `${resource.id}-rect`
    const detailedLayout = ((resource.detailsStyle && resource.detailsStyle === 'detailed') || ((!resource.detailsStyle || resource.detailsStyle === 'default') && ocdConsoleConfig.config.detailedResource))
    const rectClass = `ocd-svg-simple ${detailedLayout ? 'ocd-svg-resource-detailed' : 'ocd-svg-resource-simple'} ${ocdDocument.selectedResource.modelId === resource.ocid ? 'ocd-svg-resource-selected' : ''}`
    const style = resource.style ? resource.style : {} as React.CSSProperties
    const layer = ocdDocument.getResourcesLayer(resource.ocid)
    if (layer && layer.style && layer.style.fill && ocdConsoleConfig.config.highlightCompartmentResources) {
        style.stroke = layer.style.fill
        if (ocdDocument.selectedResource.coordsId !== resource.id) style.strokeOpacity = 0.9
    }
    if (hidden) {
        style.opacity = 0
        style.strokeOpacity = 0
    }
    console.debug(`>> OcdResourceSvg: OcdSimpleRect:    Render(${resource.id})`)
    return (
        <rect className={rectClass} style={style}
            id={id} 
            x='0' 
            y='0' 
            width='32' 
            height='32' 
            data-gid={resource.id} 
            data-ocid={resource.ocid} 
            data-pocid={resource.pocid}
            >
        </rect>
    )
}

const OcdContainerRect = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource, hidden, setOrigin }: ResourceRectProps): JSX.Element => {
    const [dimensions, setDimensions] = useState({x: 0, y: 0, w: 0, h: 0 });
    const id = `${resource.id}-rect`
    const rX = dimensions.x
    const rY = dimensions.y
    const width = resource.w + dimensions.w 
    const height = resource.h + dimensions.h
    const onResizeEnd = () => {
        const page: OcdViewPage = ocdDocument.getActivePage()
        const coords: OcdViewCoords = JSON.parse(JSON.stringify(resource)) as OcdViewCoords
        coords.x += dimensions.x
        coords.y += dimensions.y
        coords.w += dimensions.w
        coords.h += dimensions.h
        setDimensions({x: 0, y: 0, w: 0, h: 0})
        setOrigin({x: 0, y: 0})
        ocdDocument.updateCoords(coords, page.id)
        // Redraw
        console.info('OcdResourceSvg: Design:', ocdDocument)
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const setDimensionsAndOrigin = (dimensions: {x: number, y:number, w: number, h: number}) => {
        setDimensions(dimensions)
        const origin = {x: dimensions.x, y: dimensions.y}
        setOrigin(origin)
    }
    // console.info('Selected Resource', ocdDocument.selectedResource, 'Resource Id', resource.id)
    const rectClass = `ocd-svg-container ${ocdDocument.selectedResource.coordsId === resource.id ? 'ocd-svg-resource-selected' : ''}`
    const style = resource.style ? resource.style : {} as React.CSSProperties
    const layer = ocdDocument.getResourcesLayer(resource.ocid)
    if (layer && layer.style && layer.style.fill && ocdConsoleConfig.config.highlightCompartmentResources) {
        style.stroke = layer.style.fill
        if (ocdDocument.selectedResource.coordsId !== resource.id) style.strokeOpacity = 0.9
    }
    if (hidden) {
        style.opacity = 0
        style.strokeOpacity = 0
    }
    console.debug(`>> OcdResourceSvg: OcdContainerRect: Render(${resource.id})`)
    return (
        <g>
            <rect className={rectClass} style={style}
                id={id} 
                x={rX} 
                y={rY} 
                width={width} 
                height={height} 
                // The following data attributes are used in Drop Functionality
                data-gid={resource.id} 
                data-pgid={resource.pgid} 
                data-ocid={resource.ocid} 
                data-pocid={resource.pocid}
                >
            </rect>
            {!hidden && ocdDocument.selectedResource.coordsId === resource.id && <OcdResizePoint cx={(width / 2) + rX} cy={rY} position={'north'} setDimensions={setDimensionsAndOrigin} onResizeEnd={onResizeEnd}/>}
            {!hidden && ocdDocument.selectedResource.coordsId === resource.id && <OcdResizePoint cx={width + rX} cy={(height / 2) + rY} position={'east'} setDimensions={setDimensions} onResizeEnd={onResizeEnd}/> }
            {!hidden && ocdDocument.selectedResource.coordsId === resource.id && <OcdResizePoint cx={(width / 2) + rX} cy={height + rY} position={'south'} setDimensions={setDimensions} onResizeEnd={onResizeEnd}/>}
            {!hidden && ocdDocument.selectedResource.coordsId === resource.id && <OcdResizePoint cx={rX} cy={(height / 2) + rY} position={'west'}  setDimensions={setDimensionsAndOrigin} onResizeEnd={onResizeEnd}/>}
        </g>
    )
}

const OcdResizePoint = ({cx, cy, position, setDimensions, onResizeEnd}: any): JSX.Element => {
    const {activeFile} = useContext(ActiveFileContext)
    const [dragging, setDragging] = useState(false)
    const [origin, setOrigin] = useState({ x: 0, y: 0 });
    const [radius, setRadius] = useState(3)
    const onResizeDragStart = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        e.preventDefault()
        // Record Starting Point
        setOrigin({ x: e.clientX, y: e.clientY })
        setDragging(true)
    }
    const onResizeDrag = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        e.preventDefault()
        if (dragging) {
            // Set state for the change in dimensions.
            const dimensions = {x: 0, y: 0, w: 0, h: 0 }
            switch (position) {
                case 'north':
                    dimensions.h = (e.clientY - origin.y) * -1
                    dimensions.y = e.clientY - origin.y
                    break
                case 'east':
                    dimensions.w = e.clientX - origin.x
                    break
                case 'south':
                    dimensions.h = e.clientY - origin.y
                    break
                case 'west':
                    dimensions.w = (e.clientX - origin.x) * -1
                    dimensions.x = e.clientX - origin.x
                    break
            }
            setDimensions(dimensions)
        }
    }
    const onResizeDragEnd = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        e.preventDefault()
        const hasMoved = (position === 'east' && (e.clientX !== origin.x)) || (position === 'south' && (e.clientY !== origin.y))
        setDragging(false)
        const dimensions = {x: 0, y: 0, w: 0, h: 0 }
        switch (position) {
            case 'north':
                dimensions.h = (e.clientY - origin.y) * -1
                dimensions.y = e.clientY - origin.y
                break
            case 'east':
                dimensions.w = e.clientX - origin.x
                break
            case 'south':
                dimensions.h = e.clientY - origin.y
                break
            case 'west':
                dimensions.w = (e.clientX - origin.x) * -1
                dimensions.x = e.clientX - origin.x
                break
        }
        onResizeEnd(dimensions)
        if (!activeFile.modified && hasMoved) activeFile.modified = true
        // if (!activeFile.modified && hasMoved) setActiveFile({name: activeFile.name, modified: true})
    }
    const onMouseOver = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        e.preventDefault()
        // setMouseOver(true)
        setRadius(60)
    }
    const onMouseOut = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        e.preventDefault()
        // setMouseOver(false)
        setRadius(3)
    }
    const onMouseEnter = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        e.preventDefault()
    }
    return (
        <g>
            <circle className='ocd-svg-resize-point'
                cx={cx}
                cy={cy}
                r={3}
            />
            <circle className='ocd-svg-resize'
                cx={cx}
                cy={cy}
                r={radius}
                onMouseDown={onResizeDragStart}
                onMouseMove={onResizeDrag}
                onMouseUp={onResizeDragEnd}
                onMouseLeave={onResizeDragEnd}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                onMouseEnter={onMouseEnter}
            />
        </g>
    )
}

const OcdForeignObject = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource, hidden, ghost, origin }: ResourceForeignObjectProps) => {
    const id = `${resource.id}-fo`
    const inputId = `${id}-input${ghost ? '-ghost' : ''}`
    const containerLayout = (resource.container && (!resource.detailsStyle || resource.detailsStyle === 'default'))
    const detailedLayout = ((resource.detailsStyle && resource.detailsStyle === 'detailed') || ((!resource.detailsStyle || resource.detailsStyle === 'default') && ocdConsoleConfig.config.detailedResource))
    const backgroundColourClass = `${resource.class}-background-colour ${containerLayout ? 'ocd-svg-container-icon-background' : detailedLayout ? 'ocd-svg-detailed-icon-background' : 'ocd-svg-simple-icon-background'}`
    const foreignObjectClass = `ocd-svg-foreign-object ${containerLayout ? 'ocd-svg-resource-container' : detailedLayout ? 'ocd-svg-resource-detailed' : 'ocd-svg-resource-simple'}`
    const gX = origin.x
    const gY = origin.y
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        ocdDocument.setDisplayName(resource.ocid, e.target.value)
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        // Stop Bubbling when name input click to disable SVG Drag functionality
        e.stopPropagation()
    }
    const getTitle = () => `${resource.title} ${ocdDocument.getAdditionalTitleInfo(resource.ocid)}`
    const style = resource.style ? resource.style : {} as React.CSSProperties
    if (hidden) {
        style.opacity = 0
        style.strokeOpacity = 0
    }
    console.debug(`>> OcdResourceSvg: OcdForeignObject: Render(${resource.id})`)
    return (
        <foreignObject id={id} className={foreignObjectClass} style={style}
            transform={`translate(${gX}, ${gY})`}
        >
            <div 
            // @ts-ignore 
            xmlns='http://www.w3.org/1999/xhtml'>
                <div className={backgroundColourClass} title={ocdDocument.getDisplayName(resource.ocid)}>
                    <div className={`${resource.class} ocd-svg-icon`}></div>
                </div>
                <div className='ocd-svg-foreign-object-display-name'>
                    <span>{getTitle()}</span>
                    <input id={inputId} type='text' value={ocdDocument.getDisplayName(resource.ocid)} 
                        onChange={onChange} 
                        onMouseMove={onMouseMove} 
                        onMouseDown={onMouseMove} 
                        onMouseUp={onMouseMove} 
                        tabIndex={-1}></input>
                </div>
            </div>
        </foreignObject>
    )
}

export const OcdResourceSvg = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, contextMenu, setContextMenu, svgDragDropEvents, resource, ghost }: ResourceSvgProps): JSX.Element => {
    const {selectedResource, setSelectedResource} = useContext(SelectedResourceContext)
    const page: OcdViewPage = ocdDocument.getActivePage()
    const visibleLayers = page.layers.filter((l: OcdViewLayer) => l.visible).map((l: OcdViewLayer) => l.id)
    const visibleResourceIds = ocdDocument.getResources().filter((r: any) => visibleLayers.includes(r.compartmentId)).map((r: any) => r.id)
    const hidden = !visibleResourceIds.includes(resource.ocid)
    const [dragging, setDragging] = useState(false)
    const [origin, setOrigin] = useState({ x: 0, y: 0 })
    const containerLayout = (resource.container && (!resource.detailsStyle || resource.detailsStyle === 'default'))
    const SvgRect = containerLayout ? OcdContainerRect : OcdSimpleRect
    const gX = resource.x
    const gY = resource.y
    const onResourceDragStart = (e: React.MouseEvent<SVGElement>) => {
        if (!ocdDocument.dragResource.dragging) {
            console.info('OcdResourceSvg: Resource Drag Start', resource.ocid)
            // e.stopPropagation()
            // Record Starting Point
            // setOrigin({ x: e.clientX, y: e.clientY })
            setDragging(true)
            const dragResource: OcdDragResource = OcdDocument.newDragResource(true)
            dragResource.modelId = resource.ocid
            dragResource.pageId = ocdDocument.getActivePage().id
            dragResource.coordsId = resource.id
            dragResource.class = resource.class
            dragResource.resource = resource
            ocdDocument.dragResource = dragResource
        } 
        // else console.info('OcdResourceSvg: Resource Drag Start - Currently Dragging Child', resource.ocid)
        e.preventDefault()
    }
    const onResourceClick = (e: React.MouseEvent<SVGElement>) => {
        console.info('OcdResourceSvg: Resource Clicked', resource.ocid, e.clientX, e.clientY, e.currentTarget.id, ocdDocument.getCoords(e.currentTarget.id))
        e.stopPropagation()
        if (selectedResource.coordsId !== resource.id) {
            const clickedResource: OcdSelectedResource = {
                modelId: resource.ocid,
                pageId: ocdDocument.getActivePage().id,
                coordsId: resource.id,
                class: resource.class,
                model: ocdDocument.getResource(resource.ocid),
                page: ocdDocument.getActivePage(),
                coords: ocdDocument.getCoords(resource.id)
            }
            setSelectedResource(clickedResource)
            // TODO: Delete next 3 lines
            const clone = OcdDocument.clone(ocdDocument)
            clone.selectedResource = clickedResource
            setOcdDocument(clone)
        }
    }
    const onResourceRightClick = (e: React.MouseEvent<SVGElement>) => {
        // console.info('OcdResourceSvg: Resource Right Click', resource)
        console.info('OcdResourceSvg: Resource Right Click', resource.ocid, e.clientX, e.clientY)
        e.stopPropagation()
        e.preventDefault()
        const relativeXY = ocdDocument.getRelativeXY(resource)
        // console.info('OcdResourceSvg: Right Click', relativeXY, e.clientX, e.clientY)

        // Get Canvas
        const svg = document.getElementById('canvas_root_svg')
        // @ts-ignore 
        // const point = new DOMPoint(e.clientX - relativeXY.x, e.clientY - relativeXY.y)
        const point = new DOMPoint(e.clientX - 5, e.clientY - 5 )
        // console.info('OcdResourceSvg: Right Click Point', point)
        // @ts-ignore 
        const { x, y } =  point.matrixTransform(svg.getScreenCTM().inverse())
        console.info('x:', x, 'y:', y)

        const contextPosition = {show: true, x: x, y: y, resource: resource}
        setContextMenu(contextPosition)
    }
    const onResourceMouseUp = (e: React.MouseEvent<SVGElement>) => {
        e.preventDefault()
        console.info('OcdResourceSvg: Resource Mouse Up', resource.ocid, e.clientX, e.clientY)
        if (!contextMenu.show) {
            if (resource.container) {
                const childCoordIds = ocdDocument.getChildCoords([ocdDocument.dragResource.resource]).map((c) => c.id)
                if (resource.id !== ocdDocument.dragResource.resource.id && !childCoordIds.includes(resource.id) && !ocdDocument.dragResource.parent) {
                    console.info('>>>OcdResourceSvg: Mouse Up -> Container', resource.id, ocdDocument.dragResource.parent)
                    ocdDocument.dragResource.parent = resource
                }
            }
        }
    }
    const onNooPEvent = (e: React.MouseEvent<SVGElement>) => {}
    const onResourceMouseEnter = (e: React.MouseEvent<SVGElement>) => {}
    const onResourceMouseMove = (e: React.MouseEvent<SVGElement>) => {}
    const onResourceMouseLeave = (e: React.MouseEvent<SVGElement>) => {}
    console.debug(`>> OcdResourceSvg: OcdResourceSvg: Render(${resource.id})`, resource.class, resource.ocid)
    return (
        <g className='ocd-designer-resource' 
            id={resource.id} 
            transform={`translate(${gX}, ${gY})`}
            onMouseDown={!hidden ? onResourceDragStart : onNooPEvent}
            onMouseUp={!hidden ? onResourceMouseUp : onNooPEvent}
            onClick={!hidden ? onResourceClick : onNooPEvent}
            onContextMenu={!hidden ? onResourceRightClick : onNooPEvent}
            >
                <SvgRect 
                    ocdConsoleConfig={ocdConsoleConfig}
                    ocdDocument={ocdDocument}
                    setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                    resource={resource}
                    hidden={hidden}
                    setOrigin={setOrigin}
                    />
                <OcdForeignObject 
                    ocdConsoleConfig={ocdConsoleConfig}
                    ocdDocument={ocdDocument}
                    setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                    resource={resource}
                    hidden={hidden}
                    ghost={ghost}
                    origin={origin}
                    />
                {resource.coords && resource.coords.map((r:any) => {
                    return <OcdResourceSvg
                                ocdConsoleConfig={ocdConsoleConfig}
                                ocdDocument={ocdDocument}
                                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                                contextMenu={contextMenu}
                                setContextMenu={(contextMenu: OcdContextMenu) => setContextMenu(contextMenu)}
                                svgDragDropEvents={svgDragDropEvents}
                                resource={r}
                                key={`${r.pgid}-${r.id}`}
                                />
                                })}
        </g>
    )
}

export const OcdDragResourceGhostSvg = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource }: ResourceSvgGhostProps): JSX.Element => {
    const page: OcdViewPage = ocdDocument.getActivePage()
    const visibleLayers = page.layers.filter((l: OcdViewLayer) => l.visible).map((l: OcdViewLayer) => l.id)
    const visibleResourceIds = ocdDocument.getResources().filter((r: any) => visibleLayers.includes(r.compartmentId)).map((r: any) => r.id)
    const hidden = !visibleResourceIds.includes(resource.ocid)
    const origin = { x: 0, y: 0 }
    const containerLayout = (resource.container && (!resource.detailsStyle || resource.detailsStyle === 'default'))
    const SvgRect = containerLayout ? OcdContainerRect : OcdSimpleRect
    const [contextMenu, setContextMenu] = useState<OcdContextMenu>({show: false, x: 0, y: 0})
    const svgDragDropEvents: OcdMouseEvents = {
        'onSVGDragStart': () => {},
        'onSVGDrag': () => {},
        'onSVGDragEnd': () => {},
    }
    console.debug(`>> OcdResourceSvg: OcdDragResourceGhostSvg: Render(${resource.id})`, resource.class, resource.ocid)
    return (
        <g className='ocd-svg-drag-ghost'
            transform={`translate(0, 0)`}
        >
            <SvgRect 
                ocdConsoleConfig={ocdConsoleConfig}
                ocdDocument={ocdDocument}
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                resource={resource}
                hidden={hidden}
                setOrigin={() => {}}
                />
            <OcdForeignObject 
                ocdConsoleConfig={ocdConsoleConfig}
                ocdDocument={ocdDocument}
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                resource={resource}
                hidden={hidden}
                ghost={true}
                origin={origin}
                />
            {resource.coords && resource.coords.map((r:any) => {
                return <OcdResourceSvg
                            ocdConsoleConfig={ocdConsoleConfig}
                            ocdDocument={ocdDocument}
                            setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                            contextMenu={contextMenu}
                            setContextMenu={(contextMenu: OcdContextMenu) => setContextMenu(contextMenu)}
                            svgDragDropEvents={svgDragDropEvents}
                            resource={r}
                            key={`${r.pgid}-${r.id}-ghost`}
                />
            })}
        </g>
    )
}

export const OcdConnector = ({ocdConsoleConfig, ocdDocument, connector, parentConnector}: ConnectorSvgProps): JSX.Element => {
    const simpleWidth = 40
    const detailedWidth = 170
    const simpleHeight = 40
    const controlPoint = 100
    // Start Coords Dimensions
    const startCoords = ocdDocument.getCoords(connector.startCoordsId)
    const startRelativeXY = startCoords ? ocdDocument.getRelativeXY(startCoords) : ocdDocument.newCoords()
    const startWidth = startCoords ? startCoords.detailsStyle ? startCoords.detailsStyle === 'simple' ? simpleHeight : startCoords.detailsStyle === 'detailed' ? detailedWidth : startCoords.container ? startCoords.w : ocdConsoleConfig.config.detailedResource ? detailedWidth : simpleWidth : startCoords.container ? startCoords.w : ocdConsoleConfig.config.detailedResource ? detailedWidth : simpleWidth : 0
    const startHeight = startCoords ? startCoords.container && (!startCoords.detailsStyle || startCoords.detailsStyle === 'default') ? startCoords.h : simpleHeight : 0
    const startDimensions = {x: startRelativeXY.x, y: startRelativeXY.y, w: startWidth, h: startHeight}
    // End Coords Dimensions
    const endCoords = ocdDocument.getCoords(connector.endCoordsId)
    const endRelativeXY = endCoords ? ocdDocument.getRelativeXY(endCoords) : ocdDocument.newCoords()
    const endWidth = endCoords ? endCoords.detailsStyle ? endCoords.detailsStyle === 'simple' ? simpleHeight : endCoords.detailsStyle === 'detailed' ? detailedWidth : endCoords.container ? endCoords.w : ocdConsoleConfig.config.detailedResource ? detailedWidth : simpleWidth : endCoords.container ? endCoords.w : ocdConsoleConfig.config.detailedResource ? detailedWidth : simpleWidth : 0
    const endHeight = endCoords ? endCoords.container && (!endCoords.detailsStyle || endCoords.detailsStyle === 'default') ? endCoords.h : simpleHeight : 0
    const endDimensions = {x: endRelativeXY.x, y: endRelativeXY.y, w: endWidth, h: endHeight}
    // console.debug('OcdResourceSvg: Start Dimensions', startDimensions)
    // console.debug('OcdResourceSvg: End Dimensions', endDimensions)
    // Build Path
    const path: string[] = ['M']
    // Identify if we are goin left to right or right to left
    if (startDimensions.x < endDimensions.x) {
        // We will start middle right of the Start Coord
        path.push(`${startDimensions.x + startDimensions.w}`)
        path.push(`${startDimensions.y + startDimensions.h / 2}`)
        // Start Control Point
        path.push('C')
        path.push(`${startDimensions.x + startDimensions.w + controlPoint}`)
        path.push(`${startDimensions.y + startDimensions.h / 2},`)
        // Add End Control Point
        path.push(`${endDimensions.x - controlPoint}`)
        path.push(`${endDimensions.y + endDimensions.h / 2},`)
        // We will end at the middle left of the End Coord
        path.push(`${endDimensions.x}`)
        path.push(`${endDimensions.y + endDimensions.h / 2}`)
    } else {
        // We will start middle right of the Start Coord
        path.push(`${startDimensions.x }`)
        path.push(`${startDimensions.y + startDimensions.h / 2}`)
        // Start Control Point
        path.push('C')
        path.push(`${startDimensions.x - controlPoint}`)
        path.push(`${startDimensions.y + startDimensions.h / 2},`)
        // Add End Control Point
        path.push(`${endDimensions.x + endDimensions.w + controlPoint}`)
        path.push(`${endDimensions.y + endDimensions.h / 2},`)
        // We will end at the middle left of the End Coord
        path.push(`${endDimensions.x + endDimensions.w}`)
        path.push(`${endDimensions.y + endDimensions.h / 2}`)
    }
    // console.debug('OcdResourceSvg: Connector Path', path)
    // console.debug('OcdResourceSvg: Connector Path as String', path.join(' '))
    const className = parentConnector ? 'ocd-svg-parent-connector' : 'ocd-svg-association-connector'
    console.debug(`>> OcdResourceSvg: OcdConnector: Render()`)
    return (
        <path className={className} d={path.join(' ')}></path>
    )
}

export default OcdResourceSvg
