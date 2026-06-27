/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Composition root for the designer right-hand properties panel. The per-tab
** panels (Properties, Tags, Documentation, Style, Arrange, Terraform,
** Relationships, Validation) live in sibling Ocd*Panel modules; this file only
** owns tab selection and panel dispatch. Public API (default OcdProperties
** export) is unchanged.
*/

import { useMemo, useState } from 'react'
import { OciResourceValidation, OciResources, OcdValidationResult } from '@ocd/model'
import { DesignerResourceProperties } from '../types/DesignerResourceProperties'
import { OcdUtils } from '@ocd/core'
import { OcdDocument } from './OcdDocument'
import { getResourceTabs, OcdPropertiesTabbar } from './OcdPropertiesTabbar'
import { OcdResourcePropertiesHeader } from './OcdPropertiesHeader'
import { OcdResourceProperties } from './OcdResourcePropertiesPanel'
import { OcdResourceTags } from './OcdResourceTagsPanel'
import { OcdResourceDocumentation } from './OcdResourceDocumentationPanel'
import { OcdResourceArrangement } from './OcdResourceArrangementPanel'
import { OcdLayerStyle, OcdResourceStyle } from './OcdResourceStylePanel'
import { OcdResourceTerraformPreview } from './OcdResourceTerraformPreviewPanel'
import { OcdResourceRelationshipsPanel } from './OcdResourceRelationshipsPanel'
import { OcdResourceValidation } from './OcdResourceValidationPanel'

const getActiveTabJMX = (availableTabs: string[], activeTab: string, ocdDocument: OcdDocument, setOcdDocument: React.Dispatch<any>, isLayer: boolean = false): JSX.Element => {
    console.debug('OcdProperties: getActiveTabJMX: Requested', activeTab, availableTabs)
    if (!availableTabs.includes(activeTab)) activeTab  = 'documentation'
    console.debug('OcdProperties: getActiveTabJMX: Returning', activeTab, availableTabs)
    switch (activeTab) {
        case 'properties': {
            return <OcdResourceProperties ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>
        }
        case 'tags': {
            return <OcdResourceTags ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>
        }
        case 'arrange': {
            return <OcdResourceArrangement ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>
        }
        case 'style': {
            if (isLayer) return <OcdLayerStyle ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>
            else return <OcdResourceStyle ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>
        }
        case 'terraform': {
            return <OcdResourceTerraformPreview ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>
        }
        case 'relationships': {
            return <OcdResourceRelationshipsPanel ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>
        }
        case 'validation': {
            return <OcdResourceValidation ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>
        }
        default: {
            return <OcdResourceDocumentation ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourceActiveTab`}/>
        }
    }
}

const OcdProperties = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    // const {selectedResource } = useContext(SelectedResourceContext)
    const ociResources: OciResources = ocdDocument.getOciResourcesObject()
    const resourceValidationMethod = ocdDocument.getSelectedResource() ? `${OcdUtils.toTitleCase(ocdDocument.getSelectedResource().provider)}${ocdDocument.getSelectedResource().resourceType}` : ''
    // @ts-ignore
    const ResourceValidation = OciResourceValidation[resourceValidationMethod]
    const validationResults = ResourceValidation ? ResourceValidation.validateResource(ocdDocument.getSelectedResource(), ociResources) : []
    const hasErrors = validationResults.filter((v: OcdValidationResult) => v.type === 'error').length > 0
    const hasWarnings = validationResults.filter((v: OcdValidationResult) => v.type === 'warning').length > 0
    // const validationTabClass = `ocd-validation-tab ${hasErrors ? 'ocd-validation-error' : hasWarnings ? 'ocd-validation-warning' : 'ocd-validation-ok'}`
    const validationTabClass = (() => {
                                        if (hasErrors) return 'ocd-validation-tab ocd-validation-error'
                                        else if (hasWarnings) return 'ocd-validation-tab ocd-validation-warning'
                                        else return 'ocd-validation-tab ocd-validation-ok'
                                    })()
    // const selectedResource = ocdDocument.selectedResource
    console.debug('================================')
    console.debug('OcdProperties: Selected Resource', ocdDocument.selectedResource)
    console.debug('OcdProperties: getSelectedResource()', ocdDocument.getSelectedResource())
    // console.debug('OcdProperties: Selected Resource Context', selectedResource)
    console.debug('================================')
    let [activeTab, setActiveTab] = useState('documentation')
    // let [activeTab, setActiveTab] = useState(ocdDocument.selectedResource.modelId !== '' ? 'properties' : 'documentation')
    const onPropertiesTabClick = (tab: string) => {
        setActiveTab(tab.toLowerCase())
    }
    const modelId = ocdDocument.selectedResource.modelId
    const coordsId = ocdDocument.selectedResource.coordsId
    const additionalCss = {validation: validationTabClass}
    const availableTabs = getResourceTabs(modelId, coordsId).map((t) => t.toLowerCase())
    console.debug('OcdProperties: Active Tabs', availableTabs, 'Selected Tab', activeTab)
    if (!availableTabs.includes(activeTab)) {
        activeTab = 'documentation'
        setActiveTab('documentation')
    }
    // Conditional on change
    const propertiesTabbarJMX = useMemo(() => <OcdPropertiesTabbar modelId={modelId} coordsId={coordsId} activeTab={activeTab} setActiveTab={onPropertiesTabClick} additionalCss={additionalCss}/>, [modelId, coordsId, additionalCss])
    const propertiesHeaderJMX = useMemo(() => <OcdResourcePropertiesHeader ocdDocument={ocdDocument} setOcdDocument={(ocdDocument: OcdDocument) => setOcdDocument(ocdDocument)} key={`ResourcePropertiesHeader`}/>, [modelId])
    const activeTabJMX = getActiveTabJMX(availableTabs, activeTab, ocdDocument, setOcdDocument, coordsId === '')
    console.debug(`>>> OcdProperies: OcdProperties: Render(${activeTab})`, modelId)
    return (
        <div className='ocd-designer-properties'>
            {propertiesTabbarJMX}
            {propertiesHeaderJMX}
            {activeTabJMX}
        </div>
    )
}

export default OcdProperties
