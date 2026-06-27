import { useEffect, useState } from 'react'
import type { OciResourceManagerPlanReview } from '@ocd/query'
import { formatOciBackendError, OciApiFacade } from '../facade/OciApiFacade'

export const RESOURCE_MANAGER_PLAN_POLL_INTERVAL_MS = 5000
export const RESOURCE_MANAGER_PLAN_POLL_MAX_ATTEMPTS = 120

export interface UseResourceManagerPlanReviewOptions {
    profile: string
    region: string
    jobId: string
    timeoutMessage?: string
}

export interface ResourceManagerPlanReviewState {
    planReview?: OciResourceManagerPlanReview
    planReviewError: string
}

export interface ResourceManagerPlanReviewMessages {
    waiting?: string
    ready?: string
    terminalFailed?: string
    running?: string
}

export interface ResourceManagerPlanReviewPanelProps extends ResourceManagerPlanReviewState {
    className?: string
    lifecycleState?: string
    messages?: ResourceManagerPlanReviewMessages
    previewClassName?: string
    title?: string
}

export function formatResourceManagerPlanReviewMessage(
    planReview?: OciResourceManagerPlanReview,
    messages: ResourceManagerPlanReviewMessages = {},
): string {
    if (!planReview) return messages.waiting ?? 'Waiting for Resource Manager plan status...'
    if (planReview.readyToApply) return messages.ready ?? 'Plan succeeded and is ready for explicit review.'
    if (planReview.terminal) return messages.terminalFailed ?? 'Plan job is terminal but not ready to apply.'
    return messages.running ?? 'Plan job is still running.'
}

export function useResourceManagerPlanReview({
    profile,
    region,
    jobId,
    timeoutMessage = 'Plan job is still running. Refresh this view to continue polling.',
}: UseResourceManagerPlanReviewOptions): ResourceManagerPlanReviewState {
    const [planReview, setPlanReview] = useState<OciResourceManagerPlanReview | undefined>(undefined)
    const [planReviewError, setPlanReviewError] = useState('')

    useEffect(() => {
        if (!jobId) {
            setPlanReview(undefined)
            setPlanReviewError('')
            return
        }
        let cancelled = false
        let timeout: ReturnType<typeof setTimeout> | undefined
        const pollPlanReview = (attempt: number) => {
            OciApiFacade.getResourceManagerPlanReview(profile, region, jobId).then((review) => {
                if (cancelled) return
                setPlanReview(review)
                setPlanReviewError('')
                if (!review.terminal && attempt < RESOURCE_MANAGER_PLAN_POLL_MAX_ATTEMPTS) {
                    timeout = setTimeout(() => pollPlanReview(attempt + 1), RESOURCE_MANAGER_PLAN_POLL_INTERVAL_MS)
                } else if (!review.terminal) {
                    setPlanReviewError(timeoutMessage)
                }
            }).catch((reason) => {
                if (cancelled) return
                setPlanReview(undefined)
                setPlanReviewError(formatOciBackendError(reason))
            })
        }
        setPlanReview(undefined)
        setPlanReviewError('')
        pollPlanReview(0)
        return () => {
            cancelled = true
            if (timeout) clearTimeout(timeout)
        }
    }, [jobId, profile, region, timeoutMessage])

    return { planReview, planReviewError }
}

export const OcdResourceManagerPlanReviewPanel = ({
    className = 'ocd-resource-manager-plan-review',
    lifecycleState = 'SUBMITTED',
    messages = {},
    planReview,
    planReviewError,
    previewClassName = 'ocd-resource-manager-plan-preview',
    title = 'Plan review',
}: ResourceManagerPlanReviewPanelProps): JSX.Element => (
    <div className={className}>
        <div>
            <strong>{title}</strong>
            <span>{planReview?.job.lifecycleState ?? lifecycleState}</span>
        </div>
        {planReviewError && <span className='ocd-resource-manager-error'>{planReviewError}</span>}
        {!planReview && !planReviewError && <span>{formatResourceManagerPlanReviewMessage(undefined, messages)}</span>}
        {planReview && (
            <>
                <span>{formatResourceManagerPlanReviewMessage(planReview, messages)}</span>
                <textarea
                    className={previewClassName}
                    readOnly
                    value={planReview.planText}
                    placeholder='Terraform plan output appears here after Resource Manager returns it.'
                />
            </>
        )}
    </div>
)
