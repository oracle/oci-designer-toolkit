// import { render } from 'preact'
import { OcdConsole } from '@ocd/react'
import { OcdLogger } from '@ocd/core'
import './css/theme.css'
import './css/ocd-default-theme.css'
import './css/ocd-light-theme.css'
import './css/ocd-redwood-theme.css'
import './css/ocd-redwood-ng-theme.css'
import './css/oci-theme.css'
import './css/azure-theme.css'
import './css/google-theme.css'
import './css/general-theme.css'
import './css/oci-stencils.css'
import './css/ocd.css'
import './css/ocd-svg.css'
import './css/ocd-lzng.css'
import '@xyflow/react/dist/style.css'
import React from 'react'
import { createRoot } from 'react-dom/client';

// Preact
// render(<OcdConsole />, document.getElementById('root')!)

// React
const container = document.getElementById('root')
const root = createRoot(container!);
const logger = OcdLogger.scope('renderer')
window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled rejection', event.reason)
})
// root.render(<StrictMode><OcdConsole /></StrictMode>)
root.render(<OcdConsole />)
