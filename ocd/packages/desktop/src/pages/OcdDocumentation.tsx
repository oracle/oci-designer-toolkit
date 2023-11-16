/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from "react"
import { ConsolePageProps } from "../types/Console"
import Markdown from 'react-markdown'
import OcdDocument from "../components/OcdDocument"

const OcdDocumentation = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const [preview, setPreview] = useState(false)
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        ocdDocument.design.metadata.documentation = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onPreviewChanged = () => setPreview(!preview)
    return (
        <div className={`ocd-documentation-view`}>
            <div className='ocd-properties-documentation-preview-bar'><input id='documentation_preview_checkbox' type='checkbox' checked={preview} onChange={onPreviewChanged}></input><label htmlFor='documentation_preview_checkbox'>Preview</label></div>
            {!preview && <div className='ocd-documentation-entry'><textarea onChange={onChange} value={ocdDocument.design.metadata.documentation}></textarea></div>}
            {preview && <div className='ocd-documentation-preview'><Markdown>{ocdDocument.design.metadata.documentation}</Markdown></div>}
        </div>
    )
}

export default OcdDocumentation