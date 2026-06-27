/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Dismissible banner shown below the dark header when the mount-time
** `probeJsonnetEngine()` health check fails — i.e. `libjsonnet.wasm` could not
** be fetched/instantiated, so Landing Zone generation and previews will fail.
** Reuses the `.ocd-lzng-update-banner` styling (Redwood `--oracle-*` tokens)
** with an `.ocd-lzng-engine-banner` modifier.
*/

import React from 'react'

export interface LzngEngineBannerProps {
    /** Error message reported by the failed engine probe. */
    error: string
    onDismiss: () => void
}

export function LzngEngineBanner({ error, onDismiss }: LzngEngineBannerProps): JSX.Element {
    return (
        <div className='ocd-lzng-update-banner ocd-lzng-engine-banner' role='alert'>
            <div className='ocd-lzng-update-banner-main'>
                <span className='ocd-lzng-update-banner-dot' aria-hidden />
                <div className='ocd-lzng-update-banner-text'>
                    <strong>Landing Zone engine unavailable</strong>
                    {' — '}the go-jsonnet WASM engine failed to load, so generation, preview and
                    downloads will not work.
                    <div className='ocd-lzng-engine-banner-error'>
                        <code>{error}</code>
                    </div>
                    <div className='ocd-lzng-update-banner-more'>
                        Ensure <code>libjsonnet.wasm</code> is served from the app root (the desktop{' '}
                        <code>prebuild</code> step copies it into place), then reload.
                    </div>
                </div>
            </div>
            <div className='ocd-lzng-update-banner-actions ocd-lzng-update-banner-dismiss-row'>
                <button
                    type='button'
                    className='ocd-lzng-update-banner-dismiss'
                    aria-label='Dismiss engine notice'
                    onClick={onDismiss}
                >
                    ✕
                </button>
            </div>
        </div>
    )
}
