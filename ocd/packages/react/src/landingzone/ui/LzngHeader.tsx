/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Dark OCI application header bar for the Landing Zone Next Gen wizard. Shows the
** Oracle brand lockup on the left and a segmented group of ghost layout-toggle
** icon buttons on the right that drive the body layout (split / list / diagram /
** code views).
*/

import React from 'react'

export type LzngLayout = 'split' | 'list' | 'diagram'

export interface LzngHeaderProps {
    layout: LzngLayout
    onLayoutChange: (layout: LzngLayout) => void
    onExit: () => void
}

interface ToggleDef {
    id: LzngLayout
    title: string
    icon: JSX.Element
}

const SPLIT_ICON = (
    <svg viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.4' aria-hidden>
        <rect x='1.5' y='2.5' width='13' height='11' rx='1.5' />
        <line x1='8' y1='2.5' x2='8' y2='13.5' />
    </svg>
)

const LIST_ICON = (
    <svg viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.4' aria-hidden>
        <line x1='2.5' y1='4' x2='13.5' y2='4' />
        <line x1='2.5' y1='8' x2='13.5' y2='8' />
        <line x1='2.5' y1='12' x2='13.5' y2='12' />
    </svg>
)

const DIAGRAM_ICON = (
    <svg viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.4' aria-hidden>
        <rect x='2' y='2' width='5' height='5' rx='1' />
        <rect x='9' y='9' width='5' height='5' rx='1' />
        <line x1='4.5' y1='7' x2='4.5' y2='11.5' />
        <line x1='4.5' y1='11.5' x2='9' y2='11.5' />
    </svg>
)

const TOGGLES: ToggleDef[] = [
    { id: 'split', title: 'Split panel', icon: SPLIT_ICON },
    { id: 'list', title: 'Form only', icon: LIST_ICON },
    { id: 'diagram', title: 'Preview only', icon: DIAGRAM_ICON },
]

export function LzngHeader({ layout, onLayoutChange, onExit }: LzngHeaderProps): JSX.Element {
    return (
        <header className='ocd-lzng-header'>
            <div className='ocd-lzng-brand'>
                <button type='button' className='ocd-lzng-exit-btn' title='Back to OCD Designer' aria-label='Back to OCD Designer' onClick={onExit}>
                    <svg viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.6' aria-hidden>
                        <polyline points='9.5,3.5 5,8 9.5,12.5' />
                    </svg>
                    <span>Designer</span>
                </button>
                <span className='ocd-lzng-brand-divider' aria-hidden />
                <span className='ocd-lzng-logo' aria-hidden />
                <span className='ocd-lzng-brand-name'>Oracle Designer Toolkit - OCTO</span>
                <span className='ocd-lzng-brand-divider' aria-hidden />
                <span className='ocd-lzng-brand-sub'>Landing Zone Next Gen</span>
            </div>
            <div className='ocd-lzng-layout-toggles' role='group' aria-label='Layout'>
                {TOGGLES.map((toggle) => (
                    <button
                        key={toggle.id}
                        type='button'
                        className='ocd-lzng-toggle-btn'
                        title={toggle.title}
                        aria-label={toggle.title}
                        aria-pressed={layout === toggle.id}
                        onClick={() => onLayoutChange(toggle.id)}
                    >
                        {toggle.icon}
                    </button>
                ))}
            </div>
        </header>
    )
}
