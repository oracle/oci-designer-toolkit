import { useEffect, useMemo, useState } from 'react'
import { DiscoveryOciTargetMapping, DiscoverySnapshot } from '../OcdDiscoveryTypes'
import { recommendDiscoveryLandingZone } from '../OcdDiscoveryLzRecommendations'
import { buildDiscoveryProvisioningDelta, buildDiscoveryResourceManagerPackage, isDiscoveryResourceManagerPlanCurrent } from '../OcdDiscoveryProvisioning'
import { formatOciBackendError, OciApiFacade } from '../../facade/OciApiFacade'
import { OcdResourceManagerPlanReviewPanel, useResourceManagerPlanReview } from '../../resource-manager/OcdResourceManagerPlanReview'
import { OcdResourceManagerRecentPlans } from '../../resource-manager/OcdResourceManagerRecentPlans'
import {
    buildResourceManagerRecentPlanReviewSummary,
    findLatestResourceManagerRecentPlan,
    loadResourceManagerRecentPlans,
    removeResourceManagerRecentPlan,
    saveResourceManagerRecentPlan,
    type OcdResourceManagerRecentPlan,
} from '../../resource-manager/OcdResourceManagerPlanRegistry'

export interface OcdDiscoveryLzMappingViewProps {
    snapshot: DiscoverySnapshot
    targets: DiscoveryOciTargetMapping[]
    backendAvailable?: boolean
    selectedProfile?: string
    selectedRegion?: string
    selectedCompartmentId?: string
}

