/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Persistence for the Software & Ansible module's package selection. The
** blueprint's data-flow sinks the selection into `OcdDesign.userDefined.ansible`
** so it survives a save/reload of the design (the same `userDefined` channel the
** LZ wizard uses for its config). `getAnsibleSelection` is a pure, defensive
** read; `writeAnsibleSelection` mutates `design.userDefined` in place following
** the house pattern (callers then `setOcdDocument(OcdDocument.clone(...))` to
** propagate the change), and is the single writer of the key.
*/

/** `design.userDefined` key under which the Ansible provisioning state lives. */
export const ANSIBLE_USERDEFINED_KEY = 'ansible'

export interface AnsibleSelectionState {
    /** Catalogue package ids the user selected for provisioning. */
    packageIds: string[]
}

interface DesignLike {
    userDefined?: Record<string, unknown>
}

/** Read the persisted selection. Returns `[]` for any design without one. */
export function getAnsibleSelection(design: DesignLike | null | undefined): string[] {
    const state = design?.userDefined?.[ANSIBLE_USERDEFINED_KEY] as AnsibleSelectionState | undefined
    const ids = state?.packageIds
    if (!Array.isArray(ids)) return []
    // De-dupe + drop non-strings; preserve first-seen order.
    const seen = new Set<string>()
    const out: string[] = []
    for (const id of ids) {
        if (typeof id === 'string' && id && !seen.has(id)) {
            seen.add(id)
            out.push(id)
        }
    }
    return out
}

/**
 * Persist the selection onto the design (mutates `design.userDefined`, house
 * pattern). Ids are de-duped + filtered to non-empty strings. Returns the same
 * design for chaining. Writing an empty selection clears the key's payload but
 * keeps the design LZ-/userDefined-shape intact.
 */
export function writeAnsibleSelection<T extends DesignLike>(design: T, packageIds: ReadonlyArray<string>): T {
    const seen = new Set<string>()
    const clean: string[] = []
    for (const id of packageIds) {
        if (typeof id === 'string' && id && !seen.has(id)) {
            seen.add(id)
            clean.push(id)
        }
    }
    if (!design.userDefined) design.userDefined = {}
    design.userDefined[ANSIBLE_USERDEFINED_KEY] = { packageIds: clean } satisfies AnsibleSelectionState
    return design
}
