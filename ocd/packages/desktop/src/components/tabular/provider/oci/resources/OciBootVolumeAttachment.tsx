/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OciTabularResourceProps } from "../../../../../types/ReactComponentProperties"
import { OcdTabularContents } from "../OciTabularContents"

export const OciBootVolumeAttachment = ({ ocdDocument, ociResources, selected }: OciTabularResourceProps): JSX.Element => {
    const columnTitles: string[] = []
    const resourceElements: string[] = []
    return (
        <OcdTabularContents 
            ocdDocument={ocdDocument}
            ociResources={ociResources}
            selected={selected}
            columnTitles={columnTitles}
            resourceElements={resourceElements}
            key={'OciBootVolumeAttachmentTabularContents'}
        />
    )
}
