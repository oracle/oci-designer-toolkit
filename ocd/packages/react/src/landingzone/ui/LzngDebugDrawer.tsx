/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Debug slide-over drawer. Shows the serialized config.jsonnet (read-only) for
** the current wizard config. Replaces the old 'code' layout toggle with an
** explicit, closable drawer reachable from the header "Debug" button.
*/

import React, { useEffect, useRef } from 'react'

export interface LzngDebugDrawerProps {
    open: boolean
    content: string
    onClose: () => void
}

export function LzngDebugDrawer({ open, content, onClose }: LzngDebugDrawerProps): JSX.Element | null {
    const closeRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!open) return
        closeRef.current?.focus()
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className='ocd-lzng-drawer-overlay' onClick={onClose}>
            <aside
                className='ocd-lzng-drawer'
                role='dialog'
                aria-modal='true'
                aria-label='Debug config.jsonnet'
                onClick={(event) => event.stopPropagation()}
            >
                <div className='ocd-lzng-drawer-head'>
                    <h2 className='ocd-lzng-drawer-title'>Debug — config.jsonnet</h2>
                    <button
                        ref={closeRef}
                        type='button'
                        className='ocd-lzng-btn'
                        onClick={onClose}
                        aria-label='Close debug drawer'
                    >
                        Close
                    </button>
                </div>
                <div className='ocd-lzng-drawer-body'>
                    <pre className='ocd-lzng-pre'>{content}</pre>
                </div>
            </aside>
        </div>
    )
}
