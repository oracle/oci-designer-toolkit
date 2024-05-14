/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useRef, useState } from 'react'
import OcdDocument from './OcdDocument'
import { OcdViewPage } from '@ocd/model'
import { PageBarMenuProps, PageBarPageProps, PageBarPagesProps } from '../types/Console'

const OcdCanvasPage = ({ ocdDocument, setOcdDocument, page } : PageBarPageProps): JSX.Element => {
    const onPageSelectedClick = () => {
        ocdDocument.design.view.pages.forEach((p: OcdViewPage) => p.selected = p.id === page.id)
        // setViewPage(structuredClone(page))
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        ocdDocument.setPageTitle(page.id, e.target.value.trim())
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onBlur = (e: React.ChangeEvent<HTMLSpanElement | HTMLInputElement>) => {
        const title = e.target.textContent ? e.target.textContent : ''
        ocdDocument.setPageTitle(page.id, title)
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onDeleteClick = (e: React.MouseEvent<HTMLElement>) => {
        console.debug('OcdCanvasLayers: Delete Page', page)
        const clone = OcdDocument.clone(ocdDocument)
        clone.removePage(page.id)
        if (clone.design.view.pages.find(p => p.selected) === undefined) clone.design.view.pages[0].selected = true
        setOcdDocument(clone)
    }
    return (
        <div className={`ocd-designer-canvas-page ${page.selected ? 'ocd-page-selected' : ''}`}>
            <div className={`ocd-canvas-page-name`} onClick={() => onPageSelectedClick()}>
                <span contentEditable={true} onBlur={onBlur} suppressContentEditableWarning={true}>{page.title}</span>
                {/* <input type='text' value={page.title} onChange={onChange} tabIndex={-1}></input> */}
            </div>
            {ocdDocument.design.view.pages.length > 1 && <div className={`ocd-layer-visiblity-icon delete-layer`}
                onClick={onDeleteClick}
            ></div>}
        </div>
    )
}

const OcdCanvasPages = ({ ocdDocument, setOcdDocument }: PageBarPagesProps): JSX.Element => {
    const onClickAddPage = () => {
        ocdDocument.addPage()
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-designer-canvas-pages-bar' key='ocd-designer-canvas-pages-bar'>
                <OcdPagesThreeDotMenu
                    ocdDocument={ocdDocument}
                    setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                />
                <div className='ocd-designer-canvas-pages' key='ocd-designer-canvas-pages'>
                    {ocdDocument.design.view.pages.map((page: OcdViewPage) => {
                        return <OcdCanvasPage
                        ocdDocument={ocdDocument}
                        setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                        page={page}
                        key={`page-${page.id}`}
                    />
                    })}
                </div>
                <div className='ocd-add-layer ocd-layer-icon add-plus'
                    onClick={() => onClickAddPage()}
                ></div>
        </div>
    )
}

const OcdPagesThreeDotMenu = ({ocdDocument, setOcdDocument}: PageBarMenuProps): JSX.Element => {
    const cbRef = useRef<HTMLInputElement>(null)
    const [menuVisible, setMenuVisible] = useState(false)
    const onToggleMenuClick = () => {setMenuVisible(!menuVisible)}
    const onDuplicatePageClick = () => {
        const page = ocdDocument.getActivePage()
        const clone = OcdDocument.clone(ocdDocument)
        clone.duplicatePage(page.id)
        setOcdDocument(clone)
        setMenuVisible(false)
    }
    const onDeletePageClick = () => {
        const page = ocdDocument.getActivePage()
        const clone = OcdDocument.clone(ocdDocument)
        clone.removePage(page.id)
        if (clone.design.view.pages.find(p => p.selected) === undefined) clone.design.view.pages[0].selected = true
        setOcdDocument(clone)
        setMenuVisible(false)
    }
    const onAddPageClick = () => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.addPage()
        setOcdDocument(clone)
        setMenuVisible(false)
    }
    const displayGridOnChange = () => {
        const page = ocdDocument.getActivePage()
        page.grid = !page.grid
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
        setMenuVisible(false)
    }
    const activePage = ocdDocument.getActivePage()
    const activePageName = ocdDocument.getActivePage().title
    return (
        <div className='ocd-console-toolbar-dropdown ocd-console-toolbar-dropdown-theme'>
            <ul>
                <li className='ocd-console-toolbar-dropdown-item' onClick={onToggleMenuClick}>
                    <div className='three-dot-menu ocd-console-toolbar-icon'></div>
                    <ul className={`${menuVisible ? 'show slide-up' : 'hidden'}`}>
                        <li className='ocd-dropdown-menu-item ocd-mouseover-highlight'><div><label><input id='ocd_console_page_display_grid' type='checkbox' onChange={displayGridOnChange} ref={cbRef} checked={activePage.grid}/>Display Grid</label></div></li>
                        <li className='ocd-dropdown-menu-item'><div>--------------------------------</div></li>
                        <li className='ocd-dropdown-menu-item ocd-mouseover-highlight'><div onClick={onDuplicatePageClick}>Duplicate "{activePageName}"</div></li>
                        {ocdDocument.design.view.pages.length > 1 && <li className='ocd-dropdown-menu-item ocd-mouseover-highlight'><div onClick={onDeletePageClick}>Delete "{activePageName}"</div></li>}
                        <li className='ocd-dropdown-menu-item ocd-mouseover-highlight'><div onClick={onAddPageClick}>Add Page</div></li>
                    </ul>
                </li>
            </ul>
        </div>
    )
}

export default OcdCanvasPages