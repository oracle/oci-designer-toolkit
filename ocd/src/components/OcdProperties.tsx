/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from 'react'
import { OcdViewPage } from '../model/OcdDesign'
import { DesignerResourceProperties } from '../types/DesignerResourceProperties'
import OcdDocument from './OcdDocument'

const OcdResourcePropertiesHeader = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource = ocdDocument.getSelectedResource()
    const padlock: string = selectedResource ? selectedResource.locked ? 'padlock-closed' : 'padlock-open' : 'padlock-open'
    return (
        <div className='ocd-properties-header'>
            <div className={`property-editor-title ${ocdDocument.selectedResource.class}`}>
                <h3 className={`heading-background ${padlock}`}>{ocdDocument.selectedResource.class} {ocdDocument.getDisplayName(ocdDocument.selectedResource.modelId)}</h3>
            </div>
        </div>
    )
}

const OcdResourceProperties = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme`}>

        </div>
    )
}

const OcdResourceDocumentation = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-documentation-panel`}>
            <textarea></textarea>
        </div>
    )
}

const OcdResourceArrangement = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource = ocdDocument.selectedResource
    const page: OcdViewPage = ocdDocument.getActivePage()
    console.info('Selected Resource', selectedResource)
    // @ts-ignore
    const coords = ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === selectedResource.coordsId)
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
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-arrangement-panel`}>
            <div className={`ocd-arrangement-z-positioning`}>
                <div><span>To Front</span></div>
                <div><span>To Back</span></div>
                <div><span>Bring Forward</span></div>
                <div><span>Send Backward</span></div>
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

const OcdProperties = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const [activeTab, setActivieTab] = useState('properties')
    const onPropertiesTabClick = (tab: string) => {
        setActivieTab(tab.toLowerCase())
    }
    const ActiveTab = activeTab === 'properties' ? OcdResourceProperties :
                      activeTab === 'documentation' ? OcdResourceDocumentation :
                      activeTab === 'arrange' ? OcdResourceArrangement :
                      OcdResourceProperties
    return (
        <div className='ocd-designer-properties'>
            <div className={`ocd-designer-tab-bar ocd-designer-tab-bar-theme`}>
                <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'properties' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Properties')}><span>Properties</span></div>
                <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'documentation' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Documentation')}><span>Documentation</span></div>
                <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'arrange' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onPropertiesTabClick('Arrange')}><span>Arrange</span></div>
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