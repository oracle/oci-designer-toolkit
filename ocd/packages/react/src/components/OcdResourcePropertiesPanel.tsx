/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { ComponentType, useEffect, useMemo, useState } from 'react'
import { OcdResource, OcdVariable } from '@ocd/model'
import { DesignerResourceProperties } from '../types/DesignerResourceProperties'
import { OcdDocument } from './OcdDocument'
import { OcdDisplayNameProperty, OcdLookupProperty, ResourceElementConfig, ResourceProperties } from './properties/OcdPropertyTypes'
import { useCache } from '../contexts/OcdCacheContext'
import { useTheme } from '../contexts/OcdThemeContext'
import { getOciResourceConfigs, getResourceProperties, getSelectedResourceProxy } from './OcdPropertiesResourceProxy'

const OciCommonResourceProperties = ({ocdDocument, setOcdDocument, resource, rootResource, configs}: ResourceProperties & { configs: ResourceElementConfig[] }): JSX.Element => {
    const theme = useTheme()
    console.debug('OcdProperties: OciCommonResourceProperties: config', configs)
    const displayName = {"provider": "oci", "key": "displayName", "name": "displayName", "type": "string", "subtype": "", "required": true, "label": "Name", "id": "displayName", "conditional": false, "condition": {}}
    const compartmentId = {"provider": "oci", "key": "compartmentId", "name": "compartmentId", "type": "string", "subtype": "", "required": true, "label": "Compartment", "id": "compartmentId", "lookupResource": "compartment", "conditional": false, "condition": {}}
    const summaryClassNames = `summary-background summary-background-default-theme summary-background-${theme}-theme` // Use CSS positional precedence to override
    return (
        <div>
            <details open={true}>
                <summary className={summaryClassNames}>Core</summary>
                <div>
                <OcdDisplayNameProperty  ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={configs.find((c) => c.id === 'display_name')} rootResource={rootResource} attribute={displayName} key={`${resource.id}-displayName`}/>
                <OcdLookupProperty  ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={configs.find((c) => c.id === 'compartment_id')} rootResource={rootResource} attribute={compartmentId}  key={`${resource.id}-compartmentId`}/>
                </div>
            </details>
        </div>
    )
}

const OcdDataListOption = ({value}: {value: string}): JSX.Element => {
    return (<option value={value}/>)
}

const OcdPropertiesDataList = ({variables}: {variables: OcdVariable[]}): JSX.Element => {
    return (<datalist id='variables' key={`VariablesDataList`}>{variables.map((v) => <OcdDataListOption value={`var.${v.name}`} key={v.key}/>)}</datalist>)
}

export const OcdResourceProperties = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    // const {ocdCache} = useContext(CacheContext)
    // const {selectedResource } = useContext(SelectedResourceContext)
    const ocdCache = useCache()
    const theme = useTheme()
    console.debug(`>>> OcdProperies: OcdResourceProperties: Render(): Using Cache`, ocdCache)
    const selectedModelResource: OcdResource = ocdDocument.getSelectedResource()
    const [ResourceProperties, setResourceProperties] = useState<ComponentType<ResourceProperties> | undefined>(undefined)
    const selectedModelResourceProxy: OcdResource = useMemo(() => getSelectedResourceProxy(ocdDocument, selectedModelResource, ocdCache), [selectedModelResource])
    const configs = useMemo(() => getOciResourceConfigs(selectedModelResource), [selectedModelResource])
    useEffect(() => {
        let cancelled = false
        setResourceProperties(undefined)
        getResourceProperties(selectedModelResource).then((component) => {
            if (!cancelled) setResourceProperties(() => component)
        })
        return () => {
            cancelled = true
        }
    }, [selectedModelResource])
    const variables = selectedModelResource && selectedModelResource.provider === 'oci' ? ocdDocument.getOciVariables() : []
    const modelId = selectedModelResource ? selectedModelResource.id : ''
    // Memos
    const variablesDatalist = useMemo(() => <OcdPropertiesDataList variables={variables}/>, [variables])
    const commonProperties = useMemo(() => <OciCommonResourceProperties ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={selectedModelResourceProxy} rootResource={selectedModelResourceProxy} configs={configs} key={`${selectedModelResourceProxy ? selectedModelResourceProxy.id : ''}.CommonProperties`}/>, [modelId, configs])
    // const resourceProperties = useMemo(() => <ResourceProperties ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={selectedResourceProxy} key={`${selectedResourceProxy ? selectedResourceProxy.id : ''}.Properties`}/>, [modelId])
    const resourceProperties = ResourceProperties
        ? <ResourceProperties ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={selectedModelResourceProxy} rootResource={selectedModelResourceProxy} key={`${selectedModelResourceProxy ? selectedModelResourceProxy.id : ''}.Properties`}/>
        : undefined
    console.debug(`>>> OcdProperies: OcdResourceProperties: Render()`, selectedModelResource, ResourceProperties)
    const divClassNames = `ocd-properties-panel ocd-properties-panel-default-theme ocd-properties-panel-${theme}-theme` // Use CSS positional precedence to override
    return (
        <div className={divClassNames}>
            {selectedModelResource && selectedModelResourceProxy && variablesDatalist}
            {selectedModelResource && selectedModelResource.provider === 'oci' && commonProperties}
            {selectedModelResource && ResourceProperties && resourceProperties}
        </div>
    )
}
