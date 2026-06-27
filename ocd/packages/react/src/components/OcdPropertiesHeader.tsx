/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useContext, useMemo, useState } from 'react'
import { OcdResource } from '@ocd/model'
import { DesignerResourceProperties } from '../types/DesignerResourceProperties'
import { OcdDocument } from './OcdDocument'
import { SelectedResourceContext } from '../pages/OcdConsole'
import { useCache } from '../contexts/OcdCacheContext'
import { useTheme } from '../contexts/OcdThemeContext'
import { getSelectedResourceProxy } from './OcdPropertiesResourceProxy'

export const OcdResourcePropertiesHeader = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    // const selectedResource = ocdDocument.getSelectedResource()
    const {selectedResource } = useContext(SelectedResourceContext)
    const ocdCache = useCache()
    const theme = useTheme()
    const selectedModelResource: OcdResource = ocdDocument.getResource(selectedResource.modelId)
    console.debug('OcdProperties: OcdResourcePropertiesHeader: selectedResource', selectedResource, '\nselectedModelResource', selectedModelResource)
    const selectedResourceProxy: OcdResource = useMemo(() => getSelectedResourceProxy(ocdDocument, selectedModelResource, ocdCache), [selectedResource])
    const activePage = ocdDocument.getActivePage()
    const [editLocked, setEditLocked] = useState(selectedResourceProxy?.editLocked)
    const [locked, setLocked] = useState(selectedResourceProxy?.locked)
    const padlock: string = locked ? 'padlock-closed' : 'padlock-open'
    const readOnly: string = editLocked ? 'read-only' : 'read-write'
    // const padlock: string = selectedResource ? selectedResource.locked ? 'padlock-closed' : 'padlock-open' : 'padlock-open'
    const title: string = selectedModelResource ? `${selectedModelResource.resourceTypeName} (${ocdDocument.getDisplayName(selectedResource.modelId)})` : `Page (${activePage.title})`
    // const title: string = selectedResource ? `${selectedResource.resourceTypeName} (${ocdDocument.getDisplayName(ocdDocument.selectedResource.modelId)})` : `Page (${activePage.title})`
    const onEditLockedClick = (() => {
        setEditLocked(!editLocked)
        selectedResourceProxy.editLocked = !selectedResourceProxy.editLocked
        setOcdDocument(OcdDocument.clone(ocdDocument))
    })
    const onLockedClick = (() => {
        setLocked(!locked)
        selectedResourceProxy.locked = !selectedResourceProxy.locked
    })
    const divClassNames = `ocd-properties-header ocd-properties-header-default-theme ocd-properties-header-${theme}-theme` // Use CSS positional precedence to override
    return (
        <div className={divClassNames}>
            <div className={`ocd-properties-header-grid`}>
                <div className={`property-editor-title ${ocdDocument.selectedResource.class}`}>{title}</div>
                {selectedModelResource && <div className={`heading-background ${readOnly}`} onClick={onEditLockedClick} aria-hidden></div>}
                {selectedModelResource && <div className={`heading-background ${padlock}`} onClick={onLockedClick} aria-hidden></div>}
            </div>
        </div>
    )
}
