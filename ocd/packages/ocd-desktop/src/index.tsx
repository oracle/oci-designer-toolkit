import { createRoot } from 'react-dom/client';
import 'ocd-react/src/css/theme.css'
import 'ocd-react/src/css/oci-theme.css'
import 'ocd-react/src/css/azure-theme.css'
import 'ocd-react/src/css/ocd.css'
import OcdConsole from 'ocd-react/src/pages/OcdConsole'

const container = document.getElementById('root')
const root = createRoot(container!); 
root.render(<OcdConsole />);
