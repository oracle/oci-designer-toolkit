/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdDesign, OcdVariable } from "@ocd/model"
import { ConsolePageProps } from "../types/Console"
import { OcdVariableRowProps } from "../types/ReactComponentProperties"
import { OcdDocument } from "../components/OcdDocument"

const OcdVariables = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const onOciDeleteClick = ((key: string) => {
        console.debug('OcdVariables: Deleting Row', key, ocdDocument)
        const clone = OcdDocument.clone(ocdDocument)
        clone.design.model.oci.vars = clone.design.model.oci.vars.filter((v) => v.key !== key)
        setOcdDocument(clone)
    })
    const onOciAddClick = (() => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.design.model.oci.vars.push(OcdDesign.newVariable())
        setOcdDocument(clone)
    })
    return (
        <div className='ocd-variables-view'>
            <details className='ocd-details' open={true}>
                <summary className='summary-background'><label>OCI Variables</label></summary>
                <div className='ocd-details-body'>
                    <div className='table ocd-variables-table'>
                        <div className='thead ocd-variables-list-header'>
                            <div className='tr'>
                                <div className='th'>Name</div>
                                <div className='th'>Default</div>
                                <div className='th'>Description</div>
                                <div className='th action-button-background add-property' onClick={onOciAddClick}></div>
                            </div>
                        </div>
                        <div className='tbody ocd-variables-list-body'>
                            {ocdDocument.design.model.oci.vars.map((v: OcdVariable, i) => {
                                return <OcdVariableRow 
                                    ocdDocument={ocdDocument}
                                    setOcdDocument={setOcdDocument}
                                    variable={v}
                                    onDeleteClick={() => onOciDeleteClick(v.key)}
                                    key={`${v.key}`}
                                />
                            })}
                        </div>
                    </div>
                </div>
            </details>
        </div>
    )
}

const OcdVariableRow = ({ocdDocument, setOcdDocument, variable, onDeleteClick}: OcdVariableRowProps): JSX.Element => {
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {variable.key = e.target.value}
    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        variable.name = e.target.value
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        variable.default = e.target.value
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    const onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        variable.description = e.target.value
        const clone = OcdDocument.clone(ocdDocument)
        setOcdDocument(clone)
    }
    return (
        <div className='ocd-variable-row tr'>
            <div className='td'><input type='text' placeholder='Name' value={variable.name} onChange={onNameChange}></input></div>
            <div className='td'><input type='text' placeholder='Default Value' value={variable.default} onChange={onDefaultChange}></input></div>
            <div className='td'><input type='text' placeholder='Description' value={variable.description} onChange={onDescriptionChange}></input></div>
            <div className='td action-button-background delete-property' onClick={onDeleteClick}></div>
        </div>
    )
}

export default OcdVariables