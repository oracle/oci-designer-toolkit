/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { CompartmentPickerProps, QueryDialogProps, StackPickerProps } from "../../types/Dialogs"
import { formatOciBackendError, isBackendUnavailableError, OciApiFacade } from "../../facade/OciApiFacade"
import { OciResourceManagerStack } from "../../facade/OcdBackend"
import React, { useEffect, useState } from "react"
import { OciModelResources } from '@ocd/model'
import { OcdResourceManagerExporter } from '@ocd/export'
import { OcdDocument } from "../OcdDocument"
import { formatResourceManagerPlanReviewMessage, useResourceManagerPlanReview } from "../../resource-manager/OcdResourceManagerPlanReview"
import { OcdResourceManagerRecentPlans } from "../../resource-manager/OcdResourceManagerRecentPlans"
import {
    loadResourceManagerRecentPlans,
    removeResourceManagerRecentPlan,
    saveResourceManagerRecentPlan,
    type OcdResourceManagerRecentPlan,
} from "../../resource-manager/OcdResourceManagerPlanRegistry"

interface ResourceManagerPlanJob {
    stackId: string
    stackDisplay: string
    jobId: string
}

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
    const [selectedStack, setSelectedStack] = useState('')
    const [stackName, setStackName] = useState('')
    const [stacks, setStacks] = useState<OciResourceManagerStack[]>([])
    const [lastPlanJob, setLastPlanJob] = useState<ResourceManagerPlanJob | undefined>(undefined)
    const [recentPlans, setRecentPlans] = useState<OcdResourceManagerRecentPlan[]>([])
    const [applyApproval, setApplyApproval] = useState('')
    const [actionStatus, setActionStatus] = useState('')
    const [actionError, setActionError] = useState('')
    const { planReview, planReviewError } = useResourceManagerPlanReview({
        profile: selectedProfile,
        region: selectedRegion,
        jobId: lastPlanJob?.jobId ?? '',
        timeoutMessage: 'Plan job is still running. Refresh the plan status before applying.',
    })
    const refs: Record<string, React.RefObject<any>> = compartments.reduce((acc, value: OciModelResources.OciCompartment) => {
        acc[value.hierarchy] = React.createRef();
        return acc;
      }, {} as Record<string, React.RefObject<any>>);
    useEffect(() => {
        if (profilesLoaded) return
        let cancelled = false
        OciApiFacade.loadOCIConfigProfileNames().then((results) => {
            if (cancelled) return
            setProfilesLoaded(true)
            setProfiles(results)
            loadRegions(results.length ? results[0] : '')
            loadCompartments(results.length ? results[0] : '')
            setRecentPlans(loadResourceManagerRecentPlans())
        }).catch((reason) => {
            if (cancelled) return
            setProfilesLoaded(true)
            setProfiles([isBackendUnavailableError(reason) ? 'Backend unavailable' : 'Failed to Read Profiles From OCI Config'])
            if (isBackendUnavailableError(reason)) setActionError(formatOciBackendError(reason))
        })
        return () => {
            cancelled = true
        }
    }, [profilesLoaded])
    const onProfileChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const profile = e.target.value
        console.debug('OcdExportToResourceManagerDialog: Selected Profile', profile)
        setActionError('')
        setSelectedProfile(profile)
        loadRegions(profile)
        loadCompartments(profile)
        setSelectedCompartmentIds([])
        setCollapsedCompartmentIds([])
        setStacks([])
        setLastPlanJob(undefined)
        setApplyApproval('')
    }
    const onRegionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.debug('OcdExportToResourceManagerDialog: Selected Region', e.target.value)
        setSelectedRegion(e.target.value)
        setStacks([])
        setLastPlanJob(undefined)
        setApplyApproval('')
    }
    const loadRegions = (profile: string, preferredRegion = '') => {
        console.debug('OcdExportToResourceManagerDialog: loadRegions: Profile', profile)
        OciApiFacade.listRegions(profile).then((results) => {
            setRegions(results)
            const homeRegion = results.find((r: Record<string, any>) => r.isHomeRegion)
            const preferred = results.find((r: Record<string, any>) => r.id === preferredRegion)
            setSelectedRegion(preferred ? preferred.id : homeRegion ? homeRegion.id : results[0].id)
        }).catch((reason) => {
            console.warn('OcdExportToResourceManagerDialog: loadRegions: Failed Profile', profile, reason)
            if (isBackendUnavailableError(reason)) setActionError(formatOciBackendError(reason))
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
            if (isBackendUnavailableError(reason)) setActionError(formatOciBackendError(reason))
            setCompartments([])
        })
    }
    const loadStacks = (profile: string, region: string, compartmentId : string) => {
        console.debug('OcdExportToResourceManagerDialog: loadStacks: Profile', profile, region, compartmentId)
        OciApiFacade.listStacks(profile, region, compartmentId).then((results) => {
            console.debug('OcdExportToResourceManagerDialog: Stacks', results)
            if (results.stacks) {
                setStacks(results.stacks)
                setSelectedStack(results.stacks.length > 0 ? results.stacks[0].id : '')
            } else {
                setStacks([])
                setSelectedStack('')
            }
        }).catch((reason) => {
            setActionError(formatOciBackendError(reason))
            setStacks([])
            setSelectedStack('')
        })
    }
    useEffect(() => {
        console.debug('OcdExportToResourceManagerDialog: useEffect: Selected Compartment Ids', selectedCompartmentIds)
        setLastPlanJob(undefined)
        setApplyApproval('')
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
        e.preventDefault()
        setActionStatus('')
        setActionError('')
        if (selectedCompartmentIds.length === 0) {
            setActionError('Select a compartment before exporting to Resource Manager.')
            return
        }
        if (createStack && stackName.trim().length === 0) {
            setActionError('Enter a stack name before creating the Resource Manager stack.')
            return
        }
        if (!createStack && selectedStack.trim().length === 0) {
            setActionError('Select an existing Resource Manager stack to update.')
            return
        }
        setWorkingClassName('ocd-query-wrapper')
        console.debug('OcdExportToResourceManagerDialog: Selected Compartments', selectedCompartmentIds)
        const exporter = new OcdResourceManagerExporter()
        const terraform = exporter.export(ocdDocument.design)
        const stackAction = createStack
            ? OciApiFacade.createStack(selectedProfile, selectedRegion, selectedCompartmentIds[0], stackName, terraform, { operation: 'PLAN' })
            : OciApiFacade.updateStack(selectedProfile, selectedRegion, selectedStack, terraform, { operation: 'PLAN' })
        stackAction.then((results) => {
            console.debug('OcdExportToResourceManagerDialog: Resource Manager Results', JSON.stringify(results, null, 2))
            const stackDisplay = results.stack?.displayName ? results.stack.displayName : createStack ? stackName : selectedStack
            const stackId = results.stack?.id ?? selectedStack
            const jobDisplay = results.job?.id ? ` Plan job ${results.job.id} submitted.` : ''
            if (stackId && results.job?.id) {
                setLastPlanJob({ stackId, stackDisplay, jobId: results.job.id })
                saveResourceManagerRecentPlan({
                    origin: 'designer',
                    profile: selectedProfile,
                    region: selectedRegion,
                    stackName: stackDisplay,
                    stackId,
                    jobId: results.job.id,
                })
                setRecentPlans(loadResourceManagerRecentPlans())
            } else {
                setLastPlanJob(undefined)
            }
            setApplyApproval('')
            setActionStatus(`${createStack ? 'Created' : 'Updated'} stack ${stackDisplay}.${jobDisplay}`)
            setWorkingClassName('ocd-query-wrapper hidden')
        }).catch((reason) => {
            console.warn('OcdExportToResourceManagerDialog: Resource Manager export failed', reason)
            setActionError(formatOciBackendError(reason))
            setLastPlanJob(undefined)
            setApplyApproval('')
            setWorkingClassName('ocd-query-wrapper hidden')
        })
    }
    const onClickApplyReviewedPlan = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setActionStatus('')
        setActionError('')
        if (!lastPlanJob) {
            setActionError('Run a Resource Manager plan before applying.')
            return
        }
        if (lastPlanJob.stackId.trim() === '') {
            setActionError('This recent plan does not include a stack id, so apply is unavailable. Re-run the plan from a selected stack first.')
            return
        }
        if (!planReview?.readyToApply) {
            setActionError('Wait for the Resource Manager plan job to succeed and review the plan output before applying.')
            return
        }
        if (applyApproval.trim() !== 'APPLY') {
            setActionError('Type APPLY to confirm Resource Manager apply.')
            return
        }
        setWorkingClassName('ocd-query-wrapper')
        OciApiFacade.createJob(selectedProfile, selectedRegion, lastPlanJob.stackId, {
            operation: 'APPLY',
            planJobId: lastPlanJob.jobId,
            approval: applyApproval,
        }).then((results) => {
            const jobDisplay = results.job?.id ? ` Apply job ${results.job.id} submitted.` : ' Apply job submitted.'
            setActionStatus(`Applying reviewed plan for stack ${lastPlanJob.stackDisplay}.${jobDisplay}`)
            setApplyApproval('')
            setWorkingClassName('ocd-query-wrapper hidden')
        }).catch((reason) => {
            console.warn('OcdExportToResourceManagerDialog: Resource Manager apply failed', reason)
            setActionError(formatOciBackendError(reason))
            setWorkingClassName('ocd-query-wrapper hidden')
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
        setLastPlanJob(undefined)
        setApplyApproval('')
    }
    const onSelectRecentPlan = (plan: OcdResourceManagerRecentPlan) => {
        setActionStatus(`Loaded recent ${plan.origin === 'discovery' ? 'Discovery' : 'Designer'} PLAN for ${plan.stackName}.`)
        setActionError('')
        setSelectedProfile(plan.profile)
        setSelectedRegion(plan.region)
        loadRegions(plan.profile, plan.region)
        loadCompartments(plan.profile)
        setLastPlanJob({
            stackId: plan.stackId ?? '',
            stackDisplay: plan.stackName,
            jobId: plan.jobId,
        })
        setApplyApproval('')
    }
    const onForgetRecentPlan = (plan: OcdResourceManagerRecentPlan) => {
        removeResourceManagerRecentPlan(plan.id)
        const nextPlans = loadResourceManagerRecentPlans()
        setRecentPlans(nextPlans)
        if (lastPlanJob?.jobId === plan.jobId && selectedProfile === plan.profile && selectedRegion === plan.region) {
            setLastPlanJob(undefined)
            setApplyApproval('')
            setActionStatus('')
        }
    }

    const actionButtonLabel = createStack ? 'Create Stack + Plan' : 'Update Stack + Plan'
    const planLifecycleState = planReview?.job.lifecycleState ?? 'SUBMITTED'
    const planReadyToApply = Boolean(planReview?.readyToApply && lastPlanJob?.stackId)
   
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
                            <label><input type="radio" name="createUpdateStack" value={'Create'} checked={createStack} onChange={() => { setCreateStack(true); setLastPlanJob(undefined); setApplyApproval('') }}></input>Create</label>
                            <label><input type="radio" name="createUpdateStack" value={'Update'} checked={!createStack} onChange={() => { setCreateStack(false); setLastPlanJob(undefined); setApplyApproval('') }}></input>Update</label>
                        </div>
                        {(() => {
                            if (createStack) return <><div>Stack Name</div><div className="ocd-compartment-search"><input type="text" onChange={onStackNameChange} placeholder="Enter Stack Name" value={stackName}></input></div></>
                            else return <><div>Stack</div><div><StackPicker stacks={stacks} selectedStack={selectedStack} setSelectedStack={(value: string) => { setSelectedStack(value); setLastPlanJob(undefined); setApplyApproval('') }}/></div></>
                        })()}
                        <div>Execution</div><div>
                            <span>Plan job only. Apply unlocks after Resource Manager reports a succeeded plan.</span>
                        </div>
                        <div>Recent Plans</div><OcdResourceManagerRecentPlans
                            currentProfile={selectedProfile}
                            currentRegion={selectedRegion}
                            onForget={onForgetRecentPlan}
                            onReview={onSelectRecentPlan}
                            plans={recentPlans}
                        />
                        {lastPlanJob && <>
                            <div>Reviewed Plan</div><div className="ocd-resource-manager-status">
                                <span>{lastPlanJob.jobId} ({planLifecycleState})</span>
                                {planReviewError && <span className="ocd-resource-manager-error"> {planReviewError}</span>}
                                {!planReview && !planReviewError && <span> {formatResourceManagerPlanReviewMessage(undefined)}</span>}
                                {planReview && <span className={!planReview.readyToApply && planReview.terminal ? 'ocd-resource-manager-error' : ''}> {formatResourceManagerPlanReviewMessage(planReview, { ready: 'Plan succeeded and is ready for apply review.', terminalFailed: 'Plan did not succeed.', running: 'Plan job is still running.' })}</span>}
                            </div>
                            <div>Plan Output</div><div>
                                <textarea className="ocd-resource-manager-plan-preview" readOnly value={planReview?.planText ?? ''} placeholder="Terraform plan output appears here after the plan job succeeds."></textarea>
                            </div>
                            <div>Confirm Apply</div><div className="ocd-compartment-search">
                                <input type="text" value={applyApproval} onChange={(e) => setApplyApproval(e.target.value)} placeholder="Type APPLY" disabled={!planReadyToApply}></input>
                            </div>
                        </>}
                        <div>Status</div><div className="ocd-resource-manager-status">
                            {actionError && <span className="ocd-resource-manager-error">{actionError}</span>}
                            {actionStatus && <span>{actionStatus}</span>}
                            {!actionError && !actionStatus && <span>Ready to package Terraform and submit a Resource Manager plan job.</span>}
                        </div>
                    </div>
                </div>
                <div className='ocd-dialog-footer'>
                    <div>
                        <div className="ocd-dialog-button ocd-dialog-cancel-button"><button onClick={onClickCancel}>Cancel</button></div>
                        <div className="ocd-dialog-button ocd-dialog-cancel-button"><button onClick={onClickStackAction}>{actionButtonLabel}</button></div>
                        {lastPlanJob && <div className="ocd-dialog-button ocd-dialog-cancel-button"><button onClick={onClickApplyReviewedPlan} disabled={!planReadyToApply || applyApproval.trim() !== 'APPLY'}>Apply Reviewed Plan</button></div>}
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
