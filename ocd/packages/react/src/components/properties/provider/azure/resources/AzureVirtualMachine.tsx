/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdDocument from '../../../../OcdDocument.js'
import { ResourceElementConfig, ResourceProperties } from '../../../OcdPropertyTypes.js'
import * as AutoGenerated from './generated/AzureVirtualMachine.js'
import { AzureVirtualMachineConfigs } from './configs/AzureVirtualMachine.js'

export const AzureVirtualMachine = ({ ocdDocument, setOcdDocument, resource }: ResourceProperties): JSX.Element => {
    const configs: ResourceElementConfig[] = AzureVirtualMachineConfigs.configs()
    return (
        <AutoGenerated.AzureVirtualMachine ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} configs={configs} key={`${resource.id}.AutoGenerated.AzureVirtualMachine`} />
    )
}
