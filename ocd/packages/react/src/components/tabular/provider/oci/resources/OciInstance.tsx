/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OciTabularResourceProps } from "../../../../../types/ReactComponentProperties"
import { OcdTabularContents } from "../OciTabularContents"

export const OciInstance = ({ ocdDocument, ociResources, selected }: OciTabularResourceProps): JSX.Element => {
    const columnTitles: string[] = ['Availability Domain', 'Fault Domain', 'Shape', 'Subnet', 'Memory (GBs)', 'OCPUs']
    const resourceElements: string[] = ['availabilityDomain', 'faultDomain', 'shape', 'createVnicDetails.subnetId', 'shapeConfig.memoryInGBs', 'shapeConfig.ocpus']
    return (
        <OcdTabularContents 
            ocdDocument={ocdDocument}
            ociResources={ociResources}
            selected={selected}
            columnTitles={columnTitles}
            resourceElements={resourceElements}
            key={'OciInstanceTabularContents'}
        />
    )
}
