/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ConsolePageProps } from "../types/Console"
import { releaseNotes } from '../data/OcdReleaseNotes'
import { userGuide } from '../data/OcdUserGuiide'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

const OcdHelp = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const help = ocdConsoleConfig.config.helpPage === 'releasenotes' ? releaseNotes : ocdConsoleConfig.config.helpPage === 'userguide' ? userGuide : `# Unknown Help Page: ${ocdConsoleConfig.config.helpPage}`
    const urlTransform = (value: string) => value // Override the security that disables dataURIs. This allows inline images but only because we control the content.
    return (
        <div className={`ocd-markdown-view`}>
            {<div className='ocd-documentation-preview'><Markdown rehypePlugins={[rehypeRaw, remarkGfm]} urlTransform={urlTransform}>{help}</Markdown></div>}
        </div>
    )
}

export default OcdHelp