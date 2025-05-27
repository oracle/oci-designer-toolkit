/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OciTabularResourceProps } from "../../../../../types/ReactComponentProperties.js"
import { OcdTabularContents } from "../OciTabularContents.js"

export const OciIntegrationInstance = ({ ocdDocument, ociResources, selected }: OciTabularResourceProps): JSX.Element => {
    const columnTitles: string[] = []
    const resourceElements: string[] = []
    return (
        <OcdTabularContents 
            ocdDocument={ocdDocument}
            ociResources={ociResources}
            selected={selected}
            columnTitles={columnTitles}
            resourceElements={resourceElements}
            key={'OciIntegrationInstanceTabularContents'}
        />
    )
}
