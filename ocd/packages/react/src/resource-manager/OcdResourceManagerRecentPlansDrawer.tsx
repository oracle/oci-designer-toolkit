import { useCallback, useEffect, useState } from 'react'
import { OcdResourceManagerPlanReviewPanel, useResourceManagerPlanReview } from './OcdResourceManagerPlanReview'
import {
    loadResourceManagerRecentPlans,
    removeResourceManagerRecentPlan,
    type OcdResourceManagerRecentPlan,
} from './OcdResourceManagerPlanRegistry'
import { OcdResourceManagerRecentPlans } from './OcdResourceManagerRecentPlans'

export interface OcdResourceManagerRecentPlansDrawerProps {
    onClose: () => void
    open: boolean
}

export const formatResourceManagerRecentPlanJobCount = (count: number): string =>
    `${count} local ${count === 1 ? 'job' : 'jobs'}`

export const useResourceManagerRecentPlanCount = (): number => {
    const [count, setCount] = useState(0)
    useEffect(() => {
        const refreshCount = () => setCount(loadResourceManagerRecentPlans().length)
        refreshCount()
        const interval = setInterval(refreshCount, 5000)
        window.addEventListener('storage', refreshCount)
        return () => {
            clearInterval(interval)
            window.removeEventListener('storage', refreshCount)
        }
    }, [])
    return count
}

export const OcdResourceManagerRecentPlansDrawer = ({
    onClose,
    open,
}: OcdResourceManagerRecentPlansDrawerProps): JSX.Element | null => {
    const [plans, setPlans] = useState<OcdResourceManagerRecentPlan[]>([])
    const [selectedPlan, setSelectedPlan] = useState<OcdResourceManagerRecentPlan | undefined>(undefined)
    const { planReview, planReviewError } = useResourceManagerPlanReview({
        profile: selectedPlan?.profile ?? '',
        region: selectedPlan?.region ?? '',
        jobId: selectedPlan?.jobId ?? '',
        timeoutMessage: 'Plan job is still running. Leave this drawer open or return later from Recent PLAN history.',
    })

    const refreshPlans = useCallback(() => {
        setPlans(loadResourceManagerRecentPlans())
    }, [])

    useEffect(() => {
        if (!open) return
        refreshPlans()
    }, [open, refreshPlans])

    useEffect(() => {
        if (!open) return undefined
        const onStorage = () => refreshPlans()
        const interval = setInterval(refreshPlans, 5000)
        window.addEventListener('storage', onStorage)
        return () => {
            clearInterval(interval)
            window.removeEventListener('storage', onStorage)
        }
    }, [open, refreshPlans])

    const onReview = (plan: OcdResourceManagerRecentPlan) => {
        setSelectedPlan(plan)
    }

    const onForget = (plan: OcdResourceManagerRecentPlan) => {
        removeResourceManagerRecentPlan(plan.id)
        const nextPlans = loadResourceManagerRecentPlans()
        setPlans(nextPlans)
        if (selectedPlan?.id === plan.id) setSelectedPlan(undefined)
    }

    if (!open) return null

    return (
        <aside className='ocd-resource-manager-plan-drawer' aria-label='Recent Resource Manager PLAN jobs'>
            <div className='ocd-resource-manager-plan-drawer-header'>
                <div>
                    <strong>Recent PLAN history</strong>
                    <span>{formatResourceManagerRecentPlanJobCount(plans.length)}</span>
                </div>
                <button type='button' onClick={onClose}>Close</button>
            </div>
            <OcdResourceManagerRecentPlans
                limit={10}
                onForget={onForget}
                onReview={onReview}
                plans={plans}
            />
            {selectedPlan && (
                <OcdResourceManagerPlanReviewPanel
                    lifecycleState='LOADED'
                    messages={{
                        waiting: `Polling Resource Manager PLAN ${selectedPlan.jobId}...`,
                        ready: 'Plan succeeded. Open the Resource Manager export dialog to apply with explicit confirmation.',
                    }}
                    planReview={planReview}
                    planReviewError={planReviewError}
                    title={`Plan review: ${selectedPlan.stackName}`}
                />
            )}
        </aside>
    )
}
