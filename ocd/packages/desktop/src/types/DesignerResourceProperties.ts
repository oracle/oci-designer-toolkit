/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdResource, OcdValidationResult } from "@ocd/model"
import OcdDocument from "../components/OcdDocument"

export interface DesignerResourceProperties {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
}

export interface DesignerColourPicker {
    colour: string
    setColour: Function
}

export interface DesignerValidationResult {
    result: OcdValidationResult
}

export interface DesignerResourceValidationResult {
    result: OcdValidationResult
    resource: OcdResource
}
