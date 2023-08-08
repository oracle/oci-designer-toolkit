/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { useContext } from "react"
import { QueryDialogProps } from "../../types/Dialogs"
import { OciConfigContext } from "../../pages/OcdConsole"
// import { ConfigFileReader } from 'oci-common'

export const OcdQueryDialog = ({ocdDocument, setOcdDocument}: QueryDialogProps): JSX.Element => {
    const ociConfig = useContext(OciConfigContext)
    const className = `ocd-query-dialog`
    console.debug('OcdQueryDialog: Config', ociConfig)
    let profiles: string[] = ['DEFAULT', 'OCI Config Import Required']
    // if (ociConfig && ociConfig.trim() !== '') {
    //     const parsed = ConfigFileReader.parse(ociConfig, null)
    //     console.info(parsed)
    //     console.info(parsed.accumulator.configurationsByProfile)
    //     console.info(Array.from(parsed.accumulator.configurationsByProfile.keys()))    
    //     profiles = Array.from(parsed.accumulator.configurationsByProfile.keys())
    // }
    return (
        <div className={className}>
            <div>
                <div className='ocd-dialog-title'>Query</div>
                <div className='ocd-dialog-body'>
                    <div>
                        <div>Profile</div><div>
                            <select>
                                {profiles.map((p) => {return <option>{p}</option>})}
                            </select>
                        </div>
                        <div>Region</div><div></div>
                        <div>Compartments</div><div></div>
                    </div>
                </div>
                <div className='ocd-dialog-footer'>
                    <div>
                        <div><button>Cancel</button></div>
                        <div><button>Query</button></div>
                    </div>
                </div>
            </div>
        </div>
    )
}