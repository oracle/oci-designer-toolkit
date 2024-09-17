/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { GcpTabularResourceProps } from "../../../../../types/ReactComponentProperties"
import { OcdTabularContents } from "../GcpTabularContents"

export const GcpOracledatabaseCloudVmCluster = ({ ocdDocument, gcpResources, selected }: GcpTabularResourceProps): JSX.Element => {
    const columnTitles: string[] = []
    const resourceElements: string[] = []
    return (
        <OcdTabularContents 
            ocdDocument={ocdDocument}
            gcpResources={gcpResources}
            selected={selected}
            columnTitles={columnTitles}
            resourceElements={resourceElements}
            key={'GcpOracledatabaseCloudVmClusterTabularContents'}
        />
    )
}
