/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import OcdDocument, { OcdSelectedResource } from './OcdDocument'
import { OcdViewLayer, OcdViewPage } from '../model/OcdDesign'
import * as ociResources from '../model/provider/oci/resources'

const OcdCanvasLayer = ({ ocdDocument, setOcdDocument, layer } : any): JSX.Element => {
    const style: React.CSSProperties = {}
    if (layer.style !== undefined && layer.style.fill !== undefined) style.backgroundColor = `${layer.style.fill}${style.opacity = layer.selected ? 'ff' : '33'}`
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
        ocdDocument.setDisplayName(layer.id, e.target.value)
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
                <input type='text' value={title} onChange={onChange} tabIndex={-1}></input>
            </div>
            {page.layers.length > 1 && <div className={`ocd-layer-visiblity-icon delete-layer`}
                onClick={onDeleteClick}
            ></div>}
        </div>
    )
}

const OcdCanvasLayers = ({ ocdDocument, setOcdDocument }: any): JSX.Element => {
    const onClickAddLayer = () => {
        console.debug('OcdCanvasLayers: Adding Layer')
        const compartment = ociResources.OciCompartment.newResource()
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
        <div className='ocd-designer-canvas-layers'
            key='ocd-designer-canvas-layers'
            >
                {page.layers.map((l: OcdViewLayer) => {
                    return <OcdCanvasLayer
                        ocdDocument={ocdDocument}
                        setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                        layer={l}
                        key={`layer-${l.id}`}
                    />
                })}
                <div className='ocd-add-layer ocd-layer-icon add-plus'
                    onClick={() => onClickAddLayer()}
                ></div>
        </div>
    )
}

export default OcdCanvasLayers