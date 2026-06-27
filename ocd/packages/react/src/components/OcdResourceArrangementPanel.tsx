/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useContext, useEffect, useState } from 'react'
import { OcdViewPage } from '@ocd/model'
import { DesignerResourceProperties } from '../types/DesignerResourceProperties'
import { OcdDocument } from './OcdDocument'
import { SelectedResourceContext } from '../pages/OcdConsole'
import { useTheme } from '../contexts/OcdThemeContext'

export const OcdResourceArrangement = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const theme = useTheme()
    const {selectedResource } = useContext(SelectedResourceContext)
    // const selectedResource = ocdDocument.selectedResource
    const page: OcdViewPage = ocdDocument.getActivePage()
    // console.info('Selected Resource', selectedResource)
    // @ts-ignore
    // const coords = ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === selectedResource.coordsId)
    const coords = ocdDocument.getCoords(selectedResource.coordsId)
    const [width, setWidth] = useState(coords ? coords.w : 0)
    const [height, setHeight] = useState(coords ? coords.h : 0)
    const [left, setLeft] = useState(coords ? coords.x : 0)
    const [top, setTop] = useState(coords ? coords.y : 0)
    const [container, setContainer] = useState(coords ? coords.container : false)
    useEffect(() => {
        setWidth(coords ? coords.w : 0)
        setHeight(coords ? coords.h : 0)
        setLeft(coords ? coords.x : 0)
        setTop(coords ? coords.y : 0)
        setContainer(coords ? coords.container : false)
    }, [selectedResource])
    const onWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).w = parseInt(value)
        const width = parseInt(e.currentTarget.value)
        setWidth(width)
        if (coords) {ocdDocument.updateCoords({...coords, w: width}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).h = parseInt(value)
        const height = parseInt(e.currentTarget.value)
        setHeight(height)
        if (coords) {ocdDocument.updateCoords({...coords, h: height}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).x = parseInt(value)
        const left = parseInt(e.currentTarget.value)
        setLeft(left)
        if (coords) {ocdDocument.updateCoords({...coords, x: left}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onTopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // @ts-ignore
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).y = parseInt(value)
        const top = parseInt(e.currentTarget.value)
        setTop(top)
        if (coords) {ocdDocument.updateCoords({...coords, y: top}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const toFrontClick = () => {
        if (coords) {ocdDocument.toFront(coords, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const toBackClick = () => {
        if (coords) {ocdDocument.toBack(coords, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const bringForwardClick = () => {
        if (coords) {ocdDocument.bringForward(coords, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const sendBackwardClick = () => {
        if (coords) {ocdDocument.sendBackward(coords, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const divClassNames = `ocd-properties-panel ocd-properties-arrangement-panel ocd-properties-panel-default-theme ocd-properties-panel-${theme}-theme` // Use CSS positional precedence to override
    return (
        <div className={divClassNames}>
            <div className={`ocd-arrangement-z-positioning`}>
                <div onClick={() => toFrontClick()} aria-hidden><span>To Front</span></div>
                <div onClick={() => toBackClick()} aria-hidden><span>To Back</span></div>
                <div onClick={() => bringForwardClick()} aria-hidden><span>Bring Forward</span></div>
                <div onClick={() => sendBackwardClick()} aria-hidden><span>Send Backward</span></div>
            </div>
            <div className={`ocd-arrangement-size ${!container ? 'hidden' : ''}`}>
                <div><span>Size</span></div>
                <div><input type={'number'} min={40} value={width} onChange={onWidthChange}></input></div>
                <div><input type={'number'} min={40} value={height} onChange={onHeightChange}></input></div>
                <div></div>
                <div><span>Width</span></div>
                <div><span>Height</span></div>
            </div>
            <div className={`ocd-arrangement-xy-positioning`}>
                <div><span>Position</span></div>
                <div><input type={'number'} min={0} value={left} onChange={onLeftChange}></input></div>
                <div><input type={'number'} min={0} value={top} onChange={onTopChange}></input></div>
                <div></div>
                <div><span>Left</span></div>
                <div><span>Top</span></div>
            </div>
        </div>
    )
}
