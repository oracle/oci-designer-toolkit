/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { CompartmentPickerProps, QueryDialogProps, StackPickerProps } from "../../types/Dialogs"
import { OciApiFacade } from "../../facade/OciApiFacade"
import React, { useEffect, useState } from "react"
import { OciModelResources } from '@ocd/model'
import { OcdResourceManagerExporter } from '@ocd/export'
import { OcdDocument } from "../OcdDocument"

export const OcdExportToResourceManagerDialog = ({ocdDocument, setOcdDocument}: QueryDialogProps): JSX.Element => {
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
    const [createStack, setCreateStack] = useState(true)
    const [applyStack, setApplyStack] = useState(false)
    const [selectedStack, setSelectedStack] = useState('')
    const [stackName, setStackName] = useState('')
    const [stacks, setStacks] = useState([])
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
        console.debug('OcdExportToResourceManagerDialog: Selected Profile', profile)
        setSelectedProfile(profile)
        loadRegions(profile)
        loadCompartments(profile)
        setSelectedCompartmentIds([])
        setCollapsedCompartmentIds([])
        setStacks([])
    }
    const onRegionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.debug('OcdExportToResourceManagerDialog: Selected Region', e.target.value)
        setSelectedRegion(e.target.value)
        setStacks([])
    }
    const loadRegions = (profile: string) => {
        console.debug('OcdExportToResourceManagerDialog: loadRegions: Profile', profile)
        OciApiFacade.listRegions(profile).then((results) => {
            setRegions(results)
            const homeRegion = results.find((r: Record<string, any>) => r.isHomeRegion)
            setSelectedRegion(homeRegion ? homeRegion.id : results[0].id)
        }).catch((reason) => {
            console.warn('OcdExportToResourceManagerDialog: loadRegions: Failed Profile', profile, reason)
            setRegions([regionsLoading])
        })
    }
    const loadCompartments = (profile: string) => {
        console.debug('OcdExportToResourceManagerDialog: loadCompartments: Profile', profile)
        OciApiFacade.listTenancyCompartments(profile).then((results) => {
            console.debug('OcdExportToResourceManagerDialog: Compartments', results)
            const compartments = results.map((c: OciModelResources.OciCompartment) => {return {...c, hierarchy: getHierarchy(c.id, results).join('/')}})
            setCompartments(compartments)
        }).catch((reason) => {
            setCompartments([])
        })
    }
    const loadStacks = (profile: string, region: string, compartmentId : string) => {
        console.debug('OcdExportToResourceManagerDialog: loadStacks: Profile', profile, region, compartmentId)
        OciApiFacade.listStacks(profile, region, compartmentId).then((results) => {
            console.debug('OcdExportToResourceManagerDialog: Stacks', results)
            if (results.stacks) setStacks(results.stacks)
            else setStacks([])
        }).catch((reason) => {
            setStacks([])
        })
    }
    useEffect(() => {
        console.debug('OcdExportToResourceManagerDialog: useEffect: Selected Compartment Ids', selectedCompartmentIds)
        if (selectedCompartmentIds.length > 0) loadStacks(selectedProfile, selectedRegion, selectedCompartmentIds[0])
        else setStacks([])
    }, [selectedCompartmentIds])
    const getHierarchy = (id: string, compartments: OciModelResources.OciCompartment[]): string[] => {
        const compartment: OciModelResources.OciCompartment | undefined = compartments.find((c: OciModelResources.OciCompartment) => c.id === id)
        const hierarchy: string[] = compartment === undefined ? [''] : [...getHierarchy(compartment.compartmentId, compartments), compartment.name]
        return hierarchy
    }
    const onClickCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        const clone = OcdDocument.clone(ocdDocument)
        clone.dialog.resourceManager = false
        setOcdDocument(clone)
    }
    const onClickStackAction = (e: React.MouseEvent<HTMLButtonElement>) => {
        setWorkingClassName('ocd-query-wrapper')
        console.debug('OcdExportToResourceManagerDialog: Selected Compartments', selectedCompartmentIds)
        OciApiFacade.queryTenancy(selectedProfile, selectedCompartmentIds, selectedRegion).then((results) => {
            // @ts-ignore
            console.debug('OcdExportToResourceManagerDialog: Query Tenancy', JSON.stringify(results, null, 2))
            const exporter = new OcdResourceManagerExporter()
            const terraform = exporter.export(ocdDocument.design)
            console.debug('OcdExportToResourceManagerDialog: Terraform', JSON.stringify(terraform, null, 2))
            const clone = OcdDocument.clone(ocdDocument)
            clone.dialog.resourceManager = false
            setOcdDocument(clone)
        }).catch((reason) => {
            const clone = OcdDocument.clone(ocdDocument)
            clone.dialog.resourceManager = false
            setOcdDocument(clone)
        })
    }
    const onCompartmentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug('OcdExportToResourceManagerDialog: onCompartmentSearchChange', e)
        const keys = Object.keys(refs).filter((k) => k.includes(e.target.value))
        if (keys.length > 0) refs[keys[0]].current.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
    }
    const onStackNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug('OcdExportToResourceManagerDialog: onStackNameChange', e)
        setStackName(e.target.value)
    }

    const actionButtonLabel = createStack ? 'Create Stack' : 'Update Stack'
   
    return (
        <div className={className}>
            <div>
                <div className='ocd-dialog-title'>Export To Resource Manager</div>
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
                        <div></div><div className="ocd-compartment-search"><input type="text" onChange={onCompartmentSearchChange} placeholder="Search"></input></div>
                        <div>Compartments</div><div>
                            <div className="ocd-compartment-picker ocd-export-compartment-picker">
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
                        <div>Action</div><div className="ocd-radio-buttons">
                            <label><input type="radio" name="createUpdateStack" value={'Create'} checked={createStack} onChange={() => setCreateStack(true)}></input>Create</label>
                            <label><input type="radio" name="createUpdateStack" value={'Update'} checked={!createStack} onChange={() => setCreateStack(false)}></input>Update</label>
                        </div>
                        {(() => {
                            if (createStack) return <><div>Stack Name</div><div className="ocd-compartment-search"><input type="text" onChange={onStackNameChange} placeholder="Enter Stack Name" value={stackName}></input></div></>
                            else return <><div>Stack</div><div><StackPicker stacks={stacks} selectedStack={selectedStack} setSelectedStack={setSelectedStack}/></div></>
                        })()}
                        <div>Execute</div><div className="ocd-radio-buttons">
                            <label><input type="radio" name="planApplyStack" value={'Plan'} checked={!applyStack} onChange={() => setApplyStack(false)}></input>Plan</label>
                            <label><input type="radio" name="planApplyStack" value={'Apply'} checked={applyStack} onChange={() => setApplyStack(true)}></input>Apply</label>
                        </div>
                    </div>
                </div>
                <div className='ocd-dialog-footer'>
                    <div>
                        <div className="ocd-dialog-button ocd-dialog-cancel-button"><button onClick={onClickCancel}>Cancel</button></div>
                        <div className="ocd-dialog-button ocd-dialog-cancel-button"><button onClick={onClickStackAction}>{actionButtonLabel}</button></div>
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
    console.debug('OcdExportToResourceManagerDialog:', root, parentId, filteredCompartments)
    const onChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        e.stopPropagation()
        const selected = e.target.checked
        const compartmentIds = selected ? [id] : []
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
    }
    const onInputClick = (e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()
    const subCompartmentsClasses = collapsedCompartmentIds.includes(parentId) ? 'hidden' : ''
    return (
        <ul className={subCompartmentsClasses}>
            {filteredCompartments.length > 0 && filteredCompartments.map((c) => {
                const subCompartmentsCount = compartments.filter((cc) => cc.compartmentId === c.id).length
                const isClosed = collapsedCompartmentIds.includes(c.id)
                const isClosedClasses = isClosed ? 'ocd-collapable-list-element ocd-list-collapsed' : 'ocd-collapable-list-element ocd-list-open'
                const labelClasses = subCompartmentsCount > 0 ? isClosedClasses : 'ocd-collapable-list-element'
                return <li className={labelClasses} key={c.id} ref={refs[c.hierarchy]} onClick={(e) => onClick(e, c.id)} aria-hidden>
                            <label onMouseEnter={(e) => onMouseOver(c.id)} onMouseLeave={(e) => onMouseOver('')}><input type="radio" name="compartmentPicker" checked={selectedCompartmentIds.includes(c.id)} onChange={(e) => onChange(e, c.id)} onClick={onInputClick}></input>{c.name}</label>
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

const StackPicker = ({stacks, selectedStack, setSelectedStack}: StackPickerProps): JSX.Element => {
    const onRegionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.debug('OcdExportToResourceManagerDialog: Selected Stack', e.target.value)
        setSelectedStack(e.target.value)
    }
    return <select onChange={onRegionChanged} value={selectedStack}>{stacks.map((r) => {return <option key={r.id} value={r.id}>{r.displayName}</option>})}</select>
}
