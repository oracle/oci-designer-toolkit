/* eslint-disable react/style-prop-object */
/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { memo, useCallback, useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { OcdDocument } from './OcdDocument'
import { OcdViewPage, OcdViewCoords, OcdViewLayer } from '@ocd/model'
import { ResourceRectProps, ResourceForeignObjectProps, ResourceSvgProps, ResourceSvgContextMenuProps, ResourceSvgGhostProps, OcdMouseEvents, ConnectorSvgProps } from '../types/ReactComponentProperties'
import { OcdContextMenu, PortConnectContext } from './OcdCanvas'
import { ActiveFileContext, SelectedResourceContext } from '../pages/OcdConsole'
import { OcdDragResource, OcdSelectedResource } from '../types/Console'
import { canConnectResources } from './OcdConnect'

export interface OcdConnectorRect {
    x: number
    y: number
    w: number
    h: number
}

export interface OcdConnectorPath {
    d: string
    labelX: number
    labelY: number
}

type OcdConnectorSide = 'left' | 'right' | 'top' | 'bottom'

const getRectCenter = (rect: OcdConnectorRect): { x: number, y: number } => ({
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h / 2,
})

const getAnchor = (rect: OcdConnectorRect, side: OcdConnectorSide): { x: number, y: number } => {
    const center = getRectCenter(rect)
    if (side === 'left') return { x: rect.x, y: center.y }
    if (side === 'right') return { x: rect.x + rect.w, y: center.y }
    if (side === 'top') return { x: center.x, y: rect.y }
    return { x: center.x, y: rect.y + rect.h }
}

const getConnectorSides = (startDimensions: OcdConnectorRect, endDimensions: OcdConnectorRect): {
    startSide: OcdConnectorSide
    endSide: OcdConnectorSide
    axis: 'horizontal' | 'vertical'
} => {
    const startCenter = getRectCenter(startDimensions)
    const endCenter = getRectCenter(endDimensions)
    const dx = endCenter.x - startCenter.x
    const dy = endCenter.y - startCenter.y
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx >= 0
            ? { startSide: 'right', endSide: 'left', axis: 'horizontal' }
            : { startSide: 'left', endSide: 'right', axis: 'horizontal' }
    }
    return dy >= 0
        ? { startSide: 'bottom', endSide: 'top', axis: 'vertical' }
        : { startSide: 'top', endSide: 'bottom', axis: 'vertical' }
}

const getControlOffset = (distance: number): number => Math.max(40, Math.min(100, Math.abs(distance) / 2))

