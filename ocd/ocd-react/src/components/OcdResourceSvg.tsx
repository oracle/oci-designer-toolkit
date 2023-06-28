/* eslint-disable react/style-prop-object */
/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from 'react'
import OcdDocument, { OcdDragResource, OcdSelectedResource } from './OcdDocument'
import { OcdViewCoords } from '../model/OcdDesign'
import { ResourceRectProps, ResourceForeignObjectProps, ResourceSvgProps } from '../types/ReactComponentProperties'
import { OcdViewPage } from '../model/OcdDesign'
import { OcdUtils } from '../utils/OcdUtils'

const OcdSvgContextMenu = ({ contextMenu, setContextMenu }: any): JSX.Element => {
    console.info('OcdResourceSvg: OcdSvgContextMenu')
    const onMouseLeave = (e: React.MouseEvent<SVGElement>) => {
        console.info('OcdResourceSvg: Context OnMouseLeave')
        setContextMenu({show: false, x: 0, y: 0})
    }
    const onClick = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
    }
    const onRemoveClick = (e: React.MouseEvent<HTMLElement>) => {}
    const onDeleteClick = (e: React.MouseEvent<HTMLElement>) => {}
    const onCloneClick = (e: React.MouseEvent<HTMLElement>) => {}
    const onToFrontClick = (e: React.MouseEvent<HTMLElement>) => {}
    const onToBackClick = (e: React.MouseEvent<HTMLElement>) => {}
    const onBringForwardClick = (e: React.MouseEvent<HTMLElement>) => {}
    const onSendBackwardClick = (e: React.MouseEvent<HTMLElement>) => {}
    return (
        <g 
        transform={`translate(${contextMenu.x}, ${contextMenu.y})`}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        >
            <foreignObject className='ocd-svg-context-menu' id='svg_context_menu'>
                <div
                // @ts-ignore 
                xmlns='http://www.w3.org/1999/xhtml'>
                    <ul className='ocd-context-menu'>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onRemoveClick}>Remove From Page</a></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onDeleteClick}>Delete</a></li>
                        <li><hr/></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onCloneClick}>Clone</a></li>
                        <li><hr/></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onToFrontClick}>To Front</a></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onToBackClick}>To Back</a></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onBringForwardClick}>Bring Forward</a></li>
                        <li className='ocd-svg-context-menu-item'><a href='#' onClick={onSendBackwardClick}>Send Backward</a></li>
                    </ul>
                </div>
            </foreignObject>
        </g>
    )
}

const OcdSimpleRect = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource }: ResourceRectProps): JSX.Element => {
    const id = `${resource.id}-rect`
    const rectClass = `ocd-svg-simple ${ocdConsoleConfig.config.detailedResource ? 'ocd-svg-resource-detailed' : 'ocd-svg-resource-simple'}`
    return (
        <rect className={rectClass} 
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

const OcdContainerRect = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource }: ResourceRectProps): JSX.Element => {
    const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
    const container_rect_offset = 0
    const id = `${resource.id}-rect`
    const width = resource.w + dimensions.w 
    const height = resource.h + dimensions.h
    const onResizeEnd = () => {
        const page: OcdViewPage = ocdDocument.getActivePage()
        const coords: OcdViewCoords = {
            id: resource.id,
            pgid: '',
            ocid: '',
            pocid: '',
            x: resource.x,
            y: resource.y,
            w: resource.w + dimensions.w,
            h: resource.h + dimensions.h,
            title: '',
            class: ''
        }
        setDimensions({w: 0, h: 0})
        ocdDocument.updateCoords(coords, page.id)
        // // Redraw
        console.info('Design:', ocdDocument)
        // setViewPage(structuredClone(ocdDocument.getPage(viewPage.id)))
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    // console.info('Selected Resource', ocdDocument.selectedResource, 'Resource Id', resource.id)
    return (
        <g>
            <rect className='ocd-svg-container' 
                id={id} 
                x={container_rect_offset} 
                y={container_rect_offset} 
                width={width} 
                height={height} 
                data-gid={resource.id} 
                data-pgid={resource.pgid} 
                data-ocid={resource.ocid} 
                data-pocid={resource.pocid}
                >
            </rect>
            {/* <OcdResizePoint resource={resource} cx={width / 2} cy={0} position={'north'} setDimensions={setDimensions} onResizeEnd={onResizeEnd}/> */}
            {ocdDocument.selectedResource.coordsId === resource.id && <OcdResizePoint resource={resource} cx={width / 2} cy={height} position={'south'} setDimensions={setDimensions} onResizeEnd={onResizeEnd}/>}
            {/* <OcdResizePoint resource={resource} cx={0} cy={height / 2} position={'east'} setDimensions={setDimensions} onResizeEnd={onResizeEnd}/> */}
            {ocdDocument.selectedResource.coordsId === resource.id && <OcdResizePoint resource={resource} cx={width} cy={height / 2} position={'west'}  setDimensions={setDimensions} onResizeEnd={onResizeEnd}/>}
        </g>
    )
}

const OcdResizePoint = ({resource, cx, cy, position, setDimensions, onResizeEnd}: any): JSX.Element => {
    const [mouseOver, setMouseOver] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [origin, setOrigin] = useState({ x: 0, y: 0 });
    const radius = mouseOver ? 50 : 3
    const onResizeDragStart = (e: any) => {
        e.stopPropagation()
        // Record Starting Point
        setOrigin({ x: e.clientX, y: e.clientY })
        setDragging(true)
    }
    const onResizeDrag = (e: any) => {
        e.stopPropagation()
        if (dragging) {
            // Set state for the change in dimensions.
            const dimensions = {
                w: (position === 'east' || position === 'west') ? e.clientX - origin.x : 0,
                h: (position === 'north' || position === 'south') ? e.clientY - origin.y : 0
            }
            setDimensions(dimensions)
        }
    }
    const onResizeDragEnd = (e: any) => {
        e.stopPropagation()
        setDragging(false)
        const dimensions = {
            w: (position === 'east' || position === 'west') ? e.clientX - origin.x : 0,
            h: (position === 'north' || position === 'south') ? e.clientY - origin.y : 0
        }
        setDimensions(dimensions)
        onResizeEnd()
    }
    const onMouseOver = (e: any) => {
        setMouseOver(true)
    }
    const onMouseOut = (e: any) => {
        setMouseOver(false)
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
            />
        </g>
    )
}

const OcdForeignObject = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource }: ResourceForeignObjectProps) => {
    const id = `${resource.id}-fo`
    const backgroundColourClass = `${resource.class}-background-colour`
    const foreignObjectClass = `ocd-svg-foreign-object ${resource.container ? 'ocd-svg-resource-container' :ocdConsoleConfig.config.detailedResource ? 'ocd-svg-resource-detailed' : 'ocd-svg-resource-simple'}`
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        ocdDocument.setDisplayName(resource.ocid, e.target.value.trim())
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <foreignObject id={id} className={foreignObjectClass}>
            <div 
            // @ts-ignore 
            xmlns='http://www.w3.org/1999/xhtml'>
                <div className={backgroundColourClass} title={ocdDocument.getDisplayName(resource.ocid)}>
                    <div className={`${resource.class} ocd-svg-icon`}></div>
                </div>
                <div className='ocd-svg-foreign-object-display-name'>
                    <span>{resource.title}</span>
                    <input type='text' value={ocdDocument.getDisplayName(resource.ocid)} onChange={onChange} tabIndex={-1}></input>
                </div>
            </div>
        </foreignObject>
    )
}

