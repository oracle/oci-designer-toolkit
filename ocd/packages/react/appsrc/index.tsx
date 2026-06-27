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
import '../src/css/oci-stencils.css'
import '../src/css/ocd.css'
import '../src/css/ocd-svg.css'
// React-Flow (@xyflow/react) base stylesheet — REQUIRED for the LZNG network
// diagram to position nodes/edges/controls/minimap. Without it the diagram
// renders as a black minimap box + stray SVG edge paths. Must load BEFORE
// ocd-lzng.css so the custom .ocd-lzng-rf-* node skins override the base.
import '@xyflow/react/dist/style.css'
// Next-Gen (Redwood) theme tokens + the Landing Zone Next-Gen wizard stylesheet.
// Without these the LZNG wizard and its network diagram render unstyled (the
// active entry is index.tsx, not the commented-out main.tsx that the theme
// headers assume loads "every stylesheet unconditionally").
import '../src/css/ocd-redwood-ng-theme.css'
import '../src/css/ocd-lzng.css'
import OcdConsole from '../src/pages/OcdConsole'
import { StrictMode } from 'react';

const container = document.getElementById('root')
const root = createRoot(container!); 
// root.render(<StrictMode><OcdConsole /></StrictMode>)
root.render(<OcdConsole />)
