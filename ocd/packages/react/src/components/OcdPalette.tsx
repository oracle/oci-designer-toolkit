/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { PaletteProps } from '../types/ReactComponentProperties'
import { useState } from 'react'
import OcdProviderPalette from './OcdProviderPalette'
import OcdModelPalette from './OcdModelPalette'

const OcdPalette = ({ ocdConsoleConfig, setDragData, ocdDocument }: PaletteProps): JSX.Element => {
    const [activeTab, setActivieTab] = useState('provider')
    const onTabClick = (tab: string) => {
        setActivieTab(tab.toLowerCase())
    }
    const ActiveTab = activeTab === 'provider' ? OcdProviderPalette :
                      activeTab === 'model' ? OcdModelPalette :
                      OcdProviderPalette
    return (
        <div className='ocd-designer-left-panel'>
            <div className={`ocd-designer-tab-bar ocd-designer-tab-bar-theme`}>
                <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'provider' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onTabClick('Provider')} aria-hidden><span>Provider</span></div>
                <div className={`ocd-designer-tab ocd-designer-tab-theme ${activeTab === 'model' ? 'ocd-designer-active-tab-theme' : ''}`} onClick={() => onTabClick('Model')} aria-hidden><span>Model</span></div>
            </div>
            <ActiveTab
                ocdConsoleConfig={ocdConsoleConfig} 
                setDragData={(dragData:any) => setDragData(dragData)} 
                ocdDocument={ocdDocument}
            />
        </div>
    )

}

export default OcdPalette