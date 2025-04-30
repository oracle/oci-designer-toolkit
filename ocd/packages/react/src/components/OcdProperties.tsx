/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useContext, useEffect, useMemo, useState } from 'react'
import { AzureResources, OcdDesign, OcdResource, OcdVariable, OcdViewCoordsStyle, OcdViewPage, OciDefinedTag, OciFreeformTag, OciResourceValidation, OciResources, OcdValidationResult, GoogleResources } from '@ocd/model'
import { DesignerColourPicker, DesignerResourceProperties, DesignerResourceValidationResult } from '../types/DesignerResourceProperties'
import { OcdUtils } from '@ocd/core'
import { OcdDocument } from './OcdDocument'
import { OcdDisplayNameProperty, OcdLookupProperty, ResourceElementConfig, ResourceProperties } from './properties/OcdPropertyTypes'
import * as ociResources from './properties/provider/oci/resources'
import * as azureResources from './properties/provider/azure/resources'
import * as googleResources from './properties/provider/google/resources'
import { RgbaStringColorPicker } from 'react-colorful'
import Markdown from 'react-markdown'
import { CacheContext, SelectedResourceContext } from '../pages/OcdConsole'
import { OciDefinedTagRow, OciFreeformTagRow } from '../pages/OcdCommonTags'
import { OcdCacheData } from './OcdCache'

const getResourceTabs = (modelId: string, coordsId: string): string[] => {
    const tabs = [
        ...modelId && modelId !== '' ? ['Properties', 'Tags'] : [],
        'Documentation',
        ...modelId && modelId !== '' ? ['Style'] : [],
        ...coordsId && coordsId !== '' ? ['Arrange'] : [],
        ...modelId && modelId !== '' ? ['Validation'] : [],
    ]
    console.debug('OcdPropertiesTabbar: getResourceTabs:', tabs)
    return tabs
}

const OcdPropertiesTabbar = ({modelId, coordsId, activeTab, setActiveTab, additionalCss}: {modelId: string, coordsId: string, activeTab: string, setActiveTab: (title: string) => void, additionalCss: Record<string, string>}): JSX.Element => {
    console.debug('OcdPropertiesTabbar: Render', activeTab, modelId)
    const tabs: string[] = useMemo(() => {
        return getResourceTabs(modelId, coordsId)
    }, [modelId, coordsId])
    // const [active, setActive] = useState(tabs.includes(activeTab) ? activeTab : 'documentation')
    const [active, setActive] = useState('documentation')
    const tabClicked = (title: string) => {
        console.debug('OcdPropertiesTabbar: Tab Clicked', title)
        setActive(title.toLocaleLowerCase())
        setActiveTab(title)
    }
    return (
        <div className={`ocd-designer-tab-bar ocd-designer-tab-bar-theme`}>
            {tabs.map((tab) => <OcdPropertiesTabbarTab title={tab} active={active === tab.toLocaleLowerCase()} setActive={tabClicked} additionalCss={additionalCss[tab.toLocaleLowerCase()]} key={tab}/>)}
        </div>
    )
}

const OcdPropertiesTabbarTab = ({title, active, setActive, additionalCss}: {title: string, active: boolean, setActive: (title: string) => void, additionalCss: string}): JSX.Element => {
    console.debug('OcdPropertiesTabbarTab: Render', title, active ? '- Active' : '')
    return(
        <div className={`ocd-designer-tab ocd-designer-tab-theme ${active ? 'ocd-designer-active-tab-theme' : ''} ${additionalCss ? additionalCss : ''}`} onClick={() => setActive(title.toLowerCase())} aria-hidden><span>{title}</span></div>
    )
}

const OcdResourcePropertiesHeader = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource = ocdDocument.getSelectedResource()
    const activePage = ocdDocument.getActivePage()
    const padlock: string = selectedResource ? selectedResource.locked ? 'padlock-closed' : 'padlock-open' : 'padlock-open'
    const title: string = selectedResource ? `${selectedResource.resourceTypeName} (${ocdDocument.getDisplayName(ocdDocument.selectedResource.modelId)})` : `Page (${activePage.title})`
    return (
        <div className='ocd-properties-header'>
            <div className={`property-editor-title ${ocdDocument.selectedResource.class}`}>
                <div className={`heading-background ${padlock}`}>{title}</div>
            </div>
        </div>
    )
}

