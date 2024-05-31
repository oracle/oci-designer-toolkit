/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdMarkdownExporter } from "@ocd/export"
import { ConsolePageProps } from "../types/Console"
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

const OcdMarkdown = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const markdownExporter = new OcdMarkdownExporter([])
    const markdown = markdownExporter.export(ocdDocument.design)
    return (
        <div className={`ocd-markdown-view`}>
            {<div className='ocd-documentation-preview'><Markdown rehypePlugins={[rehypeRaw, remarkGfm]}>{markdown}</Markdown></div>}
        </div>
    )
}

export default OcdMarkdown