export const OcdResourceSvg = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource }: ResourceSvgProps): JSX.Element => {
    const [contextMenu, setContextMenu] = useState({show: false, x: 0, y: 0})
    const [dragging, setDragging] = useState(false)
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const [origin, setOrigin] = useState({ x: 0, y: 0 });
    const SvgRect = resource.container ? OcdContainerRect : OcdSimpleRect
    // const gX = resource.x + coordinates.x
    // const gY = resource.y + coordinates.y
    const gX = resource.x
    const gY = resource.y
    const onResourceDragStart = (e: React.MouseEvent<SVGElement>) => {
        if (!ocdDocument.dragResource.dragging) {
            // console.info('OcdResourceSvg: Resource Drag Start', resource.ocid)
            // e.stopPropagation()
            // Record Starting Point
            setOrigin({ x: e.clientX, y: e.clientY })
            setDragging(true)
            const dragResource: OcdDragResource = ocdDocument.newDragResource(true)
            dragResource.modelId = resource.ocid
            dragResource.pageId = ocdDocument.getActivePage().id
            dragResource.coordsId = resource.id
            dragResource.class = resource.class
            dragResource.resource = resource
            ocdDocument.dragResource = dragResource
        } else // console.info('OcdResourceSvg: Resource Drag Start - Currently Dragging Child', resource.ocid)
        e.preventDefault()
    }
    const onResourceDrag = (e: React.MouseEvent<SVGElement>) => {
        // e.stopPropagation()
        if (dragging) {
            // Set state for the change in coordinates.
            setCoordinates({
              x: e.clientX - origin.x,
              y: e.clientY - origin.y,
            })
        }
    }
    const onResourceDragEnd = (e: React.MouseEvent<SVGElement>) => {
        // e.stopPropagation()
        if (dragging) {
            setDragging(false)
            const page: OcdViewPage = ocdDocument.getActivePage()
            const coords: OcdViewCoords = {
                id: resource.id,
                pgid: '',
                ocid: '',
                pocid: '',
                x: resource.x + coordinates.x,
                y: resource.y + coordinates.y,
                w: resource.w,
                h: resource.h,
                title: '',
                class: ''
            }
            setCoordinates({ x: 0, y: 0 })
            ocdDocument.updateCoords(coords, page.id)
            // Remove Drag Resource
            ocdDocument.dragResource = ocdDocument.newDragResource()
        // Redraw
            console.info('Design:', ocdDocument)
            // setViewPage(structuredClone(ocdDocument.getPage(viewPage.id)))
            setOcdDocument(OcdDocument.clone(ocdDocument))
        }
    }
    const onResourceClick = (e: React.MouseEvent<SVGElement>) => {
        console.info('OcdResourceSvg: Clicked', resource.id, e.clientX, e.clientY)
        e.stopPropagation()
        const clone = OcdDocument.clone(ocdDocument)
        const selectedResource: OcdSelectedResource = {
            modelId: resource.ocid,
            pageId: ocdDocument.getActivePage().id,
            coordsId: resource.id,
            class: resource.class
        }
        clone.selectedResource = selectedResource
        setOcdDocument(clone)
    }
    const onResourceRightClick = (e: React.MouseEvent<SVGElement>) => {
        console.info('OcdResourceSvg: Right Click', e.clientX, e.clientY)
        e.stopPropagation()
        e.preventDefault()
        console.info('OcdResourceSvg: Right Click', resource)
        const relativeXY = ocdDocument.getRelativeXY(resource)
        console.info('OcdResourceSvg: Right Click', relativeXY, e.clientX, e.clientY)

        // Get Canvas
        const svg = document.getElementById('canvas_root_svg')
        // @ts-ignore 
        const point = new DOMPoint(e.clientX - relativeXY.x, e.clientY - relativeXY.y)
        console.info('OcdResourceSvg: Right Click Point', point)
        // @ts-ignore 
        const { x, y } =  point.matrixTransform(svg.getScreenCTM().inverse())
        console.info('x:', x, 'y:', y)

        // const contextPosition = {show: true, x: e.clientX - relativeXY.x, y: e.clientY - relativeXY.y }
        const contextPosition = {show: true, x: x, y: y }
        console.info('OcdResourceSvg: Right Click', contextPosition)
        // // @ts-ignore 
        // setContextMenu({show: true, x: e.offsetX, y: e.offsetY })
        setContextMenu(contextPosition)
        // setContextMenu({show: true, x: contextCoords.x, y: contextCoords.y })
    }
    const onResourceMouseUp = (e: React.MouseEvent<SVGElement>) => {
        if (resource.container) {
            // console.info('>>>OcdResourceSvg: Mouse Up -> Container', resource.id)
            ocdDocument.dragResource.parent = resource
        }
        e.preventDefault()
    }
    const onResourceMouseMoveEnterLeave = (e: React.MouseEvent<SVGElement>) => {
        if (resource.container) {
            // console.info('>>>OcdResourceSvg: Mouse Move/Enter/Leave -> Container', resource.id)
            e.preventDefault()
        }
    }
    return (
        <g className='ocd-designer-resource' 
            id={resource.id} 
            data-ox={resource.x} 
            data-oy={resource.y} 
            data-gid={resource.id} 
            data-pgid={resource.pgid} 
            data-ocid={resource.ocid} 
            data-pocid={resource.pocid}
            transform={`translate(${gX}, ${gY})`}
            onMouseDown={onResourceDragStart}
            onMouseMove={onResourceMouseMoveEnterLeave}
            // onMouseMove={onResourceDrag}
            // onMouseUp={onResourceDragEnd}
            onMouseUp={onResourceMouseUp}
            onMouseEnter={onResourceMouseMoveEnterLeave}
            onMouseLeave={onResourceMouseMoveEnterLeave}
            // onMouseLeave={onResourceDragEnd}
            onClick={onResourceClick}
            onContextMenu={onResourceRightClick}
            >
                <SvgRect 
                    ocdConsoleConfig={ocdConsoleConfig}
                    ocdDocument={ocdDocument}
                    setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                    resource={resource}
                    />
                <OcdForeignObject 
                    ocdConsoleConfig={ocdConsoleConfig}
                    ocdDocument={ocdDocument}
                    setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                    resource={resource}
                    />
                {resource.coords && resource.coords.map((r:any) => {
                    return <OcdResourceSvg
                                ocdConsoleConfig={ocdConsoleConfig}
                                ocdDocument={ocdDocument}
                                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                                resource={r}
                                key={`${r.pgid}-${r.id}`}
                    />
                })}
                {contextMenu.show && <OcdSvgContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu}/>}
        </g>
    )
}

export const OcdDragResourceGhostSvg = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource }: ResourceSvgProps): JSX.Element => {
    const SvgRect = resource.container ? OcdContainerRect : OcdSimpleRect
    return (
        <g className='ocd-drag-drag-ghost'
            transform={`translate(0, 0)`}
        >
            <SvgRect 
                ocdConsoleConfig={ocdConsoleConfig}
                ocdDocument={ocdDocument}
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                resource={resource}
                />
            <OcdForeignObject 
                ocdConsoleConfig={ocdConsoleConfig}
                ocdDocument={ocdDocument}
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                resource={resource}
                />
            {resource.coords && resource.coords.map((r:any) => {
                return <OcdResourceSvg
                            ocdConsoleConfig={ocdConsoleConfig}
                            ocdDocument={ocdDocument}
                            setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                            resource={r}
                            key={`${r.pgid}-${r.id}-ghost`}
                />
            })}
        </g>
    )
}

export default OcdResourceSvg
