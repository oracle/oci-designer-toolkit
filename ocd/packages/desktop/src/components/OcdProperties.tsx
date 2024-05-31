/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useContext, useMemo, useRef, useState } from 'react'
import { OcdResource, OcdVariable, OcdViewCoordsStyle, OcdViewPage, OciResourceValidation, OciResources } from '@ocd/model'
import { DesignerColourPicker, DesignerResourceProperties, DesignerResourceValidationResult } from '../types/DesignerResourceProperties'
import { OcdUtils } from '@ocd/core'
import { OcdDocument } from './OcdDocument'
import { OcdDisplayNameProperty, OcdLookupProperty, OcdTextProperty, ResourceElementConfig, ResourceProperties } from './properties/OcdPropertyTypes'
import * as ociResources from './properties/provider/oci/resources'
import { HexColorPicker, HexColorInput, RgbaColorPicker, RgbaStringColorPicker } from 'react-colorful'
import Markdown from 'react-markdown'
import { OcdValidationResult } from '@ocd/model'
import { CacheContext } from '../pages/OcdConsole'

const OcdPropertiesTabbar = ({modelId, coordsId, activeTab, setActiveTab, additionalCss}:{modelId: string, coordsId: string, activeTab: string, setActiveTab: (title: string) => void, additionalCss: Record<string, string>}): JSX.Element => {
    console.debug('OcdPropertiesTabbar: Render', activeTab)
    const [active, setActive] = useState(activeTab)
    const tabs: string[] = useMemo(() => {
        const tabs = [
            ...modelId && modelId !== '' ? ['Properties'] : [],
            'Documentation',
            ...modelId && modelId !== '' ? ['Style'] : [],
            ...coordsId && coordsId !== '' ? ['Arrange'] : [],
            ...modelId && modelId !== '' ? ['Validation'] : [],
        ]
        console.debug('OcdPropertiesTabbar: Available Tabs:', tabs)
        return tabs
    }, [modelId, coordsId])
    const tabClicked = (title: string) => {
        console.debug('OcdPropertiesTabbar: Tab Clicked', title)
        setActive(title.toLocaleLowerCase())
        setActiveTab(title)
    }
    return (
        <div className={`ocd-designer-tab-bar ocd-designer-tab-bar-theme`}>
            {tabs.map((tab) => <OcdPropertiesTabbarTab title={tab} active={active === tab.toLocaleLowerCase()} setActive={tabClicked} additionalCss={additionalCss[tab.toLocaleLowerCase()]} key={tab}/>)}
            {/* {ocdDocument.selectedResource.modelId !== '' && <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'properties' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Properties')}><span>Properties</span></div>}
            <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'documentation' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Documentation')}><span>Documentation</span></div>
            {ocdDocument.selectedResource.modelId !== '' && <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'style' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Style')}><span>Style</span></div>}
            {ocdDocument.selectedResource.coordsId !== '' && <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'arrange' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Arrange')}><span>Arrange</span></div>}
            {ocdDocument.selectedResource.modelId !== '' && <div className={`ocd-designer-tab ocd-designer-tab-theme ${validationTabClass} ${activeTab === 'validation' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Validation')}><span>Validation</span></div>} */}
        </div>
    )
}

const OcdPropertiesTabbarTab = ({title, active, setActive, additionalCss}: {title: string, active: boolean, setActive: (title: string) => void, additionalCss: string}): JSX.Element => {
    console.debug('OcdPropertiesTabbarTab: Render', title, active ? '- Active' : '')
    return(
        <div className={`ocd-designer-tab ocd-designer-tab-theme ${active ? 'ocd-designer-active-tab-theme' : ''} ${additionalCss ? additionalCss : ''}`} onClick={() => setActive(title.toLowerCase())}><span>{title}</span></div>
    )
}

