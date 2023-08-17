/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { CompartmentPickerProps, QueryDialogProps } from "../../types/Dialogs"
import { OciApiFacade } from "../../facade/OciApiFacade"
import { useState } from "react"
import { OciCompartment } from "../../model/provider/oci/resources"
import OcdDocument from "../OcdDocument"

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
        setSelectedCompartmentIds([])
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
    const onClickCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.query = !ocdDocument.query
        setOcdDocument(clone)
}
    const onClickQuery = (e: React.MouseEvent<HTMLButtonElement>) => {
        console.debug('OcdQueryDialog: Selected Compartments', selectedCompartmentIds)
        const clone = OcdDocument.clone(ocdDocument)
        clone.query = !ocdDocument.query
        setOcdDocument(clone)
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
                        <div className="ocd-dialog-button ocd-dialog-cancel-button"><button onClick={onClickCancel}>Cancel</button></div>
                        <div className="ocd-dialog-button ocd-dialog-cancel-button"><button onClick={onClickQuery}>Query</button></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const CompartmentPicker = ({compartments, selectedCompartmentIds, setSelectedCompartmentIds, root, parentId}: CompartmentPickerProps): JSX.Element => {
    const filter = root ? (c: OciCompartment) => c.root : (c: OciCompartment) => c.compartmentId === parentId
    const filteredCompartments = compartments.filter(filter)
    console.debug('OcdQueryDialog:', root, parentId, filteredCompartments)
    const onChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const selected = e.target.checked
        console.debug('OcdQueryDialog: Selected', selected)
        const compartmentIds = selected ? [...selectedCompartmentIds, id] : selectedCompartmentIds.filter((i) => i !== id)
        setSelectedCompartmentIds(compartmentIds)
    }
    return (
        <ul>
            {filteredCompartments.length > 0 && filteredCompartments.map((c) => {
                return <li key={c.id}>
                            <label><input type="checkbox" checked={selectedCompartmentIds.includes(c.id)} onChange={(e) => onChange(e, c.id)}></input>{c.name}</label>
                            {compartments.filter((cc) => cc.compartmentId === c.id).length > 0 && <CompartmentPicker 
                                compartments={compartments} 
                                selectedCompartmentIds={selectedCompartmentIds}
                                setSelectedCompartmentIds={setSelectedCompartmentIds}
                                root={false}
                                parentId={c.id}
                            />}
                    </li>
            })}
        </ul>
    )
}
