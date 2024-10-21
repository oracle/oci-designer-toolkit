/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useContext, useState } from 'react'
import { menuItems, MenuItem } from './Menu'
import OcdDocument from './OcdDocument'
import { ConsoleMenuProps, OcdActiveFile } from '../types/Console'
import OcdConsoleConfig from './OcdConsoleConfiguration'
import { ActiveFileContext } from '../pages/OcdConsole'

const OcdConsoleMenuItem = ({ menuItem, depth, ocdDocument, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig }: any): JSX.Element => {
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [dropdown, setDropdown] = useState(false)
    const onMouseEnter = () => {setDropdown(true)}
    const onMouseLeave = () => {setDropdown(false)}
    const closeDropdown = () => {setDropdown(!dropdown)}
    const onClick = () => {menuItem.click(ocdDocument, (ocdDocument: OcdDocument) => setOcdDocument(ocdDocument), ocdConsoleConfig, (ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig), activeFile, (activeFile: OcdActiveFile) => setActiveFile(activeFile))}
    // console.debug('OcdConsoleMenuItem:', menuItem.label, menuItem.click)
    return (
        <li
        className={`${depth > 0 ? 'ocd-submenu-item' : 'ocd-menu-item'}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={closeDropdown}
        aria-hidden
        >
            {menuItem.submenu && Array.isArray(menuItem.submenu) ? (
                <>
                <a href='#' className={`${menuItem.submenu && depth > 0 ? 'ocd-submenu-item-has-submenu' : ''}`} onClick={() => console.info(`Clicked ${menuItem.label}`)} aria-hidden>{menuItem.label}</a>
                <OcdConsoleSubMenu
                    submenus={menuItem.submenu}
                    dropdown={dropdown}
                    depth={depth}
                    ocdConsoleConfig={ocdConsoleConfig} 
                    setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                    ocdDocument={ocdDocument} 
                    setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)}
                />
                </>
            ) : menuItem.submenu && menuItem.submenu(ocdConsoleConfig, ocdDocument).length > 0 ? (
                <>
                <a href='#' className={`${menuItem.submenu && depth > 0 ? 'ocd-submenu-item-has-submenu' : ''}`} onClick={() => console.info(`Clicked ${menuItem.label}`)}>{menuItem.label}</a>
                <OcdConsoleSubMenu
                    submenus={menuItem.submenu(ocdConsoleConfig, ocdDocument)}
                    dropdown={dropdown}
                    depth={depth}
                    ocdConsoleConfig={ocdConsoleConfig} 
                    setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                    ocdDocument={ocdDocument} 
                    setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)}
                />
                </>
            ) : menuItem.click ? (
                <a href='#' onClick={onClick} className={menuItem.class ? `ocd-menu-item-icon  ${menuItem.class}` : ''}>{menuItem.label}</a>
            ) : (
                <a href='#' onClick={() => console.info(`Clicked ${menuItem.label}`)}>{menuItem.label}</a>
            )}
        </li>
    )
}

const OcdConsoleSubMenu = ({ submenus, dropdown, depth, ocdDocument, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig }: any): JSX.Element => {
    depth += 1
    return (
        <ul 
        className={`ocd-dropdown-menu ${depth > 1 ? 'ocd-dropdown-submenu' : ''} ${dropdown ? 'show' : ''}`}
        >
            {submenus.map((menuItem: MenuItem, idx: number): any => {
                return (<OcdConsoleMenuItem 
                            menuItem={menuItem} 
                            depth={depth} 
                            ocdConsoleConfig={ocdConsoleConfig} 
                            setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                            ocdDocument={ocdDocument} 
                            setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)}
                            key={idx}
                        />)
            })}
        </ul>
    )
}

const OcdConsoleMenu = ({ ocdDocument, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig }: ConsoleMenuProps): JSX.Element => {
    // const {ocdConsoleConfig, setOcdConsoleConfig} = useContext(ConsoleConfigContext)
    return (
        <ul className='ocd-console-main-menu'>
            {menuItems.filter((menuItem: MenuItem, idx: number) => !menuItem.view || menuItem.view === ocdConsoleConfig.config.displayPage).map((menuItem: MenuItem, idx: number): any => {
                const depth = 0
                return (
                    <OcdConsoleMenuItem 
                        menuItem={menuItem} 
                        depth={depth} 
                        ocdConsoleConfig={ocdConsoleConfig} 
                        setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                        ocdDocument={ocdDocument} 
                        setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)}
                        key={idx} 
                    />
                )
            })}
        </ul>
    )
}

const OcdConsoleMenuBar = ({ ocdDocument, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig }: ConsoleMenuProps): JSX.Element => {
    return (
        <div className='ocd-console-menu-bar ocd-console-menubar-colour'>
            <OcdConsoleMenu 
                ocdConsoleConfig={ocdConsoleConfig} 
                setOcdConsoleConfig={(ocdConsoleConfig: OcdConsoleConfig) => setOcdConsoleConfig(ocdConsoleConfig)} 
                ocdDocument={ocdDocument} 
                setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)}
            />
        </div>
    )
}

export default OcdConsoleMenuBar