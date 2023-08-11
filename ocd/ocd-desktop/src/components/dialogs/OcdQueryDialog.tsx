/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { useContext } from "react"
import { QueryDialogProps } from "../../types/Dialogs"
import { OciConfigContext } from "../../pages/OcdConsole"
// import { ConfigFileReader } from 'oci-common'
import { OcdQuery } from "../../query/OcdQuery"

export const OcdQueryDialog = ({ocdDocument, setOcdDocument}: QueryDialogProps): JSX.Element => {
    const ociConfig = useContext(OciConfigContext)
    const className = `ocd-query-dialog`
    let configFile: any = null
    console.debug('OcdQueryDialog: Config', ociConfig)
    let profiles: string[] = ['OCI Config Import Required']
    // if (ociConfig && ociConfig.trim() !== '') {
    //     const parsed = ConfigFileReader.parse(ociConfig, null)
    //     console.debug('OcdQueryDialog:', parsed)
    //     console.debug('OcdQueryDialog:', parsed.accumulator.configurationsByProfile)
    //     console.debug('OcdQueryDialog:', Array.from(parsed.accumulator.configurationsByProfile.keys()))    
    //     console.debug('OcdQueryDialog:', parsed.accumulator.configurationsByProfile.get('DEFAULT'))    
    //     profiles = Array.from(parsed.accumulator.configurationsByProfile.keys())
    //     configFile = parsed
    // }
    const onProfileChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const profile = e.target.value
        console.debug('OcdQueryDialog: Selected Profile', profile)
        const provider = OcdQuery.getOciProvider(configFile, profile)
        console.debug('OcdQueryDialog: Provider', provider)
        const regionsQuery = OcdQuery.getRegions()
        Promise.allSettled([regionsQuery]).then((results) => {
            console.info('OcdQueryDialog:', results)
        })
    }
    return (
        <div className={className}>
            <div>
                <div className='ocd-dialog-title'>Query</div>
                <div className='ocd-dialog-body'>
                    <div>
                        <div>Profile</div><div>
                            <select onChange={onProfileChanged}>
                                {profiles.map((p) => {return <option key={p} value={p}>{p}</option>})}
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