const OciCommonResourceProperties = ({ocdDocument, setOcdDocument, resource, rootResource}: ResourceProperties): JSX.Element => {
    const selectedResource: OcdResource = ocdDocument.getSelectedResource()
    const resourceConfigsName = selectedResource ? `${OcdUtils.toTitleCase(selectedResource.provider)}${selectedResource.resourceType}Configs` : ''
    // @ts-ignore 
    const resourceConfigs = ociResources[resourceConfigsName]
    const configs: ResourceElementConfig[] = resourceConfigs.configs()
    console.debug('OcdProperties: OciCommonResourceProperties: config', configs)
    const displayName = {"provider": "oci", "key": "displayName", "name": "displayName", "type": "string", "subtype": "", "required": true, "label": "Name", "id": "displayName", "conditional": false, "condition": {}}
    const compartmentId = {"provider": "oci", "key": "compartmentId", "name": "compartmentId", "type": "string", "subtype": "", "required": true, "label": "Compartment", "id": "compartmentId", "lookupResource": "compartment", "conditional": false, "condition": {}}
    return (
        <div>
            <details open={true}>
                <summary className='summary-background'>Core</summary>
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

const getSelectedResourceProxy = (ocdDocument: OcdDocument, selectedModelResource: OcdResource, ocdCache: OcdCacheData) => {    
    const provider = selectedModelResource ? selectedModelResource.provider : ''
    console.debug('OcdProperties: getSelectedResourceProxy:', selectedModelResource)
    switch (provider) {
        case 'azure':
            return getAzureResourceProxy(ocdDocument, selectedModelResource, ocdCache)
        case 'google':
            return getGoogleResourceProxy(ocdDocument, selectedModelResource, ocdCache)
        case 'oci':
            return getOciResourceProxy(ocdDocument, selectedModelResource, ocdCache)
        default:
            return selectedModelResource
    }
}

const getAzureResourceProxy = (ocdDocument: OcdDocument, selectedModelResource: OcdResource, ocdCache: OcdCacheData) => {
    const provider = selectedModelResource.provider
    const resourceType = selectedModelResource.resourceType
    const resourceProxyName = `${OcdUtils.toTitleCase(provider)}${resourceType}Proxy`
    console.debug(`> OcdProperies: OcdResourceProperties: Render(AzureProxy(${resourceProxyName}))`, selectedModelResource)
    //@ts-ignore
    return Object.hasOwn(azureResources, resourceProxyName) ? azureResources[resourceProxyName].proxyResource(ocdDocument, selectedModelResource, ocdCache) : selectedModelResource
}

const getGoogleResourceProxy = (ocdDocument: OcdDocument, selectedModelResource: OcdResource, ocdCache: OcdCacheData) => {
    const provider = selectedModelResource.provider
    const resourceType = selectedModelResource.resourceType
    const resourceProxyName = `${OcdUtils.toTitleCase(provider)}${resourceType}Proxy`
    console.debug(`> OcdProperies: OcdResourceProperties: Render(GoogleProxy(${resourceProxyName}))`, selectedModelResource)
    //@ts-ignore
    return Object.hasOwn(googleResources, resourceProxyName) ? googleResources[resourceProxyName].proxyResource(ocdDocument, selectedModelResource, ocdCache) : selectedModelResource
}

const getOciResourceProxy = (ocdDocument: OcdDocument, selectedModelResource: OcdResource, ocdCache: OcdCacheData) => {
    const provider = selectedModelResource.provider
    const resourceType = selectedModelResource.resourceType
    const resourceProxyName = `${OcdUtils.toTitleCase(provider)}${resourceType}Proxy`
    console.debug(`> OcdProperies: OcdResourceProperties: Render(Oci Proxy(${resourceProxyName}))`, selectedModelResource)
    //@ts-ignore
    return Object.hasOwn(ociResources, resourceProxyName) ? ociResources[resourceProxyName].proxyResource(ocdDocument, selectedModelResource, ocdCache) : selectedModelResource
}

const getResourceProperties = (selectedModelResource: OcdResource) => {
    const provider = selectedModelResource ? selectedModelResource.provider : ''
    const resourceType = selectedModelResource ? selectedModelResource.resourceType : ''
    const resourceJSXMethod = `${OcdUtils.toTitleCase(provider)}${resourceType}`
    console.debug(`> OcdProperies: OcdResourceProperties: Render(JMX(${resourceJSXMethod}))`)
    switch (provider) {
        case 'azure':
            // @ts-ignore 
            return azureResources[resourceJSXMethod]
        case 'google':
            // @ts-ignore 
            return googleResources[resourceJSXMethod]
        case 'oci':
            // @ts-ignore 
            return ociResources[resourceJSXMethod]
        default:
            return undefined
    }
}

const OcdResourceProperties = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const {ocdCache} = useContext(CacheContext)
    // const {selectedResource } = useContext(SelectedResourceContext)
    const selectedModelResource: OcdResource = ocdDocument.getSelectedResource()
    const selectedModelResourceProxy: OcdResource = useMemo(() => getSelectedResourceProxy(ocdDocument, selectedModelResource, ocdCache), [selectedModelResource])
    const ResourceProperties = useMemo(() => getResourceProperties(selectedModelResource), [selectedModelResource])
    const variables = selectedModelResource && selectedModelResource.provider === 'oci' ? ocdDocument.getOciVariables() : []
    const modelId = selectedModelResource ? selectedModelResource.id : ''
    // Memos
    const variablesDatalist = useMemo(() => <OcdPropertiesDataList variables={variables}/>, [variables])
    const commonProperties = useMemo(() => <OciCommonResourceProperties ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={selectedModelResourceProxy} rootResource={selectedModelResourceProxy} key={`${selectedModelResourceProxy ? selectedModelResourceProxy.id : ''}.CommonProperties`}/>, [modelId])
    // const resourceProperties = useMemo(() => <ResourceProperties ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={selectedResourceProxy} key={`${selectedResourceProxy ? selectedResourceProxy.id : ''}.Properties`}/>, [modelId])
    const resourceProperties = <ResourceProperties ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={selectedModelResourceProxy} key={`${selectedModelResourceProxy ? selectedModelResourceProxy.id : ''}.Properties`}/>
    console.debug(`>>> OcdProperies: OcdResourceProperties: Render()`, selectedModelResource, ResourceProperties)
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme`}>
            {selectedModelResource && selectedModelResourceProxy && variablesDatalist}
            {selectedModelResource && selectedModelResource.provider === 'oci' && commonProperties} 
            {selectedModelResource && ResourceProperties && resourceProperties} 
        </div>
    )
}

const OcdResourceTags = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const {selectedResource } = useContext(SelectedResourceContext)
    const {ocdCache} = useContext(CacheContext)
    // const selectedModelResource: OcdResource = ocdDocument.getSelectedResource()
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
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme`}>
            <details className='ocd-details' open={true}>
                <summary className='summary-background'><label>Freeform Tags</label></summary>
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
                <summary className='summary-background'><label>Defined Tags</label></summary>
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

const OcdResourceDocumentation = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
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
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-documentation-panel`}>
            <div className='ocd-properties-documentation-preview-bar'><input id='documentation_preview_checkbox' type='checkbox' checked={preview} onChange={onPreviewChanged}></input><label htmlFor='documentation_preview_checkbox'>Preview</label></div>
            {!preview && <textarea id='ocd_resource_documentation' onChange={onChange} onBlur={onBlur} value={documentation}></textarea>}
            {preview && <div className='ocd-properties-documentation-preview'><Markdown>{documentation}</Markdown></div>}
            {/* {!preview && <textarea id='ocd_resource_documentation' onChange={onChange} value={selectedModelResource ? selectedModelResource.documentation : activePage.documentation}></textarea>}
            {preview && <div className='ocd-properties-documentation-preview'><Markdown>{selectedModelResource ? selectedModelResource.documentation : activePage.documentation}</Markdown></div>} */}
        </div>
    )
}

const OcdResourceArrangement = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const {selectedResource } = useContext(SelectedResourceContext)
    // const selectedResource = ocdDocument.selectedResource
    const page: OcdViewPage = ocdDocument.getActivePage()
    // console.info('Selected Resource', selectedResource)
    // @ts-ignore
    // const coords = ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === selectedResource.coordsId)
    const coords = ocdDocument.getCoords(selectedResource.coordsId)
    const [width, setWidth] = useState(coords ? coords.w : 0)
    const [height, setHeight] = useState(coords ? coords.h : 0)
    const [left, setLeft] = useState(coords ? coords.x : 0)
    const [top, setTop] = useState(coords ? coords.y : 0)
    const [container, setContainer] = useState(coords ? coords.container : false)
    useEffect(() => {
        setWidth(coords ? coords.w : 0)
        setHeight(coords ? coords.h : 0)
        setLeft(coords ? coords.x : 0)
        setTop(coords ? coords.y : 0)
        setContainer(coords ? coords.container : false)
    }, [selectedResource])
    const onWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).w = parseInt(value)
        const width = parseInt(e.currentTarget.value)
        setWidth(width)
        if (coords) {ocdDocument.updateCoords({...coords, w: width}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).h = parseInt(value)
        const height = parseInt(e.currentTarget.value)
        setHeight(height)
        if (coords) {ocdDocument.updateCoords({...coords, h: height}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).x = parseInt(value)
        const left = parseInt(e.currentTarget.value)
        setLeft(left)
        if (coords) {ocdDocument.updateCoords({...coords, x: left}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onTopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // @ts-ignore 
        // ocdDocument.design.view.pages.find((p => p.selected)).coords.find(c => c.id === coordsId).y = parseInt(value)
        const top = parseInt(e.currentTarget.value)
        setTop(top)
        if (coords) {ocdDocument.updateCoords({...coords, y: top}, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const toFrontClick = () => {
        if (coords) {ocdDocument.toFront(coords, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const toBackClick = () => {
        if (coords) {ocdDocument.toBack(coords, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const bringForwardClick = () => {
        if (coords) {ocdDocument.bringForward(coords, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const sendBackwardClick = () => {
        if (coords) {ocdDocument.sendBackward(coords, page.id)}
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-arrangement-panel`}>
            <div className={`ocd-arrangement-z-positioning`}>
                <div onClick={() => toFrontClick()} aria-hidden><span>To Front</span></div>
                <div onClick={() => toBackClick()} aria-hidden><span>To Back</span></div>
                <div onClick={() => bringForwardClick()} aria-hidden><span>Bring Forward</span></div>
                <div onClick={() => sendBackwardClick()} aria-hidden><span>Send Backward</span></div>
            </div>
            <div className={`ocd-arrangement-size ${!container ? 'hidden' : ''}`}>
                <div><span>Size</span></div>
                <div><input type={'number'} min={40} value={width} onChange={onWidthChange}></input></div>
                <div><input type={'number'} min={40} value={height} onChange={onHeightChange}></input></div>
                <div></div>
                <div><span>Width</span></div>
                <div><span>Height</span></div>
            </div>
            <div className={`ocd-arrangement-xy-positioning`}>
                <div><span>Position</span></div>
                <div><input type={'number'} min={0} value={left} onChange={onLeftChange}></input></div>
                <div><input type={'number'} min={0} value={top} onChange={onTopChange}></input></div>
                <div></div>
                <div><span>Left</span></div>
                <div><span>Top</span></div>
            </div>
        </div>
    )
}
const OcdResourceStyle = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedResource = ocdDocument.selectedResource
    console.debug('OcdProperties: Selected Resource', selectedResource)
    const page: OcdViewPage = ocdDocument.getActivePage()
    const coords = ocdDocument.getCoords(selectedResource.coordsId)
    const coordsStyle = (coords !== undefined && coords.style !== undefined ) ? coords.style : undefined
    // style.fill
    const coordsFill = (coordsStyle !== undefined && coordsStyle.fill !== undefined) ? coordsStyle.fill : undefined
    const fillChecked = (coordsFill !== undefined) as boolean
    const fill = coordsFill !== undefined ? coordsFill : 'rgba(170, 187, 204, 0.5)' //'#aabbcc'
    // style.stroke
    const coordsStroke = (coordsStyle !== undefined && coordsStyle.stroke !== undefined) ? coordsStyle.stroke : undefined
    const strokeChecked = (coordsStroke !== undefined) as boolean
    const stroke = coordsStroke !== undefined ? coordsStroke : 'rgba(170, 187, 204, 1)' //'#aabbcc'
    // style.strokeDasharray
    const coordsStrokeDasharray = (coordsStyle !== undefined && coordsStyle.strokeDasharray !== undefined) ? coordsStyle.strokeDasharray : undefined
    const strokeDasharray = coordsStrokeDasharray !== undefined ? coordsStrokeDasharray : 'default'
    // style.strokeWidth
    const coordsStrokeWidth = (coordsStyle !== undefined && coordsStyle.strokeWidth !== undefined) ? coordsStyle.strokeWidth : undefined
    const strokeWidth = coordsStrokeWidth !== undefined ? coordsStrokeWidth : 'default'

    const fillCheckedChanged = () => {
        console.debug('OcdProperties: fillCheckedChanged', fillChecked, coords)
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        // Need to not fill because it is currently the previous state
        if (!fillChecked) {
            // Fill Specified
            style.fill = fill
        } else {
            delete style.fill
        }
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const setFillColour = (colour: string) => {
        // const style = coords !== undefined && coords.style !== undefined ? JSON.parse(JSON.stringify(coords.style)) : {} as OcdViewCoordsStyle
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        style.fill = colour
        console.debug('OcdProperties: Colour - Fill', coords)
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const strokeCheckedChanged = () => {
        console.debug('OcdProperties: strokeCheckedChanged', strokeChecked, coords)
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        // Need to not stroke because it is currently the previous state
        if (!strokeChecked) {
            // Fill Specified
            style.stroke = stroke
        } else {
            delete style.stroke
            delete style.strokeDasharray
            delete style.strokeWidth
            delete style.strokeOpacity
        }
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const setStrokeColour = (colour: string) => {
        // const style = coords !== undefined && coords.style !== undefined ? JSON.parse(JSON.stringify(coords.style)) : {} as OcdViewCoordsStyle
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        style.stroke = colour
        console.debug('OcdProperties: Colour - Stroke', coords)
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onStrokeDashArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        if (e.currentTarget.value === 'default') {
            delete style.strokeDasharray
        } else {
            style.strokeDasharray = e.currentTarget.value
        }
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onStrokeWidthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const style = coordsStyle !== undefined ? JSON.parse(JSON.stringify(coordsStyle)) : {} as OcdViewCoordsStyle
        if (e.currentTarget.value === 'default') {
            delete style.strokeWidth
        } else {
            style.strokeWidth = e.currentTarget.value
        }
        if (coords) {ocdDocument.updateCoords({...coords, style: style}, page.id)}
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-style-panel`}>
            <div className={`ocd-style-fill`}>
                <div><input id='resourceStyleFill' type='checkbox' onChange={fillCheckedChanged} checked={fillChecked}/><span>Fill</span></div>
                {fillChecked && <div><OcdColourPicker colour={fill} setColour={setFillColour} /></div>}
                {!fillChecked && <div></div>}
            </div>
            <div className={`ocd-style-stroke`}>
                <div>
                    <input id='resourceStyleStroke' type='checkbox' onChange={strokeCheckedChanged} checked={strokeChecked}/><span>Line</span>
                </div>
                {strokeChecked && <div><OcdColourPicker colour={stroke} setColour={setStrokeColour} /></div>}
                {!strokeChecked && <div></div>}
                {strokeChecked && <div>
                    <div className='ocd-radio-buttons-vertical ocd-stroke-dasharray-radio'>
                        <label className='ocd-style-stroke-dasharray'><input type='radio' name='stroke-dasharray' value='default' checked={strokeDasharray === 'default'} onChange={onStrokeDashArrayChange}></input>Default Line</label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-none'><input type='radio' name='stroke-dasharray' value='none' checked={strokeDasharray === 'none'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-3-2'><input type='radio' name='stroke-dasharray' value='3,2' checked={strokeDasharray === '3,2'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-3-2-1'><input type='radio' name='stroke-dasharray' value='3,2,1' checked={strokeDasharray === '3,2,1'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-3-1-2-1'><input type='radio' name='stroke-dasharray' value='3,1,2,1' checked={strokeDasharray === '3,1,2,1'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-3-3'><input type='radio' name='stroke-dasharray' value='3,3' checked={strokeDasharray === '3,3'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-2-2'><input type='radio' name='stroke-dasharray' value='2,2' checked={strokeDasharray === '2,2'} onChange={onStrokeDashArrayChange}></input></label>
                        <label className='ocd-style-stroke-dasharray ocd-style-stroke-dasharray-1-1'><input type='radio' name='stroke-dasharray' value='1,1' checked={strokeDasharray === '1,1'} onChange={onStrokeDashArrayChange}></input></label>
                    </div>
                </div>}
                {strokeChecked && <div className='ocd-style-stroke-width'>
                    <select value={strokeWidth} onChange={onStrokeWidthChange}>
                        <option value={'default'}>Default Width</option>
                        <option value={'1'}>1pt</option>
                        <option value={'2'}>2pt</option>
                        <option value={'3'}>3pt</option>
                        <option value={'4'}>4pt</option>
                        <option value={'5'}>5pt</option>
                        <option value={'6'}>6pt</option>
                    </select>
                </div>}
            </div>
            <div className={`ocd-style-opacity`}></div>
        </div>
    )
}
const OcdLayerStyle = ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const page: OcdViewPage = ocdDocument.getActivePage()
    const layer = ocdDocument.getActiveLayer(page.id)
    const layerStyle = (layer !== undefined && layer.style !== undefined) ? layer.style : undefined
    const layerFill = (layerStyle !== undefined && layerStyle.fill !== undefined) ? layerStyle.fill : undefined
    const fillChecked = (layerFill !== undefined) as boolean
    const fill = layerFill !== undefined ? layerFill : 'rgba(170, 187, 204, 1)' //'#aabbcc'

    const fillCheckedChanged = () => {
        console.debug('OcdProperties: fillCheckedChanged', fillChecked, layer)
        const style = layerStyle !== undefined ? JSON.parse(JSON.stringify(layerStyle)) : {} as OcdViewCoordsStyle
        // Need to not fill because it is currently the previous state
        if (!fillChecked) {
            // Fill Specified
            style.fill = fill
        } else {
            delete style.fill
        }
        ocdDocument.updateLayerStyle(layer.id, style)
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const setFillColour = (colour: string) => {
        const style = layerStyle !== undefined ? JSON.parse(JSON.stringify(layerStyle)) : {} as OcdViewCoordsStyle
        style.fill = colour
        console.debug('OcdProperties: Colour - Layer', layer)
        ocdDocument.updateLayerStyle(layer.id, style)
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-style-panel`}>
            <div className={`ocd-style-fill`}>
                <div><input id='resourceStyleFill' type='checkbox' onChange={fillCheckedChanged} checked={fillChecked}/><span>Fill</span></div>
                {fillChecked && <div><OcdColourPicker colour={fill} setColour={setFillColour} /></div>}
            </div>
            {/* <div className={`ocd-style-stroke`}></div>
            <div className={`ocd-style-opacity`}></div> */}
        </div>
    )
}
const OcdColourPicker = ({colour, setColour}: DesignerColourPicker): JSX.Element => {
    console.debug('OcdProperties: Colour', colour)
    // const [rgbaColor, setRgbaColor] = useState({ r: 200, g: 150, b: 35, a: 0.5 })
    const [pickerOpen, setPickerOpen] = useState(false)
    const colourChanged = (colour: string) => {
        console.debug('OcdProperties: Colour Changed', colour)
        setColour(colour)
    }
    return (
        <div className='ocd-colour-picker'
            onMouseLeave={() => setPickerOpen(false)}>
            <div className='ocd-colour-picker-swatch'
                style={{ backgroundColor: colour }}
                onClick={() => setPickerOpen(!pickerOpen)} aria-hidden
            ></div>
            {pickerOpen && <div className='ocd-colour-picker-popup'>
                {/* <div><RgbaColorPicker color={rgbaColor} onChange={setRgbaColor} /></div> */}
                <div><RgbaStringColorPicker color={colour} onChange={colourChanged} /></div>
                {/* <div><HexColorPicker color={colour} onChange={colourChanged} /></div> */}
                {/* <div><HexColorInput color={colour} onChange={colourChanged} /></div> */}
            </div>}
        </div>
    )
}

const getResourceValidationResults = (ocdDocument: OcdDocument, selectedModelResource: OcdResource): OcdValidationResult[] => {
    const provider = selectedModelResource ? selectedModelResource.provider : ''
    switch (provider) {
        case 'azure': 
            return getAzureResourceValidationResults(ocdDocument, selectedModelResource)
        case 'google': 
            return getGoogleResourceValidationResults(ocdDocument, selectedModelResource)
        case 'oci': 
            return getOciResourceValidationResults(ocdDocument, selectedModelResource)
        default:
            return []
    }
}

const resourceValidationMethod = (selectedModelResource: OcdResource) => selectedModelResource ? `${OcdUtils.toTitleCase(selectedModelResource.provider)}${selectedModelResource.resourceType}` : ''

const getAzureResourceValidationResults = (ocdDocument: OcdDocument, selectedModelResource: OcdResource): OcdValidationResult[] => {
    const azureResources: AzureResources = ocdDocument.getAzureResourcesObject()
    // @ts-ignore 
    const ResourceValidation = AzureResourceValidation[resourceValidationMethod(selectedModelResource)]
    const validationResults = ResourceValidation ? ResourceValidation.validateResource(selectedModelResource, azureResources) : []
    return validationResults
}

const getGoogleResourceValidationResults = (ocdDocument: OcdDocument, selectedModelResource: OcdResource): OcdValidationResult[] => {
    const googleResources: GoogleResources = ocdDocument.getGoogleResourcesObject()
    // @ts-ignore 
    const ResourceValidation = GoogleResourceValidation[resourceValidationMethod(selectedModelResource)]
    const validationResults = ResourceValidation ? ResourceValidation.validateResource(selectedModelResource, googleResources) : []
    return validationResults
}

const getOciResourceValidationResults = (ocdDocument: OcdDocument, selectedModelResource: OcdResource): OcdValidationResult[] => {
    const ociResources: OciResources = ocdDocument.getOciResourcesObject()
    // @ts-ignore 
    const ResourceValidation = OciResourceValidation[resourceValidationMethod(selectedModelResource)]
    const validationResults = ResourceValidation ? ResourceValidation.validateResource(selectedModelResource, ociResources) : []
    return validationResults
}

const OcdResourceValidation =  ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedModelResource: OcdResource = ocdDocument.getSelectedResource()
    const validationResults = getResourceValidationResults(ocdDocument, selectedModelResource)
    const errors = validationResults.filter((v: OcdValidationResult) => v.type === 'error')
    const warnings = validationResults.filter((v: OcdValidationResult) => v.type === 'warning')
    const information = validationResults.filter((v: OcdValidationResult) => v.type === 'information')
    console.debug('OcdProperties: OcdResourceValidation', validationResults)
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-validation-panel ocd-validation-results`}>
            <details className='ocd-details' open={errors.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Errors (${errors.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {errors.map((r: OcdValidationResult) => {
                        return <OcdResourceValidationResult
                                    result={r}
                                    resource={selectedModelResource}
                                    key={`${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                        />
                    })}
                </div>
            </details>
            <details className='ocd-details' open={warnings.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Warning (${warnings.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {warnings.map((r: OcdValidationResult) => {
                            return <OcdResourceValidationResult
                                        result={r}
                                        resource={selectedModelResource}
                                        key={`${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                            />
                        })}
                </div>
            </details>
            <details className='ocd-details' open={information.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Information (${information.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {information.map((r: OcdValidationResult) => {
                            return <OcdResourceValidationResult
                                        result={r}
                                        resource={selectedModelResource}
                                        key={`${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                            />
                        })}
                </div>
            </details>
        </div>
    )
}
const OcdResourceValidationResult = ({result, resource}: DesignerResourceValidationResult): JSX.Element => {
    console.debug('OcdProperties: Validation Error', result, resource)
    let resultClassName = ''
    switch (result.type) {
        case 'error':
            resultClassName = 'ocd-validation-error-result'
            break;
        case 'warning':
            resultClassName = 'ocd-validation-warning-result'
            break;
        case 'information':
            resultClassName = 'ocd-validation-information-result'
            break;
    }
    return (
        <div className='ocd-validation-result'>
            <div className={resultClassName}>
                <div className={`ocd-validation-result-title ${result.class}`}>{result.title}</div>
                <div className='ocd-validation-message'>{result.message}</div>
            </div>
        </div>
    )
}

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