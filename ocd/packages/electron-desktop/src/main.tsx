/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

// // Use contextBridge
// window.ipcRenderer.on('main-process-message', (_event, message) => {
//   console.log(message)
// })

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
root.render(<React.StrictMode><OcdConsole /></React.StrictMode>)
// root.render(<OcdConsole />)
