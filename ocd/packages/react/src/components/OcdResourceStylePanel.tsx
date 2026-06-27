/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from 'react'
import { OcdViewCoordsStyle, OcdViewPage } from '@ocd/model'
import { DesignerColourPicker, DesignerResourceProperties } from '../types/DesignerResourceProperties'
import { OcdDocument } from './OcdDocument'
import { RgbaStringColorPicker } from 'react-colorful'
import { useTheme } from '../contexts/OcdThemeContext'

export const OcdResourceStyle = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const theme = useTheme()
    const selectedResource = ocdDocument.selectedResource
    console.debug('OcdProperties: Selected Resource', selectedResource)
    const page: OcdViewPage = ocdDocument.getActivePage()
    const coords = ocdDocument.getCoords(selectedResource.coordsId)
    const coordsStyle = (coords !== undefined && coords.style !== undefined ) ? coords.style : undefined
    // style.fill
    const coordsFill = (coordsStyle !== undefined && coordsStyle.fill !== undefined) ? coordsStyle.fill : undefined
    const fillChecked = (coordsFill !== undefined) as boolean
    const fill = coordsFill !== undefined ? coordsFill : 'rgba(170, 187, 204, 0.5)' //'#aabbcc'
    // style.stroke
    const coordsStroke = (coordsStyle !== undefined && coordsStyle.stroke !== undefined) ? coordsStyle.stroke : undefined
    const strokeChecked = (coordsStroke !== undefined) as boolean
    const stroke = coordsStroke !== undefined ? coordsStroke : 'rgba(170, 187, 204, 1)' //'#aabbcc'
    // style.strokeDasharray
    const coordsStrokeDasharray = (coordsStyle !== undefined && coordsStyle.strokeDasharray !== undefined) ? coordsStyle.strokeDasharray : undefined
    const strokeDasharray = coordsStrokeDasharray !== undefined ? coordsStrokeDasharray : 'default'
    // style.strokeWidth
    const coordsStrokeWidth = (coordsStyle !== undefined && coordsStyle.strokeWidth !== undefined) ? coordsStyle.strokeWidth : undefined
    const strokeWidth = coordsStrokeWidth !== undefined ? coordsStrokeWidth : 'default'

    const fillCheckedChanged = () => {
        console.debug('OcdProperties: fillCheckedChanged', fillChecked, coords)
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        // Need to not fill because it is currently the previous state
        if (!fillChecked) {
            // Fill Specified
            style.fill = fill
        } else {
            delete style.fill
        }
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const setFillColour = (colour: string) => {
        // const style = coords !== undefined && coords.style !== undefined ? JSON.parse(JSON.stringify(coords.style)) : {} as OcdViewCoordsStyle
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        style.fill = colour
        console.debug('OcdProperties: Colour - Fill', coords)
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const strokeCheckedChanged = () => {
        console.debug('OcdProperties: strokeCheckedChanged', strokeChecked, coords)
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        // Need to not stroke because it is currently the previous state
        if (!strokeChecked) {
            // Fill Specified
            style.stroke = stroke
        } else {
            delete style.stroke
            delete style.strokeDasharray
            delete style.strokeWidth
            delete style.strokeOpacity
        }
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const setStrokeColour = (colour: string) => {
        // const style = coords !== undefined && coords.style !== undefined ? JSON.parse(JSON.stringify(coords.style)) : {} as OcdViewCoordsStyle
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        style.stroke = colour
        console.debug('OcdProperties: Colour - Stroke', coords)
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onStrokeDashArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        if (e.currentTarget.value === 'default') {
            delete style.strokeDasharray
        } else {
            style.strokeDasharray = e.currentTarget.value
        }
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onStrokeWidthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        if (e.currentTarget.value === 'default') {
            delete style.strokeWidth
        } else {
            style.strokeWidth = e.currentTarget.value
        }
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const divClassNames = `ocd-properties-panel ocd-properties-style-panel ocd-properties-panel-default-theme ocd-properties-panel-${theme}-theme` // Use CSS positional precedence to override
    return (
        <div className={divClassNames}>
            <div className={`ocd-style-fill`}>
                <div><input id='resourceStyleFill' type='checkbox' onChange={fillCheckedChanged} checked={fillChecked}/><span>Fill</span></div>
                {fillChecked && <div><OcdColourPicker colour={fill} setColour={setFillColour} /></div>}
                {!fillChecked && <div></div>}
            </div>
            <div className={`ocd-style-stroke`}>
                <div>
                    <input id='resourceStyleStroke' type='checkbox' onChange={strokeCheckedChanged} checked={strokeChecked}/><span>Line</span>
                </div>
                {strokeChecked && <div><OcdColourPicker colour={stroke} setColour={setStrokeColour} /></div>}
                {!strokeChecked && <div></div>}
                {strokeChecked && <div>
                    <div className='ocd-radio-buttons-vertical ocd-stroke-dasharray-radio'>
                        <label className='ocd-style-stroke-dasharray'><input type='radio' name='stroke-dasharray' value='default' checked={strokeDasharray === 'default'} onChange={onStrokeDashArrayChange}></input>Default Line</label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-none'><input type='radio' name='stroke-dasharray' value='none' checked={strokeDasharray === 'none'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-3-2'><input type='radio' name='stroke-dasharray' value='3,2' checked={strokeDasharray === '3,2'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-3-2-1'><input type='radio' name='stroke-dasharray' value='3,2,1' checked={strokeDasharray === '3,2,1'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-3-1-2-1'><input type='radio' name='stroke-dasharray' value='3,1,2,1' checked={strokeDasharray === '3,1,2,1'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-3-3'><input type='radio' name='stroke-dasharray' value='3,3' checked={strokeDasharray === '3,3'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-2-2'><input type='radio' name='stroke-dasharray' value='2,2' checked={strokeDasharray === '2,2'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-1-1'><input type='radio' name='stroke-dasharray' value='1,1' checked={strokeDasharray === '1,1'} onChange={onStrokeDashArrayChange}></input></label>
                    </div>
                </div>}
                {strokeChecked && <div className='ocd-style-stroke-width'>
                    <select value={strokeWidth} onChange={onStrokeWidthChange}>
                        <option value={'default'}>Default Width</option>
                        <option value={'1'}>1pt</option>
                        <option value={'2'}>2pt</option>
                        <option value={'3'}>3pt</option>
                        <option value={'4'}>4pt</option>
                        <option value={'5'}>5pt</option>
                        <option value={'6'}>6pt</option>
                    </select>
                </div>}
            </div>
            <div className={`ocd-style-opacity`}></div>
        </div>
    )
}

export const OcdLayerStyle = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const page: OcdViewPage = ocdDocument.getActivePage()
    const layer = ocdDocument.getActiveLayer(page.id)
    const layerStyle = (layer !== undefined && layer.style !== undefined) ? layer.style : undefined
    const layerFill = (layerStyle !== undefined && layerStyle.fill !== undefined) ? layerStyle.fill : undefined
    const fillChecked = (layerFill !== undefined) as boolean
    const fill = layerFill !== undefined ? layerFill : 'rgba(170, 187, 204, 1)' //'#aabbcc'

    const fillCheckedChanged = () => {
        console.debug('OcdProperties: fillCheckedChanged', fillChecked, layer)
        const style = layerStyle !== undefined ? JSON.parse(JSON.stringify(layerStyle)) : {} as OcdViewCoordsStyle
        // Need to not fill because it is currently the previous state
        if (!fillChecked) {
            // Fill Specified
            style.fill = fill
        } else {
            delete style.fill
        }
        ocdDocument.updateLayerStyle(layer.id, style)
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const setFillColour = (colour: string) => {
        const style = layerStyle !== undefined ? JSON.parse(JSON.stringify(layerStyle)) : {} as OcdViewCoordsStyle
        style.fill = colour
        console.debug('OcdProperties: Colour - Layer', layer)
        ocdDocument.updateLayerStyle(layer.id, style)
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-style-panel`}>
            <div className={`ocd-style-fill`}>
                <div><input id='resourceStyleFill' type='checkbox' onChange={fillCheckedChanged} checked={fillChecked}/><span>Fill</span></div>
                {fillChecked && <div><OcdColourPicker colour={fill} setColour={setFillColour} /></div>}
            </div>
            {/* <div className={`ocd-style-stroke`}></div>
            <div className={`ocd-style-opacity`}></div> */}
        </div>
    )
}

const OcdColourPicker = ({colour, setColour}: DesignerColourPicker): JSX.Element => {
    console.debug('OcdProperties: Colour', colour)
    // const [rgbaColor, setRgbaColor] = useState({ r: 200, g: 150, b: 35, a: 0.5 })
    const [pickerOpen, setPickerOpen] = useState(false)
    const colourChanged = (colour: string) => {
        console.debug('OcdProperties: Colour Changed', colour)
        setColour(colour)
    }
    return (
        <div className='ocd-colour-picker'
            onMouseLeave={() => setPickerOpen(false)}>
            <div className='ocd-colour-picker-swatch'
                style={{ backgroundColor: colour }}
                onClick={() => setPickerOpen(!pickerOpen)} aria-hidden
            ></div>
            {pickerOpen && <div className='ocd-colour-picker-popup'>
                {/* <div><RgbaColorPicker color={rgbaColor} onChange={setRgbaColor} /></div> */}
                <div><RgbaStringColorPicker color={colour} onChange={colourChanged} /></div>
                {/* <div><HexColorPicker color={colour} onChange={colourChanged} /></div> */}
                {/* <div><HexColorInput color={colour} onChange={colourChanged} /></div> */}
            </div>}
        </div>
    )
}
