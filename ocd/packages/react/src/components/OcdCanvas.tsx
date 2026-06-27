/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdAddResourceResponse, OcdDocument } from './OcdDocument'
import { OcdResourceSvg, OcdConnector, OcdDragResourceGhostSvg, OcdSvgContextMenu } from './OcdResourceSvg'
import { OcdResource, OcdViewConnector, OcdViewCoords, OcdViewLayer, OcdViewPage } from '@ocd/model'
import { CanvasProps, OcdMouseEvents } from '../types/ReactComponentProperties'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { newDragData } from '../types/DragData'
import { ActiveFileContext, SelectedResourceContext } from '../pages/OcdConsole'
import { OcdUtils } from '@ocd/core'
import { OcdDragResource, OcdSelectedResource } from '../types/Console'
import { isLzOriginDesign, resolveLzPlacement } from '../landingzone/OcdLzPlacement'
import { beginPortConnect, completePortConnect, connectResources, idlePortConnect, PortConnectState } from './OcdConnect'
import { OcdDisplayConnector, useArchitectureRelation } from './OcdCanvasRelations'

// Re-exported so existing consumers (and tests) can keep importing the relation
// helpers from OcdCanvas; the implementations now live in OcdCanvasRelations.
export {
    buildRelationOverlayConnectors,
    buildRelationInspectionRows,
    mergeConnectors,
    mergeConnectorLabels,
    addUniqueConnector,
    compactRelationConnectorLabel,
} from './OcdCanvasRelations'
export type {
    OcdRelationOverlayConnectors,
    OcdRelationOverlayConnector,
    OcdRelationInspectionRow,
    OcdDisplayConnector,
} from './OcdCanvasRelations'

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

/*
** Always-available drag-to-connect ("hover ports"). A resource exposes small
** edge handles on hover; pressing one starts a connect drag without toggling
** connect mode. OcdResourceSvg (the source/target renderer) needs to know a port
** connect is in progress (to show drop hints) and how to start one (the port's
** onMouseDown) — both flow through this context so no shared component-prop types
** have to change. `sourceModelId` is non-empty only while a port drag is active.
*/
export interface PortConnectApi {
    sourceModelId: string
    begin: (coords: OcdViewCoords, clientX: number, clientY: number) => void
}

export const PortConnectContext = createContext<PortConnectApi>({
    sourceModelId: '',
    begin: () => {},
})

export const calculateSvgWidth = (coords: OcdViewCoords[]): number => {
    const simpleWidth = 40
    const detailedWidth = 170
    let width = 0
    coords.forEach((c => width = Math.max(width, (c.x + (c.container && (!c.detailsStyle || c.detailsStyle === 'default') ? c.w : (!c.detailsStyle || c.detailsStyle === 'detailed') ? detailedWidth : simpleWidth)))))
    width += 100
    return width
}

export const calculateSvgHeight = (coords: OcdViewCoords[]): number => {
    const simpleHeight = 40
    let height = 0
    coords.forEach((c => height = Math.max(height, (c.y + (c.container && (!c.detailsStyle || c.detailsStyle === 'default') ? c.h : simpleHeight)))))
    height += 100
    return height
}

export const OcdCanvasGrid = (): JSX.Element => {
    return (
        <rect width="100%" height="100%" fill="url(#grid)"></rect>
    )
}