const OcdDiscoveryLzMappingView = ({
    snapshot,
    targets,
    backendAvailable = false,
    selectedProfile = '',
    selectedRegion = '',
    selectedCompartmentId = '',
}: OcdDiscoveryLzMappingViewProps): JSX.Element => {
    const applications = new Map(snapshot.applications.map((application) => [application.id, application]))
    const services = new Map(snapshot.services.map((service) => [service.id, service]))
    const recommendations = recommendDiscoveryLandingZone(snapshot)
    const provisioningDelta = useMemo(() => buildDiscoveryProvisioningDelta(snapshot, targets), [snapshot, targets])
    const [stackName, setStackName] = useState('discovery-architecture-plan')
    const [planStatus, setPlanStatus] = useState('')
    const [planError, setPlanError] = useState('')
    const [planJobId, setPlanJobId] = useState('')
    const [submittingPlan, setSubmittingPlan] = useState(false)
    const [recentPlan, setRecentPlan] = useState<OcdResourceManagerRecentPlan | undefined>(undefined)
    const [recentPlans, setRecentPlans] = useState<OcdResourceManagerRecentPlan[]>([])
    const { planReview, planReviewError } = useResourceManagerPlanReview({
        profile: selectedProfile,
        region: selectedRegion,
        jobId: planJobId,
        timeoutMessage: 'Plan job is still running. Refresh Discovery or reopen this tab to continue polling.',
    })
    const packagePreview = useMemo(
        () => buildDiscoveryResourceManagerPackage(provisioningDelta, {
            region: selectedRegion,
            targetCompartmentId: selectedCompartmentId,
            architectureName: stackName,
        }),
        [provisioningDelta, selectedRegion, selectedCompartmentId, stackName],
    )
    const sampleBlocked = snapshot.source === 'sample'
    const canSubmitPlan = backendAvailable
        && !sampleBlocked
        && selectedProfile.trim() !== ''
        && selectedRegion.trim() !== ''
        && selectedCompartmentId.trim() !== ''
        && stackName.trim() !== ''
        && !submittingPlan
    const previewBlockers = packagePreview.blockers.filter((blocker) => !blocker.includes('tenancy OCID'))
    const recentPlanStale = Boolean(recentPlan && !isDiscoveryResourceManagerPlanCurrent(packagePreview.packageDigest, recentPlan))
    const recentPlanSummary = useMemo(
        () => buildResourceManagerRecentPlanReviewSummary(recentPlan, packagePreview.packageDigest),
        [packagePreview.packageDigest, recentPlan],
    )
    useEffect(() => {
        setRecentPlans(loadResourceManagerRecentPlans())
    }, [])
    useEffect(() => {
        if (!backendAvailable || planJobId || selectedProfile.trim() === '' || selectedRegion.trim() === '') return
        const latestPlan = findLatestResourceManagerRecentPlan({
            origin: 'discovery',
            profile: selectedProfile,
            region: selectedRegion,
        })
        if (!latestPlan) return
        setRecentPlan(latestPlan)
        setStackName(latestPlan.stackName)
        if (!isDiscoveryResourceManagerPlanCurrent(packagePreview.packageDigest, latestPlan)) {
            setPlanJobId('')
            setPlanStatus(`Recent Resource Manager PLAN for ${latestPlan.stackName} is stale because discovery inputs changed.`)
            setPlanError('Submit a new Resource Manager PLAN to reconcile the current provisioning scripts.')
            return
        }
        setPlanJobId(latestPlan.jobId)
        setPlanStatus(`Restored recent Resource Manager PLAN for ${latestPlan.stackName}.`)
        setPlanError('')
    }, [backendAvailable, packagePreview.packageDigest, planJobId, selectedProfile, selectedRegion])
    useEffect(() => {
        if (!recentPlanStale) return
        setPlanJobId('')
        setPlanStatus(`Recent Resource Manager PLAN for ${recentPlan?.stackName ?? stackName} is stale because discovery inputs changed.`)
        setPlanError('Submit a new Resource Manager PLAN to reconcile the current provisioning scripts.')
    }, [packagePreview.packageDigest, recentPlan?.id, recentPlan?.stackName, recentPlanStale, stackName])
    const onSubmitPlan = () => {
        setPlanStatus('')
        setPlanError('')
        setPlanJobId('')
        setRecentPlan(undefined)
        if (!canSubmitPlan) {
            setPlanError(sampleBlocked ? 'Run live discovery or import a reviewed dataset before submitting a Resource Manager plan.' : 'Complete profile, region, compartment, and stack name before submitting a plan.')
            return
        }
        setSubmittingPlan(true)
        OciApiFacade.loadOCIConfigProfile(selectedProfile).then((profile) => {
            const resourceManagerPackage = buildDiscoveryResourceManagerPackage(provisioningDelta, {
                region: selectedRegion,
                tenancyOcid: profile.tenancy,
                targetCompartmentId: selectedCompartmentId,
                architectureName: stackName,
            })
            if (!resourceManagerPackage.ready) {
                throw new Error(resourceManagerPackage.blockers.join(' '))
            }
            return OciApiFacade.createStack(
                selectedProfile,
                selectedRegion,
                selectedCompartmentId,
                stackName,
                resourceManagerPackage.files,
                { operation: 'PLAN' },
            )
        }).then((result) => {
            setPlanJobId(result.job?.id ?? '')
            if (result.job?.id) {
                setRecentPlan(saveResourceManagerRecentPlan({
                    origin: 'discovery',
                    profile: selectedProfile,
                    region: selectedRegion,
                    stackName,
                    stackId: result.stack?.id,
                    jobId: result.job.id,
                    packageDigest: packagePreview.packageDigest,
                }))
                setRecentPlans(loadResourceManagerRecentPlans())
            }
            setPlanStatus(result.job?.id
                ? `Resource Manager PLAN submitted for ${stackName}. Plan job ${result.job.id}.`
                : `Resource Manager PLAN submitted for ${stackName}.`)
        }).catch((reason) => {
            setPlanError(formatOciBackendError(reason))
        }).finally(() => setSubmittingPlan(false))
    }
    const onForgetRecentPlan = () => {
        if (recentPlan) removeResourceManagerRecentPlan(recentPlan.id)
        setRecentPlans(loadResourceManagerRecentPlans())
        setRecentPlan(undefined)
        setPlanJobId('')
        setPlanStatus('')
        setPlanError('')
    }
    const onReviewRecentPlan = (plan: OcdResourceManagerRecentPlan) => {
        setRecentPlan(plan)
        setStackName(plan.stackName)
        if (!isDiscoveryResourceManagerPlanCurrent(packagePreview.packageDigest, plan)) {
            setPlanJobId('')
            setPlanStatus(`Loaded recent ${plan.origin === 'discovery' ? 'Discovery' : 'Designer'} Resource Manager PLAN for ${plan.stackName}, but current discovery inputs changed.`)
            setPlanError('Submit a new Resource Manager PLAN to reconcile the current provisioning scripts.')
            return
        }
        setPlanJobId(plan.jobId)
        setPlanStatus(`Loaded recent ${plan.origin === 'discovery' ? 'Discovery' : 'Designer'} Resource Manager PLAN for ${plan.stackName}.`)
        setPlanError('')
    }
    const onForgetListedPlan = (plan: OcdResourceManagerRecentPlan) => {
        removeResourceManagerRecentPlan(plan.id)
        const nextPlans = loadResourceManagerRecentPlans()
        setRecentPlans(nextPlans)
        if (recentPlan?.id === plan.id || planJobId === plan.jobId) {
            setRecentPlan(undefined)
            setPlanJobId('')
            setPlanStatus('')
            setPlanError('')
        }
    }

    return (
        <div className='ocd-discovery-section'>
            <h2>Landing Zone Target Mapping</h2>
            <div className='ocd-discovery-recommendations'>
                <section>
                    <h3>Compartments</h3>
                    <ul>
                        {recommendations.compartments.map((compartment) => <li key={compartment}><code>{compartment}</code></li>)}
                    </ul>
                </section>
                <section>
                    <h3>Overlays</h3>
                    <ul>
                        {recommendations.overlays.map((overlay) => <li key={overlay}>{overlay}</li>)}
                    </ul>
                </section>
                <section>
                    <h3>Migration Waves</h3>
                    <ul>
                        {recommendations.migrationWaves.map((wave) => (
                            <li key={wave.name}>
                                <strong>{wave.name}</strong>
                                <span>{wave.applicationIds.length} applications</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            {targets.length > 0 ? (
                <table className='ocd-discovery-table'>
                    <thead>
                        <tr>
                            <th>Application</th>
                            <th>Source Service</th>
                            <th>Runtime</th>
                            <th>Target Service</th>
                            <th>Resource Type</th>
                            <th>Disposition</th>
                            <th>Confidence</th>
                            <th>Rationale</th>
                        </tr>
                    </thead>
                    <tbody>
                        {targets.map((target) => (
                            <tr key={target.serviceId}>
                                <td>{applications.get(target.applicationId)?.name ?? 'Unknown'}</td>
                                <td>{services.get(target.serviceId)?.displayName ?? target.serviceId}</td>
                                <td>{target.sourceRuntime}</td>
                                <td>{target.targetService}</td>
                                <td><code>{target.targetResourceType}</code></td>
                                <td>{target.disposition}</td>
                                <td>{target.confidence}</td>
                                <td>{target.rationale}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className='ocd-discovery-note'>No workload services are mapped yet. Run live discovery or import an application dataset to generate target service recommendations.</p>
            )}
            <section className='ocd-discovery-provisioning' aria-label='Provisioning script reconciliation preview'>
                <div>
                    <h3>Provisioning Delta</h3>
                    <p>{provisioningDelta.summary}</p>
                </div>
                <div className='ocd-discovery-provisioning-grid'>
                    <article>
                        <strong>{provisioningDelta.files.length}</strong>
                        <span>generated files</span>
                    </article>
                    <article>
                        <strong>{provisioningDelta.variables.filter((variable) => variable.required).length}</strong>
                        <span>required variables</span>
                    </article>
                    <article>
                        <strong>{provisioningDelta.warnings.length}</strong>
                        <span>review gates</span>
                    </article>
                    <article>
                        <strong>{packagePreview.fileCount}</strong>
                        <span>RM files</span>
                    </article>
                    <article>
                        <strong>{packagePreview.packageDigest.replace(/^fnv1a-/, '')}</strong>
                        <span>package digest</span>
                    </article>
                </div>
                <div className='ocd-discovery-rm-handoff' aria-label='Resource Manager plan handoff'>
                    <div>
                        <h4>Resource Manager PLAN handoff</h4>
                        <p>Packages the Terraform delta at ZIP root and submits a PLAN job only. Apply remains gated by Resource Manager plan review.</p>
                    </div>
                    <label>
                        Stack name
                        <input
                            onChange={(event) => setStackName(event.target.value)}
                            type='text'
                            value={stackName}
                        />
                    </label>
                    <div className='ocd-discovery-rm-status'>
                        {sampleBlocked && <span className='ocd-resource-manager-error'>Sample dataset cannot be submitted to Resource Manager.</span>}
                        {!backendAvailable && <span className='ocd-resource-manager-error'>Start the desktop app or local OCD web server to submit Resource Manager plans.</span>}
                        {previewBlockers.length > 0 && !sampleBlocked && (
                            <ul>
                                {previewBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
                            </ul>
                        )}
                        {recentPlan && (
                            <span className={recentPlanSummary.state === 'stale' ? 'ocd-resource-manager-error' : undefined}>
                                {recentPlanSummary.label}: {recentPlanSummary.detail}
                            </span>
                        )}
                        {planError && <span className='ocd-resource-manager-error'>{planError}</span>}
                        {planStatus && <span>{planStatus}</span>}
                        {!planError && !planStatus && !sampleBlocked && <span>Ready to package after runtime variables are resolved from the selected profile and compartment.</span>}
                    </div>
                    <button disabled={!canSubmitPlan} onClick={onSubmitPlan} type='button'>
                        {submittingPlan ? 'Submitting PLAN…' : 'Submit Resource Manager PLAN'}
                    </button>
                    <div className='ocd-discovery-rm-recent-plans' aria-label='Recent Resource Manager plans'>
                        <h4>Recent PLAN history</h4>
                        <OcdResourceManagerRecentPlans
                            currentProfile={selectedProfile}
                            currentRegion={selectedRegion}
                            limit={5}
                            onForget={onForgetListedPlan}
                            onReview={onReviewRecentPlan}
                            plans={recentPlans}
                        />
                    </div>
                    {planJobId && (
                        <div className='ocd-discovery-rm-plan-shell'>
                            {recentPlan && (
                                <div className='ocd-discovery-rm-recent'>
                                    <span>Recent PLAN resumed from this browser.</span>
                                    <button onClick={onForgetRecentPlan} type='button'>Forget</button>
                                </div>
                            )}
                            <OcdResourceManagerPlanReviewPanel
                                className='ocd-discovery-rm-plan-review'
                                messages={{
                                    waiting: 'Waiting for Resource Manager plan status...',
                                    ready: 'Plan succeeded and is ready for explicit review in Resource Manager.',
                                    terminalFailed: 'Plan job is terminal but not ready to apply.',
                                    running: 'Plan job is still running.',
                                }}
                                planReview={planReview}
                                planReviewError={planReviewError}
                                previewClassName='ocd-discovery-rm-plan-preview'
                            />
                        </div>
                    )}
                </div>
                <div className='ocd-discovery-provisioning-columns'>
                    <div>
                        <h4>Variables</h4>
                        <table className='ocd-discovery-table'>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Required</th>
                                    <th>Sensitive</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {provisioningDelta.variables.map((variable) => (
                                    <tr key={variable.name}>
                                        <td><code>{variable.name}</code></td>
                                        <td>{variable.required ? 'yes' : 'no'}</td>
                                        <td>{variable.sensitive ? 'yes' : 'no'}</td>
                                        <td>{variable.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h4>Review Gates</h4>
                        <ul>
                            {provisioningDelta.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                        </ul>
                    </div>
                </div>
                <div className='ocd-discovery-provisioning-files'>
                    <h4>Generated Artifacts</h4>
                    {provisioningDelta.files.map((file, index) => (
                        <details key={file.path} open={index === 0}>
                            <summary>
                                <code>{file.path}</code>
                                <span>{file.language}</span>
                            </summary>
                            <pre>{file.content}</pre>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default OcdDiscoveryLzMappingView
