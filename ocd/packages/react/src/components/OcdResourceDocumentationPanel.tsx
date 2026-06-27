/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useContext, useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { DesignerResourceProperties } from '../types/DesignerResourceProperties'
import { OcdDocument } from './OcdDocument'
import { SelectedResourceContext } from '../pages/OcdConsole'
import { useTheme } from '../contexts/OcdThemeContext'

export const OcdResourceDocumentation = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const theme = useTheme()
    const {selectedResource } = useContext(SelectedResourceContext)
    const [preview, setPreview] = useState(false)
    const selectedModelResource = ocdDocument.getSelectedResource()
    const activePage = ocdDocument.getActivePage()
    const [documentation, setDocumentation] = useState('')
    // const [documentation, setDocumentation] = useState(ocdDocument.getSelectedResource() ? ocdDocument.getSelectedResource().documentation : ocdDocument.getActivePage().documentation)
    // const documentation = ocdDocument.getSelectedResource() ? ocdDocument.getSelectedResource().documentation : ocdDocument.getActivePage().documentation
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (selectedModelResource) selectedModelResource.documentation = e.target.value
        else activePage.documentation = e.target.value
        setDocumentation(e.target.value)
        // setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onBlur = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onPreviewChanged = () => setPreview(!preview)
    useEffect(() => setDocumentation(ocdDocument.getSelectedResource() ? ocdDocument.getSelectedResource().documentation : ocdDocument.getActivePage().documentation), [selectedResource])
    console.debug('OcdProperties: OcdResourceDocumentation: selectedResource', selectedResource)
    console.debug('OcdProperties: OcdResourceDocumentation: selectedModelResource', selectedModelResource)
    console.debug('OcdProperties: OcdResourceDocumentation: documentation', documentation)
    const divClassNames = `ocd-properties-panel ocd-properties-documentation-panel ocd-properties-panel-default-theme ocd-properties-panel-${theme}-theme` // Use CSS positional precedence to override
    return (
        <div className={divClassNames}>
            <div className='ocd-properties-documentation-preview-bar'><input id='documentation_preview_checkbox' type='checkbox' checked={preview} onChange={onPreviewChanged}></input><label htmlFor='documentation_preview_checkbox'>Preview</label></div>
            {!preview && <textarea id='ocd_resource_documentation' onChange={onChange} onBlur={onBlur} value={documentation}></textarea>}
            {preview && <div className='ocd-properties-documentation-preview'><Markdown>{documentation}</Markdown></div>}
            {/* {!preview && <textarea id='ocd_resource_documentation' onChange={onChange} value={selectedModelResource ? selectedModelResource.documentation : activePage.documentation}></textarea>}
            {preview && <div className='ocd-properties-documentation-preview'><Markdown>{selectedModelResource ? selectedModelResource.documentation : activePage.documentation}</Markdown></div>} */}
        </div>
    )
}
