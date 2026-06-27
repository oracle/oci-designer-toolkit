/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ConsolePageProps } from "../types/Console"
import { releaseNotes } from '../data/OcdReleaseNotes'
import { userGuide } from '../data/OcdUserGuiide'
import Markdown, { defaultUrlTransform } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { rehypeSanitizeOcd } from "../utils/rehypeSanitizeOcd"

const OcdHelp = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const help = ocdConsoleConfig.config.helpPage === 'releasenotes' ? releaseNotes : ocdConsoleConfig.config.helpPage === 'userguide' ? userGuide : `# Unknown Help Page: ${ocdConsoleConfig.config.helpPage}`
    // Allow inline data:image URIs (used by the bundled guide) but keep
    // react-markdown's default block on javascript:/other dangerous schemes.
    const urlTransform = (value: string) => value.startsWith('data:image/') ? value : defaultUrlTransform(value)
    return (
        <div className={`ocd-markdown-view`}>
            {<div className='ocd-documentation-preview'><Markdown rehypePlugins={[rehypeRaw, rehypeSanitizeOcd, remarkGfm]} urlTransform={urlTransform}>{help}</Markdown></div>}
        </div>
    )
}

export default OcdHelp