/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdAddResourceResponse, OcdDocument, OcdDragResource, OcdSelectedResource } from './OcdDocument'
import { OcdResourceSvg, OcdConnector, OcdDragResourceGhostSvg, OcdSvgContextMenu } from './OcdResourceSvg'
import { OcdResource, OcdViewConnector, OcdViewCoords, OcdViewLayer, OcdViewPage } from '@ocd/model'
import { CanvasProps, OcdMouseEvents } from '../types/ReactComponentProperties'
import { useContext, useState } from 'react'
import { newDragData } from '../types/DragData'
import { ActiveFileContext } from '../pages/OcdConsole'
import { OcdUtils } from '@ocd/core'

export interface OcdContextMenu {
    show: boolean
    x: number
    y: number
    resource?: OcdViewCoords
}

export interface Point {
    x: number
    y: number
}

export const OcdCanvasGrid = (): JSX.Element => {
    return (
        <rect width="100%" height="100%" fill="url(#grid)"></rect>
    )
}

export const OcdCanvas = ({ dragData, setDragData, ocdConsoleConfig, ocdDocument, setOcdDocument }: CanvasProps): JSX.Element => {
    // console.info('OcdCanvas: OCD Document:', ocdDocument)
    console.info('OcdCanvas: OCD Design:', ocdDocument.design)
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const uuid = () => `gid-${uuidv4()}`
    const page: OcdViewPage = ocdDocument.getActivePage()
    const allCompartmentIds = ocdDocument.getOciResourceList('comparment').map((r) => r.id)
    const visibleLayers = page.layers.filter((l: OcdViewLayer) => l.visible).map((l: OcdViewLayer) => l.id)
    // const visibleResourceIds = ocdDocument.getResources().filter((r: OcdResource) => visibleLayers.includes(r.compartmentId) || (!allCompartmentIds.includes(r.compartmentId) && r.resourceType !== 'Compartment')).map((r: any) => r.id)
    const visibleResourceIds = ocdDocument.getResources().filter((r: any) => visibleLayers.includes(r.compartmentId)).map((r: any) => r.id)
    // const visibleResourceIds = ocdDocument.getResources().map((r: any) => r.id)
    // console.debug('OcdCanvas: Visible Resource Ids', visibleResourceIds)
    const [dragResource, setDragResource] = useState(ocdDocument.newDragResource(false))
    const [contextMenu, setContextMenu] = useState<OcdContextMenu>({show: false, x: 0, y: 0})
    const [dragging, setDragging] = useState(false)
    const [coordinates, setCoordinates] = useState<Point>({ x: 0, y: 0 });
    const [ghostTranslate, setGhostTranslate] = useState<Point>({ x: 0, y: 0 });
    const [origin, setOrigin] = useState<Point>({ x: 0, y: 0 });
    const [panOrigin, setPanOrigin] = useState<Point>({ x: 0, y: 0 });
    // const [transformMatrix, setTransformMatrix] = useState(page.transform)
    const transformMatrix = page.transform
    const [panning, setPanning] = useState(false)
    // const resource = ocdDocument.dragResource.resource

    // Click Event to Reset Selected
    const onClick = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        const clone = OcdDocument.clone(ocdDocument)
        const selectedResource: OcdSelectedResource = {
            modelId: '',
            pageId: ocdDocument.getActivePage().id,
            coordsId: '',
            class: ''
        }
        clone.selectedResource = selectedResource
        setOcdDocument(clone)
    }

    // HTML Drag & Drop Events
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
            const point = new DOMPoint(e.clientX - dragData.offset.x - transformMatrix[4], e.clientY - dragData.offset.y - transformMatrix[5])
            console.info('OcdCanvas: Drop Point', point)
            // @ts-ignore 
            // const { x, y } =  point.matrixTransform(svg.getCTM().inverse())
            const { x, y } =  point.matrixTransform(svg.getScreenCTM().inverse())
            console.info('x:', x, 'y:', y)
            // Add to OCD Model/View
            // const modelResource: OcdResource = dragData.existingResource ? dragData.resource : ocdDocument.addResource(dragData.dragObject, compartmentId)
            const response: OcdAddResourceResponse = dragData.existingResource ? {modelResource: dragData.resource, additionalResources: []} : ocdDocument.addResource(dragData.dragObject, compartmentId)
            const modelResource = response.modelResource
            const additionalResources = response.additionalResources
            if (modelResource) {
                ocdDocument.setResourceParent(modelResource.id, pocid)
                const coords: OcdViewCoords = ocdDocument.newCoords()
                coords.id = uuid()
                coords.pgid = pgid
                coords.ocid = modelResource.id
                coords.pocid = pocid
                coords.x = x / transformMatrix[0]
                coords.y = y / transformMatrix[3]
                coords.w = container ? 300 : 32
                coords.h = container ? 300 : 32
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
                let additionalY = 60 + y
                let additionalX = 15 + x
                additionalResources.forEach((r: OcdResource) => {
                    console.debug('OcdCanvas: Additional Resource', r)
                    const modelResource = r
                    if (modelResource) {
                        const childCoords: OcdViewCoords = ocdDocument.newCoords()
                        childCoords.id = uuid()
                        childCoords.pgid = coords.id
                        childCoords.ocid = modelResource.id
                        childCoords.pocid = coords.ocid
                        childCoords.x = additionalX / transformMatrix[0]
                        childCoords.y = additionalY / transformMatrix[3]
                        childCoords.w = 32
                        childCoords.h = 32
                        childCoords.title = modelResource.resourceTypeName
                        childCoords.class = OcdUtils.toCssClassName(modelResource.provider, modelResource.resourceTypeName.split(' ').join('_'))
                        childCoords.container = false
                        ocdDocument.addCoords(childCoords, page.id, coords.id)
                        additionalY += 60 
                    }
                })
            }
            // Clear Drag Data Information
            setDragData(newDragData())
            // Redraw
            console.info('OcdCanvas: Design:', ocdDocument.design)
            setOcdDocument(OcdDocument.clone(ocdDocument))
            if (!activeFile.modified) setActiveFile({name: activeFile.name, modified: true})
        }
        return false
    }

    // SVG Drag & Drop / Pan Events
    const onSVGDragStart = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        // console.info('OcdCanvas: SVG Drag Start', ocdDocument.dragResource)
        if (ocdDocument.dragResource.dragging) {
            console.info('SVG Drag Start - Dragging')
            const ghostXY = ocdDocument.getRelativeXY(ocdDocument.dragResource.resource)
            // Record Starting Point
            setOrigin({ x: e.clientX / transformMatrix[0], y: e.clientY / transformMatrix[3] })
            setGhostTranslate({x: ghostXY.x, y: ghostXY.y})
            setDragging(true)
        } else {
            setOrigin({ x: e.clientX, y: e.clientY })
            setPanOrigin({ x: transformMatrix[4], y: transformMatrix[5] })
            setPanning(true)
        }
    }
    const onSVGDrag = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        e.preventDefault()
        if (dragging) {
            console.debug('OcdCanvas: SVG Drag')
            const ghostXY = ocdDocument.getRelativeXY(ocdDocument.dragResource.resource)
            // Set state for the change in coordinates.
            setCoordinates({
              x: e.clientX / transformMatrix[0] - origin.x,
              y: e.clientY / transformMatrix[3] - origin.y,
            })
            setGhostTranslate({
              x: ghostXY.x + coordinates.x,
              y: ghostXY.y + coordinates.y,
            })
        } else if (panning) {
            console.debug('OcdCanvas: SVG Panning')
            setCoordinates({
                x: e.clientX - origin.x,
                y: e.clientY - origin.y,
            })
            page.transform = [...transformMatrix.slice(0,4), coordinates.x + panOrigin.x, coordinates.y + panOrigin.y]
            setOcdDocument(OcdDocument.clone(ocdDocument))
              // const newMatrix = [...transformMatrix.slice(0,4), coordinates.x + panOrigin.x, coordinates.y + panOrigin.y]
            // setTransformMatrix(newMatrix)
        }
    }
    const onSVGDragEnd = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        if (dragging) {
            console.info('OcdCanvas: SVG Drag End', ocdDocument.dragResource)
            const hasMoved = coordinates.x !== 0 || coordinates.y !== 0
            setDragging(false)
            // Test if container dropped on self
            if (ocdDocument.dragResource.parent && ocdDocument.dragResource.resource.id === ocdDocument.dragResource.parent.id) {
                delete ocdDocument.dragResource.parent
            }
            const page: OcdViewPage = ocdDocument.getActivePage()
            const coords: OcdViewCoords = ocdDocument.newCoords()
            const resource = ocdDocument.dragResource.resource
            coords.id = resource.id
            coords.x = resource.x + coordinates.x
            coords.y = resource.y + coordinates.y
            coords.w = resource.w
            coords.h = resource.h
            if (ocdDocument.dragResource.parent) {
                coords.pgid = ocdDocument.dragResource.parent.id
                coords.pocid = ocdDocument.dragResource.parent.ocid    
                ocdDocument.setResourceParent(ocdDocument.dragResource.modelId, coords.pocid)
            } else if (contextMenu.show) {
                coords.pgid = resource.pgid
                coords.pocid = resource.pocid
            }
            setCoordinates({ x: 0, y: 0 })
            setGhostTranslate({ x: 0, y: 0 })
            ocdDocument.updateCoords(coords, page.id)
            ocdDocument.dragResource = ocdDocument.newDragResource()
            // Redraw
            setOcdDocument(OcdDocument.clone(ocdDocument))
            if (!activeFile.modified && hasMoved) setActiveFile({name: activeFile.name, modified: true})
        } else if (panning) {
            setPanning(false)
            setCoordinates({ x: 0, y: 0 })
            // page.transform = transformMatrix
            // setOcdDocument(OcdDocument.clone(ocdDocument))
        }
    }
    const onWheel = (e: React.WheelEvent<SVGElement>) => {
        if (ocdConsoleConfig.config.zoomOnWheel) {
            const scrollSensitivity = 0.01
            const scale = e.deltaY
            const newMatrix = transformMatrix.slice()
            newMatrix[0] += (scale * scrollSensitivity)
            newMatrix[3] += (scale * scrollSensitivity)
            // console.debug('OcdCanvas: Mew Matrix', newMatrix)
            // Set limits
            // if (newMatrix[0] >= 0.3 && newMatrix[0] <= 3) setTransformMatrix(newMatrix)
            if (newMatrix[0] >= 0.3 && newMatrix[0] <= 5) {
                page.transform = newMatrix
                setOcdDocument(OcdDocument.clone(ocdDocument))
            }
        }
    }

    /*
    ** Top Level Events
    */
    const svgDragStart = (e: React.MouseEvent<SVGElement>) => {
        console.debug('OcdCanvas: SVG Drag Start', e.currentTarget)
        e.preventDefault()
        e.stopPropagation()
        const coordsId = e.currentTarget.id
        const resource = ocdDocument.getCoords(coordsId)
        if (resource) {
            const dragResource: OcdDragResource = ocdDocument.newDragResource(true)
            dragResource.modelId = resource.ocid
            dragResource.pageId = ocdDocument.getActivePage().id
            dragResource.coordsId = resource.id
            dragResource.class = resource.class
            dragResource.resource = resource
            setDragResource(dragResource)
            const ghostXY = ocdDocument.getRelativeXY(dragResource.resource)
            // Record Starting Point
            setOrigin({ x: e.clientX, y: e.clientY })
            setGhostTranslate({x: ghostXY.x, y: ghostXY.y})
            setDragging(true)
        }
}
    const svgDrag = (e: React.MouseEvent<SVGElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (dragging) {
            console.info('OcdCanvas: SVG Drag')
            const ghostXY = ocdDocument.getRelativeXY(dragResource.resource)
            // Set state for the change in coordinates.
            setCoordinates({
              x: e.clientX - origin.x,
              y: e.clientY - origin.y,
            })
            setGhostTranslate({
              x: ghostXY.x + coordinates.x,
              y: ghostXY.y + coordinates.y,
            })
            console.info('OcdCanvas: SVG Drag', ghostTranslate)
        }
    }
    const svgDrop = (e: React.MouseEvent<SVGElement>) => {
        console.debug('OcdCanvas: SVG Drop', e.currentTarget)
        e.preventDefault()
        e.stopPropagation()
        const dropTargetCoordsId = e.currentTarget.id
        const dropTargetResource = ocdDocument.getCoords(dropTargetCoordsId)
        if (dragging) {
            dragResource.parent = dropTargetResource && dropTargetResource.container ? dropTargetResource : undefined 
            console.info('OcdCanvas: SVG Drag End', ocdDocument.dragResource)
            setDragging(false)
            // Test if container dropped on self
            if (dragResource.parent && dragResource.resource.id === dragResource.parent.id) {
                delete dragResource.parent
            }
            const page: OcdViewPage = ocdDocument.getActivePage()
            const coords: OcdViewCoords = ocdDocument.newCoords()
            const resource = dragResource.resource
            coords.id = resource.id
            coords.x = resource.x + coordinates.x
            coords.y = resource.y + coordinates.y
            coords.w = resource.w
            coords.h = resource.h
            if (dragResource.parent) {
                coords.pgid = dragResource.parent.id
                coords.pocid = dragResource.parent.ocid    
            } else if (contextMenu.show) {
                coords.pgid = resource.pgid
                coords.pocid = resource.pocid
            }
            setCoordinates({ x: 0, y: 0 })
            setGhostTranslate({ x: 0, y: 0 })
            ocdDocument.updateCoords(coords, page.id)
            setDragResource(ocdDocument.newDragResource())
            // Redraw
            setOcdDocument(OcdDocument.clone(ocdDocument))
            if (!activeFile.modified) setActiveFile({name: activeFile.name, modified: true})
        }
    }
    const svgDragDropEvents: OcdMouseEvents = {
        'onSVGDragStart': svgDragStart,
        'onSVGDrag': svgDrag,
        'onSVGDragEnd': svgDrop,
    }

    const calculateSvgWidth = (coords: OcdViewCoords[]): number => {
        const simpleWidth = 40
        const detailedWidth = 170
        let width = 0
        coords.forEach((c => width = Math.max(width, (c.x + (c.container && (!c.detailsStyle || c.detailsStyle === 'default') ? c.w : (!c.detailsStyle || c.detailsStyle === 'detailed') ? detailedWidth : simpleWidth)))))
        width += 100
        return width
    }

    const calculateSvgHeight = (coords: OcdViewCoords[]): number => {
        const simpleHeight = 40
        let height = 0
        coords.forEach((c => height = Math.max(height, (c.y + (c.container && (!c.detailsStyle || c.detailsStyle === 'default') ? c.h : simpleHeight)))))
        height += 100
        return height
    }

    const svgWidth = calculateSvgWidth(page.coords)
    const svgHeight = calculateSvgHeight(page.coords)

    // @ts-ignore 
    const allPageCoords = ocdDocument.getAllPageCoords(page)
    const allVisibleCoords = allPageCoords.filter((r: OcdViewCoords) => visibleResourceIds.includes(r.ocid))
    // const visibleCoords = page.coords.filter((r: OcdViewCoords) => visibleResourceIds.includes(r.ocid))
    const visibleCoords = page.coords
    // page.coords && page.coords.filter((r: OcdViewCoords) => visibleResourceIds.includes(r.ocid))
    const parentMap = allVisibleCoords.filter(c => c.showParentConnection).map((r: OcdViewCoords) => {return {parentId: ocdDocument.getResourceParentId(r.ocid), childId: r.ocid, childCoordsId: r.id, pgid: r.pgid}})
    const parentConnectors = parentMap.reduce((a, c) => {return [...a, ...allVisibleCoords.filter(coords => coords.ocid === c.parentId).filter(p => p.id !== c.pgid).map(p => {return {startCoordsId: p.id, endCoordsId: c.childCoordsId}})]}, [] as OcdViewConnector[])
    const associationMap = allVisibleCoords.filter(c => c.showConnections).map((r: OcdViewCoords) => {return ocdDocument.getResourceAssociationIds(r.ocid).map(aId => {return {startCoordsId: r.id, associationId: aId}})}).reduce((a, c) => [...a, ...c], [])
    const associationConnectors = associationMap.reduce((a, c) => {return [...a, ...allVisibleCoords.filter(coords => coords.ocid === c.associationId).filter(p => p.pgid !== c.startCoordsId).map(p => {return {startCoordsId: c.startCoordsId, endCoordsId: p.id}})]}, [] as OcdViewConnector[])
    // console.debug('OcdCanvas: Page Coords', page.coords)
    // console.debug('OcdCanvas: All Page Coords', allPageCoords)
    // console.debug('OcdCanvas: Parent Map', parentMap)
    // console.debug('OcdCanvas: Parent Connectors', parentConnectors)
    // console.debug('OcdCanvas: Association Map', associationMap)
    // console.debug('OcdCanvas: Association Connectors', associationConnectors)

    return (
        <div className='ocd-designer-canvas ocd-background' 
            key='ocd-designer-canvas'
            onDrop={(e) => onDrop(e)}
            onDragLeave={(e) => onDragLeave()}
            onDragOver={(e) => onDragOver(e)}
            >
            <svg className='ocd-designer-canvas-svg'
                id='canvas_root_svg' 
                width={`max(${svgWidth}px, 100%)`} 
                height={`max(${svgHeight}px, 100%)`}
                data-gid='' 
                data-ocid=''
                onMouseDown={onSVGDragStart}
                onMouseMove={onSVGDrag}
                onMouseUp={onSVGDragEnd}
                onMouseLeave={onSVGDragEnd}
                onWheel={onWheel}
                onClick={onClick}
                    >
                    <defs>
                        <pattern id="small-grid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="gray" strokeWidth="0.5"></path></pattern>
                        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="url(#small-grid)"></rect><path d="M 80 0 L 0 0 0 80" fill="none" stroke="darkgray" strokeWidth="1"></path></pattern>
                    </defs>
                    {page.grid && <OcdCanvasGrid/>}
                    <g id='matrix-group' transform={`matrix(${transformMatrix.join(' ')})`}>
                        <g>
                            {visibleCoords.map((r: OcdViewCoords) => {
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
                        <g>
                        {parentConnectors.map((connector: OcdViewConnector) => {
                                return <OcdConnector
                                            ocdConsoleConfig={ocdConsoleConfig}
                                            ocdDocument={ocdDocument}
                                            connector={connector}
                                            parentConnector={true}
                                            key={`connector-${connector.startCoordsId}-${connector.endCoordsId}`}
                                />
                        })}
                        </g>
                        <g>
                        {associationConnectors.map((connector: OcdViewConnector) => {
                                return <OcdConnector
                                            ocdConsoleConfig={ocdConsoleConfig}
                                            ocdDocument={ocdDocument}
                                            connector={connector}
                                            parentConnector={false}
                                            key={`connector-${connector.startCoordsId}-${connector.endCoordsId}`}
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
                    </g>
                    {contextMenu.show && contextMenu.resource && <OcdSvgContextMenu 
                                            contextMenu={contextMenu} 
                                            ocdDocument={ocdDocument}
                                            setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                                            setContextMenu={setContextMenu}
                                            resource={contextMenu.resource}
                                            />}
            </svg>
        </div>
    )
}

export default OcdCanvas
