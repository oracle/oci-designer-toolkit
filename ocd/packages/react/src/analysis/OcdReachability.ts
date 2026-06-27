/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Reachability / smart-connectivity graph analysis.
**
** evaluateReachability(design) is pure and idempotent — it reads the OCD design
** model and returns GovernanceFinding[] covering network-intent violations:
**
**   REACH-01  Subnet has no egress route (no 0.0.0.0/0 default route)
**   REACH-02  Dangling route target (networkEntityId references absent gateway)
**   REACH-03  Internet-reachable database (DB subnet has IGW default route)
**   REACH-04  Public subnet hosts a database (prohibitPublicIpOnVnic=false + DB)
**   REACH-05  Subnet references a missing route table or security list
**
** This module is the orchestration layer: it builds the design lookup maps and
** runs every reachability rule. The graph-construction and the rule
** implementations live in the sibling OcdReachabilityGraph module.
**
** No live OCI API calls; reads only design.model.oci.resources.
*/

import { OcdDesign } from '@ocd/model'
import {
    GovernanceFinding,
    GovernanceSeverity,
    GovernanceCategory,
    GovernanceRemediation,
} from '../governance/OcdGovernanceChecks'
import { buildMaps, REACHABILITY_RULES } from './OcdReachabilityGraph'

// Re-export so consumers can import from one place if desired.
export type { GovernanceFinding, GovernanceSeverity, GovernanceCategory, GovernanceRemediation }
export type { DesignMaps, ReachabilityRule } from './OcdReachabilityGraph'

/**
 * Run all reachability / smart-connectivity checks against an OcdDesign.
 *
 * Pure function — no side effects, no mutation of the design.
 * Safe to call with a partially-initialised or empty design.
 * Never throws to the caller — a broken rule returns [] and is silently skipped.
 *
 * @param design - The OcdDesign to analyse.
 * @returns GovernanceFinding[] using the same type as evaluateGovernance().
 */
export function evaluateReachability(design: OcdDesign): GovernanceFinding[] {
    if (!design?.model?.oci?.resources) return []
    const maps = buildMaps(design)
    return REACHABILITY_RULES.flatMap((fn) => {
        try {
            return fn(design, maps)
        } catch {
            // Graceful: a broken rule must never crash the panel.
            return []
        }
    })
}
