/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import OcdDocument from './OcdDocument'
import OcdResourceSvg from './OcdResourceSvg'
import { OcdViewCoords, OcdViewLayer, OcdViewPage } from '../model/OcdDesign'
import { OcdResource } from '../model/OcdResource'

export const OcdCanvas = ({ dragData, ocdDocument, setOcdDocument }: any): JSX.Element => {
    console.info('OCD Document:', ocdDocument)

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
        // Redraw
        console.info('Design:', ocdDocument)
        // const page: OcdViewPage = ocdDocument.getPage(viewPage.id)
        // setViewPage(structuredClone(page))
        setOcdDocument(OcdDocument.clone(ocdDocument))
        return false
    }

    // @ts-ignore 
    const uuid = () => `gid-${([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c =>(c^(((window.crypto||window.Crypto).getRandomValues(new Uint8Array(1))[0]&15)>>c/4)).toString(16))}`

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
                >
                    <g>
                        {page.coords && page.coords.filter((r: OcdViewCoords) => visibleResourceIds.includes(r.ocid)).map((r: OcdViewCoords) => {
                            return <OcdResourceSvg
                                        ocdDocument={ocdDocument}
                                        setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                                        resource={r}
                                        key={`${r.pgid}-${r.id}`}
                            />
                        })}
                    </g>
            </svg>
        </div>
    )
}

export default OcdCanvas
