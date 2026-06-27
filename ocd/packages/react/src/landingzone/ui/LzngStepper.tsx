/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Five-step wizard stepper. Each step is a clickable <button>; the active step is
** marked with `aria-current="step"` and gets the solid-red treatment in CSS.
*/

import React from 'react'

export interface LzngStep {
    id: string
    label: string
}

export const LZNG_STEPS: LzngStep[] = [
    { id: 'foundation', label: 'Foundation' },
    { id: 'hub', label: 'Hub Network' },
    { id: 'projects', label: 'Projects' },
    { id: 'templates', label: 'Platform Templates' },
    { id: 'review', label: 'Review' },
]

export interface LzngStepperProps {
    activeIndex: number
    onSelect: (index: number) => void
}

export function LzngStepper({ activeIndex, onSelect }: LzngStepperProps): JSX.Element {
    return (
        <nav className='ocd-lzng-stepper' aria-label='Wizard steps'>
            {LZNG_STEPS.map((step, index) => {
                const isActive = index === activeIndex
                return (
                    <button
                        key={step.id}
                        type='button'
                        className='ocd-lzng-step'
                        aria-current={isActive ? 'step' : undefined}
                        onClick={() => onSelect(index)}
                    >
                        <span className='ocd-lzng-step-num'>{index + 1}</span>
                        <span className='ocd-lzng-step-label'>{step.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}
