export type OcdResourceManagerPlanOrigin = 'designer' | 'discovery'

export interface OcdResourceManagerRecentPlan {
    id: string
    origin: OcdResourceManagerPlanOrigin
    profile: string
    region: string
    stackName: string
    jobId: string
    stackId?: string
    packageDigest?: string
    submittedAt: string
}

export interface OcdResourceManagerRecentPlanFilter {
    origin?: OcdResourceManagerPlanOrigin
    profile?: string
    region?: string
}

export type OcdResourceManagerRecentPlanReviewState = 'missing' | 'current' | 'stale'

export interface OcdResourceManagerRecentPlanReviewSummary {
    state: OcdResourceManagerRecentPlanReviewState
    label: string
    detail: string
}

const STORAGE_KEY = 'ocd.resourceManager.recentPlans'
const MAX_RECENT_PLANS = 10

const storage = (): Storage | undefined => {
    try {
        if (typeof localStorage === 'undefined' || localStorage === null) return undefined
        return localStorage
    } catch {
        return undefined
    }
}

const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

const isRecentPlan = (value: unknown): value is OcdResourceManagerRecentPlan => {
    if (!value || typeof value !== 'object') return false
    const candidate = value as Partial<OcdResourceManagerRecentPlan>
    return (candidate.origin === 'designer' || candidate.origin === 'discovery')
        && isString(candidate.id)
        && isString(candidate.profile)
        && isString(candidate.region)
        && isString(candidate.stackName)
        && isString(candidate.jobId)
        && isString(candidate.submittedAt)
}

const normalizeFilter = (filter: OcdResourceManagerRecentPlanFilter): OcdResourceManagerRecentPlanFilter => ({
    ...(filter.origin ? { origin: filter.origin } : {}),
    ...(filter.profile ? { profile: filter.profile.trim() } : {}),
    ...(filter.region ? { region: filter.region.trim() } : {}),
})

const matchesFilter = (plan: OcdResourceManagerRecentPlan, filter: OcdResourceManagerRecentPlanFilter): boolean => {
    const normalizedFilter = normalizeFilter(filter)
    return (!normalizedFilter.origin || plan.origin === normalizedFilter.origin)
        && (!normalizedFilter.profile || plan.profile === normalizedFilter.profile)
        && (!normalizedFilter.region || plan.region === normalizedFilter.region)
}

export const filterResourceManagerRecentPlans = (
    plans: readonly OcdResourceManagerRecentPlan[],
    filter: OcdResourceManagerRecentPlanFilter,
): OcdResourceManagerRecentPlan[] =>
    plans.filter((plan) => matchesFilter(plan, filter))

export const makeResourceManagerRecentPlanId = (profile: string, region: string, jobId: string): string =>
    `${profile.trim()}::${region.trim()}::${jobId.trim()}`

export const loadResourceManagerRecentPlans = (): OcdResourceManagerRecentPlan[] => {
    try {
        const raw = storage()?.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
            .filter(isRecentPlan)
            .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
            .slice(0, MAX_RECENT_PLANS)
    } catch {
        return []
    }
}

export const findLatestResourceManagerRecentPlan = (
    filter: OcdResourceManagerRecentPlanFilter,
): OcdResourceManagerRecentPlan | undefined =>
    loadResourceManagerRecentPlans().find((plan) => matchesFilter(plan, filter))

export const saveResourceManagerRecentPlan = (
    plan: Omit<OcdResourceManagerRecentPlan, 'id' | 'submittedAt'> & Partial<Pick<OcdResourceManagerRecentPlan, 'id' | 'submittedAt'>>,
): OcdResourceManagerRecentPlan | undefined => {
    const normalizedPlan: OcdResourceManagerRecentPlan = {
        ...plan,
        id: plan.id ?? makeResourceManagerRecentPlanId(plan.profile, plan.region, plan.jobId),
        profile: plan.profile.trim(),
        region: plan.region.trim(),
        stackName: plan.stackName.trim(),
        jobId: plan.jobId.trim(),
        stackId: plan.stackId?.trim(),
        packageDigest: plan.packageDigest?.trim(),
        submittedAt: plan.submittedAt ?? new Date().toISOString(),
    }
    if (!isRecentPlan(normalizedPlan)) return undefined
    try {
        const retainedPlans = loadResourceManagerRecentPlans()
            .filter((existing) => existing.id !== normalizedPlan.id)
            .slice(0, MAX_RECENT_PLANS - 1)
        storage()?.setItem(STORAGE_KEY, JSON.stringify([normalizedPlan, ...retainedPlans]))
        return normalizedPlan
    } catch {
        return undefined
    }
}

export const removeResourceManagerRecentPlan = (id: string): void => {
    try {
        const retainedPlans = loadResourceManagerRecentPlans().filter((plan) => plan.id !== id)
        storage()?.setItem(STORAGE_KEY, JSON.stringify(retainedPlans))
    } catch {
        // Best-effort local convenience only.
    }
}

export const buildResourceManagerRecentPlanReviewSummary = (
    plan: OcdResourceManagerRecentPlan | undefined,
    currentPackageDigest = '',
): OcdResourceManagerRecentPlanReviewSummary => {
    if (!plan) {
        return {
            state: 'missing',
            label: 'No recent PLAN',
            detail: 'Submit a Resource Manager PLAN for the current package before reviewing apply output.',
        }
    }
    const planDigest = plan.packageDigest?.trim() ?? ''
    const expectedDigest = currentPackageDigest.trim()
    if (plan.origin === 'discovery' && expectedDigest && planDigest !== expectedDigest) {
        return {
            state: 'stale',
            label: 'Recent PLAN stale',
            detail: `Generated package changed since job ${plan.jobId}. Submit a new PLAN before apply.`,
        }
    }
    return {
        state: 'current',
        label: 'Recent PLAN current',
        detail: [plan.stackName, plan.jobId, planDigest === expectedDigest && expectedDigest ? 'current' : '']
            .filter(Boolean)
            .join(' / '),
    }
}
