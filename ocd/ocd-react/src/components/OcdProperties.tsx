/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useRef, useState } from 'react'
import { OcdViewCoordsStyle, OcdViewPage } from '../model/OcdDesign'
import { OcdResource } from '../model/OcdResource'
import { DesignerColourPicker, DesignerResourceProperties } from '../types/DesignerResourceProperties'
import { OcdUtils } from '../utils/OcdUtils'
import OcdDocument from './OcdDocument'
import { OcdLookupProperty, OcdTextProperty, ResourceElementConfig, ResourceProperties } from './properties/OcdPropertyTypes'
import * as ociResources from './properties/provider/oci/resources'
import { HexColorPicker, HexColorInput } from 'react-colorful'

const OcdResourcePropertiesHeader = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource = ocdDocument.getSelectedResource()
    const padlock: string = selectedResource ? selectedResource.locked ? 'padlock-closed' : 'padlock-open' : 'padlock-open'
    const title: string = selectedResource ? `${selectedResource.resourceTypeName} (${ocdDocument.getDisplayName(ocdDocument.selectedResource.modelId)})` : ''
    return (
        <div className='ocd-properties-header'>
            <div className={`property-editor-title ${ocdDocument.selectedResource.class}`}>
                <div className={`heading-background ${padlock}`}>{title}</div>
            </div>
        </div>
    )
}

const OciCommonResourceProperties = ({ocdDocument, setOcdDocument, resource}: ResourceProperties): JSX.Element => {
    const config: ResourceElementConfig | undefined = undefined
    const displayName = {"provider": "oci", "key": "displayName", "name": "displayName", "type": "string", "subtype": "", "required": true, "label": "Name", "id": "displayName"}
    const compartmentId = {"provider": "oci", "key": "compartmentId", "name": "compartmentId", "type": "string", "subtype": "", "required": true, "label": "Compartment", "id": "compartmentId", "lookupResource": "compartment"}
    return (
        <div>
            <details open={true}>
                <summary className='summary-background'>Core</summary>
                <div>
                <OcdTextProperty  ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={config} attribute={displayName} />
                <OcdLookupProperty  ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={config} attribute={compartmentId} />
                </div>
            </details>
        </div>
    )
}

const OcdResourceProperties = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource: OcdResource = ocdDocument.getSelectedResource()
    const resourceJSXMethod = selectedResource ? `${OcdUtils.toTitleCase(selectedResource.provider)}${selectedResource.resourceType}` : ''
    // @ts-ignore 
    const ResourceProperties = ociResources[resourceJSXMethod]
    // if (!ResourceProperties && selectedResource) {
    //     console.warn('Selected Resource', selectedResource)
    //     console.warn('Resource JMX Method', resourceJSXMethod)
    //     console.warn('Properties Resource', ResourceProperties)
    // }
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme`}>
            {selectedResource && selectedResource.provider === 'oci' && <OciCommonResourceProperties 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                resource={selectedResource}
            />}
            {selectedResource && ResourceProperties && <ResourceProperties 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                resource={selectedResource}
            />}
        </div>
    )
}

const OcdResourceDocumentation = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource = ocdDocument.getSelectedResource()
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        selectedResource.documentation = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-documentation-panel`}>
            <textarea onChange={onChange}></textarea>
        </div>
    )
}

