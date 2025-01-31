/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { CompartmentPickerProps, QueryDialogProps } from "../../types/Dialogs"
import { OciApiFacade } from "../../facade/OciApiFacade"
import React, { useContext, useState } from "react"
import { OcdDesign, OciModelResources } from '@ocd/model'
import { OcdDocument } from "../OcdDocument"
import { OcdUtils } from '@ocd/core'
import { ActiveFileContext, ConsoleConfigContext } from "../../pages/OcdConsole"

export const OcdQueryDialog = ({ocdDocument, setOcdDocument}: QueryDialogProps): JSX.Element => {
    const {setActiveFile} = useContext(ActiveFileContext)
    const {ocdConsoleConfig} = useContext(ConsoleConfigContext)
    const loadingState = '......Reading OCI Config'
    const regionsLoading = {id: 'Select Valid Profile', displayName: 'Select Valid Profile'}
    const className = `ocd-query-dialog`
    const [workingClassName, setWorkingClassName] = useState(`ocd-query-wrapper hidden`)
    const [profiles, setProfiles] = useState([loadingState])
    const [profilesLoaded, setProfilesLoaded] = useState(false)
    const [regions, setRegions] = useState([regionsLoading])
    const [compartments, setCompartments] = useState([] as OciModelResources.OciCompartment[])
    const [selectedProfile, setSelectedProfile] = useState('DEFAULT')
    const [selectedRegion, setSelectedRegion] = useState('')
    const [selectedCompartmentIds, setSelectedCompartmentIds] = useState([])
    const [collapsedCompartmentIds, setCollapsedCompartmentIds] = useState([])
    const [hierarchy, setHierarchy] = useState('')
    const refs: Record<string, React.RefObject<any>> = compartments.reduce((acc, value: OciModelResources.OciCompartment) => {
        acc[value.hierarchy] = React.createRef();
        return acc;
      }, {} as Record<string, React.RefObject<any>>);
    if (!profilesLoaded) OciApiFacade.loadOCIConfigProfileNames().then((results) => {
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
        setCollapsedCompartmentIds([])
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
            console.warn('OciQueryDialog: loadRegions: Failed Profile', profile, reason)
            setRegions([regionsLoading])
        })
    }
    const loadCompartments = (profile: string) => {
        console.debug('OciQueryDialog: loadCompartments: Profile', profile)
        OciApiFacade.listTenancyCompartments(profile).then((results) => {
            console.debug('OcdQueryDialog: Compartments', results)
            const compartments = results.map((c: OciModelResources.OciCompartment) => {return {...c, hierarchy: getHierarchy(c.id, results).join('/')}})
            setCompartments(compartments)
        }).catch((reason) => {
            setCompartments([])
        })
    }
    const getHierarchy = (id: string, compartments: OciModelResources.OciCompartment[]): string[] => {
        const compartment: OciModelResources.OciCompartment | undefined = compartments.find((c: OciModelResources.OciCompartment) => c.id === id)
        const hierarchy: string[] = compartment === undefined ? [''] : [...getHierarchy(compartment.compartmentId, compartments), compartment.name]
        return hierarchy
    }
    const onClickCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.query = !ocdDocument.query
        setOcdDocument(clone)
    }
    const onClickQuery = (e: React.MouseEvent<HTMLButtonElement>) => {
        setWorkingClassName('ocd-query-wrapper')
        console.debug('OcdQueryDialog: Selected Compartments', selectedCompartmentIds)
        OciApiFacade.queryTenancy(selectedProfile, selectedCompartmentIds, selectedRegion).then((results) => {
            // @ts-ignore
            console.debug('OcdQueryDialog: Query Tenancy', JSON.stringify(results, null, 2))
            const clone = OcdDocument.clone(ocdDocument)
            const design = OcdDesign.newDesign()
            design.metadata.title = 'Queried Cloud Design'
            design.view.pages[0].title = selectedRegion
            // Copy Result information Across to design
            const resultsOciResources = results.model.oci.resources
            console.debug('OcdQueryDialog: OciModelResources:', Object.keys(OciModelResources))
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
            clone.autoLayout(clone.getActivePage().id, true, ocdConsoleConfig.config.defaultAutoArrangeStyle)
            setOcdDocument(clone)
            setActiveFile({name: '', modified: false})
        })
    }
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug('OcdQueryDialog: onChange', e)
        const keys = Object.keys(refs).filter((k) => k.includes(e.target.value))
        // if (keys.length > 0) refs[keys[0]].current.scrollIntoView(true)
        // if (keys.length > 0) refs[keys[0]].current.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'})
        // if (keys.length > 0) refs[keys[0]].current.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
        if (keys.length > 0) refs[keys[0]].current.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
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
                        <div></div><div className="ocd-compartment-search"><input type="text" onChange={onChange} placeholder="Search"></input></div>
                        <div>Compartments</div><div>
                            <div className="ocd-compartment-picker">
                                <CompartmentPicker 
                                    compartments={compartments} 
                                    selectedCompartmentIds={selectedCompartmentIds}
                                    setSelectedCompartmentIds={setSelectedCompartmentIds}
                                    collapsedCompartmentIds={collapsedCompartmentIds} 
                                    setCollapsedCompartmentIds={setCollapsedCompartmentIds}
                                    root={true}
                                    parentId={''}
                                    setHierarchy={setHierarchy}
                                    refs={refs}
                                />
                            </div>
                        </div>
                        <div></div><div className="ocd-compartment-hierarchy">{hierarchy}</div>
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

