/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import OcdDocument from "../components/OcdDocument"

export interface DesignerResourceProperties {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
}

export interface DesignerColourPicker {
    colour: string
    setColour: Function
}
