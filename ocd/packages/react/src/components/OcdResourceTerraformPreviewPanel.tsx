/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

// ---------------------------------------------------------------------------
// Terraform HCL preview tab (A4 — per-resource Terraform preview)
// ---------------------------------------------------------------------------

import { useContext, useMemo } from 'react'
import { OcdResource } from '@ocd/model'
import { DesignerResourceProperties } from '../types/DesignerResourceProperties'
import { getResourceTerraformHcl } from '@ocd/export'
import { SelectedResourceContext } from '../pages/OcdConsole'
import { useTheme } from '../contexts/OcdThemeContext'

/**
 * Read-only panel that shows the Terraform HCL the selected resource would
 * generate.  It delegates entirely to the existing OciExporter/AzureExporter
 * generators via the `getResourceTerraformHcl` helper from @ocd/export.
 */
export const OcdResourceTerraformPreview = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const {selectedResource} = useContext(SelectedResourceContext)
    const theme = useTheme()
    const selectedModelResource: OcdResource = ocdDocument.getResource(selectedResource.modelId)

    const hcl = useMemo((): string => {
        if (!selectedModelResource) return ''
        try {
            return getResourceTerraformHcl(ocdDocument.design, selectedModelResource.id)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            return `# Terraform HCL preview unavailable\n# ${msg}`
        }
        // Depend on ocdDocument (recreated immutably on every design edit) so the
        // preview refreshes when the selected resource's properties change, not
        // only when a different resource is selected.
    }, [selectedResource, ocdDocument])

    const divClassNames = `ocd-properties-panel ocd-properties-terraform-preview-panel ocd-properties-panel-default-theme ocd-properties-panel-${theme}-theme`
    return (
        <div className={divClassNames}>
            {selectedModelResource
                ? <pre className='ocd-terraform-preview-hcl'>{hcl}</pre>
                : <span className='ocd-terraform-preview-placeholder'>Select a resource to view its Terraform HCL.</span>
            }
        </div>
    )
}
