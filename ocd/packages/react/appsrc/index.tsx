/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
import { createRoot } from 'react-dom/client';
import '../src/css/theme.css'
import '../src/css/oci-theme.css'
import '../src/css/azure-theme.css'
import '../src/css/google-theme.css'
import '../src/css/general-theme.css'
import '../src/css/ocd.css'
import '../src/css/ocd-svg.css'
import OcdConsole from '../src/pages/OcdConsole'
import { StrictMode } from 'react';

const container = document.getElementById('root')
const root = createRoot(container!); 
// root.render(<StrictMode><OcdConsole /></StrictMode>)
root.render(<OcdConsole />)

