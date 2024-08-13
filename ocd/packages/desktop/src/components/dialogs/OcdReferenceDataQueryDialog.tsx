/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { CompartmentPickerProps, QueryDialogProps } from "../../types/Dialogs"
import { OciApiFacade } from "../../facade/OciApiFacade"
import { useContext, useState } from "react"
// import { OciCompartment } from "../../model/provider/oci/resources"
import { OciModelResources } from '@ocd/model'
import { OcdDocument } from "../OcdDocument"
import { OcdUtils } from '@ocd/core'
import { ActiveFileContext, CacheContext, ConsoleConfigContext } from "../../pages/OcdConsole"
import React from "react"
import OcdConsoleConfig from "../OcdConsoleConfiguration"
import { OcdCacheData } from "../OcdCache"

export const OcdReferenceDataQueryDialog = ({ocdDocument, setOcdDocument}: QueryDialogProps): JSX.Element => {
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const {ocdConsoleConfig, setOcdConsoleConfig} = useContext(ConsoleConfigContext)
    const {ocdCache, setOcdCache} = useContext(CacheContext)
    const loadingState = '......Reading OCI Config'
    const regionsLoading = {id: 'Select Valid Profile', displayName: 'Select Valid Profile'}
    const [className, setClassName] = useState(`ocd-reference-data-query-dialog`)
    const [cursor, setCursor] = useState('default')
    const [profiles, setProfiles] = useState([loadingState])
    const [profilesLoaded, setProfilesLoaded] = useState(false)
    const [regions, setRegions] = useState([regionsLoading])
    const [compartments, setCompartments] = useState([] as OciModelResources.OciCompartment[])
    const [selectedProfile, setSelectedProfile] = useState('DEFAULT')
    const [selectedRegion, setSelectedRegion] = useState('')
    const [selectedCompartmentIds, setSelectedCompartmentIds] = useState([])
    const [hierarchy, setHierarchy] = useState('')
    const refs: Record<string, React.RefObject<any>> = compartments.reduce((acc, value: OciModelResources.OciCompartment) => {
        acc[value.hierarchy] = React.createRef();
        return acc;
      }, {} as Record<string, React.RefObject<any>>);
    if (!profilesLoaded) OciApiFacade.loadOCIConfigProfileNames().then((results) => {
        setProfilesLoaded(true)
        setProfiles(results)
        loadRegions(results.length ? results[0] : [regionsLoading])
    }).catch((reason) => {
        setProfilesLoaded(true)
        setProfiles(['Failed to Read Profiles Fron OCI Config'])
    })
    const onProfileChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const profile = e.target.value
        console.debug('OcdReferenceDataQueryDialog: Selected Profile', profile)
        setSelectedProfile(profile)
        loadRegions(profile)
    }
    const onRegionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.debug('OcdReferenceDataQueryDialog: Selected Region', e.target.value)
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
    const onClickCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        const clone = OcdConsoleConfig.clone(ocdConsoleConfig)
        clone.queryReferenceData = !ocdConsoleConfig.queryReferenceData
        setOcdConsoleConfig(clone)
    }
    const onClickQuery = (e: React.MouseEvent<HTMLButtonElement>) => {
        setCursor('progress')
        console.debug('OcdReferenceDataQueryDialog: Delete', selectedProfile, ocdCache.cache.dropdownData)
        delete ocdCache.cache.dropdownData[selectedProfile]
        // @ts-ignore
        ocdCache.loadProfileRegionCache(selectedProfile, selectedRegion).then((results) => {
            console.debug('OcdReferenceDataQueryDialog: Query Dropdown', JSON.stringify(results, null, 2))
            const clone = OcdConsoleConfig.clone(ocdConsoleConfig)
            setOcdConsoleConfig(clone)
            setCursor('default')
            console.debug('OcdReferenceDataQueryDialog: Cache', ocdCache)
        })
        // // setClassName(`${className} ocd-busy-cursor`)
        // OciApiFacade.queryDropdown(selectedProfile, selectedRegion).then((results) => {
        //     // @ts-ignore
        //     console.debug('OcdReferenceDataQueryDialog: Query Dropdown', JSON.stringify(results, null, 2))
        //     const clone = OcdConsoleConfig.clone(ocdConsoleConfig)
        //     console.debug('OcdReferenceDataQueryDialog: Cache', ocdCache)
        //     ocdCache.cache.dropdownData[selectedProfile] = {all: results}
        //     ocdCache.cache.profile = selectedProfile
        //     console.debug('OcdReferenceDataQueryDialog: Cache', ocdCache)
        //     clone.queryReferenceData = !ocdConsoleConfig.queryReferenceData
        //     setOcdConsoleConfig(clone)
        //     setAndSaveOcdCache(OcdCacheData.clone(ocdCache))
        //     setCursor('default')
        // })
    }
   
    return (
        <div className={className} style={{cursor: cursor}}>
            <div>
                <div className='ocd-dialog-title'>Reference Data Query</div>
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
