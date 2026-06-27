/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useContext, useEffect, useMemo, useState } from 'react'
import { OcdDesign, OcdResource, OciDefinedTag, OciFreeformTag } from '@ocd/model'
import { DesignerResourceProperties } from '../types/DesignerResourceProperties'
import { SelectedResourceContext } from '../pages/OcdConsole'
import { OciDefinedTagRow, OciFreeformTagRow } from '../pages/OcdCommonTags'
import { useCache } from '../contexts/OcdCacheContext'
import { useTheme } from '../contexts/OcdThemeContext'
import { getSelectedResourceProxy } from './OcdPropertiesResourceProxy'

export const OcdResourceTags = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const {selectedResource } = useContext(SelectedResourceContext)
    // const {ocdCache} = useContext(CacheContext)
    // const selectedModelResource: OcdResource = ocdDocument.getSelectedResource()
    const ocdCache = useCache()
    const theme = useTheme()
    const selectedModelResource: OcdResource = ocdDocument.getResource(selectedResource.modelId)
    console.debug('OcdProperties: OcdResourceTags: selectedResource', selectedResource, '\nselectedModelResource', selectedModelResource)
    // const selectedResourceProxy = getSelectedResourceProxy(ocdDocument, selectedModelResource, ocdCache)
    const selectedResourceProxy: OcdResource = useMemo(() => getSelectedResourceProxy(ocdDocument, selectedModelResource, ocdCache), [selectedResource])
    const [freeformTags, setFreeformTags] = useState(OcdDesign.ociFreeformTagsToArray(selectedResourceProxy.freeformTags))
    const [definedTags, setDefinedTags] = useState(OcdDesign.ociDefinedTagsToArray(selectedResourceProxy.definedTags))
    useEffect(() => {
        setFreeformTags(OcdDesign.ociFreeformTagsToArray(selectedResourceProxy.freeformTags))
        setDefinedTags(OcdDesign.ociDefinedTagsToArray(selectedResourceProxy.definedTags))
    }, [selectedResource])
    const onOciFreeformTagDeleteClick = ((key: string) => {
        console.debug('OcdProperies: Deleting Freeform Row', key, ocdDocument)
        const updatedTags = freeformTags.filter((v) => v.key !== key)
        setFreeformTags(updatedTags)
        updateFreeformTags(updatedTags)
    })
    const onFreeformTagAddClick = (() => {
        const newTag = OcdDesign.newOciFreeformTag()
        const updatedTags = [...freeformTags, newTag]
        console.debug('OcdProperies: Adding Freeform Tag', newTag, updatedTags)
        updateFreeformTags(updatedTags)
        setFreeformTags(updatedTags)
    })
    const onFreeformKeyChange = ((oldKey: string, newKey: string) => {
        const tag = freeformTags.find((t) => t.key === oldKey)
        if (tag) {
            tag.key = newKey
            // setFreeformTags([...freeformTags])
            updateFreeformTags(freeformTags)
        }
    })
    const onFreeformValueChange = ((key: string, value: string) => {
        const tag = freeformTags.find((t) => t.key === key)
        if (tag) {
            tag.value = value
            // setFreeformTags([...freeformTags])
            updateFreeformTags(freeformTags)
        }
    })
    const updateFreeformTags = (tags: OciFreeformTag[]) => selectedResourceProxy.freeformTags = OcdDesign.ociFreeformTagArrayToTags(tags)
    const onDefinedTagDeleteClick = ((namespace:string, key: string) => {
        console.debug('OcdProperies: Deleting Defined Row', key, ocdDocument, definedTags)
        const namespaceKey = `${namespace}.${key}`
        const updatedTags = definedTags.filter((t) => `${t.namespace}.${t.key}` !== namespaceKey)
        console.debug('OcdCommonTags: Deleting Defined Row', namespaceKey, updatedTags)
        setDefinedTags(updatedTags)
        updateDefinedTags(updatedTags)
    })
    const onDefinedTagAddClick = (() => {
        const newTag = OcdDesign.newOciDefinedTag()
        const updatedTags = [...definedTags, newTag]
        console.debug('OcdProperies: Adding Defined Tag', newTag, updatedTags)
        setDefinedTags(updatedTags)
        updateDefinedTags(updatedTags)
    })
    const onDefinedNamespaceChange = ((oldNamespace: string, newNamespace: string, key: string) => {
        const tag = definedTags.find((t) => t.namespace === oldNamespace && t.key === key)
        if (tag) {
            tag.namespace = newNamespace
            // setDefinedTags([...definedTags])
            updateDefinedTags(definedTags)
        }
    })
    const onDefinedKeyChange = ((namespace: string, oldKey: string, newKey: string) => {
        const tag = definedTags.find((t) => t.namespace === namespace && t.key === oldKey)
        if (tag) {
            tag.key = newKey
            // setDefinedTags([...definedTags])
            updateDefinedTags(definedTags)
        }
    })
    const onDefinedValueChange = ((namespace: string, key: string, value: string) => {
        const tag = definedTags.find((t) => t.namespace === namespace && t.key === key)
        if (tag) {
            tag.value = value
            // setDefinedTags([...definedTags])
            updateDefinedTags(definedTags)
        }
    })
    const updateDefinedTags = (tags: OciDefinedTag[]) => selectedResourceProxy.definedTags = OcdDesign.ociDefinedTagArrayToTags(tags)
    const divClassNames = `ocd-properties-panel ocd-properties-panel-default-theme ocd-properties-panel-${theme}-theme` // Use CSS positional precedence to override
    const summaryClassNames = `summary-background summary-background-default-theme summary-background-${theme}-theme` // Use CSS positional precedence to override
    return (
        <div className={divClassNames}>
            <details className='ocd-details' open={true}>
                <summary className={summaryClassNames}><label>Freeform Tags</label></summary>
                <div className='ocd-details-body'>
                    <div className='table ocd-tags-table'>
                        <div className='thead ocd-tags-list-header'>
                            <div className='tr'>
                                <div className='th'>Key</div>
                                <div className='th'>Value</div>
                                <div className='th action-button-background add-property' onClick={onFreeformTagAddClick} aria-hidden></div>
                            </div>
                        </div>
                        <div className='tbody ocd-tags-list-body'>
                            {freeformTags.sort((a, b) => a.key.localeCompare(b.key)).map((v: OciFreeformTag, i) => {
                                return <OciFreeformTagRow
                                    ocdDocument={ocdDocument}
                                    setOcdDocument={setOcdDocument}
                                    tag={v}
                                    onDeleteClick={() => onOciFreeformTagDeleteClick(v.key)}
                                    onFreeformKeyChange={onFreeformKeyChange}
                                    onFreeformValueChange={onFreeformValueChange}
                                    key={`freeform.${v.key}`}
                                />
                            })}
                        </div>
                    </div>
                </div>
            </details>
            <details className='ocd-details' open={true}>
                <summary className={summaryClassNames}><label>Defined Tags</label></summary>
                <div className='ocd-details-body'>
                    <div className='table ocd-tags-table'>
                        <div className='thead ocd-tags-list-header'>
                            <div className='tr'>
                                <div className='th'>Namespace</div>
                                <div className='th'>Key</div>
                                <div className='th'>Value</div>
                                <div className='th action-button-background add-property' onClick={onDefinedTagAddClick} aria-hidden></div>
                            </div>
                        </div>
                        <div className='tbody ocd-tags-list-body'>
                            {definedTags.sort((a, b) => `${a.namespace}.${a.key}`.localeCompare(`${b.namespace}.${b.key}`)).map((v: OciDefinedTag, i) => {
                                return <OciDefinedTagRow
                                    ocdDocument={ocdDocument}
                                    setOcdDocument={setOcdDocument}
                                    tag={v}
                                    onDeleteClick={() => onDefinedTagDeleteClick(v.namespace, v.key)}
                                    onDefinedNamespaceChange={onDefinedNamespaceChange}
                                    onDefinedKeyChange={onDefinedKeyChange}
                                    onDefinedValueChange={onDefinedValueChange}
                                    key={`${v.namespace}.${v.key}`}
                                />
                            })}
                        </div>
                    </div>
                </div>
            </details>
        </div>
    )
}
