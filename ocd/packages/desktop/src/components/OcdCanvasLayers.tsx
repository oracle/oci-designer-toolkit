/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import OcdDocument, { OcdSelectedResource } from './OcdDocument'
import { OcdViewLayer, OcdViewPage } from '@ocd/model'
import { OciModelResources } from '@ocd/model'
import { LayerBarMenuProps, LayerBarLayerProps, LayerBarLayersProps } from '../types/Console'
import { useState } from 'react'
import { OcdUtils } from '@ocd/core'

const OcdCanvasLayer = ({ ocdDocument, setOcdDocument, layer } : LayerBarLayerProps): JSX.Element => {
    const style: React.CSSProperties = {}
    if (layer.style !== undefined && layer.style.fill !== undefined) style.backgroundColor = `${OcdUtils.rgbaToHex(layer.style.fill, true)}${style.opacity = layer.selected ? 'ff' : '33'}`
    // if (layer.style !== undefined && layer.style.fill !== undefined) style.backgroundColor = `${layer.style.fill}${style.opacity = layer.selected ? 'ff' : '33'}`
    const onVisibilityClick = () => {
        const page: OcdViewPage = ocdDocument.getActivePage()
        // @ts-ignore 
        page.layers.find((l: OcdViewLayer) => l.id === layer.id).visible = !layer.visible
        console.info(`Change Visibility ${layer.visible} ${ocdDocument}`)
        // setViewPage(structuredClone(page))
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onLayerSelectedClick = () => {
        const page: OcdViewPage = ocdDocument.getActivePage()
        page.layers.forEach((l: OcdViewLayer) => l.selected = l.id === layer.id)
        const clone = OcdDocument.clone(ocdDocument)
        const selectedResource: OcdSelectedResource = {
            modelId: layer.id,
            pageId: ocdDocument.getActivePage().id,
            coordsId: '',
            class: layer.class
        }
        clone.selectedResource = selectedResource
        setOcdDocument(clone)
    }
    const onDeleteClick = (e: React.MouseEvent<HTMLElement>) => {
        console.debug('OcdCanvasLayers: Delete Layer', layer)
        const page: OcdViewPage = ocdDocument.getActivePage()
        const clone = OcdDocument.clone(ocdDocument)
        clone.removeLayer(layer.id)
        if (ocdDocument.selectedResource.modelId === layer.id) {
            console.debug('OcdCanvasLayers: Delete Layer Changed Selected', page.layers[0].id)
            const selectedResource: OcdSelectedResource = {
                modelId: page.layers[0].id,
                pageId: page.id,
                coordsId: '',
                class: layer.class
            }
            clone.selectedResource = selectedResource
            page.layers[0].selected = true
        }
        setOcdDocument(clone)
    }
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        ocdDocument.setDisplayName(layer.id, e.target.value.trim())
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const title = ocdDocument.getLayerName(layer.id)
    const page: OcdViewPage = ocdDocument.getActivePage()
    return (
        <div className={`ocd-designer-canvas-layer ${layer.selected ? 'ocd-layer-selected' : ''}`} style={style}>
            <div className={`ocd-layer-visiblity-icon ${layer.visible ? 'eye-show' : 'eye-hide'}`}
                onClick={() => onVisibilityClick()}
            ></div>
            <div className={`ocd-canvas-layer-name ${layer.class}`} onClick={() => onLayerSelectedClick()}>
                <input id={layer.id.replace(/\W+/g, "")} type='text' value={title} onChange={onChange} tabIndex={-1}></input>
            </div>
            {page.layers.length > 1 && <div className={`ocd-layer-visiblity-icon delete-layer`}
                onClick={onDeleteClick}
            ></div>}
        </div>
    )
}

const OcdCanvasLayers = ({ ocdDocument, setOcdDocument }: LayerBarLayersProps): JSX.Element => {
    const onClickAddLayer = () => {
        console.debug('OcdCanvasLayers: Adding Layer')
        const compartment = OciModelResources.OciCompartment.newResource()
        ocdDocument.design.model.oci.resources.compartment.push(compartment)
        // Add Layer
        ocdDocument.addLayer(compartment.id)
        const page: OcdViewPage = ocdDocument.getActivePage()
        page.layers.forEach((l: OcdViewLayer) => l.selected = l.id === compartment.id)
        const selectedResource: OcdSelectedResource = {
            modelId: compartment.id,
            pageId: ocdDocument.getActivePage().id,
            coordsId: '',
            class: page.layers[0].class
        }
        ocdDocument.selectedResource = selectedResource
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }

    const page: OcdViewPage = ocdDocument.getActivePage()
    // const layer: OcdViewLayer = page.layers.find((l: OcdViewLayer) => l.selected)

    return (
        <div className='ocd-designer-canvas-layers-bar' key='ocd-designer-canvas-layers-bar'>
                <OcdLayersThreeDotMenu
                    ocdDocument={ocdDocument}
                    setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                />
                <div className='ocd-designer-canvas-layers' key='ocd-designer-canvas-layers'>
                    {page.layers.map((l: OcdViewLayer) => {
                        return <OcdCanvasLayer
                            ocdDocument={ocdDocument}
                            setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                            layer={l}
                            key={`layer-${l.id}`}
                        />
                    })}
                </div>
                <div className='ocd-add-layer ocd-layer-icon add-plus'
                    onClick={() => onClickAddLayer()}
                ></div>
        </div>
    )
}

const OcdLayersThreeDotMenu = ({ocdDocument, setOcdDocument}: LayerBarMenuProps): JSX.Element => {
    const [menuVisible, setMenuVisible] = useState(false)
    const onToggleMenuClick = () => {setMenuVisible(!menuVisible)}
    const onDeleteLayerClick = () => {
        const page: OcdViewPage = ocdDocument.getActivePage()
        const layer = page.layers.find((l) => l.selected)
        const clone = OcdDocument.clone(ocdDocument)
        console.debug('OcdCanvasLayers: Delete Layer', layer)
        if (layer) {
            clone.removeLayer(layer.id)
            if (ocdDocument.selectedResource.modelId === layer.id) {
                console.debug('OcdCanvasLayers: Delete Layer Changed Selected', page.layers[0].id)
                const selectedResource: OcdSelectedResource = {
                    modelId: page.layers[0].id,
                    pageId: page.id,
                    coordsId: '',
                    class: layer.class
                }
                clone.selectedResource = selectedResource
                page.layers[0].selected = true
            }
            setOcdDocument(clone)
        }
        setMenuVisible(false)
    }
    const onAddLayerClick = () => {
        console.debug('OcdCanvasLayers: Adding Layer')
        const compartment = OciModelResources.OciCompartment.newResource()
        ocdDocument.design.model.oci.resources.compartment.push(compartment)
        // Add Layer
        ocdDocument.addLayer(compartment.id)
        const page: OcdViewPage = ocdDocument.getActivePage()
        page.layers.forEach((l: OcdViewLayer) => l.selected = l.id === compartment.id)
        const selectedResource: OcdSelectedResource = {
            modelId: compartment.id,
            pageId: ocdDocument.getActivePage().id,
            coordsId: '',
            class: page.layers[0].class
        }
        ocdDocument.selectedResource = selectedResource
        setOcdDocument(OcdDocument.clone(ocdDocument))
        setMenuVisible(false)
    }
    const page: OcdViewPage = ocdDocument.getActivePage()
    const layer = page.layers.find((l) => l.selected)
    const selectedLayerName = layer ?  ocdDocument.getLayerName(layer.id) : ''

    return (
        <div className='ocd-console-toolbar-dropdown ocd-console-toolbar-dropdown-theme'>
            <ul>
                <li className='ocd-console-toolbar-dropdown-item' onClick={onToggleMenuClick}>
                    <div className='three-dot-menu ocd-console-toolbar-icon'></div>
                    <ul className={`${menuVisible ? 'show slide-down' : 'hidden'}`}>
                        {page.layers.length > 1 && <li className='ocd-dropdown-menu-item ocd-mouseover-highlight'><div  onClick={onDeleteLayerClick}>Delete "{selectedLayerName}"</div></li>}
                        <li className='ocd-dropdown-menu-item ocd-mouseover-highlight'><div  onClick={onAddLayerClick}>Add Page</div></li>
                    </ul>
                </li>
            </ul>
        </div>
    )
}

export default OcdCanvasLayers