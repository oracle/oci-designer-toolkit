/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from "react"
import { ConsolePageProps } from "../types/Console"
import { OcdTerraformExporter } from "@ocd/export"

const OcdTerraform = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const [selected, setSelected] = useState('oci_provider.tf')
    const ocdExporter = new OcdTerraformExporter()
    const terraform = ocdExporter.export(ocdDocument.design)
    const onClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        // @ts-ignore
        const selectedTab = e.target.id
        setSelected(selectedTab)
    }
    const selectedTerraform = terraform[selected]
    console.debug('OcdTerraform:', terraform)
    return (
        <div className='ocd-terraform-view'>
            <div id='terraform_files' className='ocd-designer-canvas-layers'>
                {Object.keys(terraform).map((k: string) => {
                    return <div className={`ocd-designer-canvas-layer ${k === selected ? 'ocd-layer-selected' : ''}`} key={k}><label id={k} onClick={onClick}>{k}</label></div>
                })}
            </div>
            <div id='selected_terraform_file' className="ocd-selected-terraform-content"><pre>{selectedTerraform}</pre></div>
        </div>
    )
}

export default OcdTerraform