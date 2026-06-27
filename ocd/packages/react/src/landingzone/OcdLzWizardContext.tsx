/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** TypeScript port of the LZNG `wizardContext.jsx`. Minimal wizard state shell;
** steps own their own sub-keys under `data`. Persists to localStorage on every
** change under `ocd.lz.wizard.draft`.
*/

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { getLzConfig } from './OcdLzToModel'
import { LZ_SCAFFOLD_ENABLED_KEY } from './OcdLzReconcile'
import { LZ_OBSERVABILITY_ENABLED_KEY } from './OcdLzObservability'
import { LZ_OKE_NATIVE_ENABLED_KEY } from './OcdLzOke'
import { LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY } from './OcdLzCrossTenancyHubSpoke'

const STORAGE_KEY = 'ocd.lz.wizard.draft'
// One-shot key: a staged wizard seed produced when the user chooses to edit an
// existing saved LZ design. The provider consumes it for a single load (it wins
// over the persisted draft for that load) and the page clears it so a later
// reload falls back to the normal draft rehydrate — no double application.
const SEED_KEY = 'ocd.lz.wizard.seed'

export interface WizardState {
    data: Record<string, unknown>
}

export interface AnchorRequest {
    key: string
    ts: number
}

export interface WizardContextValue {
    data: Record<string, unknown>
    setField: (path: string, value: unknown) => void
    reset: () => void
    anchorRequest: AnchorRequest | null
    setAnchorRequest: (key: string) => void
}

type WizardAction =
    | { type: 'HYDRATE'; payload: WizardState | null }
    | { type: 'SET_FIELD'; path: string; value: unknown }
    | { type: 'RESET' }

export function defaultWizardState(): WizardState {
    return { data: {} }
}

function setNested(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
    const keys = path.split('.')
    const last = keys.pop() as string
    const clone: Record<string, unknown> = { ...obj }
    let cursor = clone
    for (const k of keys) {
        cursor[k] = { ...(cursor[k] as Record<string, unknown>) }
        cursor = cursor[k] as Record<string, unknown>
    }
    cursor[last] = value
    return clone
}

function reducer(state: WizardState, action: WizardAction): WizardState {
    switch (action.type) {
        case 'HYDRATE':
            return action.payload || state
        case 'SET_FIELD':
            return { ...state, data: setNested(state.data, action.path, action.value) }
        case 'RESET':
            return defaultWizardState()
        default:
            return state
    }
}

const WizardContext = createContext<WizardContextValue | null>(null)

/** Minimal shape of an OcdDesign needed to derive a wizard seed. */
interface LzSeedDesignLike {
    metadata?: { title?: string }
    userDefined?: Record<string, unknown>
}

/**
 * Pure mapper: turn a saved, LZ-origin design into a wizard seed (a full
 * `WizardState`) that reproduces the config, title and add-on toggles that
 * created it. Returns `null` for any design that did not originate from the LZ
 * wizard (no persisted `lzConfig`), which is also the menu-enablement signal —
 * a `null` seed means "Edit Landing Zone in Wizard" should stay disabled.
 */
export function lzConfigToWizardSeed(design: LzSeedDesignLike | null | undefined): WizardState | null {
    const config = getLzConfig(design)
    if (!config) return null
    const userDefined = design?.userDefined ?? {}
    const data: Record<string, unknown> = {
        config,
        scaffoldEnabled: Boolean(userDefined[LZ_SCAFFOLD_ENABLED_KEY]),
        observabilityEnabled: Boolean(userDefined[LZ_OBSERVABILITY_ENABLED_KEY]),
        okeNativeEnabled: Boolean(userDefined[LZ_OKE_NATIVE_ENABLED_KEY]),
        crossTenancyEnabled: Boolean(userDefined[LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY]),
    }
    const title = design?.metadata?.title
    if (typeof title === 'string' && title.trim()) data.title = title
    return { data }
}

function getLocalStorage(): Storage | null {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null
    } catch {
        return null
    }
}

/** Stage a one-shot wizard seed (no-op when seed is null). */
export function stageWizardSeed(seed: WizardState | null): void {
    if (!seed) return
    try {
        getLocalStorage()?.setItem(SEED_KEY, JSON.stringify(seed))
    } catch {
        /* ignore quota / serialisation failure */
    }
}

/** Read and clear the staged one-shot wizard seed. Returns null when none. */
export function consumeWizardSeed(): WizardState | null {
    const storage = getLocalStorage()
    if (!storage) return null
    try {
        const raw = storage.getItem(SEED_KEY)
        if (!raw) return null
        storage.removeItem(SEED_KEY)
        return JSON.parse(raw) as WizardState
    } catch {
        return null
    }
}

interface WizardProviderProps {
    children: React.ReactNode
    /**
     * Optional one-shot seed. When provided it initialises the wizard
     * synchronously (so step content reflects it on first render) and wins over
     * the persisted draft for this load. Omit for the normal create-new flow.
     */
    seed?: WizardState | null
}

export function WizardProvider({ children, seed = null }: WizardProviderProps): JSX.Element {
    // Seed (when present) initialises synchronously so WizardBody's step state
    // picks it up on first render; the persist effect below then writes it into
    // the draft so a subsequent reload restores it via the normal path.
    const [state, dispatch] = useReducer(reducer, undefined, () => seed ?? defaultWizardState())
    const [anchorRequest, internalSetAnchorRequest] = useState<AnchorRequest | null>(null)

    // Hydrate from localStorage on mount — skipped when seeded so the explicit
    // edit-this-design config is not clobbered by a stale persisted draft.
    useEffect(() => {
        if (seed) return
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY)
            if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) as WizardState })
        } catch {
            /* ignore parse failure */
        }
    }, [seed])

    // Persist every state change.
    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch {
            /* ignore quota */
        }
    }, [state])

    const setAnchorRequest = useCallback((key: string) => internalSetAnchorRequest({ key, ts: Date.now() }), [])

    const value = useMemo<WizardContextValue>(() => ({
        data: state.data,
        setField: (path: string, val: unknown) => dispatch({ type: 'SET_FIELD', path, value: val }),
        reset: () => dispatch({ type: 'RESET' }),
        anchorRequest,
        setAnchorRequest,
    }), [state, anchorRequest, setAnchorRequest])

    return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export function useWizard(): WizardContextValue {
    const ctx = useContext(WizardContext)
    if (!ctx) throw new Error('useWizard must be used within WizardProvider')
    return ctx
}

export const WIZARD_STORAGE_KEY = STORAGE_KEY
export const WIZARD_SEED_KEY = SEED_KEY
