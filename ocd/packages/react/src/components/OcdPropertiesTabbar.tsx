/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useMemo, useState } from 'react'
import { useTheme } from '../contexts/OcdThemeContext'

export const getResourceTabs = (modelId: string, coordsId: string): string[] => {
    const tabs = [
        ...modelId && modelId !== '' ? ['Properties', 'Tags'] : [],
        'Documentation',
        ...modelId && modelId !== '' ? ['Style'] : [],
        ...coordsId && coordsId !== '' ? ['Arrange'] : [],
        ...modelId && modelId !== '' ? ['Terraform', 'Relationships', 'Validation'] : [],
    ]
    console.debug('OcdPropertiesTabbar: getResourceTabs:', tabs)
    return tabs
}

export const OcdPropertiesTabbar = ({modelId, coordsId, activeTab, setActiveTab, additionalCss}: {modelId: string, coordsId: string, activeTab: string, setActiveTab: (title: string) => void, additionalCss: Record<string, string>}): JSX.Element => {
    console.debug('OcdPropertiesTabbar: Render: Active Tab =', activeTab, 'ModelId = ', modelId)
    const theme = useTheme()
    const [active, setActive] = useState(activeTab)
    const tabs: string[] = useMemo(() => {
        const tabs = getResourceTabs(modelId, coordsId)
        if (!tabs.map((tab) => tab.toLocaleLowerCase()).includes(active)) setActive('documentation')
        return tabs
    }, [modelId, coordsId])
    // const tabs = getResourceTabs(modelId, coordsId)
    // const [active, setActive] = useState(activeTab)
    // const [active, setActive] = useState(tabs.map((tab) => tab.toLocaleLowerCase()).includes(activeTab) ? activeTab : 'documentation')
    // const [active, setActive] = useState('documentation')
    const tabClicked = (title: string) => {
        console.debug('OcdPropertiesTabbar: Tab Clicked', title)
        setActive(title.toLocaleLowerCase())
        setActiveTab(title)
    }
    const divClassNames = `ocd-designer-tab-bar ocd-designer-tab-bar-default-theme ocd-designer-tab-bar-${theme}-theme` // Use CSS positional precedence to override
    return (
        <div className={divClassNames}>
            {tabs.map((tab) => <OcdPropertiesTabbarTab title={tab} active={active === tab.toLocaleLowerCase()} setActive={tabClicked} additionalCss={additionalCss[tab.toLocaleLowerCase()]} key={tab}/>)}
        </div>
    )
}

const OcdPropertiesTabbarTab = ({title, active, setActive, additionalCss}: {title: string, active: boolean, setActive: (title: string) => void, additionalCss: string}): JSX.Element => {
    console.debug('OcdPropertiesTabbarTab: Render', title, active ? '- Active' : '')
    const theme = useTheme()
    const activeClassNames = active ? `ocd-designer-active-tab-default-theme ocd-designer-active-tab-${theme}-theme` : ''
    const additionalClassNames = additionalCss || ''
    const divClassNames = `ocd-designer-tab ocd-designer-tab-default-theme ocd-designer-tab-${theme}-theme ${activeClassNames} ${additionalClassNames}` // Use CSS positional precedence to override
    return(
        <div className={divClassNames} onClick={() => setActive(title.toLowerCase())} aria-hidden><span>{title}</span></div>
    )
}
