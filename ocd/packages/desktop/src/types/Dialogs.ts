/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdDocument from "../components/OcdDocument"
import { OciModelResources } from '@ocd/model'

export interface QueryDialogProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
}

export interface CompartmentPickerProps {
    compartments: OciModelResources.OciCompartment[]
    selectedCompartmentIds: string[]
    setSelectedCompartmentIds: React.Dispatch<any>
    root: boolean
    parentId: string
    setHierarchy: React.Dispatch<any>
    refs: Record<string, React.RefObject<any>>
}