const CompartmentPicker = ({compartments, selectedCompartmentIds, setSelectedCompartmentIds, root, parentId, setHierarchy, refs, collapsedCompartmentIds, setCollapsedCompartmentIds}: CompartmentPickerProps): JSX.Element => {
    const filter = root ? (c: OciModelResources.OciCompartment) => c.root : (c: OciModelResources.OciCompartment) => c.compartmentId === parentId
    const filteredCompartments = compartments.filter(filter)
    console.debug('OcdQueryDialog:', root, parentId, filteredCompartments)
    const onChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        e.stopPropagation()
        const selected = e.target.checked
        // console.debug('OcdQueryDialog: Selected', selected)
        const compartmentIds = selected ? [...selectedCompartmentIds, id] : selectedCompartmentIds.filter((i) => i !== id)
        setSelectedCompartmentIds(compartmentIds)
    }
    const onMouseOver = (id: string) => {
        const compartment: OciModelResources.OciCompartment | undefined = compartments.find((c: OciModelResources.OciCompartment) => c.id === id)
        setHierarchy(compartment !== undefined ? compartment.hierarchy : '')
    }
    const onClick = (e: React.MouseEvent<HTMLLIElement>, id: string) => {
        e.stopPropagation()
        const isClosed = collapsedCompartmentIds.includes(id)
        // Toggle State
        const compartmentIds = isClosed ? collapsedCompartmentIds.filter((i) => i !== id) : [...collapsedCompartmentIds, id]
        setCollapsedCompartmentIds(compartmentIds)
        console.debug('OcdQueryDialog: Click/Collapse Event:', e)
    }
    const onInputClick = (e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()
    const onLabelClick = (e: React.MouseEvent<HTMLElement>) => e.stopPropagation()
    const subCompartmentsClasses = collapsedCompartmentIds.includes(parentId) ? 'hidden' : ''
    return (
        <ul className={subCompartmentsClasses}>
            {filteredCompartments.length > 0 && filteredCompartments.map((c) => {
                const subCompartmentsCount = compartments.filter((cc) => cc.compartmentId === c.id).length
                const isClosed = collapsedCompartmentIds.includes(c.id)
                const isClosedClasses = isClosed ? 'ocd-collapable-list-element ocd-list-collapsed' : 'ocd-collapable-list-element ocd-list-open'
                const labelClasses = subCompartmentsCount > 0 ? isClosedClasses : 'ocd-collapable-list-element'
                // const labelClasses = subCompartmentsCount > 0 ? isClosed ? 'ocd-collapable-list-element ocd-list-collapsed' : 'ocd-collapable-list-element ocd-list-open' : 'ocd-collapable-list-element'
                return <li className={labelClasses} key={c.id} ref={refs[c.hierarchy]} onClick={(e) => onClick(e, c.id)} aria-hidden>
                            <label onMouseEnter={(e) => onMouseOver(c.id)} onMouseLeave={(e) => onMouseOver('')} onClick={onLabelClick} aria-hidden><input type="checkbox" checked={selectedCompartmentIds.includes(c.id)} onChange={(e) => onChange(e, c.id)} onClick={onInputClick}></input>{c.name}</label>
                            {subCompartmentsCount > 0 && <CompartmentPicker 
                                compartments={compartments} 
                                selectedCompartmentIds={selectedCompartmentIds}
                                setSelectedCompartmentIds={setSelectedCompartmentIds}
                                collapsedCompartmentIds={collapsedCompartmentIds} 
                                setCollapsedCompartmentIds={setCollapsedCompartmentIds}
                                root={false}
                                parentId={c.id}
                                setHierarchy={setHierarchy}
                                refs={refs}
                            />}
                    </li>
            })}
        </ul>
    )
}
