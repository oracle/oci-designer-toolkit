import {
    filterResourceManagerRecentPlans,
    type OcdResourceManagerRecentPlan,
    type OcdResourceManagerRecentPlanFilter,
} from './OcdResourceManagerPlanRegistry'

export interface OcdResourceManagerRecentPlansProps {
    currentProfile?: string
    currentRegion?: string
    limit?: number
    onForget: (plan: OcdResourceManagerRecentPlan) => void
    onReview: (plan: OcdResourceManagerRecentPlan) => void
    plans: readonly OcdResourceManagerRecentPlan[]
}

export const buildResourceManagerRecentPlanDisplayList = (
    plans: readonly OcdResourceManagerRecentPlan[],
    filter: OcdResourceManagerRecentPlanFilter,
    limit = 6,
): OcdResourceManagerRecentPlan[] => {
    const matchingPlans = filterResourceManagerRecentPlans(plans, filter)
    const otherPlans = plans.filter((plan) => !matchingPlans.some((matchingPlan) => matchingPlan.id === plan.id))
    return [...matchingPlans, ...otherPlans].slice(0, Math.max(0, limit))
}

export const OcdResourceManagerRecentPlans = ({
    currentProfile = '',
    currentRegion = '',
    limit = 6,
    onForget,
    onReview,
    plans,
}: OcdResourceManagerRecentPlansProps): JSX.Element => {
    const displayedPlans = buildResourceManagerRecentPlanDisplayList(plans, {
        profile: currentProfile,
        region: currentRegion,
    }, limit)
    return (
        <div className='ocd-resource-manager-recent-plans'>
            {displayedPlans.length === 0 && <span>No local Resource Manager PLAN history in this browser.</span>}
            {displayedPlans.map((plan) => (
                <div key={plan.id}>
                    <button onClick={() => onReview(plan)} type='button'>Review</button>
                    <span>{plan.origin === 'discovery' ? 'Discovery' : 'Designer'}</span>
                    <strong>{plan.stackName}</strong>
                    <small>{plan.profile} / {plan.region} / {plan.jobId}</small>
                    <button onClick={() => onForget(plan)} type='button'>Forget</button>
                </div>
            ))}
        </div>
    )
}
