/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import OcdDocument from './OcdDocument'
import OcdResourceSvg, { OcdDragResourceGhostSvg } from './OcdResourceSvg'
import { OcdViewCoords, OcdViewLayer, OcdViewPage } from '../model/OcdDesign'
import { OcdResource } from '../model/OcdResource'
import { CanvasProps } from '../types/ReactComponentProperties'
import { useState } from 'react'

export const OcdCanvas = ({ dragData, ocdConsoleConfig, ocdDocument, setOcdDocument }: CanvasProps): JSX.Element => {
    console.info('OcdCanvas: OCD Document:', ocdDocument)
    const [dragging, setDragging] = useState(false)
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const [ghostTranslate, setGhostTranslate] = useState({ x: 0, y: 0 });
    const [origin, setOrigin] = useState({ x: 0, y: 0 });
    const resource = ocdDocument.dragResource.resource
    // const gX = ocdDocument.dragResource.resource.x + coordinates.x
    // const gY = ocdDocument.dragResource.resource.y + coordinates.y

    const onDragOver = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
    }

    const onDragLeave = () => {
    }

    const onDrop = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        const dropTarget = e.currentTarget as HTMLElement
        console.info('Event:', e)
        console.info('Target:', e.target)
        console.info('Target:', e.currentTarget)
        console.info('Target Attributes:', dropTarget.getAttributeNames())
        // console.info('Target Attributes:', e.target.attributes)
        // Get Page
        const page: OcdViewPage = ocdDocument.getActivePage()
        const layer: OcdViewLayer = ocdDocument.getActiveLayer(page.id)
        const compartmentId: string = layer.id

        // const pocid = e.target.attributes.ocid ? e.target.attributes.ocid.value : ''
        // const pgid = e.target.attributes.gid ? e.target.attributes.gid.value : ''
        const pocid: string = dropTarget.getAttribute('ocid') ? String(dropTarget.getAttribute('ocid')) : ''
        const pgid: string = dropTarget.getAttribute('gid') ? String(dropTarget.getAttribute('gid')) : ''
        const container = dragData.dragObject.container
        // Get drop Coordinates
        const svg = document.getElementById('canvas_root_svg')
        // @ts-ignore 
        const point = new DOMPoint(e.clientX - dragData.offset.x, e.clientY - dragData.offset.y)
        console.info('Drop Point', point)
        // @ts-ignore 
        const { x, y } =  point.matrixTransform(svg.getScreenCTM().inverse())
        console.info('x:', x, 'y:', y)
        // Add to OCD Model/View
        const modelResource: OcdResource = dragData.existingResource ? dragData.resource : ocdDocument.addResource(dragData.dragObject, compartmentId)
        const coords: OcdViewCoords = {
            id: uuid(),
            pgid: pgid,
            ocid: modelResource.id,
            pocid: pocid,
            x: x,
            y: y,
            w: dragData.dragObject.container ? 200 : 32,
            h: dragData.dragObject.container ? 200 : 32,
            title: dragData.dragObject.title,
            class: dragData.dragObject.class,
            container: container
        }
        ocdDocument.addCoords(coords, page.id)
        // Set as selected
        ocdDocument.selectedResource = {
            modelId: modelResource.id,
            pageId: ocdDocument.getActivePage().id,
            coordsId: coords.id,
            class: dragData.dragObject.class
        }
        // Redraw
        console.info('Design:', ocdDocument)
        // const page: OcdViewPage = ocdDocument.getPage(viewPage.id)
        // setViewPage(structuredClone(page))
        setOcdDocument(OcdDocument.clone(ocdDocument))
        return false
    }

    const onSVGDragStart = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        console.info('SVG Drag Start', ocdDocument.dragResource)
        if (ocdDocument.dragResource.dragging) {
            console.info('SVG Drag Start - Dragging')
            // Record Starting Point
            setOrigin({ x: e.clientX, y: e.clientY })
            setGhostTranslate({x: ocdDocument.dragResource.resource.x, y: ocdDocument.dragResource.resource.y})
            setDragging(true)
        }
    }
    const onSVGDrag = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        if (dragging) {
            console.info('SVG Drag')
            // Set state for the change in coordinates.
            setCoordinates({
              x: e.clientX - origin.x,
              y: e.clientY - origin.y,
            })
            setGhostTranslate({
              x: ocdDocument.dragResource.resource.x + coordinates.x,
              y: ocdDocument.dragResource.resource.y + coordinates.y,
            })
            // setGhostTranslate({
            //   x: e.clientX - origin.x,
            //   y: e.clientY - origin.y,
            // })
        }
    }
    const onSVGDragEnd = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        if (dragging) {
            console.info('SVG Drag End')
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
            setGhostTranslate({ x: 0, y: 0 })
            ocdDocument.updateCoords(coords, page.id)
            // Redraw
            console.info('Design:', ocdDocument)
            // setViewPage(structuredClone(ocdDocument.getPage(viewPage.id)))
            setOcdDocument(OcdDocument.clone(ocdDocument))
        }
    }

    const uuid = () => `gid-${uuidv4()}`

    const page: OcdViewPage = ocdDocument.getActivePage()
    const layers = page.layers.filter((l: OcdViewLayer) => l.visible).map((l: OcdViewLayer) => l.id)
    const visibleResourceIds = ocdDocument.getResources().filter((r: any) => layers.includes(r.compartmentId)).map((r: any) => r.id)

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
        </div>
    )
}

export default OcdCanvas