const OcdResourceArrangement = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource = ocdDocument.selectedResource
    const page: OcdViewPage = ocdDocument.getActivePage()
    // console.info('Selected Resource', selectedResource)
    // @ts-ignore
    // const coords = ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === selectedResource.coordsId)
    const coords = ocdDocument.getCoords(selectedResource.coordsId)
    const width = coords ? coords.w : 0
    const height = coords ? coords.h : 0
    const left = coords ? coords.x : 0
    const top = coords ? coords.y : 0
    const container = coords ? coords.container : false
    const onWidthChange = (value: string) => {
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).w = parseInt(value)
        if (coords) {ocdDocument.updateCoords({...coords, w: parseInt(value)}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onHeightChange = (value: string) => {
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).h = parseInt(value)
        if (coords) {ocdDocument.updateCoords({...coords, h: parseInt(value)}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onLeftChange = (value: string) => {
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).x = parseInt(value)
        if (coords) {ocdDocument.updateCoords({...coords, x: parseInt(value)}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onTopChange = (value: string) => {
        // @ts-ignore 
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).y = parseInt(value)
        if (coords) {ocdDocument.updateCoords({...coords, y: parseInt(value)}, page.id)}
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
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-arrangement-panel`}>
            <div className={`ocd-arrangement-z-positioning`}>
                <div onClick={() => toFrontClick()}><span>To Front</span></div>
                <div onClick={() => toBackClick()}><span>To Back</span></div>
                <div onClick={() => bringForwardClick()}><span>Bring Forward</span></div>
                <div onClick={() => sendBackwardClick()}><span>Send Backward</span></div>
            </div>
            <div className={`ocd-arrangement-size ${!container ? 'hidden' : ''}`}>
                <div><span>Size</span></div>
                <div><input type={'number'} min={40} value={width} onChange={(e) => onWidthChange(e.target.value)}></input></div>
                <div><input type={'number'} min={40} value={height} onChange={(e) => onHeightChange(e.target.value)}></input></div>
                <div></div>
                <div><span>Width</span></div>
                <div><span>Height</span></div>
            </div>
            <div className={`ocd-arrangement-xy-positioning`}>
                <div><span>Position</span></div>
                <div><input type={'number'} min={0} value={left} onChange={(e) => onLeftChange(e.target.value)}></input></div>
                <div><input type={'number'} min={0} value={top} onChange={(e) => onTopChange(e.target.value)}></input></div>
                <div></div>
                <div><span>Left</span></div>
                <div><span>Top</span></div>
            </div>
        </div>
    )
}
const OcdResourceStyle = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource = ocdDocument.selectedResource
    console.debug('OcdProperties: Selected Resource', selectedResource)
    const page: OcdViewPage = ocdDocument.getActivePage()
    const coords = ocdDocument.getCoords(selectedResource.coordsId)
    const coordsStyle = (coords !== undefined && coords.style !== undefined ) ? coords.style : undefined
    const coordsFill = (coordsStyle !== undefined && coordsStyle.fill !== undefined) ? coordsStyle.fill : undefined
    // const fillChecked = (coords !== undefined && coords.style !== undefined && coords.style.fill !== undefined && coords.style.fill !== undefined) as boolean
    const fillChecked = (coordsFill !== undefined) as boolean
    const fill = coordsFill !== undefined ? coordsFill : '#aabbcc'

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
        console.debug('OcdProperties: Set Fill Colour', coords)
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-style-panel`}>
            <div className={`ocd-style-fill`}>
                <div><input id='resourceStyleFill' type='checkbox' onChange={fillCheckedChanged} checked={fillChecked}/><span>Fill</span></div>
                {fillChecked && <div><OcdColourPicker colour={fill} setColour={setFillColour} /></div>}
            </div>
            <div className={`ocd-style-stroke`}></div>
            <div className={`ocd-style-opacity`}></div>
        </div>
    )
}
const OcdLayerStyle = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const page: OcdViewPage = ocdDocument.getActivePage()
    const layer = ocdDocument.getActiveLayer(page.id)
    const layerStyle = (layer !== undefined && layer.style !== undefined) ? layer.style : undefined
    const layerFill = (layerStyle !== undefined && layerStyle.fill !== undefined) ? layerStyle.fill : undefined
    const fillChecked = (layerFill !== undefined) as boolean
    const fill = layerFill !== undefined ? layerFill : '#aabbcc'

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
        console.debug('OcdProperties: Set Fill Colour', layer)
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
            <div className={`ocd-style-stroke`}></div>
            <div className={`ocd-style-opacity`}></div>
        </div>
    )
}
const OcdColourPicker = ({colour, setColour}: DesignerColourPicker): JSX.Element => {
    console.debug('OcdProperties: Colour', colour)
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
                onClick={() => setPickerOpen(!pickerOpen)}
            ></div>
            {pickerOpen && <div className='ocd-colour-picker-popup'>
                <div><HexColorPicker color={colour} onChange={colourChanged} /></div>
                <div><HexColorInput color={colour} onChange={colourChanged} /></div>
            </div>}
        </div>
    )
}

const OcdProperties = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource = ocdDocument.selectedResource
    const [activeTab, setActivieTab] = useState('properties')
    const onPropertiesTabClick = (tab: string) => {
        setActivieTab(tab.toLowerCase())
    }
    const ActiveTab = activeTab === 'properties' ? OcdResourceProperties :
                      activeTab === 'documentation' ? OcdResourceDocumentation :
                      activeTab === 'arrange' ? OcdResourceArrangement :
                      activeTab === 'style' && selectedResource.coordsId !== '' ? OcdResourceStyle :
                      activeTab === 'style' ? OcdLayerStyle :
                      OcdResourceProperties
    return (
        <div className='ocd-designer-properties'>
            <div className={`ocd-designer-tab-bar ocd-designer-tab-bar-theme`}>
                <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'properties' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Properties')}><span>Properties</span></div>
                <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'documentation' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Documentation')}><span>Documentation</span></div>
                <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'style' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Style')}><span>Style</span></div>
                <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'arrange' ? 'ocd-designer-active-tab-theme' : ''} ${ocdDocument.selectedResource.coordsId === '' ? 'hidden' : ''}`} onClick={() => onPropertiesTabClick('Arrange')}><span>Arrange</span></div>
            </div>
            <OcdResourcePropertiesHeader
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} 
            />
            <ActiveTab
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} 
            />
        </div>
    )
}

export default OcdProperties