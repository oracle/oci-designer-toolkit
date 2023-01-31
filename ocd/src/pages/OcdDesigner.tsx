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

const OcdCanvasView = ({ dragData, ocdDocument, setOcdDocument }: any): JSX.Element => {
    return (
        <div className='ocd-designer-view'>
            <OcdCanvasLayers 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
            <OcdCanvas 
                dragData={dragData} 
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

const OcdDesigner = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: any): JSX.Element => {
    const [dragData, setDragData] = useState(null)
    return (
        <div className='ocd-designer'>
            <OcdPalette 
                ocdConsoleConfig={ocdConsoleConfig}
                setDragData={(dragData: any) => setDragData(dragData)} 
                ocdDocument={ocdDocument} 
                />
            <OcdCanvasView 
                dragData={dragData} 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} 
                />
        </div>
    )
}

export default OcdDesigner