/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdDesign, OciDefinedTag, OciFreeformTag } from "@ocd/model"
import { ConsolePageProps } from "../types/Console"
import { OcdVariableRowProps, OciDefinedTagRowProps, OciFreeformTagRowProps } from "../types/ReactComponentProperties"
import { OcdDocument } from "../components/OcdDocument"

const OcdCommonTags = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const onOciDefinedTagDeleteClick = ((key: string) => {
        console.debug('OcdCommonTags: Deleting Defined Row', key, ocdDocument)
        const clone = OcdDocument.clone(ocdDocument)
        if (clone.design.model.oci.tags.defined) {
            clone.design.model.oci.tags.defined = clone.design.model.oci.tags.defined.filter((v) => v.key !== key)
            setOcdDocument(clone)
        }
    })
    const onOciDefinedTagAddClick = (() => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.design.model.oci.tags.defined ? clone.design.model.oci.tags.defined.push(OcdDesign.newOciDefinedTag()) : clone.design.model.oci.tags.defined = [OcdDesign.newOciDefinedTag()]
        setOcdDocument(clone)
    })
    const onOciFreeformTagDeleteClick = ((key: string) => {
        console.debug('OcdCommonTags: Deleting Freeform Row', key, ocdDocument)
        const clone = OcdDocument.clone(ocdDocument)
        if (clone.design.model.oci.tags.freeform) {
            clone.design.model.oci.tags.freeform = clone.design.model.oci.tags.freeform.filter((v) => v.key !== key)
            setOcdDocument(clone)
        }
    })
    const onOciFreeformTagAddClick = (() => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.design.model.oci.tags.freeform ? clone.design.model.oci.tags.freeform.push(OcdDesign.newOciFreeformTag()) : clone.design.model.oci.tags.freeform = [OcdDesign.newOciFreeformTag()]
        setOcdDocument(clone)
    })
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
                                        <div className='th action-button-background add-property' onClick={onOciFreeformTagAddClick}></div>
                                    </div>
                                </div>
                                <div className='tbody ocd-tags-list-body'>
                                    {ocdDocument.design.model.oci.tags.freeform && ocdDocument.design.model.oci.tags.freeform.sort((a, b) => a.key.localeCompare(b.key)).map((v: OciFreeformTag, i) => {
                                        return <OciFreeformTagRow 
                                            ocdDocument={ocdDocument}
                                            setOcdDocument={setOcdDocument}
                                            tag={v}
                                            onDeleteClick={() => onOciFreeformTagDeleteClick(v.key)}
                                            key={`${v.id}`}
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
                                        <div className='th action-button-background add-property' onClick={onOciDefinedTagAddClick}></div>
                                    </div>
                                </div>
                                <div className='tbody ocd-tags-list-body'>
                                    {ocdDocument.design.model.oci.tags.defined && ocdDocument.design.model.oci.tags.defined.map((v: OciDefinedTag, i) => {
                                        return <OciDefinedTagRow 
                                            ocdDocument={ocdDocument}
                                            setOcdDocument={setOcdDocument}
                                            tag={v}
                                            onDeleteClick={() => onOciDefinedTagDeleteClick(v.key)}
                                            key={`${v.id}`}
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

const OciDefinedTagRow = ({ocdDocument, setOcdDocument, tag, onDeleteClick}: OciDefinedTagRowProps): JSX.Element => {
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {tag.key = e.target.value}
    const onNamespaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        tag.namespace = e.target.value
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        tag.key = e.target.value
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        tag.value = e.target.value
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    return (
        <div className='ocd-tag-row tr'>
            <div className='td'><input type='text' placeholder='Namespace' value={tag.namespace} onChange={onNamespaceChange}></input></div>
            <div className='td'><input type='text' placeholder='Key' value={tag.key} onChange={onKeyChange}></input></div>
            <div className='td'><input type='text' placeholder='Value' value={tag.value} onChange={onValueChange}></input></div>
            <div className='td action-button-background delete-property' onClick={onDeleteClick}></div>
        </div>
    )
}

const OciFreeformTagRow = ({ocdDocument, setOcdDocument, tag, onDeleteClick}: OciFreeformTagRowProps): JSX.Element => {
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {tag.key = e.target.value}
    const onKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        tag.key = e.target.value
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        tag.value = e.target.value
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    return (
        <div className='ocd-tag-row tr'>
            <div className='td'><input type='text' placeholder='Name' value={tag.key} onChange={onKeyChange}></input></div>
            <div className='td'><input type='text' placeholder='Value' value={tag.value} onChange={onValueChange}></input></div>
            <div className='td action-button-background delete-property' onClick={onDeleteClick}></div>
        </div>
    )
}

export default OcdCommonTags