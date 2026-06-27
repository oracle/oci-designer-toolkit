/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

// ---------------------------------------------------------------------------
// Relationships panel (A4 part 2 — resource relationship tab)
// ---------------------------------------------------------------------------

import { useContext, useMemo } from 'react'
import { OcdResource } from '@ocd/model'
import { DesignerResourceProperties } from '../types/DesignerResourceProperties'
import { SelectedResourceContext } from '../pages/OcdConsole'
import { getOciResourceRelationships } from '../landingzone/OcdResourceRelationships'
import { useTheme } from '../contexts/OcdThemeContext'

/**
 * Read-only panel that shows the informational parent/child/connection
 * relationship types valid for the currently-selected OCI resource.
 * Data is derived entirely from the model's `allowedParentTypes()` functions —
 * no live OCI API calls are made.
 */
export const OcdResourceRelationshipsPanel = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const {selectedResource} = useContext(SelectedResourceContext)
    const theme = useTheme()
    const selectedModelResource: OcdResource = ocdDocument.getResource(selectedResource.modelId)

    const relationships = useMemo(() => {
        if (!selectedModelResource || selectedModelResource.provider !== 'oci') return undefined
        return getOciResourceRelationships(selectedModelResource.resourceType)
    }, [selectedResource, ocdDocument])

    const divClassNames = `ocd-properties-panel ocd-properties-relationships-panel ocd-properties-panel-default-theme ocd-properties-panel-${theme}-theme`
    const summaryClassNames = `summary-background summary-background-default-theme summary-background-${theme}-theme`

    if (!selectedModelResource) {
        return (
            <div className={divClassNames}>
                <span className='ocd-relationships-placeholder'>Select a resource to view its relationships.</span>
            </div>
        )
    }

    if (!relationships) {
        return (
            <div className={divClassNames}>
                <span className='ocd-relationships-placeholder'>No relationship data available for this resource type ({selectedModelResource.resourceType}).</span>
            </div>
        )
    }

    return (
        <div className={divClassNames}>
            <details className='ocd-details' open={true}>
                <summary className={summaryClassNames}><label>Parent Types ({relationships.parents.length})</label></summary>
                <div className='ocd-details-body'>
                    {relationships.parents.length === 0
                        ? <span className='ocd-relationships-empty'>None — this resource can be placed directly in a Compartment.</span>
                        : <ul className='ocd-relationships-list'>
                            {relationships.parents.map((p) => <li key={p} className='ocd-relationships-item ocd-relationships-parent'>{p}</li>)}
                          </ul>
                    }
                </div>
            </details>
            <details className='ocd-details' open={true}>
                <summary className={summaryClassNames}><label>Child Types ({relationships.children.length})</label></summary>
                <div className='ocd-details-body'>
                    {relationships.children.length === 0
                        ? <span className='ocd-relationships-empty'>No resources are contained by this type.</span>
                        : <ul className='ocd-relationships-list'>
                            {relationships.children.map((c) => <li key={c} className='ocd-relationships-item ocd-relationships-child'>{c}</li>)}
                          </ul>
                    }
                </div>
            </details>
            {relationships.connectionLabels.length > 0 && (
                <details className='ocd-details' open={true}>
                    <summary className={summaryClassNames}><label>Connections ({relationships.connectionLabels.length})</label></summary>
                    <div className='ocd-details-body'>
                        <ul className='ocd-relationships-list'>
                            {relationships.connectionLabels.map((l) => <li key={l} className='ocd-relationships-item ocd-relationships-connection'>{l}</li>)}
                        </ul>
                    </div>
                </details>
            )}
        </div>
    )
}