const OcdResourcePropertiesHeader = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource = ocdDocument.getSelectedResource()
    const activePage = ocdDocument.getActivePage()
    const padlock: string = selectedResource ? selectedResource.locked ? 'padlock-closed' : 'padlock-open' : 'padlock-open'
    const title: string = selectedResource ? `${selectedResource.resourceTypeName} (${ocdDocument.getDisplayName(ocdDocument.selectedResource.modelId)})` : `Page (${activePage.title})`
    return (
        <div className='ocd-properties-header'>
            <div className={`property-editor-title ${ocdDocument.selectedResource.class}`}>
                <div className={`heading-background ${padlock}`}>{title}</div>
            </div>
        </div>
    )
}

const OciCommonResourceProperties = ({ocdDocument, setOcdDocument, resource, rootResource}: ResourceProperties): JSX.Element => {
    const selectedResource: OcdResource = ocdDocument.getSelectedResource()
    const resourceConfigsName = selectedResource ? `${OcdUtils.toTitleCase(selectedResource.provider)}${selectedResource.resourceType}Configs` : ''
    // @ts-ignore 
    const resourceConfigs = ociResources[resourceConfigsName]
    const configs: ResourceElementConfig[] = resourceConfigs.configs()
    console.debug('OcdProperties: OciCommonResourceProperties: config', configs)
    const displayName = {"provider": "oci", "key": "displayName", "name": "displayName", "type": "string", "subtype": "", "required": true, "label": "Name", "id": "displayName", "conditional": false, "condition": {}}
    const compartmentId = {"provider": "oci", "key": "compartmentId", "name": "compartmentId", "type": "string", "subtype": "", "required": true, "label": "Compartment", "id": "compartmentId", "lookupResource": "compartment", "conditional": false, "condition": {}}
    return (
        <div>
            <details open={true}>
                <summary className='summary-background'>Core</summary>
                <div>
                <OcdDisplayNameProperty  ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={configs.find((c) => c.id === 'display_name')} rootResource={rootResource} attribute={displayName} key={`${resource.id}-displayName`}/>
                {/* <OcdTextProperty  ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={configs.find((c) => c.id === 'display_name')} rootResource={rootResource} attribute={displayName} key={`${resource.id}-displayName`}/> */}
                {/* <OcdTextProperty  ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={configs.find((c) => c.id === 'display_name')} rootResource={rootResource} attribute={displayName}/> */}
                <OcdLookupProperty  ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={configs.find((c) => c.id === 'compartment_id')} rootResource={rootResource} attribute={compartmentId}  key={`${resource.id}-compartmentId`}/>
                </div>
            </details>
        </div>
    )
}

const OcdDataListOption = ({value}: {value: string}): JSX.Element => {
    return (<option value={value}/>)
}

const OcdPropertiesDataList = ({variables}: {variables: OcdVariable[]}): JSX.Element => {
    return (<datalist id='variables' key={`VariablesDataList`}>{variables.map((v) => <OcdDataListOption value={`var.${v.name}`} key={v.key}/>)}</datalist>)
}

