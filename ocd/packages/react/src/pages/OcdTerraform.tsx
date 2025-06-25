/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useEffect, useRef, useState } from "react"
import { ConsolePageProps } from "../types/Console"
import { OcdTerraformExporter } from "@ocd/export"
import { OcdDesignFacade } from "../facade/OcdDesignFacade"
import { OcdDocument } from "../components/OcdDocument"

const OcdTerraform = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const design = ocdDocument.design
    const separateIdentity = design.metadata.separateIdentity
    const [selected, setSelected] = useState(separateIdentity ? 'identity/oci_provider.tf' : 'oci_provider.tf')
    const ocdExporter = new OcdTerraformExporter()
    const terraform = ocdExporter.export(ocdDocument.design)
    const onClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        // @ts-ignore
        const selectedTab = e.target.id
        setSelected(selectedTab)
    }
    useEffect(() => {setSelected(separateIdentity ? 'identity/oci_provider.tf' : 'oci_provider.tf')}, [separateIdentity])
    const selectedTerraform = terraform[selected]
    // console.debug('OcdTerraform:', terraform)
    return (
        <div className='ocd-terraform-view'>
            <div id='terraform_files' className='ocd-designer-canvas-layers'>
                {Object.keys(terraform).map((k: string) => {
                    return <div className={`ocd-designer-canvas-layer ${k === selected ? 'ocd-layer-selected' : ''}`} key={k}><label id={k} onClick={onClick} aria-hidden>{k}</label></div>
                })}
            </div>
            <div id='selected_terraform_file' className="ocd-selected-terraform-content"><pre>{selectedTerraform}</pre></div>
        </div>
    )
}

export const OcdTerraformLeftToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    // const {ocdConsoleConfig, setOcdConsoleConfig} = useContext(ConsoleConfigContext)
    const cbRef = useRef<HTMLInputElement>(null)
    const onChangeSeparateIdentity = () => {
        ocdDocument.design.metadata.separateIdentity = !ocdDocument.design.metadata.separateIdentity
        setOcdDocument(OcdDocument.clone(ocdDocument))
    }
    const onClickTerraform = () => {
        console.debug('OcdTerraform: Export to OpenTofu (Terraform)')
        const design = ocdDocument.design
        OcdDesignFacade.exportToTerraform(design, `design.xlsx`).then((results) => {
            console.debug('Exported to Terraform')
        }).catch((error) => {
            console.warn('Export To Terraform Failed with', error)
            alert(error)
        })
    }
    return (
        <div className='ocd-designer-toolbar'>
            <div className='ocd-console-toolbar-icon opentofu  ocd-toolbar-separator-right' title='Export to OpenTofu (Terraform)' onClick={onClickTerraform} aria-hidden></div>
            <div className='ocd-console-toolbar-checkbox'><label><input id='separateIdentity' type='checkbox' onChange={onChangeSeparateIdentity} ref={cbRef} checked={ocdDocument.design.metadata.separateIdentity}/>Separate Identity Resources</label></div>            
        </div>
    )
}

export const OcdTerraformRightToolbar = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    return (
        <div className='ocd-designer-toolbar'></div>
    )
}

export default OcdTerraform