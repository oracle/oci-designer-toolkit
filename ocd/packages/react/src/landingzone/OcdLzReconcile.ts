/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Dual-tick reconcile wiring for the Realm > Region > AD > FD scaffold.
**
** Two user "ticks" gate the (pure, idempotent) `reconcileLzScaffold`:
**
**   - lzScaffoldEnabled  — set from the LZ wizard tick when a design is opened
**                          in the Designer. It records that the user asked for
**                          the AD/FD scaffold to be generated.
**   - lzReconcileEnabled — set from the Designer tick. It records that edits
**                          should be live-reconciled back into the scaffold.
**
** When BOTH are on, an edit in either surface re-applies the scaffold. Because
** `reconcileLzScaffold` is idempotent (a second pass over its own output is a
** structural no-op), the only loop risk is React re-rendering: this module
** therefore exposes `reconcileOnEdit`, which only returns a *new* design when
** the reconcile actually changed something (compared by stable JSON), so the
** caller can skip a redundant `setOcdDocument` and avoid an update cycle.
**
** All helpers are pure and immutable; the input design is never mutated.
*/

import { OcdDesign } from '@ocd/model'
import { reconcileLzScaffold } from './OcdLzScaffold'
import { getLzConfig } from './OcdLzToModel'
import { isLzOriginDesign } from './OcdLzPlacement'

/** `design.userDefined` key: the wizard tick (generate scaffold on open). */
export const LZ_SCAFFOLD_ENABLED_KEY = 'lzScaffoldEnabled'

/** `design.userDefined` key: the Designer tick (live reconcile on edit). */
export const LZ_RECONCILE_ENABLED_KEY = 'lzReconcileEnabled'

/** Read the wizard scaffold tick off a design (defaults to false). */
export function isScaffoldEnabled(design: { userDefined?: Record<string, unknown> } | null | undefined): boolean {
    return Boolean(design?.userDefined?.[LZ_SCAFFOLD_ENABLED_KEY])
}

/** Read the Designer live-reconcile tick off a design (defaults to false). */
export function isReconcileEnabled(design: { userDefined?: Record<string, unknown> } | null | undefined): boolean {
    return Boolean(design?.userDefined?.[LZ_RECONCILE_ENABLED_KEY])
}

/**
 * Whether the Designer live-reconcile toggle should be offered at all: only for
 * LZ-origin designs that still carry a persisted wizard `LandingZoneConfig`
 * (the scaffold has nothing to rebuild from otherwise).
 */
export function canReconcile(design: { userDefined?: Record<string, unknown> } | null | undefined): boolean {
    return isLzOriginDesign(design) && Boolean(getLzConfig(design))
}

/**
 * Run the scaffold reconcile for a model edit, but only when BOTH ticks are on.
 *
 * Returns:
 *   - the SAME design reference when reconcile is not applicable (ticks off, not
 *     LZ-origin, no config) OR when reconcile produced a structurally identical
 *     design — so the caller can skip committing and avoid an update loop;
 *   - a NEW reconciled design otherwise.
 *
 * Idempotency of `reconcileLzScaffold` guarantees a second pass is a no-op, so
 * re-entrancy here is bounded: a follow-up call on the returned design hits the
 * equality short-circuit and returns the same reference.
 */
export function reconcileOnEdit(design: OcdDesign): OcdDesign {
    if (!isScaffoldEnabled(design) || !isReconcileEnabled(design)) return design
    if (!canReconcile(design)) return design

    const reconciled = reconcileLzScaffold(design)
    if (reconciled === design) return design
    // Stable structural comparison: skip the commit when nothing actually moved.
    if (JSON.stringify(reconciled) === JSON.stringify(design)) return design
    return reconciled
}
