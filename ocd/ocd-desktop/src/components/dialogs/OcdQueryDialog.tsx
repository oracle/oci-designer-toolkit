/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { CompartmentPickerProps, QueryDialogProps } from "../../types/Dialogs"
import { OciApiFacade } from "../../facade/OciApiFacade"
import { useState } from "react"
import { OciCompartment } from "../../model/provider/oci/resources"

export const OcdQueryDialog = ({ocdDocument, setOcdDocument}: QueryDialogProps): JSX.Element => {
    const loadingState = '......Reading OCI Config'
    const regionsLoading = {id: 'Select Valid Profile', displayName: 'Select Valid Profile'}
    const className = `ocd-query-dialog`
    const [profiles, setProfiles] = useState([loadingState])
    const [profilesLoaded, setProfilesLoaded] = useState(false)
    const [regions, setRegions] = useState([regionsLoading])
    const [compartments, setCompartments] = useState([])
    const [selectedRegion, setSelectedRegion] = useState('')
    const [selectedCompartmentIds, setSelectedCompartmentIds] = useState([])
    if (!profilesLoaded) OciApiFacade.loadOCIConfigProfiles().then((results) => {
        setProfilesLoaded(true)
        setProfiles(results)
        loadRegions(results.length ? results[0] : [regionsLoading])
        loadCompartments(results.length ? results[0] : [])
    }).catch((reason) => {
        setProfilesLoaded(true)
        setProfiles(['Failed to Read Profiles Fron OCI Config'])
    })
    const onProfileChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const profile = e.target.value
        console.debug('OcdQueryDialog: Selected Profile', profile)
        loadRegions(profile)
        loadCompartments(profile)
    }
    const onRegionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRegion(e.target.value)
    }
    const loadRegions = (profile: string) => {
        console.debug('OciQueryDialog: loadRegions: Profile', profile)
        OciApiFacade.listRegions(profile).then((results) => {
            setRegions(results)
        }).catch((reason) => {
            setRegions([regionsLoading])
        })
    }
    const loadCompartments = (profile: string) => {
        console.debug('OciQueryDialog: loadCompartments: Profile', profile)
        OciApiFacade.listTenancyCompartments(profile).then((results) => {
            console.debug('OcdQueryDialog: Compartments', results)
            setCompartments(results)
        }).catch((reason) => {
            setCompartments([])
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
                        <div>Region</div><div>
                            <select onChange={onRegionChanged}>
                                {regions.map((r) => {return <option key={r.id} value={r.displayName}>{r.displayName}</option>})}
                            </select>
                        </div>
                        <div>Compartments</div><div>
                            <div className="ocd-compartment-picker">
                                <CompartmentPicker 
                                    compartments={compartments} 
                                    selectedCompartmentIds={selectedCompartmentIds}
                                    setSelectedCompartmentIds={setSelectedCompartmentIds}
                                    root={true}
                                    parentId={''}
                                />
                            </div>
                        </div>
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

const CompartmentPicker = ({compartments, selectedCompartmentIds, setSelectedCompartmentIds, root, parentId}: CompartmentPickerProps): JSX.Element => {
    const filter = root ? (c: OciCompartment) => c.root : (c: OciCompartment) => c.compartmentId = parentId
    return (
        <ul>
            {compartments.filter(filter).map((c) => {
                return <li key={c.id}><label><input type="checkbox"></input>{c.name}</label></li>
            })}
        </ul>
    )
}
