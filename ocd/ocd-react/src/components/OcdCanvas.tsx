/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import OcdDocument from './OcdDocument'
import OcdResourceSvg, { OcdDragResourceGhostSvg } from './OcdResourceSvg'
import { OcdViewCoords, OcdViewLayer, OcdViewPage } from '../model/OcdDesign'
import { OcdResource } from '../model/OcdResource'
import { CanvasProps, OcdMouseEvents } from '../types/ReactComponentProperties'
import { useState } from 'react'
import { newDragData } from '../types/DragData'

export const OcdCanvas = ({ dragData, setDragData, ocdConsoleConfig, ocdDocument, setOcdDocument }: CanvasProps): JSX.Element => {
    // console.info('OcdCanvas: OCD Document:', ocdDocument)
    const [contextMenu, setContextMenu] = useState({show: false, x: 0, y: 0, resource: undefined})
    const [dragging, setDragging] = useState(false)
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const [ghostTranslate, setGhostTranslate] = useState({ x: 0, y: 0 });
    const [origin, setOrigin] = useState({ x: 0, y: 0 });
    const resource = ocdDocument.dragResource.resource

    const onDragOver = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
    }

    const onDragLeave = () => {
    }

    const onDrop = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        if (dragData.dragObject) {
            // const dropTarget = e.currentTarget as HTMLElement
            const dropTarget = e.target as HTMLElement
            console.info('OcdCanvas: Event:', e)
            console.info('OcdCanvas: Target:', e.target)
            console.info('OcdCanvas: Current Target:', e.currentTarget)
            console.info('OcdCanvas: Target Attributes:', dropTarget.getAttributeNames())
            // console.info('Target Attributes:', e.target.attributes)
            // Get Page
            const page: OcdViewPage = ocdDocument.getActivePage()
            const layer: OcdViewLayer = ocdDocument.getActiveLayer(page.id)
            const compartmentId: string = layer.id
            const pocid = dropTarget.dataset.ocid ? dropTarget.dataset.ocid : ''
            const pgid = dropTarget.dataset.gid ? dropTarget.dataset.gid : ''
            console.info('OcdCanvas: Dataset', dropTarget.dataset)
            console.info('OcdCanvas: pocid', dropTarget.dataset.ocid)
            console.info('OcdCanvas: pgid', dropTarget.dataset.gid)
            const container = dragData.dragObject.container
            // Get drop Coordinates
            const svg = document.getElementById('canvas_root_svg')
            // @ts-ignore 
            const point = new DOMPoint(e.clientX - dragData.offset.x, e.clientY - dragData.offset.y)
            console.info('OcdCanvas: Drop Point', point)
            // @ts-ignore 
            const { x, y } =  point.matrixTransform(svg.getScreenCTM().inverse())
            console.info('x:', x, 'y:', y)
            // Add to OCD Model/View
            const modelResource: OcdResource = dragData.existingResource ? dragData.resource : ocdDocument.addResource(dragData.dragObject, compartmentId)
            const coords: OcdViewCoords = ocdDocument.newCoords()
            coords.id = uuid()
            coords.pgid = pgid
            coords.ocid = modelResource.id
            coords.pocid = pocid
            coords.x = x
            coords.y = y
            coords.w = container ? 200 : 32
            coords.h = container ? 200 : 32
            coords.title = dragData.dragObject.title
            coords.class = dragData.dragObject.class
            coords.container = container
            ocdDocument.addCoords(coords, page.id, pgid)
            // Set as selected
            ocdDocument.selectedResource = {
                modelId: modelResource.id,
                pageId: ocdDocument.getActivePage().id,
                coordsId: coords.id,
                class: dragData.dragObject.class
            }
            // Clear Drag Data Information
            setDragData(newDragData())
            // Redraw
            console.info('OcdCanvas: Design:', ocdDocument)
            setOcdDocument(OcdDocument.clone(ocdDocument))
        }
        return false
    }

    const onSVGDragStart = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        console.info('OcdCanvas: SVG Drag Start', ocdDocument.dragResource)
        if (ocdDocument.dragResource.dragging) {
            console.info('SVG Drag Start - Dragging')
            const ghostXY = ocdDocument.getRelativeXY(ocdDocument.dragResource.resource)
            // Record Starting Point
            setOrigin({ x: e.clientX, y: e.clientY })
            setGhostTranslate({x: ghostXY.x, y: ghostXY.y})
            setDragging(true)
        }
    }
    const onSVGDrag = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        e.preventDefault()
        if (dragging) {
            console.info('OcdCanvas: SVG Drag')
            const ghostXY = ocdDocument.getRelativeXY(ocdDocument.dragResource.resource)
            // Set state for the change in coordinates.
            setCoordinates({
              x: e.clientX - origin.x,
              y: e.clientY - origin.y,
            })
            setGhostTranslate({
              x: ghostXY.x + coordinates.x,
              y: ghostXY.y + coordinates.y,
            })
        }
    }
    const onSVGDragEnd = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        if (dragging) {
            console.info('OcdCanvas: SVG Drag End', ocdDocument.dragResource)
            setDragging(false)
            // Test if container dropped on self
            if (ocdDocument.dragResource.parent && ocdDocument.dragResource.resource.id === ocdDocument.dragResource.parent.id) {
                delete ocdDocument.dragResource.parent
            }
            const page: OcdViewPage = ocdDocument.getActivePage()
            const coords: OcdViewCoords = ocdDocument.newCoords()
            coords.id = resource.id
            coords.x = resource.x + coordinates.x
            coords.y = resource.y + coordinates.y
            coords.w = resource.w
            coords.h = resource.h
            if (ocdDocument.dragResource.parent) {
                coords.pgid = ocdDocument.dragResource.parent.id
                coords.pocid = ocdDocument.dragResource.parent.ocid    
            }
            setCoordinates({ x: 0, y: 0 })
            setGhostTranslate({ x: 0, y: 0 })
            ocdDocument.updateCoords(coords, page.id)
            ocdDocument.dragResource = ocdDocument.newDragResource()
            // Redraw
            setOcdDocument(OcdDocument.clone(ocdDocument))
        }
    }

    const onContextClick = (e: React.MouseEvent<HTMLElement>) => {}

    const uuid = () => `gid-${uuidv4()}`

    const page: OcdViewPage = ocdDocument.getActivePage()
    const layers = page.layers.filter((l: OcdViewLayer) => l.visible).map((l: OcdViewLayer) => l.id)
    const visibleResourceIds = ocdDocument.getResources().filter((r: any) => layers.includes(r.compartmentId)).map((r: any) => r.id)
    const mouseEvents: OcdMouseEvents = {
        'onSVGDragStart': onSVGDragStart,
        'onSVGDrag': onSVGDrag,
        'onSVGDragEnd': onSVGDrag,
    }

    return (
        <div className='ocd-designer-canvas ocd-background' 
            key='ocd-designer-canvas'
            onDrop={(e) => onDrop(e)}
            onDragLeave={(e) => onDragLeave()}
            onDragOver={(e) => onDragOver(e)}
            >
            <svg className='ocd-designer-canvas-svg'
                id='canvas_root_svg' 
                width='100%' 
                height='100%' 
                data-gid='' 
                data-ocid=''
                onMouseDown={onSVGDragStart}
                onMouseMove={onSVGDrag}
                onMouseUp={onSVGDragEnd}
                onMouseLeave={onSVGDragEnd}
                    >
                    <g>
                        {page.coords && page.coords.filter((r: OcdViewCoords) => visibleResourceIds.includes(r.ocid)).map((r: OcdViewCoords) => {
                            return <OcdResourceSvg
                                        ocdConsoleConfig={ocdConsoleConfig}
                                        ocdDocument={ocdDocument}
                                        setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                                        resource={r}
                                        key={`${r.pgid}-${r.id}`}
                            />
                        })}
                    </g>
                    <g className='ocd-ghost-group'
                        transform={`translate(${ghostTranslate.x}, ${ghostTranslate.y})`}
                        >
                        {dragging && <OcdDragResourceGhostSvg 
                                        ocdConsoleConfig={ocdConsoleConfig}
                                        ocdDocument={ocdDocument}
                                        setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                                        resource={ocdDocument.dragResource.resource}
                                        key={`${ocdDocument.dragResource.resource.pgid}-${ocdDocument.dragResource.resource.id}`}
                                    />}
                    </g>
            </svg>
            {contextMenu.show && 
            <div className='ocd-context-menu-div hidden'>
                <ul className='ocd-context-menu'>
                    <li className='ocd-svg-context-menu-item'><a href='#' onClick={onContextClick}>Remove From Page</a></li>
                    <li className='ocd-svg-context-menu-item'><a href='#' onClick={onContextClick}>Delete</a></li>
                    <li><hr/></li>
                    <li className='ocd-svg-context-menu-item'><a href='#' onClick={onContextClick}>Clone</a></li>
                    <li><hr/></li>
                    <li className='ocd-svg-context-menu-item'><a href='#' onClick={onContextClick}>To Front</a></li>
                    <li className='ocd-svg-context-menu-item'><a href='#' onClick={onContextClick}>To Back</a></li>
                    <li className='ocd-svg-context-menu-item'><a href='#' onClick={onContextClick}>Bring Forward</a></li>
                    <li className='ocd-svg-context-menu-item'><a href='#' onClick={onContextClick}>Send Backward</a></li>
                </ul>
            </div>
            }
        </div>
    )
}

export default OcdCanvas
