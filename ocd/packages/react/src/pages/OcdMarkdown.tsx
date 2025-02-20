/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdMarkdownExporter } from "@ocd/export"
import { ConsolePageProps } from "../types/Console"
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { OcdDesignFacade } from "../facade/OcdDesignFacade"
import { getSvgCssData } from '../data/OcdSvgCssData'
// import { getSvgCssData } from "../components/Menu"

const OcdMarkdown = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const markdownExporter = new OcdMarkdownExporter([])
    const markdown = markdownExporter.export(ocdDocument.design)
    return (
        <div className={`ocd-markdown-view`}>
            {<div className='ocd-documentation-preview'><Markdown rehypePlugins={[rehypeRaw, remarkGfm]}>{markdown}</Markdown></div>}
        </div>
    )
}

export const OcdMarkdownLeftToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    // const {ocdConsoleConfig, setOcdConsoleConfig} = useContext(ConsoleConfigContext)
    const onClickMarkdown = () => {
        console.debug('OcdMarkdown: Export to Markdown')
        const design = ocdDocument.design
        const css = getSvgCssData(design)
        OcdDesignFacade.exportToMarkdown(design, css, `design.md`).then((results) => {
            console.debug('Exported to Markdown')
        }).catch((error) => {
            console.warn('Export To Markdown Failed with', error)
            alert(error)
        })
    }
    return (
        <div className='ocd-designer-toolbar'>
            <div className='ocd-console-toolbar-icon markdown' title='Export to Markdown' onClick={onClickMarkdown} aria-hidden></div>
        </div>
    )
}

export const OcdTerraformRightToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    return (
        <div className='ocd-designer-toolbar'></div>
    )
}

export default OcdMarkdown