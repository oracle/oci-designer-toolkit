/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { AzureTabularResourceProps } from "../../../../../types/ReactComponentProperties"
import { OcdTabularContents } from "../AzureTabularContents"

export const AzureOracledatabaseAutonomousDatabaseRegular = ({ ocdDocument, azureResources, selected }: AzureTabularResourceProps): JSX.Element => {
    const columnTitles: string[] = []
    const resourceElements: string[] = []
    return (
        <OcdTabularContents 
            ocdDocument={ocdDocument}
            azureResources={azureResources}
            selected={selected}
            columnTitles={columnTitles}
            resourceElements={resourceElements}
            key={'AzureOracledatabaseAutonomousDatabaseRegularTabularContents'}
        />
    )
}