/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { GoogleTabularResourceProps } from "../../../../../types/ReactComponentProperties.js"
import { OcdTabularContents } from "../GoogleTabularContents.js"

export const GoogleOracleDatabaseCloudVmCluster = ({ ocdDocument, googleResources, selected }: GoogleTabularResourceProps): JSX.Element => {
    const columnTitles: string[] = []
    const resourceElements: string[] = []
    return (
        <OcdTabularContents 
            ocdDocument={ocdDocument}
            googleResources={googleResources}
            selected={selected}
            columnTitles={columnTitles}
            resourceElements={resourceElements}
            key={'GoogleOracleDatabaseCloudVmClusterTabularContents'}
        />
    )
}
