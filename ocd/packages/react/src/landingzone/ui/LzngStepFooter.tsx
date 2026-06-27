/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Per-step wizard footer. Back (left, disabled on the first step) advances to the
** previous step; Continue (right) advances to the next, optionally blocked when
** the current step is invalid. On the last (Review) step Continue is hidden — the
** Review step renders its own actions (Open in Designer / Download all) instead.
*/

import React from 'react'

export interface LzngStepFooterProps {
    isFirst: boolean
    isLast: boolean
    canContinue: boolean
    onBack: () => void
    onContinue: () => void
}

export function LzngStepFooter({ isFirst, isLast, canContinue, onBack, onContinue }: LzngStepFooterProps): JSX.Element {
    return (
        <div className='ocd-lzng-step-footer'>
            <button
                type='button'
                className='ocd-lzng-btn'
                disabled={isFirst}
                onClick={onBack}
            >
                Back
            </button>
            {!isLast && (
                <button
                    type='button'
                    className='ocd-lzng-btn ocd-lzng-btn-primary'
                    disabled={!canContinue}
                    onClick={onContinue}
                >
                    Continue
                </button>
            )}
        </div>
    )
}
