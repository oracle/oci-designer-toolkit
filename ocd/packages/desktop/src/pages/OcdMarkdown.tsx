/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { ConsolePageProps } from "../types/Console"
import Markdown from 'react-markdown'

const OcdMarkdown = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    return (
        <div className={`ocd-markdown-view`}>
            {<div className='ocd-documentation-preview'><Markdown>{ocdDocument.design.metadata.documentation}</Markdown></div>}
        </div>
    )
}

export default OcdMarkdown