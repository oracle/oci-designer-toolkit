/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React, { useState } from 'react'
import OcdPalette from '../components/OcdPalette'
import OcdCanvas from '../components/OcdCanvas'
import OcdCanvasLayers from '../components/OcdCanvasLayers'
import OcdCanvasPages from '../components/OcdCanvasPages'
import OcdDocument from '../components/OcdDocument'
import { CanvasProps } from '../types/ReactComponentProperties'
import { ConsolePageProps } from '../types/Console'
import { newDragData } from '../types/DragData'

const OcdCanvasView = ({ dragData, ocdConsoleConfig, ocdDocument, setOcdDocument }: CanvasProps): JSX.Element => {
    return (
        <div className='ocd-designer-view'>
            <OcdCanvasLayers 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
            <OcdCanvas 
                dragData={dragData} 
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
    return (
        <div className='ocd-designer'>
            <OcdPalette 
                ocdConsoleConfig={ocdConsoleConfig}
                setDragData={(dragData: any) => setDragData(dragData)} 
                ocdDocument={ocdDocument} 
                />
            <OcdCanvasView 
                dragData={dragData} 
                ocdConsoleConfig={ocdConsoleConfig}
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
        </div>
    )
}

export default OcdDesigner