export const buildConnectorPath = (
    startDimensions: OcdConnectorRect,
    endDimensions: OcdConnectorRect,
    labelOffsetY = 0,
): OcdConnectorPath => {
    const { startSide, endSide, axis } = getConnectorSides(startDimensions, endDimensions)
    const startAnchor = getAnchor(startDimensions, startSide)
    const endAnchor = getAnchor(endDimensions, endSide)
    const offset = getControlOffset(axis === 'horizontal' ? endAnchor.x - startAnchor.x : endAnchor.y - startAnchor.y)
    const startControl = axis === 'horizontal'
        ? { x: startAnchor.x + (startSide === 'right' ? offset : -offset), y: startAnchor.y }
        : { x: startAnchor.x, y: startAnchor.y + (startSide === 'bottom' ? offset : -offset) }
    const endControl = axis === 'horizontal'
        ? { x: endAnchor.x + (endSide === 'right' ? offset : -offset), y: endAnchor.y }
        : { x: endAnchor.x, y: endAnchor.y + (endSide === 'bottom' ? offset : -offset) }
    return {
        d: `M ${startAnchor.x} ${startAnchor.y} C ${startControl.x} ${startControl.y}, ${endControl.x} ${endControl.y}, ${endAnchor.x} ${endAnchor.y}`,
        labelX: (startAnchor.x + endAnchor.x) / 2,
        labelY: (startAnchor.y + endAnchor.y) / 2 + labelOffsetY,
    }
}

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
        // Deep-clone the resource AND any nested child resources (e.g. a Subnet
        // containing a DB System). cloneResourceTree clones each backing model
        // resource, re-parents children onto the freshly cloned parent, and
        // returns the new coords sub-tree ready to attach to the page.
        const newRoot = ocdDocument.cloneResourceTree(resource)
        if (newRoot) {
            ocdDocument.setCoordsRelativeToCanvas(newRoot)
            ocdDocument.addCoords(newRoot, page.id, newRoot.pgid)
        }
        setContextMenu({show: false, x: 0, y: 0})
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onAttachContainedClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        const page = ocdDocument.getActivePage()
        ocdDocument.attachContainedCoordsToFrame(resource, page.id)
        setContextMenu({show: false, x: 0, y: 0})
        setOcdDocument(OcdDocument.clone(ocdDocument))
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
                        {resource.container && <li className='ocd-svg-context-menu-item'><a href='#' onClick={onAttachContainedClick}>Attach Contained Resources</a></li>}
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
    const onResizeEnd = (resizeDimensions = dimensions) => {
        const page: OcdViewPage = ocdDocument.getActivePage()
        const coords: OcdViewCoords = JSON.parse(JSON.stringify(resource)) as OcdViewCoords
        coords.x += resizeDimensions.x
        coords.y += resizeDimensions.y
        coords.w += resizeDimensions.w
        coords.h += resizeDimensions.h
        const constrainedCoords = ocdDocument.constrainContainerResize(resource, coords)
        setDimensions({x: 0, y: 0, w: 0, h: 0})
        setOrigin({x: 0, y: 0})
        ocdDocument.updateCoords(constrainedCoords, page.id)
        // Redraw
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
        const hasMoved = e.clientX !== origin.x || e.clientY !== origin.y
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

export const OcdResourceSvg = memo(({ ocdConsoleConfig, ocdDocument, setOcdDocument, contextMenu, setContextMenu, svgDragDropEvents, resource, ghost }: ResourceSvgProps): JSX.Element => {
    const {selectedResource, setSelectedResource} = useContext(SelectedResourceContext)
    const page: OcdViewPage = ocdDocument.getActivePage()
    const visibleLayers = page.layers.filter((l: OcdViewLayer) => l.visible).map((l: OcdViewLayer) => l.id)
    const visibleResourceIds = ocdDocument.getResources().filter((r: any) => visibleLayers.includes(r.compartmentId)).map((r: any) => r.id)
    const hidden = !visibleResourceIds.includes(resource.ocid)
    const [dragging, setDragging] = useState(false)
    const [origin, setOrigin] = useState({ x: 0, y: 0 })
    const updateOcdDocument = useCallback((ocdDocument: OcdDocument) => setOcdDocument(ocdDocument), [setOcdDocument])
    // Draw.io-style drop-target hint while dragging a connection over this resource.
    const [connectHint, setConnectHint] = useState<'none' | 'valid' | 'invalid'>('none')
    // Hover state drives the always-available connect "ports" on this resource.
    const [hovered, setHovered] = useState(false)
    // Port connect context: sourceModelId is non-empty while a hover-port drag is
    // in progress; begin() starts one from this resource (see onPortMouseDown).
    const portConnect = useContext(PortConnectContext)
    // A connection drag (either the connect-mode body drag or a hover-port drag)
    // is in progress. Source = the port source if set, else the body-drag source.
    const connectSourceId = portConnect.sourceModelId !== ''
        ? portConnect.sourceModelId
        : (ocdConsoleConfig.config.connectMode ? ocdDocument.dragResource?.resource?.ocid : '')
    const connectInProgress = !!connectSourceId
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
    // Press on a hover port: start an always-available connect drag from this
    // resource. stopPropagation/preventDefault keep it off the canvas pan
    // (onSVGDragStart) and the resource body move (onResourceDragStart) — the
    // port is the only thing that initiates a connect without connect mode.
    const onPortMouseDown = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        e.preventDefault()
        setHovered(false)
        portConnect.begin(resource, e.clientX, e.clientY)
    }
    const onResourceMouseUp = (e: React.MouseEvent<SVGElement>) => {
        e.preventDefault()
        console.info('OcdResourceSvg: Resource Mouse Up', resource.ocid, e.clientX, e.clientY)
        if (!contextMenu.show) {
            // Drag-to-connect: while a connect drag is in progress (connect-mode body
            // drag OR a hover-port drag), dropping onto another resource records it as
            // the connection target (wired on drag end). Default reparenting is
            // unchanged when no connect drag is active.
            if (connectInProgress) {
                if (resource.ocid !== connectSourceId) {
                    ocdDocument.dragResource.connectTarget = resource
                }
                setConnectHint('none')
                return
            }
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
    // Draw.io-style live drop-target highlight: while a connection drag is in
    // progress (connect mode + a drag source recorded), entering another resource
    // glows it green (the source has an FK for this type) or red (it does not).
    const onResourceMouseEnter = (e: React.MouseEvent<SVGElement>) => {
        setHovered(true)
        // Live drop-target highlight: green if the source has an FK for this type,
        // red if not. Applies to both connect-mode and hover-port connect drags.
        if (!connectInProgress || connectSourceId === resource.ocid) return
        setConnectHint(canConnectResources(ocdDocument.design, connectSourceId, resource.ocid) ? 'valid' : 'invalid')
    }
    const onResourceMouseMove = (e: React.MouseEvent<SVGElement>) => {}
    const onResourceMouseLeave = (e: React.MouseEvent<SVGElement>) => {
        setHovered(false)
        if (connectHint !== 'none') setConnectHint('none')
    }
    console.debug(`>> OcdResourceSvg: OcdResourceSvg: Render(${resource.id})`, resource.class, resource.ocid)
    return (
        <g className={`ocd-designer-resource${connectHint !== 'none' ? ` ocd-connect-target-${connectHint}` : ''}`}
            id={resource.id}
            transform={`translate(${gX}, ${gY})`}
            onMouseDown={!hidden ? onResourceDragStart : onNooPEvent}
            onMouseUp={!hidden ? onResourceMouseUp : onNooPEvent}
            onMouseEnter={!hidden ? onResourceMouseEnter : onNooPEvent}
            onMouseLeave={!hidden ? onResourceMouseLeave : onNooPEvent}
            onClick={!hidden ? onResourceClick : onNooPEvent}
            onContextMenu={!hidden ? onResourceRightClick : onNooPEvent}
            >
                <SvgRect
                    ocdConsoleConfig={ocdConsoleConfig}
                    ocdDocument={ocdDocument}
                    setOcdDocument={updateOcdDocument}
                    resource={resource}
                    hidden={hidden}
                    setOrigin={setOrigin}
                    />
                {/* Connect-mode affordance: a handle hinting "drag me onto another
                    resource to wire an association". The whole resource is the drag
                    source; this is the visual cue. */}
                {ocdConsoleConfig.config.connectMode && !hidden && !resource.container &&
                    <circle className='ocd-connect-handle' cx={resource.w || 32} cy={(resource.h || 32) / 2} r={5} />}
                {/* Hover ports: always-available connect handles at the resource's
                    edge anchors. Shown only on hover, when not already in a connect
                    drag, not body-dragging, and not in connect mode (which has its
                    own handle). Pressing one starts a connect drag (onPortMouseDown
                    isolates it from pan/move via stop/preventDefault). */}
                {!hidden && !ghost && !resource.container && hovered && !dragging && !connectInProgress && !ocdConsoleConfig.config.connectMode &&
                    (['left', 'right', 'top', 'bottom'] as OcdConnectorSide[]).map((side) => {
                        const anchor = getAnchor({ x: 0, y: 0, w: resource.w || 32, h: resource.h || 32 }, side)
                        return <circle className='ocd-svg-connect-port'
                            key={`${resource.id}-port-${side}`}
                            cx={anchor.x} cy={anchor.y} r={4}
                            onMouseDown={onPortMouseDown} />
                    })}
                <OcdForeignObject
                    ocdConsoleConfig={ocdConsoleConfig}
                    ocdDocument={ocdDocument}
                    setOcdDocument={updateOcdDocument}
                    resource={resource}
                    hidden={hidden}
                    ghost={ghost}
                    origin={origin}
                    />
                {resource.coords && resource.coords.map((r:any) => {
                    return <OcdResourceSvg
                                ocdConsoleConfig={ocdConsoleConfig}
                                ocdDocument={ocdDocument}
                                setOcdDocument={updateOcdDocument}
                                contextMenu={contextMenu}
                                setContextMenu={(contextMenu: OcdContextMenu) => setContextMenu(contextMenu)}
                                svgDragDropEvents={svgDragDropEvents}
                                resource={r}
                                key={`${r.pgid}-${r.id}`}
                                />
                                })}
        </g>
    )
})

OcdResourceSvg.displayName = 'OcdResourceSvg'

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

export const OcdConnector = ({ocdConsoleConfig, ocdDocument, connector, parentConnector, label, labelOffsetY = 0}: ConnectorSvgProps): JSX.Element => {
    const simpleWidth = 40
    const detailedWidth = 170
    const simpleHeight = 40
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
    const path = buildConnectorPath(startDimensions, endDimensions, labelOffsetY)
    const className = parentConnector ? 'ocd-svg-parent-connector' : 'ocd-svg-association-connector'
    const labelText = label?.trim()
    const displayLabel = labelText && labelText.length > 56 ? `${labelText.slice(0, 53)}...` : labelText
    console.debug(`>> OcdResourceSvg: OcdConnector: Render()`)
    return (
        <g className='ocd-svg-connector-group'>
            <path className={className} d={path.d}>
                {labelText && <title>{labelText}</title>}
            </path>
            {displayLabel && (
                <text
                    className={`ocd-svg-connector-label ${parentConnector ? 'ocd-svg-parent-connector-label' : 'ocd-svg-association-connector-label'}`}
                    x={path.labelX}
                    y={path.labelY}
                    textAnchor='middle'
                >
                    {displayLabel}
                </text>
            )}
        </g>
    )
}

export default OcdResourceSvg
