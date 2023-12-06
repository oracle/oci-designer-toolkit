/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { CompartmentPickerProps, QueryDialogProps } from "../../types/Dialogs"
import { OciApiFacade } from "../../facade/OciApiFacade"
import { useContext, useState } from "react"
// import { OciCompartment } from "../../model/provider/oci/resources"
import { OciModelResources } from '@ocd/model'
import OcdDocument from "../OcdDocument"
import { OcdUtils } from '@ocd/core'
import { ActiveFileContext } from "../../pages/OcdConsole"

export const OcdQueryDialog = ({ocdDocument, setOcdDocument}: QueryDialogProps): JSX.Element => {
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const loadingState = '......Reading OCI Config'
    const regionsLoading = {id: 'Select Valid Profile', displayName: 'Select Valid Profile'}
    const className = `ocd-query-dialog`
    const [profiles, setProfiles] = useState([loadingState])
    const [profilesLoaded, setProfilesLoaded] = useState(false)
    const [regions, setRegions] = useState([regionsLoading])
    const [compartments, setCompartments] = useState([])
    const [selectedProfile, setSelectedProfile] = useState('DEFAULT')
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
        setSelectedProfile(profile)
        loadRegions(profile)
        loadCompartments(profile)
        setSelectedCompartmentIds([])
    }
    const onRegionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.debug('OcdQueryDialog: Selected Region', e.target.value)
        setSelectedRegion(e.target.value)
    }
    const loadRegions = (profile: string) => {
        console.debug('OciQueryDialog: loadRegions: Profile', profile)
        OciApiFacade.listRegions(profile).then((results) => {
            setRegions(results)
            const homeRegion = results.find((r: Record<string, any>) => r.isHomeRegion)
            setSelectedRegion(homeRegion ? homeRegion.id : results[0].id)
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
        OciApiFacade.queryTenancy(selectedProfile, selectedCompartmentIds, selectedRegion).then((results) => {
            console.debug('OcdQueryDialog: Query Tenancy', results)
            const clone = OcdDocument.clone(ocdDocument)
            const design = clone.newDesign()
            design.metadata.title = 'Queried Cloud Design'
            design.view.pages[0].title = selectedRegion
            // Copy Result information Across to design
            const resultsOciResources = results.model.oci.resources
            Object.entries(resultsOciResources).forEach(([key, value]) => {
                const namespace = `Oci${OcdUtils.toResourceType(key)}`
                // @ts-ignore
                console.debug('OcdQueryDialog: Namespace:', namespace, OciModelResources[namespace])
                // @ts-ignore
                if(OciModelResources[namespace]) design.model.oci.resources[key] = value.map((v) => {return {...OciModelResources[namespace].newResource(), ...v, locked: true, readOnly: true}})
            })
            design.view.pages[0].layers = []
            clone.design = design
            // Add Layers
            resultsOciResources.compartment.forEach((c: OciModelResources.OciCompartment, i: number) => clone.addLayer(c.id, i === 0))
            clone.query = !ocdDocument.query
            // Auto Arrange
            clone.autoLayout(clone.getActivePage().id)
            setOcdDocument(clone)
            setActiveFile({name: '', modified: false})
        })
    }
   
    return (
        <div className={className}>
            <div>
                <div className='ocd-dialog-title'>Query</div>
                <div className='ocd-dialog-body'>
                    <div>
                        <div>Profile</div><div>
                            <select onChange={onProfileChanged} value={selectedProfile}>
                                {profiles.map((p) => {return <option key={p} value={p}>{p}</option>})}
                            </select>
                        </div>
                        <div>Region</div><div>
                            <select onChange={onRegionChanged} value={selectedRegion}>
                                {regions.map((r) => {return <option key={r.id} value={r.id}>{r.displayName}</option>})}
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
    const filter = root ? (c: OciModelResources.OciCompartment) => c.root : (c: OciModelResources.OciCompartment) => c.compartmentId === parentId
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
