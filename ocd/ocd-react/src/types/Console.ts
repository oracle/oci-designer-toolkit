/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import OcdConsoleConfig from "../components/OcdConsoleConfiguration"
import OcdDocument from "../components/OcdDocument"

export interface ConsolePageProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    ocdConsoleConfig: OcdConsoleConfig
    setOcdConsoleConfig: React.Dispatch<any>
}