export const OcdCanvas = ({ dragData, setDragData, ocdConsoleConfig, ocdDocument, setOcdDocument }: CanvasProps): JSX.Element => {
    // console.info('OcdCanvas: OCD Document:', ocdDocument)
    const {setSelectedResource} = useContext(SelectedResourceContext)
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const uuid = () => `gid-${uuidv4()}`
    const page: OcdViewPage = ocdDocument.getActivePage()
    const architectureAgentState = ocdDocument.design.userDefined?.architectureAgent
    const isArchitectureAgentDesign = architectureAgentState?.generated === true
    const architectureRelationPresetKey = isArchitectureAgentDesign
        ? `${architectureAgentState?.planTitle ?? ocdDocument.design.metadata.title}:${architectureAgentState?.relationGraph?.nodes?.length ?? ocdDocument.getResources().length}`
        : ''
    const visibleLayers = useMemo(() => page.layers.filter((l: OcdViewLayer) => l.visible).map((l: OcdViewLayer) => l.id), [page.layers])
    const visibleResourceIds = useMemo(() => ocdDocument.getResources().filter((r: any) => visibleLayers.includes(r.compartmentId)).map((r: any) => r.id), [ocdDocument, visibleLayers])
    const updateOcdDocument = useCallback((ocdDocument: OcdDocument) => setOcdDocument(ocdDocument), [setOcdDocument])
    const [dragResource, setDragResource] = useState(OcdDocument.newDragResource(false))
    const [contextMenu, setContextMenu] = useState<OcdContextMenu>({show: false, x: 0, y: 0})
    const [dragging, setDragging] = useState(false)
    const [coordinates, setCoordinates] = useState<Point>({ x: 0, y: 0 });
    const [ghostTranslate, setGhostTranslate] = useState<Point>({ x: 0, y: 0 });
    const [origin, setOrigin] = useState<Point>({ x: 0, y: 0 });
    const [panOrigin, setPanOrigin] = useState<Point>({ x: 0, y: 0 });
    const transformMatrix = page.transform
    const [panning, setPanning] = useState(false)
    // Hover-port drag-to-connect (always available, no connect-mode toggle).
    // portConnect holds the logical state (active + source ids); portStart/portCursor
    // are the rubber-band endpoints in matrix-group (model) space.
    const [portConnect, setPortConnect] = useState<PortConnectState>(idlePortConnect())
    const [portStart, setPortStart] = useState<Point>({ x: 0, y: 0 })
    const [portCursor, setPortCursor] = useState<Point>({ x: 0, y: 0 })
    const [relationOverlayVisible, setRelationOverlayVisible] = useState(true)
    const [relationParentVisible, setRelationParentVisible] = useState(true)
    const [relationAssociationVisible, setRelationAssociationVisible] = useState(true)
    const [relationLabelsVisible, setRelationLabelsVisible] = useState(true)
    const [relationInspectorVisible, setRelationInspectorVisible] = useState(false)
    const appliedArchitectureRelationPresetKey = useRef('')
    useEffect(() => {
        if (!isArchitectureAgentDesign || !architectureRelationPresetKey || appliedArchitectureRelationPresetKey.current === architectureRelationPresetKey) return
        setRelationOverlayVisible(true)
        setRelationParentVisible(false)
        setRelationAssociationVisible(true)
        setRelationLabelsVisible(false)
        setRelationInspectorVisible(false)
        appliedArchitectureRelationPresetKey.current = architectureRelationPresetKey
    }, [architectureRelationPresetKey, isArchitectureAgentDesign])
    const resourceDragHandlerState = useRef({
        activeFile,
        contextMenuShow: contextMenu.show,
        coordinates,
        dragResource,
        dragging,
        ghostTranslate,
        ocdDocument,
        origin,
    })
    resourceDragHandlerState.current = {
        activeFile,
        contextMenuShow: contextMenu.show,
        coordinates,
        dragResource,
        dragging,
        ghostTranslate,
        ocdDocument,
        origin,
    }

    // Click Event to Reset Selected
    const onClick = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        const clickedResource: OcdSelectedResource = {
            modelId: '',
            pageId: ocdDocument.getActivePage().id,
            coordsId: '',
            class: '',
            page: ocdDocument.getActivePage(),
        }
        setSelectedResource(clickedResource)
        // TODO: Delete next 3 lines
        const clone = OcdDocument.clone(ocdDocument)
        clone.selectedResource = clickedResource
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
            // A5 LZ-origin placement: when the active design was produced by the
            // LZNG wizard, route the dropped stencil into the appropriate LZ
            // compartment (network / security / fallback-root) instead of always
            // inheriting the currently-selected canvas layer.  For non-LZ designs
            // the behaviour is identical to before (layer.id).
            const lzCompartments = ocdDocument.design.model.oci.resources.compartment ?? []
            const compartmentId: string = isLzOriginDesign(ocdDocument.design) && dragData.dragObject
                ? (resolveLzPlacement(
                      // Derive the OCD model type from the palette class (e.g. 'oci-vcn' -> 'vcn').
                      dragData.dragObject.class.replace(/^oci-/, '').replaceAll('-', '_'),
                      lzCompartments,
                  ) || layer.id)
                : layer.id
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
                const selectedResource = {
                    modelId: modelResource.id,
                    pageId: ocdDocument.getActivePage().id,
                    coordsId: coords.id,
                    class: dragData.dragObject.class
                }
                setSelectedResource(selectedResource)
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
            setOcdDocument(OcdDocument.clone(ocdDocument))
            if (!activeFile.modified) activeFile.modified = true
            // if (!activeFile.modified) setActiveFile({name: activeFile.name, modified: true})
        }
        return false
    }

    // Convert a screen (client) point into matrix-group (model) coordinates so the
    // port rubber-band lines up with resources regardless of pan/zoom. The
    // matrix-group CTM already folds in both the svg position and the page transform.
    const clientToModelPoint = (clientX: number, clientY: number): Point => {
        const group = document.getElementById('matrix-group') as unknown as SVGGraphicsElement | null
        const ctm = group ? group.getScreenCTM() : null
        if (!ctm) return { x: 0, y: 0 }
        // @ts-ignore DOMPoint is available in the browser runtime.
        const point = new DOMPoint(clientX, clientY)
        const { x, y } = point.matrixTransform(ctm.inverse())
        return { x, y }
    }
    // Start a port connect from a resource's hover handle. Records the source on
    // ocdDocument.dragResource (so target hover can stamp connectTarget and the
    // self-guard works) and seeds the rubber-band endpoints. Pure logic lives in
    // beginPortConnect (OcdConnect).
    const beginPortConnectHandler = useCallback((coords: OcdViewCoords, clientX: number, clientY: number) => {
        const rel = ocdDocument.getRelativeXY(coords)
        const center = { x: rel.x + (coords.w || 32) / 2, y: rel.y + (coords.h || 32) / 2 }
        const dragResource: OcdDragResource = OcdDocument.newDragResource(false)
        dragResource.modelId = coords.ocid
        dragResource.coordsId = coords.id
        dragResource.class = coords.class
        dragResource.resource = coords
        ocdDocument.dragResource = dragResource
        setPortConnect(beginPortConnect(coords))
        setPortStart(center)
        setPortCursor(clientToModelPoint(clientX, clientY))
    }, [ocdDocument])
    const portConnectApi: PortConnectApi = useMemo(() => ({
        sourceModelId: portConnect.active ? portConnect.sourceModelId : '',
        begin: beginPortConnectHandler,
    }), [portConnect.active, portConnect.sourceModelId, beginPortConnectHandler])

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
        if (portConnect.active) {
            // Port connect in progress: just track the cursor for the rubber-band.
            setPortCursor(clientToModelPoint(e.clientX, e.clientY))
            return
        }
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
        if (portConnect.active) {
            // Port connect release. The target resource (if any) stamped itself on
            // dragResource.connectTarget on its mouse-up; wire it via the shared
            // connect action. Release over empty space / invalid target cancels cleanly.
            const connectTarget = ocdDocument.dragResource.connectTarget
            const completion = completePortConnect(ocdDocument.design, portConnect, connectTarget?.ocid)
            ocdDocument.dragResource = OcdDocument.newDragResource()
            setPortConnect(idlePortConnect())
            setPortStart({ x: 0, y: 0 })
            setPortCursor({ x: 0, y: 0 })
            if (completion.connected) {
                ocdDocument.design = completion.design
                setOcdDocument(OcdDocument.clone(ocdDocument))
                if (!activeFile.modified) setActiveFile({ name: activeFile.name, modified: true })
            } else {
                // Nothing wired (no/invalid target) — redraw to clear the rubber-band.
                setOcdDocument(OcdDocument.clone(ocdDocument))
            }
            return
        }
        if (dragging) {
            console.info('OcdCanvas: SVG Drag End', ocdDocument.dragResource)
            const hasMoved = coordinates.x !== 0 || coordinates.y !== 0
            setDragging(false)
            // Drag-to-connect: when a connection target was recorded (connect mode),
            // wire the FK association instead of moving/re-parenting the resource.
            const connectTarget = ocdDocument.dragResource.connectTarget
            if (connectTarget) {
                const sourceId = ocdDocument.dragResource.resource.ocid
                const result = connectResources(ocdDocument.design, sourceId, connectTarget.ocid)
                ocdDocument.dragResource = OcdDocument.newDragResource()
                setCoordinates({ x: 0, y: 0 })
                setGhostTranslate({ x: 0, y: 0 })
                if (result.connected) {
                    ocdDocument.design = result.design
                    setOcdDocument(OcdDocument.clone(ocdDocument))
                    if (!activeFile.modified) setActiveFile({ name: activeFile.name, modified: true })
                } else {
                    // Nothing to wire (incompatible types / self) — just redraw to clear the drag.
                    setOcdDocument(OcdDocument.clone(ocdDocument))
                }
                return
            }
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
            ocdDocument.dragResource = OcdDocument.newDragResource()
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
    const svgDragStart = useCallback((e: React.MouseEvent<SVGElement>) => {
        console.debug('OcdCanvas: SVG Drag Start', e.currentTarget)
        e.preventDefault()
        e.stopPropagation()
        const currentDocument = resourceDragHandlerState.current.ocdDocument
        const coordsId = e.currentTarget.id
        const resource = currentDocument.getCoords(coordsId)
        if (resource) {
            const nextDragResource: OcdDragResource = OcdDocument.newDragResource(true)
            nextDragResource.modelId = resource.ocid
            nextDragResource.pageId = currentDocument.getActivePage().id
            nextDragResource.coordsId = resource.id
            nextDragResource.class = resource.class
            nextDragResource.resource = resource
            setDragResource(nextDragResource)
            const ghostXY = currentDocument.getRelativeXY(nextDragResource.resource)
            const nextOrigin = { x: e.clientX, y: e.clientY }
            const nextGhostTranslate = { x: ghostXY.x, y: ghostXY.y }
            resourceDragHandlerState.current = {
                ...resourceDragHandlerState.current,
                dragResource: nextDragResource,
                dragging: true,
                ghostTranslate: nextGhostTranslate,
                origin: nextOrigin,
            }
            // Record Starting Point
            setOrigin(nextOrigin)
            setGhostTranslate(nextGhostTranslate)
            setDragging(true)
        }
    }, [])
    const svgDrag = useCallback((e: React.MouseEvent<SVGElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const dragState = resourceDragHandlerState.current
        if (dragState.dragging) {
            console.info('OcdCanvas: SVG Drag')
            const ghostXY = dragState.ocdDocument.getRelativeXY(dragState.dragResource.resource)
            // Set state for the change in coordinates.
            const nextCoordinates = {
              x: e.clientX - dragState.origin.x,
              y: e.clientY - dragState.origin.y,
            }
            const nextGhostTranslate = {
              x: ghostXY.x + dragState.coordinates.x,
              y: ghostXY.y + dragState.coordinates.y,
            }
            resourceDragHandlerState.current = {
                ...dragState,
                coordinates: nextCoordinates,
                ghostTranslate: nextGhostTranslate,
            }
            setCoordinates(nextCoordinates)
            setGhostTranslate(nextGhostTranslate)
            console.info('OcdCanvas: SVG Drag', dragState.ghostTranslate)
        }
    }, [])
    const svgDrop = useCallback((e: React.MouseEvent<SVGElement>) => {
        console.debug('OcdCanvas: SVG Drop', e.currentTarget)
        e.preventDefault()
        e.stopPropagation()
        const dragState = resourceDragHandlerState.current
        const currentDocument = dragState.ocdDocument
        const currentDragResource = dragState.dragResource
        const dropTargetCoordsId = e.currentTarget.id
        const dropTargetResource = currentDocument.getCoords(dropTargetCoordsId)
        if (dragState.dragging) {
            currentDragResource.parent = dropTargetResource && dropTargetResource.container ? dropTargetResource : undefined
            console.info('OcdCanvas: SVG Drag End', currentDocument.dragResource)
            setDragging(false)
            // Test if container dropped on self
            if (currentDragResource.parent && currentDragResource.resource.id === currentDragResource.parent.id) {
                delete currentDragResource.parent
            }
            const page: OcdViewPage = currentDocument.getActivePage()
            const coords: OcdViewCoords = currentDocument.newCoords()
            const resource = currentDragResource.resource
            coords.id = resource.id
            coords.x = resource.x + dragState.coordinates.x
            coords.y = resource.y + dragState.coordinates.y
            coords.w = resource.w
            coords.h = resource.h
            if (currentDragResource.parent) {
                coords.pgid = currentDragResource.parent.id
                coords.pocid = currentDragResource.parent.ocid
                currentDocument.setResourceParent(currentDragResource.modelId, coords.pocid)
            } else if (dragState.contextMenuShow) {
                coords.pgid = resource.pgid
                coords.pocid = resource.pocid
            }
            const nextDragResource = OcdDocument.newDragResource()
            resourceDragHandlerState.current = {
                ...dragState,
                coordinates: { x: 0, y: 0 },
                dragResource: nextDragResource,
                dragging: false,
                ghostTranslate: { x: 0, y: 0 },
            }
            setCoordinates({ x: 0, y: 0 })
            setGhostTranslate({ x: 0, y: 0 })
            currentDocument.updateCoords(coords, page.id)
            setDragResource(nextDragResource)
            // Redraw
            setOcdDocument(OcdDocument.clone(currentDocument))
            if (!dragState.activeFile.modified) setActiveFile({name: dragState.activeFile.name, modified: true})
        }
    }, [setActiveFile, setOcdDocument])
    const svgDragDropEvents: OcdMouseEvents = useMemo(() => ({
        'onSVGDragStart': svgDragStart,
        'onSVGDrag': svgDrag,
        'onSVGDragEnd': svgDrop,
    }), [svgDragStart, svgDrag, svgDrop])

    const svgWidth = useMemo(() => calculateSvgWidth(page.coords), [page.coords])
    const svgHeight = useMemo(() => calculateSvgHeight(page.coords), [page.coords])

    const visibleCoords = page.coords
    const { parentConnectors, associationConnectors } = useMemo(() => {
        const allPageCoords = ocdDocument.getAllPageCoords(page)
        const allVisibleCoords = allPageCoords.filter((r: OcdViewCoords) => visibleResourceIds.includes(r.ocid))
        const parentMap = allVisibleCoords.filter(c => c.showParentConnection).map((r: OcdViewCoords) => {return {parentId: ocdDocument.getResourceParentId(r.ocid), childId: r.ocid, childCoordsId: r.id, pgid: r.pgid}})
        const parentConnectors = parentMap.reduce((a, c) => {return [...a, ...allVisibleCoords.filter(coords => coords.ocid === c.parentId).filter(p => p.id !== c.pgid).map(p => {return {startCoordsId: p.id, endCoordsId: c.childCoordsId}})]}, [] as OcdViewConnector[])
        const associationMap = allVisibleCoords.filter(c => c.showConnections).map((r: OcdViewCoords) => {return ocdDocument.getResourceAssociationIds(r.ocid).map(aId => {return {startCoordsId: r.id, associationId: aId}})}).reduce((a, c) => [...a, ...c], [])
        const associationConnectors = associationMap.reduce((a, c) => {return [...a, ...allVisibleCoords.filter(coords => coords.ocid === c.associationId).filter(p => p.pgid !== c.startCoordsId).map(p => {return {startCoordsId: c.startCoordsId, endCoordsId: p.id}})]}, [] as OcdViewConnector[])
        return { parentConnectors, associationConnectors }
    }, [ocdDocument, page, visibleResourceIds])
    const {
        relationGraph,
        relationInspectionRows,
        renderedParentConnectors,
        renderedAssociationConnectors,
        hiddenEdgeCount,
        visibleRelationCount,
        displayedRelationCount,
    } = useArchitectureRelation(
        ocdDocument,
        page,
        visibleResourceIds,
        parentConnectors,
        associationConnectors,
        { relationOverlayVisible, relationParentVisible, relationAssociationVisible },
    )
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
            {relationGraph.edges.length > 0 && (
                <div className='ocd-canvas-relation-toolbar' aria-label='Architecture relations'>
                    <label>
                        <input
                            checked={relationOverlayVisible}
                            onChange={(event) => setRelationOverlayVisible(event.currentTarget.checked)}
                            type='checkbox'
                        />
                        <span>Relations</span>
                    </label>
                    <label className='ocd-canvas-relation-option'>
                        <input
                            checked={relationParentVisible}
                            disabled={!relationOverlayVisible}
                            onChange={(event) => setRelationParentVisible(event.currentTarget.checked)}
                            type='checkbox'
                        />
                        <span>Parents</span>
                    </label>
                    <label className='ocd-canvas-relation-option'>
                        <input
                            checked={relationAssociationVisible}
                            disabled={!relationOverlayVisible}
                            onChange={(event) => setRelationAssociationVisible(event.currentTarget.checked)}
                            type='checkbox'
                        />
                        <span>Links</span>
                    </label>
                    <label className='ocd-canvas-relation-option'>
                        <input
                            checked={relationLabelsVisible}
                            disabled={!relationOverlayVisible}
                            onChange={(event) => setRelationLabelsVisible(event.currentTarget.checked)}
                            type='checkbox'
                        />
                        <span>Labels</span>
                    </label>
                    <span>{displayedRelationCount}/{visibleRelationCount} visible</span>
                    {hiddenEdgeCount > 0 && <span>{hiddenEdgeCount} off page</span>}
                    <button
                        className='ocd-canvas-relation-inspector-button'
                        onClick={() => setRelationInspectorVisible((visible) => !visible)}
                        type='button'
                    >
                        {relationInspectorVisible ? 'Hide details' : 'Details'}
                    </button>
                </div>
            )}
            {relationGraph.edges.length > 0 && relationInspectorVisible && (
                <aside className='ocd-canvas-relation-inspector' aria-label='Relation details'>
                    <div>
                        <strong>Relation Details</strong>
                        <button onClick={() => setRelationInspectorVisible(false)} type='button'>Close</button>
                    </div>
                    <ul>
                        {relationInspectionRows.map((row) => (
                            <li className={row.visible ? 'visible' : 'hidden'} key={row.id}>
                                <span>{row.kind === 'parent' ? 'Parent' : 'Link'}</span>
                                <strong>{row.sourceName}</strong>
                                <em>{row.label}</em>
                                <small>{row.visible ? 'visible on page' : 'off page or hidden layer'} -&gt; {row.targetName}</small>
                            </li>
                        ))}
                    </ul>
                </aside>
            )}
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
                    <PortConnectContext.Provider value={portConnectApi}>
                    <g id='matrix-group' transform={`matrix(${transformMatrix.join(' ')})`}>
                        <g>
                            {visibleCoords.map((r: OcdViewCoords) => {
                                return <OcdResourceSvg
                                            ocdConsoleConfig={ocdConsoleConfig}
                                            ocdDocument={ocdDocument}
                                            setOcdDocument={updateOcdDocument}
                                            contextMenu={contextMenu}
                                            setContextMenu={setContextMenu}
                                            svgDragDropEvents={svgDragDropEvents}
                                            resource={r}
                                            key={`${r.pgid}-${r.id}`}
                                />
                            })}
                        </g>
                        <g>
                        {renderedParentConnectors.map((connector: OcdDisplayConnector) => {
                                return <OcdConnector
                                            ocdConsoleConfig={ocdConsoleConfig}
                                            ocdDocument={ocdDocument}
                                            connector={connector}
                                            parentConnector={true}
                                            label={relationLabelsVisible ? connector.label : undefined}
                                            labelOffsetY={-8}
                                            key={`connector-${connector.startCoordsId}-${connector.endCoordsId}`}
                                />
                        })}
                        </g>
                        <g>
                        {renderedAssociationConnectors.map((connector: OcdDisplayConnector) => {
                                return <OcdConnector
                                            ocdConsoleConfig={ocdConsoleConfig}
                                            ocdDocument={ocdDocument}
                                            connector={connector}
                                            parentConnector={false}
                                            label={relationLabelsVisible ? connector.label : undefined}
                                            labelOffsetY={12}
                                            key={`connector-${connector.startCoordsId}-${connector.endCoordsId}`}
                                />
                        })}
                        </g>
                        {ocdConsoleConfig.config.connectMode && dragging && (() => {
                            const src = ocdDocument.getRelativeXY(ocdDocument.dragResource.resource)
                            const r = ocdDocument.dragResource.resource
                            const hw = (r.w || 32) / 2
                            const hh = (r.h || 32) / 2
                            return <line className='ocd-connect-rubber-band'
                                x1={src.x + hw} y1={src.y + hh}
                                x2={ghostTranslate.x + hw} y2={ghostTranslate.y + hh} />
                        })()}
                        {/* Hover-port connect rubber-band (always-available path). */}
                        {portConnect.active && (
                            <line className='ocd-connect-rubber-band'
                                x1={portStart.x} y1={portStart.y}
                                x2={portCursor.x} y2={portCursor.y} />
                        )}
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
                    </PortConnectContext.Provider>
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
