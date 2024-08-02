/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OciTabularResourceProps } from "../../../../../types/ReactComponentProperties"
import { OcdTabularContents } from "../OciTabularContents"

export const OciSubnet = ({ ocdDocument, ociResources, selected }: OciTabularResourceProps): JSX.Element => {
    const columnTitles: string[] = ['VCN', 'CIDR Block', 'DNS Label', 'Route Table', 'Security Lists']
    const resourceElements: string[] = ['vcnId', 'cidrBlock', 'dnsLabel', 'routeTableId', 'securityListIds']
    return (
        <OcdTabularContents 
            ocdDocument={ocdDocument}
            ociResources={ociResources}
            selected={selected}
            columnTitles={columnTitles}
            resourceElements={resourceElements}
            key={'OciSubnetTabularContents'}
        />
    )
}
