/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Shared types for the OCD cost estimator. Re-exports the pricing primitives
** from @ocd/query so the cost layer has a single import surface.
*/

import type { PriceMap, PriceMapEntry } from '@ocd/query/pricing'

export type { PriceMap, PriceMapEntry }

// Oracle Cloud bills hourly metrics on a 744-hour (31-day) month basis, which
// is the convention used by the Oracle Cloud Cost Estimator.
export const HOURS_PER_MONTH = 744

export type CostConfidence = 'confident' | 'approximate' | 'not-costed'

export interface CostAssumptions {
    hoursPerMonth: number
    currency: string
}

export interface CostLineItemResult {
    resourceType: string
    label: string
    count: number
    partNumbers: string[]
    monthlyCost: number
    confidence: CostConfidence
    note?: string
}

export interface CostEstimateResult {
    currency: string
    totalMonthly: number
    lineItems: CostLineItemResult[]
    notCosted: CostLineItemResult[]
    missingParts: string[]
    assumptions: CostAssumptions
}
