/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdDesign, OciDefinedTag, OciFreeformTag } from "@ocd/model"
import { ConsolePageProps } from "../types/Console"
import { OcdVariableRowProps, OciDefinedTagRowProps, OciFreeformTagRowProps } from "../types/ReactComponentProperties"
import { OcdDocument } from "../components/OcdDocument"
import { useState } from "react"

export const OcdCommonTags = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const [freeformTags, setFreeformTags] = useState(OcdDesign.ociFreeformTagsToArray(ocdDocument.design.model.oci.tags.freeformTags))
    const [definedTags, setDefinedTags] = useState(OcdDesign.ociDefinedTagsToArray(ocdDocument.design.model.oci.tags.definedTags))
    const onOciDefinedTagDeleteClick = ((namespace:string, key: string) => {
        console.debug('OcdCommonTags: Deleting Defined Row', key, ocdDocument, definedTags)
        const namespaceKey = `${namespace}.${key}`
        const updatedTags = definedTags.filter((t) => `${t.namespace}.${t.key}` !== namespaceKey)
        console.debug('OcdCommonTags: Deleting Defined Row', namespaceKey, updatedTags)
        setDefinedTags(updatedTags)
        updateDefinedTags(updatedTags)
        // const clone = OcdDocument.clone(ocdDocument)
        // if (clone.design.model.oci.tags.defined) {
        //     clone.design.model.oci.tags.defined = clone.design.model.oci.tags.defined.filter((v) => v.key !== key)
        //     setOcdDocument(clone)
        // }
    })
    const onOciDefinedTagAddClick = (() => {
        const newTag = OcdDesign.newOciDefinedTag()
        const updatedTags = [...definedTags, newTag]
        console.debug('OcdCommonTags: Adding Oci Defined Tag', newTag, updatedTags)
        setDefinedTags(updatedTags)
        updateDefinedTags(updatedTags)
    // const clone = OcdDocument.clone(ocdDocument)
        // clone.design.model.oci.tags.defined ? clone.design.model.oci.tags.defined.push(OcdDesign.newOciDefinedTag()) : clone.design.model.oci.tags.defined = [OcdDesign.newOciDefinedTag()]
        // setOcdDocument(clone)
    })
    const onOciDefinedNamespaceChange = ((oldNamespace: string, newNamespace: string, key: string) => {
        const tag = definedTags.find((t) => t.namespace === oldNamespace && t.key === key)
        if (tag) {
            tag.namespace = newNamespace
            // setDefinedTags([...definedTags])
            updateDefinedTags(definedTags)
        }
    })
    const onOciDefinedKeyChange = ((namespace: string, oldKey: string, newKey: string) => {
        const tag = definedTags.find((t) => t.namespace === namespace && t.key === oldKey)
        if (tag) {
            tag.key = newKey
            // setDefinedTags([...definedTags])
            updateDefinedTags(definedTags)
        }
    })
    const onOciDefinedValueChange = ((namespace: string, key: string, value: string) => {
        const tag = definedTags.find((t) => t.namespace === namespace && t.key === key)
        if (tag) {
            tag.value = value
            // setDefinedTags([...definedTags])
            updateDefinedTags(definedTags)
        }
    })
    const updateDefinedTags = (tags: OciDefinedTag[]) => ocdDocument.design.model.oci.tags.definedTags = OcdDesign.ociDefinedTagArrayToTags(tags)
    const onOciFreeformTagDeleteClick = ((key: string) => {
        console.debug('OcdCommonTags: Deleting Freeform Row', key, ocdDocument)
        const updatedTags = freeformTags.filter((v) => v.key !== key)
        setFreeformTags(updatedTags)
        updateFreeformTags(updatedTags)
        // const clone = OcdDocument.clone(ocdDocument)
        // if (clone.design.model.oci.tags.freeform) {
        //     clone.design.model.oci.tags.freeform = clone.design.model.oci.tags.freeform.filter((v) => v.key !== key)
        //     setOcdDocument(clone)
        // }
    })
    const onOciFreeformTagAddClick = (() => {
        const newTag = OcdDesign.newOciFreeformTag()
        const updatedTags = [...freeformTags, newTag]
        console.debug('OcdCommonTags: Adding Oci Freeform Tag', newTag, updatedTags)
        updateFreeformTags(updatedTags)
        setFreeformTags(updatedTags)
        // const clone = OcdDocument.clone(ocdDocument)
        // clone.design.model.oci.tags.freeform ? clone.design.model.oci.tags.freeform.push(OcdDesign.newOciFreeformTag()) : clone.design.model.oci.tags.freeform = [OcdDesign.newOciFreeformTag()]
        // setOcdDocument(clone)
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
    const updateFreeformTags = (tags: OciFreeformTag[]) => ocdDocument.design.model.oci.tags.freeformTags = OcdDesign.ociFreeformTagArrayToTags(tags)
    return (
        <div className='ocd-common-tags-view'>
            <details className='ocd-details' open={true}>
                <summary className='summary-background'><label>OCI Common Tags</label></summary>
                <div className='ocd-details-body'>
                    <details className='ocd-details' open={true}>
                        <summary className='summary-background'><label>Freeform Tags</label></summary>
                        <div className='ocd-details-body'>
                            <div className='table ocd-tags-table'>
                                <div className='thead ocd-tags-list-header'>
                                    <div className='tr'>
                                        <div className='th'>Key</div>
                                        <div className='th'>Value</div>
                                        <div className='th action-button-background add-property' onClick={onOciFreeformTagAddClick} aria-hidden></div>
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
                                        <div className='th action-button-background add-property' onClick={onOciDefinedTagAddClick} aria-hidden></div>
                                    </div>
                                </div>
                                <div className='tbody ocd-tags-list-body'>
                                    {definedTags.sort((a, b) => `${a.namespace}.${a.key}`.localeCompare(`${b.namespace}.${b.key}`)).map((v: OciDefinedTag, i) => {
                                        return <OciDefinedTagRow 
                                            ocdDocument={ocdDocument}
                                            setOcdDocument={setOcdDocument}
                                            tag={v}
                                            onDeleteClick={() => onOciDefinedTagDeleteClick(v.namespace, v.key)}
                                            onDefinedNamespaceChange={onOciDefinedNamespaceChange}
                                            onDefinedKeyChange={onOciDefinedKeyChange}
                                            onDefinedValueChange={onOciDefinedValueChange}
                                            key={`${v.namespace}.${v.key}`}
                                        />
                                    })}
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </details>
        </div>
    )
}

export const OciDefinedTagRow = ({ocdDocument, setOcdDocument, tag, onDeleteClick, onDefinedNamespaceChange, onDefinedKeyChange, onDefinedValueChange}: OciDefinedTagRowProps): JSX.Element => {
    const [namespace, setNamespace] = useState(tag.namespace)
    const [key, setKey] = useState(tag.key)
    const [value, setValue] = useState(tag.value)
    const onNamespaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDefinedNamespaceChange(namespace, e.target.value, key)
        setNamespace(e.target.value)
    }
    const onKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDefinedKeyChange(namespace, key, e.target.value)
        setKey(e.target.value)
    }
    const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDefinedValueChange(namespace, key, e.target.value)
        setValue(e.target.value)
    }
    return (
        <div className='ocd-tag-row tr'>
            <div className='td'><input type='text' placeholder='Namespace' value={namespace} onChange={onNamespaceChange}></input></div>
            <div className='td'><input type='text' placeholder='Key' value={key} onChange={onKeyChange}></input></div>
            <div className='td'><input type='text' placeholder='Value' value={value} onChange={onValueChange}></input></div>
            <div className='td action-button-background delete-property' onClick={onDeleteClick} aria-hidden></div>
        </div>
    )
}

export const OciFreeformTagRow = ({ocdDocument, setOcdDocument, tag, onDeleteClick, onFreeformKeyChange, onFreeformValueChange}: OciFreeformTagRowProps): JSX.Element => {
    const [key, setKey] = useState(tag.key)
    const [value, setValue] = useState(tag.value)
    const onKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFreeformKeyChange(key, e.target.value)
        setKey(e.target.value)
    }
    const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFreeformValueChange(key, e.target.value)
        setValue(e.target.value)
    }
    return (
        <div className='ocd-tag-row tr'>
            <div className='td'><input type='text' placeholder='Name' value={key} onChange={onKeyChange}></input></div>
            <div className='td'><input type='text' placeholder='Value' value={value} onChange={onValueChange}></input></div>
            <div className='td action-button-background delete-property' onClick={onDeleteClick} aria-hidden></div>
        </div>
    )
}

export default OcdCommonTags