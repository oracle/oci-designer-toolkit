/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import OcdDocument from './OcdDocument'
import { OcdViewLayer, OcdViewPage } from '../model/OcdDesign'
import * as ociResources from '../model/provider/oci/resources'

const OcdCanvasLayer = ({ ocdDocument, setOcdDocument, layer } : any): JSX.Element => {
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
        // setViewPage(structuredClone(page))
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const title = ocdDocument.getLayerName(layer.id)
    return (
        <div className={`ocd-designer-canvas-layer ${layer.selected ? 'ocd-layer-selected' : ''}`}>
            <div className={`ocd-layer-visiblity-icon ${layer.visible ? 'eye-show' : 'eye-hide'}`}
                onClick={() => onVisibilityClick()}
            ></div>
            <div className={`ocd-canvas-layer-name ${layer.class}`}
                onClick={() => onLayerSelectedClick()}
            >
                <span>{title}</span>
            </div>
        </div>
    )
}

const OcdCanvasLayers = ({ ocdDocument, setOcdDocument }: any): JSX.Element => {
    const onClickAddLayer = () => {
        console.info('Adding Layer')
        const compartment = ociResources.OciCompartmentClient.new()
        ocdDocument.design.model.oci.resources.compartment.push(compartment)
        // Add Layer
        ocdDocument.addLayer(compartment.id)
        const page: OcdViewPage = ocdDocument.getActivePage()
        // const page: OcdViewPage = ocdDocument.getPage(viewPage.id)
        page.layers.forEach((l: OcdViewLayer) => l.selected = l.id === compartment.id)
        // setViewPage(structuredClone(page))
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