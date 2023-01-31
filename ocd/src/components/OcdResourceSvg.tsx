/* eslint-disable react/style-prop-object */
/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from 'react'
import OcdDocument from './OcdDocument'
import { OcdViewCoords } from '../model/OcdDesign'
import { ResourceRectProps, ResourceForeignObjectProps, ResourceSvgProps } from '../types/ReactComponentProperties'
import { OcdViewPage } from '../model/OcdDesign'

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
            <OcdResizePoint resource={resource} cx={width / 2} cy={height} position={'south'} setDimensions={setDimensions} onResizeEnd={onResizeEnd}/>
            {/* <OcdResizePoint resource={resource} cx={0} cy={height / 2} position={'east'} setDimensions={setDimensions} onResizeEnd={onResizeEnd}/> */}
            <OcdResizePoint resource={resource} cx={width} cy={height / 2} position={'west'}  setDimensions={setDimensions} onResizeEnd={onResizeEnd}/>
        </g>
    )
}

const OcdResizePoint = ({resource, cx, cy, position, setDimensions, onResizeEnd}: any): JSX.Element => {
    const [mouseOver, setMouseOver] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [origin, setOrigin] = useState({ x: 0, y: 0 });
    const radius = mouseOver ? 6 : 3
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
    )
}

const OcdForeignObject = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource }: ResourceForeignObjectProps) => {
    const id = `${resource.id}-fo`
    const backgroundColourClass = `${resource.class}-background-colour`
    const foreignObjectClass = `ocd-svg-foreign-object ${ocdConsoleConfig.config.detailedResource || resource.container ? 'ocd-svg-resource-detailed' : 'ocd-svg-resource-simple'}`
    const resourceType = resource.class.split('-').slice(1).reduce((a, c) => `${a}${c.charAt(0).toUpperCase()}${c.slice(1).toLowerCase()}`, '')
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        ocdDocument.setDisplayName(resource.ocid, e.target.value.trim())
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <foreignObject id={id} className={foreignObjectClass}>
            <div 
            // @ts-ignore 
            xmlns='http://www.w3.org/1999/xhtml'>
                <div className={backgroundColourClass}>
                    <div className={`${resource.class} ocd-svg-icon`}></div>
                </div>
                <div className='ocd-svg-foreign-object-display-name'>
                    <span>{resourceType}</span>
                    <input type='text' value={ocdDocument.getDisplayName(resource.ocid)} onChange={onChange}></input>
                </div>
            </div>
        </foreignObject>
    )
}

export const OcdResourceSvg = ({ ocdConsoleConfig, ocdDocument, setOcdDocument, resource }: ResourceSvgProps): JSX.Element => {
    const [dragging, setDragging] = useState(false)
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const [origin, setOrigin] = useState({ x: 0, y: 0 });
    const SvgRect = resource.container ? OcdContainerRect : OcdSimpleRect
    const gX = resource.x + coordinates.x
    const gY = resource.y + coordinates.y
    const onResourceDragStart = (e: any) => {
        e.stopPropagation()
        // Record Starting Point
        setOrigin({ x: e.clientX, y: e.clientY })
        setDragging(true)
    }
    const onResourceDrag = (e: any) => {
        e.stopPropagation()
        if (dragging) {
            // Set state for the change in coordinates.
            setCoordinates({
              x: e.clientX - origin.x,
              y: e.clientY - origin.y,
            })
        }
    }
    const onResourceDragEnd = (e: any) => {
        e.stopPropagation()
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
        // // Redraw
        console.info('Design:', ocdDocument)
        // setViewPage(structuredClone(ocdDocument.getPage(viewPage.id)))
        setOcdDocument(OcdDocument.clone(ocdDocument))
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
            onMouseMove={onResourceDrag}
            onMouseUp={onResourceDragEnd}
            onMouseLeave={onResourceDragEnd}
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
        </g>
    )
}

export default OcdResourceSvg
