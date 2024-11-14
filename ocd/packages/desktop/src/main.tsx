// import { render } from 'preact'
import { OcdConsole } from '@ocd/react'
import './css/theme.css'
import './css/oci-theme.css'
import './css/azure-theme.css'
import './css/google-theme.css'
import './css/general-theme.css'
import './css/ocd.css'
import './css/ocd-svg.css'
import React from 'react'
import { createRoot } from 'react-dom/client';

// Preact
// render(<OcdConsole />, document.getElementById('root')!)

// React
const container = document.getElementById('root')
const root = createRoot(container!); 
// root.render(<StrictMode><OcdConsole /></StrictMode>)
root.render(<OcdConsole />)
