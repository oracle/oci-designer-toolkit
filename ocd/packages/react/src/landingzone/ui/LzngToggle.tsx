/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Accessible on/off switch used for per-environment security-zone selection.
** Renders as a `role="switch"` button exposing `aria-checked`.
*/

import React from 'react'

export interface LzngToggleProps {
    checked: boolean
    onChange: (next: boolean) => void
    label: string
}

export function LzngToggle({ checked, onChange, label }: LzngToggleProps): JSX.Element {
    return (
        <button
            type='button'
            role='switch'
            aria-checked={checked}
            aria-label={label}
            className='ocd-lzng-switch'
            onClick={() => onChange(!checked)}
        />
    )
}
