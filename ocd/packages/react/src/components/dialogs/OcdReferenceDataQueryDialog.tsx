/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { QueryDialogProps } from "../../types/Dialogs"
import { OciApiFacade } from "../../facade/OciApiFacade"
import React, { useContext, useState } from "react"
import { CacheContext, ConsoleConfigContext } from "../../pages/OcdConsole"
import OcdConsoleConfig from "../OcdConsoleConfiguration"

export const OcdReferenceDataQueryDialog = ({ocdDocument, setOcdDocument}: QueryDialogProps): JSX.Element => {
    const {ocdConsoleConfig, setOcdConsoleConfig} = useContext(ConsoleConfigContext)
    const {ocdCache} = useContext(CacheContext)
    const loadingState = '......Reading OCI Config'
    const regionsLoading = {id: 'Select Valid Profile', displayName: 'Select Valid Profile'}
    const className = `ocd-reference-data-query-dialog`
    const [workingClassName, setWorkingClassName] = useState(`ocd-query-wrapper hidden`)
    const [cursor, setCursor] = useState('default')
    const [profiles, setProfiles] = useState([loadingState])
    const [profilesLoaded, setProfilesLoaded] = useState(false)
    const [regions, setRegions] = useState([regionsLoading])
    const [selectedProfile, setSelectedProfile] = useState('DEFAULT')
    const [selectedRegion, setSelectedRegion] = useState('')

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
        setWorkingClassName('ocd-query-wrapper')
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
            <div className={workingClassName}><div id='misshapen-doughnut'></div></div>
        </div>
    )
}
