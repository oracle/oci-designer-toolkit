/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import OcdDocument from './OcdDocument'
import { OcdViewPage } from '../model/OcdDesign'

const OcdCanvasPage = ({ ocdDocument, setOcdDocument, page } : any): JSX.Element => {
    const onPageSelectedClick = () => {
        ocdDocument.design.view.pages.forEach((p: OcdViewPage) => p.selected = p.id === page.id)
        // setViewPage(structuredClone(page))
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className={`ocd-designer-canvas-page ${page.selected ? 'ocd-page-selected' : ''}`}>
            <div className={`ocd-canvas-page-name`} onClick={() => onPageSelectedClick()}>
                <span>{page.title}</span>
            </div>
        </div>
    )
}

const OcdCanvasPages = ({ ocdDocument, setOcdDocument }: any): JSX.Element => {
    const onClickAddPage = () => {
        ocdDocument.addPage()
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className='ocd-designer-canvas-pages'
            key='ocd-designer-canvas-pages'
            >
                {ocdDocument.design.view.pages.map((page: OcdViewPage) => {
                    return <OcdCanvasPage
                    ocdDocument={ocdDocument}
                    setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)}
                    page={page}
                    key={`page-${page.id}`}
                />
                })}
                <div className='ocd-add-layer ocd-layer-icon add-plus'
                    onClick={() => onClickAddPage()}
                ></div>
        </div>
    )
}

export default OcdCanvasPages