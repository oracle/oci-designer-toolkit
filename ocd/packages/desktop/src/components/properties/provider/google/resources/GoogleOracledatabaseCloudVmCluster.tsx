/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdDocument from '../../../../OcdDocument'
import { ResourceElementConfig, ResourceProperties } from '../../../OcdPropertyTypes'
import * as AutoGenerated from './generated/GoogleOracledatabaseCloudVmCluster'
import { GoogleOracledatabaseCloudVmClusterConfigs } from './configs/GoogleOracledatabaseCloudVmCluster'

export const GoogleOracledatabaseCloudVmCluster = ({ ocdDocument, setOcdDocument, resource }: ResourceProperties): JSX.Element => {
    const configs: ResourceElementConfig[] = GoogleOracledatabaseCloudVmClusterConfigs.configs()
    return (
        <AutoGenerated.GoogleOracledatabaseCloudVmCluster ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} configs={configs} key={`${resource.id}.AutoGenerated.GoogleOracledatabaseCloudVmCluster`} />
    )
}