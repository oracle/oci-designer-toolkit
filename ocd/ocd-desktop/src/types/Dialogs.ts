/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdDocument from "../components/OcdDocument"
import { OciCompartment } from "../model/provider/oci/resources"

export interface QueryDialogProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
}

export interface CompartmentPickerProps {
    compartments: OciCompartment[]
    selectedCompartmentIds: string[]
    setSelectedCompartmentIds: React.Dispatch<any>
    root: boolean
    parentId: string
}