const OcdResourceProperties = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    // @ts-ignore
    const {ocdCache, setOcdCache} = useContext(CacheContext)
    // console.debug('OcdProperties: OcdResourceProperties: OCD Cache:', ocdCache)
    const selectedResource: OcdResource = ocdDocument.getSelectedResource()
    // const resourceProxyName = useMemo(() => selectedResource ? `${OcdUtils.toTitleCase(selectedResource.provider)}${selectedResource.resourceType}Proxy` : '', [selectedResource])
    const selectedResourceProxy: OcdResource = useMemo(() => {
        const resourceProxyName = selectedResource ? `${OcdUtils.toTitleCase(selectedResource.provider)}${selectedResource.resourceType}Proxy` : ''
        console.debug(`> OcdProperies: OcdResourceProperties: Render(Proxy(${resourceProxyName}))`, selectedResource)
        // @ts-ignore 
        return Object.hasOwn(ociResources, resourceProxyName) ? ociResources[resourceProxyName].proxyResource(ocdDocument, selectedResource, ocdCache) : selectedResource
    }, [selectedResource])
    // const resourceJSXMethod = selectedResource ? `${OcdUtils.toTitleCase(selectedResource.provider)}${selectedResource.resourceType}` : ''
    const ResourceProperties = useMemo(() => {
        const resourceJSXMethod = selectedResource ? `${OcdUtils.toTitleCase(selectedResource.provider)}${selectedResource.resourceType}` : ''
        console.debug(`> OcdProperies: OcdResourceProperties: Render(JMX(${resourceJSXMethod}))`)
        // @ts-ignore 
        return ociResources[resourceJSXMethod]
    }, [selectedResource])
    const variables = selectedResource && selectedResource.provider === 'oci' ? ocdDocument.getOciVariables() : []
    const modelId = selectedResource ? selectedResource.id : ''
    // Memos
    const variablesDatalist = useMemo(() => <OcdPropertiesDataList variables={variables}/>, [variables])
    const commonProperties = useMemo(() => <OciCommonResourceProperties ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={selectedResourceProxy} rootResource={selectedResourceProxy} key={`${selectedResourceProxy ? selectedResourceProxy.id : ''}.CommonProperties`}/>, [modelId])
    const resourceProperties = useMemo(() => <ResourceProperties ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={selectedResourceProxy} key={`${selectedResourceProxy ? selectedResourceProxy.id : ''}.Properties`}/>, [modelId])
    console.debug(`>>> OcdProperies: OcdResourceProperties: Render()`)
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme`}>
            {selectedResource && selectedResourceProxy && variablesDatalist}
            {selectedResource && selectedResource.provider === 'oci' && commonProperties} 
            {selectedResource && ResourceProperties && resourceProperties} 
            {/* {selectedResource && selectedResource.provider === 'oci' && <OciCommonResourceProperties 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                resource={selectedResourceProxy}
                rootResource={selectedResourceProxy}
                key={`${selectedResourceProxy.id}.CommonProperties`}
            />}
            {selectedResource && ResourceProperties && <ResourceProperties 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                resource={selectedResourceProxy}
                key={`${selectedResourceProxy.id}.Properties`}
            />} */}
        </div>
    )
}

const OcdResourceDocumentation = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const [preview, setPreview] = useState(false)
    const selectedResource = ocdDocument.getSelectedResource()
    const activePage = ocdDocument.getActivePage()
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (selectedResource) selectedResource.documentation = e.target.value
        else activePage.documentation = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onPreviewChanged = () => setPreview(!preview)
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-documentation-panel`}>
            <div className='ocd-properties-documentation-preview-bar'><input id='documentation_preview_checkbox' type='checkbox' checked={preview} onChange={onPreviewChanged}></input><label htmlFor='documentation_preview_checkbox'>Preview</label></div>
            {!preview && <textarea id='ocd_resource_documentation' onChange={onChange} value={selectedResource ? selectedResource.documentation : activePage.documentation}></textarea>}
            {preview && <div className='ocd-properties-documentation-preview'><Markdown>{selectedResource ? selectedResource.documentation : activePage.documentation}</Markdown></div>}
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
    const [width, setWidth] = useState(coords ? coords.w : 0)
    const [height, setHeight] = useState(coords ? coords.h : 0)
    const [left, setLeft] = useState(coords ? coords.x : 0)
    const [top, setTop] = useState(coords ? coords.y : 0)
    const [container, setContainer] = useState(coords ? coords.container : false)
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
const OcdResourceStyle = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
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
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-style-panel`}>
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
const OcdLayerStyle = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
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
            <div className={`ocd-style-stroke`}></div>
            <div className={`ocd-style-opacity`}></div>
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
                onClick={() => setPickerOpen(!pickerOpen)}
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

const OcdResourceValidation =  ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource: OcdResource = ocdDocument.getSelectedResource()
    const ociResources: OciResources = ocdDocument.getOciResourcesObject()
    const resourceValidationMethod = selectedResource ? `${OcdUtils.toTitleCase(selectedResource.provider)}${selectedResource.resourceType}` : ''
    // @ts-ignore 
    const ResourceValidation = OciResourceValidation[resourceValidationMethod]
    const validationResults = ResourceValidation ? ResourceValidation.validateResource(selectedResource, ociResources) : []
    const errors = validationResults.filter((v: OcdValidationResult) => v.type === 'error')
    const warnings = validationResults.filter((v: OcdValidationResult) => v.type === 'warning')
    const information = validationResults.filter((v: OcdValidationResult) => v.type === 'information')
    console.debug('OcdProperties: OcdResourceValidation', validationResults)
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-validation-panel ocd-validation-results`}>
            <details className='ocd-details' open={errors.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Errors (${errors.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {errors.map((r: OcdValidationResult) => {
                        return <OcdResourceValidationResult
                                    result={r}
                                    resource={selectedResource}
                                    key={`${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                        />
                    })}
                </div>
            </details>
            <details className='ocd-details' open={warnings.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Warning (${warnings.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {warnings.map((r: OcdValidationResult) => {
                            return <OcdResourceValidationResult
                                        result={r}
                                        resource={selectedResource}
                                        key={`${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                            />
                        })}
                </div>
            </details>
            <details className='ocd-details' open={information.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Information (${information.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {information.map((r: OcdValidationResult) => {
                            return <OcdResourceValidationResult
                                        result={r}
                                        resource={selectedResource}
                                        key={`${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                            />
                        })}
                </div>
            </details>
        </div>
    )
}
const OcdResourceValidationResult = ({result, resource}: DesignerResourceValidationResult): JSX.Element => {
    console.debug('OcdProperties: Validation Error', result, resource)
    const resultClassName = result.type === 'error' ? 'ocd-validation-error-result' :
                                            'warning' ? 'ocd-validation-warning-result' :
                                            'information' ? 'ocd-validation-information-result' :
                                            ''
    return (
        <div className='ocd-validation-result'>
            <div className={resultClassName}>
                <div className={`ocd-validation-result-title ${result.class}`}>{result.title}</div>
                <div className='ocd-validation-message'>{result.message}</div>
            </div>
        </div>
    )
}
const OcdResourceValidationError = ({result, resource}: DesignerResourceValidationResult): JSX.Element => {
    console.debug('OcdProperties: Validation Error', result, resource)
    return (
        <div className='ocd-validation-result'>
            <div className='ocd-validation-error-result'>
                <div className={`ocd-validation-result-title ${result.class}`}>{result.title}</div>
                <div className='ocd-validation-message'>{result.message}</div>
            </div>
        </div>
    )
}
const OcdResourceValidationWarning = ({result, resource}: DesignerResourceValidationResult): JSX.Element => {
    return (
        <div className='ocd-validation-result'>
            <div className='ocd-validation-warning-result'>
            <div className={`ocd-validation-result-title ${result.class}`}>{result.title}</div>
                <div className='ocd-validation-message'>{result.message}</div>
            </div>
        </div>
    )
}
const OcdResourceValidationInformation = ({result, resource}: DesignerResourceValidationResult): JSX.Element => {
    return (
        <div className='ocd-validation-result'>
            <div className='ocd-validation-information-result'>
            <div className={`ocd-validation-result-title ${result.class}`}>{result.title}</div>
                <div className='ocd-validation-message'>{result.message}</div>
            </div>
        </div>
    )
}

const OcdProperties = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const ociResources: OciResources = ocdDocument.getOciResourcesObject()
    const resourceValidationMethod = ocdDocument.getSelectedResource() ? `${OcdUtils.toTitleCase(ocdDocument.getSelectedResource().provider)}${ocdDocument.getSelectedResource().resourceType}` : ''
    // @ts-ignore 
    const ResourceValidation = OciResourceValidation[resourceValidationMethod]
    const validationResults = ResourceValidation ? ResourceValidation.validateResource(ocdDocument.getSelectedResource(), ociResources) : []
    const hasErrors = validationResults.filter((v: OcdValidationResult) => v.type === 'error').length > 0
    const hasWarnings = validationResults.filter((v: OcdValidationResult) => v.type === 'warning').length > 0
    const validationTabClass = `ocd-validation-tab ${hasErrors ? 'ocd-validation-error' : hasWarnings ? 'ocd-validation-warning' : 'ocd-validation-ok'}`
    const selectedResource = ocdDocument.selectedResource
    console.debug('\n================================\nOcdProperties: Selected Resource', ocdDocument.selectedResource, ocdDocument.getSelectedResource())
    const [activeTab, setActiveTab] = useState(ocdDocument.selectedResource.modelId !== '' ? 'properties' : 'documentation')
    const onPropertiesTabClick = (tab: string) => {
        setActiveTab(tab.toLowerCase())
    }
    const ActiveTab = activeTab === 'properties' ? OcdResourceProperties :
                      activeTab === 'documentation' ? OcdResourceDocumentation :
                      activeTab === 'arrange' ? OcdResourceArrangement :
                      activeTab === 'style' && selectedResource.coordsId !== '' ? OcdResourceStyle :
                      activeTab === 'style' ? OcdLayerStyle :
                      activeTab === 'validation' ? OcdResourceValidation :
                      OcdResourceDocumentation
    const modelId = ocdDocument.selectedResource.modelId
    const coordsId = ocdDocument.selectedResource.coordsId
    const additionalCss = {validation: validationTabClass}
    // Conditional on change
    const propertiesTabbarJMX = useMemo(() => <OcdPropertiesTabbar modelId={modelId} coordsId={coordsId} activeTab={activeTab} setActiveTab={onPropertiesTabClick} additionalCss={additionalCss}/>, [modelId, coordsId, additionalCss])
    const propertiesHeaderJMX = useMemo(() => <OcdResourcePropertiesHeader ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourcePropertiesHeader`}/>, [modelId])
    const activeTabJMX = useMemo(() => {
                                        return activeTab === 'properties' ? <OcdResourceProperties ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/> :
                                                activeTab === 'documentation' ? <OcdResourceDocumentation ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/> :
                                                activeTab === 'arrange' ? <OcdResourceArrangement ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/> :
                                                activeTab === 'style' && selectedResource.coordsId !== '' ? <OcdResourceStyle ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/> :
                                                activeTab === 'style' ? <OcdLayerStyle ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/> :
                                                activeTab === 'validation' ? <OcdResourceValidation ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/> :
                                                <OcdResourceDocumentation ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>
                                    }, [modelId, activeTab])
    // const activeTabJMX = useMemo(() => <ActiveTab ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>, [modelId, activeTab])
    console.debug(`>>> OcdProperies: OcdProperties: Render(${activeTab})`)
    return (
        <div className='ocd-designer-properties'>
            {propertiesTabbarJMX}
            {propertiesHeaderJMX}
            {activeTabJMX}
            {/* TODO: Delete */}
            {/* <div className={`ocd-designer-tab-bar ocd-designer-tab-bar-theme`}>
                {ocdDocument.selectedResource.modelId !== '' && <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'properties' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Properties')}><span>Properties</span></div>}
                <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'documentation' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Documentation')}><span>Documentation</span></div>
                {ocdDocument.selectedResource.modelId !== '' && <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'style' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Style')}><span>Style</span></div>}
                {ocdDocument.selectedResource.coordsId !== '' && <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'arrange' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Arrange')}><span>Arrange</span></div>}
                {ocdDocument.selectedResource.modelId !== '' && <div className={`ocd-designer-tab ocd-designer-tab-theme ${validationTabClass} ${activeTab === 'validation' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Validation')}><span>Validation</span></div>}
            </div> */}
            {/* <OcdResourcePropertiesHeader
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} 
                key={`ResourcePropertiesHeader`}
            /> */}
            {/* <ActiveTab
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} 
                key={`ResourceActiveTab`}
            /> */}
        </div>
    )
}

export default OcdProperties