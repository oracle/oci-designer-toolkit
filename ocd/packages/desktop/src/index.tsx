import { createRoot } from 'react-dom/client';
import './css/theme.css'
import './css/oci-theme.css'
import './css/azure-theme.css'
import './css/ocd.css'
import './css/ocd-svg.css'
import OcdConsole from './pages/OcdConsole'

const container = document.getElementById('root')
const root = createRoot(container!); 
root.render(<OcdConsole />);

