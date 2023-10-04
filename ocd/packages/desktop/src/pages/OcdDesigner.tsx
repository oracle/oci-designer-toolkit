/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React, { useState } from 'react'
import OcdPalette from '../components/OcdPalette'
import OcdProperties from '../components/OcdProperties'
import OcdCanvas from '../components/OcdCanvas'
import OcdCanvasLayers from '../components/OcdCanvasLayers'
import OcdCanvasPages from '../components/OcdCanvasPages'
import OcdDocument from '../components/OcdDocument'
import { CanvasProps } from '../types/ReactComponentProperties'
import { ConsolePageProps } from '../types/Console'
import { DragData, newDragData } from '../types/DragData'

const OcdCanvasView = ({ dragData, setDragData, ocdConsoleConfig, ocdDocument, setOcdDocument }: CanvasProps): JSX.Element => {
    return (
        <div className='ocd-designer-view'>
            <OcdCanvasLayers 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
            <OcdCanvas 
                dragData={dragData} 
                setDragData={(dragData: DragData) => setDragData(dragData)}
                ocdConsoleConfig={ocdConsoleConfig}
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
            <OcdCanvasPages 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
        </div>
    )
}

const OcdDesigner = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const [dragData, setDragData] = useState(newDragData())
    const className = `ocd-designer ${ocdConsoleConfig.config.showPalette && !ocdConsoleConfig.config.showProperties ? 'ocd-designer-left-panel-only' : !ocdConsoleConfig.config.showPalette && ocdConsoleConfig.config.showProperties ? 'ocd-designer-right-panel-only' : !ocdConsoleConfig.config.showPalette && !ocdConsoleConfig.config.showProperties ? 'ocd-designer-no-side-panels' : ''}`
    return (
        <div className={className}>
            {ocdConsoleConfig.config.showPalette && <OcdPalette 
                ocdConsoleConfig={ocdConsoleConfig}
                setDragData={(dragData: DragData) => setDragData(dragData)} 
                ocdDocument={ocdDocument} 
                />}
            <OcdCanvasView 
                dragData={dragData} 
                setDragData={(dragData: DragData) => setDragData(dragData)} 
                ocdConsoleConfig={ocdConsoleConfig}
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
            {ocdConsoleConfig.config.showProperties && <OcdProperties 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />}
        </div>
    )
}

export default OcdDesigner